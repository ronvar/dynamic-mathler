import { compressToBase64, decompressFromBase64 } from "lz-string";

/**
 * compresses the metadata object to a base64 string
 * to make more use of the 2kb limit
 */
export function compressMetadata(obj: unknown): string {
  const json = JSON.stringify(obj);
  return compressToBase64(json);
}

/**
 * decompresses the base64 compressed metadata string
 * back into a usable object
 */
export function decompressMetadata<T=unknown>(compressed: string): T | null {
  try {
    const json = decompressFromBase64(compressed);
    if (!json) return null;
    return JSON.parse(json) as T;
  } catch (error) {
    console.error("failed to decompress metadata:", error);
    return null;
  }
}
