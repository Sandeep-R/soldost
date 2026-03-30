/**
 * Learning Loop Engine
 *
 * Orchestrates the language learning loop state machine:
 * pending_sentence → awaiting_teacher_reply → awaiting_translation →
 * evaluating_translation → awaiting_learner_reply → evaluating_reply →
 * completed → (next loop) or expired
 *
 * Responsibilities:
 * - State transitions
 * - Message routing to appropriate handlers
 * - Evaluation coordination
 * - Streak management
 * - Daily word delivery
 */

import { logger } from '@/lib/config/logger';
import { llmService } from '@/services/llm-service';
import type { IntentDetectionResult } from '@/lib/llm/types';
import type { Word } from '@/lib/supabase/types';

/**
 * Learning loop states
 */
export type LoopState =
  | 'pending_sentence'
  | 'awaiting_teacher_reply'
  | 'awaiting_translation'
  | 'evaluating_translation'
  | 'awaiting_learner_reply'
  | 'evaluating_reply'
  | 'completed'
  | 'expired';

/**
 * Message evaluation result
 */
export interface EvaluationResult {
  status: 'pass' | 'fail' | 'partial';
  feedback: string;
  nextState: LoopState;
  streakIncrement: number; // 0 or 1
  shouldNotify: boolean;
}

/**
 * Learning loop context
 */
export interface LearningLoopContext {
  groupId: string;
  loopId: string;
  learnerId: string;
  teacherId: string;
  targetLanguage: string;
  baseLanguage: string;
  currentState: LoopState;
  dailyWords: { noun: Word; verb: Word; adjective: Word };
  timeoutMs: number; // Default: 24 hours
}

/**
 * Message for evaluation
 */
export interface MessageForEvaluation {
  senderId: string;
  senderRole: 'learner' | 'teacher';
  content: string;
  loopState: LoopState;
  timestamp: Date;
}

/**
 * Learning Loop Engine
 */
export class LearningLoopEngine {
  private readonly LOOP_TIMEOUT_MS = 24 * 60 * 60 * 1000; // 24 hours

  /**
   * Initialize the engine (setup LLM service if needed)
   */
  async initialize(): Promise<void> {
    await llmService.initialize();
    logger.info('Learning loop engine initialized');
  }

  /**
   * Check if a message is relevant to the current learning loop
   */
  async isRelevantMessage(
    message: MessageForEvaluation,
    context: LearningLoopContext
  ): Promise<IntentDetectionResult> {
    logger.debug(
      { loopState: message.loopState, senderId: message.senderId },
      'Checking message relevance'
    );

    // Use Tier-1 (cheap) intent detection
    const result = await llmService.isLearningLoopResponse(
      message.content,
      message.loopState,
      message.senderRole,
      context.targetLanguage
    );

    return result;
  }

  /**
   * Process message for current loop state
   */
  async processMessageEval(
    message: MessageForEvaluation,
    context: LearningLoopContext
  ): Promise<EvaluationResult> {
    logger.info(
      { loopState: message.loopState, senderRole: message.senderRole },
      'Processing learning loop message'
    );

    // Check if message is relevant to loop
    const relevance = await this.isRelevantMessage(message, context);
    if (!relevance.is_learning_loop_response) {
      logger.debug('Message not relevant to learning loop');
      return {
        status: 'fail',
        feedback: 'This message does not seem related to the learning loop',
        nextState: message.loopState,
        streakIncrement: 0,
        shouldNotify: false,
      };
    }

    // Route based on state and sender
    switch (message.loopState) {
      case 'pending_sentence':
        return await this.handlePendingSentence(message, context);

      case 'awaiting_teacher_reply':
        return await this.handleTeacherReply(message, context);

      case 'awaiting_translation':
        return await this.handleTranslationAttempt(message, context);

      case 'evaluating_translation':
        // Should not receive messages in this state
        return {
          status: 'fail',
          feedback: 'Loop is currently being evaluated',
          nextState: 'evaluating_translation',
          streakIncrement: 0,
          shouldNotify: false,
        };

      case 'awaiting_learner_reply':
        return await this.handleLearnerReply(message, context);

      case 'evaluating_reply':
        // Should not receive messages in this state
        return {
          status: 'fail',
          feedback: 'Loop is currently being evaluated',
          nextState: 'evaluating_reply',
          streakIncrement: 0,
          shouldNotify: false,
        };

      case 'completed':
      case 'expired':
        return {
          status: 'fail',
          feedback: 'This learning loop has ended',
          nextState: message.loopState,
          streakIncrement: 0,
          shouldNotify: false,
        };

      default:
        logger.warn({ state: message.loopState }, 'Unknown loop state');
        return {
          status: 'fail',
          feedback: 'Invalid loop state',
          nextState: message.loopState,
          streakIncrement: 0,
          shouldNotify: false,
        };
    }
  }

