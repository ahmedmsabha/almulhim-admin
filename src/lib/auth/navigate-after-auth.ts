type NavigateArgs = {
  session?: { currentTask?: unknown } | null;
  decorateUrl: (url: string) => string;
};

type RouterLike = {
  push: (href: string) => void;
};

/** Clerk `finalize({ navigate })` helper — pushes an in-app path or full URL. */
export function createNavigateAfterAuth(target: string, router: RouterLike) {
  return function navigateAfterAuth({
    session,
    decorateUrl,
  }: NavigateArgs): void {
    if (session?.currentTask) {
      return;
    }

    const url = decorateUrl(target);
    if (url.startsWith("http")) {
      window.location.href = url;
      return;
    }

    router.push(url);
  };
}
