export function compareNames(left: string, right: string): number {
  return left.localeCompare(right, "es", { sensitivity: "base" });
}
