import type { CognitiveFunction } from '@/types/cognitive-functions';
import type { FunctionStack } from '@/types/stacks';
import { getAttitude, getProcess } from '@/types/cognitive-functions';

/**
 * Validates that a function stack follows Jungian rules:
 * 1. Dominant and inferior are on the same axis (Ti↔Fe, Te↔Fi, Ni↔Se, Ne↔Si)
 * 2. Dominant and auxiliary have opposite attitudes (I vs E)
 * 3. Dominant and auxiliary are different processes (Judging vs Perceiving)
 * 4. Tertiary mirrors auxiliary process with opposite attitude
 * 5. Inferior mirrors dominant process with opposite attitude
 */

const AXIS_MAP: Record<CognitiveFunction, CognitiveFunction> = {
  Ti: 'Fe', Fe: 'Ti',
  Te: 'Fi', Fi: 'Te',
  Ni: 'Se', Se: 'Ni',
  Ne: 'Si', Si: 'Ne',
};

export function getInferiorOf(dominant: CognitiveFunction): CognitiveFunction {
  return AXIS_MAP[dominant];
}

export function isJudgingFunction(fn: CognitiveFunction): boolean {
  return fn[0] === 'T' || fn[0] === 'F';
}

export function isPerceivingFunction(fn: CognitiveFunction): boolean {
  return fn[0] === 'N' || fn[0] === 'S';
}

export function isValidStack(stack: FunctionStack): boolean {
  const { dominant, auxiliary, tertiary, inferior } = stack;

  // Rule 1: Dom↔Inf axis pairing
  if (AXIS_MAP[dominant] !== inferior) return false;

  // Rule 2: Dom and Aux have opposite attitudes
  if (getAttitude(dominant) === getAttitude(auxiliary)) return false;

  // Rule 3: Dom and Aux are different process types (J vs P)
  const domIsJudging = isJudgingFunction(dominant);
  const auxIsJudging = isJudgingFunction(auxiliary);
  if (domIsJudging === auxIsJudging) return false;

  // Rule 4: Tertiary has same process as auxiliary, opposite attitude
  if (getProcess(tertiary) !== getProcess(auxiliary)) return false;
  if (getAttitude(tertiary) === getAttitude(auxiliary)) return false;

  // Rule 5: Inferior has same process as dominant, opposite attitude
  if (getProcess(inferior) !== getProcess(dominant)) return false;
  if (getAttitude(inferior) === getAttitude(dominant)) return false;

  return true;
}

/**
 * Check if user's scores have correct axis alignment for a given stack.
 * The dominant's axis partner (inferior) should be among the lowest functions.
 */
export function checkAxisAlignment(
  rankings: CognitiveFunction[],
  stack: FunctionStack
): boolean {
  const infRank = rankings.indexOf(stack.inferior);
  // Inferior should be in bottom 3 (rank 5-7, zero-indexed)
  return infRank >= 5;
}
