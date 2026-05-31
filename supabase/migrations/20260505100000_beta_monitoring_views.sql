-- Beta monitoring views — Supabase Dashboard uchun

-- 1. Umumiy beta statistika
CREATE OR REPLACE VIEW v_beta_stats AS
SELECT
  COUNT(DISTINCT telegram_chat_id)                                          AS total_users,
  COUNT(DISTINCT CASE WHEN c.created_at > now() - interval '1 day'
    THEN telegram_chat_id END)                                              AS active_today,
  COUNT(DISTINCT CASE WHEN c.created_at > now() - interval '7 days'
    THEN telegram_chat_id END)                                              AS active_7d,
  COUNT(DISTINCT CASE WHEN c.locale = 'uz' THEN telegram_chat_id END)      AS users_uz,
  COUNT(DISTINCT CASE WHEN c.locale = 'ru' THEN telegram_chat_id END)      AS users_ru,
  COUNT(DISTINCT CASE WHEN c.locale = 'en' THEN telegram_chat_id END)      AS users_en,
  COUNT(DISTINCT CASE WHEN c.locale = 'ja' THEN telegram_chat_id END)      AS users_ja
FROM ai_conversations c
WHERE platform = 'telegram';
-- 2. Kunlik faollik (so'nggi 14 kun)
CREATE OR REPLACE VIEW v_beta_daily_activity AS
SELECT
  DATE(m.created_at)                                     AS day,
  COUNT(DISTINCT c.telegram_chat_id)                     AS unique_users,
  COUNT(*)                                               AS total_messages,
  COUNT(CASE WHEN m.role = 'user' THEN 1 END)            AS user_messages,
  ROUND(SUM(m.cost_usd)::numeric, 4)                     AS cost_usd,
  ROUND(AVG(m.latency_ms)::numeric, 0)                   AS avg_latency_ms
FROM ai_messages m
JOIN ai_conversations c ON c.id = m.conversation_id
WHERE c.platform = 'telegram'
  AND m.created_at > now() - interval '14 days'
GROUP BY DATE(m.created_at)
ORDER BY day DESC;
-- 3. Feedback statistika
CREATE OR REPLACE VIEW v_beta_feedback AS
SELECT
  COUNT(*)                                               AS total_feedback,
  COUNT(CASE WHEN rating = 1  THEN 1 END)               AS good,
  COUNT(CASE WHEN rating = -1 THEN 1 END)               AS bad,
  ROUND(
    100.0 * COUNT(CASE WHEN rating = 1 THEN 1 END)
    / NULLIF(COUNT(*), 0), 1
  )                                                      AS satisfaction_pct
FROM ai_feedback;
-- 4. Model ishlatilishi va narx
CREATE OR REPLACE VIEW v_beta_model_usage AS
SELECT
  llm_model,
  COUNT(*)                                               AS requests,
  SUM(input_tokens)                                      AS total_input_tokens,
  SUM(output_tokens)                                     AS total_output_tokens,
  ROUND(SUM(cost_usd)::numeric, 4)                       AS total_cost_usd,
  ROUND(AVG(latency_ms)::numeric, 0)                     AS avg_latency_ms
FROM ai_messages
WHERE role = 'assistant' AND llm_model IS NOT NULL
GROUP BY llm_model
ORDER BY requests DESC;
