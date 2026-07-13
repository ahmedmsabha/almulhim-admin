import type {
  AdminContentTreeResponse,
  ContentSearchItem,
} from "@/lib/content/types";

/** Strip Arabic tashkeel / tatweel for client substring fallback. */
export function normalizeSearchText(value: string): string {
  return value
    .normalize("NFKC")
    .replace(/[\u064B-\u065F\u0670\u06D6-\u06ED]/g, "")
    .replace(/\u0640/g, "")
    .toLowerCase()
    .trim();
}

export function flattenContentTree(
  tree: AdminContentTreeResponse,
): ContentSearchItem[] {
  const items: ContentSearchItem[] = [];
  for (const unit of tree.units) {
    items.push({
      id: unit.id,
      title: unit.title,
      type: "unit",
      orderIndex: unit.sortOrder,
    });
    for (const chapter of unit.chapters) {
      items.push({
        id: chapter.id,
        title: chapter.title,
        type: "chapter",
        orderIndex: chapter.sortOrder,
      });
      for (const lesson of chapter.lessons) {
        items.push({
          id: lesson.id,
          title: lesson.title,
          type: "lesson",
          orderIndex: lesson.sortOrder,
        });
      }
    }
  }
  return items;
}

const ARABIC_INDIC_DIGITS: Record<string, string> = {
  "٠": "0",
  "١": "1",
  "٢": "2",
  "٣": "3",
  "٤": "4",
  "٥": "5",
  "٦": "6",
  "٧": "7",
  "٨": "8",
  "٩": "9",
};

/** Map common Arabic ordinals / number words to integers (1-based). */
const ARABIC_ORDINALS: Array<{ pattern: RegExp; value: number }> = [
  { pattern: /الحادي\s*عشر|الحادية\s*عشرة/, value: 11 },
  { pattern: /الثاني\s*عشر|الثانية\s*عشرة/, value: 12 },
  { pattern: /الثالث\s*عشر|الثالثة\s*عشرة/, value: 13 },
  { pattern: /الرابع\s*عشر|الرابعة\s*عشرة/, value: 14 },
  { pattern: /الخامس\s*عشر|الخامسة\s*عشرة/, value: 15 },
  { pattern: /الاول|الأول|اولى|أولى/, value: 1 },
  { pattern: /الثاني|ثانية/, value: 2 },
  { pattern: /الثالث|ثالثة/, value: 3 },
  { pattern: /الرابع|رابعة/, value: 4 },
  { pattern: /الخامس|خامسة/, value: 5 },
  { pattern: /السادس|سادسة/, value: 6 },
  { pattern: /السابع|سابعة/, value: 7 },
  { pattern: /الثامن|ثامنة/, value: 8 },
  { pattern: /التاسع|تاسعة/, value: 9 },
  { pattern: /العاشر|عاشرة/, value: 10 },
];

function toWesternDigits(value: string): string {
  return value.replace(/[٠-٩]/g, (digit) => ARABIC_INDIC_DIGITS[digit] ?? digit);
}

export type SearchTypeHint = "unit" | "chapter" | "lesson" | null;

export function extractSearchIntent(query: string): {
  needle: string;
  numbers: number[];
  typeHint: SearchTypeHint;
} {
  const western = toWesternDigits(query);
  const needle = normalizeSearchText(western);
  const numbers = new Set<number>();

  for (const { pattern, value } of ARABIC_ORDINALS) {
    if (pattern.test(needle) || pattern.test(western)) {
      numbers.add(value);
    }
  }

  for (const match of western.matchAll(/\d+/g)) {
    const n = Number(match[0]);
    if (Number.isFinite(n) && n > 0 && n < 1000) numbers.add(n);
  }

  let typeHint: SearchTypeHint = null;
  if (/فصل|chapter|bab|باب/.test(needle) || /فصل|chapter/.test(western)) {
    typeHint = "chapter";
  } else if (/درس|lesson/.test(needle) || /درس|lesson/.test(western)) {
    typeHint = "lesson";
  } else if (/وحدة|unit/.test(needle) || /وحدة|unit/.test(western)) {
    typeHint = "unit";
  }

  return { needle, numbers: [...numbers], typeHint };
}

