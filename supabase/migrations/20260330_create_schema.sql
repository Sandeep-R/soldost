-- Soldost Database Schema Migration
-- Run: supabase migration new create_schema
-- Then edit this file and run: supabase db push

-- ============================================================================
-- CORE ENTITIES
-- ============================================================================

-- Users Table
CREATE TABLE IF NOT EXISTS public.users (
  user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  whatsapp_phone_number TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  base_language TEXT NOT NULL DEFAULT 'English' CHECK (base_language IN ('English', 'Hindi', 'Tamil', 'Spanish', 'etc')),
  timezone TEXT NOT NULL DEFAULT 'UTC',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Groups Table
CREATE TABLE IF NOT EXISTS public.groups (
  group_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  whatsapp_group_id TEXT UNIQUE NOT NULL,
  learner_id UUID NOT NULL REFERENCES public.users(user_id) ON DELETE CASCADE,
  teacher_id UUID NOT NULL REFERENCES public.users(user_id) ON DELETE CASCADE,
  target_language TEXT NOT NULL DEFAULT 'Tamil' CHECK (target_language IN ('English', 'Hindi', 'Tamil', 'Spanish', 'Japanese', 'Arabic')),
  base_language TEXT NOT NULL DEFAULT 'English' CHECK (base_language IN ('English', 'Hindi', 'Tamil', 'Spanish', 'etc')),
  difficulty_level TEXT NOT NULL DEFAULT 'beginner' CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
  daily_delivery_time TEXT NOT NULL DEFAULT '09:00', -- HH:MM format
  status TEXT NOT NULL DEFAULT 'onboarding' CHECK (status IN ('onboarding', 'active', 'paused', 'completed')),
  is_active BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  CONSTRAINT different_users CHECK (learner_id != teacher_id)
);

-- Words Table (Word Bank)
CREATE TABLE IF NOT EXISTS public.words (
  word_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  language TEXT NOT NULL CHECK (language IN ('English', 'Hindi', 'Tamil', 'Spanish', 'Japanese', 'Arabic')),
  word_text_roman TEXT NOT NULL, -- Roman/Latin script ONLY (no native script)
  meaning TEXT NOT NULL, -- Meaning in base language (Roman script)
  part_of_speech TEXT NOT NULL CHECK (part_of_speech IN ('noun', 'verb', 'adjective')),
  difficulty_level TEXT NOT NULL DEFAULT 'beginner' CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
  example_sentence TEXT, -- Optional example in Roman script
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(language, word_text_roman, part_of_speech)
);

-- Daily Word Sets Table
CREATE TABLE IF NOT EXISTS public.daily_word_sets (
  daily_word_set_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES public.groups(group_id) ON DELETE CASCADE,
  date DATE NOT NULL,
  noun_word_id UUID NOT NULL REFERENCES public.words(word_id),
  verb_word_id UUID NOT NULL REFERENCES public.words(word_id),
  adjective_word_id UUID NOT NULL REFERENCES public.words(word_id),
  delivered_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  whatsapp_message_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(group_id, date)
);

-- ============================================================================
-- LEARNING LOOP ENTITIES
-- ============================================================================

-- Learning Loops Table
CREATE TABLE IF NOT EXISTS public.learning_loops (
  loop_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES public.groups(group_id) ON DELETE CASCADE,
  daily_word_set_id UUID NOT NULL REFERENCES public.daily_word_sets(daily_word_set_id) ON DELETE CASCADE,
  date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending_sentence' CHECK (
    status IN (
      'pending_sentence',
      'pending_teacher_reply',
      'pending_translation',
      'evaluating_translation',
      'pending_learner_reply',
      'evaluating_reply',
      'completed',
      'expired'
    )
  ),
  streak_counted BOOLEAN NOT NULL DEFAULT false,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(group_id, date)
);

