"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  Brain, Cpu, Zap, Shield, Sparkles, ChevronRight,
  User, FileText, Target, ArrowRight, ArrowLeft,
  RotateCcw, Play, CheckCircle2, XCircle, AlertTriangle,
  Lightbulb, TrendingUp, Gauge, BookOpen, Gamepad2,
  ThumbsUp, ThumbsDown, Eye, Network, RefreshCw,
  MessageSquare, Bot, Globe, Send, Blocks,
  CircuitBoard, Binary, Trophy, Flame, Star, Award, Lock, X,
  ChevronDown, Layers, SlidersHorizontal, Settings, BarChart3, Workflow,
  Users, LogOut, KeyRound
} from "lucide-react";
import { verifyAdmin, getStudyStats, saveQuizResult, getProfileByNickname, saveCourseCompletion, getLeaderboard } from "@/lib/supabase";

// ─── Design Tokens ────────────────────────────────────
const T = {
  concept: {
    accent: "#7c3aed", dim: "rgba(124,58,237,0.08)",
    border: "rgba(124,58,237,0.2)",
    grad: "linear-gradient(135deg,#6d28d9,#a78bfa)",
    glow: "rgba(124,58,237,0.2)",
  },
  how: {
    accent: "#0284c7", dim: "rgba(2,132,199,0.08)",
    border: "rgba(2,132,199,0.2)",
    grad: "linear-gradient(135deg,#0369a1,#38bdf8)",
    glow: "rgba(2,132,199,0.2)",
  },
  apply: {
    accent: "#ea580c", dim: "rgba(234,88,12,0.08)",
    border: "rgba(234,88,12,0.2)",
    grad: "linear-gradient(135deg,#c2410c,#fb923c)",
    glow: "rgba(234,88,12,0.2)",
  },
  prompt: {
    accent: "#059669", dim: "rgba(5,150,105,0.08)",
    border: "rgba(5,150,105,0.2)",
    grad: "linear-gradient(135deg,#047857,#34d399)",
    glow: "rgba(5,150,105,0.2)",
  },
  ethics: {
    accent: "#dc2626", dim: "rgba(220,38,38,0.08)",
    border: "rgba(220,38,38,0.2)",
    grad: "linear-gradient(135deg,#b91c1c,#f87171)",
    glow: "rgba(220,38,38,0.2)",
  },
  expert: {
    accent: "#a855f7", dim: "rgba(168,85,247,0.08)",
    border: "rgba(168,85,247,0.2)",
    grad: "linear-gradient(135deg,#7c3aed,#c084fc)",
    glow: "rgba(168,85,247,0.2)",
  },
};

// ─── Shared UI Components ─────────────────────────────
const DeepDive = ({ children, defaultOpen = false }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="mt-6">
      <button onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-4 py-2.5 w-full rounded-xl text-sm font-medium transition-all border border-dashed border-gray-300 hover:border-gray-400 hover:bg-gray-50 text-gray-500 hover:text-gray-700">
        <Layers size={14} />
        <span>{open ? "딥다이브 접기" : "실제로는 이렇게 동작합니다"}</span>
        <ChevronDown size={14} className={`ml-auto transition-transform duration-300 ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="mt-4 p-5 bg-gradient-to-br from-slate-50 to-gray-50 rounded-xl border border-gray-200 space-y-4" style={{ animation: "fadeIn 0.4s ease-out" }}>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
            <span className="text-[10px] font-bold tracking-widest uppercase text-blue-600">DEEP DIVE</span>
          </div>
          {children}
        </div>
      )}
    </div>
  );
};

const Card = ({ children, t, game = false, className = "" }) => (
  <div
    className={`rounded-2xl overflow-hidden ${className}`}
    style={{
      background: "#ffffff",
      border: `1px solid ${game && t ? t.border : "rgba(0,0,0,0.07)"}`,
      boxShadow: game && t
        ? `0 4px 24px ${t.glow}, 0 1px 4px rgba(0,0,0,0.06)`
        : "0 2px 16px rgba(0,0,0,0.07)",
    }}
  >
    {game && t && <div className="h-[3px]" style={{ background: t.grad }} />}
    <div className="p-6 sm:p-8">{children}</div>
  </div>
);

const SecHead = ({ icon: Icon, label, t }) => (
  <div className="flex items-center gap-3 mb-6">
    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
      style={{ background: t.dim, border: `1px solid ${t.border}` }}>
      <Icon size={18} style={{ color: t.accent }} />
    </div>
    <div>
      <p className="text-[10px] font-black tracking-[0.2em] uppercase mb-0.5"
        style={{ color: t.accent }}>CONCEPT</p>
      <h3 className="text-base font-bold text-slate-800">{label}</h3>
    </div>
  </div>
);

const GameHead = ({ icon: Icon, label, t }) => (
  <div className="flex items-center gap-3 mb-6">
    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
      style={{ background: t.grad, boxShadow: `0 4px 12px ${t.glow}` }}>
      <Icon size={18} className="text-white" />
    </div>
    <div className="flex-1">
      <p className="text-[10px] font-black tracking-[0.2em] uppercase mb-0.5"
        style={{ color: t.accent }}>INTERACTIVE GAME</p>
      <h3 className="text-base font-bold text-slate-800">{label}</h3>
    </div>
    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
      style={{ background: t.dim, border: `1px solid ${t.border}` }}>
      <Gamepad2 size={12} style={{ color: t.accent }} />
      <span className="text-[10px] font-bold" style={{ color: t.accent }}>PLAY</span>
    </div>
  </div>
);

const PBtn = ({ children, onClick, disabled, t, className = "", icon: Icon }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-white transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed ${className}`}
    style={{
      background: disabled ? "#cbd5e1" : t.grad,
      boxShadow: disabled ? "none" : `0 4px 16px ${t.glow}`,
    }}
    onMouseEnter={e => { if (!disabled) { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = `0 8px 24px ${t.glow}`; } }}
    onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = disabled ? "none" : `0 4px 16px ${t.glow}`; }}
  >
    {Icon && <Icon size={15} />}{children}
  </button>
);

