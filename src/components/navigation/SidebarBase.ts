interface PageHistoryEntry {
  /** Path portion of the URL (window.location.pathname) */
  path: string;
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
  private static addToHistory(path: string): void {
    const history = this.getHistory()
      .filter((item) => item.path !== path)
      .slice(0, this.MAX_HISTORY_LENGTH - 1);

    history.unshift({ path });
    this.saveHistory(history);
  }

  /**
   * Return the most recent history entry that is different from the current
   * window.location.pathname, or null if none exist.
   */
  public static getPreviousPage(): PageHistoryEntry | null {
    return (
      this.getHistory().find(
        (entry) => entry.path !== window.location.pathname,
      ) || null
    );
  }

  /**
   * Remove a specific path from the history.
   */
  public static removeFromHistory(path: string): void {
    const history = this.getHistory().filter((item) => item.path !== path);
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
