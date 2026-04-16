-- AI Study 코스 완료 기록 (리더보드 + 수료증)
CREATE TABLE IF NOT EXISTS ai_study_completions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nickname TEXT NOT NULL,
  course_id TEXT NOT NULL,
  score INTEGER NOT NULL DEFAULT 0,
  total INTEGER NOT NULL DEFAULT 0,
  completed_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(nickname, course_id)
);

CREATE INDEX IF NOT EXISTS idx_completions_nickname ON ai_study_completions(nickname);
CREATE INDEX IF NOT EXISTS idx_completions_score ON ai_study_completions(score DESC);

ALTER TABLE ai_study_completions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can insert completions" ON ai_study_completions FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can read completions" ON ai_study_completions FOR SELECT USING (true);
CREATE POLICY "Users can update own completions" ON ai_study_completions FOR UPDATE USING (true);
