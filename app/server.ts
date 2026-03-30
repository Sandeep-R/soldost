/**
 * Soldost Application Entry Point
 *
 * This file initializes:
 * 1. Express server + Next.js dashboard
 * 2. Baileys WhatsApp bot (persistent WebSocket)
 * 3. node-cron scheduler for daily tasks
 * 4. LLM service and learning loop engine
 *
 * All components run in a single process on Railway.
 */

import express, { Express, Response } from 'express';
import next from 'next';
import { env } from '@/lib/config/env';
import { logger } from '@/lib/config/logger';
import { llmService } from '@/services/llm-service';
import { learningLoopEngine } from '@/services/learning-loop-engine';
import { baileysBot } from '@/lib/whatsapp/baileys-integration';
import cron from 'node-cron';

const PORT = env.PORT;
const isDev = env.NODE_ENV !== 'production';

let baileysBotInitialized = false;
let schedulerInitialized = false;
let llmServiceInitialized = false;

/**
 * Initialize all services
 */
async function initializeServices() {
  try {
    logger.info('🚀 Initializing Soldost services...');

    // 1. Initialize LLM Service
    logger.info('Initializing LLM service...');
    await llmService.initialize();
    llmServiceInitialized = true;
    logger.info('✅ LLM service initialized');

    // 2. Initialize Learning Loop Engine
    logger.info('Initializing learning loop engine...');
    await learningLoopEngine.initialize();
    logger.info('✅ Learning loop engine initialized');

    // 3. Initialize Baileys WhatsApp Bot
    if (env.ENABLE_BAILEYS_BOT) {
      logger.info('Initializing Baileys WhatsApp bot...');
      try {
        await baileysBot.initialize();
        baileysBotInitialized = true;
        logger.info('✅ Baileys bot initialized');
      } catch (error) {
        logger.warn(
          { error },
          '⚠️ Failed to initialize Baileys bot, continuing without WhatsApp integration'
        );
      }
    } else {
      logger.info('ℹ️ Baileys bot disabled (ENABLE_BAILEYS_BOT=false)');
    }

    // 4. Initialize Scheduler
    if (env.ENABLE_SCHEDULER) {
      logger.info('Initializing scheduler...');
      await initializeScheduler();
      schedulerInitialized = true;
      logger.info('✅ Scheduler initialized');
    } else {
      logger.info('ℹ️ Scheduler disabled (ENABLE_SCHEDULER=false)');
    }

    logger.info('🎉 All services initialized successfully');
  } catch (error) {
    logger.error({ error }, '❌ Failed to initialize services');
    throw error;
  }
}
 * Phase 9: Implement this
 */
async function initializeScheduler() {
  if (!env.ENABLE_SCHEDULER) {
    logger.info('Scheduler disabled (ENABLE_SCHEDULER=false)');
    return;
  }

  logger.info('Initializing scheduler...');

  try {
    // TODO: Import and start scheduler
    // import { startScheduler } from '@/services/scheduler';
    // await startScheduler();

    schedulerInitialized = true;
    logger.info('✅ Scheduler initialized');
  } catch (error) {
    logger.error({ error }, '❌ Failed to initialize scheduler');
    throw error;
  }
}

/**
 * Health check endpoint
 * Used by Railway to monitor the app
 */
function setupHealthCheck(app: Express) {
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      components: {
        baileys: baileysBotInitialized ? 'ready' : 'disabled',
        scheduler: schedulerInitialized ? 'ready' : 'disabled',
      },
    });
  });
}

/**
 * Main application startup
 */
async function main() {
  try {
    logger.info(`🚀 Starting Soldost (env: ${env.NODE_ENV})`);

    // Initialize Next.js
    const nextApp = next({
      dev: isDev,
      dir: process.cwd(),
    });

    const handle = nextApp.getRequestHandler();

    await nextApp.prepare();
    logger.info('✅ Next.js prepared');

    // Create Express server
    const app = express();

    // Middleware
    app.use(express.json());
    app.use(express.text());

    // Health check
    setupHealthCheck(app);

    // Next.js request handler (fallback)
    app.get('*', (req, res) => {
      return handle(req, res);
    });

    // Initialize bot and scheduler (in parallel)
    await Promise.all([initializeBailey(), initializeScheduler()]);

    // Start server
    const server = app.listen(PORT, () => {
      logger.info(`📍 Server running on http://localhost:${PORT}`);
      logger.info(`🌐 Dashboard: http://localhost:${PORT}/`);
      logger.info(`🤖 Bot: ${baileysBotInitialized ? 'Connected' : 'Disabled'}`);
      logger.info(
        `⏰ Scheduler: ${schedulerInitialized ? 'Running' : 'Disabled'}`
      );
    });

    // Graceful shutdown
    process.on('SIGTERM', () => {
      logger.info('SIGTERM received, shutting down gracefully...');
      server.close(() => {
        logger.info('✅ Server closed');
        process.exit(0);
      });
    });

    process.on('SIGINT', () => {
      logger.info('SIGINT received, shutting down gracefully...');
      server.close(() => {
        logger.info('✅ Server closed');
        process.exit(0);
      });
    });
  } catch (error) {
    logger.error({ error }, '❌ Failed to start application');
    process.exit(1);
  }
}

// Start the app
main();
