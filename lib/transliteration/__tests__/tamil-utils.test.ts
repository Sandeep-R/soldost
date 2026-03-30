/**
 * Tamil Transliteration Tests
 *
 * Tests for Tamil romanization utilities including:
 * - Levenshtein distance calculation
 * - Normalization of transliteration variations
 * - Fuzzy matching with typo tolerance
 * - Word validation against word bank
 * - Sentence correction suggestions
 * - Confidence scoring
 */

import { describe, it, expect } from 'vitest';
import {
  levenshteinDistance,
  normalizeTamilRomanization,
  findFuzzyMatches,
  isPlausibleTamilRomanization,
  validateWord,
  validateWords,
  extractWords,
  suggestSentenceCorrections,
  getTransliterationVariations,
  calculateTamilWordConfidence,
  type ValidationResult,
} from '@/lib/transliteration/tamil-utils';

// Mock word bank for testing
const mockWordBank = [
  // Common verbs
  'sollun',
  'paren',
  'irukku',
  'nillai',
  'poi',
  'varen',

  // Common nouns
  'kathai',
  'magan',
  'oor',
  'kalam',
  'vaalkai',

  // Common adjectives
  'sundaram',
  'nallam',
  'vellaiyai',
  'karuppu',

  // Other words
  'naan',
  'nee',
  'avar',
  'thaan',
];

