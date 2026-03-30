/**
 * LLM Service Facade
 *
 * Provides a unified interface for LLM operations across multiple providers.
 * Handles cost logging, error handling, and provider selection.
 * Supports: evaluateTranslation, correctGrammar, generateReferenceMeaning, intendDetection
 */

import { logger } from '@/lib/config/logger';
import { env } from '@/lib/config/env';
import type {
  LLMProvider,
  TranslationEvaluation,
  GrammarCorrection,
  IntentDetectionResult,
} from '@/lib/llm/types';
import { AnthropicAdapter } from '@/lib/llm/anthropic-adapter';

// Simple in-memory cache for translation results
interface CacheEntry<T> {
  value: T;
  timestamp: number;
  ttlMs: number;
}

class TranslationCache {
  private cache = new Map<string, CacheEntry<TranslationEvaluation>>();
  private readonly CACHE_TTL_MS = 3600000; // 1 hour

  set(key: string, value: TranslationEvaluation): void {
    this.cache.set(key, {
      value,
      timestamp: Date.now(),
      ttlMs: this.CACHE_TTL_MS,
    });
  }

  get(key: string): TranslationEvaluation | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    const age = Date.now() - entry.timestamp;
    if (age > entry.ttlMs) {
      this.cache.delete(key);
      return null;
    }

    return entry.value;
  }

  clear(): void {
    this.cache.clear();
  }
}

/**
 * Factory function to create LLM provider based on environment
 */
function createLLMProvider(providerName: string): LLMProvider {
  switch (providerName.toLowerCase()) {
    case 'anthropic':
    case 'claude':
      return new AnthropicAdapter({
        apiKey: env.ANTHROPIC_API_KEY,
        model: env.LLM_MODEL,
        maxRetries: 3,
        timeoutMs: 30000,
      });

    default:
      throw new Error(
        `Unsupported LLM provider: ${providerName}. Supported: anthropic, openai`
      );
  }
}

class LLMService {
  private provider: LLMProvider | null = null;
  private translationCache: TranslationCache = new TranslationCache();
  private initPromise: Promise<void> | null = null;

  /**
   * Initialize LLM service with provider
   */
  async initialize(): Promise<void> {
    // Prevent multiple concurrent initializations
    if (this.initPromise) {
      return this.initPromise;
    }

    this.initPromise = this._initialize();
    return this.initPromise;
  }

  private async _initialize(): Promise<void> {
    logger.info(
      { provider: env.LLM_PROVIDER, model: env.LLM_MODEL },
      'Initializing LLM service'
    );

    try {
      this.provider = createLLMProvider(env.LLM_PROVIDER);
      logger.info(
        { provider: env.LLM_PROVIDER, model: env.LLM_MODEL },
        '✅ LLM service initialized successfully'
      );
    } catch (error) {
      logger.error({ error }, '❌ Failed to initialize LLM service');
      throw error;
    }
  }

  /**
   * Ensure provider is initialized
   */
  private async ensureInitialized(): Promise<void> {
    if (!this.provider) {
      await this.initialize();
    }
  }

  /**
   * Evaluate a learner's translation of a teacher's message
   * Includes caching to avoid repeated evaluations
   */
  async evaluateTranslation(
    learner_translation: string,
    teacher_message: string,
    target_language: string,
    base_language: string
  ): Promise<TranslationEvaluation> {
    await this.ensureInitialized();

    // Create cache key
    const cacheKey = `${teacher_message}|${learner_translation}|${target_language}`;
    const cached = this.translationCache.get(cacheKey);
    if (cached) {
      logger.debug({ cacheKey }, '📦 Using cached translation evaluation');
      return cached;
    }

    const startTime = Date.now();

    try {
      logger.debug(
        {
          learner_translation,
          teacher_message,
          target_language,
        },
        'Evaluating translation'
      );

      const result = await this.provider!.evaluateTranslation(
        learner_translation,
        teacher_message,
        target_language,
        base_language
      );

      const latency = Date.now() - startTime;

      logger.info(
        { result: result.result, latency, cached: false },
        'Translation evaluation complete'
      );

      // Cache the result
      this.translationCache.set(cacheKey, result);

      // TODO: Log to llm_calls_log table for cost tracking
      // await this.logLLMCall({
      //   operation: 'evaluate_translation',
      //   provider: env.LLM_PROVIDER,
      //   model: env.LLM_MODEL,
      //   latency_ms: latency,
      //   tokens_input: estimated,
      //   tokens_output: estimated,
      // });

      return result;
    } catch (error) {
      logger.error(
        { error, teacher_message, learner_translation },
        'Translation evaluation failed'
      );
      throw error;
    }
  }

