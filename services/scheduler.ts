/**
 * Daily Scheduler
 *
 * Phase 9: Implement this
 *
 * Handles daily tasks:
 * 1. Deliver 3 words to each group at configured time
 * 2. Send reminders if learner hasn't started
 * 3. Send reminders if teacher hasn't replied
 * 4. Check for streak breaks and expired loops
 *
 * Uses node-cron for scheduling (runs every minute, checks if any groups have tasks).
 */

import cron from 'node-cron';
import { logger } from '@/lib/config/logger';

/**
 * Start the scheduler
 * This runs continuously and checks for pending tasks every minute
 */
export async function startScheduler(): Promise<void> {
  logger.info('Starting daily scheduler...');

  try {
    /**
     * TODO: Implement in Phase 9
     *
     * Cron job that runs every minute:
     * 1. Query groups with daily_delivery_time <= now() and is_active = true
     * 2. Check if words already delivered today (avoid duplicates)
     * 3. Select 3 words (noun, verb, adj) filtered by difficulty
     * 4. Avoid repeating words from last 30 days
     * 5. Create DailyWordSet record
     * 6. Format word card message
     * 7. Send via Baileys to WhatsApp group
     * 8. Mark as delivered
     */

    // Example structure (pseudo-code):
    // cron.schedule('* * * * *', async () => {
    //   const groups = await findGroupsNeedingDelivery();
    //   for (const group of groups) {
    //     await deliverDailyWords(group);
    //     await sendReminderIfNeeded(group);
    //   }
    // });

    logger.info('✅ Scheduler started');
  } catch (error) {
    logger.error({ error }, '❌ Failed to start scheduler');
    throw error;
  }
}

/**
 * Deliver 3 daily words to a group
 * Called by the scheduler
 */
async function deliverDailyWords(groupId: string): Promise<void> {
  logger.debug({ groupId }, 'Delivering daily words');

  // TODO: Implement in Phase 9
  /**
   * 1. Query group's difficulty level and target language
   * 2. Select 3 random words (noun, verb, adjective):
   *    - Filtered by target_language and difficulty_level
   *    - Exclude words from daily_word_sets for this group from last 30 days
   * 3. Create DailyWordSet record
   * 4. Format message using formatWordCard()
   * 5. Send to WhatsApp group via Baileys
   * 6. Create LearningLoop record for today
   * 7. Log delivery
   */
}

/**
 * Send reminder nudges if loop incomplete
 */
async function sendReminders(): Promise<void> {
  // TODO: Implement in Phase 9
  /**
   * 1. Find loops that started but not completed today
   * 2. Check elapsed time since last expected step
   * 3. Send reminders:
   *    - If learner hasn't started: "Your words are ready! Construct a sentence..."
   *    - If teacher hasn't replied (4+ hours): "Teacher, ready to reply?"
   *    - If loop incomplete by 8 PM: "Complete your loop before midnight!"
   */
}

/**
 * Check for streak breaks
 */
async function checkStreakBreaks(): Promise<void> {
  // TODO: Implement in Phase 9
  /**
   * 1. Find all groups with active streaks
   * 2. Check if last_completed_date is before today
   * 3. If yes and loop not completed by midnight: break streak
   * 4. Send sad notification: "Your streak ended at X days. Start fresh tomorrow!"
   */
}

/**
 * Mark expired loops as expired
 */
async function markExpiredLoops(): Promise<void> {
  // TODO: Implement in Phase 9
  /**
   * 1. Find loops with status != COMPLETED and started_at before today
   * 2. Mark status as EXPIRED
   * 3. Don't count toward streak
   */
}
