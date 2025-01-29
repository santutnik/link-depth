/**
 * Checks if the given string is a valid URL.
 *
 * @param url - The string to be validated as a URL.
 * @returns A boolean indicating whether the string is a valid URL.
 */
export function isValidUrl(url: string) {
    try {
        new URL(url);
        return true;
    } catch (err) {
        return false;
    }
}
