/**
 * Baileys WhatsApp Integration
 *
 * Connects Soldost to WhatsApp using the Baileys library
 * Handles:
 * - Bot authentication and session management
 * - Message receiving and parsing
 * - Group creation and message routing
 * - Scheduled reminders and daily deliveries
 */

import makeWASocket, {
  AuthenticationCreds,
  AuthenticationState,
  ConnectionState,
  DisconnectReason,
  fetchLatestBaileysVersion,
  WAMessage,
} from 'baileys';
import { logger } from '@/lib/config/logger';
import { env } from '@/lib/config/env';

/**
 * WhatsApp message handler
 */
export interface WhatsAppMessage {
  from: string;
  to: string;
  body: string;
  timestamp: Date;
  messageId: string;
  isGroup: boolean;
  groupJid?: string;
  senderJid: string;
}

/**
 * Baileys Bot Manager
 */
export class BaileysBot {
  private socket: ReturnType<typeof makeWASocket> | null = null;
  private authState: AuthenticationState | null = null;
  private phoneNumber: string;
  private isConnecting = false;

  constructor(phoneNumber: string = env.BOT_PHONE_NUMBER ?? '') {
    this.phoneNumber = phoneNumber;
  }

  /**
   * Initialize bot connection
   */
  async initialize(): Promise<void> {
    try {
      logger.info({ phoneNumber: this.phoneNumber }, 'Initializing Baileys bot');

      // Get latest Baileys version
      const { version, isLatest } = await fetchLatestBaileysVersion();
      logger.info(
        { version, isLatest },
        'Baileys version fetched'
      );

      // TODO: Session storage would be implemented with Supabase or file system

      // Create socket
      this.socket = makeWASocket({
        version,
        logger: logger.child({ module: 'baileys' }),
        syncFullHistory: false,
        printQRInTerminal: true,
        auth: this.authState as AuthenticationState,
        browser: ['Ubuntu', 'Chrome', '120'] as [string, string, string],
      });

      this.setupHandlers();

      logger.info('Baileys bot initialized successfully');
    } catch (error) {
      logger.error({ error }, 'Failed to initialize Baileys bot');
      throw error;
    }
  }

  /**
   * Setup message and connection handlers
   */
  private setupHandlers(): void {
    if (!this.socket) return;

    this.socket.ev.on(
      'connection.update',
      (update) => this.handleConnectionUpdate(update)
    );

    this.socket.ev.on(
      'messages.upsert',
      (m) => { void this.handleMessagesUpsert(m); }
    );

    this.socket.ev.on(
      'creds.update',
      (update) => this.handleCredsUpdate(update)
    );

    logger.info('Baileys handlers configured');
  }

  /**
   * Handle connection status updates
   */
  private handleConnectionUpdate(update: Partial<ConnectionState>): void {
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      logger.info('📱 Scan QR code to connect to WhatsApp');
    }

    if (connection === 'open') {
      logger.info('✅ WhatsApp bot connected successfully');
      this.isConnecting = false;
    }

    if (connection === 'connecting') {
      logger.info('🔄 WhatsApp bot connecting...');
      this.isConnecting = true;
    }

    if (connection === 'close') {
      this.isConnecting = false;

      const statusCode = (lastDisconnect?.error as { output?: { statusCode?: number } } | undefined)?.output?.statusCode;
      const shouldReconnect = statusCode !== DisconnectReason.loggedOut;

      if (shouldReconnect) {
        logger.warn({ reason: statusCode }, '❌ WhatsApp disconnected, reconnecting...');
        setTimeout(() => { void this.initialize(); }, 3000);
      } else {
        logger.error('❌ WhatsApp connection logged out');
      }
    }
  }

  /**
   * Handle incoming/modified messages
   */
  private async handleMessagesUpsert(m: {
    messages: WAMessage[];
    type: string;
  }): Promise<void> {
    const { messages, type } = m;

    if (type === 'notify') {
      for (const msg of messages) {
        try {
          const message = this.parseMessage(msg);
          if (message) {
            await this.processMessage(message);
          }
        } catch (error) {
          logger.error({ error }, 'Failed to process message');
        }
      }
    }
  }

  /**
   * Parse Baileys message to standardized format
   */
  private parseMessage(msg: WAMessage): WhatsAppMessage | null {
    try {
      if (!msg.message) return null;

      const jid = msg.key.remoteJid ?? '';
      const isGroup = jid.includes('@g.us');
      const senderJid = msg.key.fromMe ? jid : (msg.key.participant ?? jid);
      const text = msg.message?.conversation ?? msg.message?.extendedTextMessage?.text ?? '';

      if (!text) return null;

      return {
        from: senderJid,
        to: jid,
        body: text,
        timestamp: new Date(((msg.messageTimestamp as number) || Math.floor(Date.now() / 1000)) * 1000),
        messageId: msg.key.id ?? '',
        isGroup,
        groupJid: isGroup ? jid : undefined,
        senderJid,
      };
    } catch (error) {
      logger.error({ error }, 'Failed to parse message');
      return null;
    }
  }

  /**
   * Process incoming message and route to learning loop
   */
  private async processMessage(message: WhatsAppMessage): Promise<void> {
    logger.debug(
      {
        from: message.from,
        body: message.body.slice(0, 50),
        isGroup: message.isGroup,
      },
      'Processing incoming message'
    );

    if (!message.isGroup) {
      logger.debug(
        'Ignoring non-group message (learning loops run in WhatsApp groups only)'
      );
      return;
    }

    try {
      // TODO: Phase 5 Full Implementation
      logger.info(
        { groupJid: message.groupJid, senderJid: message.senderJid },
        'Message would be processed in full Phase 5 implementation'
      );
    } catch (error) {
      logger.error({ error }, 'Failed to process learning loop message');
      await this.sendMessage(
        message.groupJid ?? message.to,
        '❌ Sorry, there was an error processing your message. Please try again.'
      );
    }
  }

  /**
   * Handle credential updates (session persistence)
   */
  private handleCredsUpdate(_update: Partial<AuthenticationCreds>): void {
    logger.debug('WhatsApp credentials updated');
    // TODO: Persist credentials to Supabase for session recovery
  }

  /**
   * Send message to WhatsApp
   */
  async sendMessage(to: string, text: string): Promise<string | null> {
    try {
      if (!this.socket) {
        throw new Error('Socket not connected');
      }

      logger.debug({ to, text: text.slice(0, 50) }, 'Sending WhatsApp message');

      const result = await this.socket.sendMessage(to, { text });

      return result?.key.id ?? null;
    } catch (error) {
      logger.error({ error, to }, 'Failed to send WhatsApp message');
      return null;
    }
  }

  /**
   * Get bot connection status
   */
  getStatus(): {
    connected: boolean;
    connecting: boolean;
    jid?: string;
  } {
    return {
      connected: (this.socket?.ws as { readyState?: number } | undefined)?.readyState === 1,
      connecting: this.isConnecting,
      jid: this.socket?.user?.id,
    };
  }

  /**
   * Disconnect bot
   */
  async disconnect(): Promise<void> {
    if (this.socket) {
      this.socket.end(undefined);
      this.socket = null;
      logger.info('Baileys bot disconnected');
    }
  }
}

// Export singleton instance
export const baileysBot = new BaileysBot();
