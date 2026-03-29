import type { Question } from '@/types/questions';
import type { NormalizedScores } from '@/types/scoring';
import type { CognitiveFunction } from '@/types/cognitive-functions';
import { CORE_QUESTIONS, getQuestionsByChunk } from './question-bank';
import { detectAmbiguousPairs } from '../scoring/normalizer';

/**
 * Get the next chunk of questions, optionally reordering to front-load
 * questions targeting ambiguous function pairs.
 */
export function getNextChunkQuestions(
  chunkNumber: number,
  normalizedScores: NormalizedScores | null,
  answeredIds: Set<string>
): Question[] {
  const chunkQuestions = getQuestionsByChunk(chunkNumber)
    .filter(q => !answeredIds.has(q.id));

  if (!normalizedScores) return chunkQuestions;

  const ambiguousPairs = detectAmbiguousPairs(normalizedScores);
  if (ambiguousPairs.length === 0) return chunkQuestions;

  // Reorder: questions targeting ambiguous pairs come first
  const ambiguousFunctions = new Set<CognitiveFunction>(
    ambiguousPairs.flat()
  );

  return chunkQuestions.sort((a, b) => {
    const aTargetsAmbiguous = a.primaryAxis.some(fn => ambiguousFunctions.has(fn));
    const bTargetsAmbiguous = b.primaryAxis.some(fn => ambiguousFunctions.has(fn));
    if (aTargetsAmbiguous && !bTargetsAmbiguous) return -1;
    if (!aTargetsAmbiguous && bTargetsAmbiguous) return 1;
    return 0;
  });
}

/**
 * Check if adaptive refinement questions should be triggered.
 */
export function shouldTriggerAdaptive(
  normalizedScores: NormalizedScores,
  threshold: number = 12
): boolean {
  return detectAmbiguousPairs(normalizedScores, threshold).length > 0;
}
