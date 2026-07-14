type SessionTaskKey = "choose-organization" | "reset-password" | "setup-mfa";

type NavigateArgs = {
  session?: { currentTask?: { key: SessionTaskKey } | null } | null;
  decorateUrl: (url: string) => string;
};

type RouterLike = {
  push: (href: string) => void;
};

type TaskUrls = Partial<Record<SessionTaskKey, string>>;

/** Read `taskUrls` from the loaded Clerk instance (set via ClerkProvider). */
function getClerkTaskUrls(): TaskUrls | undefined {
  if (typeof window === "undefined") return undefined;

  const clerk = (
    window as Window & {
      Clerk?: {
        __internal_getOption?: (key: "taskUrls") => TaskUrls | undefined;
      };
    }
  ).Clerk;

  return clerk?.__internal_getOption?.("taskUrls");
}

/** Clerk `finalize({ navigate })` helper — pushes an in-app path or full URL. */
export function createNavigateAfterAuth(target: string, router: RouterLike) {
  return function navigateAfterAuth({
    session,
    decorateUrl,
  }: NavigateArgs): void {
    const taskKey = session?.currentTask?.key;
    const taskUrl = taskKey ? getClerkTaskUrls()?.[taskKey] : undefined;
    const destination = taskUrl ?? target;

    const url = decorateUrl(destination);
    if (url.startsWith("http")) {
      window.location.href = url;
      return;
    }

    router.push(url);
  };
}