  /**
   * Check and correct a learner's sentence in target language
   */
  async correctGrammar(
    sentence: string,
    target_language: string,
    base_language: string
  ): Promise<GrammarCorrection> {
    await this.ensureInitialized();

    const startTime = Date.now();

    try {
      logger.debug(
        { sentence, target_language },
        'Checking grammar'
      );

      const result = await this.provider!.correctGrammar(
        sentence,
        target_language,
        base_language
      );

      const latency = Date.now() - startTime;

      logger.info(
        { has_errors: result.has_errors, latency },
        'Grammar check complete'
      );

      // TODO: Log to llm_calls_log table
      // await this.logLLMCall({ operation: 'correct_grammar', latency_ms: latency });

      return result;
    } catch (error) {
      logger.error({ error, sentence }, 'Grammar correction failed');
      throw error;
    }
  }

  /**
   * Generate a reference translation for a teacher's message
   * Used to provide correct answers to learners
   */
  async generateReferenceMeaning(
    message: string,
    target_language: string,
    base_language: string
  ): Promise<string> {
    await this.ensureInitialized();

    const startTime = Date.now();

    try {
      logger.debug(
        { message, target_language },
        'Generating reference translation'
      );

      const translation = await this.provider!.generateReferenceMeaning(
        message,
        target_language,
        base_language
      );

      const latency = Date.now() - startTime;

      logger.info(
        { translation, latency },
        'Reference translation generated'
      );

      // TODO: Log to llm_calls_log table
      // await this.logLLMCall({ operation: 'generate_reference', latency_ms: latency });

      return translation;
    } catch (error) {
      logger.error({ error, message }, 'Failed to generate reference meaning');
      throw error;
    }
  }

  /**
   * Detect if a message is a learning loop response (Tier 1 - cheap LLM call)
   * Used before expensive full evaluation
   */
  async isLearningLoopResponse(
    message: string,
    loop_state: string,
    expected_sender_role: 'learner' | 'teacher',
    target_language: string
  ): Promise<IntentDetectionResult> {
    await this.ensureInitialized();

    const startTime = Date.now();

    try {
      logger.debug(
        { message, loop_state, expected_sender_role },
        'Detecting message intent'
      );

      const result = await this.provider!.isLearningLoopResponse(
        message,
        loop_state,
        expected_sender_role,
        target_language
      );

      const latency = Date.now() - startTime;

      logger.info(
        {
          is_loop_response: result.is_learning_loop_response,
          confidence: result.confidence,
          latency,
        },
        'Intent detection complete'
      );

      // TODO: Log to llm_calls_log table (cheap Haiku call)
      // await this.logLLMCall({ operation: 'intent_detection', latency_ms: latency });

      return result;
    } catch (error) {
      logger.error({ error, message }, 'Intent detection failed');
      throw error;
    }
  }

  /**
   * Count tokens for a message (for cost estimation & limiting)
   */
  async countTokens(text: string): Promise<number> {
    await this.ensureInitialized();

    try {
      return await this.provider!.countTokens(text);
    } catch (error) {
      logger.error({ error }, 'Token counting failed');
      throw error;
    }
  }

  /**
   * Clear in-memory cache (useful for testing or refresh)
   */
  clearCache(): void {
    this.translationCache.clear();
    logger.info('Cleared LLM service cache');
  }
}

// Export both the class and singleton instance
export { LLMService };
export const llmService = new LLMService();