const GBtn = ({ children, onClick, className = "" }) => (
  <button
    onClick={onClick}
    className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-slate-500 hover:text-slate-800 transition-all duration-200 ${className}`}
    style={{ background: "#f8fafc", border: "1px solid rgba(0,0,0,0.09)" }}
    onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(0,0,0,0.04)"; e.currentTarget.style.background = "#f1f5f9"; }}
    onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(0,0,0,0.09)"; e.currentTarget.style.background = "#f8fafc"; }}
  >
    {children}
  </button>
);

const ScoreBadge = ({ score, total, t }) => {
  const pct = Math.round((score / total) * 100);
  const variant = pct === 100 ? "perfect" : pct >= 70 ? "good" : pct >= 50 ? "ok" : "low";
  const colors = {
    perfect: { bg: "rgba(5,150,105,0.1)", border: "rgba(5,150,105,0.3)", text: "#059669" },
    good: { bg: "rgba(217,119,6,0.1)", border: "rgba(217,119,6,0.3)", text: "#d97706" },
    ok: { bg: "rgba(234,88,12,0.1)", border: "rgba(234,88,12,0.3)", text: "#ea580c" },
    low: { bg: "rgba(220,38,38,0.1)", border: "rgba(220,38,38,0.3)", text: "#dc2626" },
  };
  const c = colors[variant];
  return (
    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl"
      style={{ background: c.bg, border: `1px solid ${c.border}` }}>
      {pct === 100 && <Trophy size={14} style={{ color: c.text }} />}
      <span className="text-sm font-black" style={{ color: c.text }}>{score}/{total}</span>
      {pct === 100 && <span className="text-xs font-bold" style={{ color: c.text }}>퍼펙트!</span>}
    </div>
  );
};

// ─── TAB 1: AI Concepts & History ─────────────────────
const Tab1 = ({ onScore }) => {
  const t = T.concept;
  const [openConcept, setOpenConcept] = useState(null);
  const [activeEra, setActiveEra] = useState(null);
  const [activeMilestone, setActiveMilestone] = useState(null);

  // Quiz game state
  const [qIndex, setQIndex] = useState(0);
  const [selected, setSelected] = useState(null);
  const [results, setResults] = useState([]);
  const [gameOver, setGameOver] = useState(false);

  // ── 개념 데이터 ──
  const concepts = [
    {
      id: "algo", num: "01", name: "알고리즘", emoji: "📋", tag: "기초", tagColor: "#64748b",
      tagline: "문제를 푸는 단계별 레시피",
      desc: "컴퓨터가 문제를 어떻게 풀지 정해놓은 순서와 규칙의 집합입니다. 라면 끓이는 조리법처럼, 단계를 순서대로 따라가면 원하는 결과가 나옵니다. 모든 AI 기술의 가장 기초가 됩니다.",
      example: "신호등이 빨간색이면 멈추고, 초록색이면 가라 → IF-THEN 알고리즘",
    },
    {
      id: "prog", num: "02", name: "프로그램 (규칙 기반 AI)", emoji: "🖥️", tag: "기초", tagColor: "#64748b",
      tagline: "사람이 모든 규칙을 직접 코드로 작성",
      desc: "알고리즘을 코드로 구현한 것입니다. 초기 AI는 사람이 모든 규칙을 직접 작성했습니다. 빠르고 정확하지만, 예상 밖의 상황이 오면 속수무책입니다. 유연성이 없는 것이 가장 큰 한계입니다.",
      example: "스팸 필터 (특정 단어가 있으면 차단), 계산기, 신호등 제어 시스템",
    },
    {
      id: "ml", num: "03", name: "머신러닝 (ML)", emoji: "📊", tag: "핵심", tagColor: "#818cf8",
      tagline: "데이터를 주면 스스로 패턴을 찾는 AI",
      desc: "사람이 규칙을 짜는 대신, 수많은 데이터를 보여주면 AI가 스스로 패턴을 학습합니다. 신입사원에게 수천 개의 과거 보고서를 주고 요령을 터득하게 하는 것과 같습니다. 데이터 품질이 성능을 결정합니다.",
      example: "전력 수요 예측, 고장 설비 탐지, 스팸 자동 분류, 영화 추천",
    },
    {
      id: "dl", num: "04", name: "딥러닝 (DL)", emoji: "🧠", tag: "핵심", tagColor: "#60a5fa",
      tagline: "뇌 신경망을 모방한 고급 머신러닝",
      desc: "머신러닝의 진화형입니다. 인간 뇌의 뉴런 연결을 모방해 수십~수백 층의 레이어로 복잡한 패턴을 스스로 학습합니다. 데이터와 컴퓨팅 파워가 많을수록 강력해지며, 이미지·음성 인식에서 인간을 능가합니다.",
      example: "얼굴 인식, 자율주행, 음성 비서(Siri·Bixby), 번역기",
    },
    {
      id: "ai", num: "05", name: "AI (인공지능)", emoji: "🤖", tag: "개념", tagColor: "#a78bfa",
      tagline: "인간의 지능을 모방하는 모든 기술의 총칭",
      desc: "알고리즘부터 머신러닝, 딥러닝, 생성형 AI까지 모두 포함하는 가장 넓은 개념입니다. '사람처럼 생각하고 판단하고 학습하는 모든 컴퓨터 프로그램'이 AI입니다. 좁은 AI(특정 작업)와 넓은 AI(범용)로 구분합니다.",
      example: "시리, 알렉사, 자율주행차, 바둑 AI, ChatGPT 모두 AI",
    },
    {
      id: "llm", num: "06", name: "LLM (대형 언어 모델)", emoji: "💬", tag: "최신", tagColor: "#34d399",
      tagline: "수천억 단어를 학습한 언어 전문가 AI",
      desc: "Large Language Model. 인터넷의 방대한 텍스트를 학습해 사람처럼 글을 읽고 씁니다. 트랜스포머 아키텍처 기반이며, 파라미터(신경망 가중치) 수가 많을수록 더 지능적입니다. 현재 AI 붐의 핵심 기술입니다.",
      example: "GPT-4(OpenAI), Claude(Anthropic), Gemini(Google), Llama(Meta)",
    },
    {
      id: "agent", num: "07", name: "AI 에이전트 (Agent)", emoji: "🦾", tag: "최신", tagColor: "#fb923c",
      tagline: "목표를 주면 스스로 계획하고 행동하는 AI",
      desc: "단순히 질문에 답하는 것을 넘어, 도구(검색·코드실행·파일조작·API호출)를 사용하며 여러 단계를 스스로 계획해 임무를 완수합니다. LLM에 '손발'이 생긴 것입니다. 복잡한 업무 자동화가 가능합니다.",
      example: "리서치 에이전트(자동 조사·정리), 코딩 에이전트, 이메일 자동 처리 AI",
    },
    {
      id: "agi", num: "08", name: "AGI (범용 인공지능)", emoji: "🌐", tag: "미래", tagColor: "#fbbf24",
      tagline: "인간과 동등하게 모든 분야를 수행하는 AI",
      desc: "Artificial General Intelligence. 현재 AI는 특정 분야만 잘하는 '좁은 AI'입니다. AGI는 인간처럼 어떤 지적 과제든 수행하며 새로운 분야도 스스로 학습합니다. 아직 달성되지 않았으며 2030년대를 목표로 연구 중입니다.",
      example: "의사·변호사·과학자 역할을 동시에, 새로운 분야도 혼자 터득",
    },
    {
      id: "asi", num: "09", name: "ASI (초인공지능)", emoji: "🚀", tag: "미래", tagColor: "#f87171",
      tagline: "모든 면에서 인간을 초월하는 AI",
      desc: "Artificial Super Intelligence. AGI를 넘어 창의성·감성·과학적 발견 등 모든 분야에서 최고의 인간 전문가를 압도하는 수준의 AI입니다. SF영화의 AI가 여기에 해당합니다. 달성 시 인류에 미치는 영향은 예측 불가능합니다.",
      example: "아직 존재하지 않음 — 이론적 개념 (닉 보스트롬의 '수퍼인텔리전스' 참고)",
    },
  ];

  const eras = [
    {
      id: "rule", period: "1950–1980s", label: "규칙 기반 AI", emoji: "🧩",
      color: "#a78bfa", desc: "사람이 모든 규칙을 직접 코딩. IF-THEN 논리로만 동작했습니다.",
      milestones: [
        { year: 1950, event: "튜링 테스트 제안", who: "앨런 튜링", desc: "'기계가 생각할 수 있는가?'를 판별하는 테스트 제안. AI의 씨앗이 뿌려지다.", icon: "🧠" },
        { year: 1956, event: "AI 탄생 선언", who: "존 매카시", desc: "다트머스 회의에서 'Artificial Intelligence' 용어 최초 사용. AI라는 학문 분야 공식 탄생.", icon: "🎓" },
        { year: 1966, event: "최초 챗봇 ELIZA 개발", who: "조지프 바이젠바움", desc: "규칙 기반으로 사람과 대화하는 최초의 챗봇. 하지만 규칙 이외의 상황엔 속수무책.", icon: "💬" },
      ],
    },
    {
      id: "ml", period: "1980s–2010s", label: "머신러닝 시대", emoji: "📊",
      color: "#818cf8", desc: "데이터를 주면 AI가 스스로 패턴을 학습. 사람이 규칙을 짤 필요가 없어졌습니다.",
      milestones: [
        { year: 1989, event: "역전파 알고리즘 대중화", who: "제프리 힌튼", desc: "신경망 학습의 핵심 알고리즘이 실용화. 이후 딥러닝의 아버지로 불리게 됨.", icon: "⚙️" },
        { year: 1997, event: "딥블루, 체스 챔피언 격파", who: "IBM", desc: "가리 카스파로프(세계 체스 챔피언)를 AI가 최초로 이김. 인류에게 큰 충격.", icon: "♟️" },
        { year: 2006, event: "딥러닝 기반 연구 재점화", who: "제프리 힌튼 팀", desc: "오랜 'AI 겨울'을 끝내고 심층 신경망이 다시 주목받기 시작.", icon: "🔥" },
      ],
    },
    {
      id: "dl", period: "2010s", label: "딥러닝 혁명", emoji: "⚡",
      color: "#60a5fa", desc: "수백 층의 인공 신경망으로 이미지·음성 인식에서 인간을 뛰어넘기 시작합니다.",
      milestones: [
        { year: 2012, event: "알렉스넷, 이미지 인식 혁명", who: "제프리 힌튼 팀", desc: "이미지 인식 대회 오류율을 절반으로 줄이며 딥러닝의 시대 개막. 업계 판도가 뒤집힘.", icon: "👁️" },
        { year: 2016, event: "알파고, 이세돌 4:1 격파", who: "구글 딥마인드", desc: "복잡성이 무한에 가까운 바둑에서 AI가 세계 챔피언을 이김. 전 세계 충격.", icon: "⚫" },
        { year: 2017, event: "트랜스포머 논문 발표", who: "구글 리서치", desc: "'Attention is All You Need' 논문으로 현재 모든 LLM의 기반이 되는 아키텍처 탄생.", icon: "🔬" },
      ],
    },
    {
      id: "genai", period: "2020s~", label: "생성형 AI 시대", emoji: "✨",
      color: "#f472b6", desc: "글·그림·코드를 스스로 '창작'하는 AI. 지금 우리가 매일 사용하는 AI입니다.",
      milestones: [
        { year: 2020, event: "GPT-3 공개", who: "OpenAI", desc: "1,750억 파라미터의 초거대 언어모델 등장. 사람과 구분하기 어려운 글쓰기 능력 시연.", icon: "📝" },
        { year: 2022, event: "ChatGPT 출시, AI 대중화", who: "OpenAI", desc: "출시 5일 만에 100만 사용자, 2개월에 1억 명 달성. AI가 일반인의 손으로.", icon: "🚀" },
        { year: 2024, event: "AI 춘추전국시대", who: "Anthropic·Google·Meta 등", desc: "Claude, Gemini 등 다양한 AI가 등장. 멀티모달·에이전트 AI로 진화 중.", icon: "🌍" },
      ],
    },
  ];

  const activeEraData = eras.find(e => e.id === activeEra);

  const selectMilestone = (eraId, msIdx) => {
    const key = `${eraId}-${msIdx}`;
    setActiveMilestone(prev => prev === key ? null : key);
  };

  // Quiz (개념 + 역사 혼합)
  const questions = [
    { q: "사람이 모든 규칙을 직접 코드로 작성하는 방식의 AI는?", opts: ["머신러닝", "딥러닝", "규칙 기반 AI", "LLM"], answer: 2, emoji: "🖥️" },
    { q: "데이터를 주면 스스로 패턴을 찾아 학습하는 AI 기술은?", opts: ["알고리즘", "머신러닝", "AGI", "AI 에이전트"], answer: 1, emoji: "📊" },
    { q: "인간 뇌의 뉴런 연결을 모방해 만든 AI 기술은?", opts: ["규칙 기반 AI", "머신러닝", "딥러닝", "프로그램"], answer: 2, emoji: "🧠" },
    { q: "GPT-4, Claude, Gemini가 해당하는 AI 유형은?", opts: ["AGI", "알고리즘", "규칙 기반 AI", "LLM"], answer: 3, emoji: "💬" },
    { q: "목표를 주면 도구를 사용해 스스로 계획·실행하는 AI는?", opts: ["LLM", "AI 에이전트", "딥러닝", "머신러닝"], answer: 1, emoji: "🦾" },
    { q: "인간과 동등하게 모든 분야를 수행하는 AI의 이름은?", opts: ["ASI", "AGI", "LLM", "AI 에이전트"], answer: 1, emoji: "🌐" },
    { q: "모든 면에서 인간을 초월하는 이론적 AI 개념은?", opts: ["AGI", "GPT-4", "ASI", "딥러닝"], answer: 2, emoji: "🚀" },
    { q: "바둑 세계 챔피언 이세돌을 이긴 AI의 이름은?", opts: ["딥블루", "AlexNet", "알파고", "GPT-3"], answer: 2, emoji: "⚫" },
    { q: "현재 ChatGPT·Claude의 기반이 되는 핵심 아키텍처는?", opts: ["CNN", "RNN", "LSTM", "트랜스포머"], answer: 3, emoji: "🔬" },
    { q: "ChatGPT가 100만 사용자를 달성하는 데 걸린 시간은?", opts: ["5일", "5주", "5개월", "5년"], answer: 0, emoji: "🚀" },
    { q: "딥러닝이 이미지 인식 대회에서 처음 혁명적 성과를 낸 해는?", opts: ["2008년", "2010년", "2012년", "2016년"], answer: 2, emoji: "👁️" },
    { q: "'Artificial Intelligence'라는 단어가 처음 등장한 회의는?", opts: ["MIT 세미나", "다트머스 회의 1956", "구글 I/O 2000", "NeurIPS 1987"], answer: 1, emoji: "🎓" },
  ];

  const handleAnswer = (optIdx) => {
    if (selected !== null) return;
    setSelected(optIdx);
    const correct = optIdx === questions[qIndex].answer;
    setTimeout(() => {
      setResults(p => [...p, correct]);
      if (qIndex + 1 >= questions.length) {
        setGameOver(true);
        const finalScore = [...results, correct].filter(Boolean).length;
        onScore?.("concept", finalScore, questions.length);
      } else {
        setQIndex(p => p + 1);
        setSelected(null);
      }
    }, 900);
  };

  const resetQuiz = () => { setQIndex(0); setSelected(null); setResults([]); setGameOver(false); };
  const quizScore = results.filter(Boolean).length;
  const curQ = questions[qIndex];

  return (
    <div className="space-y-6">
      {/* ── Card 1: AI 주요 개념 설명 ── */}
      <Card t={t}>
        <SecHead icon={Brain} label="AI 주요 개념 설명 — 기초부터 미래까지" t={t} />
        <p className="text-sm text-slate-500 mb-5">각 항목을 클릭하면 쉬운 설명과 예시를 볼 수 있습니다.</p>

        {/* 스펙트럼 바 */}
        <div className="flex items-center gap-1 mb-5 text-[10px] font-bold">
          {["기초", "기초", "핵심", "핵심", "개념", "최신", "최신", "미래", "미래"].map((tag, i) => {
            const colors = { 기초: "#64748b", 핵심: "#818cf8", 개념: "#a78bfa", 최신: "#34d399", 미래: "#f87171" };
            return (
              <div key={i} className="flex-1 h-1.5 rounded-full" style={{ background: colors[tag] }} />
            );
          })}
        </div>
        <div className="flex justify-between text-[10px] font-semibold text-slate-600 mb-5 -mt-2">
          <span>기초 기술</span><span>최신 AI</span><span>미래 개념</span>
        </div>

        <div className="space-y-1.5">
          {concepts.map((c) => {
            const isOpen = openConcept === c.id;
            return (
              <div key={c.id}
                onClick={() => setOpenConcept(isOpen ? null : c.id)}
                className="rounded-xl overflow-hidden cursor-pointer transition-all duration-300"
                style={{
                  background: isOpen ? `${c.tagColor}10` : "#f8fafc",
                  border: `1px solid ${isOpen ? c.tagColor + "40" : "rgba(0,0,0,0.07)"}`,
                }}>
                <div className="flex items-center gap-3 p-3.5">
                  {/* 번호 */}
                  <span className="text-[10px] font-black font-mono w-6 shrink-0 text-center"
                    style={{ color: c.tagColor }}>{c.num}</span>
                  {/* 이모지 */}
                  <span className="text-lg shrink-0">{c.emoji}</span>
                  {/* 이름 + 태그라인 */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-bold text-slate-800">{c.name}</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                        style={{ background: c.tagColor + "20", color: c.tagColor }}>{c.tag}</span>
                    </div>
                    {!isOpen && (
                      <p className="text-xs text-slate-500 mt-0.5 truncate">{c.tagline}</p>
                    )}
                  </div>
                  {/* 화살표 */}
                  <ChevronRight size={14} className="text-slate-600 shrink-0 transition-transform duration-300"
                    style={{ transform: isOpen ? "rotate(90deg)" : "rotate(0)" }} />
                </div>
                {/* 펼쳐진 내용 */}
                <div className={`overflow-hidden transition-all duration-400 ${isOpen ? "max-h-60" : "max-h-0"}`}>
                  <div className="px-4 pb-4 pl-[60px] space-y-2" style={{ animation: isOpen ? "fadeIn 0.3s ease-out" : "" }}>
                    <p className="text-xs font-bold mb-1" style={{ color: c.tagColor }}>"{c.tagline}"</p>
                    <p className="text-sm text-slate-700 leading-relaxed">{c.desc}</p>
                    <div className="rounded-lg p-2.5 mt-2" style={{ background: "#f1f5f9", border: "1px solid rgba(0,0,0,0.07)" }}>
                      <p className="text-[10px] font-bold text-slate-500 mb-1">💡 실제 예시</p>
                      <p className="text-xs text-slate-400">{c.example}</p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* ── Card 2: AI 기술 역사 (기존 타임라인, 이동) ── */}
      <Card t={t}>
        <SecHead icon={BookOpen} label="AI 기술 역사 — 시대별 타임라인" t={t} />
        <p className="text-sm text-slate-500 mb-6">시대를 클릭해 주요 사건을 확인하세요.</p>

        {/* Era selector */}
        <div className="relative mb-6">
          {/* 연결선 */}
          <div className="absolute top-6 left-6 right-6 h-px hidden sm:block"
            style={{ background: "linear-gradient(90deg, #a78bfa, #818cf8, #60a5fa, #f472b6)" }} />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {eras.map((era) => {
              const isActive = activeEra === era.id;
              return (
                <button key={era.id}
                  onClick={() => { setActiveEra(isActive ? null : era.id); setActiveMilestone(null); }}
                  className="relative flex flex-col items-center gap-2 p-4 rounded-xl transition-all duration-300 text-center"
                  style={{
                    background: isActive ? `${era.color}18` : "#f8fafc",
                    border: `1px solid ${isActive ? era.color + "50" : "rgba(0,0,0,0.07)"}`,
                    boxShadow: isActive ? `0 0 24px ${era.color}30` : "none",
                    transform: isActive ? "translateY(-2px)" : "translateY(0)",
                  }}>
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-lg z-10"
                    style={{ background: isActive ? era.color : "#e2e8f0", border: `2px solid ${isActive ? era.color : "rgba(0,0,0,0.08)"}`, boxShadow: isActive ? `0 0 16px ${era.color}60` : "none" }}>
                    {era.emoji}
                  </div>
                  <div>
                    <p className="text-[10px] font-bold mb-0.5" style={{ color: isActive ? era.color : "#475569" }}>{era.period}</p>
                    <p className="text-xs font-bold" style={{ color: isActive ? era.color : "#64748b" }}>{era.label}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Era detail */}
        {activeEraData && (
          <div style={{ animation: "fadeIn 0.3s ease-out" }}>
            <div className="rounded-xl p-4 mb-4"
              style={{ background: `${activeEraData.color}10`, border: `1px solid ${activeEraData.color}30` }}>
              <p className="text-sm text-slate-600">{activeEraData.desc}</p>
            </div>
            <div className="space-y-2">
              {activeEraData.milestones.map((ms, i) => {
                const key = `${activeEraData.id}-${i}`;
                const isOpen = activeMilestone === key;
                return (
                  <div key={i}
                    onClick={() => selectMilestone(activeEraData.id, i)}
                    className="rounded-xl overflow-hidden cursor-pointer transition-all duration-300"
                    style={{
                      background: isOpen ? `${activeEraData.color}10` : "#f8fafc",
                      border: `1px solid ${isOpen ? activeEraData.color + "40" : "rgba(0,0,0,0.07)"}`,
                    }}>
                    <div className="flex items-center gap-3 p-4">
                      <div className="w-12 text-center shrink-0">
                        <span className="text-xs font-black font-mono" style={{ color: activeEraData.color }}>{ms.year}</span>
                      </div>
                      <div className="w-px h-8 shrink-0" style={{ background: activeEraData.color + "40" }} />
                      <span className="text-lg shrink-0">{ms.icon}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-slate-800">{ms.event}</p>
                        <p className="text-xs text-slate-500">{ms.who}</p>
                      </div>
                      <ChevronRight size={14} className="text-slate-600 shrink-0 transition-transform duration-300"
                        style={{ transform: isOpen ? "rotate(90deg)" : "rotate(0)" }} />
                    </div>
                    <div className={`overflow-hidden transition-all duration-400 ${isOpen ? "max-h-24" : "max-h-0"}`}>
                      <div className="px-4 pb-4 pl-[72px]">
                        <p className="text-sm text-slate-700 leading-relaxed">{ms.desc}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {!activeEra && (
          <div className="text-center py-6 text-slate-600 text-sm">
            위의 시대를 클릭해서 주요 사건을 살펴보세요 👆
          </div>
        )}
      </Card>

      {/* ── 게임: AI 역사 퀴즈 ── */}
      <Card t={t} game>
        <GameHead icon={Gamepad2} label="AI 개념 & 역사 퀴즈 — 12문제 도전!" t={t} />

        {!gameOver ? (
          <div className="space-y-5">
            {/* Progress */}
            <div className="flex items-center gap-3">
              <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: "#e2e8f0" }}>
                <div className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${(qIndex / questions.length) * 100}%`, background: t.grad }} />
              </div>
              <span className="text-xs font-mono font-bold shrink-0" style={{ color: t.accent }}>
                {qIndex + 1}/{questions.length}
              </span>
            </div>

            {/* Score streak */}
            <div className="flex gap-1.5">
              {questions.map((_, i) => (
                <div key={i} className="flex-1 h-1.5 rounded-full transition-all duration-300"
                  style={{
                    background: i < results.length
                      ? (results[i] ? "#34d399" : "#f87171")
                      : i === qIndex ? t.accent : "rgba(0,0,0,0.06)",
                  }} />
              ))}
            </div>

            {/* Question */}
            <div className="rounded-xl p-5 text-center"
              style={{ background: t.dim, border: `1px solid ${t.border}` }}>
              <div className="text-3xl mb-3">{curQ.emoji}</div>
              <p className="text-base font-bold text-slate-800 leading-snug">{curQ.q}</p>
            </div>

            {/* Options */}
            <div className="grid grid-cols-2 gap-2">
              {curQ.opts.map((opt, i) => {
                const isSelected = selected === i;
                const isCorrect = i === curQ.answer;
                const showResult = selected !== null;
                let bg = "#f8fafc";
                let border = "rgba(0,0,0,0.08)";
                let color = "#64748b";
                let shadow = "none";
                if (showResult) {
                  if (isCorrect) { bg = "rgba(52,211,153,0.12)"; border = "rgba(52,211,153,0.4)"; color = "#34d399"; shadow = "0 0 16px rgba(52,211,153,0.2)"; }
                  else if (isSelected) { bg = "rgba(248,113,113,0.12)"; border = "rgba(248,113,113,0.4)"; color = "#f87171"; }
                } else if (isSelected) {
                  bg = t.dim; border = t.border; color = t.accent; shadow = `0 0 12px ${t.glow}`;
                }
                return (
                  <button key={i}
                    onClick={() => handleAnswer(i)}
                    disabled={selected !== null}
                    className="p-3 rounded-xl text-sm font-semibold text-left transition-all duration-200"
                    style={{ background: bg, border: `1px solid ${border}`, color, boxShadow: shadow }}>
                    <span className="font-mono text-xs mr-2 opacity-50">{String.fromCharCode(65 + i)}.</span>
                    {opt}
                    {showResult && isCorrect && <CheckCircle2 size={13} className="inline ml-1.5" />}
                    {showResult && isSelected && !isCorrect && <XCircle size={13} className="inline ml-1.5" />}
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="space-y-5" style={{ animation: "fadeIn 0.4s ease-out" }}>
            <div className="p-6 rounded-xl text-center"
              style={{
                background: quizScore >= 5 ? "rgba(52,211,153,0.08)" : quizScore >= 3 ? "rgba(251,191,36,0.08)" : "rgba(248,113,113,0.08)",
                border: `1px solid ${quizScore >= 5 ? "rgba(52,211,153,0.3)" : quizScore >= 3 ? "rgba(251,191,36,0.3)" : "rgba(248,113,113,0.3)"}`,
              }}>
              {quizScore === questions.length && <Trophy size={32} style={{ color: "#34d399" }} className="mx-auto mb-3" />}
              <div className="text-5xl font-black text-slate-800 mb-1">
                {quizScore}<span className="text-2xl text-slate-500">/{questions.length}</span>
              </div>
              <p className="font-bold text-lg mb-1" style={{ color: quizScore >= 10 ? "#34d399" : quizScore >= 7 ? "#fbbf24" : "#f87171" }}>
                {quizScore === questions.length ? "🏆 AI 전문가 인증!" : quizScore >= 10 ? "🎉 훌륭해요!" : quizScore >= 7 ? "👍 잘 했어요!" : "📚 개념 카드를 다시 보세요!"}
              </p>
              {/* Answer review */}
              <div className="flex justify-center gap-2 mt-3">
                {results.map((r, i) => (
                  <div key={i} className="w-7 h-7 rounded-full flex items-center justify-center"
                    style={{ background: r ? "rgba(52,211,153,0.2)" : "rgba(248,113,113,0.2)" }}>
                    {r ? <CheckCircle2 size={13} style={{ color: "#34d399" }} /> : <XCircle size={13} style={{ color: "#f87171" }} />}
                  </div>
                ))}
              </div>
            </div>
            <div className="flex gap-3">
              <GBtn onClick={resetQuiz}><RotateCcw size={13} />다시 풀기</GBtn>
              <GBtn onClick={() => setOpenConcept("algo")}>
                <BookOpen size={13} />개념 복습
              </GBtn>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

// ─── TAB 2: How AI Works ──────────────────────────────
const Tab2 = ({ onScore }) => {
  const t = T.how;
  const [step, setStep] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [gamePhase, setGamePhase] = useState("attention");
  const [selectedWords, setSelectedWords] = useState(new Set());
  const [selectedPrediction, setSelectedPrediction] = useState(null);
  const [timeLeft, setTimeLeft] = useState(100);
  const [gameScore, setGameScore] = useState(null);
  const timerRef = useRef(null);

  const steps = [
    {
      title: "토큰화 (Tokenization)", subtitle: "말 토막 내기", icon: Blocks,
      content: () => {
        const [tokenized, setTokenized] = useState(false);
        return (
          <div className="space-y-5">
            <div className="rounded-xl p-5" style={{ background: "rgba(56,189,248,0.06)", border: "1px solid rgba(56,189,248,0.15)" }}>
              <p className="text-xs text-slate-500 mb-3">👤 김대리가 말합니다:</p>
              {!tokenized ? (
                <p className="text-xl font-bold text-slate-800">"저 내일 오후에..."</p>
              ) : (
                <div className="flex gap-2 flex-wrap">
                  {["저", "내일", "오후에", "..."].map((tk, i) => (
                    <span key={i} className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-mono font-bold text-slate-800"
                      style={{
                        background: t.dim, border: `1px solid ${t.border}`,
                        boxShadow: `0 0 12px ${t.glow}`,
                        animation: `slideUp 0.4s ease-out ${i * 100}ms both`,
                      }}>
                      {tk}
                    </span>
                  ))}
                </div>
              )}
            </div>
            <PBtn t={t} onClick={() => setTokenized(!tokenized)}>
              {tokenized ? "원문 보기" : "✂️ 토큰화 실행"}
            </PBtn>
            <p className="text-sm text-slate-600 leading-relaxed">AI는 문장을 한꺼번에 이해하지 못합니다. 텍스트를 작은 조각(토큰)으로 쪼개는 것이 첫 단계입니다.</p>
            <DeepDive>
              <p className="text-sm text-gray-700 font-medium">BPE (Byte Pair Encoding) — 실제 토큰화 과정</p>
              <p className="text-xs text-gray-500">GPT, Claude 등 대부분의 LLM은 BPE 알고리즘을 사용합니다. 단어를 통째로 외우는 게 아니라, 자주 나오는 글자 조합을 학습해서 효율적으로 쪼갭니다.</p>
              <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-2">
                <div className="space-y-1.5">
                  {[
                    { step: "1. 원문", tokens: ["저 내일 오후에 반차 쓰겠습니다"], color: "gray" },
                    { step: "2. 공백 분리", tokens: ["저", "내일", "오후에", "반차", "쓰겠습니다"], color: "blue" },
                    { step: "3. 서브워드 (BPE)", tokens: ["저", "내일", "오후", "에", "반차", "쓰겠", "습니다"], color: "purple" },
                    { step: "4. 토큰 ID", tokens: ["3842", "1057", "8923", "45", "6721", "9102", "234"], color: "emerald" },
                  ].map((row, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span className="text-[10px] text-gray-400 font-mono w-28 shrink-0">{row.step}</span>
                      <div className="flex gap-1 flex-wrap">
                        {row.tokens.map((tk, j) => (
                          <span key={j} className={`px-2 py-1 rounded text-[10px] font-mono font-semibold bg-${row.color}-50 text-${row.color}-700 border border-${row.color}-200`}
                            style={{ background: row.color === "gray" ? "#f9fafb" : row.color === "blue" ? "rgba(59,130,246,0.08)" : row.color === "purple" ? "rgba(168,85,247,0.08)" : "rgba(16,185,129,0.08)", color: row.color === "gray" ? "#374151" : row.color === "blue" ? "#1d4ed8" : row.color === "purple" ? "#7c3aed" : "#059669", borderColor: row.color === "gray" ? "#e5e7eb" : row.color === "blue" ? "rgba(59,130,246,0.2)" : row.color === "purple" ? "rgba(168,85,247,0.2)" : "rgba(16,185,129,0.2)" }}>{tk}</span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
                <p className="text-xs text-amber-800"><strong>왜 서브워드로 쪼갤까?</strong> "쓰겠습니다"를 통째로 외우면 사전이 수십만 개 필요합니다. "쓰겠" + "습니다"로 나누면, "습니다"는 다른 문장에서도 재활용됩니다.</p>
              </div>
              <div className="p-3 bg-gray-100 rounded-lg">
                <p className="text-xs text-gray-600"><strong>📊 실제 수치:</strong> GPT-4 토큰 사전 ≈ 100,000개. 한국어 한 글자 ≈ 1.5~2토큰 소모. "저 내일 오후에 반차 쓰겠습니다" ≈ 7토큰.</p>
              </div>
            </DeepDive>
          </div>
        );
      }
    },
    {
      title: "임베딩 (Embedding)", subtitle: "수치화", icon: Binary,
      content: () => {
        const [show, setShow] = useState(false);
        const embs = [
          { token: "저", scores: [{ label: "주어 확률", val: 9 }, { label: "긴급도", val: 2 }] },
          { token: "내일", scores: [{ label: "시간 관련", val: 9 }, { label: "퇴근 임박", val: 3 }] },
          { token: "오후에", scores: [{ label: "퇴근 임박", val: 8 }, { label: "피곤함", val: 5 }] },
        ];
        return (
          <div className="space-y-5">
            <p className="text-sm text-slate-500">각 단어에 수치(벡터)를 부여합니다. 컴퓨터가 이해할 수 있는 숫자로 변환하는 과정입니다.</p>
            <div className="rounded-xl p-4 space-y-3" style={{ background: "#f8fafc", border: "1px solid rgba(0,0,0,0.07)" }}>
              {embs.map((e, i) => (
                <div key={i} className="flex items-center gap-3 rounded-lg p-3"
                  style={{ background: "rgba(56,189,248,0.06)", border: "1px solid rgba(56,189,248,0.12)" }}>
                  <span className="font-mono font-bold px-3 py-1.5 rounded-lg text-sm text-slate-800"
                    style={{ background: t.dim, border: `1px solid ${t.border}` }}>{e.token}</span>
                  <ArrowRight size={12} className="text-slate-600 shrink-0" />
                  <div className="flex-1 flex gap-3 flex-wrap">
                    {show && e.scores.map((s, j) => (
                      <div key={j} className="flex items-center gap-1.5 text-xs"
                        style={{ animation: `fadeIn 0.3s ease-out ${(i * 2 + j) * 80}ms both` }}>
                        <span className="text-slate-500">{s.label}</span>
                        <div className="w-14 h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(0,0,0,0.08)" }}>
                          <div className="h-full rounded-full transition-all duration-700"
                            style={{ width: `${s.val * 10}%`, background: t.grad }} />
                        </div>
                        <span className="font-mono font-bold" style={{ color: t.accent }}>{s.val}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <PBtn t={t} onClick={() => setShow(!show)}>{show ? "숨기기" : "📊 수치화 시작"}</PBtn>
            <DeepDive>
              <p className="text-sm text-gray-700 font-medium">벡터 공간 — 단어가 숫자 좌표로 바뀌는 원리</p>
              <p className="text-xs text-gray-500">임베딩은 각 단어를 수백~수천 차원의 숫자 벡터로 변환합니다. 의미가 비슷한 단어는 가까이, 다른 단어는 멀리 배치됩니다.</p>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { name: "차원 #1: 시간 관련도", desc: "'내일', '오후'는 높고, '저'는 낮음" },
                  { name: "차원 #2: 감정 강도", desc: "'한숨', '피곤'이 높은 값" },
                  { name: "차원 #3: 행위 의도", desc: "'반차', '퇴사'에 강하게 반응" },
                  { name: "차원 #4: 주어 여부", desc: "'저', '나'만 높은 차원" },
                ].map((d, i) => (
                  <div key={i} className="p-2.5 bg-white rounded-lg border border-gray-200">
                    <p className="text-[10px] font-semibold text-gray-700">{d.name}</p>
                    <p className="text-[10px] text-gray-400">{d.desc}</p>
                  </div>
                ))}
              </div>
              <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
                <p className="text-xs text-amber-800"><strong>핵심 통찰:</strong> "반차"와 "퇴근"이 벡터 공간에서 가까운 건, AI가 수억 개의 문장에서 비슷한 맥락에 등장하는 것을 학습했기 때문입니다.</p>
              </div>
              <div className="p-3 bg-gray-100 rounded-lg">
                <p className="text-xs text-gray-600"><strong>📊 실제 수치:</strong> GPT-3는 12,288차원, Claude는 약 8,192차원 임베딩. Word2Vec: vec("왕") - vec("남자") + vec("여자") ≈ vec("여왕").</p>
              </div>
            </DeepDive>
          </div>
        );
      }
    },
    {
      title: "셀프 어텐션 (Self-Attention)", subtitle: "문맥 파악", icon: Eye,
      content: () => {
        const [show, setShow] = useState(false);
        return (
          <div className="space-y-5">
            <p className="text-sm text-slate-500">단어들 사이의 관계와 숨겨진 문맥을 파악합니다.</p>
            <div className="rounded-xl p-5" style={{ background: "rgba(56,189,248,0.06)", border: "1px solid rgba(56,189,248,0.15)" }}>
              <div className="flex items-center justify-center gap-3 mb-5 flex-wrap">
                {["저", "내일", "오후에"].map((w, i) => (
                  <span key={i} className="px-4 py-2 rounded-lg font-bold text-sm transition-all duration-500"
                    style={{
                      background: show && w === "오후에" ? t.grad : t.dim,
                      color: show && w === "오후에" ? "white" : "#1e293b",
                      border: `1px solid ${show && w === "오후에" ? t.accent : t.border}`,
                      boxShadow: show && w === "오후에" ? `0 0 20px ${t.glow}` : "none",
                      transform: show && w === "오후에" ? "scale(1.1)" : "scale(1)",
                    }}>{w}</span>
                ))}
              </div>
              {show && (
                <div className="space-y-2" style={{ animation: "fadeIn 0.5s ease-out" }}>
                  <div className="flex items-center gap-3 p-3 rounded-lg" style={{ background: "#f8fafc" }}>
                    <span>💨</span>
                    <span className="text-sm text-slate-600">어제 김대리가 한숨을 쉬었다는 사실!</span>
                  </div>
                  <div className="p-3 rounded-lg" style={{ background: "rgba(248,113,113,0.1)", border: "1px solid rgba(248,113,113,0.25)" }}>
                    <p className="text-sm font-bold" style={{ color: "#f87171" }}>
                      🔗 "한숨" + "오후" → 어텐션 가중치 <span className="font-mono">0.92</span> (매우 강함)
                    </p>
                  </div>
                </div>
              )}
            </div>
            <PBtn t={t} onClick={() => setShow(!show)}>{show ? "초기화" : "🔗 문맥 연결 시작"}</PBtn>
            <DeepDive>
              <p className="text-sm text-gray-700 font-medium">Q·K·V와 멀티헤드 어텐션</p>
              <p className="text-xs text-gray-500">부장님이 동시에 여러 관점으로 분석하듯, AI도 여러 "헤드"가 각기 다른 관계를 포착합니다.</p>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { name: "Q (Query)", desc: "\"내가 알고 싶은 것\"", color: "#2563eb", bg: "rgba(37,99,235,0.06)" },
                  { name: "K (Key)", desc: "\"내가 가진 정보 태그\"", color: "#059669", bg: "rgba(5,150,105,0.06)" },
                  { name: "V (Value)", desc: "\"실제 정보 내용\"", color: "#d97706", bg: "rgba(217,119,6,0.06)" },
                ].map((item, i) => (
                  <div key={i} className="p-2.5 rounded-lg border" style={{ background: item.bg, borderColor: item.color + "30" }}>
                    <p className="text-[10px] font-bold" style={{ color: item.color }}>{item.name}</p>
                    <p className="text-[10px] text-gray-500">{item.desc}</p>
                  </div>
                ))}
              </div>
              <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
                <p className="text-xs text-amber-800"><strong>왜 멀티헤드?</strong> GPT-4는 128개, Claude는 64~128개 헤드가 동시 분석. 하나의 헤드만으로는 시간 관계는 보되 감정 신호를 놓칠 수 있습니다.</p>
              </div>
              <div className="p-3 bg-gray-100 rounded-lg">
                <p className="text-xs text-gray-600"><strong>📊 수식:</strong> Attention(Q,K,V) = softmax(QK<sup>T</sup>/√d<sub>k</sub>)V. 토큰 N개면 N² 번 연산 — 긴 문장이 비싼 이유입니다.</p>
              </div>
            </DeepDive>
          </div>
        );
      }
    },
    {
      title: "순전파 & FFN", subtitle: "신경망 통과", icon: CircuitBoard,
      content: () => {
        const [running, setRunning] = useState(false);
        const [active, setActive] = useState(-1);
        const layers = ["입력", "은닉 1", "은닉 2", "은닉 3", "출력"];
        useEffect(() => {
          if (running) {
            let i = 0;
            const iv = setInterval(() => { setActive(i++); if (i >= layers.length) clearInterval(iv); }, 500);
            return () => clearInterval(iv);
          } else setActive(-1);
        }, [running]);
        return (
          <div className="space-y-5">
            <p className="text-sm text-slate-500">정보들이 신경망 레이어를 차례로 통과하며 결론을 향해 전진합니다.</p>
            <div className="rounded-xl p-5" style={{ background: "rgba(56,189,248,0.06)", border: "1px solid rgba(56,189,248,0.15)" }}>
              <div className="flex items-center gap-1.5 sm:gap-2">
                {layers.map((l, i) => (
                  <div key={i} className="flex items-center gap-1.5 sm:gap-2 flex-1">
                    <div className="flex-1 h-16 rounded-xl flex items-center justify-center text-xs font-bold transition-all duration-500"
                      style={{
                        background: i <= active ? t.grad : "#f1f5f9",
                        color: i <= active ? "white" : "#475569",
                        border: `1px solid ${i <= active ? t.accent : "rgba(0,0,0,0.08)"}`,
                        boxShadow: i <= active ? `0 0 20px ${t.glow}` : "none",
                        transform: i === active ? "scale(1.05)" : "scale(1)",
                      }}>
                      {l}
                    </div>
                    {i < layers.length - 1 && (
                      <ArrowRight size={12} style={{ color: i < active ? t.accent : "#374151", flexShrink: 0 }} />
                    )}
                  </div>
                ))}
              </div>
              {active >= layers.length - 1 && (
                <div className="mt-4 text-center" style={{ animation: "fadeIn 0.5s ease-out" }}>
                  <p className="text-sm font-bold" style={{ color: t.accent }}>⚡ 계산 완료! 결론 도출 중...</p>
                </div>
              )}
            </div>
            <PBtn t={t} onClick={() => setRunning(!running)}>{running ? "🔄 리셋" : "⚡ 순전파 시작"}</PBtn>
            <DeepDive>
              <p className="text-sm text-gray-700 font-medium">FFN — 뉴런이 실제로 하는 일</p>
              <p className="text-xs text-gray-500">어텐션으로 "어디를 볼지" 정했다면, FFN은 "봐서 어떤 결론을 내릴지" 계산합니다.</p>
              <div className="space-y-2">
                {[
                  { name: "Layer 1 — 표면 인식", desc: "'저'는 주어, '내일'은 시간" },
                  { name: "Layer 6 — 문법 이해", desc: "'저+내일+오후에' → 누군가 뭔가를 할 예정" },
                  { name: "Layer 12 — 의미 추론", desc: "한숨 + 내일 오후 = 쉬고 싶다는 신호" },
                  { name: "Layer 24 — 최종 결론", desc: "반차(80%), 외근(15%), 퇴사(5%)" },
                ].map((l, i) => (
                  <div key={i} className="p-2.5 bg-white rounded-lg border border-gray-200">
                    <p className="text-[10px] font-semibold text-gray-700">{l.name}</p>
                    <p className="text-[10px] text-gray-500">{l.desc}</p>
                  </div>
                ))}
              </div>
              <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
                <p className="text-xs text-amber-800"><strong>핵심:</strong> GPT-4는 약 120개 레이어. 앞쪽은 "단어가 뭐지?" 수준, 뒤쪽은 "퇴사하고 싶은 건지 반차를 쓰고 싶은 건지" 수준의 추론.</p>
              </div>
              <div className="p-3 bg-gray-100 rounded-lg">
                <p className="text-xs text-gray-600"><strong>📊 수치:</strong> FFN 은닉 차원 = 임베딩의 4배 (8,192×4=32,768). GPT-4 전체 약 1.8조 파라미터.</p>
              </div>
            </DeepDive>
          </div>
        );
      }
    },
    {
      title: "소프트맥스 (Softmax)", subtitle: "확률 변환", icon: Gauge,
      content: () => {
        const [show, setShow] = useState(false);
        const preds = [
          { label: "반차", prob: 80 }, { label: "외근", prob: 15 }, { label: "퇴사", prob: 5 },
        ];
        const colors = [t.accent, "#818cf8", "#475569"];
        return (
          <div className="space-y-5">
            <p className="text-sm text-slate-500">최종 계산 결과가 확률 분포로 변환됩니다. 각 예측에 0~100%의 확률이 부여됩니다.</p>
            <div className="rounded-xl p-5 space-y-4" style={{ background: "rgba(56,189,248,0.06)", border: "1px solid rgba(56,189,248,0.15)" }}>
              {preds.map((p, i) => (
                <div key={i} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-bold text-slate-800">{p.label}</span>
                    <span className="font-mono font-bold" style={{ color: colors[i] }}>{show ? `${p.prob}%` : "??"}</span>
                  </div>
                  <div className="h-3 rounded-full overflow-hidden" style={{ background: "#e2e8f0" }}>
                    <div className="h-full rounded-full transition-all duration-1000 ease-out"
                      style={{
                        width: show ? `${p.prob}%` : "0%",
                        background: colors[i],
                        boxShadow: show ? `0 0 10px ${colors[i]}80` : "none",
                        transitionDelay: `${i * 200}ms`,
                      }} />
                  </div>
                </div>
              ))}
              {show && (
                <div className="mt-2 p-3 rounded-lg text-center" style={{ background: "#f8fafc", animation: "fadeIn 0.5s ease-out" }}>
                  <p className="text-sm text-slate-600">부장님 결론: <span className="font-bold text-slate-800">"김대리, 내일 반차 쓸 거지?"</span></p>
                </div>
              )}
            </div>
            <PBtn t={t} onClick={() => setShow(!show)}>{show ? "숨기기" : "🎰 확률 계산"}</PBtn>
            <DeepDive>
              <p className="text-sm text-gray-700 font-medium">Temperature & Sampling — 부장님의 직감 조절기</p>
              <p className="text-xs text-gray-500">소프트맥스 후 "얼마나 확신을 가지고 답할지" 조절하는 파라미터입니다.</p>
              <div className="grid grid-cols-3 gap-2">
                <div className="p-2.5 bg-blue-50 rounded-lg border border-blue-200 text-center">
                  <p className="text-[10px] font-bold text-blue-700">🧊 T=0.2</p>
                  <p className="text-[10px] text-blue-600">정확하게</p>
                  <p className="text-[9px] text-gray-500">코드 생성용</p>
                </div>
                <div className="p-2.5 bg-gray-100 rounded-lg border border-gray-200 text-center">
                  <p className="text-[10px] font-bold text-gray-700">⚖️ T=1.0</p>
                  <p className="text-[10px] text-gray-600">균형</p>
                  <p className="text-[9px] text-gray-500">일반 대화</p>
                </div>
                <div className="p-2.5 bg-red-50 rounded-lg border border-red-200 text-center">
                  <p className="text-[10px] font-bold text-red-700">🔥 T=1.5+</p>
                  <p className="text-[10px] text-red-600">창의적</p>
                  <p className="text-[9px] text-gray-500">브레인스토밍</p>
                </div>
              </div>
              <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
                <p className="text-xs text-amber-800"><strong>실무 팁:</strong> ChatGPT에서 "같은 질문에 다른 답이 나오는 이유"가 바로 temperature와 샘플링 때문입니다. Top-K는 상위 K개만, Top-P는 누적 확률 P%까지만 후보로 남깁니다.</p>
              </div>
            </DeepDive>
          </div>
        );
      }
    },
    {
      title: "자기회귀 (Auto-regression)", subtitle: "꼬리무는 예측", icon: RefreshCw,
      content: () => {
        const [iter, setIter] = useState(0);
        const tokens = ["저", "내일", "오후에", "반차", "쓰겠습니다"];
        return (
          <div className="space-y-5">
            <p className="text-sm text-slate-500">예측된 단어를 붙이고, 다시 전체 문장으로 다음 단어를 예측하는 순환 구조입니다.</p>
            <div className="rounded-xl p-5" style={{ background: "rgba(56,189,248,0.06)", border: "1px solid rgba(56,189,248,0.15)" }}>
              <div className="flex flex-wrap gap-2 mb-4">
                {tokens.slice(0, 3 + iter).map((tk, i) => (
                  <span key={i} className="px-3 py-1.5 rounded-lg text-sm font-bold transition-all"
                    style={{
                      background: i >= 3 ? t.grad : "#f1f5f9",
                      color: i >= 3 ? "white" : "#1e293b",
                      border: `1px solid ${i >= 3 ? t.accent : "rgba(0,0,0,0.08)"}`,
                      boxShadow: i >= 3 ? `0 0 12px ${t.glow}` : "none",
                      animation: i >= 3 ? "slideUp 0.4s ease-out" : "",
                    }}>{tk}</span>
                ))}
                {iter < 2 && <span className="px-3 py-1.5 text-slate-600 text-sm animate-pulse font-mono">???</span>}
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <RefreshCw size={12} className={iter > 0 ? "animate-spin" : ""} />
                <span>{iter === 0 ? "다음 단어를 예측해 보세요" : iter === 1 ? "✅ '반차' 예측! 한 번 더!" : "🎉 완성! 순환 예측 종료"}</span>
              </div>
            </div>
            <div className="flex gap-3">
              <PBtn t={t} onClick={() => setIter(p => Math.min(p + 1, 2))} disabled={iter >= 2}>
                🔄 다음 단어 예측
              </PBtn>
              {iter >= 2 && <GBtn onClick={() => setIter(0)}><RotateCcw size={13} />리셋</GBtn>}
            </div>
            <DeepDive>
              <p className="text-sm text-gray-700 font-medium">토큰별 생성 과정 — 한 토큰씩 예측하는 법</p>
              <p className="text-xs text-gray-500">LLM은 한 번에 문장을 만들지 않습니다. 매번 "지금까지의 맥락"을 보고 "다음 한 토큰"만 예측합니다.</p>
              <div className="bg-white rounded-lg border border-gray-200 p-3 space-y-2">
                {[
                  { ctx: "저 내일 오후에 ___", top: "반차(42%)", why: "'한숨+오후' → 쉬고 싶다 포착" },
                  { ctx: "저 내일 오후에 반차 ___", top: "쓰겠(55%)", why: "'반차' 다음 동사 패턴 학습" },
                  { ctx: "저 내일 오후에 반차 쓰겠 ___", top: "습니다(72%)", why: "직장 존댓말 문맥 → 확률 급등" },
                ].map((s, i) => (
                  <div key={i} className="flex items-start gap-2 p-2 rounded-lg bg-gray-50">
                    <span className="text-[9px] font-mono text-gray-400 shrink-0 mt-0.5">Step {i + 1}</span>
                    <div>
                      <p className="text-[10px] font-mono text-gray-700">{s.ctx}</p>
                      <p className="text-[10px] text-blue-600 font-medium">→ {s.top}</p>
                      <p className="text-[9px] text-gray-400">{s.why}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
                <p className="text-xs text-amber-800"><strong>KV 캐시:</strong> 이전 토큰은 이미 계산했으므로 다시 계산하지 않습니다. 새 토큰만 처리 — ChatGPT가 긴 답변에서도 속도를 유지하는 비결.</p>
              </div>
              <div className="p-3 bg-gray-100 rounded-lg">
                <p className="text-xs text-gray-600"><strong>📊 수치:</strong> GPT-4 초당 ≈ 40~80토큰. 1,000자 ≈ 500~700토큰 ≈ 약 10초. 매 토큰마다 1.8조 파라미터 전부 동원.</p>
              </div>
            </DeepDive>
          </div>
        );
      }
    },
    {
      title: "역전파 (Backpropagation)", subtitle: "뼈저린 반성", icon: RotateCcw,
      content: () => {
        const [phase, setPhase] = useState(0);
        const [shake, setShake] = useState(false);
        const reveal = () => {
          setPhase(1); setShake(true);
          setTimeout(() => setShake(false), 600);
          setTimeout(() => setPhase(2), 1500);
        };
        return (
          <div className="space-y-5">
            <p className="text-sm text-slate-500">예측이 틀렸을 때 오차를 계산하고, 역방향으로 가중치를 수정합니다.</p>
            <div className={`rounded-xl p-5 ${shake ? "animate-[shake_0.5s]" : ""}`}
              style={{ background: "rgba(56,189,248,0.06)", border: "1px solid rgba(56,189,248,0.15)" }}>
              {phase === 0 && (
                <div className="text-center space-y-2">
                  <p className="text-sm text-slate-600">부장님의 예측: <span className="font-bold text-slate-800">"반차 쓸 거지?" (80%)</span></p>
                  <p className="text-slate-500 text-sm">그런데 김대리의 실제 대답은...</p>
                </div>
              )}
              {phase >= 1 && (
                <div className="text-center space-y-3" style={{ animation: "fadeIn 0.4s" }}>
                  <div className="inline-block p-4 rounded-xl" style={{ background: "rgba(248,113,113,0.12)", border: "1px solid rgba(248,113,113,0.3)" }}>
                    <p className="text-xl font-black" style={{ color: "#f87171" }}>💥 "사직서 내겠습니다"</p>
                  </div>
                  <p className="text-sm font-bold" style={{ color: "#f87171" }}>예측 실패! 오차율: 95%</p>
                </div>
              )}
              {phase >= 2 && (
                <div className="mt-4 space-y-3" style={{ animation: "fadeIn 0.5s" }}>
                  <div className="p-4 rounded-lg space-y-2" style={{ background: "#f8fafc" }}>
                    <p className="text-xs text-slate-500 mb-2">🔧 가중치 수정 중...</p>
                    {[
                      { label: '"한숨→반차" 가중치', from: "0.92", to: "0.3", dir: "↓" },
                      { label: '"한숨→퇴사" 가중치', from: "0.05", to: "0.85", dir: "↑" },
                    ].map((row, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs">
                        <span className="text-slate-500 w-36">{row.label}:</span>
                        <span className="line-through text-slate-600 font-mono">{row.from}</span>
                        <ArrowRight size={10} className="text-slate-600" />
                        <span className="font-mono font-bold" style={{ color: "#34d399" }}>{row.to}</span>
                        <span className="text-slate-500">{row.dir}</span>
                      </div>
                    ))}
                  </div>
                  <div className="p-3 rounded-lg" style={{ background: "rgba(251,191,36,0.08)", border: "1px solid rgba(251,191,36,0.2)" }}>
                    <p className="text-sm" style={{ color: "#fbbf24" }}>💡 <em>"요즘 세대는 피곤하면 반차가 아니라 퇴사구나..."</em></p>
                  </div>
                </div>
              )}
            </div>
            {phase === 0
              ? <PBtn t={t} onClick={reveal}>😱 실제 답 공개</PBtn>
              : <GBtn onClick={() => setPhase(0)}><RotateCcw size={13} />처음부터</GBtn>
            }
            <DeepDive>
              <p className="text-sm text-gray-700 font-medium">경사하강법 & 학습률 — 실수에서 배우는 속도</p>
              <p className="text-xs text-gray-500">역전파는 "오차를 줄이는 방향"으로 가중치를 조금씩 수정합니다. 학습률은 "한 번에 얼마나 크게 수정할지"를 결정합니다.</p>
              <div className="grid grid-cols-3 gap-2">
                <div className="p-2.5 bg-blue-50 rounded-lg border border-blue-200 text-center">
                  <p className="text-[10px] font-bold text-blue-700">🐢 LR 너무 작음</p>
                  <p className="text-[9px] text-gray-500">수렴 느림</p>
                </div>
                <div className="p-2.5 bg-emerald-50 rounded-lg border border-emerald-200 text-center">
                  <p className="text-[10px] font-bold text-emerald-700">✅ LR 적절</p>
                  <p className="text-[9px] text-gray-500">안정 수렴</p>
                </div>
                <div className="p-2.5 bg-red-50 rounded-lg border border-red-200 text-center">
                  <p className="text-[10px] font-bold text-red-700">💥 LR 너무 큼</p>
                  <p className="text-[9px] text-gray-500">발산 위험</p>
                </div>
              </div>
              <div className="bg-white rounded-lg border border-gray-200 p-3 space-y-1.5">
                <p className="text-[10px] font-medium text-gray-700">가중치 변화 예시 (학습 후):</p>
                {[
                  { name: '"한숨→반차"', from: "0.92", to: "0.30", dir: "↓ 대폭 감소" },
                  { name: '"한숨→���사"', from: "0.05", to: "0.85", dir: "↑ 대폭 증가" },
                ].map((w, i) => (
                  <div key={i} className="flex items-center gap-2 text-[10px]">
                    <span className="text-gray-600 w-24 font-mono">{w.name}</span>
                    <span className="line-through text-red-400">{w.from}</span>
                    <ArrowRight size={10} className="text-gray-300" />
                    <span className="font-bold text-emerald-600">{w.to}</span>
                    <span className="text-gray-400">{w.dir}</span>
                  </div>
                ))}
              </div>
              <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
                <p className="text-xs text-amber-800"><strong>핵심:</strong> GPT-4 학습 비용 ≈ 1억 달러+. 수조 토큰에서 수조 번 역전파. 부장님 30년 경험의 수백만 배 "경험"입니다.</p>
              </div>
              <div className="p-3 bg-gray-100 rounded-lg">
                <p className="text-xs text-gray-600"><strong>📊 수치:</strong> Adam 옵티마이저 LR ≈ 1e-4~3e-4. GPT-4는 약 13조 토큰으로 학습. 학습 후 RLHF로 추가 튜닝합니다.</p>
              </div>
            </DeepDive>
          </div>
        );
      }
    },
  ];

  const gameWords = ["부장님", "이번", "프로젝트", "예산이"];
  const keyWords = new Set(["프로젝트", "예산이"]);
  const predOptions = [
    { word: "부족합니다", prob: 65, correct: true },
    { word: "남았습니다", prob: 20, correct: false },
    { word: "좋습니다", prob: 10, correct: false },
    { word: "삭제됐습니다", prob: 5, correct: false },
  ];

  useEffect(() => {
    if (gameStarted && gamePhase === "attention" && timeLeft > 0) {
      timerRef.current = setTimeout(() => setTimeLeft(p => p - 2), 100);
      return () => clearTimeout(timerRef.current);
    }
    if (timeLeft <= 0 && gamePhase === "attention") { setGamePhase("predict"); setTimeLeft(100); }
  }, [gameStarted, gamePhase, timeLeft]);

  useEffect(() => {
    if (gamePhase === "predict" && timeLeft > 0) {
      timerRef.current = setTimeout(() => setTimeLeft(p => p - 1.5), 100);
      return () => clearTimeout(timerRef.current);
    }
    if (timeLeft <= 0 && gamePhase === "predict" && !selectedPrediction) {
      setGamePhase("result"); setGameScore(0);
    }
  }, [gamePhase, timeLeft, selectedPrediction]);

  const handlePred = (opt) => {
    setSelectedPrediction(opt);
    clearTimeout(timerRef.current);
    const attnScore = [...selectedWords].filter(w => keyWords.has(w)).length * 25;
    const score = attnScore + (opt.correct ? 50 : 0);
    setGameScore(score);
    setGamePhase("result");
    onScore?.("how", score, 100);
  };

  const resetGame = () => {
    setGameStarted(false); setGamePhase("attention");
    setSelectedWords(new Set()); setSelectedPrediction(null);
    setTimeLeft(100); setGameScore(null);
  };

  const StepContent = steps[step]?.content;

  return (
    <div className="space-y-6">
      {/* 비유 안내 카드 */}
      <Card t={t}>
        <div className="text-center mb-2">
          <span className="text-3xl">🎭</span>
        </div>
        <h3 className="text-lg font-bold text-center text-slate-900 mb-2">지금부터 회사생활로 배우는 AI 동작원리</h3>
        <p className="text-sm text-center text-slate-500 mb-5">어려운 AI 용어, 회사 상황에 빗대면 쉽게 이해됩니다.</p>

        <div className="grid sm:grid-cols-2 gap-3 mb-5">
          <div className="p-4 rounded-xl" style={{ background: "rgba(2,132,199,0.06)", border: "1px solid rgba(2,132,199,0.15)" }}>
            <div className="flex items-center gap-2 mb-2">
              <Bot size={18} style={{ color: t.accent }} />
              <span className="text-sm font-bold text-slate-800">부장님 = AI</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">부장님은 직원들의 말을 듣고, 다음에 무슨 말이 나올지 <strong>예측</strong>합니다. AI(LLM)도 똑같이 앞의 단어를 보고 다음 단어를 예측하는 방식으로 작동합니다.</p>
          </div>
          <div className="p-4 rounded-xl" style={{ background: "rgba(2,132,199,0.06)", border: "1px solid rgba(2,132,199,0.15)" }}>
            <div className="flex items-center gap-2 mb-2">
              <User size={18} style={{ color: t.accent }} />
              <span className="text-sm font-bold text-slate-800">직원의 실제 말 = 정답 데이터</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">직원이 실제로 한 말이 <strong>정답(학습 데이터)</strong>입니다. 부장님(AI)은 이 정답과 자기 예측을 비교하면서 점점 예측 능력을 키워갑니다.</p>
          </div>
        </div>

        <div className="p-4 rounded-xl" style={{ background: "#f8fafc", border: "1px solid rgba(0,0,0,0.07)" }}>
          <p className="text-xs font-bold text-slate-700 mb-2">📖 이런 순서로 진행됩니다</p>
          <div className="text-xs text-slate-600 space-y-1.5 leading-relaxed">
            <p><strong className="font-mono" style={{ color: t.accent }}>개념 학습 (7단계)</strong> — 부장님이 직원의 말을 어떻게 분석하고 예측하는지, AI의 핵심 동작 원리를 하나씩 따라갑니다.</p>
            <p><strong className="font-mono" style={{ color: t.accent }}>실전 게임</strong> — 직접 부장님이 되어 핵심 단어를 고르고 다음 말을 예측해봅니다. 당신의 선택이 곧 AI의 '어텐션'과 '예측'입니다.</p>
            <p><strong className="font-mono" style={{ color: t.accent }}>신경망 시각화</strong> — AI 내부의 뉴런과 학습 과정을 눈으로 직접 관찰합니다.</p>
          </div>
        </div>
      </Card>

      <Card t={t}>
        <SecHead icon={BookOpen} label="부장님의 눈치 게임 — LLM 작동 원리 7단계" t={t} />
        <div className="flex gap-1.5 mb-6 overflow-x-auto pb-1">
          {steps.map((s, i) => (
            <button key={i} onClick={() => setStep(i)}
              className="shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all duration-200"
              style={{
                background: i === step ? t.grad : "#f1f5f9",
                color: i === step ? "white" : "#64748b",
                border: `1px solid ${i === step ? t.accent : "rgba(0,0,0,0.07)"}`,
                boxShadow: i === step ? `0 0 16px ${t.glow}` : "none",
              }}>
              <span className="font-mono">{i + 1}</span>
              <span className="hidden sm:inline">{s.subtitle}</span>
            </button>
          ))}
        </div>
        <div className="mb-2">
          <div className="flex items-center gap-3 mb-5">
            {(() => { const Icon = steps[step].icon; return (
              <div className="w-9 h-9 rounded-lg flex items-center justify-center"
                style={{ background: t.dim, border: `1px solid ${t.border}` }}>
                <Icon size={16} style={{ color: t.accent }} />
              </div>
            ); })()}
            <div>
              <h3 className="font-bold text-slate-800">{steps[step].title}</h3>
              <p className="text-xs text-slate-400">{steps[step].subtitle}</p>
            </div>
          </div>
          <StepContent />
        </div>
        <div className="flex justify-between mt-6 pt-4" style={{ borderTop: "1px solid rgba(0,0,0,0.08)" }}>
          <GBtn onClick={() => setStep(Math.max(0, step - 1))} className={step === 0 ? "opacity-30 pointer-events-none" : ""}>
            <ArrowLeft size={13} />이전
          </GBtn>
          <span className="text-xs text-slate-600 self-center font-mono">{step + 1}/{steps.length}</span>
          <GBtn onClick={() => setStep(Math.min(steps.length - 1, step + 1))} className={step === steps.length - 1 ? "opacity-30 pointer-events-none" : ""}>
            다음<ArrowRight size={13} />
          </GBtn>
        </div>
      </Card>

      <Card t={t} game>
        <GameHead icon={Gamepad2} label="부장님 시뮬레이터 — 핵심 단어 잡기" t={t} />
        {!gameStarted ? (
          <div className="text-center py-8">
            <p className="text-sm text-slate-500 mb-6">핵심 단어를 빠르게 찾고 다음 단어를 예측하세요!</p>
            <PBtn t={t} onClick={() => setGameStarted(true)} icon={Play}>게임 시작</PBtn>
          </div>
        ) : (
          <div className="space-y-5">
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold" style={{ color: t.accent }}>
                <span>{gamePhase === "attention" ? "⏱ 핵심 단어 클릭!" : gamePhase === "predict" ? "⏱ 다음 단어 예측!" : "결과"}</span>
                {gamePhase !== "result" && <span>{Math.round(timeLeft)}%</span>}
              </div>
              <div className="h-2 rounded-full overflow-hidden" style={{ background: "#e2e8f0" }}>
                <div className="h-full rounded-full transition-all duration-100"
                  style={{
                    width: `${gamePhase !== "result" ? timeLeft : 0}%`,
                    background: timeLeft > 30 ? t.grad : "linear-gradient(135deg,#b91c1c,#f87171)",
                    boxShadow: `0 0 8px ${t.glow}`,
                  }} />
              </div>
            </div>

            <div className="rounded-xl p-5" style={{ background: "rgba(56,189,248,0.05)", border: "1px solid rgba(56,189,248,0.12)" }}>
              <p className="text-xs text-slate-500 mb-3">💬 김대리:</p>
              <div className="flex gap-2 flex-wrap">
                {gameWords.map((w, i) => (
                  <button key={i}
                    onClick={() => {
                      if (gamePhase === "attention")
                        setSelectedWords(prev => { const n = new Set(prev); n.has(w) ? n.delete(w) : n.add(w); return n; });
                    }}
                    className="px-4 py-2 rounded-lg text-sm font-bold transition-all duration-200"
                    style={{
                      background: selectedWords.has(w) ? t.grad : "#f1f5f9",
                      color: selectedWords.has(w) ? "white" : "#1e293b",
                      border: `1px solid ${selectedWords.has(w) ? t.accent : "rgba(0,0,0,0.08)"}`,
                      boxShadow: selectedWords.has(w) ? `0 0 16px ${t.glow}` : "none",
                      cursor: gamePhase !== "attention" ? "default" : "pointer",
                    }}>{w}</button>
                ))}
                <span className="px-4 py-2 text-slate-600 text-sm font-mono animate-pulse">???</span>
              </div>
            </div>

            {gamePhase === "predict" && (
              <div className="space-y-3" style={{ animation: "fadeIn 0.4s ease-out" }}>
                <p className="text-sm font-bold text-slate-800">다음 단어로 가장 적절한 것은?</p>
                <div className="grid grid-cols-2 gap-2">
                  {predOptions.map((opt, i) => (
                    <button key={i} onClick={() => handlePred(opt)}
                      className="p-3 rounded-xl text-sm text-left transition-all duration-200"
                      style={{ background: "#f8fafc", border: "1px solid rgba(0,0,0,0.08)", color: "#1e293b" }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = t.border; e.currentTarget.style.background = t.dim; }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(0,0,0,0.08)"; e.currentTarget.style.background = "#f8fafc"; }}>
                      <span className="font-bold">{opt.word}</span>
                      <span className="text-xs text-slate-500 ml-2">{opt.prob}%</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {gamePhase === "result" && (
              <div className="space-y-4" style={{ animation: "fadeIn 0.4s ease-out" }}>
                <div className="p-5 rounded-xl text-center"
                  style={{
                    background: gameScore >= 75 ? "rgba(52,211,153,0.08)" : gameScore >= 50 ? "rgba(251,191,36,0.08)" : "rgba(248,113,113,0.08)",
                    border: `1px solid ${gameScore >= 75 ? "rgba(52,211,153,0.3)" : gameScore >= 50 ? "rgba(251,191,36,0.3)" : "rgba(248,113,113,0.3)"}`,
                  }}>
                  <div className="text-4xl font-black text-slate-800 mb-1">{gameScore}<span className="text-xl text-slate-500">점</span></div>
                  <p className="text-sm text-slate-600">{gameScore >= 75 ? "🎉 훌륭한 눈치! 부장님 레벨!" : gameScore >= 50 ? "👍 나쁘지 않아요!" : "😅 아직 눈치가..."}</p>
                  <div className="mt-3 text-xs text-slate-500">
                    <p>어텐션: {[...selectedWords].filter(w => keyWords.has(w)).length}/{keyWords.size} 핵심 단어</p>
                    <p>예측: {selectedPrediction ? (selectedPrediction.correct ? "정답 ✅" : `"${selectedPrediction.word}" 오답 ❌`) : "시간 초과 ⏰"}</p>
                  </div>
                </div>
                <GBtn onClick={resetGame}><RotateCcw size={13} />다시 하기</GBtn>
              </div>
            )}
          </div>
        )}
      </Card>

      {/* ─── 인터랙티브 신경망 시각화 ─── */}
      <NeuralNetworkPlayground />
    </div>
  );
};


// ─── Neural Network Playground (한국어 간소화 버전) ────
const NeuralNetworkPlayground = () => {
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const [isTraining, setIsTraining] = useState(false);
  const [epoch, setEpoch] = useState(0);
  const [loss, setLoss] = useState(1.0);
  const [learningRate, setLearningRate] = useState(0.03);
  const [hiddenNeurons, setHiddenNeurons] = useState(4);
  const [hiddenLayers, setHiddenLayers] = useState(1);
  const [dataType, setDataType] = useState("circle"); // circle, xor
  const [showDecisionBoundary, setShowDecisionBoundary] = useState(true);
  const weightsRef = useRef(null);
  const dataRef = useRef(null);
  const epochRef = useRef(0);
  const lossRef = useRef(1.0);
  const trainingRef = useRef(false);

  // 데이터 생성
  const generateData = useCallback((type) => {
    const points = [];
    const n = 120;
    if (type === "circle") {
      for (let i = 0; i < n; i++) {
        const angle = Math.random() * Math.PI * 2;
        const isInner = i < n / 2;
        const r = isInner ? Math.random() * 0.4 : 0.6 + Math.random() * 0.4;
        const x = Math.cos(angle) * r + (Math.random() - 0.5) * 0.1;
        const y = Math.sin(angle) * r + (Math.random() - 0.5) * 0.1;
        points.push({ x: Math.max(-1, Math.min(1, x)), y: Math.max(-1, Math.min(1, y)), label: isInner ? 0 : 1 });
      }
    } else {
      for (let i = 0; i < n; i++) {
        const x = Math.random() * 2 - 1;
        const y = Math.random() * 2 - 1;
        const label = (x > 0) !== (y > 0) ? 1 : 0;
        const nx = x + (Math.random() - 0.5) * 0.15;
        const ny = y + (Math.random() - 0.5) * 0.15;
        points.push({ x: Math.max(-1, Math.min(1, nx)), y: Math.max(-1, Math.min(1, ny)), label });
      }
    }
    return points;
  }, []);

  // 가중치 초기화
  const initWeights = useCallback((layers, neurons) => {
    const w = { hidden: [], biasH: [], output: [], biasO: [] };
    let prevSize = 2;
    for (let l = 0; l < layers; l++) {
      const layerW = [];
      const layerB = [];
      for (let j = 0; j < neurons; j++) {
        const neuronW = [];
        for (let i = 0; i < prevSize; i++) {
          neuronW.push((Math.random() - 0.5) * 1.5);
        }
        layerW.push(neuronW);
        layerB.push((Math.random() - 0.5) * 0.5);
      }
      w.hidden.push(layerW);
      w.biasH.push(layerB);
      prevSize = neurons;
    }
    for (let i = 0; i < prevSize; i++) {
      w.output.push((Math.random() - 0.5) * 1.5);
    }
    w.biasO = [(Math.random() - 0.5) * 0.5];
    return w;
  }, []);

  // 시그모이드
  const sigmoid = (x) => 1 / (1 + Math.exp(-Math.max(-10, Math.min(10, x))));

  // 순전파
  const forward = useCallback((x, y, w) => {
    const activations = []; // 각 히든레이어의 활성값
    let input = [x, y];
    for (let l = 0; l < w.hidden.length; l++) {
      const layerOut = [];
      for (let j = 0; j < w.hidden[l].length; j++) {
        let sum = w.biasH[l][j];
        for (let i = 0; i < input.length; i++) {
          sum += input[i] * w.hidden[l][j][i];
        }
        layerOut.push(sigmoid(sum));
      }
      activations.push(layerOut);
      input = layerOut;
    }
    let outSum = w.biasO[0];
    for (let i = 0; i < input.length; i++) {
      outSum += input[i] * w.output[i];
    }
    const output = sigmoid(outSum);
    return { activations, output };
  }, []);

  // 역전파 + 가중치 업데이트
  const trainStep = useCallback((data, w, lr) => {
    let totalLoss = 0;
    // 미니배치 SGD
    const batchSize = Math.min(16, data.length);
    const batch = [];
    for (let i = 0; i < batchSize; i++) {
      batch.push(data[Math.floor(Math.random() * data.length)]);
    }

    for (const point of batch) {
      const { activations, output } = forward(point.x, point.y, w);
      const error = output - point.label;
      totalLoss += error * error;

      // 출력층 그래디언트
      const dOutput = error * output * (1 - output);

      // 마지막 히든레이어 → 출력
      const lastHidden = activations[activations.length - 1];
      for (let i = 0; i < w.output.length; i++) {
        w.output[i] -= lr * dOutput * lastHidden[i];
      }
      w.biasO[0] -= lr * dOutput;

      // 히든레이어 역전파
      let dNext = w.output.map((ow) => dOutput * ow);

      for (let l = w.hidden.length - 1; l >= 0; l--) {
        const dCurrent = [];
        const prevInput = l > 0 ? activations[l - 1] : null;
        for (let j = 0; j < w.hidden[l].length; j++) {
          const a = activations[l][j];
          const dH = dNext[j] * a * (1 - a);
          dCurrent.push(dH);
          for (let i = 0; i < w.hidden[l][j].length; i++) {
            const inp = prevInput ? prevInput[i] : (i === 0 ? point.x : point.y);
            w.hidden[l][j][i] -= lr * dH * inp;
          }
          w.biasH[l][j] -= lr * dH;
        }
        if (l > 0) {
          dNext = [];
          for (let i = 0; i < w.hidden[l - 1].length; i++) {
            let sum = 0;
            for (let j = 0; j < w.hidden[l].length; j++) {
              sum += dCurrent[j] * w.hidden[l][j][i];
            }
            dNext.push(sum);
          }
        }
      }
    }
    return totalLoss / batchSize;
  }, [forward]);

  // 캔버스 렌더링
  const renderCanvas = useCallback((w, data) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const size = canvas.width;
    ctx.clearRect(0, 0, size, size);

    // 결정 경계 (배경 그라데이션)
    if (showDecisionBoundary && w) {
      const res = 4;
      for (let px = 0; px < size; px += res) {
        for (let py = 0; py < size; py += res) {
          const x = (px / size) * 2 - 1;
          const y = (py / size) * 2 - 1;
          const { output } = forward(x, y, w);
          const r = Math.round(255 * output);
          const b = Math.round(255 * (1 - output));
          ctx.fillStyle = `rgba(${r}, 100, ${b}, 0.3)`;
          ctx.fillRect(px, py, res, res);
        }
      }
    }

    // 데이터 포인트
    if (data) {
      for (const p of data) {
        const px = ((p.x + 1) / 2) * size;
        const py = ((p.y + 1) / 2) * size;
        ctx.beginPath();
        ctx.arc(px, py, 3.5, 0, Math.PI * 2);
        ctx.fillStyle = p.label === 1 ? "#f97316" : "#3b82f6";
        ctx.fill();
        ctx.strokeStyle = "#fff";
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    }
  }, [forward, showDecisionBoundary]);

  // 네트워크 다이어그램 렌더링 (오른쪽 패널)
  // 구조는 hiddenLayers/hiddenNeurons state 기반, 색상만 weightsRef 참조
  const renderNetworkDiagram = useCallback(() => {
    const layers = [2];
    const layerLabels = ["입력"];
    for (let i = 0; i < hiddenLayers; i++) {
      layers.push(hiddenNeurons);
      layerLabels.push(`은닉 ${i + 1}`);
    }
    layers.push(1);
    layerLabels.push("출력");

    const w = weightsRef.current;
    const width = 260;
    const height = 180;
    const layerGap = width / (layers.length + 1);

    const neurons = [];
    const connections = [];

    // 뉴런 위치
    const positions = layers.map((count, li) => {
      const x = layerGap * (li + 1);
      const arr = [];
      for (let ni = 0; ni < count; ni++) {
        const y = (height / (count + 1)) * (ni + 1);
        arr.push({ x, y });
      }
      return arr;
    });

    // 연결선 + 가중치 색상
    for (let li = 0; li < layers.length - 1; li++) {
      for (let ni = 0; ni < positions[li].length; ni++) {
        for (let nj = 0; nj < positions[li + 1].length; nj++) {
          let weight = 0;
          if (w) {
            if (li < (w.hidden?.length || 0)) {
              weight = w.hidden[li]?.[nj]?.[ni] || 0;
            } else {
              weight = w.output?.[ni] || 0;
            }
          }
          const absW = Math.min(Math.abs(weight), 3) / 3;
          const color = weight > 0 ? `rgba(59, 130, 246, ${0.15 + absW * 0.7})` : `rgba(249, 115, 22, ${0.15 + absW * 0.7})`;
          connections.push(
            <line key={`c-${li}-${ni}-${nj}`} x1={positions[li][ni].x} y1={positions[li][ni].y} x2={positions[li + 1][nj].x} y2={positions[li + 1][nj].y} stroke={color} strokeWidth={0.5 + absW * 2.5} />
          );
        }
      }
    }

    // 뉴런 원
    positions.forEach((layer, li) => {
      layer.forEach((pos, ni) => {
        neurons.push(
          <circle key={`n-${li}-${ni}`} cx={pos.x} cy={pos.y} r={li === 0 || li === layers.length - 1 ? 10 : 8} fill={li === 0 ? "#e0e7ff" : li === layers.length - 1 ? "#fef3c7" : "#f0fdf4"} stroke={li === 0 ? "#6366f1" : li === layers.length - 1 ? "#f59e0b" : "#22c55e"} strokeWidth={1.5} />
        );
        if (li === 0) {
          neurons.push(
            <text key={`t-${li}-${ni}`} x={pos.x} y={pos.y + 1} textAnchor="middle" fontSize="8" fontWeight="bold" fill="#4338ca">{ni === 0 ? "X" : "Y"}</text>
          );
        }
      });
    });

    // 레이어 라벨
    const labels = positions.map((layer, li) => (
      <text key={`l-${li}`} x={layer[0].x} y={height - 2} textAnchor="middle" fontSize="7" fill="#9ca3af">{layerLabels[li]}</text>
    ));

    return (
      <svg width="100%" viewBox={`0 0 ${width} ${height}`} className="max-h-[180px]">
        {connections}
        {neurons}
        {labels}
      </svg>
    );
  }, [hiddenLayers, hiddenNeurons, epoch]);

  // 초기화
  useEffect(() => {
    const data = generateData(dataType);
    const w = initWeights(hiddenLayers, hiddenNeurons);
    dataRef.current = data;
    weightsRef.current = w;
    epochRef.current = 0;
    lossRef.current = 1.0;
    setEpoch(0);
    setLoss(1.0);
    setIsTraining(false);
    trainingRef.current = false;
    if (animRef.current) cancelAnimationFrame(animRef.current);

    renderCanvas(w, data);
  }, [dataType, hiddenNeurons, hiddenLayers, generateData, initWeights, renderCanvas]);

  // 학습 루프
  useEffect(() => {
    if (!isTraining) return;
    trainingRef.current = true;
    let frame = 0;
    const loop = () => {
      if (!trainingRef.current) return;
      const w = weightsRef.current;
      const data = dataRef.current;
      if (!w || !data) return;

      // 한 프레임당 여러 스텝
      let l = 0;
      for (let i = 0; i < 5; i++) {
        l = trainStep(data, w, learningRate);
      }
      epochRef.current += 5;
      lossRef.current = l;

      frame++;
      if (frame % 3 === 0) {
        setEpoch(epochRef.current);
        setLoss(l);
        renderCanvas(w, data);
      }
      animRef.current = requestAnimationFrame(loop);
    };
    animRef.current = requestAnimationFrame(loop);
    return () => {
      trainingRef.current = false;
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [isTraining, learningRate, trainStep, renderCanvas]);

  // 리셋
  const handleReset = () => {
    setIsTraining(false);
    trainingRef.current = false;
    if (animRef.current) cancelAnimationFrame(animRef.current);
    const data = generateData(dataType);
    const w = initWeights(hiddenLayers, hiddenNeurons);
    dataRef.current = data;
    weightsRef.current = w;
    epochRef.current = 0;
    lossRef.current = 1.0;
    setEpoch(0);
    setLoss(1.0);

    setTimeout(() => renderCanvas(w, data), 50);
  };

  const lossColor = loss < 0.1 ? "text-emerald-600" : loss < 0.25 ? "text-amber-600" : "text-red-500";

  return (
    <div className="mt-8 p-6 bg-white rounded-2xl border border-gray-200 shadow-sm" style={{ animation: "fadeIn 0.5s ease-out" }}>
      <div className="flex items-center gap-2 mb-1">
        <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center">
          <Network size={16} className="text-indigo-500" />
        </div>
        <span className="text-xs font-semibold tracking-widest uppercase text-indigo-400">INTERACTIVE</span>
      </div>
      <h3 className="text-lg font-bold text-gray-900 mb-1">직접 눈으로 보는 AI 학습 과정</h3>
      <p className="text-xs text-gray-500 mb-5">아래에서 설정을 바꿔보면서, AI가 데이터의 패턴을 어떻게 학습하는지 관찰해보세요.</p>

      {/* 컨트롤 패널 */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        <div>
          <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">데이터 모양</label>
          <div className="flex gap-1.5 mt-1.5">
            <button onClick={() => { if (isTraining) { setIsTraining(false); trainingRef.current = false; } setDataType("circle"); }} className={`flex-1 px-2.5 py-1.5 text-xs rounded-lg border transition-all ${dataType === "circle" ? "bg-gray-900 text-white border-gray-900" : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"}`}>
              ⭕ 원형
            </button>
            <button onClick={() => { if (isTraining) { setIsTraining(false); trainingRef.current = false; } setDataType("xor"); }} className={`flex-1 px-2.5 py-1.5 text-xs rounded-lg border transition-all ${dataType === "xor" ? "bg-gray-900 text-white border-gray-900" : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"}`}>
              ✖ 대각선
            </button>
          </div>
        </div>
        <div>
          <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">은닉층 수</label>
          <div className="flex items-center gap-2 mt-1.5">
            <button onClick={() => { if (!isTraining && hiddenLayers > 1) setHiddenLayers(hiddenLayers - 1); }} className="w-7 h-7 rounded-lg border border-gray-200 text-gray-500 hover:border-gray-400 text-sm disabled:opacity-30" disabled={isTraining || hiddenLayers <= 1}>−</button>
            <span className="text-sm font-bold text-gray-800 w-4 text-center">{hiddenLayers}</span>
            <button onClick={() => { if (!isTraining && hiddenLayers < 3) setHiddenLayers(hiddenLayers + 1); }} className="w-7 h-7 rounded-lg border border-gray-200 text-gray-500 hover:border-gray-400 text-sm disabled:opacity-30" disabled={isTraining || hiddenLayers >= 3}>+</button>
          </div>
        </div>
        <div>
          <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">뉴런 수 (층당)</label>
          <div className="flex items-center gap-2 mt-1.5">
            <button onClick={() => { if (!isTraining && hiddenNeurons > 2) setHiddenNeurons(hiddenNeurons - 1); }} className="w-7 h-7 rounded-lg border border-gray-200 text-gray-500 hover:border-gray-400 text-sm disabled:opacity-30" disabled={isTraining || hiddenNeurons <= 2}>−</button>
            <span className="text-sm font-bold text-gray-800 w-4 text-center">{hiddenNeurons}</span>
            <button onClick={() => { if (!isTraining && hiddenNeurons < 8) setHiddenNeurons(hiddenNeurons + 1); }} className="w-7 h-7 rounded-lg border border-gray-200 text-gray-500 hover:border-gray-400 text-sm disabled:opacity-30" disabled={isTraining || hiddenNeurons >= 8}>+</button>
          </div>
        </div>
        <div>
          <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">학습 속도</label>
          <input type="range" min="0.001" max="0.1" step="0.001" value={learningRate} onChange={(e) => setLearningRate(parseFloat(e.target.value))} className="w-full mt-2 accent-indigo-500" />
          <div className="text-[10px] text-gray-400 text-center">{learningRate.toFixed(3)}</div>
        </div>
      </div>

      {/* 메인 영역 */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* 캔버스 */}
        <div className="flex-1">
          <div className="relative bg-gray-50 rounded-xl border border-gray-200 overflow-hidden">
            <canvas ref={canvasRef} width={320} height={320} className="w-full aspect-square" />
            <div className="absolute top-2 left-2 flex gap-2">
              <span className="inline-flex items-center gap-1 text-[10px] bg-white/90 backdrop-blur px-2 py-1 rounded-full border border-gray-200">
                <span className="w-2 h-2 rounded-full bg-blue-500" /> 🐱 고양이
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] bg-white/90 backdrop-blur px-2 py-1 rounded-full border border-gray-200">
                <span className="w-2 h-2 rounded-full bg-orange-500" /> 🐶 개
              </span>
            </div>
          </div>
          <p className="text-[10px] text-gray-400 mt-2 text-center">배경 색이 변하는 것 = AI가 '여기는 고양이, 여기는 개' 라고 판단하는 영역</p>
        </div>

        {/* 오른쪽 정보 패널 */}
        <div className="sm:w-[280px] space-y-3">
          {/* 학습 상태 */}
          <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
            <div className="flex justify-between items-center text-xs mb-2">
              <span className="text-gray-500">반복 횟수</span>
              <span className="font-mono font-bold text-gray-800">{epoch.toLocaleString()}회</span>
            </div>
            <div className="flex justify-between items-center text-xs mb-2">
              <span className="text-gray-500">오답률 (Loss)</span>
              <span className={`font-mono font-bold ${lossColor}`}>{loss.toFixed(4)}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div className="h-1.5 rounded-full transition-all duration-300" style={{ width: `${Math.max(2, (1 - Math.min(loss, 1)) * 100)}%`, backgroundColor: loss < 0.1 ? "#22c55e" : loss < 0.25 ? "#f59e0b" : "#ef4444" }} />
            </div>
            <p className="text-[10px] text-gray-400 mt-1.5">{loss < 0.05 ? "거의 완벽하게 학습했어요!" : loss < 0.15 ? "꽤 잘 구분하고 있어요!" : loss < 0.3 ? "조금씩 패턴을 찾는 중..." : "아직 학습 초기 단계입니다"}</p>
          </div>

          {/* 네트워크 구조 */}
          <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">네트워크 구조</p>
            {renderNetworkDiagram()}
            <p className="text-[10px] text-gray-400 mt-1">선 색상 = 가중치 (파랑: +, 주황: −) / 굵기 = 영향력</p>
          </div>

          {/* 버튼 */}
          <div className="flex gap-2">
            <button onClick={() => setIsTraining(!isTraining)} className={`flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 text-sm font-medium rounded-xl transition-all ${isTraining ? "bg-red-50 text-red-600 border border-red-200 hover:bg-red-100" : "bg-gray-900 text-white hover:bg-gray-800"}`}>
              {isTraining ? <><X size={14} /> 학습 멈추기</> : <><Play size={14} /> 학습 시작</>}
            </button>
            <button onClick={handleReset} disabled={isTraining} className="flex items-center gap-1.5 px-3 py-2.5 text-sm text-gray-500 hover:text-gray-800 border border-gray-200 rounded-xl hover:border-gray-400 disabled:opacity-30">
              <RotateCcw size={14} /> 초기화
            </button>
          </div>
        </div>
      </div>

      {/* 설명 박스 — 비전공자용 상세 가이드 (개 vs 고양이 비유) */}
      <div className="mt-6 space-y-4">
        {/* 0. 상황 설정 */}
        <div className="p-5 bg-indigo-50 rounded-xl border border-indigo-200">
          <p className="text-sm font-bold text-indigo-900 mb-3">상황을 상상해보세요</p>
          <div className="text-xs text-indigo-800 leading-relaxed space-y-2">
            <p>누군가 여러분에게 <strong>수천 장의 동물 사진</strong>을 주면서 이렇게 말합니다.</p>
            <div className="p-3 bg-white rounded-lg border border-indigo-200 text-sm text-center font-medium text-indigo-900">"이 사진들을 보고, 앞으로 새로운 사진이 오면 <strong>개인지 고양이인지</strong> 맞춰봐."</div>
            <p>여러분이라면 어떻게 구분하시겠어요? 아마 <strong>귀 모양, 주둥이 길이, 눈 크기</strong> 같은 특징을 보겠죠. AI도 <strong>정확히 같은 방식</strong>으로 학습합니다. 위의 시각화가 바로 그 과정을 보여주는 것입니다!</p>
          </div>
        </div>

        {/* 1. 화면 읽는 법 */}
        <div className="p-5 bg-indigo-50 rounded-xl border border-indigo-200">
          <p className="text-sm font-bold text-indigo-900 mb-3">이 화면, 어떻게 보는 건가요?</p>
          <div className="text-xs text-indigo-800 space-y-3 leading-relaxed">
            <div>
              <p className="font-bold mb-1">🐱🐶 점 = 동물 사진 데이터</p>
              <p className="text-indigo-700"><span className="text-blue-600 font-bold">파랑 점(🐱)</span> 하나하나가 <strong>고양이 사진 한 장</strong>이고, <span className="text-orange-600 font-bold">주황 점(🐶)</span> 하나하나가 <strong>개 사진 한 장</strong>입니다. 점의 위치는 그 사진의 특징을 나타냅니다 — 가로축(X)은 <strong>귀가 얼마나 뾰족한지</strong>, 세로축(Y)은 <strong>주둥이가 얼마나 긴지</strong>라고 생각하세요.</p>
            </div>
            <div>
              <p className="font-bold mb-1">🎨 배경 색 변화 = AI의 '판단 지도'</p>
              <p className="text-indigo-700">배경이 <span className="text-blue-600 font-bold">파랗게</span> 변하는 곳은 AI가 <strong>"이 특징이면 고양이!"</strong>라고 판단하는 영역이고, <span className="text-orange-600 font-bold">주황</span>으로 변하는 곳은 <strong>"이 특징이면 개!"</strong>라고 판단하는 영역입니다. 학습이 진행될수록 배경 색이 실제 점의 색과 일치해갑니다 — 그게 바로 <strong>"AI가 개와 고양이를 구분하는 법을 배웠다"</strong>는 뜻입니다.</p>
            </div>
            <div>
              <p className="font-bold mb-1">🤔 경계가 애매한 부분 = 포메라니안 같은 사진</p>
              <p className="text-indigo-700">파랑과 주황이 섞여 있는 곳이 있죠? 그 부분은 <strong>"귀가 좀 뾰족한데 주둥이도 짧은" 애매한 사진</strong>입니다. 포메라니안처럼 고양이 같은 개, 혹은 먼치킨처럼 개 같은 고양이라고 생각하면 됩니다. AI도 이런 애매한 데이터를 구분하는 게 가장 어렵습니다!</p>
            </div>
            <div>
              <p className="font-bold mb-1">🔄 반복 횟수 / 오답률 = AI의 '성적표'</p>
              <p className="text-indigo-700"><strong>반복 횟수</strong>는 AI가 같은 사진들을 몇 번이나 반복해서 봤는지입니다. 사람이 문제집을 여러 번 푸는 것과 같아요. <strong>오답률(Loss)</strong>은 "고양이를 개라고 잘못 답한 정도"입니다. 1.0이면 완전 엉터리, 0에 가까우면 거의 완벽합니다.</p>
            </div>
          </div>
        </div>

        {/* 2. 뉴런과 은닉층 설명 */}
        <div className="p-5 bg-emerald-50 rounded-xl border border-emerald-200">
          <p className="text-sm font-bold text-emerald-900 mb-3">뉴런? 은닉층? — 우리 뇌로 비유하면</p>
          <div className="text-xs text-emerald-800 space-y-3 leading-relaxed">
            <div>
              <p className="font-bold mb-1">🧠 뉴런 = 뇌세포 하나</p>
              <p className="text-emerald-700">우리 뇌에는 약 860억 개의 <strong>뉴런(신경세포)</strong>이 있습니다. 각 뉴런은 정보를 받아서 "이게 중요해?"를 판단한 뒤 다음 뉴런에게 전달합니다. 예를 들어 고양이 사진을 볼 때, 어떤 뉴런은 <strong>"귀가 뾰족하다!"</strong>에 반응하고, 다른 뉴런은 <strong>"눈이 동그랗다!"</strong>에 반응합니다. 오른쪽 네트워크의 <strong>초록색 동그라미 하나하나가 뉴런</strong>입니다.</p>
            </div>
            <div>
              <p className="font-bold mb-1">🔗 연결선 = 시냅스 (뉴런 사이의 연결)</p>
              <p className="text-emerald-700">뇌에서 뉴런과 뉴런은 <strong>시냅스</strong>라는 연결로 이어져 있습니다. 네트워크의 <strong>선</strong>이 바로 시냅스입니다. 선이 <span className="text-blue-600 font-bold">파랗고 굵으면</span> "이 연결이 강하다(귀 뾰족함 → 고양이 확률 UP!)"는 뜻이고, <span className="text-orange-600 font-bold">주황이고 굵으면</span> "반대 방향(귀 뾰족함 → 개 확률 DOWN)"이라는 뜻입니다.</p>
            </div>
            <div>
              <p className="font-bold mb-1">📦 은닉층 = 뇌의 '생각 단계'</p>
              <p className="text-emerald-700"><strong>입력층</strong>(귀 모양, 주둥이 길이 등 특징을 받는 곳) → <strong>은닉층</strong>("귀가 뾰족하고 주둥이가 짧으면... 고양이인가?" 중간에서 고민하는 곳) → <strong>출력층</strong>("개다!" 또는 "고양이다!" 최종 판단). 은닉층을 늘리면 "귀도 보고, 눈도 보고, 꼬리도 보고" 더 복잡한 특징을 조합할 수 있습니다.</p>
            </div>
          </div>
        </div>

        {/* 3. 학습 원리 */}
        <div className="p-5 bg-amber-50 rounded-xl border border-amber-200">
          <p className="text-sm font-bold text-amber-900 mb-3">AI는 어떻게 '배우는' 걸까요?</p>
          <div className="text-xs text-amber-800 space-y-3 leading-relaxed">
            <div>
              <p className="font-bold mb-1">📝 1단계: 일단 찍어본다 (초기 상태)</p>
              <p className="text-amber-700">처음에 AI는 아무것도 모릅니다. 사진을 보여줘도 개인지 고양이인지 <strong>동전 던지기 수준으로 찍습니다.</strong> 배경 색이 엉망인 이유입니다.</p>
            </div>
            <div>
              <p className="font-bold mb-1">❌ 2단계: 오답 확인 (오답률 계산)</p>
              <p className="text-amber-700">"이 사진은 고양이인데 개라고 했네? 틀렸잖아!" — AI는 자기 예측과 정답을 비교합니다. 이 <strong>틀린 정도가 오답률(Loss)</strong>입니다.</p>
            </div>
            <div>
              <p className="font-bold mb-1">🔧 3단계: 연결 조정 (역전파)</p>
              <p className="text-amber-700">틀린 만큼 연결선의 굵기를 수정합니다. "귀 뾰족함에 너무 반응 안 했으니 올리고, 색깔에 너무 의존했으니 줄이자." 이게 <strong>역전파(Backpropagation)</strong>입니다.</p>
            </div>
            <div>
              <p className="font-bold mb-1">🔁 4단계: 수천~수만 번 반복</p>
              <p className="text-amber-700">1~3단계를 수천 번 반복하면, AI는 점점 <strong>"귀 뾰족 + 주둥이 짧음 = 고양이"</strong> 같은 패턴을 찾아냅니다. <strong>학습 시작</strong>을 눌러서 배경 색이 정리되는 걸 직접 관찰해보세요!</p>
            </div>
          </div>
        </div>

        {/* 4. 실제 AI와의 비교 */}
        <div className="p-5 bg-slate-50 rounded-xl border border-slate-200">
          <p className="text-sm font-bold text-slate-900 mb-3">그런데 ChatGPT 같은 진짜 AI는 이것보다 얼마나 큰가요?</p>
          <div className="text-xs text-slate-700 space-y-3 leading-relaxed">
            <div>
              <p className="text-slate-600">위에서 만져본 네트워크는 뉴런 최대 <strong>약 20개</strong>로, 특징 2개(귀, 주둥이)만 봅니다. 실제 AI는 사진의 <strong>수백만 개 픽셀</strong>을 한 번에 분석합니다.</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-300">
                    <th className="text-left py-1.5 pr-3 font-bold text-slate-800">AI 모델</th>
                    <th className="text-left py-1.5 pr-3 font-bold text-slate-800">파라미터 수</th>
                    <th className="text-left py-1.5 font-bold text-slate-800">개/고양이 비유</th>
                  </tr>
                </thead>
                <tbody className="text-slate-600">
                  <tr className="border-b border-slate-100">
                    <td className="py-1.5 pr-3 font-medium">이 실습 도구</td>
                    <td className="py-1.5 pr-3">~50개</td>
                    <td className="py-1.5">귀 모양만 보고 판단</td>
                  </tr>
                  <tr className="border-b border-slate-100">
                    <td className="py-1.5 pr-3 font-medium">Llama 3 8B</td>
                    <td className="py-1.5 pr-3">80억 개</td>
                    <td className="py-1.5">사진 전체 + 품종까지 맞춤</td>
                  </tr>
                  <tr className="border-b border-slate-100">
                    <td className="py-1.5 pr-3 font-medium">GPT-4</td>
                    <td className="py-1.5 pr-3">약 1.8조 개 (추정)</td>
                    <td className="py-1.5">사진 보고 성격까지 설명</td>
                  </tr>
                  <tr>
                    <td className="py-1.5 pr-3 font-medium">사람의 뇌</td>
                    <td className="py-1.5 pr-3">시냅스 약 100조 개</td>
                    <td className="py-1.5">냄새, 소리까지 종합 판단</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="mt-2 p-3 bg-white rounded-lg border border-slate-200">
              <p className="font-bold text-slate-800 mb-1">💡 "Llama 3 <strong>8B</strong>"에서 8B는 뭔가요?</p>
              <p className="text-slate-600"><strong>B = Billion(10억)</strong>입니다. 즉 8B = 80억 개의 파라미터(연결선의 굵기)를 가진 모델이라는 뜻입니다. 위 네트워크에서 본 선 하나하나가 '파라미터 1개'인데, 그게 80억 개라고 생각하면 됩니다. 이 실습 도구는 "귀랑 주둥이"만 보지만, 80억 개의 파라미터가 있으면 <strong>털 질감, 눈 색깔, 체형, 꼬리 모양</strong>까지 전부 분석할 수 있는 거죠.</p>
            </div>
          </div>
        </div>

        {/* 5. 직접 해보기 가이드 */}
        <div className="p-5 bg-violet-50 rounded-xl border border-violet-200">
          <p className="text-sm font-bold text-violet-900 mb-3">직접 실험해보세요!</p>
          <div className="text-xs text-violet-800 space-y-2 leading-relaxed">
            <p>🧪 <strong>실험 1:</strong> 뉴런 수를 <strong>2개</strong>로 줄이고 원형 데이터로 학습해보세요. "귀 모양"만 보고 판단하는 수준이라 잘 안 맞을 겁니다. <strong>6개</strong>로 늘리면? 훨씬 정확해집니다!</p>
            <p>🧪 <strong>실험 2:</strong> 데이터를 <strong>대각선(✖)</strong>으로 바꾸고 은닉층 1개로 학습해보세요. 잘 안 됩니다! 이건 "귀가 뾰족한 개"와 "주둥이가 긴 고양이"가 섞여 있어서, <strong>은닉층 2개</strong>로 늘려야 복합 판단이 가능합니다.</p>
            <p>🧪 <strong>실험 3:</strong> 학습 속도를 <strong>최대(0.1)</strong>로 올려보세요. "이 사진 개다! 아니 고양이다! 아니 개다!" 하면서 오답률이 들쭉날쭉합니다. <strong>0.005</strong>로 낮추면 느리지만 안정적이에요.</p>
            <p className="text-violet-600 mt-2">→ 이런 조절을 실제 AI 개발에서는 <strong>"하이퍼파라미터 튜닝"</strong>이라고 합니다. AI 엔지니어들이 하는 핵심 작업 중 하나입니다!</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── TAB 3: AI in Power Industry ──────────────────────
const Tab3 = ({ onScore }) => {
  const t = T.apply;
  const [scenario, setScenario] = useState(null);
  const [showAi, setShowAi] = useState(false);
  const [gameRunning, setGameRunning] = useState(false);
  const [aiMode, setAiMode] = useState(false);
  const [gameTime, setGameTime] = useState(0);
  const [sliderVal, setSliderVal] = useState(50);
  const [demandHistory, setDemandHistory] = useState([]);
  const [supplyHistory, setSupplyHistory] = useState([]);
  const [score, setScore] = useState(100);
  const [gameOver, setGameOver] = useState(false);
  const [survived, setSurvived] = useState(false);
  const gameRef = useRef(null);

  const scenarios = [
    { id: "heat", label: "갑작스러운 폭염", icon: "🌡️", desc: "에어컨 사용 급증으로 수요 예측 불가" },
    { id: "factory", label: "대규모 공장 가동", icon: "🏭", desc: "갑작스러운 산업 수요 급증 발생" },
  ];

  useEffect(() => {
    if (gameRunning && !gameOver) {
      gameRef.current = setInterval(() => {
        setGameTime(prev => {
          const newTime = prev + 1;
          if (newTime >= 100) { clearInterval(gameRef.current); setGameOver(true); setSurvived(true); return 100; }
          const demand = 50 + Math.sin(newTime * 0.15) * 20 + Math.sin(newTime * 0.07) * 15 + (Math.random() - 0.5) * 10;
          const d = Math.max(10, Math.min(90, demand));
          setDemandHistory(p => [...p.slice(-40), d]);
          if (aiMode) { setSliderVal(d); setSupplyHistory(p => [...p.slice(-40), d]); }
          else {
            setSupplyHistory(p => [...p.slice(-40), sliderVal]);
            if (Math.abs(sliderVal - d) > 25) {
              setScore(p => {
                const ns = p - 2;
                if (ns <= 0) { clearInterval(gameRef.current); setGameOver(true); setSurvived(false); return 0; }
                return ns;
              });
            }
          }
          return newTime;
        });
      }, 100);
      return () => clearInterval(gameRef.current);
    }
  }, [gameRunning, gameOver, aiMode, sliderVal]);

  const startGame = () => {
    setGameRunning(true); setGameOver(false); setSurvived(false);
    setGameTime(0); setDemandHistory([]); setSupplyHistory([]);
    setScore(100); setAiMode(false); setSliderVal(50);
  };

  useEffect(() => {
    if (gameOver) onScore?.("apply", survived ? score : 0, 100);
  }, [gameOver]);

  const MiniChart = ({ data, color }) => {
    if (data.length < 2) return <div className="w-full h-full" style={{ background: "rgba(255,255,255,0.02)" }} />;
    const pts = data.map((v, i) => `${(i / (data.length - 1)) * 100},${100 - v}`).join(" ");
    return (
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full">
        <polyline points={pts} fill="none" stroke={color} strokeWidth="2.5" vectorEffect="non-scaling-stroke"
          style={{ filter: `drop-shadow(0 0 4px ${color}80)` }} />
      </svg>
    );
  };

  return (
    <div className="space-y-6">
      {/* 도입부 — 전력산업에 AI가 필요한 이유 */}
      <Card t={t}>
        <div className="text-center mb-2">
          <span className="text-3xl">⚡</span>
        </div>
        <h3 className="text-lg font-bold text-center text-slate-900 mb-2">왜 전력산업에 AI가 필요할까요?</h3>
        <p className="text-sm text-center text-slate-500 mb-5">사실 전력 관리는 AI가 가장 빛을 발하는 분야 중 하나입니다.</p>

        <div className="space-y-3 mb-5">
          <div className="p-4 rounded-xl" style={{ background: t.dim, border: `1px solid ${t.border}` }}>
            <p className="text-sm font-bold text-slate-800 mb-2">🤯 전력은 '저장'이 거의 안 됩니다</p>
            <p className="text-xs text-slate-600 leading-relaxed">배터리 기술이 발전했지만, 우리나라 전체 전력을 저장하려면 현재 기술로는 <strong>수백조 원</strong>이 필요합니다. 그래서 전력은 <strong>"쓰는 만큼 딱 맞춰서 만들어야"</strong> 합니다. 많이 만들면 낭비, 적게 만들면 정전. 이 균형을 매 순간 맞추는 게 핵심입니다.</p>
          </div>

          <div className="p-4 rounded-xl" style={{ background: t.dim, border: `1px solid ${t.border}` }}>
            <p className="text-sm font-bold text-slate-800 mb-2">👷 지금까지는 사람이 했습니다</p>
            <p className="text-xs text-slate-600 leading-relaxed">"내일 기온이 33도니까 에어컨 수요가 늘겠지" — 이렇게 <strong>경험과 감</strong>으로 수요를 예측해왔습니다. 하지만 갑작스러운 폭염, 한파, 대규모 공장 가동, 전기차 충전 급증 같은 <strong>돌발 상황</strong>에서는 사람의 예측이 크게 빗나갈 수 있습니다.</p>
          </div>

          <div className="p-4 rounded-xl" style={{ background: t.dim, border: `1px solid ${t.border}` }}>
            <p className="text-sm font-bold text-slate-800 mb-2">🤖 AI는 뭐가 다른가요?</p>
            <p className="text-xs text-slate-600 leading-relaxed">AI는 <strong>과거 10년치 기상 데이터, 요일별 전력 패턴, 산업 가동 스케줄, SNS 이벤트 정보</strong>까지 수천 개의 변수를 동시에 분석합니다. 사람이 "기온"과 "요일" 2개만 볼 때, AI는 2,000개를 봅니다. 아까 배운 신경망에서 뉴런 2개와 2,000개의 차이, 기억나시죠?</p>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white" style={{ border: `1px solid ${t.border}` }}>
          <p className="text-xs font-bold text-slate-700 mb-2">📊 실제 효과 — 숫자로 보면</p>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div>
              <p className="text-xl font-bold" style={{ color: t.accent }}>97%</p>
              <p className="text-[10px] text-slate-500">AI 수요 예측 정확도</p>
            </div>
            <div>
              <p className="text-xl font-bold" style={{ color: t.accent }}>30%↓</p>
              <p className="text-[10px] text-slate-500">설비 점검 비용 절감</p>
            </div>
            <div>
              <p className="text-xl font-bold" style={{ color: t.accent }}>50%↓</p>
              <p className="text-[10px] text-slate-500">정전 사고 감소</p>
            </div>
          </div>
        </div>

        <p className="text-xs text-slate-400 text-center mt-4">아래에서 직접 수동 예측 vs AI 예측을 체험해보세요. 차이를 몸으로 느끼실 겁니다!</p>
      </Card>

      <Card t={t}>
        <SecHead icon={BookOpen} label="전력망의 미래 — 수동 vs AI 예측 비교" t={t} />
        <p className="text-sm text-slate-500 mb-6">시나리오를 선택해 수동 예측과 AI 예측의 차이를 비교해 보세요.</p>
        <div className="grid grid-cols-2 gap-3 mb-6">
          {scenarios.map(s => (
            <button key={s.id} onClick={() => { setScenario(s.id); setShowAi(false); }}
              className="p-4 rounded-xl text-left transition-all duration-200"
              style={{
                background: scenario === s.id ? t.dim : "#f8fafc",
                border: `1px solid ${scenario === s.id ? t.border : "rgba(0,0,0,0.07)"}`,
                boxShadow: scenario === s.id ? `0 0 20px ${t.glow}` : "none",
              }}>
              <span className="text-2xl block mb-2">{s.icon}</span>
              <span className="text-sm font-bold text-slate-800 block">{s.label}</span>
              <span className="text-xs text-slate-400">{s.desc}</span>
            </button>
          ))}
        </div>
        {scenario && (
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: "수동 예측", icon: User, color: "#f87171", ok: false, show: true },
              { label: "AI 예측", icon: Bot, color: "#34d399", ok: true, show: showAi },
            ].map((side, i) => (
              <div key={i} className="rounded-xl p-4"
                style={{ background: "#f8fafc", border: `1px solid ${side.show ? (side.ok ? "rgba(52,211,153,0.2)" : "rgba(248,113,113,0.2)") : "rgba(0,0,0,0.07)"}` }}>
                <div className="flex items-center gap-2 mb-3">
                  <side.icon size={13} style={{ color: side.color }} />
                  <span className="text-xs font-bold" style={{ color: side.color }}>{side.label}</span>
                </div>
                <div className="h-20 rounded-lg overflow-hidden mb-3" style={{ background: "rgba(255,255,255,0.02)" }}>
                  {side.show ? (
                    <svg viewBox="0 0 200 80" className="w-full h-full">
                      {i === 0 ? (
                        scenario === "heat"
                          ? <polyline points="0,60 30,55 50,50 70,40 80,20 90,50 110,15 130,55 150,25 180,45 200,30" fill="none" stroke={side.color} strokeWidth="2" style={{ filter: `drop-shadow(0 0 4px ${side.color}60)` }} />
                          : <polyline points="0,50 20,50 40,45 50,15 60,55 80,10 100,60 120,20 150,50 200,45" fill="none" stroke={side.color} strokeWidth="2" style={{ filter: `drop-shadow(0 0 4px ${side.color}60)` }} />
                      ) : (
                        <polyline points="0,60 30,55 50,50 70,40 80,25 90,30 110,22 130,28 150,25 180,27 200,30" fill="none" stroke={side.color} strokeWidth="2" style={{ filter: `drop-shadow(0 0 4px ${side.color}60)` }} />
                      )}
                      <polyline points="0,55 50,53 100,50 150,48 200,45" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" strokeDasharray="4 2" />
                    </svg>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Lock size={16} className="text-slate-600" />
                    </div>
                  )}
                </div>
                {side.show && (
                  <p className="text-xs font-semibold" style={{ color: side.color }}>
                    {side.ok ? "✅ 수만 건 데이터로 즉시 대응!" : "⚠️ 예측 실패! 수급 불균형!"}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
        {scenario && !showAi && (
          <div className="mt-4">
            <PBtn t={t} onClick={() => setShowAi(true)}>⚡ AI 예측 활성화</PBtn>
          </div>
        )}
      </Card>

      <Card t={t} game>
        <GameHead icon={Gamepad2} label="블랙아웃을 막아라!" t={t} />
        {!gameRunning ? (
          <div className="text-center py-8">
            <p className="text-sm text-slate-500 mb-2">전력 수요에 맞춰 발전량을 조절하세요!</p>
            <p className="text-xs text-slate-600 mb-6">차이가 너무 크면 정전 발생 💥</p>
            <PBtn t={t} onClick={startGame} icon={Play}>시작하기</PBtn>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="px-3 py-1.5 rounded-lg text-xs font-bold"
                  style={{
                    background: score > 50 ? "rgba(52,211,153,0.12)" : score > 20 ? "rgba(251,191,36,0.12)" : "rgba(248,113,113,0.12)",
                    color: score > 50 ? "#34d399" : score > 20 ? "#fbbf24" : "#f87171",
                    border: `1px solid ${score > 50 ? "rgba(52,211,153,0.3)" : score > 20 ? "rgba(251,191,36,0.3)" : "rgba(248,113,113,0.3)"}`,
                  }}>
                  안정도 {score}%
                </div>
                <span className="text-xs text-slate-600 font-mono">{Math.round(gameTime)}%</span>
              </div>
              {!aiMode && !gameOver && (
                <PBtn t={t} onClick={() => setAiMode(true)} className="text-xs py-2 px-3">
                  <Cpu size={12} /> AI 모드
                </PBtn>
              )}
              {aiMode && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
                  style={{ background: t.dim, border: `1px solid ${t.border}` }}>
                  <Bot size={12} style={{ color: t.accent }} />
                  <span className="text-xs font-bold" style={{ color: t.accent }}>AI 자동 제어</span>
                </div>
              )}
            </div>

            <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "#e2e8f0" }}>
              <div className="h-full rounded-full transition-all" style={{ width: `${gameTime}%`, background: t.grad }} />
            </div>

            <div className="rounded-xl p-4" style={{ background: "#f8fafc", border: "1px solid rgba(0,0,0,0.07)" }}>
              <div className="flex gap-4 text-xs font-semibold mb-3">
                <span className="flex items-center gap-1.5" style={{ color: "#f87171" }}>
                  <div className="w-4 h-0.5 rounded" style={{ background: "#f87171" }} />전력 수요
                </span>
                <span className="flex items-center gap-1.5" style={{ color: "#38bdf8" }}>
                  <div className="w-4 h-0.5 rounded" style={{ background: "#38bdf8" }} />발전량(나)
                </span>
              </div>
              <div className="h-20 relative rounded-lg overflow-hidden" style={{ background: "rgba(0,0,0,0.04)" }}>
                <MiniChart data={demandHistory} color="#f87171" />
                <div className="absolute inset-0"><MiniChart data={supplyHistory} color="#38bdf8" /></div>
              </div>
            </div>

            {!aiMode && !gameOver && (
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">발전량 조절</span>
                  <span className="font-mono font-bold" style={{ color: t.accent }}>{Math.round(sliderVal)}%</span>
                </div>
                <input type="range" min="0" max="100" value={sliderVal}
                  onChange={e => setSliderVal(Number(e.target.value))}
                  className="w-full h-2 rounded-full appearance-none cursor-pointer"
                  style={{ accentColor: t.accent }} />
              </div>
            )}

            {gameOver && (
              <div className="p-5 rounded-xl text-center"
                style={{
                  background: survived ? "rgba(52,211,153,0.08)" : "rgba(248,113,113,0.08)",
                  border: `1px solid ${survived ? "rgba(52,211,153,0.3)" : "rgba(248,113,113,0.3)"}`,
                }}>
                <p className="text-xl font-black text-slate-800 mb-1">{survived ? "🎉 블랙아웃 방어 성공!" : "💥 정전 발생!"}</p>
                <p className="text-sm text-slate-500">{survived ? (aiMode ? "AI 덕분에 안정 유지!" : "수동으로 성공! 대단합니다!") : "수요와 공급의 괴리가 너무 커졌습니다."}</p>
                <div className="mt-4"><GBtn onClick={startGame}><RotateCcw size={13} />다시 하기</GBtn></div>
              </div>
            )}
          </div>
        )}
      </Card>
    </div>
  );
};

// ─── TAB 4: Prompt Tips ───────────────────────────────
const Tab4 = ({ onScore }) => {
  const t = T.prompt;
  const [activeBlock, setActiveBlock] = useState(null);
  const [slots, setSlots] = useState([null, null, null]);
  const [gameSubmitted, setGameSubmitted] = useState(false);

  const conceptBlocks = [
    { id: "role", label: "역할 부여", example: "넌 한국전력 10년 차 과장이야", icon: User, desc: "AI에게 전문가 역할을 부여하면 해당 분야 어조와 전문 용어를 사용한 답변을 받습니다. '신입사원에게 역할을 주는 것'과 같습니다." },
    { id: "context", label: "구체적 맥락", example: "지금 폭우로 송전탑 문제가 생겼어", icon: Target, desc: "현재 상황과 배경을 구체적으로 알려주세요. '문제가 생겼어'보다 '154kV 송전선이 끊겨서 3개 지역이 정전됐어'가 훨씬 정확합니다." },
    { id: "format", label: "출력 형식", example: "안내문을 3문단으로 써줘", icon: FileText, desc: "원하는 출력 형태를 명확히 지정하세요. '알려줘'보다 '5단계 체크리스트로', '3문단 안내문으로' 처럼 구체적으로 요청하세요." },
  ];

  const gradients = [
    "linear-gradient(135deg,#047857,#34d399)",
    "linear-gradient(135deg,#0369a1,#38bdf8)",
    "linear-gradient(135deg,#7c3aed,#a78bfa)",
  ];

  const allBlocks = [
    { id: "g1", text: "넌 전력설비 전문 엔지니어야", type: "role", good: true },
    { id: "g2", text: "오늘 강풍으로 154kV 송전선이 끊겼어", type: "context", good: true },
    { id: "g3", text: "복구 절차를 단계별 체크리스트로 작성해", type: "format", good: true },
    { id: "b1", text: "대충 써줘", type: "bad", good: false },
    { id: "b2", text: "뭔가 좋은 거 만들어봐", type: "bad", good: false },
    { id: "b3", text: "알아서 해", type: "bad", good: false },
  ];

  const shuffled = useRef([...allBlocks].sort(() => Math.random() - 0.5));
  const slotLabels = ["① 역할", "② 맥락", "③ 형식"];

  const fill = (blockId, slotIdx) => {
    if (gameSubmitted) return;
    const ns = [...slots];
    const ex = ns.indexOf(blockId);
    if (ex !== -1) ns[ex] = null;
    ns[slotIdx] = blockId;
    setSlots(ns);
  };

  const allGood = slots.every(s => allBlocks.find(b => b.id === s)?.good);

  useEffect(() => {
    if (gameSubmitted) onScore?.("prompt", allGood ? 3 : slots.filter(s => allBlocks.find(b => b.id === s)?.good).length, 3);
  }, [gameSubmitted]);

  return (
    <div className="space-y-6">
      <Card t={t}>
        <SecHead icon={BookOpen} label="업무 지시 공식 — 완벽한 프롬프트의 3요소" t={t} />
        <p className="text-sm text-slate-500 mb-6">각 블록을 클릭해 설명을 확인하세요.</p>
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          {conceptBlocks.map((b, i) => (
            <button key={b.id} onClick={() => setActiveBlock(activeBlock === b.id ? null : b.id)}
              className="flex-1 p-4 rounded-xl text-left transition-all duration-200"
              style={{
                background: activeBlock === b.id ? t.dim : "#f8fafc",
                border: `1px solid ${activeBlock === b.id ? t.border : "rgba(0,0,0,0.07)"}`,
                boxShadow: activeBlock === b.id ? `0 0 20px ${t.glow}` : "none",
              }}>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: gradients[i] }}>
                  <b.icon size={13} className="text-white" />
                </div>
                <span className="text-sm font-bold text-slate-800">{b.label}</span>
              </div>
              <p className="text-xs font-mono" style={{ color: t.accent }}>"{b.example}"</p>
            </button>
          ))}
        </div>
        {activeBlock && (
          <div className="rounded-xl p-4" style={{ background: t.dim, border: `1px solid ${t.border}`, animation: "fadeIn 0.3s" }}>
            <div className="flex items-start gap-2">
              <Lightbulb size={14} style={{ color: t.accent }} className="mt-0.5 shrink-0" />
              <p className="text-sm text-slate-600">{conceptBlocks.find(b => b.id === activeBlock)?.desc}</p>
            </div>
          </div>
        )}
        <div className="mt-5 p-4 rounded-xl" style={{ background: "#f8fafc", border: "1px solid rgba(0,0,0,0.07)" }}>
          <p className="text-[10px] font-bold tracking-widest uppercase text-slate-500 mb-2">조합 결과</p>
          <p className="text-sm text-slate-700 leading-relaxed">
            <span className="font-bold" style={{ color: "#34d399" }}>[역할]</span> {conceptBlocks[0].example} +{" "}
            <span className="font-bold" style={{ color: "#38bdf8" }}>[맥락]</span> {conceptBlocks[1].example} +{" "}
            <span className="font-bold" style={{ color: "#a78bfa" }}>[형식]</span> {conceptBlocks[2].example}
          </p>
          <p className="text-xs text-slate-500 mt-2">→ 정확하고 실용적인 결과물을 즉시 얻을 수 있습니다!</p>
        </div>
      </Card>

      <Card t={t} game>
        <GameHead icon={Gamepad2} label="프롬프트 깎는 장인" t={t} />
        <p className="text-sm text-slate-500 mb-6">좋은 블록 3개를 골라 올바른 슬롯에 넣으세요!</p>

        <div className="grid grid-cols-3 gap-3 mb-6">
          {slotLabels.map((label, i) => {
            const block = allBlocks.find(b => b.id === slots[i]);
            const isGood = gameSubmitted && block?.good;
            const isBad = gameSubmitted && block && !block.good;
            return (
              <div key={i} className="rounded-xl p-3 min-h-[90px] flex flex-col transition-all duration-300"
                style={{
                  background: isGood ? "rgba(52,211,153,0.08)" : isBad ? "rgba(248,113,113,0.08)" : slots[i] ? t.dim : "rgba(255,255,255,0.02)",
                  border: `2px dashed ${isGood ? "rgba(52,211,153,0.4)" : isBad ? "rgba(248,113,113,0.4)" : slots[i] ? t.border : "rgba(0,0,0,0.08)"}`,
                }}>
                <span className="text-[10px] font-bold tracking-widest uppercase mb-2"
                  style={{ color: isGood ? "#34d399" : isBad ? "#f87171" : t.accent }}>{label}</span>
                {block ? (
                  <span className="text-xs font-medium text-slate-700 flex-1">{block.text}</span>
                ) : (
                  <span className="text-xs text-slate-600 flex-1">비어있음</span>
                )}
                {isGood && <CheckCircle2 size={13} style={{ color: "#34d399" }} className="mt-1" />}
                {isBad && <XCircle size={13} style={{ color: "#f87171" }} className="mt-1" />}
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-6">
          {shuffled.current.map(block => {
            const inSlot = slots.includes(block.id);
            return (
              <div key={block.id} className="rounded-xl p-3 transition-all duration-200"
                style={{
                  background: inSlot ? "#f1f5f9" : "#f8fafc",
                  border: `1px solid rgba(0,0,0,0.08)`,
                  opacity: inSlot ? 0.3 : 1,
                }}>
                <p className="text-xs font-medium text-slate-700 mb-2">{block.text}</p>
                {!inSlot && !gameSubmitted && (
                  <div className="flex gap-1">
                    {[0, 1, 2].map(si => (
                      <button key={si} onClick={() => fill(block.id, si)}
                        className="flex-1 text-[10px] py-1 rounded-lg font-bold transition-all duration-150"
                        style={{ background: t.dim, color: t.accent, border: `1px solid ${t.border}` }}
                        onMouseEnter={e => { e.currentTarget.style.background = t.grad; e.currentTarget.style.color = "white"; }}
                        onMouseLeave={e => { e.currentTarget.style.background = t.dim; e.currentTarget.style.color = t.accent; }}>
                        슬롯{si + 1}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {!gameSubmitted ? (
          <PBtn t={t} onClick={() => setGameSubmitted(true)} disabled={slots.some(s => s === null)}>
            제출하기
          </PBtn>
        ) : (
          <div className="space-y-4">
            <div className="p-5 rounded-xl text-center"
              style={{
                background: allGood ? "rgba(52,211,153,0.08)" : "rgba(248,113,113,0.08)",
                border: `1px solid ${allGood ? "rgba(52,211,153,0.3)" : "rgba(248,113,113,0.3)"}`,
              }}>
              <p className="text-xl font-black text-slate-800 mb-1">{allGood ? "🏆 프롬프트 장인 달성!" : "😵 AI가 혼란스러워합니다!"}</p>
              <p className="text-sm text-slate-500">{allGood ? "완벽한 조합입니다!" : '"대충 써줘" 같은 모호한 지시는 좋은 결과를 내지 못해요.'}</p>
            </div>
            <GBtn onClick={() => { setSlots([null, null, null]); setGameSubmitted(false); }}>
              <RotateCcw size={13} />다시 하기
            </GBtn>
          </div>
        )}
      </Card>
    </div>
  );
};

// ─── TAB 5: AI Ethics & Hallucination ─────────────────
const Tab5 = ({ onScore }) => {
  const t = T.ethics;
  const [tempSlider, setTempSlider] = useState(30);
  const [showSecurity, setShowSecurity] = useState(false);
  const [secPhase, setSecPhase] = useState(0);
  const [currentCard, setCurrentCard] = useState(0);
  const [results, setResults] = useState([]);
  const [cardAnim, setCardAnim] = useState("");

  const hallucinationExamples = [
    { temp: 10, text: "한국전력은 전력 공급을 담당하는 공기업입니다.", label: "✅ 사실" },
    { temp: 35, text: "한국전력은 1961년에 설립된 공기업입니다.", label: "✅ 사실" },
    { temp: 60, text: "한국전력은 세계 최대 규모의 전력 회사 중 하나입니다.", label: "⚠️ 살짝 과장" },
    { temp: 80, text: "에디슨이 1899년에 한국전력을 직접 설립했다고 합니다.", label: "🚨 환각!" },
    { temp: 95, text: "에디슨이 조선시대에 한국전력을 세워 경복궁에 전기를 공급했습니다.", label: "💀 심한 환각!" },
  ];

  const curHalluc = hallucinationExamples.reduce((prev, cur) =>
    Math.abs(cur.temp - tempSlider) < Math.abs(prev.temp - tempSlider) ? cur : prev
  );

  const isWarning = tempSlider > 70;
  const isMild = tempSlider > 50 && !isWarning;

  const handleSecurity = () => {
    setShowSecurity(true); setSecPhase(0);
    setTimeout(() => setSecPhase(1), 800);
    setTimeout(() => setSecPhase(2), 1600);
  };

  const cards = [
    { text: "우리 본부 하반기 예산안 엑셀 요약해 줘", danger: true, reason: "사내 기밀 예산 정보가 외부로 유출될 수 있습니다." },
    { text: "파이썬으로 데이터 정렬하는 코드 짜줘", danger: false, reason: "일반적인 프로그래밍 질문으로 보안 위험이 없습니다." },
    { text: "고객 김OO의 전화번호와 주소 정리해 줘", danger: true, reason: "고객 개인정보 입력 시 개인정보보호법 위반입니다." },
    { text: "이메일 문법 교정해 줘", danger: false, reason: "일반적인 문법 교정은 보안 위험이 없습니다." },
    { text: "신규 발전소 건설 도면 분석해 줘", danger: true, reason: "미공개 인프라 도면은 국가 핵심 기밀입니다." },
    { text: "엑셀 VLOOKUP 함수 사용법 알려줘", danger: false, reason: "일반 업무 도구 사용법은 보안 위험이 없습니다." },
  ];

  const swipe = (block) => {
    const card = cards[currentCard];
    const correct = block === card.danger;
    setCardAnim(block ? "swipe-left" : "swipe-right");
    setTimeout(() => {
      setResults(p => [...p, { correct, card }]);
      setCurrentCard(p => p + 1);
      setCardAnim("");
    }, 300);
  };

  const gameScore = results.filter(r => r.correct).length;
  useEffect(() => {
    if (results.length === cards.length) onScore?.("ethics", gameScore, cards.length);
  }, [results]);

  return (
    <div className="space-y-6">
      <Card t={t}>
        <SecHead icon={BookOpen} label="AI 주의사항 — 환각과 보안 위험" t={t} />

        <div className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle size={15} style={{ color: t.accent }} />
            <h4 className="font-bold text-slate-800 text-sm">환각 (Hallucination)</h4>
          </div>
          <p className="text-sm text-slate-500 mb-5">상상력 온도를 올려보세요. AI가 점점 그럴싸한 거짓말을 만들어냅니다.</p>
          <div className="rounded-xl p-5" style={{ background: "rgba(248,113,113,0.05)", border: "1px solid rgba(248,113,113,0.12)" }}>
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-500">🧊 정확</span>
                <span style={{ color: t.accent }}>상상력 온도 {tempSlider}%</span>
                <span className="text-slate-500">🔥 위험</span>
              </div>
              <input type="range" min="0" max="100" value={tempSlider}
                onChange={e => setTempSlider(Number(e.target.value))}
                className="w-full" style={{ accentColor: t.accent }} />
            </div>
            <div className="p-4 rounded-xl transition-all duration-500"
              style={{
                background: isWarning ? "rgba(248,113,113,0.1)" : isMild ? "rgba(251,191,36,0.1)" : "rgba(52,211,153,0.1)",
                border: `1px solid ${isWarning ? "rgba(248,113,113,0.3)" : isMild ? "rgba(251,191,36,0.3)" : "rgba(52,211,153,0.3)"}`,
              }}>
              <div className="flex items-center gap-2 mb-2">
                <Bot size={13} className="text-slate-400" />
                <span className="text-xs text-slate-400">AI 출력:</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                  style={{
                    background: isWarning ? "rgba(248,113,113,0.2)" : isMild ? "rgba(251,191,36,0.2)" : "rgba(52,211,153,0.2)",
                    color: isWarning ? "#f87171" : isMild ? "#fbbf24" : "#34d399",
                  }}>
                  {curHalluc.label}
                </span>
              </div>
              <p className="text-sm text-slate-700">{curHalluc.text}</p>
            </div>
          </div>
        </div>

        <div>
          <div className="flex items-center gap-2 mb-3">
            <Shield size={15} style={{ color: t.accent }} />
            <h4 className="font-bold text-slate-800 text-sm">보안 위험</h4>
          </div>
          <p className="text-sm text-slate-500 mb-5">기밀 데이터를 AI에 입력하면 어떤 일이 생기는지 확인해 보세요.</p>
          <div className="rounded-xl p-5" style={{ background: "rgba(248,113,113,0.05)", border: "1px solid rgba(248,113,113,0.12)" }}>
            {!showSecurity ? (
              <div className="text-center">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg mb-4"
                  style={{ background: "#f8fafc", border: "1px solid rgba(0,0,0,0.08)" }}>
                  <FileText size={13} className="text-slate-400" />
                  <span className="text-sm text-slate-600">"2026_발전소_설계도면_v3.dwg"</span>
                </div>
                <br />
                <PBtn t={t} onClick={handleSecurity}>⬆️ AI에 업로드 시뮬레이션</PBtn>
              </div>
            ) : (
              <div className="space-y-3">
                {[
                  { phase: 0, icon: Send, bg: "rgba(255,255,255,0.04)", border: "rgba(0,0,0,0.08)", text: "rgba(148,163,184,1)", label: "파일을 AI 서버로 전송 중..." },
                  { phase: 1, icon: Globe, bg: "rgba(251,191,36,0.08)", border: "rgba(251,191,36,0.25)", text: "#fbbf24", label: "⚠️ 데이터가 외부 서버(미국)에 저장됨!" },
                  { phase: 2, icon: AlertTriangle, bg: "rgba(248,113,113,0.08)", border: "rgba(248,113,113,0.25)", text: "#f87171", label: "🚨 기밀 도면이 외부 서버에 영구 저장될 수 있습니다. 절대 사내 기밀을 외부 AI에 입력하지 마세요!" },
                ].map((row, i) => (
                  secPhase >= i && (
                    <div key={i} className="flex items-start gap-3 p-3 rounded-lg"
                      style={{ background: row.bg, border: `1px solid ${row.border}`, animation: i > 0 ? "fadeIn 0.4s" : "" }}>
                      <row.icon size={14} style={{ color: row.text }} className="mt-0.5 shrink-0" />
                      <span className="text-sm" style={{ color: row.text }}>{row.label}</span>
                    </div>
                  )
                ))}
                {secPhase >= 2 && (
                  <GBtn onClick={() => { setShowSecurity(false); setSecPhase(0); }}>
                    <RotateCcw size={12} />리셋
                  </GBtn>
                )}
              </div>
            )}
          </div>
        </div>
      </Card>

      <Card t={t} game>
        <GameHead icon={Gamepad2} label="보안관 스와이프" t={t} />
        <p className="text-sm text-slate-500 mb-6">AI 사용 요청을 심사하세요. 위험하면 차단, 안전하면 허용!</p>

        {currentCard < cards.length ? (
          <div className="space-y-6">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-slate-500">{currentCard + 1} / {cards.length}</span>
              <span style={{ color: t.accent }}>정답 {gameScore}/{results.length}</span>
            </div>

            <div className={`relative mx-auto max-w-sm transition-all duration-300 ${
              cardAnim === "swipe-left" ? "-translate-x-full opacity-0 -rotate-12" :
              cardAnim === "swipe-right" ? "translate-x-full opacity-0 rotate-12" : ""
            }`}>
              <div className="p-6 rounded-2xl min-h-[150px] flex flex-col items-center justify-center text-center"
                style={{ background: "#f8fafc", border: "1px solid rgba(0,0,0,0.08)" }}>
                <MessageSquare size={22} className="text-slate-500 mb-4" />
                <p className="text-sm font-bold text-slate-800 leading-relaxed">"{cards[currentCard].text}"</p>
              </div>
            </div>

            <div className="flex justify-center gap-6">
              {[
                { action: true, icon: ThumbsDown, label: "차단", color: "#f87171", dim: "rgba(248,113,113,0.1)", border: "rgba(248,113,113,0.25)" },
                { action: false, icon: ThumbsUp, label: "허용", color: "#34d399", dim: "rgba(52,211,153,0.1)", border: "rgba(52,211,153,0.25)" },
              ].map(btn => (
                <button key={btn.label} onClick={() => swipe(btn.action)}
                  className="flex flex-col items-center gap-2 p-5 rounded-2xl transition-all duration-200 group"
                  style={{ background: btn.dim, border: `1px solid ${btn.border}` }}
                  onMouseEnter={e => { e.currentTarget.style.boxShadow = `0 0 25px ${btn.color}40`; e.currentTarget.style.transform = "translateY(-3px)"; }}
                  onMouseLeave={e => { e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.transform = "translateY(0)"; }}>
                  <btn.icon size={26} style={{ color: btn.color }} />
                  <span className="text-xs font-black" style={{ color: btn.color }}>{btn.label}</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-5">
            <div className="p-5 rounded-xl text-center"
              style={{
                background: gameScore === cards.length ? "rgba(52,211,153,0.08)" : "rgba(251,191,36,0.08)",
                border: `1px solid ${gameScore === cards.length ? "rgba(52,211,153,0.3)" : "rgba(251,191,36,0.3)"}`,
              }}>
              {gameScore === cards.length && <Trophy size={28} style={{ color: "#34d399" }} className="mx-auto mb-2" />}
              <div className="text-4xl font-black text-slate-800 mb-1">{gameScore}<span className="text-xl text-slate-500">/{cards.length}</span></div>
              <p className="text-sm text-slate-600">{gameScore === cards.length ? "🛡️ 완벽한 보안관!" : `${cards.length - gameScore}건을 놓쳤습니다.`}</p>
            </div>
            <div className="space-y-2">
              {results.map((r, i) => (
                <div key={i} className="p-3 rounded-xl"
                  style={{
                    background: r.correct ? "rgba(52,211,153,0.06)" : "rgba(248,113,113,0.06)",
                    border: `1px solid ${r.correct ? "rgba(52,211,153,0.2)" : "rgba(248,113,113,0.2)"}`,
                  }}>
                  <div className="flex items-center gap-2 mb-1">
                    {r.correct
                      ? <CheckCircle2 size={13} style={{ color: "#34d399" }} />
                      : <XCircle size={13} style={{ color: "#f87171" }} />}
                    <span className="text-xs font-semibold text-slate-700">"{r.card.text}"</span>
                  </div>
                  <p className="text-xs text-slate-500 ml-5">{r.card.reason}</p>
                </div>
              ))}
            </div>
            <GBtn onClick={() => { setCurrentCard(0); setResults([]); setCardAnim(""); }}>
              <RotateCcw size={13} />다시 하기
            </GBtn>
          </div>
        )}
      </Card>
    </div>
  );
};

// ─── INDUSTRY CH2: AI가 문서를 읽는 법 (OCR + NLP) ────
const IndustryCH2 = ({ onScore }) => {
  const t = T.apply;
  const [activeCase, setActiveCase] = useState(0);
  const [ocrStep, setOcrStep] = useState(0);

  const cases = [
    {
      company: "Duke Energy (미국)",
      tech: "AI-OCR",
      problem: "현장 작업지시서가 수기로 작성되어 본사 전달까지 수일 소요",
      solution: "AI-OCR이 손글씨 양식을 자동 인식하여 디지털 데이터로 변환",
      result: "처리 속도 50%+ 개선",
      icon: FileText,
    },
    {
      company: "National Grid (영국)",
      tech: "NLP 문서 분류",
      problem: "매년 수만 건의 규제 문서·안전보고서를 수작업 분류",
      solution: "NLP가 문서 내용을 읽고 자동으로 카테고리 분류·핵심 키워드 추출",
      result: "문서 처리 시간 70% 단축",
      icon: Target,
    },
    {
      company: "Enel (이탈리아)",
      tech: "RPA + AI",
      problem: "고객 청구서·계약서 처리에 대규모 인력 투입",
      solution: "AI가 문서 내용을 판단 → RPA가 시스템에 자동 입력",
      result: "연간 수백만 건 자동 처리",
      icon: Workflow,
    },
  ];

  const ocrSteps = [
    { label: "원본 문서", desc: "수기 전기 사용 신청서가 접수됩니다", content: (
      <div className="p-4 bg-amber-50 rounded-xl border-2 border-amber-200 font-mono text-sm space-y-2">
        <p className="text-amber-800 font-bold text-xs mb-3">📋 전기사용 신청서 (수기)</p>
        <div className="space-y-1.5 text-amber-900">
          <p>신청인: <span className="underline decoration-wavy decoration-amber-400">김 영 호</span></p>
          <p>주소: <span className="underline decoration-wavy decoration-amber-400">서울시 강남구 역삼동 123-4</span></p>
          <p>계약종별: <span className="underline decoration-wavy decoration-amber-400">주택용 (저압)</span></p>
          <p>신청전력: <span className="underline decoration-wavy decoration-amber-400">5 kW</span></p>
          <p>신청일: <span className="underline decoration-wavy decoration-amber-400">2026. 4. 15.</span></p>
        </div>
      </div>
    )},
    { label: "OCR 인식", desc: "AI가 문자 영역을 탐지하고 텍스트로 변환합니다", content: (
      <div className="p-4 bg-blue-50 rounded-xl border-2 border-blue-200 space-y-2">
        <p className="text-blue-800 font-bold text-xs mb-3">🔍 OCR 텍스트 추출 결과</p>
        <div className="space-y-1 font-mono text-xs">
          {[
            { field: "영역 1", text: "김 영 호", confidence: 94 },
            { field: "영역 2", text: "서울시 강남구 역삼동 123-4", confidence: 91 },
            { field: "영역 3", text: "주택용 (저압)", confidence: 97 },
            { field: "영역 4", text: "5 kW", confidence: 99 },
            { field: "영역 5", text: "2026. 4. 15.", confidence: 96 },
          ].map((r, i) => (
            <div key={i} className="flex items-center gap-2 p-1.5 bg-white rounded-lg">
              <span className="text-blue-400 w-12">{r.field}</span>
              <span className="text-blue-800 flex-1 font-semibold">{r.text}</span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${r.confidence >= 95 ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>{r.confidence}%</span>
            </div>
          ))}
        </div>
      </div>
    )},
    { label: "NLP 분류", desc: "자연어 처리로 각 텍스트가 어떤 필드인지 자동 매핑합니다", content: (
      <div className="p-4 bg-purple-50 rounded-xl border-2 border-purple-200 space-y-2">
        <p className="text-purple-800 font-bold text-xs mb-3">🧠 NLP 필드 매핑</p>
        <div className="space-y-1.5">
          {[
            { raw: "김 영 호", field: "신청인명", type: "PERSON" },
            { raw: "서울시 강남구 역삼동 123-4", field: "주소", type: "ADDRESS" },
            { raw: "주택용 (저압)", field: "계약종별", type: "CONTRACT_TYPE" },
            { raw: "5 kW", field: "신청전력", type: "POWER_VALUE" },
            { raw: "2026. 4. 15.", field: "신청일", type: "DATE" },
          ].map((r, i) => (
            <div key={i} className="flex items-center gap-2 text-xs">
              <span className="font-mono text-gray-500 w-36 truncate">"{r.raw}"</span>
              <ArrowRight size={10} className="text-purple-300 shrink-0" />
              <span className="font-bold text-purple-700">{r.field}</span>
              <span className="text-[9px] px-1.5 py-0.5 bg-purple-200 text-purple-700 rounded-full">{r.type}</span>
            </div>
          ))}
        </div>
      </div>
    )},
    { label: "자동 입력", desc: "구조화된 데이터가 업무 시스템에 자동 등록됩니다", content: (
      <div className="p-4 bg-emerald-50 rounded-xl border-2 border-emerald-200 space-y-2">
        <p className="text-emerald-800 font-bold text-xs mb-3">✅ 시스템 자동 등록 완료</p>
        <div className="bg-white rounded-lg border border-emerald-200 overflow-hidden">
          <table className="w-full text-xs">
            <tbody>
              {[
                ["신청인명", "김영호"], ["주소", "서울시 강남구 역삼동 123-4"],
                ["계약종별", "주택용 (저압)"], ["신청전력", "5 kW"], ["신청일", "2026-04-15"],
                ["상태", "✅ 접수 완료 — 자동 처리"],
              ].map(([k, v], i) => (
                <tr key={i} className={i % 2 ? "bg-emerald-50/50" : ""}>
                  <td className="px-3 py-2 font-semibold text-gray-600 w-24">{k}</td>
                  <td className="px-3 py-2 text-gray-800">{v}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-[10px] text-emerald-600 text-center mt-2">기존 수작업 30분 → AI 자동 처리 2분</p>
      </div>
    )},
  ];

  return (
    <div className="space-y-8">
      <Card t={t}>
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-lg" style={{ background: t.dim, border: `1px solid ${t.border}` }}>
            <FileText size={18} style={{ color: t.accent }} />
          </div>
          <div>
            <p className="text-[10px] font-bold tracking-widest uppercase" style={{ color: t.accent }}>OCR + NLP</p>
            <h2 className="text-lg font-black text-slate-800">AI가 문서를 읽는 법</h2>
          </div>
        </div>
        <p className="text-sm text-slate-500 mb-6">수기 양식, PDF, 보고서를 AI가 자동으로 읽고 분류하고 시스템에 입력하는 기술</p>

        {/* Pain point */}
        <div className="p-4 rounded-xl mb-6" style={{ background: "rgba(234,88,12,0.06)", border: "1px solid rgba(234,88,12,0.15)" }}>
          <p className="text-sm text-orange-800 font-medium mb-1">왜 필요한가?</p>
          <p className="text-xs text-orange-700">전력산업에서는 신청서, 점검보고서, 작업지시서 등 수기/PDF 문서가 아직도 많습니다. 사람이 읽고 입력하면 느리고 오류가 생깁니다. AI가 이 과정을 자동화합니다.</p>
        </div>

        {/* OCR simulation */}
        <div className="mb-8">
          <p className="text-xs font-bold text-gray-500 tracking-widest uppercase mb-4">INTERACTIVE — 신청서 AI 자동 처리 시뮬레이션</p>
          <div className="flex gap-1.5 mb-4 overflow-x-auto pb-1">
            {ocrSteps.map((s, i) => (
              <button key={i} onClick={() => setOcrStep(i)}
                className={`shrink-0 px-3 py-2 rounded-lg text-xs font-medium transition-all ${i === ocrStep ? "text-white" : "bg-gray-50 text-gray-500 hover:bg-gray-100"}`}
                style={i === ocrStep ? { background: t.accent } : {}}>
                {i + 1}. {s.label}
              </button>
            ))}
          </div>
          <p className="text-xs text-gray-500 mb-3">{ocrSteps[ocrStep].desc}</p>
          <div style={{ animation: "fadeIn 0.4s ease-out" }} key={ocrStep}>
            {ocrSteps[ocrStep].content}
          </div>
          <div className="flex justify-between mt-4">
            <button onClick={() => setOcrStep(Math.max(0, ocrStep - 1))} disabled={ocrStep === 0} className="flex items-center gap-1 px-3 py-1.5 text-xs text-gray-500 disabled:opacity-30"><ArrowLeft size={12} />이전</button>
            <button onClick={() => setOcrStep(Math.min(ocrSteps.length - 1, ocrStep + 1))} disabled={ocrStep >= ocrSteps.length - 1} className="flex items-center gap-1 px-3 py-1.5 text-xs text-gray-500 disabled:opacity-30">다음<ArrowRight size={12} /></button>
          </div>
        </div>

        {/* Global cases */}
        <p className="text-xs font-bold text-gray-500 tracking-widest uppercase mb-4">GLOBAL CASES — 해외 전력회사 도입 사례</p>
        <div className="space-y-3">
          {cases.map((c, i) => {
            const Icon = c.icon;
            return (
              <button key={i} onClick={() => setActiveCase(activeCase === i ? -1 : i)}
                className="w-full text-left p-4 rounded-xl border transition-all"
                style={{ background: activeCase === i ? t.dim : "#f8fafc", borderColor: activeCase === i ? t.border : "rgba(0,0,0,0.07)" }}>
                <div className="flex items-center gap-3">
                  <Icon size={16} style={{ color: t.accent }} className="shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-bold text-gray-800">{c.company}</p>
                    <p className="text-[10px] text-gray-500">{c.tech}</p>
                  </div>
                  <span className="px-2 py-1 rounded-full text-[10px] font-bold" style={{ background: t.dim, color: t.accent }}>{c.result}</span>
                </div>
                {activeCase === i && (
                  <div className="mt-3 space-y-2" style={{ animation: "fadeIn 0.3s ease-out" }}>
                    <div className="p-3 bg-white rounded-lg"><p className="text-xs text-gray-600"><strong>문제:</strong> {c.problem}</p></div>
                    <div className="p-3 bg-white rounded-lg"><p className="text-xs text-gray-600"><strong>솔루션:</strong> {c.solution}</p></div>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </Card>
    </div>
  );
};

// ─── INDUSTRY CH3: AI가 이미지를 보는 법 (CV) ─────────
const IndustryCH3 = ({ onScore }) => {
  const t = T.apply;
  const [inspecting, setInspecting] = useState(null);
  const [answers, setAnswers] = useState({});
  const [showResult, setShowResult] = useState(false);
  const [activeCase, setActiveCase] = useState(-1);

  const poles = [
    { id: 1, label: "전주 A", status: "정상", hasDefect: false, features: "균열 없음, 기울기 0.5° 이내, 도장 양호" },
    { id: 2, label: "전주 B", status: "기울어짐", hasDefect: true, features: "기울기 4.2° (기준 3° 초과), 기초부 침하 의심" },
    { id: 3, label: "전주 C", status: "정상", hasDefect: false, features: "표면 경미한 오염, 구조 이상 없음" },
    { id: 4, label: "전주 D", status: "균열", hasDefect: true, features: "상부 3m 지점 세로균열 15cm, 철근 노출" },
  ];

  const cases = [
    { company: "TEPCO (일본)", tech: "드론 + CNN 이미지 인식", problem: "수만 기 전주를 사람이 직접 순시 — 시간/비용 과다", solution: "드론이 촬영 → CNN이 자동 결함 분류 (균열, 기울기, 부식)", result: "점검 시간 40% 단축" },
    { company: "State Grid (중국)", tech: "딥러닝 영상 분석", problem: "100만km+ 송전선의 애자 균열/오손 탐지", solution: "고해상도 드론 영상을 AI가 실시간 분석, 결함 자동 마킹", result: "결함 검출률 95%+" },
    { company: "Duke Energy (미국)", tech: "AI + LiDAR", problem: "배전선 주변 수목 접촉으로 정전 발생", solution: "LiDAR 3D 스캔 + AI가 위험 수목 성장 예측", result: "정전 건수 유의미 감소" },
  ];

  const handleJudge = (poleId, judgment) => {
    setAnswers(p => ({ ...p, [poleId]: judgment }));
  };

  const checkResults = () => setShowResult(true);
  const score = showResult ? poles.filter(p => answers[p.id] === p.hasDefect).length : 0;

  return (
    <div className="space-y-8">
      <Card t={t}>
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-lg" style={{ background: t.dim, border: `1px solid ${t.border}` }}>
            <Eye size={18} style={{ color: t.accent }} />
          </div>
          <div>
            <p className="text-[10px] font-bold tracking-widest uppercase" style={{ color: t.accent }}>COMPUTER VISION</p>
            <h2 className="text-lg font-black text-slate-800">AI가 이미지를 보는 법</h2>
          </div>
        </div>
        <p className="text-sm text-slate-500 mb-6">드론 영상, 설비 사진에서 결함을 자동 탐지하는 컴퓨터 비전 기술</p>

        <div className="p-4 rounded-xl mb-6" style={{ background: "rgba(234,88,12,0.06)", border: "1px solid rgba(234,88,12,0.15)" }}>
          <p className="text-sm text-orange-800 font-medium mb-1">왜 필요한가?</p>
          <p className="text-xs text-orange-700">전주, 애자, 송전선 점검은 위험하고 시간이 많이 걸립니다. 드론이 촬영한 영상을 AI가 자동 분석하면, 사람보다 빠르고 일관되게 결함을 찾아냅니다.</p>
        </div>

        {/* Interactive: Pole inspection game */}
        <div className="mb-8">
          <p className="text-xs font-bold text-gray-500 tracking-widest uppercase mb-4">INTERACTIVE — 전주 불량 판정 게임</p>
          <p className="text-xs text-gray-500 mb-4">AI 점검관이 되어보세요! 4개 전주의 점검 데이터를 보고 불량 여부를 판정하세요.</p>

          <div className="grid grid-cols-2 gap-3 mb-4">
            {poles.map(p => (
              <div key={p.id} className="rounded-xl border-2 overflow-hidden transition-all"
                style={{ borderColor: showResult ? (answers[p.id] === p.hasDefect ? "#10b981" : "#ef4444") : inspecting === p.id ? t.accent : "rgba(0,0,0,0.08)" }}>
                {/* Pole visual */}
                <div className="h-24 flex items-center justify-center relative"
                  style={{ background: "linear-gradient(180deg, #dbeafe 0%, #93c5fd 50%, #6b7280 50%, #6b7280 100%)" }}>
                  <div className={`w-3 bg-gray-500 rounded-t-sm ${p.hasDefect && p.status === "기울어짐" ? "rotate-[4deg]" : ""}`} style={{ height: "70px", position: "relative" }}>
                    {p.hasDefect && p.status === "균열" && <div className="absolute top-3 left-0 w-full h-4 border-l-2 border-red-500 border-dashed" />}
                  </div>
                  {/* Wires */}
                  <div className="absolute top-6 left-2 right-2 border-t border-gray-600" />
                </div>
                <div className="p-3 bg-white">
                  <p className="text-xs font-bold text-gray-800 mb-1">{p.label}</p>
                  <button onClick={() => setInspecting(inspecting === p.id ? null : p.id)}
                    className="text-[10px] text-blue-600 underline mb-2">점검 데이터 보기</button>
                  {inspecting === p.id && (
                    <p className="text-[10px] text-gray-500 mb-2 p-2 bg-gray-50 rounded-lg" style={{ animation: "fadeIn 0.3s" }}>{p.features}</p>
                  )}
                  {!showResult ? (
                    <div className="flex gap-1.5">
                      <button onClick={() => handleJudge(p.id, false)}
                        className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold transition-all ${answers[p.id] === false ? "bg-emerald-500 text-white" : "bg-gray-100 text-gray-500"}`}>정상</button>
                      <button onClick={() => handleJudge(p.id, true)}
                        className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold transition-all ${answers[p.id] === true ? "bg-red-500 text-white" : "bg-gray-100 text-gray-500"}`}>불량</button>
                    </div>
                  ) : (
                    <div className={`text-center py-1.5 rounded-lg text-[10px] font-bold ${answers[p.id] === p.hasDefect ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}>
                      {answers[p.id] === p.hasDefect ? "✅ 정답" : `❌ 오답 (실제: ${p.hasDefect ? "불량" : "정상"})`}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {!showResult ? (
            <button onClick={checkResults} disabled={Object.keys(answers).length < 4}
              className="px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-all disabled:opacity-30"
              style={{ background: t.accent }}>판정 결과 확인</button>
          ) : (
            <div className="p-4 rounded-xl text-center" style={{ background: score === 4 ? "rgba(16,185,129,0.08)" : "rgba(245,158,11,0.08)", border: `1px solid ${score === 4 ? "rgba(16,185,129,0.2)" : "rgba(245,158,11,0.2)"}` }}>
              <p className="text-lg font-black" style={{ color: score === 4 ? "#059669" : "#d97706" }}>{score}/4 정답</p>
              <p className="text-xs text-gray-500 mt-1">{score === 4 ? "완벽한 AI 점검관입니다!" : "AI는 이 판정을 0.3초 만에, 정확도 95%로 수행합니다."}</p>
              <button onClick={() => { setAnswers({}); setShowResult(false); setInspecting(null); }}
                className="mt-3 px-4 py-2 text-xs text-gray-500 hover:text-gray-800"><RotateCcw size={12} className="inline mr-1" />다시 하기</button>
            </div>
          )}
        </div>

        {/* Global cases */}
        <p className="text-xs font-bold text-gray-500 tracking-widest uppercase mb-4">GLOBAL CASES — 해외 전력회사 도입 사례</p>
        <div className="space-y-3">
          {cases.map((c, i) => (
            <button key={i} onClick={() => setActiveCase(activeCase === i ? -1 : i)}
              className="w-full text-left p-4 rounded-xl border transition-all"
              style={{ background: activeCase === i ? t.dim : "#f8fafc", borderColor: activeCase === i ? t.border : "rgba(0,0,0,0.07)" }}>
              <div className="flex items-center gap-3">
                <Eye size={16} style={{ color: t.accent }} className="shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-bold text-gray-800">{c.company}</p>
                  <p className="text-[10px] text-gray-500">{c.tech}</p>
                </div>
                <span className="px-2 py-1 rounded-full text-[10px] font-bold" style={{ background: t.dim, color: t.accent }}>{c.result}</span>
              </div>
              {activeCase === i && (
                <div className="mt-3 space-y-2" style={{ animation: "fadeIn 0.3s ease-out" }}>
                  <div className="p-3 bg-white rounded-lg"><p className="text-xs text-gray-600"><strong>문제:</strong> {c.problem}</p></div>
                  <div className="p-3 bg-white rounded-lg"><p className="text-xs text-gray-600"><strong>솔루션:</strong> {c.solution}</p></div>
                </div>
              )}
            </button>
          ))}
        </div>
      </Card>
    </div>
  );
};

// ─── INDUSTRY CH4: AI가 미래를 예측하는 법 (시계열) ──────
const IndustryCH4 = ({ onScore }) => {
  const t = T.apply;
  const [gameStarted, setGameStarted] = useState(false);
  const [userPrediction, setUserPrediction] = useState(50);
  const [showAnswer, setShowAnswer] = useState(false);
  const [activeCase, setActiveCase] = useState(-1);

  // Demand prediction game data
  const conditions = [
    { label: "기온", value: "35°C (폭염)", icon: "🌡️", impact: "높음 ↑" },
    { label: "요일", value: "수요일 (평일)", icon: "📅", impact: "보통" },
    { label: "시간대", value: "오후 2~3시", icon: "🕑", impact: "높음 ↑" },
    { label: "특이사항", value: "월드컵 4강전 생중계", icon: "⚽", impact: "매우 높음 ↑↑" },
  ];
  const actualDemand = 82; // GW
  const aiPrediction = 80.5;

  const cases = [
    { company: "National Grid (영국)", tech: "ML 수요예측 (기상+과거 데이터)", problem: "예비 전력을 너무 많이 확보하면 낭비, 적으면 정전 위험", solution: "기상, 과거 소비, 이벤트 데이터로 ML이 시간대별 부하 예측", result: "예측 정확도 98%+" },
    { company: "Schneider Electric", tech: "EcoStruxure Power Advisor (DGA)", problem: "변압기 내부 고장을 조기에 발견하지 못해 대형사고 발생", solution: "유중가스(DGA) 농도 변화를 AI가 실시간 분석 → 고장 유형 예측", result: "비계획 정전 감소" },
    { company: "Duke Energy (미국)", tech: "AI 변압기 건전성 모니터링", problem: "노후 변압기의 돌발 고장으로 수리비·정전 피해 막대", solution: "온도, 진동, 부하 이력 데이터로 고장 시점 예측", result: "유지보수 비용 절감" },
  ];

  return (
    <div className="space-y-8">
      <Card t={t}>
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-lg" style={{ background: t.dim, border: `1px solid ${t.border}` }}>
            <TrendingUp size={18} style={{ color: t.accent }} />
          </div>
          <div>
            <p className="text-[10px] font-bold tracking-widest uppercase" style={{ color: t.accent }}>TIME SERIES PREDICTION</p>
            <h2 className="text-lg font-black text-slate-800">AI가 미래를 예측하는 법</h2>
          </div>
        </div>
        <p className="text-sm text-slate-500 mb-6">부하 수요예측, 변압기 고장예측, DGA 분석 등 시계열 데이터 기반 AI 예측 기술</p>

        <div className="p-4 rounded-xl mb-6" style={{ background: "rgba(234,88,12,0.06)", border: "1px solid rgba(234,88,12,0.15)" }}>
          <p className="text-sm text-orange-800 font-medium mb-1">왜 필요한가?</p>
          <p className="text-xs text-orange-700">전력은 저장이 어렵기 때문에 수요를 정확히 예측해야 합니다. 예측이 틀리면 정전이나 과잉 발전으로 수십억 원의 손실이 발생합니다. AI는 수천 개 변수를 동시에 분석하여 사람보다 정확하게 예측합니다.</p>
        </div>

        {/* Interactive: Demand prediction game */}
        <div className="mb-8">
          <p className="text-xs font-bold text-gray-500 tracking-widest uppercase mb-4">INTERACTIVE — 전력 수요 예측 게임</p>

          {!gameStarted ? (
            <div className="text-center py-6">
              <p className="text-sm text-gray-600 mb-4">주어진 조건을 보고 내일 최대 전력 수요를 예측해보세요!</p>
              <button onClick={() => setGameStarted(true)} className="px-6 py-3 text-sm font-bold text-white rounded-xl" style={{ background: t.accent }}>
                <Play size={14} className="inline mr-2" />예측 시작
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Condition cards */}
              <div className="grid grid-cols-2 gap-2">
                {conditions.map((c, i) => (
                  <div key={i} className="p-3 rounded-xl bg-white border border-gray-200">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-base">{c.icon}</span>
                      <span className="text-[10px] text-gray-500">{c.label}</span>
                    </div>
                    <p className="text-xs font-bold text-gray-800">{c.value}</p>
                    <p className="text-[10px] mt-0.5" style={{ color: t.accent }}>수요 영향: {c.impact}</p>
                  </div>
                ))}
              </div>

              {!showAnswer ? (
                <div className="p-4 bg-gray-50 rounded-xl space-y-3">
                  <p className="text-xs text-gray-600 font-medium">내일 오후 최대 전력 수요는? (단위: GW)</p>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-400">40</span>
                    <input type="range" min="40" max="100" value={userPrediction}
                      onChange={e => setUserPrediction(parseInt(e.target.value))}
                      className="flex-1" style={{ accentColor: t.accent }} />
                    <span className="text-xs text-gray-400">100</span>
                  </div>
                  <p className="text-center text-2xl font-black" style={{ color: t.accent }}>{userPrediction} GW</p>
                  <button onClick={() => setShowAnswer(true)}
                    className="w-full py-2.5 rounded-xl text-sm font-bold text-white" style={{ background: t.accent }}>예측 제출</button>
                </div>
              ) : (
                <div className="space-y-3" style={{ animation: "fadeIn 0.4s ease-out" }}>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="p-3 rounded-xl text-center" style={{ background: t.dim, border: `1px solid ${t.border}` }}>
                      <p className="text-lg font-black" style={{ color: t.accent }}>{userPrediction}</p>
                      <p className="text-[10px] text-gray-500">당신의 예측</p>
                    </div>
                    <div className="p-3 rounded-xl text-center bg-blue-50 border border-blue-200">
                      <p className="text-lg font-black text-blue-700">{aiPrediction}</p>
                      <p className="text-[10px] text-blue-500">AI 예측</p>
                    </div>
                    <div className="p-3 rounded-xl text-center bg-emerald-50 border border-emerald-200">
                      <p className="text-lg font-black text-emerald-700">{actualDemand}</p>
                      <p className="text-[10px] text-emerald-500">실제 수요</p>
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-gray-50 border border-gray-200">
                    <p className="text-xs text-gray-600">당신의 오차: <strong>{Math.abs(userPrediction - actualDemand).toFixed(1)} GW ({(Math.abs(userPrediction - actualDemand) / actualDemand * 100).toFixed(1)}%)</strong></p>
                    <p className="text-xs text-gray-600">AI 오차: <strong>{Math.abs(aiPrediction - actualDemand).toFixed(1)} GW ({(Math.abs(aiPrediction - actualDemand) / actualDemand * 100).toFixed(1)}%)</strong></p>
                    <p className="text-[10px] text-gray-500 mt-2">AI는 폭염 + 평일 오후 + 스포츠 이벤트까지 종합하여 과거 10년 데이터와 비교 분석합니다.</p>
                  </div>
                  <button onClick={() => { setShowAnswer(false); setGameStarted(false); setUserPrediction(50); }}
                    className="flex items-center gap-1 px-4 py-2 text-xs text-gray-500 hover:text-gray-800"><RotateCcw size={12} />다시 하기</button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Global cases */}
        <p className="text-xs font-bold text-gray-500 tracking-widest uppercase mb-4">GLOBAL CASES — 해외 전력회사 도입 사례</p>
        <div className="space-y-3">
          {cases.map((c, i) => (
            <button key={i} onClick={() => setActiveCase(activeCase === i ? -1 : i)}
              className="w-full text-left p-4 rounded-xl border transition-all"
              style={{ background: activeCase === i ? t.dim : "#f8fafc", borderColor: activeCase === i ? t.border : "rgba(0,0,0,0.07)" }}>
              <div className="flex items-center gap-3">
                <TrendingUp size={16} style={{ color: t.accent }} className="shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-bold text-gray-800">{c.company}</p>
                  <p className="text-[10px] text-gray-500">{c.tech}</p>
                </div>
                <span className="px-2 py-1 rounded-full text-[10px] font-bold" style={{ background: t.dim, color: t.accent }}>{c.result}</span>
              </div>
              {activeCase === i && (
                <div className="mt-3 space-y-2" style={{ animation: "fadeIn 0.3s ease-out" }}>
                  <div className="p-3 bg-white rounded-lg"><p className="text-xs text-gray-600"><strong>문제:</strong> {c.problem}</p></div>
                  <div className="p-3 bg-white rounded-lg"><p className="text-xs text-gray-600"><strong>솔루션:</strong> {c.solution}</p></div>
                </div>
              )}
            </button>
          ))}
        </div>
      </Card>
    </div>
  );
};

// ─── INDUSTRY CH5: AI가 시스템을 운영하는 법 (최적화) ────
const IndustryCH5 = ({ onScore }) => {
  const t = T.apply;
  const [gridMode, setGridMode] = useState("manual");
  const [solar, setSolar] = useState(30);
  const [battery, setBattery] = useState(50);
  const [demand, setDemand] = useState(70);
  const [activeCase, setActiveCase] = useState(-1);

  const supply = solar + (battery * 0.8);
  const balance = supply - demand;
  const aiSolar = Math.min(95, demand * 0.6);
  const aiBattery = Math.max(0, Math.min(100, (demand - aiSolar) / 0.8));
  const aiSupply = aiSolar + (aiBattery * 0.8);
  const aiBalance = aiSupply - demand;

  const cases = [
    { company: "Schneider Electric", tech: "EcoStruxure Microgrid Advisor", problem: "마이크로그리드 내 태양광+배터리+디젤 발전을 수동으로 제어", solution: "AI가 기상 예측, 전력 가격, 배터리 수명을 종합하여 최적 운영 스케줄 자동 생성", result: "에너지 비용 30% 절감" },
    { company: "Enel (이탈리아)", tech: "Grid Digital Twin", problem: "재생에너지 확대로 계통 안정성 관리가 복잡해짐", solution: "송배전망 전체를 디지털 트윈으로 복제, AI가 시나리오별 영향 시뮬레이션", result: "재생에너지 계통 안정성 향상" },
    { company: "TEPCO (일본)", tech: "AI + SCADA 데이터 분석", problem: "변전소 오경보가 빈번하여 운전원이 실제 이상을 놓칠 위험", solution: "SCADA 데이터를 AI가 패턴 분석하여 진짜 이상만 필터링", result: "오경보 감소, 이상징후 조기 탐지" },
  ];

  return (
    <div className="space-y-8">
      <Card t={t}>
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-lg" style={{ background: t.dim, border: `1px solid ${t.border}` }}>
            <Settings size={18} style={{ color: t.accent }} />
          </div>
          <div>
            <p className="text-[10px] font-bold tracking-widest uppercase" style={{ color: t.accent }}>OPTIMIZATION & SIMULATION</p>
            <h2 className="text-lg font-black text-slate-800">AI가 시스템을 운영하는 법</h2>
          </div>
        </div>
        <p className="text-sm text-slate-500 mb-6">스마트미터링, 마이크로그리드 최적화, SCADA 디지털트윈 등 AI 기반 시스템 운영</p>

        <div className="p-4 rounded-xl mb-6" style={{ background: "rgba(234,88,12,0.06)", border: "1px solid rgba(234,88,12,0.15)" }}>
          <p className="text-sm text-orange-800 font-medium mb-1">왜 필요한가?</p>
          <p className="text-xs text-orange-700">재생에너지 비중이 높아지면서 전력 공급이 불안정해집니다. AI가 실시간으로 발전-저장-소비를 최적 배분하여 안정성과 비용을 동시에 잡습니다.</p>
        </div>

        {/* Interactive: Microgrid optimizer */}
        <div className="mb-8">
          <p className="text-xs font-bold text-gray-500 tracking-widest uppercase mb-4">INTERACTIVE — 마이크로그리드 최적화 대결</p>
          <p className="text-xs text-gray-500 mb-4">태양광과 배터리를 조절하여 수요에 딱 맞게 전력을 공급해보세요. AI와 비교합니다!</p>

          <div className="flex gap-2 mb-4">
            {["manual", "ai"].map(mode => (
              <button key={mode} onClick={() => setGridMode(mode)}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${gridMode === mode ? "text-white" : "bg-gray-100 text-gray-500"}`}
                style={gridMode === mode ? { background: t.accent } : {}}>
                {mode === "manual" ? "🎮 수동 제어" : "🤖 AI 자동"}
              </button>
            ))}
          </div>

          <div className="p-4 bg-gray-50 rounded-xl space-y-4">
            {/* Demand (fixed) */}
            <div className="flex items-center gap-3">
              <span className="text-xs text-gray-600 w-20 font-medium">⚡ 수요</span>
              <div className="flex-1 h-4 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full rounded-full bg-red-500" style={{ width: `${demand}%` }} />
              </div>
              <span className="text-xs font-mono font-bold w-12 text-right">{demand} kW</span>
            </div>

            {gridMode === "manual" ? (
              <>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-600 w-20 font-medium">☀️ 태양광</span>
                  <input type="range" min="0" max="95" value={solar} onChange={e => setSolar(parseInt(e.target.value))} className="flex-1" style={{ accentColor: "#f59e0b" }} />
                  <span className="text-xs font-mono font-bold w-12 text-right">{solar} kW</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-600 w-20 font-medium">🔋 배터리</span>
                  <input type="range" min="0" max="100" value={battery} onChange={e => setBattery(parseInt(e.target.value))} className="flex-1" style={{ accentColor: "#10b981" }} />
                  <span className="text-xs font-mono font-bold w-12 text-right">{battery}%</span>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-600 w-20 font-medium">☀️ 태양광</span>
                  <div className="flex-1 h-4 bg-gray-200 rounded-full overflow-hidden"><div className="h-full rounded-full bg-amber-500 transition-all duration-700" style={{ width: `${aiSolar}%` }} /></div>
                  <span className="text-xs font-mono font-bold w-12 text-right">{Math.round(aiSolar)} kW</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-600 w-20 font-medium">🔋 배터리</span>
                  <div className="flex-1 h-4 bg-gray-200 rounded-full overflow-hidden"><div className="h-full rounded-full bg-emerald-500 transition-all duration-700" style={{ width: `${aiBattery}%` }} /></div>
                  <span className="text-xs font-mono font-bold w-12 text-right">{Math.round(aiBattery)}%</span>
                </div>
              </>
            )}

            {/* Balance result */}
            <div className={`p-3 rounded-xl text-center ${gridMode === "manual" ? (Math.abs(balance) <= 5 ? "bg-emerald-50 border border-emerald-200" : balance > 0 ? "bg-amber-50 border border-amber-200" : "bg-red-50 border border-red-200") : "bg-blue-50 border border-blue-200"}`}>
              {gridMode === "manual" ? (
                <>
                  <p className="text-xs text-gray-600">공급 {Math.round(supply)} kW - 수요 {demand} kW = <span className={`font-bold ${Math.abs(balance) <= 5 ? "text-emerald-700" : balance > 0 ? "text-amber-700" : "text-red-700"}`}>{balance > 0 ? "+" : ""}{Math.round(balance)} kW</span></p>
                  <p className="text-[10px] text-gray-500 mt-1">{Math.abs(balance) <= 5 ? "✅ 최적! 수급 균형" : balance > 0 ? "⚠️ 과잉 공급 — 전력 낭비" : "🚨 공급 부족 — 정전 위험!"}</p>
                </>
              ) : (
                <>
                  <p className="text-xs text-blue-700 font-medium">AI 최적 제어: 공급 {Math.round(aiSupply)} kW - 수요 {demand} kW = {aiBalance > 0 ? "+" : ""}{Math.round(aiBalance)} kW</p>
                  <p className="text-[10px] text-blue-500 mt-1">기상 예측 + 배터리 수명 + 전력 단가를 종합 계산하여 최소 비용으로 수급 균형 달성</p>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Global cases */}
        <p className="text-xs font-bold text-gray-500 tracking-widest uppercase mb-4">GLOBAL CASES — 해외 전력회사 도입 사례</p>
        <div className="space-y-3">
          {cases.map((c, i) => (
            <button key={i} onClick={() => setActiveCase(activeCase === i ? -1 : i)}
              className="w-full text-left p-4 rounded-xl border transition-all"
              style={{ background: activeCase === i ? t.dim : "#f8fafc", borderColor: activeCase === i ? t.border : "rgba(0,0,0,0.07)" }}>
              <div className="flex items-center gap-3">
                <Settings size={16} style={{ color: t.accent }} className="shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-bold text-gray-800">{c.company}</p>
                  <p className="text-[10px] text-gray-500">{c.tech}</p>
                </div>
                <span className="px-2 py-1 rounded-full text-[10px] font-bold" style={{ background: t.dim, color: t.accent }}>{c.result}</span>
              </div>
              {activeCase === i && (
                <div className="mt-3 space-y-2" style={{ animation: "fadeIn 0.3s ease-out" }}>
                  <div className="p-3 bg-white rounded-lg"><p className="text-xs text-gray-600"><strong>문제:</strong> {c.problem}</p></div>
                  <div className="p-3 bg-white rounded-lg"><p className="text-xs text-gray-600"><strong>솔루션:</strong> {c.solution}</p></div>
                </div>
              )}
            </button>
          ))}
        </div>
      </Card>
    </div>
  );
};

// ─── TAB 2 DEEP: Deep Dive Only (Course 2) ───────────
const Tab2Deep = ({ onScore }) => {
  const t = T.how;
  const deepDiveTopics = [
    {
      title: "토큰화 딥다이브",
      subtitle: "BPE 서브워드 분해",
      icon: Blocks,
      content: () => (
        <div className="space-y-4">
          <p className="text-sm text-gray-700 font-medium">BPE (Byte Pair Encoding) — 실제 토큰화 과정</p>
          <p className="text-xs text-gray-500">GPT, Claude 등 대부분의 LLM은 BPE 알고리즘으로 텍스트를 서브워드 단위로 쪼갭니다.</p>
          <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-2">
            {[
              { step: "1. 원문", tokens: ["저 내일 오후에 반차 쓰겠습니다"], color: "#6b7280" },
              { step: "2. 공백 분리", tokens: ["저", "내일", "오후에", "반차", "쓰겠습니다"], color: "#2563eb" },
              { step: "3. 서브워드 (BPE)", tokens: ["저", "내일", "오후", "에", "반차", "쓰겠", "습니다"], color: "#7c3aed" },
              { step: "4. 토큰 ID", tokens: ["3842", "1057", "8923", "45", "6721", "9102", "234"], color: "#059669" },
            ].map((row, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="text-[10px] text-gray-400 font-mono w-28 shrink-0">{row.step}</span>
                <div className="flex gap-1 flex-wrap">
                  {row.tokens.map((tk, j) => (
                    <span key={j} className="px-2 py-1 rounded text-[10px] font-mono font-semibold"
                      style={{ background: row.color + "10", color: row.color, border: `1px solid ${row.color}30` }}>{tk}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
            <p className="text-xs text-amber-800"><strong>왜 서브워드로 쪼갤까?</strong> "쓰겠습니다"를 통째로 외우면 사전이 수십만 개 필요하지만, "쓰겠"+"습니다"로 나누면 "습니다"를 다른 문장에서도 재활용할 수 있습니다. 부장님도 패턴을 파악하는 것이지, 모든 말을 통째로 외우지 않습니다.</p>
          </div>
          <div className="p-3 bg-gray-100 rounded-lg">
            <p className="text-xs text-gray-600"><strong>📊 실제 수치:</strong> GPT-4 토큰 사전 ≈ 100,000개. 한국어 한 글자 ≈ 1.5~2토큰. "저 내일 오후에 반차 쓰겠습니다" ≈ 7토큰. 영어는 1단어 ≈ 1~1.5토큰으로 한국어보다 효율적입니다.</p>
          </div>
        </div>
      ),
    },
    {
      title: "임베딩 딥다이브",
      subtitle: "벡터 공간과 차원",
      icon: Binary,
      content: () => {
        const [selectedWord, setSelectedWord] = useState(null);
        const vectorSpace = [
          { word: "저", x: 20, y: 70, color: "#3b82f6" },
          { word: "나", x: 25, y: 65, color: "#3b82f6" },
          { word: "내일", x: 60, y: 30, color: "#f59e0b" },
          { word: "오후", x: 65, y: 25, color: "#f59e0b" },
          { word: "반차", x: 80, y: 60, color: "#10b981" },
          { word: "퇴사", x: 82, y: 75, color: "#10b981" },
          { word: "한숨", x: 40, y: 80, color: "#ef4444" },
          { word: "피곤", x: 35, y: 85, color: "#ef4444" },
        ];
        return (
          <div className="space-y-4">
            <p className="text-sm text-gray-700 font-medium">벡터 공간 — 단어가 숫자 좌표로 바뀌는 원리</p>
            <p className="text-xs text-gray-500">의미가 비슷한 단어는 가까이, 다른 단어는 멀리 배치됩니다. 아래는 2D로 축소한 시각화입니다.</p>
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <p className="text-[10px] font-mono text-gray-400 mb-2">2D 벡터 공간 (실제로는 768~12,288차원)</p>
              <div className="relative w-full h-52 bg-gradient-to-br from-gray-50 to-white rounded-lg border border-gray-100 overflow-hidden">
                {vectorSpace.map((item, i) => (
                  <button key={i} onClick={() => setSelectedWord(selectedWord === i ? null : i)}
                    className={`absolute flex flex-col items-center gap-0.5 transition-all hover:scale-125 cursor-pointer ${selectedWord === i ? "scale-125 z-10" : ""}`}
                    style={{ left: `${item.x}%`, top: `${item.y}%`, transform: "translate(-50%, -50%)" }}>
                    <div className="w-3 h-3 rounded-full border-2 border-white shadow-sm" style={{ backgroundColor: item.color }} />
                    <span className="text-[9px] font-medium text-gray-600">{item.word}</span>
                  </button>
                ))}
              </div>
              <div className="flex gap-3 mt-2">
                {[{ label: "인칭", color: "#3b82f6" }, { label: "시간", color: "#f59e0b" }, { label: "근무", color: "#10b981" }, { label: "감정", color: "#ef4444" }].map((c, i) => (
                  <div key={i} className="flex items-center gap-1 text-[10px] text-gray-500">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: c.color }} />{c.label}
                  </div>
                ))}
              </div>
            </div>
            <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
              <p className="text-xs text-amber-800"><strong>핵심 통찰:</strong> "반차"와 "퇴사"가 가까이 있는 건 AI가 수억 문장에서 비슷한 맥락에 등장하는 것을 학습했기 때문입니다.</p>
            </div>
            <div className="p-3 bg-gray-100 rounded-lg">
              <p className="text-xs text-gray-600"><strong>📊 수치:</strong> GPT-3 = 12,288차원, Claude ≈ 8,192차원. Word2Vec: vec("왕") - vec("남자") + vec("여자") ≈ vec("여왕").</p>
            </div>
          </div>
        );
      },
    },
    {
      title: "셀프 어텐션 딥다이브",
      subtitle: "Q·K·V 멀티헤드",
      icon: Eye,
      content: () => {
        const [activeHead, setActiveHead] = useState(0);
        const tokens = ["저", "내일", "오후에", "한숨"];
        const heads = [
          { name: "Head 1: 시간 관계", matrix: [[0.1,0.3,0.5,0.1],[0.1,0.2,0.6,0.1],[0.1,0.7,0.1,0.1],[0.1,0.2,0.3,0.4]] },
          { name: "Head 2: 감정 관계", matrix: [[0.2,0.1,0.1,0.6],[0.1,0.1,0.2,0.6],[0.1,0.1,0.3,0.5],[0.3,0.1,0.2,0.4]] },
          { name: "Head 3: 주어-행위", matrix: [[0.4,0.1,0.4,0.1],[0.5,0.1,0.3,0.1],[0.6,0.1,0.2,0.1],[0.3,0.1,0.1,0.5]] },
        ];
        const head = heads[activeHead];
        const heatColor = v => v >= 0.5 ? "#7c3aed" : v >= 0.3 ? "#a78bfa" : v >= 0.2 ? "#ddd6fe" : "#f5f3ff";
        const textColor = v => v >= 0.3 ? "#ffffff" : "#6b7280";
        return (
          <div className="space-y-4">
            <p className="text-sm text-gray-700 font-medium">Q·K·V와 멀티헤드 어텐션 — 부장님의 다중 관점</p>
            <div className="grid grid-cols-3 gap-2">
              {[{ name: "Q (Query)", desc: "알고 싶은 것", c: "#2563eb" }, { name: "K (Key)", desc: "정보 태그", c: "#059669" }, { name: "V (Value)", desc: "실제 정보", c: "#d97706" }].map((item, i) => (
                <div key={i} className="p-2.5 rounded-lg" style={{ background: item.c + "10", border: `1px solid ${item.c}30` }}>
                  <p className="text-[10px] font-bold" style={{ color: item.c }}>{item.name}</p>
                  <p className="text-[10px] text-gray-500">{item.desc}</p>
                </div>
              ))}
            </div>
            <div className="flex gap-1.5">
              {heads.map((h, i) => (
                <button key={i} onClick={() => setActiveHead(i)} className={`px-3 py-1.5 text-[10px] font-medium rounded-lg transition-all ${i === activeHead ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-500"}`}>Head {i+1}</button>
              ))}
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-4 overflow-x-auto">
              <p className="text-xs font-medium text-gray-700 mb-2">{head.name}</p>
              <table className="w-full">
                <thead><tr><th className="text-[9px] text-gray-400 p-1">Q↓ K→</th>{tokens.map((t, i) => <th key={i} className="text-[10px] font-mono font-semibold text-gray-600 p-1">{t}</th>)}</tr></thead>
                <tbody>{tokens.map((t, i) => (
                  <tr key={i}><td className="text-[10px] font-mono font-semibold text-gray-600 p-1">{t}</td>
                  {head.matrix[i].map((v, j) => (
                    <td key={j} className="p-0.5"><span className="inline-block w-full px-1 py-1 rounded text-[10px] font-mono font-bold text-center" style={{ background: heatColor(v), color: textColor(v) }}>{v.toFixed(2)}</span></td>
                  ))}</tr>
                ))}</tbody>
              </table>
            </div>
            <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
              <p className="text-xs text-amber-800"><strong>왜 멀티헤드?</strong> GPT-4는 128개 헤드가 각각 다른 관계를 포착합니다. 시간, 감정, 문법을 동시에 분석합니다.</p>
            </div>
          </div>
        );
      },
    },
    {
      title: "Temperature 실험실",
      subtitle: "확률 분포 조절기",
      icon: SlidersHorizontal,
      content: () => {
        const [temperature, setTemperature] = useState(1.0);
        const rawLogits = [3.2, 1.5, -0.5, -1.8, 0.3];
        const labels = ["반차", "외근", "야근", "퇴사", "회의"];
        const scaled = rawLogits.map(l => l / Math.max(temperature, 0.01));
        const maxVal = Math.max(...scaled);
        const exps = scaled.map(s => Math.exp(s - maxVal));
        const sum = exps.reduce((a, b) => a + b, 0);
        const probs = exps.map(e => e / sum);
        return (
          <div className="space-y-4">
            <p className="text-sm text-gray-700 font-medium">Temperature — 부장님의 직감 조절기</p>
            <p className="text-xs text-gray-500">Temperature를 직접 움직여 확률 분포가 어떻게 바뀌는지 체험해보세요.</p>
            <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-4">
              <div className="flex items-center gap-3">
                <span className="text-xs font-medium text-gray-700 w-24">Temperature:</span>
                <input type="range" min="0.1" max="2.0" step="0.1" value={temperature}
                  onChange={(e) => setTemperature(parseFloat(e.target.value))}
                  className="flex-1" style={{ accentColor: t.accent }} />
                <span className="text-sm font-mono font-bold w-8 text-right">{temperature.toFixed(1)}</span>
              </div>
              <div className="space-y-2">
                {labels.map((label, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="text-[10px] font-medium text-gray-600 w-10">{label}</span>
                    <div className="flex-1 h-5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${Math.max(probs[i] * 100, 1)}%`, background: probs[i] > 0.4 ? t.accent : probs[i] > 0.15 ? "#818cf8" : "#cbd5e1" }} />
                    </div>
                    <span className="text-[10px] font-mono font-bold w-12 text-right">{(probs[i] * 100).toFixed(1)}%</span>
                  </div>
                ))}
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-600">
                  {temperature < 0.5 ? "🧊 매우 확신 — \"무조건 반차!\" 다른 가능성은 거의 무시" : temperature <= 1.2 ? "⚖️ 합리적 — \"반차가 유력하지만 외근일 수도...\"" : "🔥 열린 마음 — \"반차? 외근? 회의? 다 가능해!\""}
                </p>
              </div>
            </div>
            <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
              <p className="text-xs text-amber-800"><strong>실무:</strong> 코드 생성 T=0.2, 글쓰기 T=0.8~1.2, 브레인스토밍 T=1.5+. "같은 질문에 다른 답"이 나오는 이유입니다.</p>
            </div>
          </div>
        );
      },
    },
  ];

  const [step, setStep] = useState(0);
  const CurrentContent = deepDiveTopics[step].content;

  return (
    <div className="space-y-8">
      <Card t={t}>
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-lg" style={{ background: t.dim, border: `1px solid ${t.border}` }}>
            <Cpu size={18} style={{ color: t.accent }} />
          </div>
          <div>
            <p className="text-[10px] font-bold tracking-widest uppercase" style={{ color: t.accent }}>DEEP DIVE</p>
            <h2 className="text-lg font-black text-slate-800">동작원리 딥다이브</h2>
          </div>
        </div>
        <p className="text-sm text-slate-500 mb-6">부장님 비유 뒤에 숨겨진 실제 기술을 깊이 있게 탐구합니다.</p>

        <div className="flex gap-1.5 mb-6 overflow-x-auto pb-2">
          {deepDiveTopics.map((s, i) => (
            <button key={i} onClick={() => setStep(i)}
              className={`shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${i === step ? "text-white" : "bg-gray-50 text-gray-500 hover:bg-gray-100"}`}
              style={i === step ? { background: t.accent } : {}}>
              <span className="font-mono">{i + 1}</span>
              <span className="hidden sm:inline">{s.subtitle}</span>
            </button>
          ))}
        </div>

        <div className="mb-4">
          <div className="flex items-center gap-3 mb-4">
            {(() => { const Icon = deepDiveTopics[step].icon; return <Icon size={20} className="text-gray-700" />; })()}
            <div>
              <h3 className="font-semibold text-gray-900">{deepDiveTopics[step].title}</h3>
              <p className="text-xs text-gray-400">{deepDiveTopics[step].subtitle}</p>
            </div>
          </div>
          <CurrentContent />
        </div>

        <div className="flex justify-between mt-6 pt-4 border-t border-gray-100">
          <button onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0} className="flex items-center gap-1.5 px-4 py-2 text-sm text-gray-500 hover:text-gray-900 disabled:opacity-30">
            <ArrowLeft size={14} /> 이전
          </button>
          <span className="text-xs text-gray-400 self-center">{step + 1} / {deepDiveTopics.length}</span>
          <button onClick={() => setStep(Math.min(deepDiveTopics.length - 1, step + 1))} disabled={step === deepDiveTopics.length - 1} className="flex items-center gap-1.5 px-4 py-2 text-sm text-gray-500 hover:text-gray-900 disabled:opacity-30">
            다음 <ArrowRight size={14} />
          </button>
        </div>
      </Card>
    </div>
  );
};

// ─── TAB 6: Transformer Architecture (Course 3) ──────
const Tab6 = ({ onScore }) => {
  const t = T.expert;
  const [step, setStep] = useState(0);

  // 7토큰 부장님 예제: "저 내일 오후 에 반차 쓰겠 습니다"
  const tokens = ["저", "내일", "오후", "에", "반차", "쓰겠", "습니다"];
  const d_model = 12288;
  const n_heads = 96;
  const d_k = d_model / n_heads; // 128

  const TransformerStep1 = () => {
    const [showDim, setShowDim] = useState(false);
    const [hoveredToken, setHoveredToken] = useState(null);
    return (
      <div className="space-y-6">
        <div className="p-4 rounded-xl" style={{ background: "rgba(168,85,247,0.06)", border: "1px solid rgba(168,85,247,0.15)" }}>
          <p className="text-sm text-purple-800 font-medium mb-1">부장님의 뇌는 몇 차원일까?</p>
          <p className="text-xs text-purple-600">김대리가 "저 내일 오후에 반차 쓰겠습니다"라고 말했습니다. GPT-3는 이 문장을 <strong>7개 토큰 × 12,288차원</strong>의 거대한 행렬로 변환합니다.</p>
        </div>

        {/* Token → Matrix visualization */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
          <p className="text-xs font-bold text-gray-500 tracking-widest uppercase">STEP 1 — 입력 행렬 생성</p>
          <p className="text-xs text-gray-500">각 토큰이 {d_model.toLocaleString()}차원 벡터로 변환됩니다</p>

          {/* Token cards */}
          <div className="flex gap-1.5 flex-wrap">
            {tokens.map((tok, i) => (
              <button key={i}
                onMouseEnter={() => setHoveredToken(i)}
                onMouseLeave={() => setHoveredToken(null)}
                className={`px-3 py-2 rounded-lg text-xs font-mono font-bold border-2 transition-all ${hoveredToken === i ? "border-purple-500 bg-purple-50 text-purple-700 scale-105" : "border-gray-200 bg-gray-50 text-gray-700"}`}>
                <div>{tok}</div>
                <div className="text-[8px] font-normal text-gray-400 mt-0.5">t{i}</div>
              </button>
            ))}
          </div>

          {/* Matrix representation */}
          <button onClick={() => setShowDim(!showDim)}
            className="px-4 py-2 rounded-lg text-xs font-medium bg-purple-600 text-white hover:bg-purple-700 transition-all">
            {showDim ? "접기" : "행렬 펼치기 📐"}
          </button>

          {showDim && (
            <div className="space-y-3" style={{ animation: "fadeIn 0.4s ease-out" }}>
              <div className="overflow-x-auto">
                <div className="inline-block bg-gray-50 rounded-xl p-4 border border-gray-200">
                  <p className="text-[10px] text-gray-400 mb-2 font-mono">X ∈ ℝ<sup>7×12288</sup> (입력 행렬)</p>
                  <div className="space-y-1">
                    {tokens.map((tok, i) => (
                      <div key={i} className={`flex items-center gap-2 p-1.5 rounded transition-all ${hoveredToken === i ? "bg-purple-100" : ""}`}>
                        <span className="text-[10px] font-mono font-bold w-10 text-gray-600">{tok}</span>
                        <span className="text-[10px] text-gray-400">[</span>
                        <div className="flex gap-0.5">
                          {[0.12, -0.45, 0.78, 0.03, -0.91].map((v, j) => {
                            const jitter = Math.sin((i + 1) * (j + 1) * 2.7) * 0.5;
                            const val = (v + jitter).toFixed(2);
                            return (
                              <span key={j} className={`text-[9px] font-mono px-1 rounded ${parseFloat(val) > 0 ? "text-blue-600" : "text-red-500"}`}>
                                {parseFloat(val) > 0 ? "+" : ""}{val}
                              </span>
                            );
                          })}
                          <span className="text-[9px] text-gray-300 px-1">... ×12,288</span>
                        </div>
                        <span className="text-[10px] text-gray-400">]</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="p-3 bg-purple-50 rounded-lg border border-purple-200 text-center">
                  <p className="text-lg font-black text-purple-700">{tokens.length}</p>
                  <p className="text-[10px] text-purple-500">토큰 수 (행)</p>
                </div>
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200 text-center">
                  <p className="text-lg font-black text-blue-700">{d_model.toLocaleString()}</p>
                  <p className="text-[10px] text-blue-500">임베딩 차원 (열)</p>
                </div>
                <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-center">
                  <p className="text-lg font-black text-amber-700">{(tokens.length * d_model).toLocaleString()}</p>
                  <p className="text-[10px] text-amber-500">총 숫자 개수</p>
                </div>
              </div>

              <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
                <p className="text-xs text-amber-800"><strong>부장님 비유:</strong> 부장님이 김대리의 7개 단어를 들었을 때, 각 단어에 대해 12,288가지 측면(의미, 감정, 문법, 맥락...)을 동시에 분석합니다. 86,016개의 숫자가 부장님의 "첫인상"입니다.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const TransformerStep2 = () => {
    const [showQKV, setShowQKV] = useState(false);
    const [activeMatrix, setActiveMatrix] = useState(null);
    return (
      <div className="space-y-6">
        <div className="p-4 rounded-xl" style={{ background: "rgba(168,85,247,0.06)", border: "1px solid rgba(168,85,247,0.15)" }}>
          <p className="text-sm text-purple-800 font-medium mb-1">Q, K, V — 부장님의 세 가지 질문법</p>
          <p className="text-xs text-purple-600">입력 행렬 X에 3개의 가중치 행렬을 곱해 Q(질문), K(열쇠), V(답변)를 만듭니다.</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
          <p className="text-xs font-bold text-gray-500 tracking-widest uppercase">STEP 2 — Q, K, V 행렬 생성</p>

          {/* Formula */}
          <div className="bg-gray-900 rounded-xl p-4 font-mono text-center">
            <p className="text-emerald-400 text-sm">Q = X · W<sub>Q</sub></p>
            <p className="text-blue-400 text-sm">K = X · W<sub>K</sub></p>
            <p className="text-amber-400 text-sm">V = X · W<sub>V</sub></p>
            <p className="text-gray-500 text-[10px] mt-2">[7×12288] · [12288×12288] = [7×12288]</p>
          </div>

          <button onClick={() => setShowQKV(!showQKV)}
            className="px-4 py-2 rounded-lg text-xs font-medium bg-purple-600 text-white hover:bg-purple-700 transition-all">
            {showQKV ? "접기" : "Q, K, V 의미 보기"}
          </button>

          {showQKV && (
            <div className="space-y-3" style={{ animation: "fadeIn 0.4s ease-out" }}>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { name: "Q (Query)", color: "emerald", desc: "내가 알고 싶은 것", matrix: "질문 행렬", example: "부장님: \"반차\"가 궁금해 → 다른 단어들에게 질문을 던짐" },
                  { name: "K (Key)", color: "blue", desc: "내가 제공하는 정보 태그", matrix: "열쇠 행렬", example: "부장님: \"내일\"이 가진 정보 — 시간, 가까움, 급함" },
                  { name: "V (Value)", color: "amber", desc: "실제 전달할 정보", matrix: "답변 행렬", example: "부장님: \"내일\"의 실제 의미 — 바로 다음 날, 곧" },
                ].map((item, i) => (
                  <button key={i} onClick={() => setActiveMatrix(activeMatrix === i ? null : i)}
                    className={`p-3 rounded-lg border-2 text-left transition-all ${activeMatrix === i ? `border-${item.color}-500 bg-${item.color}-50` : "border-gray-200 bg-gray-50 hover:border-gray-300"}`}
                    style={activeMatrix === i ? { borderColor: item.color === "emerald" ? "#10b981" : item.color === "blue" ? "#3b82f6" : "#f59e0b", background: item.color === "emerald" ? "rgba(16,185,129,0.08)" : item.color === "blue" ? "rgba(59,130,246,0.08)" : "rgba(245,158,11,0.08)" } : {}}>
                    <p className="text-xs font-bold" style={{ color: item.color === "emerald" ? "#059669" : item.color === "blue" ? "#2563eb" : "#d97706" }}>{item.name}</p>
                    <p className="text-[10px] text-gray-500 mt-0.5">{item.desc}</p>
                  </button>
                ))}
              </div>

              {activeMatrix !== null && (
                <div className="p-3 rounded-lg border border-gray-200 bg-white" style={{ animation: "fadeIn 0.3s ease-out" }}>
                  <p className="text-xs text-gray-600">{[
                    "부장님: \"반차\"가 궁금해 → 다른 단어들에게 \"너 뭐 알아?\"라고 질문을 던짐",
                    "각 단어가 자기 정보를 태그로 내놓음 — \"내일\"은 [시간, 가까움], \"한숨\"은 [감정, 부정]",
                    "Q와 K의 매칭 점수에 따라, 높은 점수의 단어에서 V(실제 정보)를 많이 가져옴"
                  ][activeMatrix]}</p>
                </div>
              )}

              <div className="p-3 bg-gray-100 rounded-lg">
                <p className="text-xs text-gray-600"><strong>📊 수치:</strong> W<sub>Q</sub>, W<sub>K</sub>, W<sub>V</sub> 각각 12,288 × 12,288 = <strong>1.5억 개</strong> 파라미터. Q, K, V 합쳐서 <strong>4.5억 개</strong> 파라미터가 이 단계에만 쓰입니다.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const TransformerStep3 = () => {
    const [showCalc, setShowCalc] = useState(false);
    const [showMask, setShowMask] = useState(false);
    // Simulated attention scores between tokens
    const attnScores = [
      [0.35, 0.10, 0.08, 0.02, 0.25, 0.12, 0.08],
      [0.05, 0.30, 0.28, 0.07, 0.15, 0.10, 0.05],
      [0.03, 0.25, 0.20, 0.12, 0.22, 0.10, 0.08],
      [0.02, 0.08, 0.35, 0.15, 0.20, 0.12, 0.08],
      [0.15, 0.20, 0.15, 0.05, 0.20, 0.15, 0.10],
      [0.10, 0.08, 0.05, 0.02, 0.35, 0.25, 0.15],
      [0.05, 0.05, 0.03, 0.02, 0.15, 0.30, 0.40],
    ];
    const getColor = (v) => {
      if (v >= 0.30) return { bg: "#7c3aed", text: "#ffffff" };
      if (v >= 0.20) return { bg: "#a78bfa", text: "#ffffff" };
      if (v >= 0.10) return { bg: "#ddd6fe", text: "#5b21b6" };
      return { bg: "#f5f3ff", text: "#9ca3af" };
    };
    return (
      <div className="space-y-6">
        <div className="p-4 rounded-xl" style={{ background: "rgba(168,85,247,0.06)", border: "1px solid rgba(168,85,247,0.15)" }}>
          <p className="text-sm text-purple-800 font-medium mb-1">어텐션 수식 — 부장님의 집중력 계산법</p>
          <p className="text-xs text-purple-600">Q와 K를 곱하고 √d<sub>k</sub>로 나눈 뒤 softmax를 취합니다.</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
          <p className="text-xs font-bold text-gray-500 tracking-widest uppercase">STEP 3 — Scaled Dot-Product Attention</p>

          {/* Main formula */}
          <div className="bg-gray-900 rounded-xl p-5 text-center space-y-2">
            <p className="text-white text-sm font-mono">Attention(Q, K, V) = softmax(<span className="text-emerald-400">QK<sup>T</sup></span> / <span className="text-amber-400">√d<sub>k</sub></span>) · <span className="text-blue-400">V</span></p>
            <div className="flex items-center justify-center gap-3 mt-3 text-[10px] text-gray-400 font-mono">
              <span className="text-emerald-400">QK<sup>T</sup>: [7×128]·[128×7] = [7×7]</span>
              <span>→</span>
              <span className="text-amber-400">÷ √128 = ÷ 11.31</span>
              <span>→</span>
              <span className="text-purple-400">softmax → 확률</span>
            </div>
          </div>

          <button onClick={() => setShowCalc(!showCalc)}
            className="px-4 py-2 rounded-lg text-xs font-medium bg-purple-600 text-white hover:bg-purple-700 transition-all">
            {showCalc ? "접기" : "어텐션 맵 보기 🔍"}
          </button>

          {showCalc && (
            <div className="space-y-4" style={{ animation: "fadeIn 0.4s ease-out" }}>
              {/* 7x7 Attention heatmap */}
              <div className="overflow-x-auto">
                <div className="inline-block">
                  <p className="text-[10px] text-gray-400 font-mono mb-2">softmax(QK<sup>T</sup> / √128) — 7×7 어텐션 맵</p>
                  <table className="border-collapse">
                    <thead>
                      <tr>
                        <th className="p-1 text-[8px] text-gray-400">Q↓ K→</th>
                        {tokens.map((t, i) => <th key={i} className="p-1 text-[9px] font-mono font-bold text-gray-600 min-w-[40px]">{t}</th>)}
                      </tr>
                    </thead>
                    <tbody>
                      {tokens.map((t, i) => (
                        <tr key={i}>
                          <td className="p-1 text-[9px] font-mono font-bold text-gray-600">{t}</td>
                          {attnScores[i].map((v, j) => {
                            const c = getColor(v);
                            const masked = showMask && j > i;
                            return (
                              <td key={j} className="p-0.5">
                                <div className="w-10 h-7 rounded flex items-center justify-center text-[8px] font-mono font-bold transition-all"
                                  style={{ background: masked ? "#1e1b4b" : c.bg, color: masked ? "#4c1d95" : c.text }}>
                                  {masked ? "-∞" : v.toFixed(2)}
                                </div>
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="flex items-center gap-2 text-[9px] text-gray-400">
                <span>약함</span>
                {["#f5f3ff", "#ddd6fe", "#a78bfa", "#7c3aed"].map((c, i) => <div key={i} className="w-5 h-3 rounded-sm" style={{ background: c }} />)}
                <span>강함</span>
              </div>

              {/* Masked attention toggle */}
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-gray-700">Masked Self-Attention (GPT 디코더)</p>
                    <p className="text-[10px] text-gray-500">미래 토큰을 -∞로 마스킹하여 "앞만 보게" 합니다</p>
                  </div>
                  <button onClick={() => setShowMask(!showMask)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${showMask ? "bg-purple-600 text-white" : "bg-gray-200 text-gray-600"}`}>
                    {showMask ? "마스크 ON" : "마스크 OFF"}
                  </button>
                </div>
                {showMask && (
                  <div className="p-3 bg-purple-50 rounded-lg border border-purple-200" style={{ animation: "fadeIn 0.3s ease-out" }}>
                    <p className="text-xs text-purple-800"><strong>부장님 비유:</strong> "반차"를 예측할 때, 부장님은 "저 내일 오후 에"까지만 볼 수 있습니다. "쓰겠 습니다"는 아직 안 들었으니 가려야 합니다. 이것이 GPT가 <strong>왼쪽에서 오른쪽으로</strong> 한 토큰씩 생성하는 원리입니다.</p>
                  </div>
                )}
              </div>

              <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
                <p className="text-xs text-amber-800"><strong>왜 √d<sub>k</sub>로 나눌까?</strong> QK<sup>T</sup> 내적값이 차원(128)이 클수록 값이 커져서 softmax가 극단적으로 한 곳에 몰립니다(gradient vanishing). √128 ≈ 11.31로 나눠 안정적인 분포를 만듭니다. 부장님이 "한 단어에만 꽂히는" 것을 방지하는 장치입니다.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const TransformerStep4 = () => {
    const [showSplit, setShowSplit] = useState(false);
    return (
      <div className="space-y-6">
        <div className="p-4 rounded-xl" style={{ background: "rgba(168,85,247,0.06)", border: "1px solid rgba(168,85,247,0.15)" }}>
          <p className="text-sm text-purple-800 font-medium mb-1">Multi-Head Attention — 부장님이 96명?</p>
          <p className="text-xs text-purple-600">{d_model.toLocaleString()}차원을 {n_heads}개 헤드로 나누면, 각 헤드당 {d_k}차원. 96명의 부장님이 각각 다른 관점으로 분석합니다.</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
          <p className="text-xs font-bold text-gray-500 tracking-widest uppercase">STEP 4 — Multi-Head Split & Merge</p>

          {/* Dimension split formula */}
          <div className="bg-gray-900 rounded-xl p-4 text-center space-y-1 font-mono">
            <p className="text-white text-sm">{d_model.toLocaleString()} ÷ {n_heads} = <span className="text-amber-400 font-bold">{d_k}</span> 차원/헤드</p>
            <p className="text-gray-500 text-[10px]">Q, K, V 각각을 96등분하여 병렬 처리</p>
          </div>

          <button onClick={() => setShowSplit(!showSplit)}
            className="px-4 py-2 rounded-lg text-xs font-medium bg-purple-600 text-white hover:bg-purple-700 transition-all">
            {showSplit ? "접기" : "96개 헤드 분할 시각화 🔬"}
          </button>

          {showSplit && (
            <div className="space-y-4" style={{ animation: "fadeIn 0.4s ease-out" }}>
              {/* Visual split */}
              <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                <p className="text-[10px] text-gray-400 font-mono">12,288차원을 96개 헤드로 분할:</p>
                <div className="flex gap-0.5 flex-wrap">
                  {Array.from({ length: 24 }, (_, i) => {
                    const headLabels = ["시간 관계", "감정 톤", "주어-목적어", "문법 구조", "의도 파악", "존댓말 수준"];
                    return (
                      <div key={i} className="group relative">
                        <div className={`w-5 h-8 rounded-sm transition-all ${i < 6 ? "bg-purple-500" : i < 12 ? "bg-blue-400" : i < 18 ? "bg-emerald-400" : "bg-amber-400"} hover:scale-y-125 cursor-pointer`} />
                        {i < 6 && (
                          <div className="absolute -top-8 left-1/2 -translate-x-1/2 hidden group-hover:block whitespace-nowrap bg-gray-900 text-white text-[8px] px-2 py-1 rounded">
                            H{i + 1}: {headLabels[i]}
                          </div>
                        )}
                      </div>
                    );
                  })}
                  <span className="text-[9px] text-gray-400 self-center ml-1">...×96</span>
                </div>
                <div className="flex gap-3 text-[9px]">
                  {[
                    { color: "bg-purple-500", label: "시간/공간 관계" },
                    { color: "bg-blue-400", label: "감정/어조 분석" },
                    { color: "bg-emerald-400", label: "문법/구문 구조" },
                    { color: "bg-amber-400", label: "의미/의도 추론" },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-1 text-gray-500">
                      <div className={`w-2 h-2 rounded-sm ${item.color}`} />
                      {item.label}
                    </div>
                  ))}
                </div>
              </div>

              {/* Merge illustration */}
              <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-2">
                <p className="text-xs font-bold text-gray-700">Concat & Linear (합치기)</p>
                <div className="flex items-center gap-2 text-[10px] font-mono text-gray-600">
                  <span className="px-2 py-1 bg-purple-100 rounded">H1</span>
                  <span className="px-2 py-1 bg-blue-100 rounded">H2</span>
                  <span className="text-gray-300">...</span>
                  <span className="px-2 py-1 bg-amber-100 rounded">H96</span>
                  <ArrowRight size={12} className="text-gray-400" />
                  <span className="px-2 py-1 bg-gray-200 rounded font-bold">Concat</span>
                  <ArrowRight size={12} className="text-gray-400" />
                  <span className="px-2 py-1 bg-gray-900 text-white rounded font-bold">[7×12288]</span>
                </div>
                <p className="text-[10px] text-gray-500">96개 헤드의 128차원 결과를 이어붙이면 다시 12,288차원. 최종 선형 변환으로 출력합니다.</p>
              </div>

              <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
                <p className="text-xs text-amber-800"><strong>부장님 비유:</strong> 부장님이 혼자 12,288가지를 분석하는 건 비효율적입니다. 대신 96명의 전문가가 128가지씩 나눠 분석한 뒤 합칩니다. 한 명은 "시간"만, 한 명은 "감정"만, 한 명은 "문법"만 — 이것이 Multi-Head의 핵심입니다.</p>
              </div>

              <div className="p-3 bg-gray-100 rounded-lg">
                <p className="text-xs text-gray-600"><strong>📊 GPT-3 수치:</strong> 96 헤드 × 128 차원 = 12,288. 이 구조가 96개 레이어에 걸쳐 반복됩니다. 총 어텐션 파라미터만 약 <strong>530억 개</strong>. 전체 1,750억 파라미터 중 약 30%가 이 어텐션에 쓰입니다.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const expertSteps = [
    { title: "입력 행렬", subtitle: "7토큰 × 12,288차원", icon: Binary, content: TransformerStep1 },
    { title: "Q, K, V 생성", subtitle: "세 가지 가중치 행렬", icon: Layers, content: TransformerStep2 },
    { title: "어텐션 수식", subtitle: "Scaled Dot-Product", icon: Eye, content: TransformerStep3 },
    { title: "멀티헤드", subtitle: "96등분 병렬 처리", icon: Network, content: TransformerStep4 },
  ];

  const StepContent = expertSteps[step]?.content;

  return (
    <div className="space-y-8">
      <Card t={t}>
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-lg" style={{ background: t.dim, border: `1px solid ${t.border}` }}>
            <CircuitBoard size={18} style={{ color: t.accent }} />
          </div>
          <div>
            <p className="text-[10px] font-bold tracking-widest uppercase" style={{ color: t.accent }}>TRANSFORMER ARCHITECTURE</p>
            <p className="text-[9px] text-gray-400 font-mono">변환기 구조 — 어텐션만으로 언어를 처리하는 현대 AI의 기반</p>
            <h2 className="text-lg font-black text-slate-800">트랜스포머 해부학</h2>
          </div>
        </div>
        <p className="text-sm text-slate-500 mb-4">GPT-3의 실제 수치와 수식으로, 부장님이 김대리의 말을 분석하는 과정을 해부합니다.</p>

        <div className="p-4 rounded-xl mb-6" style={{ background: "rgba(168,85,247,0.04)", border: "1px solid rgba(168,85,247,0.12)" }}>
          <p className="text-[10px] font-bold text-purple-600 tracking-widest uppercase mb-1">📜 ORIGIN STORY — 2017</p>
          <p className="text-xs text-gray-700 leading-relaxed">2017년, 구글의 8명의 연구원이 <strong>"Attention Is All You Need"</strong>라는 논문을 발표합니다. 핵심 메시지는 단순했습니다: "순차 처리(RNN)를 버리고 어텐션만으로 충분하다." 이 논문이 제안한 <strong>Transformer</strong>가 GPT, BERT, Claude, Gemini 등 오늘날 모든 대형 AI의 기반이 됩니다. 아래에서 그 내부 구조를 해부합니다.</p>
        </div>

        <div className="p-3 rounded-xl mb-6" style={{ background: "rgba(168,85,247,0.06)", border: "1px solid rgba(168,85,247,0.15)" }}>
          <p className="text-xs text-purple-700 font-medium">📌 예제 문장: "<strong>저 내일 오후 에 반차 쓰겠 습니다</strong>" — 7토큰, GPT-3 기준 12,288차원</p>
        </div>

        {/* Step nav */}
        <div className="flex gap-1.5 mb-6 overflow-x-auto pb-2">
          {expertSteps.map((s, i) => (
            <button key={i} onClick={() => setStep(i)}
              className={`shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${i === step ? "text-white" : "bg-gray-50 text-gray-500 hover:bg-gray-100"}`}
              style={i === step ? { background: t.accent } : {}}>
              <span className="font-mono">{i + 1}</span>
              <span className="hidden sm:inline">{s.subtitle}</span>
            </button>
          ))}
        </div>

        <div className="mb-4">
          <div className="flex items-center gap-3 mb-4">
            {(() => { const Icon = expertSteps[step].icon; return <Icon size={20} className="text-gray-700" />; })()}
            <div>
              <h3 className="font-semibold text-gray-900">{expertSteps[step].title}</h3>
              <p className="text-xs text-gray-400">{expertSteps[step].subtitle}</p>
            </div>
          </div>
          <StepContent />
        </div>

        <div className="flex justify-between mt-6 pt-4 border-t border-gray-100">
          <button onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0} className="flex items-center gap-1.5 px-4 py-2 text-sm text-gray-500 hover:text-gray-900 disabled:opacity-30">
            <ArrowLeft size={14} /> 이전
          </button>
          <span className="text-xs text-gray-400 self-center">{step + 1} / {expertSteps.length}</span>
          <button onClick={() => setStep(Math.min(expertSteps.length - 1, step + 1))} disabled={step === expertSteps.length - 1} className="flex items-center gap-1.5 px-4 py-2 text-sm text-gray-500 hover:text-gray-900 disabled:opacity-30">
            다음 <ArrowRight size={14} />
          </button>
        </div>
      </Card>
    </div>
  );
};

// ─── TAB 10: AI 혁명의 순간들 (Course 3 Intro) ─────────
const QuickQuiz = ({ quiz }) => {
  const [picked, setPicked] = useState(null);
  return (
    <div className="p-3 bg-gray-50 rounded-lg">
      <p className="text-xs font-bold text-gray-700 mb-2">⚡ 퀵 퀴즈: {quiz.q}</p>
      <div className="flex gap-1.5 flex-wrap">
        {quiz.opts.map((opt, oi) => (
          <button key={oi} onClick={() => setPicked(oi)}
            className={`px-3 py-1.5 rounded-lg text-[10px] font-medium border transition-all ${picked === null ? "border-gray-200 hover:border-gray-300 text-gray-600" : oi === quiz.a ? "border-emerald-400 bg-emerald-50 text-emerald-700 font-bold" : picked === oi ? "border-red-300 bg-red-50 text-red-600" : "border-gray-100 text-gray-400"}`}
            disabled={picked !== null}>{opt}</button>
        ))}
      </div>
      {picked !== null && (
        <p className="text-[10px] mt-2" style={{ color: picked === quiz.a ? "#059669" : "#dc2626" }}>
          {picked === quiz.a ? "✅ 정답!" : `❌ 정답: ${quiz.opts[quiz.a]}`}
        </p>
      )}
    </div>
  );
};

const Tab10 = ({ onScore }) => {
  const t = T.expert;
  const [activeEvent, setActiveEvent] = useState(null);

  const timeline = [
    {
      year: "1957", title: "퍼셉트론 발명", icon: "🧠", color: "#6b7280",
      oneLiner: "뉴런을 수학으로 만들 수 있다!",
      story: "프랭크 로젠블랫이 사람의 뇌 신경세포를 흉내 낸 수학 모델을 만들었습니다. 입력을 받아 가중치를 곱하고, 합산해서 결과를 내는 단순한 구조였지만, '기계가 학습할 수 있다'는 아이디어 자체가 혁명이었습니다.",
      impact: "이것이 없었다면 → 뉴럴 네트워크라는 개념 자체가 없었을 것",
      quiz: { q: "퍼셉트론의 핵심 아이디어는?", opts: ["규칙을 수동으로 입력", "뇌의 뉴런을 수학으로 모방", "인터넷 검색"], a: 1 },
    },
    {
      year: "1986", title: "역전파 알고리즘", icon: "🔄", color: "#dc2626",
      oneLiner: "실수에서 배울 수 있게 됐다",
      story: "제프리 힌턴이 '오차를 거꾸로 전파해서 가중치를 수정하는' 방법을 정립했습니다. 이전에는 퍼셉트론이 틀려도 '어디가 틀렸는지' 알 수 없었는데, 역전파 덕분에 깊은 네트워크도 학습이 가능해졌습니다. 코스1에서 배운 '부장님의 뼈저린 반성'이 바로 이것입니다.",
      impact: "이것이 없었다면 → 딥러닝은 존재하지 않았을 것",
      quiz: { q: "역전파가 해결한 문제는?", opts: ["데이터 부족", "오차를 기반으로 가중치를 수정하는 방법", "컴퓨터 속도"], a: 1 },
    },
    {
      year: "1998", title: "LeNet-5 (CNN 탄생)", icon: "👁️", color: "#2563eb",
      oneLiner: "AI가 눈을 떴다",
      story: "얀 르쿤이 합성곱 신경망(CNN)으로 손글씨 숫자를 인식하는 LeNet-5를 만들었습니다. 미국 우체국이 이 기술로 우편번호를 자동 분류하기 시작했습니다. '손전등으로 이미지를 비추는' 합성곱 아이디어가 여기서 시작됐습니다.",
      impact: "이것이 없었다면 → TEPCO의 전주 자동 점검, 자율주행 모두 불가능",
      quiz: { q: "LeNet-5의 실제 활용 사례는?", opts: ["음악 생성", "우편번호 자동 분류", "날씨 예측"], a: 1 },
    },
    {
      year: "2012", title: "AlexNet — 딥러닝 빅뱅", icon: "💥", color: "#ea580c",
      oneLiner: "GPU 하나가 AI의 겨울을 끝냈다",
      story: "알렉스 크리제브스키가 GPU로 깊은 CNN을 학습시켜 ImageNet 대회에서 오류율을 26%→16%로 절반 가까이 줄였습니다. 2위와의 격차가 압도적이어서, 전 세계 연구자들이 '딥러닝이 진짜구나'를 깨달은 순간입니다. AI의 겨울이 끝나고 봄이 온 날입니다.",
      impact: "이것이 없었다면 → AI 연구에 투자가 이루어지지 않았을 것",
      quiz: { q: "AlexNet이 기존과 달랐던 핵심은?", opts: ["규칙 기반 프로그래밍", "GPU를 활용한 깊은 신경망 학습", "소규모 데이터 사용"], a: 1 },
    },
    {
      year: "2015", title: "AlphaGo — 이세돌 대국", icon: "⚫", color: "#1e293b",
      oneLiner: "인간 최고수를 이긴 AI",
      story: "구글 딥마인드의 AlphaGo가 이세돌 9단을 4:1로 이겼습니다. 바둑은 경우의 수가 우주 원자 수보다 많아서 '절대 AI가 못 이긴다'던 영역이었습니다. 강화학습과 딥러닝의 결합이 이뤄낸 성과로, AI가 '스스로 전략을 학습할 수 있다'는 것을 전 세계에 증명했습니다.",
      impact: "이것이 없었다면 → 강화학습 기반 최적화(마이크로그리드 등)의 상용화가 늦어졌을 것",
      quiz: { q: "AlphaGo가 사용한 핵심 기술은?", opts: ["OCR", "강화학습 + 딥러닝", "엑셀 매크로"], a: 1 },
    },
    {
      year: "2017", title: "Attention Is All You Need", icon: "📜", color: "#7c3aed",
      featured: true,
      oneLiner: "논문 한 편이 판도를 바꿨다",
      story: "구글 연구팀이 8명의 저자로 발표한 이 논문은 AI 역사상 가장 영향력 있는 논문 중 하나입니다. 핵심 메시지는 단순했습니다: '순차 처리(RNN)를 버리고 어텐션만으로 충분하다.' Transformer라는 새로운 구조를 제안했는데, 이것이 GPT, BERT, Claude, Gemini 등 오늘날 모든 대형 AI의 기반이 됩니다. 제목 그대로 — Attention이 전부였습니다.",
      impact: "이것이 없었다면 → ChatGPT, Claude, GPT-4 모두 존재하지 않음. 전력산업의 AI 도입도 크게 늦어졌을 것",
      details: [
        { label: "이전", desc: "RNN/LSTM — 순차 처리라 느리고, 긴 문장에서 정보 손실" },
        { label: "이후", desc: "Transformer — 병렬 처리 + 전체 문맥 한 번에 참조 = 빠르고 정확" },
        { label: "핵심 수식", desc: "Attention(Q,K,V) = softmax(QK^T / √dk)V — 코스3에서 배운 바로 그것" },
      ],
      quiz: { q: "이 논문이 제안한 핵심 아이디어는?", opts: ["더 큰 GPU 사용", "RNN 없이 어텐션만으로 언어를 처리", "이미지 인식 개선"], a: 1 },
    },
    {
      year: "2018", title: "BERT / GPT-1", icon: "📖", color: "#059669",
      oneLiner: "AI가 언어를 '이해'하기 시작하다",
      story: "구글의 BERT와 OpenAI의 GPT-1이 같은 해에 등장했습니다. 둘 다 Transformer 기반이지만 방향이 달랐습니다. BERT는 '빈칸 맞추기'로 양방향 이해를, GPT는 '다음 단어 예측'으로 생성을 선택했습니다. 이 두 갈래가 오늘날 '이해하는 AI'와 '생성하는 AI'의 시작점입니다.",
      impact: "이것이 없었다면 → 검색엔진 품질 개선과 텍스트 생성 AI 모두 지연",
      quiz: { q: "GPT와 BERT의 차이는?", opts: ["GPT는 이미지용, BERT는 텍스트용", "GPT는 다음 단어 예측, BERT는 빈칸 맞추기", "둘 다 같은 방식"], a: 1 },
    },
    {
      year: "2020", title: "GPT-3 (1,750억 파라미터)", icon: "🚀", color: "#0284c7",
      oneLiner: "규모가 지능을 만들다",
      story: "OpenAI가 파라미터 1,750억 개짜리 모델을 공개했습니다. 놀라운 점은 별도 학습 없이 프롬프트만으로 번역, 요약, 코딩까지 해낸다는 것이었습니다. '크게 만들면 똑똑해진다'는 스케일링 법칙이 증명된 순간. 코스3 트랜스포머 챕터에서 다룬 7토큰 × 12,288차원이 바로 이 모델의 구조입니다.",
      impact: "이것이 없었다면 → 프롬프트 엔지니어링이라는 개념이 없었을 것",
      quiz: { q: "GPT-3가 보여준 핵심 능력은?", opts: ["이미지 생성", "별도 학습 없이 프롬프트만으로 다양한 과제 수행", "로봇 제어"], a: 1 },
    },
    {
      year: "2022", title: "ChatGPT — 모두의 AI", icon: "💬", color: "#16a34a",
      oneLiner: "2개월 만에 1억 사용자",
      story: "GPT-3.5에 RLHF(인간 피드백 강화학습)를 적용해 '대화형'으로 만든 것이 ChatGPT입니다. 기술적 혁신보다는 '인터페이스의 혁신'이었습니다 — 누구나 자연어로 AI와 대화할 수 있게 되면서, AI가 연구실에서 전 국민의 손안으로 나왔습니다. 역사상 가장 빠르게 1억 사용자를 달성한 서비스입니다.",
      impact: "이것이 없었다면 → 여러분이 지금 이 교육을 받고 있지 않을 것",
      quiz: { q: "ChatGPT의 핵심 혁신은?", opts: ["새로운 신경망 구조", "누구나 대화로 사용할 수 있는 인터페이스 + RLHF", "하드웨어 개선"], a: 1 },
    },
    {
      year: "2024~", title: "멀티모달 & AI 에이전트 시대", icon: "🌐", color: "#a855f7",
      oneLiner: "텍스트를 넘어 보고, 듣고, 행동하는 AI",
      story: "GPT-4o, Claude 3.5, Gemini 등이 텍스트+이미지+음성을 동시에 처리합니다. AI가 단순히 '답하는' 것에서 '직접 행동하는' 에이전트로 진화하고 있습니다. 전력산업에서도 SCADA 데이터+드론 영상+문서를 AI가 종합 분석하는 시대가 열리고 있습니다.",
      impact: "지금 진행 중 → 전력산업의 AI 전환이 가속화되는 중",
      quiz: { q: "멀티모달 AI의 의미는?", opts: ["여러 모델을 합친 것", "텍스트, 이미지, 음성 등 여러 형태를 동시에 처리", "여러 언어를 지원"], a: 1 },
    },
  ];

  return (
    <div className="space-y-8">
      <Card t={t}>
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-lg" style={{ background: t.dim, border: `1px solid ${t.border}` }}>
            <BookOpen size={18} style={{ color: t.accent }} />
          </div>
          <div>
            <p className="text-[10px] font-bold tracking-widest uppercase" style={{ color: t.accent }}>AI HISTORY</p>
            <h2 className="text-lg font-black text-slate-800">AI 혁명의 순간들</h2>
          </div>
        </div>
        <p className="text-sm text-slate-500 mb-6">기술만 알면 교과서, 이야기를 알면 교양. AI를 바꾼 결정적 순간들을 따라가봅니다.</p>

        {/* Timeline */}
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200" />

          <div className="space-y-1">
            {timeline.map((evt, i) => {
              const isActive = activeEvent === i;
              const isFeatured = evt.featured;
              return (
                <div key={i}>
                  <button onClick={() => setActiveEvent(isActive ? null : i)}
                    className={`relative w-full text-left pl-12 pr-4 py-3 rounded-xl transition-all ${isActive ? "" : "hover:bg-gray-50"} ${isFeatured && !isActive ? "bg-purple-50/50" : ""}`}
                    style={isActive ? { background: evt.color + "10", border: `1px solid ${evt.color}30` } : {}}>
                    {/* Dot on timeline */}
                    <div className={`absolute left-2.5 top-4 w-3 h-3 rounded-full border-2 border-white transition-all ${isActive ? "scale-125" : ""}`}
                      style={{ background: evt.color, boxShadow: isActive ? `0 0 8px ${evt.color}60` : "none" }} />
                    {/* Year + title */}
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-black" style={{ color: evt.color }}>{evt.year}</span>
                      <span className="text-sm font-bold text-gray-800">{evt.icon} {evt.title}</span>
                      {isFeatured && <span className="text-[8px] px-1.5 py-0.5 rounded-full font-bold bg-purple-100 text-purple-700">핵심</span>}
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5 italic">"{evt.oneLiner}"</p>
                  </button>

                  {/* Expanded content */}
                  {isActive && (
                    <div className="ml-12 mr-4 mb-3 space-y-3" style={{ animation: "fadeIn 0.4s ease-out" }}>
                      {/* Story */}
                      <div className="p-4 bg-white rounded-xl border border-gray-200">
                        <p className="text-xs text-gray-700 leading-relaxed">{evt.story}</p>
                      </div>

                      {/* Before/After (featured only) */}
                      {evt.details && (
                        <div className="space-y-1.5">
                          {evt.details.map((d, di) => (
                            <div key={di} className="flex items-start gap-2 p-3 rounded-lg" style={{ background: evt.color + "08" }}>
                              <span className="text-[10px] font-bold shrink-0 px-1.5 py-0.5 rounded" style={{ background: evt.color + "20", color: evt.color }}>{d.label}</span>
                              <p className="text-xs text-gray-600">{d.desc}</p>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Impact */}
                      <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
                        <p className="text-xs text-amber-800"><strong>만약 이것이 없었다면?</strong> {evt.impact}</p>
                      </div>

                      {/* Mini quiz */}
                      <QuickQuiz quiz={evt.quiz} key={`quiz-${i}`} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-6 p-4 rounded-xl" style={{ background: "rgba(168,85,247,0.06)", border: "1px solid rgba(168,85,247,0.15)" }}>
          <p className="text-xs text-purple-800"><strong>이 뒤의 챕터에서는</strong> 이 역사 속 기술들 — Transformer, CNN, RNN/LSTM, 강화학습 — 의 내부 구조를 직접 해부합니다. 각 기술이 '왜 그렇게 만들어졌는지'를 알면, 수식이 외우는 것이 아니라 이해하는 것이 됩니다.</p>
        </div>
      </Card>
    </div>
  );
};

// ─── TAB 7: CNN — 본다는 것의 원리 (Course 3) ─────────
const Tab7 = ({ onScore }) => {
  const t = T.expert;
  const [step, setStep] = useState(0);

  // CH2: CNN - 손전등 비유
  const CNNStep1 = () => {
    const [filterPos, setFilterPos] = useState(0);
    const maxPos = 4;
    const imageGrid = [
      [0, 0, 50, 100, 100],
      [0, 50, 100, 100, 50],
      [50, 100, 100, 50, 0],
      [100, 100, 50, 0, 0],
      [100, 50, 0, 0, 0],
    ];
    const filter = [[-1, 0, 1], [-1, 0, 1], [-1, 0, 1]]; // 세로 엣지 필터
    const row = Math.floor(filterPos / 3);
    const col = filterPos % 3;
    // Compute convolution at current position
    let convVal = 0;
    for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) {
      convVal += (imageGrid[row + i]?.[col + j] || 0) * filter[i][j];
    }
    convVal = Math.abs(convVal);

    return (
      <div className="space-y-5">
        <div className="p-4 rounded-xl" style={{ background: "rgba(168,85,247,0.06)", border: "1px solid rgba(168,85,247,0.15)" }}>
          <p className="text-sm text-purple-800 font-medium mb-1">어두운 벽에 손전등을 비추다</p>
          <p className="text-xs text-purple-600">CNN은 이미지를 한 번에 보지 않습니다. 작은 필터(손전등)를 이미지 위로 슬라이딩하며 패턴을 찾습니다.</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
          <p className="text-xs font-bold text-gray-500 tracking-widest uppercase">STEP 1 — 합성곱(Convolution) 연산</p>

          <div className="flex gap-6 items-start flex-wrap justify-center">
            {/* Image grid */}
            <div>
              <p className="text-[10px] text-gray-400 mb-2 text-center">입력 이미지 (5×5 픽셀)</p>
              <div className="relative inline-block">
                <div className="grid grid-cols-5 gap-0.5">
                  {imageGrid.flat().map((v, i) => {
                    const r = Math.floor(i / 5), c2 = i % 5;
                    const isInFilter = r >= row && r < row + 3 && c2 >= col && c2 < col + 3;
                    return (
                      <div key={i} className={`w-9 h-9 flex items-center justify-center text-[9px] font-mono font-bold rounded-sm transition-all ${isInFilter ? "ring-2 ring-purple-500 z-10" : ""}`}
                        style={{ background: `rgba(0,0,0,${v / 100})`, color: v > 50 ? "white" : "#333" }}>
                        {v}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Filter (flashlight) */}
            <div>
              <p className="text-[10px] text-gray-400 mb-2 text-center">🔦 필터 (3×3)</p>
              <div className="grid grid-cols-3 gap-0.5 mb-2">
                {filter.flat().map((v, i) => (
                  <div key={i} className="w-9 h-9 flex items-center justify-center text-xs font-mono font-bold rounded-sm"
                    style={{ background: v < 0 ? "#fecaca" : v > 0 ? "#bbf7d0" : "#f1f5f9", color: v < 0 ? "#dc2626" : v > 0 ? "#16a34a" : "#9ca3af" }}>
                    {v > 0 ? "+" : ""}{v}
                  </div>
                ))}
              </div>
              <p className="text-[9px] text-gray-400 text-center">세로 엣지 검출 필터</p>
            </div>

            {/* Output value */}
            <div className="text-center">
              <p className="text-[10px] text-gray-400 mb-2">출력값</p>
              <div className="w-16 h-16 flex items-center justify-center rounded-xl text-lg font-black transition-all"
                style={{ background: `rgba(168,85,247,${Math.min(convVal / 300, 1)})`, color: convVal > 150 ? "white" : "#6b21a8" }}>
                {convVal}
              </div>
              <p className="text-[9px] text-gray-400 mt-1">{convVal > 200 ? "🔥 강한 엣지!" : convVal > 100 ? "엣지 감지" : "약한 신호"}</p>
            </div>
          </div>

          {/* Slider to move filter */}
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-500">필터 위치:</span>
            <input type="range" min="0" max={maxPos} value={filterPos}
              onChange={e => setFilterPos(parseInt(e.target.value))}
              className="flex-1" style={{ accentColor: "#a855f7" }} />
            <span className="text-xs font-mono text-purple-600">({row},{col})</span>
          </div>

          <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
            <p className="text-xs text-purple-800">💡 필터가 이미지 위를 이동하며, 밝기가 급변하는 곳(=엣지)에서 높은 값을 출력합니다. <strong>이것이 "손전등으로 벽을 비추는 것"</strong>입니다 — 빛이 닿은 곳의 패턴만 보입니다.</p>
          </div>
        </div>
      </div>
    );
  };

  const CNNStep2 = () => {
    const [activeLayer, setActiveLayer] = useState(0);
    const layers = [
      { name: "Layer 1", filters: 32, detects: "가로선, 세로선, 대각선", icon: "📐", example: "전주 사진에서 직선 성분 검출" },
      { name: "Layer 3", filters: 64, detects: "모서리, 곡선, 텍스처", icon: "🔲", example: "콘크리트 표면의 균열 패턴 포착" },
      { name: "Layer 5", filters: 128, detects: "부분 형태 (볼트, 너트, 와이어)", icon: "🔩", example: "애자, 클램프 등 부품 형태 인식" },
      { name: "Layer 8", filters: 256, detects: "전체 물체 (전주, 변압기)", icon: "🏗️", example: "'이것은 전주다' — 최종 판정" },
    ];
    return (
      <div className="space-y-5">
        <div className="p-4 rounded-xl" style={{ background: "rgba(168,85,247,0.06)", border: "1px solid rgba(168,85,247,0.15)" }}>
          <p className="text-sm text-purple-800 font-medium mb-1">손전등이 점점 넓어진다</p>
          <p className="text-xs text-purple-600">레이어가 깊어질수록 더 넓은 영역을, 더 추상적인 패턴으로 인식합니다.</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
          <p className="text-xs font-bold text-gray-500 tracking-widest uppercase">STEP 2 — 레이어별 추상화</p>

          <div className="space-y-2">
            {layers.map((l, i) => (
              <button key={i} onClick={() => setActiveLayer(i)}
                className={`w-full text-left p-3 rounded-xl border-2 transition-all ${i === activeLayer ? "border-purple-500" : "border-gray-100 hover:border-gray-200"}`}
                style={i === activeLayer ? { background: "rgba(168,85,247,0.06)" } : {}}>
                <div className="flex items-center gap-3">
                  <span className="text-xl">{l.icon}</span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-bold text-gray-800">{l.name}</p>
                      <span className="text-[9px] px-1.5 py-0.5 bg-purple-100 text-purple-700 rounded-full">{l.filters} 필터</span>
                    </div>
                    <p className="text-[10px] text-gray-500">감지: {l.detects}</p>
                  </div>
                  {/* Abstraction level bar */}
                  <div className="w-16 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${(i + 1) * 25}%`, background: "#a855f7" }} />
                  </div>
                </div>
                {i === activeLayer && (
                  <div className="mt-2 p-2 bg-white rounded-lg" style={{ animation: "fadeIn 0.3s" }}>
                    <p className="text-[10px] text-gray-600">⚡ 전력산업 적용: {l.example}</p>
                  </div>
                )}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1 text-[9px] text-gray-400 justify-center">
            <span>구체적</span>
            <div className="flex gap-0.5">{[...Array(4)].map((_, i) => <div key={i} className="w-8 h-1.5 rounded-full" style={{ background: `rgba(168,85,247,${(i + 1) * 0.25})` }} />)}</div>
            <span>추상적</span>
          </div>

          <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
            <p className="text-xs text-amber-800"><strong>핵심:</strong> 사람의 시각도 동일합니다 — 망막(엣지) → V1(방향) → V4(형태) → IT(물체 인식). CNN은 이 과정을 수학으로 구현한 것입니다. TEPCO가 전주 불량을 탐지하는 AI도 이 구조입니다.</p>
          </div>
        </div>
      </div>
    );
  };

  const CNNStep3 = () => (
    <div className="space-y-5">
      <div className="p-4 rounded-xl" style={{ background: "rgba(168,85,247,0.06)", border: "1px solid rgba(168,85,247,0.15)" }}>
        <p className="text-sm text-purple-800 font-medium mb-1">Pooling — 멀리서 비추기</p>
        <p className="text-xs text-purple-600">세부사항을 버리고 핵심만 남기는 과정입니다. 해상도를 줄여 계산량을 낮추면서 중요한 특징은 유지합니다.</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
        <p className="text-xs font-bold text-gray-500 tracking-widest uppercase">STEP 3 — Max Pooling</p>

        <div className="flex gap-4 items-center justify-center flex-wrap">
          {/* Before pooling */}
          <div>
            <p className="text-[10px] text-gray-400 mb-2 text-center">특징맵 (4×4)</p>
            <div className="grid grid-cols-4 gap-0.5">
              {[
                [220, 50, 180, 30],
                [10, 190, 40, 160],
                [170, 20, 200, 60],
                [30, 150, 10, 210],
              ].flat().map((v, i) => {
                const group = Math.floor(Math.floor(i / 4) / 2) * 2 + Math.floor((i % 4) / 2);
                const colors = ["#ddd6fe", "#bfdbfe", "#d1fae5", "#fef3c7"];
                return (
                  <div key={i} className="w-10 h-10 flex items-center justify-center text-[9px] font-mono font-bold rounded-sm"
                    style={{ background: colors[group], color: "#374151" }}>{v}</div>
                );
              })}
            </div>
          </div>

          <div className="text-center">
            <ArrowRight size={20} className="text-purple-400" />
            <p className="text-[9px] text-gray-400 mt-1">Max</p>
          </div>

          {/* After pooling */}
          <div>
            <p className="text-[10px] text-gray-400 mb-2 text-center">풀링 결과 (2×2)</p>
            <div className="grid grid-cols-2 gap-0.5">
              {[220, 180, 170, 210].map((v, i) => {
                const colors = ["#c4b5fd", "#93c5fd", "#6ee7b7", "#fde68a"];
                return (
                  <div key={i} className="w-14 h-14 flex items-center justify-center text-sm font-mono font-black rounded-sm"
                    style={{ background: colors[i], color: "#374151" }}>{v}</div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="p-3 bg-gray-50 rounded-lg">
          <p className="text-xs text-gray-600">각 2×2 영역에서 <strong>최댓값</strong>만 남깁니다. 4×4 → 2×2로 크기가 절반으로. 손전등을 멀리서 비추면 세부사항은 사라지지만 전체 윤곽이 선명해지는 것과 같습니다.</p>
        </div>

        <div className="p-3 bg-gray-100 rounded-lg">
          <p className="text-xs text-gray-600"><strong>📊 수치:</strong> 224×224 입력 이미지가 Conv+Pool을 거치면 7×7까지 축소. 픽셀 수 50,176개 → 49개로 1,000배 압축되지만, "전주인지 변압기인지"는 정확히 판별합니다.</p>
        </div>
      </div>
    </div>
  );

  const CNNStep4 = () => {
    const [customFilter, setCustomFilter] = useState([0,0,0, 0,0,0, 0,0,0]);
    const presets = [
      { name: "세로 엣지", values: [-1,0,1,-1,0,1,-1,0,1] },
      { name: "가로 엣지", values: [-1,-1,-1,0,0,0,1,1,1] },
      { name: "샤프닝", values: [0,-1,0,-1,5,-1,0,-1,0] },
      { name: "블러", values: [1,1,1,1,1,1,1,1,1] },
    ];
    const testImg = [[20,20,80,80,80],[20,20,80,80,80],[20,20,80,80,80],[20,20,80,80,80],[20,20,80,80,80]];
    const computeOutput = () => {
      const res = [];
      for (let r = 0; r <= 2; r++) { const row = []; for (let c2 = 0; c2 <= 2; c2++) { let s = 0; for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) s += (testImg[r+i]?.[c2+j]||0)*customFilter[i*3+j]; row.push(Math.abs(Math.round(s))); } res.push(row); }
      return res;
    };
    const output = computeOutput();
    const maxOut = Math.max(...output.flat(), 1);
    return (
      <div className="space-y-5">
        <div className="p-4 rounded-xl" style={{ background: "rgba(168,85,247,0.06)", border: "1px solid rgba(168,85,247,0.15)" }}>
          <p className="text-sm text-purple-800 font-medium mb-1">나만의 손전등 만들기</p>
          <p className="text-xs text-purple-600">필터 값을 직접 설정하고, 이미지에 적용 결과를 실험해보세요. 프리셋을 먼저 눌러보고, 값을 바꿔보세요.</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
          <p className="text-xs font-bold text-gray-500 tracking-widest uppercase">나만의 필터 실험실</p>
          <div className="flex gap-1.5 flex-wrap">
            {presets.map((p, i) => (
              <button key={i} onClick={() => setCustomFilter([...p.values])} className="px-3 py-1.5 rounded-lg text-[10px] font-medium bg-purple-50 text-purple-700 border border-purple-200 hover:bg-purple-100">{p.name}</button>
            ))}
            <button onClick={() => setCustomFilter([0,0,0,0,0,0,0,0,0])} className="px-3 py-1.5 rounded-lg text-[10px] font-medium bg-gray-50 text-gray-500 border border-gray-200">초기화</button>
          </div>
          <div className="flex gap-6 items-start flex-wrap justify-center">
            <div>
              <p className="text-[10px] text-gray-400 mb-2 text-center">🔦 내 필터 (클릭해서 수정)</p>
              <div className="grid grid-cols-3 gap-0.5">
                {customFilter.map((v, i) => (
                  <button key={i} onClick={() => { const nf = [...customFilter]; nf[i] = nf[i] >= 1 ? -1 : nf[i]+1; setCustomFilter(nf); }}
                    className="w-11 h-11 flex items-center justify-center text-sm font-mono font-bold rounded-sm cursor-pointer hover:scale-110 transition-all"
                    style={{ background: v<0?"#fecaca":v>0?"#bbf7d0":"#f1f5f9", color: v<0?"#dc2626":v>0?"#16a34a":"#9ca3af" }}>
                    {v>0?"+":""}{v}
                  </button>
                ))}
              </div>
              <p className="text-[8px] text-gray-400 mt-1 text-center">클릭: -1 → 0 → +1 순환</p>
            </div>
            <div>
              <p className="text-[10px] text-gray-400 mb-2 text-center">결과 (특징맵)</p>
              <div className="grid grid-cols-3 gap-0.5">
                {output.flat().map((v, i) => (
                  <div key={i} className="w-11 h-11 flex items-center justify-center text-[9px] font-mono font-bold rounded-sm"
                    style={{ background: `rgba(168,85,247,${Math.min(v/maxOut,1)})`, color: v/maxOut>0.5?"white":"#6b21a8" }}>{v}</div>
                ))}
              </div>
            </div>
          </div>
          <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
            <p className="text-xs text-purple-800">💡 <strong>세로 엣지</strong>는 좌우 밝기 차이를, <strong>가로 엣지</strong>는 상하 차이를 감지합니다. <strong>샤프닝</strong>은 중앙을 강조, <strong>블러</strong>는 주변 평균으로 부드럽게. 실제 CNN은 이런 필터 수백 개를 학습으로 자동 생성합니다.</p>
          </div>
        </div>
      </div>
    );
  };

  const CNNQuiz = () => {
    const [answers, setAnswers] = useState({});
    const [submitted, setSubmitted] = useState(false);
    const questions = [
      { id:"q1", q:"CNN에서 '합성곱(Convolution)'이란?", opts:["이미지 전체를 한 번에 분석하는 것","작은 필터를 이미지 위로 슬라이딩하며 패턴을 찾는 것","이미지를 축소하는 것","색상을 변환하는 것"], ans:1 },
      { id:"q2", q:"레이어가 깊어질수록 CNN이 인식하는 것은?", opts:["점점 더 구체적인 픽셀 값","점점 더 추상적인 패턴 (선→윤곽→물체)","점점 더 작은 이미지","점점 더 많은 색상"], ans:1 },
      { id:"q3", q:"Max Pooling의 역할은?", opts:["이미지 해상도를 높이는 것","필터 개수를 늘리는 것","핵심 특징을 유지하며 크기를 줄이는 것","색상을 흑백으로 변환하는 것"], ans:2 },
      { id:"q4", q:"TEPCO가 전주 점검에 CNN을 사용하는 이유는?", opts:["사진을 예쁘게 보정하려고","드론 영상에서 균열/기울기 등 결함을 자동 탐지하려고","전주 개수를 세려고","전주 색상을 분류하려고"], ans:1 },
    ];
    const score = submitted ? questions.filter(q => answers[q.id] === q.ans).length : 0;
    return (
      <div className="space-y-5">
        <div className="p-4 rounded-xl" style={{ background: "rgba(168,85,247,0.06)", border: "1px solid rgba(168,85,247,0.15)" }}>
          <p className="text-sm text-purple-800 font-medium">이해도 체크</p>
          <p className="text-xs text-purple-600">CNN에 대해 얼마나 이해했는지 확인해보세요!</p>
        </div>
        <div className="space-y-4">
          {questions.map((q, qi) => (
            <div key={q.id} className="bg-white rounded-xl border border-gray-200 p-4">
              <p className="text-xs font-bold text-gray-800 mb-3">Q{qi+1}. {q.q}</p>
              <div className="space-y-1.5">
                {q.opts.map((opt, oi) => {
                  const sel = answers[q.id]===oi, correct = submitted&&oi===q.ans, wrong = submitted&&sel&&oi!==q.ans;
                  return (
                    <button key={oi} onClick={() => !submitted && setAnswers(p => ({...p,[q.id]:oi}))}
                      className={`w-full text-left p-2.5 rounded-lg text-xs transition-all border ${correct?"bg-emerald-50 border-emerald-300 text-emerald-800 font-bold":wrong?"bg-red-50 border-red-300 text-red-800":sel?"border-purple-400 bg-purple-50 text-purple-800":"border-gray-100 hover:border-gray-200 text-gray-600"}`}
                      disabled={submitted}>{opt}</button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
        {!submitted ? (
          <button onClick={() => setSubmitted(true)} disabled={Object.keys(answers).length<questions.length}
            className="px-5 py-2.5 rounded-xl text-sm font-bold text-white disabled:opacity-30" style={{ background:"#a855f7" }}>제출하기</button>
        ) : (
          <div className="p-4 rounded-xl text-center" style={{ background: score===questions.length?"rgba(16,185,129,0.08)":"rgba(245,158,11,0.08)" }}>
            <p className="text-lg font-black" style={{ color: score===questions.length?"#059669":"#d97706" }}>{score}/{questions.length} 정답</p>
            <p className="text-xs text-gray-500 mt-1">{score===questions.length?"CNN을 완벽히 이해했습니다!":"틀린 문제의 초록색 정답을 확인해보세요."}</p>
            <button onClick={() => {setAnswers({});setSubmitted(false);}} className="mt-3 text-xs text-gray-500 hover:text-gray-800"><RotateCcw size={12} className="inline mr-1"/>다시 풀기</button>
          </div>
        )}
      </div>
    );
  };

  const cnnSteps = [
    { title: "합성곱 연산", subtitle: "손전등으로 비추기", icon: Eye, content: CNNStep1 },
    { title: "레이어별 추상화", subtitle: "점점 넓게 보기", icon: Layers, content: CNNStep2 },
    { title: "풀링", subtitle: "핵심만 남기기", icon: Target, content: CNNStep3 },
    { title: "필터 실험실", subtitle: "직접 만들어보기", icon: SlidersHorizontal, content: CNNStep4 },
    { title: "이해도 체크", subtitle: "퀴즈", icon: CheckCircle2, content: CNNQuiz },
  ];

  const StepContent = cnnSteps[step]?.content;

  return (
    <div className="space-y-8">
      <Card t={t}>
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-lg" style={{ background: t.dim, border: `1px solid ${t.border}` }}>
            <Eye size={18} style={{ color: t.accent }} />
          </div>
          <div>
            <p className="text-[10px] font-bold tracking-widest uppercase" style={{ color: t.accent }}>CNN — CONVOLUTIONAL NEURAL NETWORK</p>
            <p className="text-[9px] text-gray-400 font-mono">합성곱 신경망 — 이미지 인식에 특화된 딥러닝 구조</p>
            <h2 className="text-lg font-black text-slate-800">"본다"는 것의 원리</h2>
          </div>
        </div>
        <p className="text-sm text-slate-500 mb-4">어두운 벽에 손전등을 비추듯, AI가 이미지에서 패턴을 찾아내는 원리를 해부합니다.</p>

        <div className="p-4 rounded-xl mb-6" style={{ background: "rgba(168,85,247,0.04)", border: "1px solid rgba(168,85,247,0.12)" }}>
          <p className="text-[10px] font-bold text-purple-600 tracking-widest uppercase mb-1">📜 ORIGIN STORY — 1998 → 2012</p>
          <p className="text-xs text-gray-700 leading-relaxed">1998년, 얀 르쿤이 <strong>LeNet-5</strong>로 손글씨를 인식해 미국 우체국 우편번호를 자동 분류했습니다. 하지만 당시 컴퓨터가 너무 느려서 AI의 겨울이 찾아왔죠. 14년 후인 2012년, <strong>AlexNet</strong>이 GPU의 힘으로 ImageNet 대회에서 오류율을 절반으로 줄이며 딥러닝 빅뱅을 일으킵니다. 그 핵심 구조가 바로 지금 배울 CNN입니다.</p>
        </div>

        <div className="flex gap-1.5 mb-6 overflow-x-auto pb-2">
          {cnnSteps.map((s, i) => (
            <button key={i} onClick={() => setStep(i)}
              className={`shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${i === step ? "text-white" : "bg-gray-50 text-gray-500 hover:bg-gray-100"}`}
              style={i === step ? { background: t.accent } : {}}>
              <span className="font-mono">{i + 1}</span>
              <span className="hidden sm:inline">{s.subtitle}</span>
            </button>
          ))}
        </div>

        <div className="mb-4">
          <div className="flex items-center gap-3 mb-4">
            {(() => { const Icon = cnnSteps[step].icon; return <Icon size={20} className="text-gray-700" />; })()}
            <div>
              <h3 className="font-semibold text-gray-900">{cnnSteps[step].title}</h3>
              <p className="text-xs text-gray-400">{cnnSteps[step].subtitle}</p>
            </div>
          </div>
          <StepContent />
        </div>

        <div className="flex justify-between mt-6 pt-4 border-t border-gray-100">
          <button onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0} className="flex items-center gap-1.5 px-4 py-2 text-sm text-gray-500 hover:text-gray-900 disabled:opacity-30"><ArrowLeft size={14} /> 이전</button>
          <span className="text-xs text-gray-400 self-center">{step + 1} / {cnnSteps.length}</span>
          <button onClick={() => setStep(Math.min(cnnSteps.length - 1, step + 1))} disabled={step === cnnSteps.length - 1} className="flex items-center gap-1.5 px-4 py-2 text-sm text-gray-500 hover:text-gray-900 disabled:opacity-30">다음 <ArrowRight size={14} /></button>
        </div>
      </Card>
    </div>
  );
};

// ─── TAB 8: RNN/LSTM — 시간을 기억하는 구조 (Course 3) ──
const Tab8 = ({ onScore }) => {
  const t = T.expert;
  const [modelType, setModelType] = useState("rnn");
  const [timeStep, setTimeStep] = useState(9);

  const data = [65, 70, 68, 72, 78, 85, 92, 88, 82, 75];
  const labels = ["6시", "8시", "10시", "12시", "14시", "16시", "18시", "20시", "22시", "24시"];

  const models = {
    rnn: {
      name: "단순 RNN",
      fullName: "Recurrent Neural Network (순환 신경망)",
      icon: "📝",
      metaphor: "포스트잇 1장",
      desc: "직전 정보만 기억. 오래된 정보는 잊어버림",
      detail: "출력을 다시 입력으로 순환(Recurrent)시키는 구조입니다. '지금'의 출력이 '다음'의 입력에 영향을 주므로 순서가 있는 데이터를 처리할 수 있지만, 순환이 길어지면 앞쪽 정보가 희미해집니다 (기울기 소실).",
      memory: 2,
      predictions: [65, 68, 67, 70, 74, 80, 90, 86, 80, 73],
      weakness: "어제 같은 시간대 수요? 기억 못 합니다 (기울기 소실)"
    },
    lstm: {
      name: "LSTM",
      fullName: "Long Short-Term Memory (장단기 기억)",
      icon: "📓",
      metaphor: "메모장 + 지우개 + 형광펜",
      desc: "중요한 건 형광펜, 불필요한 건 지우개. 선택적 기억",
      detail: "이름 그대로 '장기(Long-Term)와 단기(Short-Term) 기억을 모두' 유지합니다. Forget Gate(지우개)가 불필요한 과거를 삭제하고, Input Gate(형광펜)가 중요한 새 정보를 저장하며, Output Gate가 현재 필요한 기억만 꺼내 씁니다.",
      memory: 6,
      predictions: [65, 69, 68, 71, 77, 84, 91, 87, 81, 74],
      weakness: "장기 기억 가능하지만 순차 처리라 느림"
    },
    transformer: {
      name: "Transformer",
      fullName: "Transformer (변환기 — 어텐션 기반 구조)",
      icon: "📚",
      metaphor: "모든 페이지를 동시에 펼침",
      desc: "과거 전체를 한 번에 참조. 병렬 처리로 빠름",
      detail: "순차 처리를 완전히 버리고, Self-Attention으로 모든 위치를 한 번에 참조합니다. 'Attention Is All You Need' 논문에서 탄생. 병렬 처리가 가능해 GPU 활용 효율이 극대화되며, GPT/BERT/Claude 모두 이 구조입니다.",
      memory: 10,
      predictions: [65, 70, 68, 72, 78, 85, 92, 88, 82, 75],
      weakness: "메모리 사용량이 크고 비용이 높음"
    },
  };

  const model = models[modelType];
  const maxVal = Math.max(...data) + 5;

  return (
    <div className="space-y-8">
      <Card t={t}>
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-lg" style={{ background: t.dim, border: `1px solid ${t.border}` }}>
            <RefreshCw size={18} style={{ color: t.accent }} />
          </div>
          <div>
            <p className="text-[10px] font-bold tracking-widest uppercase" style={{ color: t.accent }}>RNN → LSTM → TRANSFORMER</p>
            <h2 className="text-lg font-black text-slate-800">시간을 기억하는 구조</h2>
          </div>
        </div>
        <p className="text-sm text-slate-500 mb-4">기억력 나쁜 메모장에서 모든 페이지를 동시에 펼치는 구조로 — 시계열 AI의 진화</p>

        <div className="p-4 rounded-xl mb-6" style={{ background: "rgba(168,85,247,0.04)", border: "1px solid rgba(168,85,247,0.12)" }}>
          <p className="text-[10px] font-bold text-purple-600 tracking-widest uppercase mb-1">📜 ORIGIN STORY — 1997 → 2017</p>
          <p className="text-xs text-gray-700 leading-relaxed">1997년, 호크라이터와 슈미트후버가 <strong>LSTM</strong>을 발명합니다. RNN의 치명적 약점인 '기울기 소실' — 오래된 정보를 잊어버리는 문제를 게이트로 해결했죠. 20년간 음성인식, 기계번역의 왕좌를 지켰지만, 2017년 Transformer가 "순차 처리 자체가 불필요하다"며 왕좌를 빼앗습니다. 왜 LSTM이 잘나갔고, 왜 Transformer에 밀렸는지 — 직접 비교해봅니다.</p>
        </div>

        {/* Model selector */}
        <div className="flex gap-2 mb-6">
          {Object.entries(models).map(([key, m]) => (
            <button key={key} onClick={() => setModelType(key)}
              className={`flex-1 p-3 rounded-xl border-2 text-center transition-all ${modelType === key ? "border-purple-500" : "border-gray-100 hover:border-gray-200"}`}
              style={modelType === key ? { background: "rgba(168,85,247,0.06)" } : {}}>
              <p className="text-xl mb-1">{m.icon}</p>
              <p className="text-xs font-bold text-gray-800">{m.name}</p>
              <p className="text-[9px] text-gray-500">{m.metaphor}</p>
            </button>
          ))}
        </div>

        {/* Model description */}
        <div className="p-4 rounded-xl mb-6" style={{ background: "rgba(168,85,247,0.06)", border: "1px solid rgba(168,85,247,0.15)" }}>
          <p className="text-sm text-purple-800 font-medium">{model.icon} {model.name} — "{model.metaphor}"</p>
          <p className="text-[10px] text-purple-500 mt-0.5 font-mono">{model.fullName}</p>
          <p className="text-xs text-purple-600 mt-2">{model.desc}</p>
          <p className="text-xs text-gray-600 mt-2 leading-relaxed">{model.detail}</p>
        </div>

        {/* Prediction comparison chart */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
          <p className="text-xs font-bold text-gray-500 tracking-widest uppercase">전력 수요 예측 비교</p>

          <div className="relative" style={{ height: "160px" }}>
            <div className="absolute inset-0 flex items-end gap-1">
              {data.map((actual, i) => {
                const pred = model.predictions[i];
                const visible = i <= timeStep;
                const actualH = (actual / maxVal) * 100;
                const predH = (pred / maxVal) * 100;
                const error = Math.abs(actual - pred);
                return (
                  <div key={i} className="flex-1 flex flex-col items-center" style={{ height: "100%" }}>
                    {/* Bar area */}
                    <div className="flex-1 w-full flex items-end justify-center gap-0.5 relative">
                      {visible ? (
                        <>
                          {error > 2 && <span className="text-[7px] font-mono text-red-500 absolute -top-1 left-1/2 -translate-x-1/2">-{error}</span>}
                          <div className="w-[40%] rounded-t-sm bg-gray-300 transition-all duration-500" style={{ height: `${actualH}%` }} />
                          <div className="w-[40%] rounded-t-sm transition-all duration-500" style={{ height: `${predH}%`, background: error <= 2 ? "#a855f7" : error <= 5 ? "#f59e0b" : "#ef4444" }} />
                        </>
                      ) : (
                        <div className="w-[80%] h-1 rounded-sm bg-gray-100" />
                      )}
                    </div>
                    <span className="text-[7px] text-gray-400 mt-1 shrink-0">{labels[i]}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Legend */}
          <div className="flex gap-4 justify-center text-[9px] text-gray-500">
            <div className="flex items-center gap-1"><div className="w-3 h-2 bg-gray-300 rounded-sm" />실제</div>
            <div className="flex items-center gap-1"><div className="w-3 h-2 bg-purple-500 rounded-sm" />예측</div>
          </div>

          {/* Time step slider */}
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-500">시간 진행:</span>
            <input type="range" min="0" max={data.length - 1} value={timeStep}
              onChange={e => setTimeStep(parseInt(e.target.value))}
              className="flex-1" style={{ accentColor: "#a855f7" }} />
            <span className="text-xs font-mono text-purple-600">{labels[timeStep]}</span>
          </div>

          {/* Memory window visualization */}
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-[10px] text-gray-500 mb-2">기억 범위 (참조 가능한 과거 데이터):</p>
            <div className="flex gap-0.5">
              {data.map((_, i) => {
                const inMemory = i <= timeStep && i > timeStep - model.memory;
                return (
                  <div key={i} className={`flex-1 h-3 rounded-sm transition-all ${i <= timeStep ? (inMemory ? "bg-purple-400" : "bg-gray-200") : "bg-gray-100"}`} />
                );
              })}
            </div>
            <p className="text-[9px] text-gray-400 mt-1">💬 {model.weakness}</p>
          </div>
        </div>

        <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
          <p className="text-xs text-amber-800"><strong>전력산업 적용:</strong> National Grid는 Transformer 기반 모델로 수요예측 정확도 98%+를 달성했습니다. 단순 RNN으로는 "어제 같은 시간" 패턴을 놓치지만, Transformer는 일주일 전, 작년 같은 날까지 한 번에 참조합니다.</p>
        </div>

        {/* LSTM Gate Interactive */}
        <div className="mt-6 bg-white rounded-xl border border-gray-200 p-5 space-y-4">
          <p className="text-xs font-bold text-gray-500 tracking-widest uppercase">LSTM 게이트 시각화 — 메모장의 비밀</p>
          <p className="text-xs text-gray-500">LSTM은 3개의 게이트(문)로 기억을 관리합니다. 각 게이트를 토글해보세요.</p>

          {(() => {
            const [forget, setForget] = useState(false);
            const [input, setInput] = useState(false);
            const [output, setOutput] = useState(false);
            const memory = ["어제 수요: 75GW", "그제 기온: 28°C", "지난주 피크: 82GW"];
            const newInfo = "오늘 기온: 35°C (폭염)";
            return (
              <div className="space-y-3">
                <div className="grid grid-cols-3 gap-2">
                  <button onClick={() => setForget(!forget)} className={`p-3 rounded-xl border-2 text-center transition-all ${forget ? "border-red-400 bg-red-50" : "border-gray-200"}`}>
                    <p className="text-lg mb-1">🗑️</p>
                    <p className="text-[10px] font-bold text-gray-800">Forget Gate</p>
                    <p className="text-[9px] text-gray-500">불필요한 기억 삭제</p>
                    <p className="text-[8px] mt-1 font-bold" style={{ color: forget ? "#dc2626" : "#9ca3af" }}>{forget ? "ON — 지우는 중" : "OFF"}</p>
                  </button>
                  <button onClick={() => setInput(!input)} className={`p-3 rounded-xl border-2 text-center transition-all ${input ? "border-emerald-400 bg-emerald-50" : "border-gray-200"}`}>
                    <p className="text-lg mb-1">📥</p>
                    <p className="text-[10px] font-bold text-gray-800">Input Gate</p>
                    <p className="text-[9px] text-gray-500">새 정보 저장</p>
                    <p className="text-[8px] mt-1 font-bold" style={{ color: input ? "#059669" : "#9ca3af" }}>{input ? "ON — 저장 중" : "OFF"}</p>
                  </button>
                  <button onClick={() => setOutput(!output)} className={`p-3 rounded-xl border-2 text-center transition-all ${output ? "border-blue-400 bg-blue-50" : "border-gray-200"}`}>
                    <p className="text-lg mb-1">📤</p>
                    <p className="text-[10px] font-bold text-gray-800">Output Gate</p>
                    <p className="text-[9px] text-gray-500">기억 출력 결정</p>
                    <p className="text-[8px] mt-1 font-bold" style={{ color: output ? "#2563eb" : "#9ca3af" }}>{output ? "ON — 출력 중" : "OFF"}</p>
                  </button>
                </div>

                <div className="p-3 bg-gray-50 rounded-lg space-y-2">
                  <p className="text-[10px] font-bold text-gray-600">📓 메모장 (Cell State):</p>
                  {memory.map((m, i) => (
                    <div key={i} className={`flex items-center gap-2 text-xs p-1.5 rounded transition-all ${forget && i === 1 ? "line-through text-red-400 bg-red-50" : "text-gray-700"}`}>
                      <span>{forget && i === 1 ? "🗑️" : "📌"}</span> {m}
                    </div>
                  ))}
                  {input && (
                    <div className="flex items-center gap-2 text-xs p-1.5 rounded bg-emerald-50 text-emerald-700 font-bold" style={{ animation: "fadeIn 0.3s" }}>
                      <span>✨</span> {newInfo} <span className="text-[9px] text-emerald-500">(NEW)</span>
                    </div>
                  )}
                </div>

                {output && (
                  <div className="p-3 bg-blue-50 rounded-lg border border-blue-200" style={{ animation: "fadeIn 0.3s" }}>
                    <p className="text-xs text-blue-800"><strong>출력:</strong> 폭염(35°C) + 지난주 피크(82GW) 참고 → 예측: <strong>85GW</strong></p>
                  </div>
                )}
              </div>
            );
          })()}
        </div>

        {/* RNN/LSTM Quiz */}
        {(() => {
          const [ans, setAns] = useState({});
          const [done, setDone] = useState(false);
          const qs = [
            { id:"r1", q:"RNN의 가장 큰 한계는?", opts:["계산이 느림","오래된 정보를 잊어버림 (기울기 소실)","색상을 구분 못함","텍스트만 처리 가능"], a:1 },
            { id:"r2", q:"LSTM의 Forget Gate 역할은?", opts:["새 정보를 저장","불필요한 과거 기억을 삭제","최종 결과를 출력","입력 데이터를 변환"], a:1 },
            { id:"r3", q:"Transformer가 RNN/LSTM보다 유리한 이유는?", opts:["메모리를 적게 사용","과거 전체를 한 번에 참조 + 병렬 처리 가능","필터를 사용해서","강화학습을 포함해서"], a:1 },
          ];
          const sc = done ? qs.filter(q => ans[q.id]===q.a).length : 0;
          return (
            <div className="mt-6 bg-white rounded-xl border border-gray-200 p-5 space-y-4">
              <p className="text-xs font-bold text-gray-500 tracking-widest uppercase">이해도 체크 — RNN/LSTM/Transformer</p>
              {qs.map((q, qi) => (
                <div key={q.id} className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs font-bold text-gray-800 mb-2">Q{qi+1}. {q.q}</p>
                  <div className="space-y-1">
                    {q.opts.map((o, oi) => {
                      const sel=ans[q.id]===oi, cor=done&&oi===q.a, wr=done&&sel&&oi!==q.a;
                      return <button key={oi} onClick={() => !done&&setAns(p=>({...p,[q.id]:oi}))} disabled={done}
                        className={`w-full text-left p-2 rounded-lg text-xs border transition-all ${cor?"bg-emerald-50 border-emerald-300 font-bold":wr?"bg-red-50 border-red-300":sel?"border-purple-400 bg-purple-50":"border-gray-100 hover:border-gray-200"} text-gray-600`}>{o}</button>;
                    })}
                  </div>
                </div>
              ))}
              {!done ? (
                <button onClick={() => setDone(true)} disabled={Object.keys(ans).length<qs.length} className="px-5 py-2.5 rounded-xl text-sm font-bold text-white disabled:opacity-30" style={{background:"#a855f7"}}>제출하기</button>
              ) : (
                <div className="p-3 rounded-xl text-center" style={{background:sc===qs.length?"rgba(16,185,129,0.08)":"rgba(245,158,11,0.08)"}}>
                  <p className="text-lg font-black" style={{color:sc===qs.length?"#059669":"#d97706"}}>{sc}/{qs.length} 정답</p>
                  <button onClick={() => {setAns({});setDone(false);}} className="mt-2 text-xs text-gray-500"><RotateCcw size={12} className="inline mr-1"/>다시</button>
                </div>
              )}
            </div>
          );
        })()}
      </Card>
    </div>
  );
};

// ─── TAB 9: 강화학습 — 스스로 배우는 AI (Course 3) ──────
const Tab9 = ({ onScore }) => {
  const t = T.expert;
  const [episode, setEpisode] = useState(0);
  const [autoPlay, setAutoPlay] = useState(false);
  const timerRef = useRef(null);

  const maxEpisodes = 10;
  const episodes = Array.from({ length: maxEpisodes }, (_, i) => {
    const exploration = Math.max(0.1, 1 - i * 0.1);
    const reward = Math.min(95, 20 + i * 9 + Math.sin(i) * 5);
    const cost = Math.max(5, 100 - i * 10 + Math.cos(i) * 3);
    const blackout = Math.max(0, 5 - Math.floor(i / 2));
    return { episode: i + 1, exploration: Math.round(exploration * 100), reward: Math.round(reward), cost: Math.round(cost), blackout };
  });

  useEffect(() => {
    if (autoPlay && episode < maxEpisodes - 1) {
      timerRef.current = setTimeout(() => setEpisode(p => p + 1), 800);
      return () => clearTimeout(timerRef.current);
    }
    if (episode >= maxEpisodes - 1) setAutoPlay(false);
  }, [autoPlay, episode]);

  const ep = episodes[episode];

  return (
    <div className="space-y-8">
      <Card t={t}>
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-lg" style={{ background: t.dim, border: `1px solid ${t.border}` }}>
            <Gamepad2 size={18} style={{ color: t.accent }} />
          </div>
          <div>
            <p className="text-[10px] font-bold tracking-widest uppercase" style={{ color: t.accent }}>REINFORCEMENT LEARNING</p>
            <p className="text-[9px] text-gray-400 font-mono">강화학습 — 시행착오를 통해 최적 전략을 스스로 찾아내는 학습 방식</p>
            <h2 className="text-lg font-black text-slate-800">스스로 배우는 AI</h2>
          </div>
        </div>
        <p className="text-sm text-slate-500 mb-4">게임을 공략하듯 — AI가 시행착오를 거쳐 최적의 전략을 스스로 찾아내는 원리</p>

        <div className="p-4 rounded-xl mb-6" style={{ background: "rgba(168,85,247,0.04)", border: "1px solid rgba(168,85,247,0.12)" }}>
          <p className="text-[10px] font-bold text-purple-600 tracking-widest uppercase mb-1">📜 ORIGIN STORY — 2013 → 2016</p>
          <p className="text-xs text-gray-700 leading-relaxed">2013년, 딥마인드가 <strong>DQN</strong>으로 Atari 게임을 사람보다 잘 하는 AI를 만듭니다. 게임 화면만 보고 스스로 전략을 터득한 최초의 사례였죠. 2016년, 같은 팀이 만든 <strong>AlphaGo</strong>가 이세돌 9단을 4:1로 이깁니다. '경우의 수가 우주 원자보다 많은' 바둑에서 AI가 인간을 넘은 순간, 강화학습은 게임을 넘어 전력 최적화, 로봇 제어 등 산업으로 확장됩니다.</p>
        </div>

        <div className="p-4 rounded-xl mb-6" style={{ background: "rgba(168,85,247,0.06)", border: "1px solid rgba(168,85,247,0.15)" }}>
          <p className="text-sm text-purple-800 font-medium mb-2">마이크로그리드 운영 = 게임 공략</p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2 bg-white rounded-lg"><strong className="text-purple-700">상태(State):</strong> 현재 전력량, 배터리, 기상, 가격</div>
            <div className="p-2 bg-white rounded-lg"><strong className="text-purple-700">행동(Action):</strong> 발전량 조절, 배터리 충/방전</div>
            <div className="p-2 bg-white rounded-lg"><strong className="text-purple-700">보상(Reward):</strong> 비용 절감 +점, 정전 -점</div>
            <div className="p-2 bg-white rounded-lg"><strong className="text-purple-700">정책(Policy):</strong> 최적 행동 규칙 (=공략법)</div>
          </div>
        </div>

        {/* Training simulation */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
          <p className="text-xs font-bold text-gray-500 tracking-widest uppercase">AI 학습 시뮬레이션 — {maxEpisodes}판 플레이</p>

          {/* Episode indicator */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">에피소드:</span>
            <div className="flex gap-0.5 flex-1">
              {episodes.map((_, i) => (
                <div key={i} className={`flex-1 h-2 rounded-full transition-all ${i <= episode ? "bg-purple-500" : "bg-gray-100"}`} />
              ))}
            </div>
            <span className="text-xs font-mono font-bold text-purple-600">{ep.episode}/{maxEpisodes}</span>
          </div>

          {/* Stats dashboard */}
          <div className="grid grid-cols-4 gap-2">
            <div className="p-3 rounded-xl text-center bg-purple-50 border border-purple-200">
              <p className="text-lg font-black text-purple-700">{ep.reward}</p>
              <p className="text-[9px] text-purple-500">보상 점수</p>
            </div>
            <div className="p-3 rounded-xl text-center bg-emerald-50 border border-emerald-200">
              <p className="text-lg font-black text-emerald-700">{ep.cost}%</p>
              <p className="text-[9px] text-emerald-500">비용 (낮을수록 ↑)</p>
            </div>
            <div className="p-3 rounded-xl text-center" style={{ background: ep.blackout === 0 ? "rgba(16,185,129,0.08)" : "rgba(239,68,68,0.08)", border: `1px solid ${ep.blackout === 0 ? "rgba(16,185,129,0.2)" : "rgba(239,68,68,0.2)"}` }}>
              <p className={`text-lg font-black ${ep.blackout === 0 ? "text-emerald-700" : "text-red-700"}`}>{ep.blackout}</p>
              <p className="text-[9px] text-gray-500">정전 횟수</p>
            </div>
            <div className="p-3 rounded-xl text-center bg-amber-50 border border-amber-200">
              <p className="text-lg font-black text-amber-700">{ep.exploration}%</p>
              <p className="text-[9px] text-amber-500">탐험률</p>
            </div>
          </div>

          {/* Exploration vs Exploitation */}
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-600">
              {episode < 3 ? "🔍 탐험 단계 — 이것저것 시도하며 배우는 중 (실수가 많음)" : episode < 7 ? "⚖️ 균형 단계 — 배운 것 활용 + 새로운 시도 병행" : "🎯 활용 단계 — 최적 전략을 찾아 안정적으로 운영"}
            </p>
          </div>

          {/* Controls */}
          <div className="flex gap-2">
            <button onClick={() => setAutoPlay(!autoPlay)}
              className="px-4 py-2 rounded-lg text-xs font-bold text-white" style={{ background: t.accent }}>
              {autoPlay ? "⏸ 일시정지" : "▶️ 자동 학습"}
            </button>
            <button onClick={() => setEpisode(Math.min(maxEpisodes - 1, episode + 1))} disabled={episode >= maxEpisodes - 1 || autoPlay}
              className="px-4 py-2 rounded-lg text-xs font-medium bg-gray-100 text-gray-600 disabled:opacity-30">
              다음 에피소드
            </button>
            <button onClick={() => { setEpisode(0); setAutoPlay(false); }}
              className="px-3 py-2 rounded-lg text-xs text-gray-500 hover:text-gray-800"><RotateCcw size={12} className="inline mr-1" />리셋</button>
          </div>
        </div>

        <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
          <p className="text-xs text-amber-800"><strong>전력산업 적용:</strong> Schneider Electric의 EcoStruxure Microgrid Advisor가 바로 이 원리입니다. AI가 수천 번의 시뮬레이션(에피소드)을 돌리며 "태양광이 줄면 배터리를 방전", "야간에는 충전" 같은 최적 정책을 스스로 학습합니다. 비용 30% 절감이라는 결과가 여기서 나옵니다.</p>
        </div>

        {/* Manual decision mode */}
        <div className="mt-6 bg-white rounded-xl border border-gray-200 p-5 space-y-4">
          <p className="text-xs font-bold text-gray-500 tracking-widest uppercase">직접 의사결정 — 당신이 AI라면?</p>
          <p className="text-xs text-gray-500">3가지 상황에서 최적의 행동을 선택해보세요. AI가 학습하는 과정을 체험합니다.</p>

          {(() => {
            const [decisions, setDecisions] = useState({});
            const [showResults, setShowResults] = useState(false);
            const scenarios = [
              { id: "s1", situation: "☀️ 한낮, 태양광 발전 최대, 배터리 80%, 전력 가격 낮음", options: [
                { label: "배터리 충전", reward: 8, reason: "이미 80%라 비효율적. 과충전 위험" },
                { label: "잉여 전력 판매", reward: 10, reason: "✅ 최적! 가격이 낮아도 잉여분 판매가 이득" },
                { label: "디젤 발전기 가동", reward: -5, reason: "태양광이 충분한데 디젤은 낭비+탄소배출" },
              ]},
              { id: "s2", situation: "🌙 야간, 태양광 0, 배터리 30%, 내일 폭염 예보", options: [
                { label: "배터리 방전으로 버티기", reward: 2, reason: "30%로 밤을 넘기면 내일 아침 부족" },
                { label: "야간 저가 전력으로 충전", reward: 10, reason: "✅ 최적! 저렴할 때 충전 → 내일 폭염 대비" },
                { label: "아무것도 안 함", reward: -3, reason: "내일 폭염에 배터리 부족 → 정전 위험" },
              ]},
              { id: "s3", situation: "⚡ 피크시간, 수요 급증, 배터리 60%, 전력 가격 최고", options: [
                { label: "배터리 방전 (전력 판매)", reward: 10, reason: "✅ 최적! 가격 최고일 때 팔아서 수익 극대화" },
                { label: "배터리 충전", reward: -8, reason: "가장 비쌀 때 사는 건 최악의 선택" },
                { label: "디젤로 자체 수요만 충당", reward: 3, reason: "가능하지만 판매 기회를 놓침" },
              ]},
            ];
            const totalReward = showResults ? scenarios.reduce((sum, s) => sum + (s.options[decisions[s.id]]?.reward || 0), 0) : 0;
            const maxReward = 30;

            return (
              <div className="space-y-3">
                {scenarios.map((s, si) => (
                  <div key={s.id} className="p-3 bg-gray-50 rounded-xl">
                    <p className="text-xs font-medium text-gray-800 mb-2">상황 {si+1}: {s.situation}</p>
                    <div className="grid grid-cols-3 gap-1.5">
                      {s.options.map((opt, oi) => {
                        const sel = decisions[s.id] === oi;
                        const best = showResults && opt.reward === 10;
                        const chosen = showResults && sel;
                        return (
                          <button key={oi} onClick={() => !showResults && setDecisions(p => ({...p, [s.id]: oi}))}
                            className={`p-2 rounded-lg text-[10px] font-medium border-2 transition-all ${best ? "border-emerald-400 bg-emerald-50" : chosen && opt.reward < 10 ? "border-red-300 bg-red-50" : sel ? "border-purple-400 bg-purple-50" : "border-gray-100 hover:border-gray-200"}`}
                            disabled={showResults}>
                            {opt.label}
                            {showResults && <span className={`block text-[9px] mt-1 ${opt.reward >= 8 ? "text-emerald-600" : opt.reward < 0 ? "text-red-500" : "text-amber-600"}`}>{opt.reward > 0 ? "+" : ""}{opt.reward}점</span>}
                          </button>
                        );
                      })}
                    </div>
                    {showResults && decisions[s.id] !== undefined && (
                      <p className="text-[10px] text-gray-500 mt-2 p-2 bg-white rounded-lg" style={{ animation: "fadeIn 0.3s" }}>
                        💬 {s.options[decisions[s.id]].reason}
                      </p>
                    )}
                  </div>
                ))}

                {!showResults ? (
                  <button onClick={() => setShowResults(true)} disabled={Object.keys(decisions).length < 3}
                    className="px-5 py-2.5 rounded-xl text-sm font-bold text-white disabled:opacity-30" style={{ background: "#a855f7" }}>결과 확인</button>
                ) : (
                  <div className="p-4 rounded-xl text-center" style={{ background: totalReward >= 25 ? "rgba(16,185,129,0.08)" : "rgba(245,158,11,0.08)" }}>
                    <p className="text-lg font-black" style={{ color: totalReward >= 25 ? "#059669" : "#d97706" }}>보상: {totalReward}/{maxReward}점</p>
                    <p className="text-xs text-gray-500 mt-1">{totalReward >= 25 ? "훌륭합니다! 최적에 가까운 의사결정!" : "AI는 이런 상황을 수천 번 반복하며 최적 정책을 스스로 찾아냅니다."}</p>
                    <button onClick={() => { setDecisions({}); setShowResults(false); }} className="mt-2 text-xs text-gray-500"><RotateCcw size={12} className="inline mr-1" />다시 하기</button>
                  </div>
                )}
              </div>
            );
          })()}
        </div>

        {/* RL Quiz */}
        {(() => {
          const [ans, setAns] = useState({});
          const [done, setDone] = useState(false);
          const qs = [
            { id:"rl1", q:"강화학습에서 '보상(Reward)'이란?", opts:["AI가 받는 전기료","행동의 결과에 대한 점수 (좋으면 +, 나쁘면 -)","학습 데이터의 양","신경망의 레이어 수"], a:1 },
            { id:"rl2", q:"'탐험(Exploration)'이 필요한 이유는?", opts:["계산 속도를 높이려고","이미 알고 있는 방법만 쓰면 더 좋은 방법을 놓칠 수 있어서","메모리를 절약하려고","오류를 줄이려고"], a:1 },
            { id:"rl3", q:"마이크로그리드에서 강화학습 AI가 최적화하는 것은?", opts:["발전기의 색상","비용 최소화 + 정전 방지를 동시에 달성하는 운영 전략","직원 수 배치","전선의 길이"], a:1 },
          ];
          const sc = done ? qs.filter(q => ans[q.id]===q.a).length : 0;
          return (
            <div className="mt-6 bg-white rounded-xl border border-gray-200 p-5 space-y-4">
              <p className="text-xs font-bold text-gray-500 tracking-widest uppercase">이해도 체크 — 강화학습</p>
              {qs.map((q, qi) => (
                <div key={q.id} className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs font-bold text-gray-800 mb-2">Q{qi+1}. {q.q}</p>
                  <div className="space-y-1">
                    {q.opts.map((o, oi) => {
                      const sel=ans[q.id]===oi, cor=done&&oi===q.a, wr=done&&sel&&oi!==q.a;
                      return <button key={oi} onClick={() => !done&&setAns(p=>({...p,[q.id]:oi}))} disabled={done}
                        className={`w-full text-left p-2 rounded-lg text-xs border transition-all ${cor?"bg-emerald-50 border-emerald-300 font-bold":wr?"bg-red-50 border-red-300":sel?"border-purple-400 bg-purple-50":"border-gray-100 hover:border-gray-200"} text-gray-600`}>{o}</button>;
                    })}
                  </div>
                </div>
              ))}
              {!done ? (
                <button onClick={() => setDone(true)} disabled={Object.keys(ans).length<qs.length} className="px-5 py-2.5 rounded-xl text-sm font-bold text-white disabled:opacity-30" style={{background:"#a855f7"}}>제출하기</button>
              ) : (
                <div className="p-3 rounded-xl text-center" style={{background:sc===qs.length?"rgba(16,185,129,0.08)":"rgba(245,158,11,0.08)"}}>
                  <p className="text-lg font-black" style={{color:sc===qs.length?"#059669":"#d97706"}}>{sc}/{qs.length} 정답</p>
                  <button onClick={() => {setAns({});setDone(false);}} className="mt-2 text-xs text-gray-500"><RotateCcw size={12} className="inline mr-1"/>다시</button>
                </div>
              )}
            </div>
          );
        })()}
      </Card>
    </div>
  );
};

// ─── COURSE STRUCTURE ──────────────────────────────────
const courses = [
  {
    id: "literacy",
    title: "AI 문해력",
    subtitle: "AI가 뭔데?",
    badge: "🥉",
    badgeLabel: "AI 문해력",
    icon: BookOpen,
    color: { accent: "#7c3aed", dim: "rgba(124,58,237,0.08)", border: "rgba(124,58,237,0.2)", grad: "linear-gradient(135deg,#6d28d9,#a78bfa)" },
    chapters: [
      { id: "concept", label: "AI 개념과 역사", icon: Brain, component: Tab1, themeKey: "concept" },
      { id: "how", label: "AI 동작원리", icon: Cpu, component: Tab2, themeKey: "how" },
      { id: "prompt", label: "프롬프트 꿀팁", icon: Sparkles, component: Tab4, themeKey: "prompt" },
      { id: "ethics", label: "AI 주의사항", icon: Shield, component: Tab5, themeKey: "ethics" },
    ],
  },
  {
    id: "practitioner",
    title: "AI 활용",
    subtitle: "AI는 어떻게 생각할까?",
    badge: "🥈",
    badgeLabel: "AI 활용가",
    icon: Zap,
    color: { accent: "#0284c7", dim: "rgba(2,132,199,0.08)", border: "rgba(2,132,199,0.2)", grad: "linear-gradient(135deg,#0369a1,#38bdf8)" },
    chapters: [
      { id: "how-deep", label: "동작원리 딥다이브", icon: Cpu, component: Tab2Deep, themeKey: "how" },
      { id: "ind-ocr", label: "AI가 문서를 읽는 법", icon: FileText, component: IndustryCH2, themeKey: "apply" },
      { id: "ind-cv", label: "AI가 이미지를 보는 법", icon: Eye, component: IndustryCH3, themeKey: "apply" },
      { id: "ind-predict", label: "AI가 미래를 예측하는 법", icon: TrendingUp, component: IndustryCH4, themeKey: "apply" },
      { id: "ind-optimize", label: "AI가 시스템을 운영하는 법", icon: Settings, component: IndustryCH5, themeKey: "apply" },
      { id: "apply", label: "AI 실무적용 종합", icon: Zap, component: Tab3, themeKey: "apply" },
    ],
  },
  {
    id: "expert",
    title: "AI 전문",
    subtitle: "AI의 수학과 구조",
    badge: "🥇",
    badgeLabel: "AI 전문가",
    icon: CircuitBoard,
    color: { accent: "#a855f7", dim: "rgba(168,85,247,0.08)", border: "rgba(168,85,247,0.2)", grad: "linear-gradient(135deg,#7c3aed,#c084fc)" },
    chapters: [
      { id: "ai-history", label: "AI 혁명의 순간들", icon: BookOpen, component: Tab10, themeKey: "expert" },
      { id: "transformer", label: "트랜스포머 아키텍처", icon: CircuitBoard, component: Tab6, themeKey: "expert" },
      { id: "cnn", label: "\"본다\"는 것의 원리 (CNN)", icon: Eye, component: Tab7, themeKey: "expert" },
      { id: "rnn-lstm", label: "시간을 기억하는 구조", icon: RefreshCw, component: Tab8, themeKey: "expert" },
      { id: "rl", label: "스스로 배우는 AI (강화학습)", icon: Gamepad2, component: Tab9, themeKey: "expert" },
    ],
  },
];

// ─── MAIN APP ──────────────────────────────────────────

// ─── CERTIFICATE COMPONENT ─────────────────────────────
const Certificate = ({ nickname, course, onClose }) => {
  const certRef = useRef(null);
  const date = new Date().toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "numeric" });
  const courseNames = { literacy: "AI 문해력", practitioner: "AI 활용", expert: "AI 전문" };
  const badges = { literacy: "🥉", practitioner: "🥈", expert: "🥇" };
  const colors = { literacy: "#7c3aed", practitioner: "#0284c7", expert: "#a855f7" };

  const handlePrint = () => {
    const el = certRef.current;
    if (!el) return;
    const win = window.open("", "_blank");
    win.document.write(`<!DOCTYPE html><html><head><title>수료증</title><style>
      * { margin:0; padding:0; box-sizing:border-box; }
      body { display:flex; justify-content:center; align-items:center; min-height:100vh; background:#f1f5f9; }
      @media print { body { background:white; } .cert { box-shadow:none !important; } }
    </style></head><body>${el.outerHTML}</body></html>`);
    win.document.close();
    setTimeout(() => { win.print(); }, 500);
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-[200] flex items-center justify-center p-4" onClick={onClose}>
      <div className="max-w-lg w-full" onClick={e => e.stopPropagation()} style={{ animation: "fadeIn 0.4s ease-out" }}>
        {/* Certificate */}
        <div ref={certRef} className="cert bg-white rounded-2xl overflow-hidden shadow-2xl" style={{ border: `3px solid ${colors[course]}` }}>
          {/* Top decorative bar */}
          <div className="h-2" style={{ background: `linear-gradient(90deg, ${colors[course]}, ${colors[course]}88, ${colors[course]})` }} />

          <div className="p-8 text-center space-y-5">
            {/* Header */}
            <div>
              <p className="text-[10px] font-bold tracking-[0.3em] uppercase text-gray-400 mb-1">CERTIFICATE OF COMPLETION</p>
              <p className="text-2xl font-black text-gray-900">수 료 증</p>
            </div>

            {/* Decorative line */}
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-gray-200" />
              <span className="text-3xl">{badges[course]}</span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>

            {/* Body */}
            <div className="space-y-3">
              <p className="text-sm text-gray-500">위 사람은</p>
              <p className="text-2xl font-black" style={{ color: colors[course] }}>{nickname || "학습자"}</p>
              <p className="text-sm text-gray-500">
                <strong className="text-gray-800">AI 교육 아카데미</strong>의
              </p>
              <p className="text-xl font-bold text-gray-900">
                {courseNames[course]} 과정
              </p>
              <p className="text-sm text-gray-500">을(를) 성실히 이수하였기에 이 증서를 수여합니다.</p>
            </div>

            {/* Date */}
            <div className="pt-4">
              <p className="text-sm text-gray-600">{date}</p>
              <div className="mt-4 flex items-center justify-center gap-2">
                <Brain size={16} style={{ color: colors[course] }} />
                <p className="text-xs font-bold" style={{ color: colors[course] }}>AI 교육 아카데미</p>
              </div>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="h-2" style={{ background: `linear-gradient(90deg, ${colors[course]}, ${colors[course]}88, ${colors[course]})` }} />
        </div>

        {/* Actions */}
        <div className="flex gap-2 mt-4 justify-center">
          <button onClick={handlePrint}
            className="px-5 py-2.5 bg-white text-gray-700 text-sm font-bold rounded-xl shadow-lg hover:bg-gray-50 transition-all">
            🖨️ 인쇄 / 저장
          </button>
          <button onClick={onClose}
            className="px-5 py-2.5 bg-gray-800 text-white text-sm font-bold rounded-xl shadow-lg hover:bg-gray-700 transition-all">
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── LEADERBOARD COMPONENT ──────────────────────────────
const Leaderboard = ({ onClose, currentUser }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getLeaderboard().then(d => { setData(d); setLoading(false); });
  }, []);

  const medals = ["🥇", "🥈", "🥉"];
  const courseLabels = { literacy: "🥉문해력", practitioner: "🥈활용", expert: "🥇전문" };

  return (
    <div className="fixed inset-0 bg-black/50 z-[200] overflow-y-auto" onClick={onClose}>
      <div className="max-w-md mx-auto my-8 bg-white rounded-2xl shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()} style={{ animation: "fadeIn 0.3s ease-out" }}>
        {/* Header */}
        <div className="p-5 text-white text-center" style={{ background: "linear-gradient(135deg, #6d28d9, #0284c7)" }}>
          <p className="text-3xl mb-1">🏆</p>
          <h2 className="text-lg font-black">리더보드</h2>
          <p className="text-xs text-white/70">AI 교육 아카데미 학습 랭킹</p>
        </div>

        <div className="p-4">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin w-8 h-8 border-2 border-gray-300 border-t-gray-900 rounded-full mx-auto mb-3" />
              <p className="text-sm text-gray-500">랭킹 로딩 중...</p>
            </div>
          ) : data.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-3xl mb-2">📭</p>
              <p className="text-sm text-gray-500">아직 완료된 코스가 없습니다</p>
              <p className="text-xs text-gray-400 mt-1">코스를 완료하면 리더보드에 등록됩니다!</p>
            </div>
          ) : (
            <div className="space-y-2">
              {data.map((user, i) => {
                const isMe = currentUser && user.nickname === currentUser;
                const pct = user.totalMax > 0 ? Math.round((user.totalScore / user.totalMax) * 100) : 0;
                return (
                  <div key={i}
                    className={`flex items-center gap-3 p-3 rounded-xl transition-all ${isMe ? "ring-2 ring-purple-400 bg-purple-50" : i < 3 ? "bg-gray-50" : ""}`}>
                    {/* Rank */}
                    <div className="w-8 text-center shrink-0">
                      {i < 3 ? (
                        <span className="text-xl">{medals[i]}</span>
                      ) : (
                        <span className="text-sm font-bold text-gray-400">{i + 1}</span>
                      )}
                    </div>
                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-bold text-gray-800 truncate">{user.nickname}</p>
                        {isMe && <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-purple-200 text-purple-700 font-bold">나</span>}
                      </div>
                      <div className="flex gap-1 mt-0.5">
                        {user.courses.map(c => (
                          <span key={c} className="text-[9px] px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded-full">{courseLabels[c] || c}</span>
                        ))}
                      </div>
                    </div>
                    {/* Score */}
                    <div className="text-right shrink-0">
                      <p className="text-sm font-black text-gray-800">{user.totalScore}<span className="text-gray-400 text-xs">/{user.totalMax}</span></p>
                      <p className="text-[10px] text-gray-400">{pct}%</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="p-4 border-t border-gray-100">
          <button onClick={onClose} className="w-full py-2.5 text-sm text-gray-500 hover:text-gray-800 font-medium rounded-xl hover:bg-gray-50 transition-all">닫기</button>
        </div>
      </div>
    </div>
  );
};

// ─── ADMIN DASHBOARD COMPONENT ─────────────────────────
const AdminDashboard = ({ onClose }) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getStudyStats().then(data => { setStats(data); setLoading(false); });
  }, []);

  if (loading) return (
    <div className="fixed inset-0 bg-black/50 z-[200] flex items-center justify-center" onClick={onClose}>
      <div className="bg-white rounded-2xl p-8 text-center" onClick={e => e.stopPropagation()}>
        <div className="animate-spin w-8 h-8 border-2 border-gray-300 border-t-gray-900 rounded-full mx-auto mb-3" />
        <p className="text-sm text-gray-500">통계 로딩 중...</p>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/50 z-[200] overflow-y-auto" onClick={onClose}>
      <div className="max-w-2xl mx-auto my-8 bg-white rounded-2xl shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="p-5 bg-gray-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BarChart3 size={20} />
            <div>
              <h2 className="text-base font-bold">관리자 대시보드</h2>
              <p className="text-xs text-gray-400">AI 교육 학습 통계</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-800 rounded-lg"><X size={18} /></button>
        </div>

        <div className="p-5 space-y-6">
          {/* Summary cards */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-4 bg-blue-50 rounded-xl border border-blue-200 text-center">
              <p className="text-2xl font-black text-blue-700">{stats.totalAttempts}</p>
              <p className="text-[10px] text-blue-500 font-medium">총 응시 수</p>
            </div>
            <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 text-center">
              <p className="text-2xl font-black text-emerald-700">{stats.uniqueUsers}</p>
              <p className="text-[10px] text-emerald-500 font-medium">참여자 수</p>
            </div>
            <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 text-center">
              <p className="text-2xl font-black text-amber-700">{stats.avgCorrectRate}%</p>
              <p className="text-[10px] text-amber-500 font-medium">평균 정답률</p>
            </div>
          </div>

          {/* 7-day activity */}
          <div>
            <h3 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
              <TrendingUp size={14} /> 최근 7일 활동
            </h3>
            <div className="flex items-end gap-1 h-24">
              {stats.recentActivity.map((day, i) => {
                const maxAttempts = Math.max(...stats.recentActivity.map(d => d.attempts), 1);
                const height = Math.max((day.attempts / maxAttempts) * 100, 4);
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <span className="text-[8px] font-mono text-gray-500">{day.attempts}</span>
                    <div className="w-full rounded-t-md transition-all duration-500"
                      style={{ height: `${height}%`, background: day.attempts > 0 ? "linear-gradient(to top, #6d28d9, #a78bfa)" : "#e2e8f0" }} />
                    <span className="text-[8px] text-gray-400">{day.label}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Hardest questions */}
          <div>
            <h3 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
              <AlertTriangle size={14} className="text-red-500" /> 가장 많이 틀리는 문제 TOP 10
            </h3>
            {stats.hardestQuestions.length === 0 ? (
              <p className="text-xs text-gray-400 p-4 bg-gray-50 rounded-xl text-center">아직 데이터가 없습니다. 사용자들이 퀴즈를 풀면 여기에 통계가 표시됩니다.</p>
            ) : (
              <div className="space-y-2">
                {stats.hardestQuestions.map((q, i) => (
                  <div key={i} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <p className="text-xs text-gray-700 font-medium">{q.text}</p>
                        <p className="text-[10px] text-gray-400 mt-0.5">{q.chapter} · {q.total}회 응시</p>
                      </div>
                      <div className={`px-2 py-1 rounded-full text-[10px] font-bold ${q.wrongRate >= 70 ? "bg-red-100 text-red-700" : q.wrongRate >= 40 ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"}`}>
                        오답 {q.wrongRate}%
                      </div>
                    </div>
                    <div className="mt-2 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${q.wrongRate}%`, background: q.wrongRate >= 70 ? "#ef4444" : q.wrongRate >= 40 ? "#f59e0b" : "#10b981" }} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="p-3 bg-gray-100 rounded-lg">
            <p className="text-[10px] text-gray-500">💡 오답률이 높은 문제는 교육 자료 오류이거나, 설명이 부족한 부분일 수 있습니다. 확인 후 콘텐츠를 수정하세요.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function App() {
  const [activeCourse, setActiveCourse] = useState("literacy");
  const [activeChapter, setActiveChapter] = useState(0);
  const [scores, setScores] = useState({});
  const [completedChapters, setCompletedChapters] = useState(new Set());

  // Admin & user state
  const [isAdmin, setIsAdmin] = useState(false);
  const [nickname, setNickname] = useState("");
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [showAdminDashboard, setShowAdminDashboard] = useState(false);
  const [adminCode, setAdminCode] = useState("");
  const [adminError, setAdminError] = useState("");
  const [showCertificate, setShowCertificate] = useState(null); // course id
  const [showLeaderboard, setShowLeaderboard] = useState(false);

  // URL 파라미터로 자동 로그인 (knai-zone 연동)
  useEffect(() => {
    if (typeof window === "undefined") return;

    const params = new URLSearchParams(window.location.search);
    const urlNickname = params.get("nickname");

    if (urlNickname) {
      // knai-zone에서 닉네임과 함께 넘어온 경우
      setNickname(urlNickname);
      localStorage.setItem("ai_study_nickname", urlNickname);

      // profiles 테이블에서 관리자 여부 확인
      getProfileByNickname(urlNickname).then(profile => {
        if (profile?.is_admin) {
          setIsAdmin(true);
          localStorage.setItem("ai_study_admin", "true");
        }
      });

      // URL에서 파라미터 제거 (깔끔하게)
      window.history.replaceState({}, "", window.location.pathname);
    } else {
      // 기존 세션 복원
      const savedAdmin = localStorage.getItem("ai_study_admin");
      const savedNickname = localStorage.getItem("ai_study_nickname");
      if (savedAdmin === "true") setIsAdmin(true);
      if (savedNickname) setNickname(savedNickname);
    }
  }, []);

  const handleAdminLogin = async () => {
    setAdminError("");
    const result = await verifyAdmin(adminCode);
    if (result) {
      setIsAdmin(true);
      setShowAdminLogin(false);
      setAdminCode("");
      localStorage.setItem("ai_study_admin", "true");
    } else {
      setAdminError("관리자 코드가 올바르지 않습니다");
    }
  };

  const handleAdminLogout = () => {
    setIsAdmin(false);
    setNickname("");
    localStorage.removeItem("ai_study_admin");
    localStorage.removeItem("ai_study_nickname");
  };

  const handleScore = (tabId, score, total) => {
    setScores(p => ({ ...p, [tabId]: { score, total } }));
    setCompletedChapters(prev => new Set([...prev, tabId]));
  };

  const totalScore = Object.values(scores).reduce((a, s) => a + s.score, 0);
  const totalMax = Object.values(scores).reduce((a, s) => a + s.total, 0);

  const course = courses.find(c => c.id === activeCourse);
  const chapter = course.chapters[activeChapter];
  const ChapterComponent = chapter.component;

  // Course completion check
  const getCourseCompletion = (courseId) => {
    const c = courses.find(co => co.id === courseId);
    const completed = c.chapters.filter(ch => completedChapters.has(ch.id)).length;
    return { completed, total: c.chapters.length, done: completed === c.chapters.length };
  };

  // Track course completion & save to DB
  const [completedCourses, setCompletedCourses] = useState(new Set());
  useEffect(() => {
    courses.forEach(c => {
      const comp = getCourseCompletion(c.id);
      if (comp.done && !completedCourses.has(c.id)) {
        setCompletedCourses(prev => new Set([...prev, c.id]));
        // Save to Supabase
        if (nickname) {
          saveCourseCompletion({ nickname, course_id: c.id, score: totalScore, total: totalMax });
        }
        // Show certificate (only if not admin browsing)
        if (!isAdmin) {
          setShowCertificate(c.id);
        }
      }
    });
  }, [completedChapters]);

  // Course unlock logic: admin bypasses all locks
  const isCourseUnlocked = (courseId) => {
    if (isAdmin) return true;
    if (courseId === "literacy") return true;
    if (courseId === "practitioner") {
      const c1 = getCourseCompletion("literacy");
      return c1.completed >= Math.ceil(c1.total / 2);
    }
    if (courseId === "expert") {
      return getCourseCompletion("practitioner").done;
    }
    return false;
  };

  return (
    <div className="min-h-screen" style={{
      background: "#f1f5f9",
      fontFamily: "'Pretendard', 'Apple SD Gothic Neo', -apple-system, BlinkMacSystemFont, sans-serif",
    }}>
      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes shake { 0%,100% { transform: translateX(0); } 25% { transform: translateX(-8px); } 75% { transform: translateX(8px); } }
        .tab-content { animation: fadeIn 0.3s ease-out; }
        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.15); border-radius: 4px; }
        input[type=range] { height: 6px; border-radius: 6px; cursor: pointer; }
      `}</style>

      {/* Header */}
      <header style={{ background: "#ffffff", borderBottom: "1px solid rgba(0,0,0,0.08)", position: "sticky", top: 0, zIndex: 100, boxShadow: "0 1px 8px rgba(0,0,0,0.06)" }}>
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: course.color.grad, boxShadow: `0 4px 12px ${course.color.border}` }}>
              <Brain size={18} className="text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="text-base font-black text-slate-800 tracking-tight">AI 교육 아카데미</h1>
                {isAdmin && (
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-red-100 text-red-700 border border-red-200">ADMIN</span>
                )}
              </div>
              <p className="text-xs text-slate-400">{nickname ? `${nickname}님의 학습 공간` : "전력산업 종사자를 위한 단계별 AI 학습"}</p>
            </div>
            {totalScore > 0 && (
              <div className="flex items-center gap-2 shrink-0">
                <div className="text-right">
                  <p className="text-[10px] text-slate-400 font-semibold">TOTAL XP</p>
                  <p className="text-sm font-black text-slate-800">{totalScore}<span className="text-slate-400 text-xs">/{totalMax}</span></p>
                </div>
                <div className="flex gap-0.5">
                  {courses.map(c => {
                    const comp = getCourseCompletion(c.id);
                    return comp.done ? (
                      <span key={c.id} className="text-lg" title={c.badgeLabel}>{c.badge}</span>
                    ) : null;
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Course progress */}
          <div className="mt-3 flex gap-1">
            {course.chapters.map((ch, i) => (
              <div key={ch.id} className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: "#e2e8f0" }}>
                <div className="h-full rounded-full transition-all duration-700"
                  style={{ width: completedChapters.has(ch.id) ? "100%" : i === activeChapter ? "30%" : "0%", background: course.color.grad }} />
              </div>
            ))}
          </div>
        </div>
      </header>

      {/* Course Selector */}
      <nav style={{ background: "#ffffff", borderBottom: "1px solid rgba(0,0,0,0.07)" }}>
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex gap-1.5 py-2.5 overflow-x-auto">
            {courses.map(c => {
              const isActive = activeCourse === c.id;
              const unlocked = isCourseUnlocked(c.id);
              const comp = getCourseCompletion(c.id);
              const Icon = c.icon;
              return (
                <button key={c.id}
                  onClick={() => { if (unlocked) { setActiveCourse(c.id); setActiveChapter(0); } }}
                  className={`shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 relative ${!unlocked ? "opacity-50 cursor-not-allowed" : ""}`}
                  style={{
                    background: isActive ? c.color.dim : "transparent",
                    color: isActive ? c.color.accent : "#94a3b8",
                    border: `1px solid ${isActive ? c.color.border : "transparent"}`,
                  }}>
                  {unlocked ? <Icon size={15} /> : <Lock size={13} />}
                  <span className="hidden sm:inline">{c.badge} {c.title}</span>
                  <span className="sm:hidden">{c.badge}</span>
                  {comp.done && <CheckCircle2 size={12} className="ml-0.5" />}
                </button>
              );
            })}
            {/* Certificate buttons for completed courses */}
            {courses.some(c => getCourseCompletion(c.id).done) && (
              <div className="flex items-center gap-1 ml-2 pl-2 border-l border-gray-200">
                {courses.filter(c => getCourseCompletion(c.id).done).map(c => (
                  <button key={c.id} onClick={() => setShowCertificate(c.id)}
                    className="shrink-0 px-2.5 py-2 rounded-lg text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 hover:bg-amber-100 transition-all"
                    title={`${c.title} 수료증`}>
                    📜
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Chapter Navigation */}
      <div style={{ background: "#f8fafc", borderBottom: "1px solid rgba(0,0,0,0.05)" }}>
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex gap-1 py-2 overflow-x-auto">
            {course.chapters.map((ch, i) => {
              const isActive = activeChapter === i;
              const done = completedChapters.has(ch.id);
              const Icon = ch.icon;
              return (
                <button key={ch.id} onClick={() => setActiveChapter(i)}
                  className={`shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${isActive ? "text-white" : done ? "bg-white text-gray-600 border border-gray-200" : "text-gray-400 hover:bg-white hover:text-gray-600"}`}
                  style={isActive ? { background: course.color.accent } : {}}>
                  <Icon size={13} />
                  <span className="hidden sm:inline">{ch.label}</span>
                  <span className="sm:hidden">CH{i + 1}</span>
                  {done && !isActive && <CheckCircle2 size={10} className="text-emerald-500" />}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="tab-content" key={`${activeCourse}-${chapter.id}`}>
          <ChapterComponent onScore={handleScore} />
        </div>
      </main>

      {/* Footer */}
      <footer style={{ borderTop: "1px solid rgba(0,0,0,0.07)", marginTop: "3rem", background: "#ffffff" }}>
        <div className="max-w-4xl mx-auto px-4 py-6 flex items-center justify-between">
          <p className="text-xs text-slate-400">AI 교육 아카데미 · 전력산업 종사자 단계별 학습</p>
          <div className="flex items-center gap-1.5">
            {courses.map(c => {
              const comp = getCourseCompletion(c.id);
              return comp.done ? <span key={c.id} className="text-base">{c.badge}</span> : null;
            })}
            {courses.every(c => getCourseCompletion(c.id).done) && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full ml-2"
                style={{ background: "rgba(217,119,6,0.08)", border: "1px solid rgba(217,119,6,0.2)" }}>
                <Trophy size={13} style={{ color: "#d97706" }} />
                <span className="text-xs font-bold" style={{ color: "#d97706" }}>전 과정 완료!</span>
              </div>
            )}
          </div>
        </div>
      </footer>

      {/* Leaderboard floating button */}
      <button onClick={() => setShowLeaderboard(true)}
        className="fixed bottom-6 left-6 z-50 flex items-center gap-2 px-4 py-2.5 bg-white text-gray-700 text-xs font-bold rounded-xl shadow-lg border border-gray-200 hover:bg-gray-50 transition-all">
        🏆 리더보드
      </button>

      {/* Admin floating button */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 items-end">
        {isAdmin && (
          <>
            <button onClick={() => setShowAdminDashboard(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-gray-900 text-white text-xs font-bold rounded-xl shadow-lg hover:bg-gray-800 transition-all">
              <BarChart3 size={14} /> 학습 통계
            </button>
            <button onClick={handleAdminLogout}
              className="flex items-center gap-2 px-3 py-2 bg-white text-gray-500 text-xs font-medium rounded-xl shadow-lg border border-gray-200 hover:bg-gray-50 transition-all">
              <LogOut size={12} /> 관리자 로그아웃
            </button>
          </>
        )}
        {!isAdmin && (
          <button onClick={() => setShowAdminLogin(true)}
            className="w-10 h-10 bg-white border border-gray-200 rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-all"
            title="관리자 로그인">
            <KeyRound size={16} className="text-gray-400" />
          </button>
        )}
      </div>

      {/* Admin login modal */}
      {showAdminLogin && (
        <div className="fixed inset-0 bg-black/50 z-[200] flex items-center justify-center" onClick={() => setShowAdminLogin(false)}>
          <div className="bg-white rounded-2xl p-6 w-80 shadow-2xl" onClick={e => e.stopPropagation()} style={{ animation: "fadeIn 0.3s ease-out" }}>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-gray-900 flex items-center justify-center">
                <Shield size={18} className="text-white" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-900">관리자 로그인</h3>
                <p className="text-[10px] text-gray-400">관리자 코드를 입력하세요</p>
              </div>
            </div>
            <input
              type="password"
              value={adminCode}
              onChange={e => { setAdminCode(e.target.value); setAdminError(""); }}
              onKeyDown={e => e.key === "Enter" && handleAdminLogin()}
              placeholder="관리자 코드"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-gray-400 mb-3"
              autoFocus
            />
            {adminError && <p className="text-xs text-red-500 mb-3">{adminError}</p>}
            <div className="flex gap-2">
              <button onClick={handleAdminLogin}
                className="flex-1 px-4 py-2.5 bg-gray-900 text-white text-sm font-bold rounded-xl hover:bg-gray-800 transition-all">
                로그인
              </button>
              <button onClick={() => setShowAdminLogin(false)}
                className="px-4 py-2.5 text-gray-500 text-sm rounded-xl hover:bg-gray-100 transition-all">
                취소
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Admin dashboard modal */}
      {showAdminDashboard && <AdminDashboard onClose={() => setShowAdminDashboard(false)} />}

      {/* Certificate modal */}
      {showCertificate && <Certificate nickname={nickname} course={showCertificate} onClose={() => setShowCertificate(null)} />}

      {/* Leaderboard modal */}
      {showLeaderboard && <Leaderboard onClose={() => setShowLeaderboard(false)} currentUser={nickname} />}
    </div>
  );
}
