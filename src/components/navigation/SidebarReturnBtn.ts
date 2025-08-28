import { navigate } from "astro:transitions/client";
import { PageHistoryTracker } from "./SidebarBase";

/**
 * Handler for the sidebar "return" button.
 */
export class ReturnButtonHandler {
  /**
   * Navigates to the previous page path tracked by PageHistoryTracker.
   * Removes the returned-to page from history to prevent loops.
   */
  private static handleClick = (): void => {
    const previousPage = PageHistoryTracker.getPreviousPage();
    const targetPath = previousPage?.path || "/";

    if (previousPage) {
      PageHistoryTracker.removeFromHistory(targetPath);
      PageHistoryTracker.skipNextPageTracking();
    }

    navigate(targetPath);
  };

  /**
   * Find the DOM button with id "return-button" and attach the click handler.
   * Removing the existing listener first avoids duplicate handlers when the
   * function runs multiple times (page transitions, re-inits, etc.).
   */
  private static attachListener(): void {
    const button = document.getElementById("return-button");
    if (button) {
      button.removeEventListener("click", this.handleClick);
      button.addEventListener("click", this.handleClick);
    }
  }

  /**
   * Initialize the return button wiring.
   */
  public static init(): void {
    const attach = () => this.attachListener();

    document.addEventListener("DOMContentLoaded", attach);
    document.addEventListener("astro:page-load", attach);
  }
}
