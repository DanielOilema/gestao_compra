const SIDEBAR_OPEN_KEY = "gestao-compra.sidebar.open";
const SIDEBAR_EXPANDED_GROUPS_KEY = "gestao-compra.sidebar.expanded-groups";

export function readSidebarOpen(): boolean {
  try {
    const value = window.localStorage.getItem(SIDEBAR_OPEN_KEY);
    if (value === "false") return false;
    if (value === "true") return true;
  } catch {
    // Private mode or blocked storage — keep the menu visible.
  }
  return true;
}

export function writeSidebarOpen(open: boolean): void {
  try {
    window.localStorage.setItem(SIDEBAR_OPEN_KEY, String(open));
  } catch {
    // Ignore quota / private mode.
  }
}

export function readSidebarExpandedGroups(sectionIds: string[]): string[] {
  try {
    const raw = window.localStorage.getItem(SIDEBAR_EXPANDED_GROUPS_KEY);
    if (raw === null) return sectionIds;

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return sectionIds;

    const allowed = new Set(sectionIds);
    return parsed.filter((id): id is string => typeof id === "string" && allowed.has(id));
  } catch {
    return sectionIds;
  }
}

export function writeSidebarExpandedGroups(groupIds: string[]): void {
  try {
    window.localStorage.setItem(SIDEBAR_EXPANDED_GROUPS_KEY, JSON.stringify(groupIds));
  } catch {
    // Ignore quota / private mode.
  }
}
