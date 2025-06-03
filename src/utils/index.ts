export function isValidISODate(dateString: string): boolean {
  const isoRegex =
    /^(\d{4}-\d{2}-\d{2}|\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?)$/;
  return isoRegex.test(dateString);
}