  /**
   * Handle learner's initial sentence in target language
   * pending_sentence → awaiting_teacher_reply
   */
  private async handlePendingSentence(
    message: MessageForEvaluation,
    context: LearningLoopContext
  ): Promise<EvaluationResult> {
    logger.debug('Processing pending sentence');

    // Verify sender is learner
    if (message.senderRole !== 'learner') {
      return {
        status: 'fail',
        feedback: 'Only the learner can provide a sentence',
        nextState: 'pending_sentence',
        streakIncrement: 0,
        shouldNotify: false,
      };
    }

    // Check grammar
    const grammarResult = await llmService.correctGrammar(
      message.content,
      context.targetLanguage,
      context.baseLanguage
    );

    if (grammarResult.has_errors) {
      logger.debug(
        { errors: grammarResult.errors },
        'Sentence has grammar errors'
      );

      return {
        status: 'fail',
        feedback: `Grammar check found issues: ${grammarResult.explanation}. Please try again.`,
        nextState: 'pending_sentence', // Stay in same state for retry
        streakIncrement: 0,
        shouldNotify: true,
      };
    }

    return {
      status: 'pass',
      feedback: `Great sentence! Asking ${context.targetLanguage} speaker to generate a reply.`,
      nextState: 'awaiting_teacher_reply',
      streakIncrement: 0,
      shouldNotify: true,
    };
  }

  /**
   * Handle teacher's reply to learner's sentence
   * awaiting_teacher_reply → awaiting_translation
   */
  private async handleTeacherReply(
    message: MessageForEvaluation,
    context: LearningLoopContext
  ): Promise<EvaluationResult> {
    logger.debug('Processing teacher reply');

    // Verify sender is teacher
    if (message.senderRole !== 'teacher') {
      return {
        status: 'fail',
        feedback: 'Only the teacher can reply to the learner',
        nextState: 'awaiting_teacher_reply',
        streakIncrement: 0,
        shouldNotify: false,
      };
    }

    // Simple validation: teacher's message should exist and be reasonable
    if (message.content.length < 2) {
      return {
        status: 'fail',
        feedback: 'Reply is too short',
        nextState: 'awaiting_teacher_reply',
        streakIncrement: 0,
        shouldNotify: true,
      };
    }

    return {
      status: 'pass',
      feedback: `Teacher replied! Now ${context.baseLanguage} speaker, please translate to ${context.baseLanguage}.`,
      nextState: 'awaiting_translation',
      streakIncrement: 0,
      shouldNotify: true,
    };
  }

  /**
   * Handle learner's translation of teacher's message
   * awaiting_translation → evaluating_translation → (completes or stays in awaiting_translation)
   */
  private async handleTranslationAttempt(
    _message: MessageForEvaluation,
    _context: LearningLoopContext
  ): Promise<EvaluationResult> {
    logger.debug('Processing translation attempt');

    // For now, move to final step (full evaluation in Phase 7)
    // In production, would evaluate translation here

    return {
      status: 'pass',
      feedback: 'Translation recorded! Teaching is complete for this loop.',
      nextState: 'completed',
      streakIncrement: 1, // Award point for participating
      shouldNotify: true,
    };
  }

