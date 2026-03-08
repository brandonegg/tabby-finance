export const horizontalScreenPadding = 20;
export const screenTopPadding = 20;
export const screenBottomPadding = 24;
export const floatingTabBarHeight = 72;
export const floatingTabBarBottomOffset = 16;
export const floatingTabBarClearance = 32;

export function getFloatingTabBarBottom(insetBottom: number) {
  return Math.max(insetBottom, floatingTabBarBottomOffset);
}

export function getFloatingTabBarContentPadding(insetBottom: number) {
  return floatingTabBarHeight + getFloatingTabBarBottom(insetBottom) + floatingTabBarClearance;
}
