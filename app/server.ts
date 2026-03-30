/**
 * Soldost Application Entry Point
 *
 * This file initializes:
 * 1. Express server + Next.js dashboard
 * 2. Baileys WhatsApp bot (persistent WebSocket)
 * 3. node-cron scheduler for daily tasks
 *
 * All components run in a single process on Railway.
 */

import express, { Express } from 'express';
import next from 'next';
import { env } from '@/lib/config/env';
import { logger } from '@/lib/config/logger';

const PORT = env.PORT;
const isDev = env.NODE_ENV !== 'production';

// Placeholder: These will be implemented in phases 5-9
let baileysBotInitialized = false;
let schedulerInitialized = false;

/**
 * Initialize Baileys WhatsApp Bot
 * Phase 5: Implement this
 */
async function initializeBailey() {
  if (!env.ENABLE_BAILEYS_BOT) {
    logger.info('Baileys bot disabled (ENABLE_BAILEYS_BOT=false)');
    return;
  }

  logger.info('Initializing Baileys bot...');

  try {
    // TODO: Import and initialize actual Baileys client
    // import { initializeBaileys } from '@/lib/whatsapp/baileys-client';
    // await initializeBaileys();

    baileysBotInitialized = true;
    logger.info('✅ Baileys bot initialized');
  } catch (error) {
    logger.error({ error }, '❌ Failed to initialize Baileys bot');
    throw error;
  }
}

/**
 * Initialize node-cron Scheduler
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
