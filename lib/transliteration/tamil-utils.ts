/**
 * Tamil Transliteration Utilities
 *
 * Provides functions for:
 * - Romanizing Tamil text to Roman/Latin script
 * - Fuzzy matching with typo tolerance (Levenshtein distance)
 * - Common Tamil romanization variation handling
 * - Word validation and suggestion
 *
 * All content is in Roman script (transliterated, no native Tamil script)
 */

import { logger } from '@/lib/config/logger';

/**
 * Levenshtein distance for fuzzy matching
 * Measures edit distance between two strings
 */
export function levenshteinDistance(str1: string, str2: string): number {
  const track = Array(str2.length + 1)
    .fill(null)
    .map(() => Array(str1.length + 1).fill(0));

  for (let i = 0; i <= str1.length; i += 1) {
    track[0][i] = i;
  }
  for (let j = 0; j <= str2.length; j += 1) {
    track[j][0] = j;
  }

  for (let j = 1; j <= str2.length; j += 1) {
    for (let i = 1; i <= str1.length; i += 1) {
      const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
      track[j][i] = Math.min(
        track[j][i - 1] + 1,
        track[j - 1][i] + 1,
        track[j - 1][i - 1] + indicator
      );
    }
  }

  return track[str2.length][str1.length];
}

/**
 * Common Tamil romanization variations mapping
 * Handles multiple ways the same word might be transliterated
 */
const TAMIL_TRANSLITERATION_VARIATIONS: Record<string, string[]> = {
  // Consonant variations
  ch: ['c', 'ch'],
  s: ['s', 'sh', 'ch'],
  th: ['th', 't'],
  kh: ['kh', 'kk'],
  ng: ['ng', 'n'],

  // Vowel variations
  ai: ['ai', 'ei'],
  au: ['au', 'o'],
  o: ['o', 'au'],
  u: ['u', 'oo'],

  // Common word variations
  kathai: ['kathai', 'kathe', 'kathei'],
  sollun: ['sollun', 'sollen', 'solu'],
  sundaram: ['sundaram', 'sundarum', 'sundram'],
  irukku: ['irukku', 'iruku', 'iruka'],
  nalam: ['nalam', 'nalaam', 'nallam'],
};

/**
 * Normalize Tamil romanization to a canonical form
 * Handles common variations and typos
 */
export function normalizeTamilRomanization(input: string): string {
  const lower = input.toLowerCase().trim();

  // Replace common typo patterns
  let normalized = lower
    .replace(/([aeiou])\1+/g, '$1') // Remove duplicate vowels (aa -> a)
    .replace(/([kngcjtdpbmnhlr])\1/g, '$1') // Normalize double consonants
    .replace(/^\s+|\s+$/g, ''); // Trim whitespace

  logger.debug({ input, normalized }, 'Normalized Tamil romanization');

  return normalized;
}

/**
 * Find close matches for a word using fuzzy matching
 * Returns matches within specified edit distance
 */
export function findFuzzyMatches(
  input: string,
  wordBank: string[],
  maxDistance: number = 2
): Array<{ word: string; distance: number }> {
  const normalized = normalizeTamilRomanization(input);

  const matches = wordBank
    .map((word) => ({
      word,
      distance: levenshteinDistance(normalized, normalizeTamilRomanization(word)),
    }))
    .filter((match) => match.distance <= maxDistance)
    .sort((a, b) => a.distance - b.distance);

  logger.debug(
    { input, matchCount: matches.length, maxDistance },
    'Found fuzzy matches'
  );

  return matches;
}

/**
 * Check if a word is a plausible Tamil romanization
 * Simple heuristic: Tamil words usually have vowels distributed
 */
export function isPlausibleTamilRomanization(word: string): boolean {
  if (word.length < 2) return false;

  const lower = word.toLowerCase();

  // Must contain at least one vowel
  const hasVowel = /[aeiou]/.test(lower);
  if (!hasVowel) return false;

  // Shouldn't have unusual consonant clusters common in English
  const unusualClusters = /[bcdfghjklmnpqrstvwxyz]{4,}/.test(lower);
  if (unusualClusters) return false;

  // Tamil words tend to have more vowels than English
  // (rough heuristic: >25% vowels)
  const vowelCount = (lower.match(/[aeiou]/g) || []).length;
  const vowelRatio = vowelCount / lower.length;
  if (vowelRatio < 0.2) return false;

  return true;
}

/**
 * Validate a word against a word bank with fuzzy tolerance
 */
export interface ValidationResult {
  isValid: boolean;
  matchedWord?: string;
  suggestions: string[];
  distance: number;
  confidence: number; // 0-100
}

