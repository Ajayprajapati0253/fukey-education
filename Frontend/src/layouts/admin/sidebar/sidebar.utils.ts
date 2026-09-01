import { SIDEBAR_GROUPS, type SidebarGroup, type SidebarItem } from './sidebar.config';

/**
 * Checks if a sidebar item matches the current active route.
 */
export function isRouteActive(itemRoute: string, currentPath: string): boolean {
  if (itemRoute === '/admin/dashboard' && (currentPath === '/admin' || currentPath === '/' || currentPath === '/admin/dashboard')) {
    return true;
  }
  return currentPath === itemRoute || currentPath.startsWith(`${itemRoute}/`);
}

/**
 * Filters sidebar items by user permissions if specified.
 */
export function filterSidebarGroups(
  groups: SidebarGroup[],
  userPermissions: string[] = ['*']
): SidebarGroup[] {
  if (userPermissions.includes('*')) {
    return groups;
  }

  return groups
    .map((group) => ({
      ...group,
      items: group.items.filter(
        (item: SidebarItem) => !item.permission || userPermissions.includes(item.permission)
      ),
    }))
    .filter((group) => group.items.length > 0);
}