-- Learner Sentences Table
CREATE TABLE IF NOT EXISTS public.learner_sentences (
  learner_sentence_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  loop_id UUID NOT NULL REFERENCES public.learning_loops(loop_id) ON DELETE CASCADE,
  sentence_text TEXT NOT NULL,
  words_used UUID[] NOT NULL, -- Array of word_ids used from daily set
  bot_grammar_feedback TEXT, -- Nullable: only if feedback given
  whatsapp_message_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Teacher Replies Table
CREATE TABLE IF NOT EXISTS public.teacher_replies (
  teacher_reply_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  loop_id UUID NOT NULL REFERENCES public.learning_loops(loop_id) ON DELETE CASCADE,
  reply_text TEXT NOT NULL, -- In target language, Roman script
  whatsapp_message_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Translation Attempts Table
CREATE TABLE IF NOT EXISTS public.translation_attempts (
  translation_attempt_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  loop_id UUID NOT NULL REFERENCES public.learning_loops(loop_id) ON DELETE CASCADE,
  attempt_number INT NOT NULL DEFAULT 1,
  learner_translation_text TEXT NOT NULL, -- Learner's translation attempt
  bot_reference_translation TEXT NOT NULL, -- Correct translation
  evaluation_result TEXT NOT NULL CHECK (evaluation_result IN ('correct', 'partially_correct', 'incorrect')),
  bot_feedback_text TEXT NOT NULL,
  whatsapp_message_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Learner Replies Table
CREATE TABLE IF NOT EXISTS public.learner_replies (
  learner_reply_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  loop_id UUID NOT NULL REFERENCES public.learning_loops(loop_id) ON DELETE CASCADE,
  reply_text TEXT NOT NULL, -- In target language, Roman script
  bot_corrected_text TEXT, -- Nullable: only if errors
  bot_feedback_text TEXT,
  has_errors BOOLEAN NOT NULL DEFAULT false,
  whatsapp_message_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ============================================================================
-- STREAK & GAMIFICATION
-- ============================================================================

-- Streaks Table
CREATE TABLE IF NOT EXISTS public.streaks (
  streak_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL UNIQUE REFERENCES public.groups(group_id) ON DELETE CASCADE,
  current_streak INT NOT NULL DEFAULT 0,
  longest_streak INT NOT NULL DEFAULT 0,
  last_completed_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ============================================================================
-- LOGGING & MONITORING
-- ============================================================================

-- LLM Calls Log Table (for cost tracking)
CREATE TABLE IF NOT EXISTS public.llm_calls_log (
  call_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID REFERENCES public.groups(group_id) ON DELETE SET NULL,
  provider TEXT NOT NULL CHECK (provider IN ('anthropic', 'openai', 'other')),
  model TEXT NOT NULL,
  tokens_in INT NOT NULL,
  tokens_out INT NOT NULL,
  cost_cents INT, -- Cost in cents
  latency_ms INT, -- Latency in milliseconds
  success BOOLEAN NOT NULL DEFAULT true,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ============================================================================
-- INDEXES for performance
-- ============================================================================

CREATE INDEX idx_groups_learner_id ON public.groups(learner_id);
CREATE INDEX idx_groups_teacher_id ON public.groups(teacher_id);
CREATE INDEX idx_groups_is_active ON public.groups(is_active);
CREATE INDEX idx_learning_loops_group_id_date ON public.learning_loops(group_id, date);
CREATE INDEX idx_learning_loops_status ON public.learning_loops(status);
CREATE INDEX idx_daily_word_sets_group_date ON public.daily_word_sets(group_id, date);
CREATE INDEX idx_words_language_difficulty ON public.words(language, difficulty_level);
CREATE INDEX idx_llm_calls_group_created ON public.llm_calls_log(group_id, created_at);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_loops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learner_sentences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teacher_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.translation_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learner_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.llm_calls_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.words ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_word_sets ENABLE ROW LEVEL SECURITY;

-- Users can read their own record
CREATE POLICY "users_read_own" ON public.users
  FOR SELECT USING (auth.uid() = auth_id);

-- Groups are visible to learner and teacher
CREATE POLICY "groups_visible_to_members" ON public.groups
  FOR SELECT USING (
    auth.uid() IN (
      SELECT auth_id FROM public.users WHERE user_id IN (learner_id, teacher_id)
    )
  );

-- Learning loops accessible to group members
CREATE POLICY "learning_loops_visible_to_members" ON public.learning_loops
  FOR SELECT USING (
    group_id IN (
      SELECT group_id FROM public.groups WHERE
        learner_id = (SELECT user_id FROM public.users WHERE auth_id = auth.uid()) OR
        teacher_id = (SELECT user_id FROM public.users WHERE auth_id = auth.uid())
    )
  );

-- Related loop records inherit group-level permissions
CREATE POLICY "learner_sentences_visible_to_members" ON public.learner_sentences
  FOR SELECT USING (
    loop_id IN (
      SELECT loop_id FROM public.learning_loops WHERE
        group_id IN (
          SELECT group_id FROM public.groups WHERE
            learner_id = (SELECT user_id FROM public.users WHERE auth_id = auth.uid()) OR
            teacher_id = (SELECT user_id FROM public.users WHERE auth_id = auth.uid())
        )
    )
  );

CREATE POLICY "teacher_replies_visible_to_members" ON public.teacher_replies
  FOR SELECT USING (
    loop_id IN (
      SELECT loop_id FROM public.learning_loops WHERE
        group_id IN (
          SELECT group_id FROM public.groups WHERE
            learner_id = (SELECT user_id FROM public.users WHERE auth_id = auth.uid()) OR
            teacher_id = (SELECT user_id FROM public.users WHERE auth_id = auth.uid())
        )
    )
  );

CREATE POLICY "translation_attempts_visible_to_members" ON public.translation_attempts
  FOR SELECT USING (
    loop_id IN (
      SELECT loop_id FROM public.learning_loops WHERE
        group_id IN (
          SELECT group_id FROM public.groups WHERE
            learner_id = (SELECT user_id FROM public.users WHERE auth_id = auth.uid()) OR
            teacher_id = (SELECT user_id FROM public.users WHERE auth_id = auth.uid())
        )
    )
  );

CREATE POLICY "learner_replies_visible_to_members" ON public.learner_replies
  FOR SELECT USING (
    loop_id IN (
      SELECT loop_id FROM public.learning_loops WHERE
        group_id IN (
          SELECT group_id FROM public.groups WHERE
            learner_id = (SELECT user_id FROM public.users WHERE auth_id = auth.uid()) OR
            teacher_id = (SELECT user_id FROM public.users WHERE auth_id = auth.uid())
        )
    )
  );

CREATE POLICY "streaks_visible_to_members" ON public.streaks
  FOR SELECT USING (
    group_id IN (
      SELECT group_id FROM public.groups WHERE
        learner_id = (SELECT user_id FROM public.users WHERE auth_id = auth.uid()) OR
        teacher_id = (SELECT user_id FROM public.users WHERE auth_id = auth.uid())
    )
  );

CREATE POLICY "daily_word_sets_visible_to_members" ON public.daily_word_sets
  FOR SELECT USING (
    group_id IN (
      SELECT group_id FROM public.groups WHERE
        learner_id = (SELECT user_id FROM public.users WHERE auth_id = auth.uid()) OR
        teacher_id = (SELECT user_id FROM public.users WHERE auth_id = auth.uid())
    )
  );

-- Words are readable by all authenticated users
CREATE POLICY "words_readable" ON public.words
  FOR SELECT USING (true);

-- LLM logs readable by group members and admins
CREATE POLICY "llm_logs_visible_to_group" ON public.llm_calls_log
  FOR SELECT USING (
    group_id IS NULL OR group_id IN (
      SELECT group_id FROM public.groups WHERE
        learner_id = (SELECT user_id FROM public.users WHERE auth_id = auth.uid()) OR
        teacher_id = (SELECT user_id FROM public.users WHERE auth_id = auth.uid())
    )
  );

-- ============================================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to tables with updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_groups_updated_at BEFORE UPDATE ON public.groups
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_learning_loops_updated_at BEFORE UPDATE ON public.learning_loops
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_streaks_updated_at BEFORE UPDATE ON public.streaks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Sync auth.users.updated_at when users table updates
CREATE OR REPLACE FUNCTION public.sync_auth_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE auth.users SET updated_at = now() WHERE id = NEW.auth_id;
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER sync_users_to_auth AFTER UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION sync_auth_updated_at();
