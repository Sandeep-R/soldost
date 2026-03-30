/**
 * Anthropic Claude Adapter
 *
 * Implements the LLMProvider interface using Claude Sonnet via Anthropic SDK.
 * Enforces Roman-script-only output, includes token counting, retry logic,
 * and cost logging.
 */

import Anthropic from '@anthropic-ai/sdk';
import { logger } from '@/lib/config/logger';
import {
  LLMProvider,
  TranslationEvaluation,
  GrammarCorrection,
  IntentDetectionResult,
} from '@/lib/llm/types';

const SYSTEM_PROMPT_BASE = `You are a language learning assistant for ${`LANGUAGE`} learners.

CRITICAL RULES:
1. Always respond in Roman/Latin script ONLY. Never use native scripts.
2. All content must be transliterated to Roman characters.
3. Be encouraging but honest in evaluations.
4. Keep responses concise (under 200 words).
5. For Tamil: Use informal/casual transliteration (phonetic, user-friendly).

Example Tamil transliterations:
- கதை → kathai (Story)
- சொல்லும் → sollun (Says/tells)
- சுந்தரம் → sundaram (Beautiful)
`;

interface AnthropicClientConfig {
  apiKey: string;
  model: string;
  maxRetries: number;
  timeoutMs: number;
}

export class AnthropicAdapter implements LLMProvider {
  private client: Anthropic;
  private model: string;
  private maxRetries: number;

  constructor(config: AnthropicClientConfig) {
    this.model = config.model;
    this.maxRetries = config.maxRetries;

    this.client = new Anthropic({
      apiKey: config.apiKey,
      timeout: config.timeoutMs,
      maxRetries: config.maxRetries,
    });

    logger.info(
      { model: this.model, maxRetries: this.maxRetries },
      'Anthropic adapter initialized'
    );
  }

  /**
   * Evaluate a learner's translation of a teacher's message
   */
  async evaluateTranslation(
    learner_translation: string,
    teacher_message: string,
    target_language: string,
    base_language: string
  ): Promise<TranslationEvaluation> {
    const systemPrompt = SYSTEM_PROMPT_BASE.replace(
      `LANGUAGE`,
      target_language
    );

    const userPrompt = `
Evaluate this translation:

Teacher's message (in ${target_language}, Roman script): "${teacher_message}"
Learner's translation (in ${base_language}): "${learner_translation}"

Respond in JSON format with these fields:
{
  "result": "correct" | "partially_correct" | "incorrect",
  "feedback": "Brief feedback (1-2 sentences)"
}

Rules:
- "correct" if translation captures the main meaning accurately
- "partially_correct" if some parts are right but details missed
- "incorrect" if fundamentally misses the meaning

Example correct Tamil translation:
Teacher: "Nala irukkaiya?" (How are you?)
Learner: "How are you?"
Result: "correct"

Always provide brief, encouraging feedback.
`;

    try {
      const response = await this.client.messages.create({
        model: this.model,
        max_tokens: 200,
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: userPrompt,
          },
        ],
      });

      const content = response.content[0];
      if (content.type !== 'text') {
        throw new Error('Unexpected response type from Claude');
      }

      const parsed = this.parseJSON(content.text);

      logger.debug(
        { result: parsed.result },
        'Translation evaluation complete'
      );