  /**
   * Handle learner's reply to teacher's message
   * awaiting_learner_reply → evaluating_reply → (completed or stays in awaiting_learner_reply)
   */
  private async handleLearnerReply(
    message: MessageForEvaluation,
    _context: LearningLoopContext
  ): Promise<EvaluationResult> {
    logger.debug('Processing learner reply');

    // Verify sender is learner
    if (message.senderRole !== 'learner') {
      return {
        status: 'fail',
        feedback: 'Only the learner can provide a reply',
        nextState: 'awaiting_learner_reply',
        streakIncrement: 0,
        shouldNotify: false,
      };
    }

    // For now, accept and complete (full evaluation in Phase 7)
    // In production, would check grammar and evaluate response

    return {
      status: 'pass',
      feedback: 'Great reply! You completed this loop.',
      nextState: 'completed',
      streakIncrement: 1, // Award point for participating
      shouldNotify: true,
    };
  }

  /**
   * Check if loop has expired (24 hours without completion)
   */
  isLoopExpired(
    createdAt: Date,
    currentState: LoopState,
    timeoutMs: number = this.LOOP_TIMEOUT_MS
  ): boolean {
    if (currentState === 'completed' || currentState === 'expired') {
      return false; // Already terminal
    }

    const age = Date.now() - createdAt.getTime();
    const expired = age > timeoutMs;

    if (expired) {
      logger.debug({ age, timeout: timeoutMs }, 'Loop has expired');
    }

    return expired;
  }

  /**
   * Transition loop to expired state
   */
  expireLoop(context: LearningLoopContext): EvaluationResult {
    logger.info({ loopId: context.loopId }, 'Expiring learning loop');

    return {
      status: 'fail',
      feedback: 'This learning loop has expired after 24 hours',
      nextState: 'expired',
      streakIncrement: 0,
      shouldNotify: true,
    };
  }

  /**
   * Get state transition description
   */
  getStateTransition(fromState: LoopState, toState: LoopState): string {
    const transitions: Record<string, string> = {
      'pending_sentence→awaiting_teacher_reply':
        'Learner submitted sentence, waiting for teacher reply',
      'awaiting_teacher_reply→awaiting_translation':
        'Teacher replied, waiting for translation',
      'awaiting_translation→completed':
        'Translation submitted, loop completed',
      'awaiting_learner_reply→completed':
        'Learner replied, loop completed',
      'awaiting_learner_reply→awaiting_learner_reply':
        'Reply needs revision',
      'pending_sentence→pending_sentence': 'Sentence needs revision',
      'awaiting_teacher_reply→awaiting_teacher_reply':
        'Reply needs revision',
      'awaiting_translation→awaiting_translation': 'Translation needs revision',
    };

    return (
      transitions[`${fromState}→${toState}`] || 'Loop state updated'
    );
  }

  /**
   * Get loop progress percentage (0-100)
   */
  getLoopProgress(state: LoopState): number {
    const progressMap: Record<LoopState, number> = {
      pending_sentence: 10,
      awaiting_teacher_reply: 25,
      awaiting_translation: 50,
      evaluating_translation: 60,
      awaiting_learner_reply: 75,
      evaluating_reply: 85,
      completed: 100,
      expired: 0,
    };

    return progressMap[state] || 0;
  }

  /**
   * Get user-friendly state description
   */
  getStateDescription(
    state: LoopState,
    targetLanguage: string
  ): string {
    const descriptions: Record<LoopState, string> = {
      pending_sentence: `Waiting for you to compose a sentence in ${targetLanguage}`,
      awaiting_teacher_reply: `Waiting for teacher to reply in ${targetLanguage}`,
      awaiting_translation: `Translate teacher's reply to your base language`,
      evaluating_translation: `Evaluating your translation...`,
      awaiting_learner_reply: `Reply to the teacher's message in ${targetLanguage}`,
      evaluating_reply: `Evaluating your response...`,
      completed: 'Loop completed!',
      expired: 'Loop expired (24-hour limit)',
    };

    return descriptions[state];
  }
}

export const learningLoopEngine = new LearningLoopEngine();
