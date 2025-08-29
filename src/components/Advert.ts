const adStats = new Map<string, { count: number; paths: Set<string> }>();
const pathToAdMapping = new Map<string, string>();
let allAdsIds: string[] = [];

/**
 * Initialize the ad distribution system with all available ad IDs
 */
function initializeAdDistribution(adsIds: string[]) {
  if (allAdsIds.length === 0) {
    allAdsIds = [...adsIds].sort();
    allAdsIds.forEach((id) => {
      adStats.set(id, { count: 0, paths: new Set() });
    });
  }
}

/**
 * Simple hash function to convert string to number
 */
function simpleHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}

/**
 * Get the next ad using deterministic selection based on path
 * Ensures the same path always gets the same ad during build
 */
export function getNextAdId(
  availableAdsIds: string[],
  currentPath?: string,
): string {
  if (availableAdsIds.length === 0) {
    throw new Error("No ads available");
  }

  initializeAdDistribution(availableAdsIds);

  if (currentPath) {
    if (pathToAdMapping.has(currentPath)) {
      return pathToAdMapping.get(currentPath)!;
    }

    // Create deterministic selection based on path hash
    const sortedAvailableAds = [...availableAdsIds].sort();
    const pathHash = simpleHash(currentPath);
    const selectedAdId =
      sortedAvailableAds[pathHash % sortedAvailableAds.length];

    // Store the mapping for consistency
    pathToAdMapping.set(currentPath, selectedAdId);

    // Update tracking
    const stats = adStats.get(selectedAdId)!;
    stats.count++;
    stats.paths.add(currentPath);

    return selectedAdId;
  }
  return availableAdsIds[0];
}
