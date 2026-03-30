import type { CognitiveFunction } from '@/types/cognitive-functions';
import type { MBTIType } from '@/types/stacks';
import { ALL_FUNCTIONS } from '@/types/cognitive-functions';
import { VALID_STACKS } from '@/engine/stacks/valid-stacks';

export interface DecodedResult {
  scores: Record<CognitiveFunction, number>;
  type: MBTIType;
  confidence: number;
}

/**
 * Encode function scores + type + confidence into a compact URL-safe string.
 * 10 bytes → ~14 char base64url.
 */
export function encodeResult(
  scores: Record<CognitiveFunction, number>,
  type: MBTIType,
  confidence: number
): string {
  const bytes = new Uint8Array(10);
  ALL_FUNCTIONS.forEach((fn, i) => {
    bytes[i] = Math.min(255, Math.max(0, Math.round(scores[fn])));
  });
  bytes[8] = VALID_STACKS.findIndex(s => s.type === type);
  bytes[9] = Math.min(100, Math.max(0, Math.round(confidence)));

  const binary = String.fromCharCode(...bytes);
  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

/**
 * Decode a URL-safe string back into scores + type + confidence.
 * Returns null if the string is invalid.
 */
export function decodeResult(encoded: string): DecodedResult | null {
  try {
    const b64 = encoded.replace(/-/g, '+').replace(/_/g, '/');
    const binary = atob(b64);
    const bytes = Uint8Array.from(binary, c => c.charCodeAt(0));

    if (bytes.length !== 10) return null;

    const scores = {} as Record<CognitiveFunction, number>;
    ALL_FUNCTIONS.forEach((fn, i) => {
      scores[fn] = bytes[i];
    });

    const typeIndex = bytes[8];
    if (typeIndex >= VALID_STACKS.length) return null;
    const type = VALID_STACKS[typeIndex].type;

    const confidence = bytes[9];
    if (confidence > 100) return null;

    return { scores, type, confidence };
  } catch {
    return null;
  }
}