function titleMatchesNumber(title: string, n: number): boolean {
  const western = toWesternDigits(title);
  const normalized = normalizeSearchText(western);
  const nStr = String(n);

  // Leading section number only: "1", "1.1", "01.2" — not the ".1" in "2.1"
  if (
    new RegExp(`(?:^|[^0-9.])0*${nStr}(?:\\.[0-9]+)*(?![0-9])`).test(western)
  ) {
    return true;
  }
  if (
    new RegExp(
      `(?:chapter|ch\\.?|unit|lesson|فصل|درس|وحدة)\\s*0*${nStr}\\b`,
      "i",
    ).test(western)
  ) {
    return true;
  }
  if (n >= 1 && n <= 15) {
    const ordinal = ARABIC_ORDINALS.find((entry) => entry.value === n);
    if (ordinal && ordinal.pattern.test(normalized)) return true;
  }
  return false;
}

/**
 * Client fallback match: normalized substring, plus Arabic ordinal / digit
 * intent against titles like "Chapter 1.1" when the query is "الفصل الأول".
 * Returns matching ids only (no ancestors).
 */
export function substringMatchIds(
  items: ContentSearchItem[],
  query: string,
): string[] {
  const { needle, numbers, typeHint } = extractSearchIntent(query);
  if (!needle && numbers.length === 0) return [];

  const substringHits = needle
    ? items
        .filter((item) =>
          normalizeSearchText(toWesternDigits(item.title)).includes(needle),
        )
        .map((item) => item.id)
    : [];

  if (numbers.length === 0) return substringHits;

  const typed = items.filter(
    (item) => typeHint === null || item.type === typeHint,
  );

  const titleHits = typed
    .filter((item) => numbers.some((n) => titleMatchesNumber(item.title, n)))
    .map((item) => item.id);

  // Prefer explicit section numbers in titles (Chapter 1.1 over "first by sort order")
  if (titleHits.length > 0) {
    return [...new Set([...substringHits, ...titleHits])];
  }

  const orderHits = typed
    .filter((item) => numbers.some((n) => item.orderIndex === n - 1))
    .map((item) => item.id);

  return [...new Set([...substringHits, ...orderHits])];
}

/**
 * Expand raw match ids so parent hits include descendants and leaf hits
 * keep unit → chapter ancestors (no disconnected leaves).
 */
export function expandMatchingIdsWithHierarchy(
  tree: AdminContentTreeResponse,
  matchingIds: ReadonlySet<string> | readonly string[],
): Set<string> {
  const visible = new Set(
    matchingIds instanceof Set ? matchingIds : matchingIds,
  );

  for (const unit of tree.units) {
    if (visible.has(unit.id)) {
      for (const chapter of unit.chapters) {
        visible.add(chapter.id);
        for (const lesson of chapter.lessons) {
          visible.add(lesson.id);
        }
      }
    }
    for (const chapter of unit.chapters) {
      if (visible.has(chapter.id)) {
        visible.add(unit.id);
        for (const lesson of chapter.lessons) {
          visible.add(lesson.id);
        }
      }
      for (const lesson of chapter.lessons) {
        if (visible.has(lesson.id)) {
          visible.add(chapter.id);
          visible.add(unit.id);
        }
      }
    }
  }

  return visible;
}

/**
 * Keep units/chapters/lessons in the expanded match set so filtered leaves
 * stay attached to their hierarchy.
 */
export function filterTreeByMatchingIds(
  tree: AdminContentTreeResponse,
  matchingIds: ReadonlySet<string> | readonly string[],
): AdminContentTreeResponse {
  const visible = expandMatchingIdsWithHierarchy(tree, matchingIds);
  if (visible.size === 0) {
    return { units: [] };
  }

  const units = tree.units
    .filter((unit) => visible.has(unit.id))
    .map((unit) => ({
      ...unit,
      chapters: unit.chapters
        .filter((chapter) => visible.has(chapter.id))
        .map((chapter) => ({
          ...chapter,
          lessons: chapter.lessons.filter((lesson) => visible.has(lesson.id)),
        })),
    }));

  return { units };
}

export function findLessonAncestors(
  tree: AdminContentTreeResponse,
  lessonId: string,
): { unitId: string; chapterId: string } | null {
  for (const unit of tree.units) {
    for (const chapter of unit.chapters) {
      if (chapter.lessons.some((lesson) => lesson.id === lessonId)) {
        return { unitId: unit.id, chapterId: chapter.id };
      }
    }
  }
  return null;
}

export function lessonExistsInTree(
  tree: AdminContentTreeResponse,
  lessonId: string,
): boolean {
  return findLessonAncestors(tree, lessonId) !== null;
}

const ARABIC_RE = /[\u0600-\u06FF]/;

export function titleLooksArabic(title: string): boolean {
  return ARABIC_RE.test(title);
}

export function formatDuration(seconds: number | null): string | null {
  if (seconds === null || !Number.isFinite(seconds) || seconds < 0) return null;
  const total = Math.round(seconds);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}