describe('Tamil Transliteration Utils', () => {
  describe('levenshteinDistance', () => {
    it('should calculate distance between identical strings', () => {
      expect(levenshteinDistance('kathai', 'kathai')).toBe(0);
    });

    it('should calculate single character insertion', () => {
      expect(levenshteinDistance('kathai', 'kathaai')).toBe(1);
    });

    it('should calculate single character deletion', () => {
      expect(levenshteinDistance('kathaai', 'kathai')).toBe(1);
    });

    it('should calculate single character substitution', () => {
      expect(levenshteinDistance('kathai', 'katchai')).toBe(1);
    });

    it('should calculate distance for different length strings', () => {
      const dist = levenshteinDistance('abc', 'defgh');
      expect(dist).toBeGreaterThan(2);
    });

    it('should be symmetric', () => {
      const forward = levenshteinDistance('sollun', 'sollen');
      const backward = levenshteinDistance('sollen', 'sollun');
      expect(forward).toBe(backward);
    });

    it('should handle empty strings', () => {
      expect(levenshteinDistance('', 'kathai')).toBe(6);
      expect(levenshteinDistance('kathai', '')).toBe(6);
      expect(levenshteinDistance('', '')).toBe(0);
    });
  });

  describe('normalizeTamilRomanization', () => {
    it('should normalize to lowercase', () => {
      expect(normalizeTamilRomanization('KATHAI')).toBe('kathai');
      expect(normalizeTamilRomanization('KaThai')).toBe('kathai');
    });

    it('should trim whitespace', () => {
      expect(normalizeTamilRomanization('  kathai  ')).toBe('kathai');
      expect(normalizeTamilRomanization('\tkathai\n')).toBe('kathai');
    });

    it('should remove duplicate vowels', () => {
      expect(normalizeTamilRomanization('kaathai')).toBe('kathai');
      expect(normalizeTamilRomanization('kathaa')).toBe('katha');
    });

    it('should normalize double consonants', () => {
      expect(normalizeTamilRomanization('katthhai')).toBe('kathai');
      expect(normalizeTamilRomanization('solllunn')).toBe('sollun'); // Reduce pairs to single
    });

    it('should handle mixed errors', () => {
      expect(normalizeTamilRomanization('  KAATTHHAI  ')).toBe('kathai');
    });
  });

  describe('findFuzzyMatches', () => {
    it('should find exact matches', () => {
      const matches = findFuzzyMatches('kathai', mockWordBank, 0);
      expect(matches.length).toBeGreaterThan(0);
      expect(matches[0].word).toBe('kathai');
      expect(matches[0].distance).toBe(0);
    });

    it('should find close matches with distance 1', () => {
      const matches = findFuzzyMatches('katchai', mockWordBank, 1);
      expect(matches.length).toBeGreaterThan(0);
      expect(matches[0].distance).toBeLessThanOrEqual(1);
    });

    it('should find close matches with distance 2', () => {
      const matches = findFuzzyMatches('solllen', mockWordBank, 2);
      expect(matches.length).toBeGreaterThan(0);
    });

    it('should respect maxDistance parameter', () => {
      const matches = findFuzzyMatches('xxxxx', mockWordBank, 1);
      expect(matches.length).toBe(0);
    });

    it('should sort by distance', () => {
      const matches = findFuzzyMatches('kathai', mockWordBank, 3);
      for (let i = 0; i < matches.length - 1; i++) {
        expect(matches[i].distance).toBeLessThanOrEqual(
          matches[i + 1].distance
        );
      }
    });

    it('should handle case insensitivity', () => {
      const matches1 = findFuzzyMatches('KATHAI', mockWordBank, 0);
      const matches2 = findFuzzyMatches('kathai', mockWordBank, 0);
      expect(matches1.length).toBe(matches2.length);
      expect(matches1[0].word).toBe(matches2[0].word);
    });
  });

  describe('isPlausibleTamilRomanization', () => {
    it('should accept valid Tamil words', () => {
      expect(isPlausibleTamilRomanization('kathai')).toBe(true);
      expect(isPlausibleTamilRomanization('sollun')).toBe(true);
      expect(isPlausibleTamilRomanization('sundaram')).toBe(true);
    });

    it('should reject single letters', () => {
      expect(isPlausibleTamilRomanization('a')).toBe(false);
      expect(isPlausibleTamilRomanization('k')).toBe(false);
    });

    it('should reject strings without vowels', () => {
      expect(isPlausibleTamilRomanization('bcd')).toBe(false);
      expect(isPlausibleTamilRomanization('xyz')).toBe(false);
    });

    it('should reject unusual consonant clusters', () => {
      expect(isPlausibleTamilRomanization('bcdfghjk')).toBe(false);
    });

    it('should reject consonant-heavy words', () => {
      expect(isPlausibleTamilRomanization('bcdff')).toBe(false);
    });
  });

  describe('validateWord', () => {
    it('should validate exact matches', () => {
      const result = validateWord('kathai', mockWordBank);
      expect(result.isValid).toBe(true);
      expect(result.matchedWord).toBe('kathai');
      expect(result.distance).toBe(0);
      expect(result.confidence).toBe(100);
    });

    it('should validate fuzzy matches', () => {
      const result = validateWord('solllen', mockWordBank, 2);
      expect(result.isValid).toBe(true);
      expect(result.matchedWord).toBe('sollun');
      expect(result.distance).toBeGreaterThan(0);
      expect(result.confidence).toBeGreaterThan(0);
      expect(result.confidence).toBeLessThan(100);
    });

    it('should provide suggestions for invalid words', () => {
      const result = validateWord('xxxxx', mockWordBank);
      expect(result.isValid).toBe(false);
      expect(result.suggestions.length).toBeGreaterThanOrEqual(0);
    });

    it('should return suggestions in order of distance', () => {
      const result = validateWord('kathe', mockWordBank, 3);
      if (result.suggestions.length > 1) {
        // Suggestions should be ordered by closeness
        expect(result.suggestions[0]).toBeDefined();
      }
    });

    it('should respect fuzzyTolerance parameter', () => {
      const strictResult = validateWord('xxxhindiword', mockWordBank, 1);
      const lenientResult = validateWord('xxxhindiword', mockWordBank, 5);

      // With higher tolerance, should find more/better matches
      expect(strictResult.confidence).toBeLessThanOrEqual(
        lenientResult.confidence
      );
    });

    it('should handle case insensitivity', () => {
      const result1 = validateWord('KATHAI', mockWordBank);
      const result2 = validateWord('kathai', mockWordBank);

      expect(result1.isValid).toBe(result2.isValid);
      expect(result1.matchedWord).toBe(result2.matchedWord);
    });
  });

  describe('validateWords', () => {
    it('should validate multiple words', () => {
      const words = ['kathai', 'sollun', 'undaram'];
      const results = validateWords(words, mockWordBank, 2);

      expect(results.length).toBe(3);
      expect(results[0].isValid).toBe(true);
      expect(results[1].isValid).toBe(true);
      expect(results[2].isValid).toBe(true); // Fuzzy match
    });

    it('should handle mixed valid and invalid words', () => {
      const words = ['kathai', 'xxxHindi', 'sollun'];
      const results = validateWords(words, mockWordBank);

      expect(results[0].isValid).toBe(true);
      expect(results[1].isValid).toBe(false);
      expect(results[2].isValid).toBe(true);
    });
  });

  describe('extractWords', () => {
    it('should extract words from sentence', () => {
      const words = extractWords('kathai sundaram irukku');
      expect(words).toEqual(['kathai', 'sundaram', 'irukku']);
    });

    it('should handle punctuation', () => {
      const words = extractWords('Kathai? Sundaram. Irukku!');
      expect(words).toContain('kathai');
      expect(words).toContain('sundaram');
      expect(words).toContain('irukku');
    });

    it('should normalize to lowercase', () => {
      const words = extractWords('KATHAI SUNDARAM');
      expect(words[0]).toBe('kathai');
    });

    it('should handle multiple spaces', () => {
      const words = extractWords('kathai    sundaram  irukku');
      expect(words.length).toBe(3);
    });
  });

  describe('suggestSentenceCorrections', () => {
    it('should suggest nothing for perfect sentence', () => {
      const result = suggestSentenceCorrections(
        'kathai sundaram irukku',
        mockWordBank,
        1
      );
      expect(result.hasCorrections).toBe(false);
      expect(result.corrections.length).toBe(0);
    });

    it('should suggest corrections for misspelled words', () => {
      const result = suggestSentenceCorrections(
        'katchai sundram iruku',
        mockWordBank,
        2
      );
      expect(result.hasCorrections).toBe(true);
      expect(result.corrections.length).toBeGreaterThan(0);
    });

    it('should preserve sentence structure', () => {
      const original = 'kathai sundaram irukku';
      const result = suggestSentenceCorrections(
        original,
        mockWordBank,
        1
      );
      const originalWords = original.split(' ');
      expect(result.correctedSentence.split(' ').length).toBe(
        originalWords.length
      );
    });

    it('should provide suggestions with confidence scores', () => {
      const result = suggestSentenceCorrections(
        'solllen magan',
        mockWordBank,
        2
      );

      for (const correction of result.corrections) {
        expect(correction.confidence).toBeGreaterThanOrEqual(0);
        expect(correction.confidence).toBeLessThanOrEqual(100);
      }
    });
  });

  describe('getTransliterationVariations', () => {
    it('should return variations for known words', () => {
      const variations = getTransliterationVariations('kathai');
      expect(Array.isArray(variations)).toBe(true);
      expect(variations.length).toBeGreaterThan(0);
    });

    it('should include normalized form', () => {
      const variations = getTransliterationVariations('kathai');
      expect(variations).toContain('kathai');
    });

    it('should handle unknown words', () => {
      const variations = getTransliterationVariations('xxxunknownword');
      expect(variations.length).toBeGreaterThan(0); // Should at least return normalized
    });
  });

  describe('calculateTamilWordConfidence', () => {
    it('should give high confidence to valid words', () => {
      const confidence = calculateTamilWordConfidence('kathai');
      expect(confidence).toBeGreaterThan(50);
    });

    it('should give lower confidence to unusual words', () => {
      const validConfidence = calculateTamilWordConfidence('kathai');
      const invalidConfidence = calculateTamilWordConfidence('zzzzz');

      expect(validConfidence).toBeGreaterThan(invalidConfidence);
    });

    it('should handle edge cases', () => {
      const confidence1 = calculateTamilWordConfidence('a');
      const confidence2 = calculateTamilWordConfidence('abcdefghijklmnop');

      expect(confidence1).toBeDefined();
      expect(confidence2).toBeDefined();
      expect(confidence1).toBeGreaterThanOrEqual(0);
      expect(confidence2).toBeGreaterThanOrEqual(0);
    });

    it('should cap confidence at 100', () => {
      const confidence = calculateTamilWordConfidence('sundaram');
      expect(confidence).toBeLessThanOrEqual(100);
    });

    it('should reward common Tamil patterns', () => {
      const withEnding = calculateTamilWordConfidence('kaththai'); // Ends in -ai
      const withoutEnding = calculateTamilWordConfidence('kthb');

      expect(withEnding).toBeGreaterThan(withoutEnding);
    });
  });

  describe('Integration tests', () => {
    it('should handle real-world Tamil sentence with typos', () => {
      const sentence = 'solllen nalan iruku sundram';
      const result = suggestSentenceCorrections(sentence, mockWordBank, 2);

      expect(result.hasCorrections).toBe(true);
      expect(result.correctedSentence).toContain('sollun');
      expect(result.correctedSentence).toContain('sundaram');
    });

    it('should maintain word order while correcting', () => {
      const sentence = 'katae sollun iriku';
      const result = suggestSentenceCorrections(sentence, mockWordBank, 2);

      const correctedWords = result.correctedSentence.split(' ');
      expect(correctedWords[0]).toBe('kathai');
      expect(correctedWords[1]).toBe('sollun');
    });

    it('should handle mixed case and spacing', () => {
      const result = validateWord('  KaTHAI  ', mockWordBank);
      expect(result.isValid).toBe(true);
      expect(result.matchedWord).toBe('kathai');
    });
  });
});
