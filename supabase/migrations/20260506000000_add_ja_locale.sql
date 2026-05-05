-- Fix: add 'ja' (Japanese) to locale check constraint on ai_conversations
ALTER TABLE ai_conversations
  DROP CONSTRAINT IF EXISTS ai_conversations_locale_check;

ALTER TABLE ai_conversations
  ADD CONSTRAINT ai_conversations_locale_check
  CHECK (locale IN ('uz', 'ru', 'en', 'ja'));
