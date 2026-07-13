/** Next sortOrder = max(siblings) + 1, or 0 when empty. */
export function nextSortOrder(sortOrders: number[]): number {
  if (sortOrders.length === 0) return 0;
  return Math.max(...sortOrders) + 1;
}
