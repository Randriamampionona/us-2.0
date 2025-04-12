export function isValidUrl(text: string): boolean {
  try {
    new URL(text);
    return true;
  } catch (_) {
    return false;
  }
}
