/**
 * LLM Provider Abstraction Types
 *
 * Define the interface for language model services.
 * Implementations should be provider-specific (Anthropic, OpenAI, etc.)
 */

export type EvaluationResult = 'correct' | 'partially_correct' | 'incorrect';

export interface TranslationEvaluation {
  result: EvaluationResult;
  feedback: string;
  reference_translation?: string;
}

export interface GrammarCorrection {
  corrected_text: string;
  has_errors: boolean;
  errors: string[];
  explanation: string;
}

export interface IntentDetectionResult {
  is_learning_loop_response: boolean;
  confidence: number;
  reason?: string;
}

/**
 * Abstract LLM Provider Interface
 * Implement this interface for each LLM provider (Anthropic, OpenAI, etc.)
 */
export interface LLMProvider {
  /**
   * Evaluate a learner's translation of a teacher's message
   *
   * @param learner_translation - The learner's translated text (in base language)
   * @param teacher_message - The original teacher's message (in target language)
   * @param target_language - The language being learned (e.g., 'Tamil')
   * @param base_language - The learner's native language (e.g., 'English')
   * @returns Evaluation result with feedback
   */
  evaluateTranslation(
    learner_translation: string,
    teacher_message: string,
    target_language: string,
    base_language: string
  ): Promise<TranslationEvaluation>;

  /**
   * Check and correct a learner's sentence/reply in target language
   *
   * @param sentence - The learner's sentence in target language (Roman script)
   * @param target_language - The language being learned
   * @param base_language - The learner's native language
   * @returns Correction details if errors found, or confirmation if correct
   */
  correctGrammar(
    sentence: string,
    target_language: string,
    base_language: string
  ): Promise<GrammarCorrection>;

  /**
   * Generate a reference translation for a teacher's message
   *
   * @param message - The teacher's message in target language (Roman script)
   * @param target_language - The language of the message
   * @param base_language - The learner's native language
   * @returns The translated meaning in base language
   */
  generateReferenceMeaning(
    message: string,
    target_language: string,
    base_language: string
  ): Promise<string>;

  /**
   * Detect if a message is a learning loop response or casual chat
   * (Tier 1 intent classification for cost optimization)
   *
   * @param message - The incoming message text
   * @param loop_state - Current learning loop state (e.g., 'pending_sentence')
   * @param expected_sender_role - Who is expected to send the next message ('learner' or 'teacher')
   * @param target_language - The language being learned
   * @returns Whether this appears to be a learning loop response
   */
  isLearningLoopResponse(
    message: string,
    loop_state: string,
    expected_sender_role: 'learner' | 'teacher',
    target_language: string
  ): Promise<IntentDetectionResult>;

  /**
   * Get token count for a given text (for cost estimation)
   *
   * @param text - The text to count tokens for
   * @returns Number of tokens
   */
  countTokens(text: string): Promise<number>;
}

/**
 * Configuration for LLM Provider
 */
export interface LLMProviderConfig {
  provider: 'anthropic' | 'openai' | string;
  model: string;
  api_key: string;
  base_url?: string; // For proxies or custom endpoints
  max_retries?: number;
  timeout_ms?: number;
}

/**
 * Result of an LLM operation for logging/monitoring
 */
export interface LLMCallLog {
  provider: string;
  model: string;
  operation: string; // 'evaluate_translation', 'correct_grammar', etc.
  tokens_input: number;
  tokens_output: number;
  cost_cents: number;
  latency_ms: number;
  success: boolean;
  error?: string;
  timestamp: Date;
}
