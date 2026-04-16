import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// SHA-256 해시 (knai-zone과 동일)
export async function sha256(text: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(text)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('')
}

// 관리자 코드 해시 (knai-zone 폴백과 동일)
const ADMIN_HASH = 'a98259fec378da0a51efcc0087ba53ba709f23f6500ed4ecf02ef7fe5accab67'

/** 닉네임으로 프로필 조회 — knai-zone에서 넘어온 사용자 확인 */
export async function getProfileByNickname(nickname: string): Promise<{ nickname: string; is_admin: boolean } | null> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('nickname, is_admin')
      .eq('nickname', nickname)
      .single()
    if (!error && data) return data as { nickname: string; is_admin: boolean }
  } catch { /* 프로필 없음 */ }
  return null
}

/** 관리자 인증 — DB 우선, 폴백 해시 */
export async function verifyAdmin(code: string): Promise<boolean> {
  const hash = await sha256(code)
  try {
    const { data, error } = await supabase.rpc('validate_member_code', { p_code_hash: hash })
    if (!error && data) return (data as { valid: boolean; is_admin?: boolean })?.is_admin === true
  } catch { /* DB 미구성 시 폴백 */ }
  return hash === ADMIN_HASH
}

/** 학습 결과 저장 */
export async function saveQuizResult(data: {
  nickname: string
  course_id: string
  chapter_id: string
  question_id: string
  question_text: string
  user_answer: string
  correct_answer: string
  is_correct: boolean
}) {
  return supabase.from('ai_study_results').insert(data)
}

/** 학습 통계 조회 (관리자용) */
export async function getStudyStats() {
  const { data: results } = await supabase
    .from('ai_study_results')
    .select('*')
    .order('created_at', { ascending: false })

  if (!results || results.length === 0) return { totalAttempts: 0, uniqueUsers: 0, avgCorrectRate: 0, hardestQuestions: [], recentActivity: [] }

  const totalAttempts = results.length
  const uniqueUsers = new Set(results.map(r => r.nickname)).size
  const correctCount = results.filter(r => r.is_correct).length
  const avgCorrectRate = Math.round((correctCount / totalAttempts) * 100)

  // 가장 많이 틀리는 문제 Top 10
  const questionStats: Record<string, { total: number; wrong: number; text: string; chapter: string }> = {}
  results.forEach(r => {
    if (!questionStats[r.question_id]) {
      questionStats[r.question_id] = { total: 0, wrong: 0, text: r.question_text, chapter: r.chapter_id }
    }
    questionStats[r.question_id].total++
    if (!r.is_correct) questionStats[r.question_id].wrong++
  })

  const hardestQuestions = Object.entries(questionStats)
    .map(([id, s]) => ({ id, ...s, wrongRate: Math.round((s.wrong / s.total) * 100) }))
    .filter(q => q.total >= 2)
    .sort((a, b) => b.wrongRate - a.wrongRate)
    .slice(0, 10)

  // 최근 7일 활동
  const now = new Date()
  const recentActivity = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(now)
    date.setDate(date.getDate() - (6 - i))
    const dateStr = date.toISOString().split('T')[0]
    const dayResults = results.filter(r => r.created_at?.startsWith(dateStr))
    return {
      date: dateStr,
      label: `${date.getMonth() + 1}/${date.getDate()}`,
      attempts: dayResults.length,
      users: new Set(dayResults.map(r => r.nickname)).size,
    }
  })

  return { totalAttempts, uniqueUsers, avgCorrectRate, hardestQuestions, recentActivity }
}

/** 코스 완료 기록 저장 */
export async function saveCourseCompletion(data: {
  nickname: string
  course_id: string
  score: number
  total: number
  completed_at?: string
}) {
  return supabase.from('ai_study_completions').upsert(
    { ...data, completed_at: data.completed_at || new Date().toISOString() },
    { onConflict: 'nickname,course_id' }
  )
}

/** 리더보드 조회 */
export async function getLeaderboard() {
  const { data } = await supabase
    .from('ai_study_completions')
    .select('*')
    .order('score', { ascending: false })

  if (!data || data.length === 0) return []

  // 닉네임별 총점 집계
  const userMap: Record<string, { nickname: string; totalScore: number; totalMax: number; courses: string[]; lastActive: string }> = {}
  data.forEach(r => {
    if (!userMap[r.nickname]) {
      userMap[r.nickname] = { nickname: r.nickname, totalScore: 0, totalMax: 0, courses: [], lastActive: r.completed_at }
    }
    userMap[r.nickname].totalScore += r.score
    userMap[r.nickname].totalMax += r.total
    if (!userMap[r.nickname].courses.includes(r.course_id)) {
      userMap[r.nickname].courses.push(r.course_id)
    }
    if (r.completed_at > userMap[r.nickname].lastActive) {
      userMap[r.nickname].lastActive = r.completed_at
    }
  })

  return Object.values(userMap)
    .sort((a, b) => b.totalScore - a.totalScore)
    .slice(0, 20)
}
