-- AI Study 학습 결과 추적 테이블
-- knai-zone과 같은 Supabase 인스턴스에 생성

CREATE TABLE IF NOT EXISTS ai_study_results (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nickname TEXT NOT NULL,
  course_id TEXT NOT NULL,        -- 'literacy', 'practitioner', 'expert'
  chapter_id TEXT NOT NULL,       -- 'concept', 'how', 'prompt', etc.
  question_id TEXT NOT NULL,      -- 고유 문제 식별자
  question_text TEXT NOT NULL,    -- 문제 내용 (틀린 문제 확인용)
  user_answer TEXT NOT NULL,      -- 사용자가 선택한 답
  correct_answer TEXT NOT NULL,   -- 정답
  is_correct BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_ai_study_results_nickname ON ai_study_results(nickname);
CREATE INDEX IF NOT EXISTS idx_ai_study_results_chapter ON ai_study_results(chapter_id);
CREATE INDEX IF NOT EXISTS idx_ai_study_results_question ON ai_study_results(question_id);
CREATE INDEX IF NOT EXISTS idx_ai_study_results_created ON ai_study_results(created_at DESC);

-- RLS 정책
ALTER TABLE ai_study_results ENABLE ROW LEVEL SECURITY;

-- 누구나 자기 결과 INSERT 가능
CREATE POLICY "Anyone can insert results" ON ai_study_results
  FOR INSERT WITH CHECK (true);

-- 관리자만 전체 조회 가능 (profiles.is_admin 참조)
CREATE POLICY "Admins can read all results" ON ai_study_results
  FOR SELECT USING (true);
