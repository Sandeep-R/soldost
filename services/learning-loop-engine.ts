/**
 * Learning Loop Engine
 *
 * Phase 6: Implement this
 *
 * Orchestrates the learning loop state machine.
 * Routes incoming messages to correct handlers and manages state transitions.
 *
 * State flow:
 * IDLE → AWAITING_SENTENCE → AWAITING_TEACHER_REPLY → AWAITING_TRANSLATION
 *     → EVALUATING_TRANSLATION → AWAITING_LEARNER_REPLY → EVALUATING_REPLY
 *     → COMPLETED → STREAK_UPDATED → IDLE (next day)
 */

import { logger } from '@/lib/config/logger';
import type { Database } from '@/lib/supabase/types';

type LearningLoop = Database['public']['Tables']['learning_loops']['Row'];
type LearningLoopStatus = LearningLoop['status'];

/**
 * Main coordinator for learning loop transitions
 */
class LearningLoopEngine {
  /**
   * Process an incoming message and route to appropriate handler
   *
   * @param message - The incoming message text
   * @param sender_role - 'learner' or 'teacher'
   * @param group_id - The learning group ID
   * @param loop_id - The current learning loop ID
   */
  async processMessage(
    message: string,
    sender_role: 'learner' | 'teacher',
    group_id: string,
    loop_id: string
  ): Promise<void> {
    try {
      // TODO: Implement in Phase 6
      logger.debug(
        { sender_role, group_id, loop_id },
        'Processing incoming message'
      );

      /**
       * Steps to implement:
       * 1. Query current loop state from Supabase
       * 2. Validate sender role matches expected role
       * 3. Route to appropriate handler based on state
       * 4. Update loop state in Supabase
       * 5. Send WhatsApp response
       */
    } catch (error) {
      logger.error({ error }, 'Failed to process message');
      throw error;
    }
  }

  /**
   * Handle learner sentence submission
   * State: AWAITING_SENTENCE → PENDING_TEACHER_REPLY
   */
  async handleLearnerSentence(
    loop_id: string,
    sentence: string,
    group_id: string
  ): Promise<void> {
    logger.debug({ loop_id }, 'Handling learner sentence');

    // TODO: Implement in Phase 6
    /**
     * 1. Validate that at least 1 of the 3 daily words is used
     * 2. Optional: Run grammar check (LLM Tier 2)
     * 3. Store sentence in learner_sentences table
     * 4. Transition state to AWAITING_TEACHER_REPLY
     * 5. Send confirmation message to WhatsApp
     */
  }

  /**
   * Handle teacher reply
   * State: PENDING_TEACHER_REPLY → PENDING_TRANSLATION
   */
  async handleTeacherReply(
    loop_id: string,
    reply: string,
    group_id: string
  ): Promise<void> {
    logger.debug({ loop_id }, 'Handling teacher reply');

    // TODO: Implement in Phase 6
    /**
     * 1. Store reply in teacher_replies table
     * 2. Transition state to PENDING_TRANSLATION
     * 3. Send "Now translate what the teacher said" prompt
     */
  }

  /**
   * Handle learner translation attempt
   * State: PENDING_TRANSLATION → EVALUATING_TRANSLATION
   */
  async handleTranslationAttempt(
    loop_id: string,
    translation: string,
    group_id: string,
    attempt_number: number
  ): Promise<void> {
    logger.debug({ loop_id, attempt_number }, 'Handling translation attempt');

    // TODO: Implement in Phase 6
    /**
     * 1. Get teacher's reply from teacher_replies table
     * 2. Call LLM to evaluate translation accuracy
     * 3. Store attempt in translation_attempts table
     * 4. If correct/partial: transition to PENDING_LEARNER_REPLY
     * 5. If incorrect: allow re-attempt (up to 3 times)
     * 6. Send feedback message
     */
  }

  /**
   * Handle learner final reply
   * State: PENDING_LEARNER_REPLY → EVALUATING_REPLY
   */
  async handleLearnerReply(
    loop_id: string,
    reply: string,
    group_id: string
  ): Promise<void> {
    logger.debug({ loop_id }, 'Handling learner reply');

    // TODO: Implement in Phase 6
    /**
     * 1. Call LLM to check grammar/structure
     * 2. Store reply in learner_replies table
     * 3. Transition state to COMPLETED
     * 4. Update streak
     * 5. Send completion message
     */
  }

  /**
   * Complete the loop and update streak
   */
  async completeLoop(loop_id: string, group_id: string): Promise<void> {
    logger.debug({ loop_id, group_id }, 'Completing learning loop');

    // TODO: Implement in Phase 6
    /**
     * 1. Update loop status to COMPLETED
     * 2. Increment streak in streaks table
     * 3. Check if streak hit milestone (7, 30, 100 days)
     * 4. Send celebration message if milestone
     * 5. Emit event for dashboard realtime update
     */
  }
}

export const learningLoopEngine = new LearningLoopEngine();
