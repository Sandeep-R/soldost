/**
 * LLM Service Tests
 *
 * Tests for the LLM service facade including:
 * - Translation evaluation with caching
 * - Grammar correction
 * - Reference meaning generation  
 * - Intent detection
 * - Error handling
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { LLMService } from '@/services/llm-service';
import type { LLMProvider, TranslationEvaluation } from '@/lib/llm/types';

// Mock LLM Provider
const mockProvider: LLMProvider = {
  async evaluateTranslation(
    learner_translation: string,
    teacher_message: string,
    target_language: string,
    base_language: string
  ) {
    return {
      result: 'correct' as const,
      feedback: 'Good translation!',
      reference_translation: 'That was correct',
    };
  },

  async correctGrammar(
    sentence: string,
    target_language: string,
    base_language: string
  ) {
    return {
      corrected_text: sentence,
      has_errors: false,
      errors: [],
      explanation: 'Your sentence is correct!',
    };
  },

  async generateReferenceMeaning(
    message: string,
    target_language: string,
    base_language: string
  ) {
    return 'This is a reference translation';
  },

  async isLearningLoopResponse(
    message: string,
    loop_state: string,
    expected_sender_role: 'learner' | 'teacher',
    target_language: string
  ) {
    return {
      is_learning_loop_response: true,
      confidence: 95,
      reason: 'Message matches learning loop context',
    };
  },

  async countTokens(text: string) {
    return Math.ceil(text.length / 4);
  },
};

describe('LLMService', () => {
  let service: LLMService;

  beforeEach(() => {
    service = new LLMService();
    // Mock the provider creation
    vi.spyOn(service as any, 'initialize').mockResolvedValue(undefined);
    (service as any).provider = mockProvider;
  });

  describe('evaluateTranslation', () => {
    it('should evaluate a translation correctly', async () => {
      const result = await service.evaluateTranslation(
        'That is a story',
        'Adu oru kathai',
        'Tamil',
        'English'
      );

      expect(result).toHaveProperty('result');
      expect(result).toHaveProperty('feedback');
      expect(['correct', 'partially_correct', 'incorrect']).toContain(
        result.result
      );
    });

    it('should cache translation results', async () => {
      const evaluateSpyOn = vi.spyOn(mockProvider, 'evaluateTranslation');

      // First call
      const result1 = await service.evaluateTranslation(
        'Translation A',
        'Message A',
        'Tamil',
        'English'
      );

      // Second call with same params
      const result2 = await service.evaluateTranslation(
        'Translation A',
        'Message A',
        'Tamil',
        'English'
      );

      // Provider should only be called once due to caching
      expect(evaluateSpyOn).toHaveBeenCalledTimes(1);
      expect(result1).toEqual(result2);
    });

    it('should not use cache for different inputs', async () => {
      const evaluateSpyOn = vi.spyOn(mockProvider, 'evaluateTranslation');

      await service.evaluateTranslation(
        'Translation A',
        'Message A',
        'Tamil',
        'English'
      );

      await service.evaluateTranslation(
        'Translation B',
        'Message A',
        'Tamil',
        'English'
      );

      // Provider should be called twice for different inputs
      expect(evaluateSpyOn).toHaveBeenCalledTimes(2);
    });

    it('should throw error if provider not initialized', async () => {
      const uninitializedService = new LLMService();
      (uninitializedService as any).provider = null;

      await expect(
        uninitializedService.evaluateTranslation(
          'Translation',
          'Message',
          'Tamil',
          'English'
        )
      ).rejects.toThrow();
    });
  });

  describe('correctGrammar', () => {
    it('should check grammar correctly', async () => {
      const result = await service.correctGrammar(
        'Nala irukkaiya?',
        'Tamil',
        'English'
      );

      expect(result).toHaveProperty('corrected_text');
      expect(result).toHaveProperty('has_errors');
      expect(result).toHaveProperty('errors');
      expect(result).toHaveProperty('explanation');
      expect(typeof result.has_errors).toBe('boolean');
      expect(Array.isArray(result.errors)).toBe(true);
    });

    it('should handle grammar errors correctly', async () => {
      vi.spyOn(mockProvider, 'correctGrammar').mockResolvedValueOnce({
        corrected_text: 'Nala irukkaiya?',
        has_errors: true,
        errors: ['Missing subject'],
        explanation: 'You need to specify who you are asking',
      });

      const result = await service.correctGrammar(
        'Irukkaiya?',
        'Tamil',
        'English'
      );

      expect(result.has_errors).toBe(true);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe('generateReferenceMeaning', () => {
    it('should generate reference translation', async () => {
      const result = await service.generateReferenceMeaning(
        'Nala irukkaiya?',
        'Tamil',
        'English'
      );

      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });

    it('should handle different languages', async () => {
      const result = await service.generateReferenceMeaning(
        'Nala irukkaiya?',
        'Tamil',
        'English'
      );

      expect(result).toBeDefined();
    });
  });

  describe('isLearningLoopResponse', () => {
    it('should detect learning loop responses', async () => {
      const result = await service.isLearningLoopResponse(
        'Kathai sundaram irukku',
        'pending_sentence',
        'learner',
        'Tamil'
      );

      expect(result).toHaveProperty('is_learning_loop_response');
      expect(result).toHaveProperty('confidence');
      expect(result).toHaveProperty('reason');
      expect(typeof result.is_learning_loop_response).toBe('boolean');
      expect(typeof result.confidence).toBe('number');
    });

    it('should detect casual chat vs learning responses', async () => {
      vi.spyOn(mockProvider, 'isLearningLoopResponse').mockResolvedValueOnce({
        is_learning_loop_response: false,
        confidence: 85,
        reason: 'Message appears to be casual chat',
      });

      const result = await service.isLearningLoopResponse(
        'hi how r u',
        'pending_sentence',
        'learner',
        'Tamil'
      );

      expect(result.is_learning_loop_response).toBe(false);
    });

    it('should handle different loop states', async () => {
      const states = [
        'pending_sentence',
        'awaiting_teacher_reply',
        'awaiting_translation',
      ];

      for (const state of states) {
        const result = await service.isLearningLoopResponse(
          'Test message',
          state,
          'learner',
          'Tamil'
        );

        expect(result).toHaveProperty('is_learning_loop_response');
      }
    });
  });

  describe('countTokens', () => {
    it('should count tokens in text', async () => {
      const text = 'This is a test message';
      const tokenCount = await service.countTokens(text);

      expect(typeof tokenCount).toBe('number');
      expect(tokenCount).toBeGreaterThan(0);
    });

    it('should scale with text length', async () => {
      const shortText = 'Hi';
      const longText = 'This is a much longer test message with multiple words';

      const shortTokens = await service.countTokens(shortText);
      const longTokens = await service.countTokens(longText);

      expect(longTokens).toBeGreaterThan(shortTokens);
    });
  });

  describe('cache management', () => {
    it('should clear cache on demand', async () => {
      const evaluateSpyOn = vi.spyOn(mockProvider, 'evaluateTranslation');

      // Fill cache
      await service.evaluateTranslation(
        'Translation',
        'Message',
        'Tamil',
        'English'
      );

      expect(evaluateSpyOn).toHaveBeenCalledTimes(1);

      // Clear cache
      service.clearCache();

      // Second call after clear should hit provider again
      await service.evaluateTranslation(
        'Translation',
        'Message',
        'Tamil',
        'English'
      );

      expect(evaluateSpyOn).toHaveBeenCalledTimes(2);
    });
  });

  describe('error handling', () => {
    it('should handle provider errors gracefully', async () => {
      vi.spyOn(mockProvider, 'evaluateTranslation').mockRejectedValueOnce(
        new Error('API Error')
      );

      await expect(
        service.evaluateTranslation(
          'Translation',
          'Message',
          'Tamil',
          'English'
        )
      ).rejects.toThrow('API Error');
    });

    it('should handle grammar check errors', async () => {
      vi.spyOn(mockProvider, 'correctGrammar').mockRejectedValueOnce(
        new Error('Service unavailable')
      );

      await expect(
        service.correctGrammar('Test', 'Tamil', 'English')
      ).rejects.toThrow('Service unavailable');
    });

    it('should handle intent detection errors', async () => {
      vi.spyOn(mockProvider, 'isLearningLoopResponse').mockRejectedValueOnce(
        new Error('Classification failed')
      );

      await expect(
        service.isLearningLoopResponse(
          'Message',
          'state',
          'learner',
          'Tamil'
        )
      ).rejects.toThrow('Classification failed');
    });
  });

  describe('initialization', () => {
    it('should handle multiple initialize calls (deduplicate)', async () => {
      const uninitializedService = new LLMService();
      const initSpy = vi.spyOn(
        uninitializedService as any,
        '_initialize'
      );

      // Mock _initialize
      (uninitializedService as any)._initialize = vi
        .fn()
        .mockResolvedValue(undefined);

      // Call initialize multiple times
      await Promise.all([
        uninitializedService.initialize(),
        uninitializedService.initialize(),
        uninitializedService.initialize(),
      ]);

      // _initialize should only be called once
      expect((uninitializedService as any)._initialize).toHaveBeenCalledTimes(
        1
      );
    });
  });
});
