export const adminKeys = {
  all: ["admin"] as const,
  me: () => [...adminKeys.all, "me"] as const,
  dashboard: {
    all: () => [...adminKeys.all, "dashboard"] as const,
    stats: (userId: string) =>
      [...adminKeys.dashboard.all(), "stats", userId] as const,
  },
  students: {
    all: () => [...adminKeys.all, "students"] as const,
    list: (filters: Record<string, string | number | undefined>) =>
      [...adminKeys.students.all(), "list", filters] as const,
    detail: (userId: string) =>
      [...adminKeys.students.all(), "detail", userId] as const,
  },
  plans: {
    all: () => [...adminKeys.all, "plans"] as const,
    list: () => [...adminKeys.plans.all(), "list"] as const,
    fxRates: () => [...adminKeys.plans.all(), "fxRates", "ILS"] as const,
  },
  subscriptions: {
    all: () => [...adminKeys.all, "subscriptions"] as const,
    pending: (filters?: Record<string, string | undefined>) =>
      filters
        ? ([...adminKeys.subscriptions.all(), "pending", filters] as const)
        : ([...adminKeys.subscriptions.all(), "pending"] as const),
    archived: (filters?: Record<string, string | undefined>) =>
      filters
        ? ([...adminKeys.subscriptions.all(), "archived", filters] as const)
        : ([...adminKeys.subscriptions.all(), "archived"] as const),
    aiLogs: () => [...adminKeys.subscriptions.all(), "aiLogs"] as const,
    detail: (id: string) =>
      [...adminKeys.subscriptions.all(), "detail", id] as const,
    receiptUrl: (id: string) =>
      [...adminKeys.subscriptions.all(), "receiptUrl", id] as const,
  },
  content: {
    all: () => [...adminKeys.all, "content"] as const,
    tree: () => [...adminKeys.content.all(), "tree"] as const,
    search: (q: string) =>
      [...adminKeys.content.all(), "search", q] as const,
    unit: (id: string) => [...adminKeys.content.all(), "unit", id] as const,
    chapter: (id: string) =>
      [...adminKeys.content.all(), "chapter", id] as const,
    lesson: (id: string) =>
      [...adminKeys.content.all(), "lesson", id] as const,
  },
  announcements: {
    all: () => [...adminKeys.all, "announcements"] as const,
    list: () => [...adminKeys.announcements.all(), "list"] as const,
    detail: (id: string) =>
      [...adminKeys.announcements.all(), "detail", id] as const,
  },
  support: {
    all: () => [...adminKeys.all, "support"] as const,
    list: (filters?: Record<string, string | undefined>) =>
      filters
        ? ([...adminKeys.support.all(), "list", filters] as const)
        : ([...adminKeys.support.all(), "list"] as const),
    detail: (id: string) =>
      [...adminKeys.support.all(), "detail", id] as const,
  },
  devices: {
    byUser: (userId: string) =>
      [...adminKeys.all, "devices", userId] as const,
  },
};