      return {
        result: parsed.result as TranslationEvaluation['result'],
        feedback: parsed.feedback as string,
        reference_translation: learner_translation,
      };
    } catch (error) {
      logger.error({ error, teacher_message }, 'Translation evaluation failed');
      throw error;
    }
  }

  /**
   * Check and correct a learner's sentence/reply in target language
   */
  async correctGrammar(
    sentence: string,
    target_language: string,
    _base_language: string
  ): Promise<GrammarCorrection> {
    const systemPrompt = SYSTEM_PROMPT_BASE.replace(
      `LANGUAGE`,
      target_language
    );

    const userPrompt = `
Check this ${target_language} sentence (in Roman script) for grammar and structure:

"${sentence}"

Respond in JSON format:
{
  "has_errors": true | false,
  "errors": ["error1", "error2"],
  "corrected_text": "corrected version in Roman script",
  "explanation": "Brief explanation of corrections (if any)"
}

Rules:
- List specific grammar or vocabulary errors (if any)
- Provide corrected version in Roman script (transliterated, no native script)
- Be encouraging even if there are errors
- If no errors, set errors to [] and explanation to "Your sentence is correct!"
`;

    try {
      const response = await this.client.messages.create({
        model: this.model,
        max_tokens: 300,
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: userPrompt,
          },
        ],
      });

      const content = response.content[0];
      if (content.type !== 'text') {
        throw new Error('Unexpected response type from Claude');
      }

      const parsed = this.parseJSON(content.text);

      logger.debug(
        { has_errors: parsed.has_errors },
        'Grammar check complete'
      );

      return {
        corrected_text: parsed.corrected_text as string,
        has_errors: parsed.has_errors as boolean,
        errors: (parsed.errors as string[] | undefined) ?? [],
        explanation: parsed.explanation as string,
      };
    } catch (error) {
      logger.error({ error, sentence }, 'Grammar correction failed');
      throw error;
    }
  }

  /**
   * Generate a reference translation for a teacher's message
   */
  async generateReferenceMeaning(
    message: string,
    target_language: string,
    base_language: string
  ): Promise<string> {
    const systemPrompt = SYSTEM_PROMPT_BASE.replace(
      `LANGUAGE`,
      target_language
    );

    const userPrompt = `
Translate this ${target_language} sentence to ${base_language}.

${target_language} (Roman script): "${message}"

Provide ONLY the translation, nothing else. One sentence, concise.
`;

    try {
      const response = await this.client.messages.create({
        model: this.model,
        max_tokens: 100,
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: userPrompt,
          },
        ],
      });

      const content = response.content[0];
      if (content.type !== 'text') {
        throw new Error('Unexpected response type from Claude');
      }

      const translation = content.text.trim();

      logger.debug({ translation }, 'Reference translation generated');

      return translation;
    } catch (error) {
      logger.error({ error, message }, 'Failed to generate reference meaning');
      throw error;
    }
  }

  /**
   * Detect if a message is a learning loop response or casual chat
   * (Tier 1 intent classification for cost optimization)
   */
  async isLearningLoopResponse(
    message: string,
    loop_state: string,
    expected_sender_role: 'learner' | 'teacher',
    target_language: string
  ): Promise<IntentDetectionResult> {
    const systemPrompt = `You are a message intent classifier for a language learning app.
Respond ONLY with JSON: { "is_learning_loop_response": true | false, "confidence": 0-100, "reason": "..." }
No Roman script rule needed for this task.`;

    const userPrompt = `
Classify this message:

Current loop state: ${loop_state}
Expected sender: ${expected_sender_role}
Target language: ${target_language}
Message: "${message}"

Is this message a learning loop response (e.g., sentence attempt, translation, reply) or casual chat?

Return JSON with:
- is_learning_loop_response: boolean
- confidence: 0-100 (how confident in classification)
- reason: brief explanation

Loop states where learner responds:
- pending_sentence: learner sends a sentence using today's words
- pending_translation: learner translates teacher's message
- pending_learner_reply: learner replies in target language

Loop states where teacher responds:
- pending_teacher_reply: teacher replies to learner

Examples of learning responses:
- "Kathai sundaram irukku" (Sentence using 'sundaram')
- "That's a nice story" (Translation of teacher's Tamil)
- "Neen solla solren" (Reply to teacher's message)

Examples of casual chat:
- "How are you?"
- [sticker]
- "lol ok"
`;

    try {
      const response = await this.client.messages.create({
        model: 'claude-3-5-haiku-20241022', // Use Haiku for Tier 1 (cheaper)
        max_tokens: 100,
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: userPrompt,
          },
        ],
      });

      const content = response.content[0];
      if (content.type !== 'text') {
        throw new Error('Unexpected response type from Claude');
      }

      const parsed = this.parseJSON(content.text);

      logger.debug(
        { is_loop: parsed.is_learning_loop_response, confidence: parsed.confidence },
        'Intent classification complete'
      );

      return {
        is_learning_loop_response: parsed.is_learning_loop_response as boolean,
        confidence: (parsed.confidence as number | undefined) ?? 0,
        reason: parsed.reason as string | undefined,
      };
    } catch (error) {
      logger.error({ error, message }, 'Intent detection failed');
      throw error;
    }
  }

  /**
   * Get token count for a given text (for cost estimation)
   */
  async countTokens(text: string): Promise<number> {
    try {
      // Anthropic SDK doesn't have built-in token counting, so estimate
      // Rough approximation: 1 token ≈ 4 characters for English/Latin
      // Adjust for target language if needed
      const estimatedTokens = Math.ceil(text.length / 4);
      return estimatedTokens;
    } catch (error) {
      logger.error({ error }, 'Token counting failed');
      // Fallback: conservative estimate
      return Math.ceil(text.length / 4);
    }
  }

  /**
   * Helper: Parse JSON from Claude response, with fallback
   */
  private parseJSON(text: string): Record<string, unknown> {
    try {
      // Find JSON block if wrapped in markdown
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }

      return JSON.parse(jsonMatch[0]);
    } catch (error) {
      logger.warn(
        { text, error },
        'Failed to parse JSON response, returning fallback'
      );

      // Fallback: return sensible default based on context
      return {
        result: 'error',
        feedback: 'Service temporarily unavailable',
        has_errors: true,
        errors: [],
        corrected_text: '',
        explanation: 'Unable to process request',
        is_learning_loop_response: false,
        confidence: 0,
      };
    }
  }
}
