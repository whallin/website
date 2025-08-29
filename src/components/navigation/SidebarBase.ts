interface PageHistoryEntry {
  /** Locale-agnostic path (e.g., "/hire" instead of "/en/hire") */
  path: string;
  /** Original locale when this path was visited */
  originalLocale?: string;
}

/**
 * Lightweight tracker that stores a short session-only history of visited
 * paths in sessionStorage.
 */
export class PageHistoryTracker {
  private static readonly STORAGE_KEY = "page_history";
  private static readonly MAX_HISTORY_LENGTH = 10;
  private static skipNextTracking = false;

  /**
   * Extract the current locale from the document or URL.
   */
  private static getCurrentLocale(): string {
    return document.documentElement.lang || "en";
  }

  /**
   * Convert a full path to a locale-agnostic path.
   * e.g., "/en/hire" -> "/hire", "/hire" -> "/hire" (sv is default)
   */
  private static getLocaleAgnosticPath(fullPath: string): string {
    const localePattern = /^\/en(\/.*)?$/;
    const match = fullPath.match(localePattern);
    return match && match[1] ? match[1] : fullPath === "/en" ? "/" : fullPath;
  }

  /**
   * Convert a locale-agnostic path to a path for the current locale.
   */
  private static getLocalizedPath(agnosticPath: string): string {
    const currentLocale = this.getCurrentLocale();

    if (currentLocale === "sv") {
      return agnosticPath;
    }

    if (currentLocale === "en") {
      return agnosticPath === "/" ? "/en" : `/en${agnosticPath}`;
    }

    return agnosticPath;
  }

  /**
   * Read the history from sessionStorage.
   * Returns an empty array if parsing fails or storage is unavailable.
   */
  private static getHistory(): PageHistoryEntry[] {
    try {
      const stored = sessionStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  /**
   * Persist the provided history to sessionStorage. Failures are swallowed.
   */
  private static saveHistory(history: PageHistoryEntry[]): void {
    try {
      sessionStorage.setItem(this.STORAGE_KEY, JSON.stringify(history));
    } catch {}
  }

  /**
   * Add a path to the front of the history, removing duplicates and keeping
   * the list within MAX_HISTORY_LENGTH.
   */
  private static addToHistory(fullPath: string): void {
    const agnosticPath = this.getLocaleAgnosticPath(fullPath);
    const currentLocale = this.getCurrentLocale();

    const history = this.getHistory()
      .filter((item) => item.path !== agnosticPath)
      .slice(0, this.MAX_HISTORY_LENGTH - 1);

    history.unshift({ path: agnosticPath, originalLocale: currentLocale });
    this.saveHistory(history);
  }

  /**
   * Return the most recent history entry that is different from the current
   * window.location.pathname, or null if none exist.
   * Returns the path localized for the current locale.
   */
  public static getPreviousPage(): PageHistoryEntry | null {
    const currentAgnosticPath = this.getLocaleAgnosticPath(
      window.location.pathname,
    );
    const previousEntry = this.getHistory().find(
      (entry) => entry.path !== currentAgnosticPath,
    );

    if (!previousEntry) {
      return null;
    }

    return {
      path: this.getLocalizedPath(previousEntry.path),
      originalLocale: previousEntry.originalLocale,
    };
  }

  /**
   * Remove a specific path from the history.
   */
  public static removeFromHistory(fullPath: string): void {
    const agnosticPath = this.getLocaleAgnosticPath(fullPath);
    const history = this.getHistory().filter(
      (item) => item.path !== agnosticPath,
    );
    this.saveHistory(history);
  }

  /**
   * Skip tracking the next page navigation.
   */
  public static skipNextPageTracking(): void {
    this.skipNextTracking = true;
  }

  /**
   * Track the current page by adding window.location.pathname to history.
   */
  public static trackCurrentPage(): void {
    if (this.skipNextTracking) {
      this.skipNextTracking = false;
      return;
    }
    this.addToHistory(window.location.pathname);
  }

  /**
   * Initialize automatic tracking on Astro before-preparation events.
   */
  public static init(): void {
    const track = () => this.trackCurrentPage();

    document.addEventListener("astro:before-preparation", track);

    (window as any).PageHistoryTracker = this;
  }
}