export function validateWord(
  input: string,
  wordBank: string[],
  fuzzyTolerance: number = 2
): ValidationResult {
  const normalized = normalizeTamilRomanization(input);

  // Direct match (case-insensitive)
  const directMatch = wordBank.find(
    (w) => normalizeTamilRomanization(w) === normalized
  );
  if (directMatch) {
    logger.debug({ input, directMatch }, 'Direct word match found');
    return {
      isValid: true,
      matchedWord: directMatch,
      suggestions: [],
      distance: 0,
      confidence: 100,
    };
  }

  // Fuzzy match
  const fuzzyMatches = findFuzzyMatches(input, wordBank, fuzzyTolerance);

  if (fuzzyMatches.length > 0) {
    const bestMatch = fuzzyMatches[0];
    const confidence = Math.max(
      0,
      Math.round(100 - (bestMatch.distance * 15)) // Each edit distance = -15% confidence
    );

    logger.debug(
      { input, bestMatch: bestMatch.word, distance: bestMatch.distance },
      'Fuzzy match found'
    );

    return {
      isValid: true,
      matchedWord: bestMatch.word,
      suggestions: fuzzyMatches.slice(0, 3).map((m) => m.word),
      distance: bestMatch.distance,
      confidence,
    };
  }

  // No match - return suggestions based on first letters
  logger.debug({ input, matchCount: 0 }, 'No matches found');

  const firstLetterMatches = wordBank
    .filter((w) => w.toLowerCase().startsWith(normalized.charAt(0)))
    .slice(0, 3);

  return {
    isValid: false,
    suggestions: firstLetterMatches,
    distance: Infinity,
    confidence: 0,
  };
}

/**
 * Batch validate multiple words
 */
export function validateWords(
  inputs: string[],
  wordBank: string[],
  fuzzyTolerance: number = 2
): ValidationResult[] {
  return inputs.map((input) =>
    validateWord(input, wordBank, fuzzyTolerance)
  );
}

/**
 * Extract Tamil words from a sentence (simplified word tokenization)
 * Splits on spaces and common separators
 */
export function extractWords(sentence: string): string[] {
  return sentence
    .toLowerCase()
    .split(/[\s\-,.!?;:()]+/)
    .filter((word) => word.length > 0);
}

/**
 * Suggest corrections for a sentence based on word bank
 */
export interface SentenceCorrectionSuggestion {
  originalSentence: string;
  correctedSentence: string;
  corrections: Array<{
    position: number;
    original: string;
    suggested: string;
    confidence: number;
  }>;
  hasCorrections: boolean;
}

export function suggestSentenceCorrections(
  sentence: string,
  wordBank: string[],
  fuzzyTolerance: number = 1 // Stricter for sentence context
): SentenceCorrectionSuggestion {
  const words = extractWords(sentence);
  const corrections = [];
  const correctedWords = [];

  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    const validation = validateWord(word, wordBank, fuzzyTolerance);

    if (validation.isValid && validation.distance > 0) {
      // Has a fuzzy match with typo
      corrections.push({
        position: i,
        original: word,
        suggested: validation.matchedWord!,
        confidence: validation.confidence,
      });
      correctedWords.push(validation.matchedWord!);
    } else if (!validation.isValid && validation.suggestions.length > 0) {
      // No match but has suggestions
      corrections.push({
        position: i,
        original: word,
        suggested: validation.suggestions[0],
        confidence: Math.max(0, 100 - fuzzyTolerance * 20), // Lower confidence for unknowns
      });
      correctedWords.push(validation.suggestions[0]);
    } else {
      correctedWords.push(word);
    }
  }

  const correctedSentence = correctedWords.join(' ');

  logger.debug(
    { original: sentence, corrected: correctedSentence, correctionCount: corrections.length },
    'Generated sentence corrections'
  );

  return {
    originalSentence: sentence,
    correctedSentence,
    corrections,
    hasCorrections: corrections.length > 0,
  };
}

/**
 * Get transliteration variations for a word
 * Useful for understanding how a word might be written
 */
export function getTransliterationVariations(word: string): string[] {
  const normalized = normalizeTamilRomanization(word);

  // Look up variations
  for (const [, variations] of Object.entries(
    TAMIL_TRANSLITERATION_VARIATIONS
  )) {
    if (variations.includes(normalized)) {
      return variations;
    }
  }

  // Return just the normalized form if no variations found
  return [normalized];
}

/**
 * Calculate confidence score for a Tamil word
 * Higher scores = more likely to be a valid Tamil word
 */
export function calculateTamilWordConfidence(word: string): number {
  const normalized = normalizeTamilRomanization(word);

  let score = 0;

  // Factor 1: Plausibility (0-30 points)
  if (isPlausibleTamilRomanization(normalized)) {
    score += 30;
  }

  // Factor 2: Length (0-20 points)
  // Tamil words are typically 3-10 characters
  if (normalized.length >= 3 && normalized.length <= 10) {
    score += 20;
  } else if (normalized.length >= 2 && normalized.length <= 12) {
    score += 10;
  }

  // Factor 3: Common patterns (0-30 points)
  // Common Tamil endings
  if (/[um]$/.test(normalized)) {
    score += 15;
  }
  if (/[ai]$/.test(normalized)) {
    score += 10;
  }

  // Factor 4: Vowel distribution (0-20 points)
  const vowels = (normalized.match(/[aeiou]/g) || []).length;
  const vowelRatio = vowels / normalized.length;
  if (vowelRatio > 0.3 && vowelRatio < 0.6) {
    score += 20;
  } else if (vowelRatio > 0.25 && vowelRatio < 0.7) {
    score += 10;
  }

  return Math.min(100, score);
}
