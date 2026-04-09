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
  ChevronDown, Layers, SlidersHorizontal
} from "lucide-react";

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
};

// ─── Shared UI Components ─────────────────────────────
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

// ─── MAIN APP ──────────────────────────────────────────
const tabs = [
  { id: "concept", label: "AI 개념과 역사", shortLabel: "AI 개념", icon: Brain, component: Tab1 },
  { id: "how", label: "AI 동작원리", shortLabel: "동작원리", icon: Cpu, component: Tab2 },
  { id: "apply", label: "AI 실무적용", shortLabel: "실무적용", icon: Zap, component: Tab3 },
  { id: "prompt", label: "프롬프트 꿀팁", shortLabel: "프롬프트", icon: Sparkles, component: Tab4 },
  { id: "ethics", label: "AI 주의사항", shortLabel: "주의사항", icon: Shield, component: Tab5 },
];

export default function App() {
  const [activeTab, setActiveTab] = useState("concept");
  const [scores, setScores] = useState({});

  const handleScore = (tabId, score, total) => {
    setScores(p => ({ ...p, [tabId]: { score, total } }));
  };

  const totalScore = Object.values(scores).reduce((a, s) => a + s.score, 0);
  const totalMax = Object.values(scores).reduce((a, s) => a + s.total, 0);
  const completedTabs = Object.keys(scores).length;

  const ActiveComponent = tabs.find(t => t.id === activeTab)?.component;
  const theme = T[activeTab];

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
              style={{ background: "linear-gradient(135deg,#6d28d9,#38bdf8)", boxShadow: "0 4px 12px rgba(109,40,217,0.3)" }}>
              <Brain size={18} className="text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-base font-black text-slate-800 tracking-tight">AI 기초 교육</h1>
              <p className="text-xs text-slate-400">전력산업 종사자를 위한 인터랙티브 학습 가이드</p>
            </div>
            {completedTabs > 0 && (
              <div className="flex items-center gap-2 shrink-0">
                <div className="text-right">
                  <p className="text-[10px] text-slate-400 font-semibold">TOTAL XP</p>
                  <p className="text-sm font-black text-slate-800">{totalScore}<span className="text-slate-400 text-xs">/{totalMax}</span></p>
                </div>
                <div className="w-8 h-8 rounded-full flex items-center justify-center"
                  style={{ background: "rgba(217,119,6,0.1)", border: "1px solid rgba(217,119,6,0.25)" }}>
                  <Star size={14} style={{ color: "#d97706" }} />
                </div>
              </div>
            )}
          </div>

          {/* Progress bar */}
          <div className="mt-3 flex gap-1">
            {tabs.map(tab => (
              <div key={tab.id} className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: "#e2e8f0" }}>
                <div className="h-full rounded-full transition-all duration-700"
                  style={{ width: scores[tab.id] ? "100%" : "0%", background: T[tab.id].grad }} />
              </div>
            ))}
          </div>
        </div>
      </header>

      {/* Tab Navigation */}
      <nav style={{ background: "#ffffff", borderBottom: "1px solid rgba(0,0,0,0.07)" }}>
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex gap-1 py-2 overflow-x-auto">
            {tabs.map(tab => {
              const isActive = activeTab === tab.id;
              const th = T[tab.id];
              const done = !!scores[tab.id];
              const Icon = tab.icon;
              return (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                  className="shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 relative"
                  style={{
                    background: isActive ? th.dim : "transparent",
                    color: isActive ? th.accent : "#94a3b8",
                    border: `1px solid ${isActive ? th.border : "transparent"}`,
                  }}
                  onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = "#f8fafc"; }}
                  onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = "transparent"; }}>
                  <Icon size={15} />
                  <span className="hidden sm:inline">{tab.shortLabel}</span>
                  {done && (
                    <span className="w-1.5 h-1.5 rounded-full absolute top-2 right-2"
                      style={{ background: th.accent }} />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="tab-content" key={activeTab}>
          <ActiveComponent onScore={handleScore} />
        </div>
      </main>

      {/* Footer */}
      <footer style={{ borderTop: "1px solid rgba(0,0,0,0.07)", marginTop: "3rem", background: "#ffffff" }}>
        <div className="max-w-4xl mx-auto px-4 py-6 flex items-center justify-between">
          <p className="text-xs text-slate-400">AI 기초 교육 · 전력산업 종사자 인터랙티브 학습</p>
          {completedTabs === tabs.length && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full"
              style={{ background: "rgba(217,119,6,0.08)", border: "1px solid rgba(217,119,6,0.2)" }}>
              <Trophy size={13} style={{ color: "#d97706" }} />
              <span className="text-xs font-bold" style={{ color: "#d97706" }}>전 과정 완료!</span>
            </div>
          )}
        </div>
      </footer>
    </div>
  );
}
