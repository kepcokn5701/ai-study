"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  Brain, Cpu, Zap, Shield, Sparkles, ChevronRight, ChevronDown,
  Folder, FolderOpen, User, FileText, Target, ArrowRight, ArrowLeft,
  RotateCcw, Play, CheckCircle2, XCircle, AlertTriangle, Lock,
  Unlock, Lightbulb, Timer, TrendingUp, TrendingDown, Activity,
  Gauge, BookOpen, Gamepad2, GripVertical, ThumbsUp, ThumbsDown,
  Award, Star, Eye, Layers, Network, Settings, RefreshCw, X,
  Check, MessageSquare, Bot, ServerCrash, Globe, Send, Blocks,
  CircuitBoard, Workflow, Binary, SlidersHorizontal, Volume2
} from "lucide-react";

// ─── Shared Components ────────────────────────────────
const SectionDivider = ({ conceptTitle, gameTitle }) => null;

const DeepDive = ({ children }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="mt-6">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-4 py-2.5 w-full rounded-xl text-sm font-medium transition-all border border-dashed border-gray-300 hover:border-gray-400 hover:bg-gray-50 text-gray-500 hover:text-gray-700"
      >
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

const ConceptHeader = ({ icon: Icon, title }) => (
  <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-100">
    <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center">
      <Icon size={16} className="text-gray-500" />
    </div>
    <span className="text-xs font-semibold tracking-widest uppercase text-gray-400">{title}</span>
  </div>
);

const GameHeader = ({ icon: Icon, title }) => (
  <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-100">
    <div className="w-8 h-8 rounded-lg bg-gray-900 flex items-center justify-center">
      <Icon size={16} className="text-white" />
    </div>
    <span className="text-xs font-semibold tracking-widest uppercase text-gray-400">{title}</span>
  </div>
);

const Badge = ({ children, variant = "default" }) => {
  const styles = {
    default: "bg-gray-100 text-gray-600",
    success: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    error: "bg-red-50 text-red-700 border border-red-200",
    warning: "bg-amber-50 text-amber-700 border border-amber-200",
    info: "bg-blue-50 text-blue-700 border border-blue-200"
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${styles[variant]}`}>
      {children}
    </span>
  );
};

// ─── TAB 1: AI Concepts & History ────────────────────
const Tab1 = () => {
  const [expanded, setExpanded] = useState(new Set());
  const [gameAnswers, setGameAnswers] = useState({});
  const [gameSubmitted, setGameSubmitted] = useState(false);

  const orgData = {
    id: "ai",
    label: "AI 본부",
    role: "전체 본부",
    icon: Brain,
    desc: "인간의 지능을 모방하는 모든 기술의 총칭입니다. 규칙 기반 시스템부터 최신 생성형 AI까지, 사람처럼 생각하고 판단하는 모든 프로그램이 여기에 속합니다.",
    example: "예: 스팸 필터, 자동 번역, 음성 인식, 자율주행 등",
    children: [{
      id: "ml",
      label: "머신러닝 팀",
      role: "팀",
      icon: TrendingUp,
      desc: "사람이 일일이 규칙을 짜주는 대신, 데이터를 주고 '스스로 패턴을 찾아라!'라고 시키는 기술입니다. 마치 신입사원에게 과거 보고서를 잔뜩 주고 알아서 요령을 터득하게 하는 것과 같습니다.",
      example: "예: 전력 수요 예측, 고장 장비 탐지, 고객 이탈 예측",
      children: [{
        id: "dl",
        label: "딥러닝 파트",
        role: "파트",
        icon: Network,
        desc: "머신러닝의 '엘리트 부대'입니다. 인간의 뇌 신경망을 모방한 수십~수백 층의 네트워크로 복잡한 패턴을 학습합니다. 데이터가 많을수록 더 똑똑해지는 것이 특징입니다.",
        example: "예: 이미지 인식, 음성 인식, 자연어 처리",
        children: [{
          id: "genai",
          label: "생성형 AI (LLM)",
          role: "에이스 사원",
          icon: Sparkles,
          desc: "딥러닝의 에이스! 기존 AI가 '분류·예측'에 그쳤다면, 생성형 AI는 글, 그림, 코드 등 새로운 콘텐츠를 '창작'합니다. ChatGPT, Claude 등이 여기에 해당합니다.",
          example: "예: 보고서 초안 작성, 코드 생성, 이미지 생성, 요약",
          children: []
        }]
      }]
    }]
  };

  const toggleExpand = (id) => {
    setExpanded(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const OrgNode = ({ node, depth = 0 }) => {
    const isOpen = expanded.has(node.id);
    const hasChildren = node.children && node.children.length > 0;
    const Icon = node.icon;
    const depthColors = [
      "border-gray-300 bg-white",
      "border-gray-200 bg-gray-50/50",
      "border-gray-200 bg-gray-50/30",
      "border-gray-200 bg-gray-50/20"
    ];

    return (
      <div className={`${depth > 0 ? "ml-4 sm:ml-8" : ""}`}>
        <div
          onClick={() => { toggleExpand(node.id); }}
          className={`border ${depthColors[depth]} rounded-xl p-4 cursor-pointer transition-all duration-300 hover:shadow-md ${isOpen ? "shadow-sm" : ""}`}
        >
          <div className="flex items-center gap-3">
            {hasChildren ? (
              <div className={`transition-transform duration-300 ${isOpen ? "rotate-90" : ""}`}>
                <ChevronRight size={16} className="text-gray-400" />
              </div>
            ) : <div className="w-4" />}
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${depth === 0 ? "bg-gray-900 text-white" : depth === 1 ? "bg-gray-700 text-white" : depth === 2 ? "bg-gray-500 text-white" : "bg-gray-900 text-white"}`}>
              <Icon size={18} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-semibold text-gray-900 text-sm sm:text-base">{node.label}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 font-medium">{node.role}</span>
              </div>
            </div>
          </div>
          <div className={`overflow-hidden transition-all duration-500 ${isOpen ? "max-h-40 opacity-100 mt-3" : "max-h-0 opacity-0"}`}>
            <div className="pl-[52px] sm:pl-[56px]">
              <p className="text-sm text-gray-600 leading-relaxed">{node.desc}</p>
              <p className="text-xs text-gray-400 mt-1.5">{node.example}</p>
            </div>
          </div>
        </div>
        {hasChildren && (
          <div className={`overflow-hidden transition-all duration-500 ${isOpen ? "max-h-[2000px] opacity-100 mt-2" : "max-h-0 opacity-0"}`}>
            {node.children.map(child => <OrgNode key={child.id} node={child} depth={depth + 1} />)}
          </div>
        )}
      </div>
    );
  };

  const tasks = [
    { id: "t1", text: "정해진 규칙대로 스팸 메일을 자동 차단", answer: "program", emoji: "📧" },
    { id: "t2", text: "과거 10년간의 전력 수요 데이터를 분석해 내일 수요를 예측", answer: "ml", emoji: "📊" },
    { id: "t3", text: "이번 폭염 대비 대국민 절전 안내문 초안 작성", answer: "genai", emoji: "✍️" },
    { id: "t4", text: "송전탑 사진을 보고 결함 부위를 자동 탐지", answer: "ml", emoji: "🔍" },
    { id: "t5", text: "IF-THEN 규칙으로 전압이 낮으면 알람 울리기", answer: "program", emoji: "🚨" },
    { id: "t6", text: "신입사원 교육 자료를 질의응답 챗봇으로 변환", answer: "genai", emoji: "💬" },
  ];

  const targets = [
    { id: "program", label: "일반 프로그램 / 초기 AI", icon: Cpu, desc: "규칙 기반" },
    { id: "ml", label: "머신러닝 / 딥러닝", icon: Network, desc: "데이터 학습" },
    { id: "genai", label: "생성형 AI", icon: Sparkles, desc: "콘텐츠 창작" },
  ];

  const handleAssign = (taskId, targetId) => {
    if (gameSubmitted) return;
    setGameAnswers(prev => ({ ...prev, [taskId]: targetId }));
  };

  const handleSubmit = () => setGameSubmitted(true);
  const handleReset = () => { setGameAnswers({}); setGameSubmitted(false); };

  const score = gameSubmitted ? tasks.filter(t => gameAnswers[t.id] === t.answer).length : 0;

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-2xl border border-gray-100 p-5 sm:p-8 shadow-sm">
        <ConceptHeader icon={BookOpen} title="개념 쏙쏙 — AI 조직도" />
        <p className="text-sm text-gray-500 mb-6">각 항목을 클릭하면 하위 조직과 설명이 펼쳐집니다.</p>
        <OrgNode node={orgData} />
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-5 sm:p-8 shadow-sm">
        <GameHeader icon={Gamepad2} title="실전 게임 — 업무 분장 타이쿤" />
        <p className="text-sm text-gray-500 mb-6">각 업무를 읽고, 가장 적합한 담당자를 선택하세요!</p>

        <div className="grid grid-cols-3 gap-2 mb-6">
          {targets.map(t => (
            <div key={t.id} className="text-center p-3 rounded-xl border border-gray-100 bg-gray-50/50">
              <t.icon size={20} className="mx-auto mb-1 text-gray-600" />
              <div className="text-xs font-semibold text-gray-700">{t.label}</div>
              <div className="text-[10px] text-gray-400">{t.desc}</div>
            </div>
          ))}
        </div>

        <div className="space-y-3">
          {tasks.map(task => {
            const selected = gameAnswers[task.id];
            const isCorrect = gameSubmitted && selected === task.answer;
            const isWrong = gameSubmitted && selected && selected !== task.answer;
            return (
              <div key={task.id} className={`p-4 rounded-xl border transition-all ${isCorrect ? "border-emerald-200 bg-emerald-50/50" : isWrong ? "border-red-200 bg-red-50/50" : "border-gray-100"}`}>
                <div className="flex items-start gap-3 mb-3">
                  <span className="text-lg">{task.emoji}</span>
                  <p className="text-sm text-gray-700 flex-1">{task.text}</p>
                  {gameSubmitted && (isCorrect ? <CheckCircle2 size={18} className="text-emerald-500 shrink-0" /> : isWrong ? <XCircle size={18} className="text-red-500 shrink-0" /> : null)}
                </div>
                <div className="flex gap-2 ml-8">
                  {targets.map(t => (
                    <button
                      key={t.id}
                      onClick={() => handleAssign(task.id, t.id)}
                      disabled={gameSubmitted}
                      className={`flex-1 text-xs py-2 px-2 rounded-lg border transition-all ${selected === t.id ? "bg-gray-900 text-white border-gray-900" : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"} ${gameSubmitted ? "cursor-default" : "cursor-pointer"}`}
                    >
                      {t.label.split("/")[0].trim()}
                    </button>
                  ))}
                </div>
                {isWrong && <p className="text-xs text-red-500 mt-2 ml-8">정답: {targets.find(t => t.id === task.answer)?.label}</p>}
              </div>
            );
          })}
        </div>

        <div className="flex items-center gap-3 mt-6">
          {!gameSubmitted ? (
            <button onClick={handleSubmit} disabled={Object.keys(gameAnswers).length < tasks.length} className="px-6 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-xl disabled:opacity-30 hover:bg-gray-800 transition-all">
              제출하기
            </button>
          ) : (
            <>
              <Badge variant={score === tasks.length ? "success" : score >= 4 ? "warning" : "error"}>
                {score}/{tasks.length}점
              </Badge>
              <button onClick={handleReset} className="flex items-center gap-1.5 px-4 py-2 text-sm text-gray-500 hover:text-gray-800 transition-colors">
                <RotateCcw size={14} /> 다시 하기
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── TAB 2: How AI Works ─────────────────────────────
const Tab2 = () => {
  const [step, setStep] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [gamePhase, setGamePhase] = useState("attention"); // attention, predict, result
  const [selectedWords, setSelectedWords] = useState(new Set());
  const [selectedPrediction, setSelectedPrediction] = useState(null);
  const [timeLeft, setTimeLeft] = useState(100);
  const [gameScore, setGameScore] = useState(null);
  const timerRef = useRef(null);

  const steps = [
    {
      title: "토큰화 (Tokenization)",
      subtitle: "말 토막 내기",
      icon: Blocks,
      content: () => {
        const [tokenized, setTokenized] = useState(false);
        return (
          <div className="space-y-6">
            <div className="bg-gray-50 rounded-xl p-5">
              <p className="text-sm text-gray-500 mb-3">김대리가 말합니다:</p>
              <div className="relative">
                {!tokenized ? (
                  <p className="text-lg font-medium text-gray-800 tracking-wide">"저 내일 오후에..."</p>
                ) : (
                  <div className="flex gap-2 flex-wrap">
                    {["저", "내일", "오후에", "..."].map((t, i) => (
                      <span key={i} className="inline-flex items-center px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-mono font-semibold text-gray-800 shadow-sm" style={{ animationDelay: `${i * 150}ms`, animation: "slideUp 0.4s ease-out forwards", opacity: 0, transform: "translateY(10px)" }}>
                        {t}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <button onClick={() => setTokenized(!tokenized)} className="px-5 py-2.5 bg-gray-900 text-white text-sm rounded-xl hover:bg-gray-800 transition-all">
              {tokenized ? "원문 보기" : "토큰화 실행 ✂️"}
            </button>
            <p className="text-sm text-gray-500 leading-relaxed">AI는 문장을 한꺼번에 이해하지 못합니다. 마치 긴 문장을 단어 카드로 잘라내듯, 텍스트를 작은 조각(토큰)으로 쪼개는 것이 첫 단계입니다.</p>
            <DeepDive>
              {(() => {
                const [demoInput, setDemoInput] = useState("저 내일 오후에 반차 쓰겠습니다");
                const bpeSteps = [
                  { label: "원문 입력", tokens: [demoInput], desc: "부장님 귀에 문장이 통째로 들어옵니다" },
                  { label: "공백 분리", tokens: demoInput.split(" "), desc: "먼저 띄어쓰기 단위로 거칠게 나눕니다" },
                  { label: "서브워드 분해 (BPE)", tokens: (() => {
                    const result = [];
                    demoInput.split(" ").forEach(w => {
                      if (w.length > 2) { result.push(w.slice(0, Math.ceil(w.length / 2)), w.slice(Math.ceil(w.length / 2))); }
                      else { result.push(w); }
                    });
                    return result;
                  })(), desc: "자주 등장하는 글자 조합(서브워드)으로 더 잘게 쪼갭니다" },
                  { label: "토큰 ID 매핑", tokens: (() => {
                    const result = [];
                    let id = 3842;
                    demoInput.split(" ").forEach(w => {
                      if (w.length > 2) {
                        result.push({ text: w.slice(0, Math.ceil(w.length / 2)), id: id });
                        result.push({ text: w.slice(Math.ceil(w.length / 2)), id: id + 157 });
                        id += 311;
                      } else {
                        result.push({ text: w, id: id });
                        id += 248;
                      }
                    });
                    return result;
                  })(), desc: "각 조각에 고유 번호(ID)를 부여합니다 — AI는 숫자만 이해합니다" },
                ];
                const [bpeStep, setBpeStep] = useState(0);
                return (
                  <div className="space-y-4">
                    <p className="text-sm text-gray-700 font-medium">BPE (Byte Pair Encoding) — 실제 토큰화 과정</p>
                    <p className="text-xs text-gray-500">GPT, Claude 등 대부분의 LLM은 BPE 알고리즘을 사용합니다. 단어를 통째로 외우는 게 아니라, 자주 나오는 글자 조합을 학습해서 효율적으로 쪼갭니다.</p>
                    <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-3">
                      <div className="flex items-center gap-2 text-xs text-gray-400">
                        <span className="font-mono font-bold text-blue-600">Step {bpeStep + 1}/4</span>
                        <span>—</span>
                        <span className="font-medium">{bpeSteps[bpeStep].label}</span>
                      </div>
                      <p className="text-xs text-gray-500 italic">{bpeSteps[bpeStep].desc}</p>
                      <div className="flex gap-1.5 flex-wrap min-h-[48px] items-center">
                        {bpeStep < 3 ? (
                          bpeSteps[bpeStep].tokens.map((t, i) => (
                            <span key={i} className={`px-3 py-1.5 rounded-md text-xs font-mono font-semibold border transition-all ${bpeStep === 0 ? "bg-gray-100 border-gray-200 text-gray-700" : bpeStep === 1 ? "bg-blue-50 border-blue-200 text-blue-700" : "bg-purple-50 border-purple-200 text-purple-700"}`}>{t}</span>
                          ))
                        ) : (
                          bpeSteps[3].tokens.map((t, i) => (
                            <div key={i} className="flex flex-col items-center gap-0.5">
                              <span className="px-3 py-1.5 rounded-md text-xs font-mono font-semibold bg-emerald-50 border border-emerald-200 text-emerald-700">{t.text}</span>
                              <span className="text-[9px] font-mono text-gray-400">ID: {t.id}</span>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => setBpeStep(Math.max(0, bpeStep - 1))} disabled={bpeStep === 0} className="px-3 py-1.5 text-xs rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-30">이전</button>
                      <button onClick={() => setBpeStep(Math.min(3, bpeStep + 1))} disabled={bpeStep === 3} className="px-3 py-1.5 text-xs rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-30">다음 단계</button>
                    </div>
                    <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
                      <p className="text-xs text-amber-800"><strong>왜 서브워드로 쪼갤까?</strong> "쓰겠습니다"를 통째로 외우면 사전이 수십만 개 필요합니다. 하지만 "쓰겠" + "습니다"로 나누면, "습니다"는 다른 문장("하겠습니다", "먹겠습니다")에서도 재활용됩니다. 부장님도 모든 말을 통째로 외우는 게 아니라, 패턴을 파악하는 것이죠.</p>
                    </div>
                    <div className="p-3 bg-gray-100 rounded-lg">
                      <p className="text-xs text-gray-600"><strong>📊 실제 수치:</strong> GPT-4의 토큰 사전 크기는 약 100,000개, Claude는 약 100,000개입니다. 한국어 한 글자는 평균 1.5~2 토큰을 소모합니다. "저 내일 오후에 반차 쓰겠습니다"는 실제로 약 12~15토큰이 됩니다.</p>
                    </div>
                  </div>
                );
              })()}
            </DeepDive>
          </div>
        );
      }
    },
    {
      title: "임베딩 (Embedding)",
      subtitle: "뇌피셜 수치화",
      icon: Binary,
      content: () => {
        const [showScores, setShowScores] = useState(false);
        const embeddings = [
          { token: "저", scores: [{ label: "주어 확률", val: 9 }, { label: "긴급도", val: 2 }] },
          { token: "내일", scores: [{ label: "시간 관련", val: 9 }, { label: "퇴근 임박", val: 3 }] },
          { token: "오후에", scores: [{ label: "퇴근 임박", val: 8 }, { label: "피곤함", val: 5 }] },
        ];
        return (
          <div className="space-y-6">
            <p className="text-sm text-gray-500">부장님이 김대리의 말을 수첩에 기록합니다. 각 단어에 수치(벡터)를 부여합니다.</p>
            <div className="bg-gray-50 rounded-xl p-4 space-y-3">
              <div className="flex items-center gap-2 mb-2 text-xs text-gray-400 font-medium">
                <FileText size={14} /> 부장님의 수첩 (엑셀)
              </div>
              {embeddings.map((emb, i) => (
                <div key={i} className="bg-white rounded-lg border border-gray-100 p-3 flex items-center gap-4">
                  <span className="font-mono font-semibold text-sm bg-gray-100 px-3 py-1 rounded-md text-gray-800">{emb.token}</span>
                  <ArrowRight size={14} className="text-gray-300" />
                  <div className="flex-1 flex gap-2 flex-wrap">
                    {showScores && emb.scores.map((s, j) => (
                      <div key={j} className="flex items-center gap-1.5 text-xs" style={{ animation: "fadeIn 0.3s ease-out forwards", animationDelay: `${(i * 2 + j) * 100}ms`, opacity: 0 }}>
                        <span className="text-gray-500">{s.label}:</span>
                        <div className="w-16 h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full bg-gray-700 rounded-full transition-all duration-700" style={{ width: `${s.val * 10}%` }} />
                        </div>
                        <span className="font-mono text-gray-700 font-semibold">{s.val}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <button onClick={() => setShowScores(!showScores)} className="px-5 py-2.5 bg-gray-900 text-white text-sm rounded-xl hover:bg-gray-800 transition-all">
              {showScores ? "수치 숨기기" : "수치화 시작 📊"}
            </button>
            <DeepDive>
              {(() => {
                const [selectedWord, setSelectedWord] = useState(null);
                const vectorSpace = [
                  { word: "저", x: 20, y: 70, cluster: "인칭", color: "#3b82f6" },
                  { word: "나", x: 25, y: 65, cluster: "인칭", color: "#3b82f6" },
                  { word: "내일", x: 60, y: 30, cluster: "시간", color: "#f59e0b" },
                  { word: "오후", x: 65, y: 25, cluster: "시간", color: "#f59e0b" },
                  { word: "어제", x: 55, y: 35, cluster: "시간", color: "#f59e0b" },
                  { word: "반차", x: 80, y: 60, cluster: "근무", color: "#10b981" },
                  { word: "퇴근", x: 85, y: 55, cluster: "근무", color: "#10b981" },
                  { word: "퇴사", x: 82, y: 75, cluster: "근무", color: "#10b981" },
                  { word: "한숨", x: 40, y: 80, cluster: "감정", color: "#ef4444" },
                  { word: "피곤", x: 35, y: 85, cluster: "감정", color: "#ef4444" },
                ];
                const dimensions = [
                  { name: "시간 관련도", desc: "'내일', '오후'는 높고, '저'는 낮음" },
                  { name: "감정 강도", desc: "'한숨', '피곤'이 높은 값" },
                  { name: "행위 의도", desc: "'반차', '퇴사'에 강하게 반응" },
                  { name: "주어 여부", desc: "'저', '나'만 높은 차원" },
                ];
                return (
                  <div className="space-y-4">
                    <p className="text-sm text-gray-700 font-medium">벡터 공간 — 단어가 숫자 좌표로 바뀌는 원리</p>
                    <p className="text-xs text-gray-500">임베딩은 각 단어를 수백~수천 차원의 숫자 벡터로 변환합니다. 의미가 비슷한 단어는 가까이, 다른 단어는 멀리 배치됩니다. 아래는 부장님 수첩의 단어들을 2D로 축소해서 보여줍니다.</p>

                    {/* 2D Vector Space */}
                    <div className="bg-white rounded-lg border border-gray-200 p-4">
                      <p className="text-[10px] font-mono text-gray-400 mb-2">2D 벡터 공간 (실제로는 768~4096차원)</p>
                      <div className="relative w-full h-56 bg-gradient-to-br from-gray-50 to-white rounded-lg border border-gray-100 overflow-hidden">
                        {/* Axis labels */}
                        <span className="absolute bottom-1 right-2 text-[9px] text-gray-300 font-mono">차원 1</span>
                        <span className="absolute top-1 left-2 text-[9px] text-gray-300 font-mono">차원 2</span>
                        {/* Cluster circles */}
                        <div className="absolute rounded-full border border-blue-100 bg-blue-50/30" style={{ left: "12%", top: "55%", width: "22%", height: "30%" }} />
                        <div className="absolute rounded-full border border-amber-100 bg-amber-50/30" style={{ left: "45%", top: "12%", width: "28%", height: "35%" }} />
                        <div className="absolute rounded-full border border-emerald-100 bg-emerald-50/30" style={{ left: "68%", top: "42%", width: "28%", height: "42%" }} />
                        <div className="absolute rounded-full border border-red-100 bg-red-50/30" style={{ left: "22%", top: "68%", width: "28%", height: "30%" }} />
                        {/* Words as dots */}
                        {vectorSpace.map((item, i) => (
                          <button
                            key={i}
                            onClick={() => setSelectedWord(selectedWord === i ? null : i)}
                            className={`absolute flex flex-col items-center gap-0.5 transition-all duration-300 cursor-pointer hover:scale-125 ${selectedWord === i ? "scale-125 z-10" : ""}`}
                            style={{ left: `${item.x}%`, top: `${item.y}%`, transform: "translate(-50%, -50%)" }}
                          >
                            <div className={`w-3 h-3 rounded-full border-2 border-white shadow-sm transition-all ${selectedWord === i ? "w-4 h-4 ring-2 ring-offset-1" : ""}`} style={{ backgroundColor: item.color, ringColor: item.color }} />
                            <span className="text-[9px] font-medium text-gray-600 whitespace-nowrap">{item.word}</span>
                          </button>
                        ))}
                      </div>
                      {/* Cluster legend */}
                      <div className="flex gap-3 mt-2 flex-wrap">
                        {[{ label: "인칭", color: "#3b82f6" }, { label: "시간", color: "#f59e0b" }, { label: "근무", color: "#10b981" }, { label: "감정", color: "#ef4444" }].map((c, i) => (
                          <div key={i} className="flex items-center gap-1 text-[10px] text-gray-500">
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: c.color }} />
                            {c.label}
                          </div>
                        ))}
                      </div>
                      {selectedWord !== null && (
                        <div className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-100" style={{ animation: "fadeIn 0.3s ease-out" }}>
                          <p className="text-xs font-medium text-gray-700 mb-1.5">"{vectorSpace[selectedWord].word}"의 벡터 (4차원 축소)</p>
                          <div className="flex gap-2 font-mono text-[10px]">
                            {[0.73, -0.21, 0.55, 0.12].map((v, i) => {
                              const jitter = ((selectedWord * 7 + i * 13) % 100) / 100 - 0.5;
                              const val = Math.round((v + jitter) * 100) / 100;
                              return <span key={i} className={`px-2 py-1 rounded ${val > 0 ? "bg-blue-50 text-blue-700" : "bg-red-50 text-red-700"}`}>{val > 0 ? "+" : ""}{val}</span>;
                            })}
                            <span className="text-gray-300 self-center">... ×768</span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Dimension explanation */}
                    <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-2">
                      <p className="text-xs font-medium text-gray-700">각 차원은 무엇을 의미할까?</p>
                      <p className="text-xs text-gray-500">부장님 수첩의 열(컬럼)이 2개였다면, 실제 AI는 768~4096개입니다:</p>
                      <div className="grid grid-cols-2 gap-2">
                        {dimensions.map((d, i) => (
                          <div key={i} className="p-2 bg-gray-50 rounded-lg">
                            <p className="text-[10px] font-semibold text-gray-700">차원 #{i + 1}: {d.name}</p>
                            <p className="text-[10px] text-gray-400">{d.desc}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
                      <p className="text-xs text-amber-800"><strong>핵심 통찰:</strong> "반차"와 "퇴근"이 가까이 있는 건 AI가 수억 개의 문장에서 이 두 단어가 비슷한 맥락에 등장하는 것을 학습했기 때문입니다. 부장님이 수십 년 직장 경험으로 "반차"와 "퇴근"을 연결하는 것처럼, AI는 데이터에서 패턴을 찾습니다.</p>
                    </div>
                    <div className="p-3 bg-gray-100 rounded-lg">
                      <p className="text-xs text-gray-600"><strong>📊 실제 수치:</strong> GPT-3는 12,288차원, Claude는 약 8,192차원의 임베딩을 사용합니다. Word2Vec의 유명한 실험: vec("왕") - vec("남자") + vec("여자") ≈ vec("여왕"). 벡터 연산으로 의미가 계산됩니다.</p>
                    </div>
                  </div>
                );
              })()}
            </DeepDive>
          </div>
        );
      }
    },
    {
      title: "셀프 어텐션 (Self-Attention)",
      subtitle: "눈치 챙기기",
      icon: Eye,
      content: () => {
        const [showLinks, setShowLinks] = useState(false);
        const words = ["저", "내일", "오후에"];
        const context = "어제 김대리가 한숨을 쉬었다는 사실!";
        return (
          <div className="space-y-6">
            <p className="text-sm text-gray-500">부장님은 단어들 사이의 관계와 숨겨진 문맥을 파악합니다.</p>
            <div className="bg-gray-50 rounded-xl p-5">
              <div className="flex items-center justify-center gap-4 mb-6 flex-wrap">
                {words.map((w, i) => (
                  <span key={i} className={`px-4 py-2 rounded-lg font-semibold text-sm border transition-all duration-500 ${showLinks && w === "오후에" ? "bg-gray-900 text-white border-gray-900 scale-110" : "bg-white border-gray-200 text-gray-700"}`}>
                    {w}
                  </span>
                ))}
              </div>
              {showLinks && (
                <div className="space-y-3" style={{ animation: "fadeIn 0.5s ease-out" }}>
                  <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200">
                    <span className="text-sm">💨</span>
                    <span className="text-sm text-gray-600">{context}</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-red-50 rounded-lg border border-red-200">
                    <span className="text-lg">🔗</span>
                    <div>
                      <p className="text-sm font-medium text-red-700">"한숨" + "오후" → 어텐션 가중치 <span className="font-mono font-bold">0.92</span> (매우 강함)</p>
                      <p className="text-xs text-red-500 mt-0.5">이 두 정보가 강하게 연결됩니다!</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <button onClick={() => setShowLinks(!showLinks)} className="px-5 py-2.5 bg-gray-900 text-white text-sm rounded-xl hover:bg-gray-800 transition-all">
              {showLinks ? "초기화" : "문맥 연결 시작 🔗"}
            </button>
            <DeepDive>
              {(() => {
                const [activeHead, setActiveHead] = useState(0);
                const tokens = ["저", "내일", "오후에", "한숨"];
                const attentionHeads = [
                  {
                    name: "Head 1: 시간 관계",
                    desc: "부장님의 첫 번째 시선 — '언제?'에 집중",
                    matrix: [
                      [0.1, 0.3, 0.5, 0.1],
                      [0.1, 0.2, 0.6, 0.1],
                      [0.1, 0.7, 0.1, 0.1],
                      [0.1, 0.2, 0.3, 0.4],
                    ]
                  },
                  {
                    name: "Head 2: 감정 관계",
                    desc: "부장님의 두 번째 시선 — '기분이 어때?'에 집중",
                    matrix: [
                      [0.2, 0.1, 0.1, 0.6],
                      [0.1, 0.1, 0.2, 0.6],
                      [0.1, 0.1, 0.3, 0.5],
                      [0.3, 0.1, 0.2, 0.4],
                    ]
                  },
                  {
                    name: "Head 3: 주어-행위 관계",
                    desc: "부장님의 세 번째 시선 — '누가 뭘 하려고?'에 집중",
                    matrix: [
                      [0.4, 0.1, 0.4, 0.1],
                      [0.5, 0.1, 0.3, 0.1],
                      [0.6, 0.1, 0.2, 0.1],
                      [0.3, 0.1, 0.1, 0.5],
                    ]
                  }
                ];
                const head = attentionHeads[activeHead];
                const getHeatColor = (val) => {
                  if (val >= 0.6) return "bg-red-500 text-white";
                  if (val >= 0.4) return "bg-orange-400 text-white";
                  if (val >= 0.3) return "bg-yellow-300 text-gray-800";
                  if (val >= 0.2) return "bg-yellow-100 text-gray-600";
                  return "bg-gray-50 text-gray-400";
                };
                return (
                  <div className="space-y-4">
                    <p className="text-sm text-gray-700 font-medium">Q·K·V와 멀티헤드 어텐션 — 부장님의 다중 관점</p>
                    <p className="text-xs text-gray-500">부장님이 김대리 말을 들을 때 동시에 여러 관점으로 분석합니다. 실제 AI도 마찬가지로 여러 "헤드"가 각기 다른 관계를 포착합니다.</p>

                    {/* Q, K, V explanation */}
                    <div className="grid grid-cols-3 gap-2">
                      <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <p className="text-[10px] font-bold text-blue-700 mb-1">Q (Query)</p>
                        <p className="text-[10px] text-blue-600">"내가 알고 싶은 것"</p>
                        <p className="text-[10px] text-gray-500 mt-1">부장님: "이 단어가 뭘 궁금해하지?"</p>
                      </div>
                      <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                        <p className="text-[10px] font-bold text-emerald-700 mb-1">K (Key)</p>
                        <p className="text-[10px] text-emerald-600">"내가 가진 정보 태그"</p>
                        <p className="text-[10px] text-gray-500 mt-1">부장님: "이 단어가 어떤 정보를 제공하지?"</p>
                      </div>
                      <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                        <p className="text-[10px] font-bold text-purple-700 mb-1">V (Value)</p>
                        <p className="text-[10px] text-purple-600">"실제 정보 내용"</p>
                        <p className="text-[10px] text-gray-500 mt-1">부장님: "그래서 실제로 뭘 전달하지?"</p>
                      </div>
                    </div>

                    {/* Multi-head tabs */}
                    <div className="flex gap-1.5 mt-2">
                      {attentionHeads.map((h, i) => (
                        <button key={i} onClick={() => setActiveHead(i)} className={`px-3 py-1.5 text-[10px] font-medium rounded-lg transition-all ${i === activeHead ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}>
                          Head {i + 1}
                        </button>
                      ))}
                    </div>

                    {/* Attention heatmap */}
                    <div className="bg-white rounded-lg border border-gray-200 p-4">
                      <p className="text-xs font-medium text-gray-700 mb-1">{head.name}</p>
                      <p className="text-[10px] text-gray-400 mb-3">{head.desc}</p>
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr>
                              <th className="text-[9px] text-gray-400 p-1 text-left font-normal">Q↓ K→</th>
                              {tokens.map((t, i) => (
                                <th key={i} className="text-[10px] font-mono font-semibold text-gray-600 p-1 text-center">{t}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {tokens.map((t, i) => (
                              <tr key={i}>
                                <td className="text-[10px] font-mono font-semibold text-gray-600 p-1">{t}</td>
                                {head.matrix[i].map((val, j) => (
                                  <td key={j} className="p-1 text-center">
                                    <span className={`inline-block w-full px-1 py-1 rounded text-[10px] font-mono font-bold ${getHeatColor(val)}`}>
                                      {val.toFixed(2)}
                                    </span>
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-[9px] text-gray-400">약함</span>
                        <div className="flex gap-0.5">
                          {["bg-gray-100", "bg-yellow-100", "bg-yellow-300", "bg-orange-400", "bg-red-500"].map((c, i) => (
                            <div key={i} className={`w-4 h-2 rounded-sm ${c}`} />
                          ))}
                        </div>
                        <span className="text-[9px] text-gray-400">강함</span>
                      </div>
                    </div>

                    <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
                      <p className="text-xs text-amber-800"><strong>왜 멀티헤드일까?</strong> 부장님이 "시간", "감정", "주어-행위" 세 가지를 동시에 파악하듯, GPT-4는 128개의 헤드가, Claude는 64~128개의 헤드가 각각 다른 관계를 동시에 포착합니다. 하나의 헤드만으로는 "내일 오후"의 시간 관계만 보고 "한숨"의 감정 신호를 놓칠 수 있습니다.</p>
                    </div>
                    <div className="p-3 bg-gray-100 rounded-lg">
                      <p className="text-xs text-gray-600"><strong>📊 실제 수치:</strong> 어텐션 계산: Attention(Q,K,V) = softmax(QK<sup>T</sup> / √d<sub>k</sub>)V. GPT-4는 약 128개 헤드 × 128차원 = 16,384차원. 모든 토큰 쌍의 관계를 계산하므로, 토큰 N개면 N² 번의 연산이 필요합니다 (이것이 긴 문장이 비싼 이유).</p>
                    </div>
                  </div>
                );
              })()}
            </DeepDive>
          </div>
        );
      }
    },
    {
      title: "순전파 & FFN",
      subtitle: "생각의 직진",
      icon: CircuitBoard,
      content: () => {
        const [running, setRunning] = useState(false);
        const [activeLayer, setActiveLayer] = useState(-1);
        const layers = ["입력층", "은닉층 1", "은닉층 2", "은닉층 3", "출력층"];

        useEffect(() => {
          if (running) {
            let i = 0;
            const interval = setInterval(() => {
              setActiveLayer(i);
              i++;
              if (i >= layers.length) { clearInterval(interval); }
            }, 600);
            return () => clearInterval(interval);
          } else { setActiveLayer(-1); }
        }, [running]);

        return (
          <div className="space-y-6">
            <p className="text-sm text-gray-500">정보들이 부장님의 뇌세포(신경망)를 차례로 통과하며 결론을 향해 전진합니다.</p>
            <div className="bg-gray-50 rounded-xl p-5">
              <div className="flex items-center justify-between gap-1 sm:gap-2">
                {layers.map((l, i) => (
                  <div key={i} className="flex items-center gap-1 sm:gap-2 flex-1">
                    <div className={`flex-1 h-14 sm:h-16 rounded-xl border-2 flex items-center justify-center text-[10px] sm:text-xs font-semibold transition-all duration-500 ${i <= activeLayer ? "bg-gray-900 text-white border-gray-900 scale-105" : "bg-white text-gray-400 border-gray-200"}`}>
                      <span className="hidden sm:inline">{l}</span>
                      <span className="sm:hidden">{i === 0 ? "입력" : i === layers.length - 1 ? "출력" : `H${i}`}</span>
                    </div>
                    {i < layers.length - 1 && (
                      <ArrowRight size={12} className={`shrink-0 transition-colors duration-300 ${i < activeLayer ? "text-gray-900" : "text-gray-300"}`} />
                    )}
                  </div>
                ))}
              </div>
              {activeLayer >= layers.length - 1 && (
                <div className="mt-4 text-center" style={{ animation: "fadeIn 0.5s ease-out" }}>
                  <p className="text-sm font-medium text-gray-700">💡 계산 완료! 결론 도출 준비 중...</p>
                </div>
              )}
            </div>
            <button onClick={() => setRunning(!running)} className="px-5 py-2.5 bg-gray-900 text-white text-sm rounded-xl hover:bg-gray-800 transition-all">
              {running ? "리셋 🔄" : "순전파 시작 ⚡"}
            </button>
            <DeepDive>
              {(() => {
                const [activeNeuron, setActiveNeuron] = useState(null);
                const [reluInput, setReluInput] = useState(0.5);
                const layerDetails = [
                  { name: "Layer 1 — 표면 인식", neurons: 6, desc: "글자 형태, 품사 구분", example: "부장님: '저'는 주어구나, '내일'은 시간이네" },
                  { name: "Layer 6 — 문법 이해", neurons: 5, desc: "문장 구조, 어순 파악", example: "부장님: '저 + 내일 + 오후에' → 누군가 내일 뭔가를 할 예정" },
                  { name: "Layer 12 — 의미 추론", neurons: 5, desc: "의도, 감정, 맥락 종합", example: "부장님: 한숨 + 내일 오후 = 뭔가 쉬고 싶다는 신호!" },
                  { name: "Layer 24 — 최종 결론", neurons: 4, desc: "예측 후보 생성", example: "부장님: 반차(80%), 외근(15%), 퇴사(5%)" },
                ];
                return (
                  <div className="space-y-4">
                    <p className="text-sm text-gray-700 font-medium">FFN(Feed-Forward Network) — 뉴런이 실제로 하는 일</p>
                    <p className="text-xs text-gray-500">어텐션으로 "어디를 볼지" 정했다면, FFN은 "봐서 어떤 결론을 내릴지" 계산합니다. 각 레이어가 점점 더 추상적인 개념을 학습합니다.</p>

                    {/* Layer visualization */}
                    <div className="space-y-3">
                      {layerDetails.map((layer, li) => (
                        <div key={li} className="bg-white rounded-lg border border-gray-200 p-3">
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <div>
                              <p className="text-xs font-semibold text-gray-700">{layer.name}</p>
                              <p className="text-[10px] text-gray-400">{layer.desc}</p>
                            </div>
                          </div>
                          {/* Neurons */}
                          <div className="flex items-center gap-1.5 mb-2">
                            {Array.from({ length: layer.neurons }, (_, ni) => {
                              const activation = Math.sin((li + 1) * (ni + 1) * 1.3) * 0.5 + 0.5;
                              const isActive = activeNeuron === `${li}-${ni}`;
                              return (
                                <button
                                  key={ni}
                                  onClick={() => setActiveNeuron(isActive ? null : `${li}-${ni}`)}
                                  className={`relative w-8 h-8 rounded-full border-2 flex items-center justify-center text-[8px] font-mono font-bold transition-all cursor-pointer ${activation > 0.6 ? "bg-gray-900 text-white border-gray-900" : activation > 0.3 ? "bg-gray-400 text-white border-gray-400" : "bg-gray-100 text-gray-400 border-gray-200"} ${isActive ? "ring-2 ring-blue-400 ring-offset-1 scale-110" : "hover:scale-105"}`}
                                >
                                  {(activation).toFixed(1)}
                                </button>
                              );
                            })}
                            <span className="text-[9px] text-gray-300 ml-1">... ×4096</span>
                          </div>
                          <p className="text-[10px] text-gray-500 italic">💬 {layer.example}</p>
                        </div>
                      ))}
                    </div>

                    {/* Activation function interactive */}
                    <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-3">
                      <p className="text-xs font-medium text-gray-700">활성화 함수 — 뉴런의 ON/OFF 스위치</p>
                      <p className="text-[10px] text-gray-500">각 뉴런은 입력값을 받아 활성화 함수를 통과시킵니다. 음수 입력은 차단(OFF)하고, 양수만 통과(ON)시킵니다.</p>
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] text-gray-500 w-12">입력값:</span>
                        <input
                          type="range" min="-2" max="2" step="0.1"
                          value={reluInput}
                          onChange={(e) => setReluInput(parseFloat(e.target.value))}
                          className="flex-1 h-1.5 bg-gray-200 rounded-full appearance-none cursor-pointer"
                        />
                        <span className="text-xs font-mono font-bold w-10 text-right">{reluInput.toFixed(1)}</span>
                      </div>
                      <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                        <div className="text-center">
                          <p className="text-[9px] text-gray-400">ReLU 출력</p>
                          <p className={`text-lg font-mono font-bold ${reluInput > 0 ? "text-emerald-600" : "text-gray-300"}`}>{Math.max(0, reluInput).toFixed(1)}</p>
                        </div>
                        <ArrowRight size={12} className="text-gray-300" />
                        <div className="text-center">
                          <p className="text-[9px] text-gray-400">GELU 출력</p>
                          <p className={`text-lg font-mono font-bold ${reluInput > -0.5 ? "text-blue-600" : "text-gray-300"}`}>{(reluInput * (0.5 * (1 + Math.tanh(Math.sqrt(2 / Math.PI) * (reluInput + 0.044715 * Math.pow(reluInput, 3)))))).toFixed(2)}</p>
                        </div>
                        <div className="flex-1 text-[10px] text-gray-500">
                          {reluInput <= 0 ? "💤 부장님: '이 정보는 무시!'" : reluInput < 1 ? "🤔 부장님: '음, 약간 참고할게'" : "🔥 부장님: '이건 핵심 정보다!'"}
                        </div>
                      </div>
                    </div>

                    <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
                      <p className="text-xs text-amber-800"><strong>핵심 통찰:</strong> GPT-4는 약 120개 레이어, Claude는 수십 개 레이어를 가집니다. 앞쪽 레이어는 "단어가 뭐지?" 수준이고, 뒤쪽 레이어는 "이 사람이 퇴사하고 싶은 건지 반차를 쓰고 싶은 건지" 수준의 추론을 합니다. 부장님의 뇌도 마찬가지로 — 소리 인식 → 단어 이해 → 상황 판단 → 결론 도출 순서로 처리합니다.</p>
                    </div>
                    <div className="p-3 bg-gray-100 rounded-lg">
                      <p className="text-xs text-gray-600"><strong>📊 실제 수치:</strong> FFN의 은닉 차원은 보통 임베딩의 4배 (예: 8,192 × 4 = 32,768). GPT-4 전체 파라미터 수는 약 1.8조 개로 추정. 이 파라미터 하나하나가 부장님의 "경험에서 온 직감" 하나하나입니다.</p>
                    </div>
                  </div>
                );
              })()}
            </DeepDive>
          </div>
        );
      }
    },
    {
      title: "소프트맥스 (Softmax)",
      subtitle: "머릿속 룰렛",
      icon: Gauge,
      content: () => {
        const [showResult, setShowResult] = useState(false);
        const predictions = [
          { label: "반차", prob: 80, color: "#1a1a1a" },
          { label: "외근", prob: 15, color: "#6b7280" },
          { label: "퇴사", prob: 5, color: "#d1d5db" },
        ];
        return (
          <div className="space-y-6">
            <p className="text-sm text-gray-500">최종 계산 결과가 확률 분포로 변환됩니다. 각 예측에 0~100%의 확률이 부여됩니다.</p>
            <div className="bg-gray-50 rounded-xl p-5">
              <div className="space-y-3">
                {predictions.map((p, i) => (
                  <div key={i} className="space-y-1.5">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium text-gray-700">{p.label}</span>
                      <span className="font-mono font-semibold text-gray-900">{showResult ? `${p.prob}%` : "??%"}</span>
                    </div>
                    <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-1000 ease-out" style={{ width: showResult ? `${p.prob}%` : "0%", backgroundColor: p.color, transitionDelay: `${i * 200}ms` }} />
                    </div>
                  </div>
                ))}
              </div>
              {showResult && (
                <div className="mt-4 p-3 bg-white rounded-lg border border-gray-200 text-center" style={{ animation: "fadeIn 0.5s ease-out" }}>
                  <p className="text-sm text-gray-600">부장님 결론: <span className="font-bold text-gray-900">"김대리, 내일 반차 쓸 거지?"</span></p>
                </div>
              )}
            </div>
            <button onClick={() => setShowResult(!showResult)} className="px-5 py-2.5 bg-gray-900 text-white text-sm rounded-xl hover:bg-gray-800 transition-all">
              {showResult ? "숨기기" : "확률 계산 🎰"}
            </button>
            <DeepDive>
              {(() => {
                const [temperature, setTemperature] = useState(1.0);
                const rawLogits = [3.2, 1.5, -0.5, -1.8, 0.3];
                const labels = ["반차", "외근", "야근", "퇴사", "회의"];
                const computeSoftmax = (logits, temp) => {
                  const scaled = logits.map(l => l / Math.max(temp, 0.01));
                  const maxVal = Math.max(...scaled);
                  const exps = scaled.map(s => Math.exp(s - maxVal));
                  const sum = exps.reduce((a, b) => a + b, 0);
                  return exps.map(e => e / sum);
                };
                const probs = computeSoftmax(rawLogits, temperature);
                const topK = 3;
                const topP = 0.9;
                const sorted = probs.map((p, i) => ({ p, i })).sort((a, b) => b.p - a.p);
                let cumP = 0;
                const topPCutoff = sorted.findIndex(item => { cumP += item.p; return cumP >= topP; });
                return (
                  <div className="space-y-4">
                    <p className="text-sm text-gray-700 font-medium">Temperature, Top-K, Top-P — 부장님의 직감 조절기</p>
                    <p className="text-xs text-gray-500">소프트맥스 전에 "얼마나 확신을 가지고 답할지" 조절하는 파라미터들입니다. 실제 ChatGPT, Claude에서 설정할 수 있는 값입니다.</p>

                    {/* Temperature slider */}
                    <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-4">
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-medium text-gray-700 w-24">Temperature:</span>
                        <input
                          type="range" min="0.1" max="2.0" step="0.1"
                          value={temperature}
                          onChange={(e) => setTemperature(parseFloat(e.target.value))}
                          className="flex-1 h-1.5 bg-gray-200 rounded-full appearance-none cursor-pointer"
                        />
                        <span className="text-sm font-mono font-bold w-8 text-right">{temperature.toFixed(1)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-[10px]">
                        <span className={`px-2 py-0.5 rounded ${temperature < 0.5 ? "bg-blue-100 text-blue-700 font-bold" : "bg-gray-50 text-gray-400"}`}>🧊 차갑게 (정확)</span>
                        <span className={`px-2 py-0.5 rounded ${temperature >= 0.8 && temperature <= 1.2 ? "bg-gray-200 text-gray-700 font-bold" : "bg-gray-50 text-gray-400"}`}>⚖️ 보통</span>
                        <span className={`px-2 py-0.5 rounded ${temperature > 1.5 ? "bg-red-100 text-red-700 font-bold" : "bg-gray-50 text-gray-400"}`}>🔥 뜨겁게 (창의적)</span>
                      </div>

                      {/* Probability bars */}
                      <div className="space-y-2">
                        <p className="text-[10px] text-gray-400 font-mono">softmax(logits / {temperature.toFixed(1)}) =</p>
                        {labels.map((label, i) => {
                          const prob = probs[i];
                          const rank = sorted.findIndex(s => s.i === i);
                          const isTopK = rank < topK;
                          const isTopP = rank <= topPCutoff;
                          return (
                            <div key={i} className="flex items-center gap-2">
                              <span className="text-[10px] font-medium text-gray-600 w-10">{label}</span>
                              <div className="flex-1 h-5 bg-gray-100 rounded-full overflow-hidden relative">
                                <div
                                  className={`h-full rounded-full transition-all duration-500 ${prob > 0.4 ? "bg-gray-900" : prob > 0.15 ? "bg-gray-600" : "bg-gray-300"}`}
                                  style={{ width: `${Math.max(prob * 100, 1)}%` }}
                                />
                              </div>
                              <span className="text-[10px] font-mono font-bold w-12 text-right">{(prob * 100).toFixed(1)}%</span>
                              <div className="flex gap-0.5 w-12">
                                {isTopK && <span className="text-[8px] px-1 py-0.5 bg-blue-100 text-blue-600 rounded">K</span>}
                                {isTopP && <span className="text-[8px] px-1 py-0.5 bg-emerald-100 text-emerald-600 rounded">P</span>}
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Interpretation */}
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-xs text-gray-600">
                          {temperature < 0.5
                            ? "🧊 부장님이 매우 확신에 찬 상태입니다. \"무조건 반차야!\" — 다른 가능성은 거의 무시합니다."
                            : temperature <= 1.2
                            ? "⚖️ 부장님이 합리적으로 판단합니다. \"반차가 유력하지만 외근일 수도...\" — 상위 후보를 균형 있게 고려합니다."
                            : "🔥 부장님이 열린 마음입니다. \"반차? 외근? 회의? 다 가능해!\" — 예상치 못한 답이 나올 수 있습니다."}
                        </p>
                      </div>
                    </div>

                    {/* Top-K, Top-P explanation */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <p className="text-[10px] font-bold text-blue-700 mb-1">Top-K = {topK}</p>
                        <p className="text-[10px] text-blue-600">상위 {topK}개 후보만 남기고 나머지 제거</p>
                        <p className="text-[10px] text-gray-500 mt-1">부장님: "가능성 낮은 건 무시!"</p>
                      </div>
                      <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                        <p className="text-[10px] font-bold text-emerald-700 mb-1">Top-P = {topP}</p>
                        <p className="text-[10px] text-emerald-600">누적 확률 {topP * 100}%까지만 포함</p>
                        <p className="text-[10px] text-gray-500 mt-1">부장님: "90%까지 커버하면 충분해"</p>
                      </div>
                    </div>

                    <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
                      <p className="text-xs text-amber-800"><strong>실무 팁:</strong> 코드 생성 시 temperature=0.2 (정확한 답 필요), 창작 글쓰기 시 temperature=0.8~1.2 (다양한 표현 필요), 브레인스토밍 시 temperature=1.5+ (뜻밖의 아이디어). ChatGPT에서 "같은 질문에 다른 답이 나오는 이유"가 바로 이 temperature와 샘플링 때문입니다.</p>
                    </div>
                  </div>
                );
              })()}
            </DeepDive>
          </div>
        );
      }
    },
    {
      title: "자기회귀 (Auto-regression)",
      subtitle: "꼬리 무는 예측",
      icon: RefreshCw,
      content: () => {
        const [iteration, setIteration] = useState(0);
        const tokens = ["저", "내일", "오후에", "반차", "쓰겠습니다"];
        return (
          <div className="space-y-6">
            <p className="text-sm text-gray-500">예측된 단어를 붙이고, 다시 전체 문장으로 다음 단어를 예측하는 순환 구조입니다.</p>
            <div className="bg-gray-50 rounded-xl p-5">
              <div className="flex flex-wrap gap-2 mb-4">
                {tokens.slice(0, 3 + iteration).map((t, i) => (
                  <span key={i} className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-all ${i >= 3 ? "bg-gray-900 text-white border-gray-900" : "bg-white border-gray-200 text-gray-700"}`} style={i >= 3 ? { animation: "slideUp 0.4s ease-out forwards" } : {}}>
                    {t}
                  </span>
                ))}
                {iteration < 2 && <span className="px-3 py-1.5 text-gray-300 text-sm animate-pulse">???</span>}
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <RefreshCw size={12} className={iteration > 0 ? "animate-spin" : ""} />
                <span>{iteration === 0 ? "다음 단어를 예측해 보세요" : iteration === 1 ? "'반차'를 예측했습니다! 한 번 더!" : "완성! 순환 예측 종료 ✅"}</span>
              </div>
            </div>
            <button onClick={() => setIteration(prev => Math.min(prev + 1, 2))} disabled={iteration >= 2} className="px-5 py-2.5 bg-gray-900 text-white text-sm rounded-xl hover:bg-gray-800 transition-all disabled:opacity-30">
              다음 단어 예측 🔄
            </button>
            {iteration >= 2 && <button onClick={() => setIteration(0)} className="ml-2 px-4 py-2 text-sm text-gray-500 hover:text-gray-800"><RotateCcw size={14} className="inline mr-1" />리셋</button>}
            <DeepDive>
              {(() => {
                const [genStep, setGenStep] = useState(0);
                const generationSteps = [
                  {
                    context: ["저", "내일", "오후에"],
                    candidates: [
                      { word: "반차", prob: 42 },
                      { word: "회의", prob: 18 },
                      { word: "출장", prob: 15 },
                      { word: "퇴근", prob: 12 },
                      { word: "병원", prob: 8 },
                    ],
                    chosen: "반차",
                    explanation: "어텐션이 '한숨+오후'에 집중 → '쉬고 싶다' 의도 포착"
                  },
                  {
                    context: ["저", "내일", "오후에", "반차"],
                    candidates: [
                      { word: "쓰겠", prob: 55 },
                      { word: "내겠", prob: 20 },
                      { word: "쓸게", prob: 12 },
                      { word: "쓸까", prob: 8 },
                      { word: "넣겠", prob: 5 },
                    ],
                    chosen: "쓰겠",
                    explanation: "'반차' 다음에 높은 확률로 오는 동사 패턴 학습"
                  },
                  {
                    context: ["저", "내일", "오후에", "반차", "쓰겠"],
                    candidates: [
                      { word: "습니다", prob: 72 },
                      { word: "는데요", prob: 15 },
                      { word: "어요", prob: 8 },
                      { word: "다", prob: 3 },
                      { word: "는데", prob: 2 },
                    ],
                    chosen: "습니다",
                    explanation: "직장 상사에게 보고하는 존댓말 문맥 → '습니다' 확률 급등"
                  },
                ];
                const currentStep = generationSteps[Math.min(genStep, generationSteps.length - 1)];
                return (
                  <div className="space-y-4">
                    <p className="text-sm text-gray-700 font-medium">토큰별 생성 과정 — 부장님이 한 글자씩 예측하는 법</p>
                    <p className="text-xs text-gray-500">LLM은 한 번에 전체 문장을 만들지 않습니다. 매번 "지금까지의 맥락"을 보고 "다음 한 토큰"만 예측하는 과정을 반복합니다.</p>

                    <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-4">
                      {/* Current context */}
                      <div>
                        <p className="text-[10px] text-gray-400 mb-2">현재 컨텍스트 (Step {genStep + 1}/{generationSteps.length})</p>
                        <div className="flex gap-1.5 flex-wrap items-center">
                          {currentStep.context.map((t, i) => (
                            <span key={i} className={`px-2.5 py-1 rounded-md text-xs font-mono font-semibold border ${i >= currentStep.context.length - (genStep > 0 ? 1 : 0) && genStep > 0 ? "bg-blue-50 border-blue-200 text-blue-700" : "bg-gray-50 border-gray-200 text-gray-700"}`}>{t}</span>
                          ))}
                          <span className="text-xs text-gray-300 animate-pulse">▌</span>
                        </div>
                      </div>

                      {/* Candidate probabilities */}
                      <div>
                        <p className="text-[10px] text-gray-400 mb-2">다음 토큰 후보 확률 분포</p>
                        <div className="space-y-1.5">
                          {currentStep.candidates.map((c, i) => (
                            <div key={i} className="flex items-center gap-2">
                              <span className={`text-[10px] font-mono w-14 text-right ${c.word === currentStep.chosen ? "font-bold text-blue-700" : "text-gray-500"}`}>{c.word}</span>
                              <div className="flex-1 h-4 bg-gray-100 rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full transition-all duration-700 ${c.word === currentStep.chosen ? "bg-blue-500" : "bg-gray-300"}`}
                                  style={{ width: `${c.prob}%`, transitionDelay: `${i * 100}ms` }}
                                />
                              </div>
                              <span className="text-[10px] font-mono w-8 text-right text-gray-500">{c.prob}%</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Explanation */}
                      <div className="p-2 bg-blue-50 rounded-lg">
                        <p className="text-[10px] text-blue-700">💬 부장님 추론: {currentStep.explanation}</p>
                      </div>

                      {/* KV Cache note */}
                      {genStep > 0 && (
                        <div className="p-2 bg-purple-50 rounded-lg border border-purple-100">
                          <p className="text-[10px] text-purple-700"><strong>KV 캐시:</strong> "저", "내일", "오후에"는 이미 이전 스텝에서 계산했으므로 다시 계산하지 않습니다. 새로 추가된 "{currentStep.context[currentStep.context.length - 1]}"만 처리하면 됩니다. 이것이 ChatGPT가 긴 답변에서도 속도를 유지하는 비결입니다.</p>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <button onClick={() => setGenStep(Math.max(0, genStep - 1))} disabled={genStep === 0} className="px-3 py-1.5 text-xs rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-30">이전</button>
                      <button onClick={() => setGenStep(Math.min(generationSteps.length - 1, genStep + 1))} disabled={genStep >= generationSteps.length - 1} className="px-3 py-1.5 text-xs rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-30">다음 토큰 생성</button>
                    </div>

                    <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
                      <p className="text-xs text-amber-800"><strong>핵심 통찰:</strong> "저 내일 오후에 반차 쓰겠습니다"라는 7토큰 답변을 만들려면, 전체 모델(임베딩→어텐션→FFN→소프트맥스)이 7번 돌아갑니다. Claude가 긴 답변을 쓸 때 글자가 하나씩 나타나는 이유가 바로 이것입니다 — 실시간으로 한 토큰씩 생성 중이기 때문입니다.</p>
                    </div>
                    <div className="p-3 bg-gray-100 rounded-lg">
                      <p className="text-xs text-gray-600"><strong>📊 실제 수치:</strong> GPT-4는 초당 약 40~80 토큰 생성. 1,000자 답변 ≈ 약 500~700 토큰 ≈ 약 10초. 각 토큰 생성마다 1.8조 개 파라미터가 전부 동원됩니다.</p>
                    </div>
                  </div>
                );
              })()}
            </DeepDive>
          </div>
        );
      }
    },
    {
      title: "역전파 (Backpropagation)",
      subtitle: "뼈저린 반성",
      icon: RotateCcw,
      content: () => {
        const [phase, setPhase] = useState(0); // 0: before, 1: shock, 2: fix
        const [shake, setShake] = useState(false);

        const handleReveal = () => {
          setPhase(1);
          setShake(true);
          setTimeout(() => setShake(false), 600);
          setTimeout(() => setPhase(2), 1500);
        };

        return (
          <div className="space-y-6">
            <p className="text-sm text-gray-500">예측이 틀렸을 때 오차를 계산하고, 거꾸로 돌아가며 가중치를 수정합니다.</p>
            <div className={`bg-gray-50 rounded-xl p-5 transition-all ${shake ? "animate-[shake_0.5s_ease-in-out]" : ""}`}>
              {phase === 0 && (
                <div className="text-center space-y-3">
                  <p className="text-sm text-gray-600">부장님의 예측: <span className="font-bold">"반차 쓸 거지?" (80%)</span></p>
                  <p className="text-gray-400 text-sm">그런데 김대리의 실제 대답은...</p>
                </div>
              )}
              {phase >= 1 && (
                <div className="text-center space-y-4" style={{ animation: "fadeIn 0.5s ease-out" }}>
                  <div className="inline-block p-4 bg-red-50 rounded-xl border border-red-200">
                    <p className="text-lg font-bold text-red-700">💥 "사직서 내겠습니다"</p>
                  </div>
                  <p className="text-sm text-red-500 font-medium">예측 실패! 오차율: 95%</p>
                </div>
              )}
              {phase >= 2 && (
                <div className="mt-4 space-y-3" style={{ animation: "fadeIn 0.5s ease-out" }}>
                  <div className="p-3 bg-white rounded-lg border border-gray-200">
                    <p className="text-xs text-gray-400 mb-2">🔧 가중치 수정 중...</p>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-xs">
                        <span className="text-gray-500 w-32">"한숨 → 반차" 가중치:</span>
                        <span className="line-through text-red-400">0.92</span>
                        <ArrowRight size={10} />
                        <span className="text-emerald-600 font-bold">0.3</span>
                        <span className="text-gray-400">↓ 대폭 감소</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        <span className="text-gray-500 w-32">"한숨 → 퇴사" 가중치:</span>
                        <span className="line-through text-red-400">0.05</span>
                        <ArrowRight size={10} />
                        <span className="text-emerald-600 font-bold">0.85</span>
                        <span className="text-gray-400">↑ 대폭 증가</span>
                      </div>
                    </div>
                  </div>
                  <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
                    <p className="text-sm text-amber-700">💡 부장님의 깨달음: <em>"요즘 세대는 피곤하면 반차가 아니라 퇴사구나..."</em></p>
                  </div>
                </div>
              )}
            </div>
            {phase === 0 ? (
              <button onClick={handleReveal} className="px-5 py-2.5 bg-gray-900 text-white text-sm rounded-xl hover:bg-gray-800 transition-all">
                실제 답 공개 😱
              </button>
            ) : (
              <button onClick={() => setPhase(0)} className="flex items-center gap-1.5 px-4 py-2 text-sm text-gray-500 hover:text-gray-800">
                <RotateCcw size={14} /> 처음부터
              </button>
            )}
            <DeepDive>
              {(() => {
                const [epoch, setEpoch] = useState(0);
                const [lr, setLr] = useState(0.01);
                const maxEpochs = 8;
                const lossHistory = Array.from({ length: maxEpochs }, (_, i) => {
                  const base = 2.5 * Math.exp(-lr * 50 * (i + 1)) + 0.1;
                  const noise = Math.sin(i * 3) * 0.05;
                  return Math.max(0.05, base + noise);
                });
                const accuracyHistory = lossHistory.map(l => Math.min(98, Math.max(5, (1 - l / 2.5) * 100)));
                const weightUpdates = [
                  { name: '"한숨→반차"', before: 0.92, after: (idx) => Math.max(0.1, 0.92 - lr * 50 * (idx + 1) * 0.08) },
                  { name: '"한숨→퇴사"', before: 0.05, after: (idx) => Math.min(0.9, 0.05 + lr * 50 * (idx + 1) * 0.1) },
                  { name: '"오후→반차"', before: 0.75, after: (idx) => Math.max(0.2, 0.75 - lr * 50 * (idx + 1) * 0.06) },
                ];

                return (
                  <div className="space-y-4">
                    <p className="text-sm text-gray-700 font-medium">경사하강법 & 학습률 — 부장님이 실수에서 배우는 속도</p>
                    <p className="text-xs text-gray-500">역전파는 "오차를 줄이는 방향"으로 가중치를 조금씩 수정합니다. 학습률(Learning Rate)은 "한 번에 얼마나 크게 수정할지"를 결정합니다.</p>

                    {/* Learning Rate slider */}
                    <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-4">
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-medium text-gray-700 w-24">학습률 (LR):</span>
                        <input
                          type="range" min="0.001" max="0.1" step="0.001"
                          value={lr}
                          onChange={(e) => { setLr(parseFloat(e.target.value)); setEpoch(0); }}
                          className="flex-1 h-1.5 bg-gray-200 rounded-full appearance-none cursor-pointer"
                        />
                        <span className="text-xs font-mono font-bold w-12 text-right">{lr.toFixed(3)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-[10px]">
                        <span className={`px-2 py-0.5 rounded ${lr < 0.005 ? "bg-blue-100 text-blue-700 font-bold" : "bg-gray-50 text-gray-400"}`}>🐢 너무 느림</span>
                        <span className={`px-2 py-0.5 rounded ${lr >= 0.005 && lr <= 0.03 ? "bg-emerald-100 text-emerald-700 font-bold" : "bg-gray-50 text-gray-400"}`}>✅ 적절</span>
                        <span className={`px-2 py-0.5 rounded ${lr > 0.05 ? "bg-red-100 text-red-700 font-bold" : "bg-gray-50 text-gray-400"}`}>💥 발산 위험</span>
                      </div>
                    </div>

                    {/* Loss graph (text-based) */}
                    <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-3">
                      <p className="text-xs font-medium text-gray-700">학습 곡선 — 에포크별 손실(Loss) 변화</p>
                      <div className="space-y-1">
                        {lossHistory.slice(0, epoch + 1).map((loss, i) => (
                          <div key={i} className="flex items-center gap-2">
                            <span className="text-[9px] font-mono text-gray-400 w-14">EP {i + 1}</span>
                            <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all duration-500 ${loss > 1.5 ? "bg-red-500" : loss > 0.5 ? "bg-amber-500" : "bg-emerald-500"}`}
                                style={{ width: `${Math.min(100, loss / 2.5 * 100)}%` }}
                              />
                            </div>
                            <span className="text-[9px] font-mono w-10 text-right">{loss.toFixed(2)}</span>
                            <span className="text-[9px] font-mono text-gray-400 w-12 text-right">{accuracyHistory[i].toFixed(0)}%</span>
                          </div>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setEpoch(Math.min(maxEpochs - 1, epoch + 1))}
                          disabled={epoch >= maxEpochs - 1}
                          className="px-3 py-1.5 text-xs rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-30"
                        >
                          다음 에포크 학습
                        </button>
                        <button onClick={() => setEpoch(0)} className="px-3 py-1.5 text-xs rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50">리셋</button>
                      </div>
                    </div>

                    {/* Weight changes */}
                    <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-2">
                      <p className="text-xs font-medium text-gray-700">가중치 변화 추적</p>
                      {weightUpdates.map((w, i) => {
                        const afterVal = epoch > 0 ? w.after(epoch - 1) : w.before;
                        return (
                          <div key={i} className="flex items-center gap-2 text-[10px]">
                            <span className="text-gray-600 w-24 font-mono">{w.name}</span>
                            <span className="font-mono text-gray-400 w-8">{w.before.toFixed(2)}</span>
                            <ArrowRight size={10} className="text-gray-300" />
                            <span className={`font-mono font-bold w-8 ${Math.abs(afterVal - w.before) > 0.3 ? "text-emerald-600" : "text-gray-600"}`}>{afterVal.toFixed(2)}</span>
                            <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                              <div className="h-full bg-emerald-500 rounded-full transition-all duration-500" style={{ width: `${Math.abs(afterVal - w.before) / 0.9 * 100}%` }} />
                            </div>
                          </div>
                        );
                      })}
                      {epoch > 0 && (
                        <p className="text-[10px] text-gray-500 italic mt-2">
                          💬 부장님 (에포크 {epoch}): {epoch < 3 ? '"아직 헷갈리지만 방향은 잡았어..."' : epoch < 6 ? '"이제 좀 감이 오는데?"' : '"이제 완벽해! 한숨 = 퇴사 신호!"'}
                        </p>
                      )}
                    </div>

                    <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
                      <p className="text-xs text-amber-800"><strong>핵심 통찰:</strong> GPT-4 학습에는 약 수천 GPU × 수개월이 소요되었고, 비용은 1억 달러 이상으로 추정됩니다. 수조 개의 토큰에서 수조 번의 역전파가 일어났습니다. 부장님이 30년 직장 경험을 쌓는 것과 같되, 부장님보다 수백만 배 많은 "경험"을 합니다.</p>
                    </div>
                    <div className="p-3 bg-gray-100 rounded-lg">
                      <p className="text-xs text-gray-600"><strong>📊 실제 수치:</strong> Adam 옵티마이저의 학습률은 보통 1e-4 ~ 3e-4. GPT-4는 약 13조 토큰으로 학습. 한 번의 학습(에포크)이 아닌 수만 번의 스텝으로 가중치를 조정합니다. 학습 후에도 RLHF(인간 피드백 강화학습)로 추가 튜닝합니다.</p>
                    </div>
                  </div>
                );
              })()}
            </DeepDive>
          </div>
        );
      }
    },
  ];

  // Game logic — multi-round
  const rounds = [
    {
      speaker: "김대리",
      context: "월요일 아침, 김대리가 커피를 들고 부장님 자리로 다가옵니다.",
      words: ["부장님", "이번", "프로젝트", "예산이"],
      keyWords: new Set(["프로젝트", "예산이"]),
      predictions: [
        { word: "부족합니다", prob: 65, correct: true },
        { word: "남았습니다", prob: 20, correct: false },
        { word: "좋습니다", prob: 10, correct: false },
        { word: "삭제됐습니다", prob: 5, correct: false },
      ],
      explanation: "'프로젝트'와 '예산이'가 핵심 어텐션 포인트입니다. 직장에서 예산 언급은 보통 부족함을 호소할 때가 많습니다.",
      difficulty: "쉬움"
    },
    {
      speaker: "박과장",
      context: "점심시간 직후, 박과장이 회의실에서 나오며 혼잣말을 합니다.",
      words: ["아까", "회의에서", "대표님이", "우리", "팀", "성과를"],
      keyWords: new Set(["대표님이", "성과를"]),
      predictions: [
        { word: "칭찬하셨어", prob: 45, correct: false },
        { word: "지적하셨어", prob: 35, correct: true },
        { word: "물어보셨어", prob: 15, correct: false },
        { word: "발표하셨어", prob: 5, correct: false },
      ],
      explanation: "'대표님이' + '성과를' 조합에서, 회의 직후 혼잣말을 하는 맥락이 중요합니다. 좋은 소식이면 혼잣말보다는 동료에게 바로 알리죠. 부정적 맥락 어텐션이 더 높습니다.",
      difficulty: "보통"
    },
    {
      speaker: "이사원",
      context: "퇴근 10분 전, 이사원이 노트북을 닫으며 옆 동료에게 말합니다.",
      words: ["오늘", "저녁에", "갑자기", "부장님이", "내일", "아침까지", "보고서를"],
      keyWords: new Set(["갑자기", "내일", "아침까지", "보고서를"]),
      predictions: [
        { word: "제출하래요", prob: 50, correct: true },
        { word: "검토하래요", prob: 25, correct: false },
        { word: "수정하래요", prob: 15, correct: false },
        { word: "준비하래요", prob: 10, correct: false },
      ],
      explanation: "'갑자기' + '내일 아침까지' + '보고서를' — 긴급성(갑자기), 마감(아침까지), 대상(보고서)의 3중 어텐션이 형성됩니다. 퇴근 전 급한 업무 지시는 '제출'이 가장 높은 확률입니다. 이것이 멀티헤드 어텐션의 힘입니다.",
      difficulty: "어려움"
    },
  ];
  const [currentRound, setCurrentRound] = useState(0);
  const [roundScores, setRoundScores] = useState([]);
  const round = rounds[currentRound];

  useEffect(() => {
    if (gameStarted && gamePhase === "attention" && timeLeft > 0) {
      timerRef.current = setTimeout(() => setTimeLeft(prev => prev - 2), 100);
      return () => clearTimeout(timerRef.current);
    }
    if (timeLeft <= 0 && gamePhase === "attention") {
      setGamePhase("predict");
      setTimeLeft(100);
    }
  }, [gameStarted, gamePhase, timeLeft]);

  useEffect(() => {
    if (gamePhase === "predict" && timeLeft > 0) {
      timerRef.current = setTimeout(() => setTimeLeft(prev => prev - 1.5), 100);
      return () => clearTimeout(timerRef.current);
    }
    if (timeLeft <= 0 && gamePhase === "predict" && !selectedPrediction) {
      setGamePhase("result");
      setGameScore(0);
    }
  }, [gamePhase, timeLeft, selectedPrediction]);

  const handlePrediction = (option) => {
    setSelectedPrediction(option);
    clearTimeout(timerRef.current);
    const attentionScore = [...selectedWords].filter(w => round.keyWords.has(w)).length * Math.round(50 / round.keyWords.size);
    const predScore = option.correct ? 50 : 0;
    const score = Math.min(100, attentionScore + predScore);
    setGameScore(score);
    setGamePhase("result");
  };

  const nextRound = () => {
    setRoundScores(prev => [...prev, gameScore]);
    setCurrentRound(prev => prev + 1);
    setGamePhase("attention");
    setSelectedWords(new Set());
    setSelectedPrediction(null);
    setTimeLeft(100);
    setGameScore(null);
  };

  const resetGame = () => {
    setGameStarted(false);
    setGamePhase("attention");
    setSelectedWords(new Set());
    setSelectedPrediction(null);
    setTimeLeft(100);
    setGameScore(null);
    setCurrentRound(0);
    setRoundScores([]);
  };

  const StepContent = steps[step]?.content;

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-2xl border border-gray-100 p-5 sm:p-8 shadow-sm">
        <ConceptHeader icon={BookOpen} title="개념 쏙쏙 — 부장님의 눈치 게임 👀" />
        <p className="text-sm text-gray-500 mb-6">LLM의 작동 원리를 7단계로 체험하세요. 각 단계를 클릭해서 진행합니다.</p>

        {/* Step nav */}
        <div className="flex gap-1.5 mb-6 overflow-x-auto pb-2">
          {steps.map((s, i) => (
            <button
              key={i}
              onClick={() => setStep(i)}
              className={`shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${i === step ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-500 hover:bg-gray-100"}`}
            >
              <span className="font-mono">{i + 1}</span>
              <span className="hidden sm:inline">{s.subtitle}</span>
            </button>
          ))}
        </div>

        {/* Step content */}
        <div className="mb-4">
          <div className="flex items-center gap-3 mb-4">
            {(() => { const Icon = steps[step].icon; return <Icon size={20} className="text-gray-700" />; })()}
            <div>
              <h3 className="font-semibold text-gray-900">{steps[step].title}</h3>
              <p className="text-xs text-gray-400">{steps[step].subtitle}</p>
            </div>
          </div>
          <StepContent />
        </div>

        {/* Step navigation */}
        <div className="flex justify-between mt-6 pt-4 border-t border-gray-100">
          <button onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0} className="flex items-center gap-1.5 px-4 py-2 text-sm text-gray-500 hover:text-gray-900 disabled:opacity-30 transition-colors">
            <ArrowLeft size={14} /> 이전
          </button>
          <span className="text-xs text-gray-400 self-center">{step + 1} / {steps.length}</span>
          <button onClick={() => setStep(Math.min(steps.length - 1, step + 1))} disabled={step === steps.length - 1} className="flex items-center gap-1.5 px-4 py-2 text-sm text-gray-500 hover:text-gray-900 disabled:opacity-30 transition-colors">
            다음 <ArrowRight size={14} />
          </button>
        </div>
      </div>

      {/* Game section */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 sm:p-8 shadow-sm">
        <GameHeader icon={Gamepad2} title="실전 게임 — 부장님 시뮬레이터" />

        {/* Round indicator */}
        {gameStarted && currentRound < rounds.length && (
          <div className="flex items-center gap-2 mb-4">
            {rounds.map((r, i) => (
              <div key={i} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-medium ${i === currentRound ? "bg-gray-900 text-white" : i < currentRound ? "bg-emerald-100 text-emerald-700" : "bg-gray-50 text-gray-400"}`}>
                <span>R{i + 1}</span>
                <span className="hidden sm:inline">({r.difficulty})</span>
                {i < currentRound && roundScores[i] !== undefined && <span className="font-mono">{roundScores[i]}점</span>}
              </div>
            ))}
          </div>
        )}

        {!gameStarted ? (
          <div className="text-center py-8">
            <p className="text-sm text-gray-500 mb-2">부장님이 되어 직원들의 말에서 핵심을 파악하고 다음 단어를 예측하세요!</p>
            <p className="text-xs text-gray-400 mb-4">총 {rounds.length}라운드 — 점점 어려워집니다</p>
            <button onClick={() => setGameStarted(true)} className="px-6 py-3 bg-gray-900 text-white text-sm font-medium rounded-xl hover:bg-gray-800 transition-all">
              <Play size={16} className="inline mr-2" /> 게임 시작
            </button>
          </div>
        ) : currentRound >= rounds.length ? (
          /* Final result */
          <div className="space-y-4 text-center py-6" style={{ animation: "fadeIn 0.5s ease-out" }}>
            <div className="text-4xl mb-2">🏆</div>
            <div className="text-2xl font-bold text-gray-900">{Math.round([...roundScores, gameScore].filter(s => s !== null).reduce((a, b) => a + b, 0) / rounds.length)}점</div>
            <p className="text-sm text-gray-600">
              {[...roundScores].reduce((a, b) => a + b, 0) / roundScores.length >= 75 ? "부장님 급 눈치왕! AI 어텐션 마스터!" : [...roundScores].reduce((a, b) => a + b, 0) / roundScores.length >= 50 ? "꽤 괜찮은 눈치! 조금만 더 연습하면 부장님!" : "눈치 수련이 필요합니다..."}
            </p>
            <div className="space-y-2 mt-4 max-w-xs mx-auto">
              {rounds.map((r, i) => (
                <div key={i} className="flex items-center justify-between text-xs p-2 bg-gray-50 rounded-lg">
                  <span className="text-gray-600">R{i + 1}: {r.speaker} ({r.difficulty})</span>
                  <span className={`font-mono font-bold ${roundScores[i] >= 75 ? "text-emerald-600" : roundScores[i] >= 50 ? "text-amber-600" : "text-red-500"}`}>{roundScores[i]}점</span>
                </div>
              ))}
            </div>
            <div className="p-4 bg-blue-50 rounded-xl border border-blue-200 mt-4 text-left max-w-sm mx-auto">
              <p className="text-xs text-blue-800"><strong>AI 해석:</strong> 이 게임에서 당신이 한 것이 바로 LLM의 핵심 동작입니다. 핵심 단어 선택 = 셀프 어텐션, 다음 단어 예측 = 소프트맥스 + 자기회귀. 문장이 길어질수록(라운드가 올라갈수록) 어텐션 포인트가 많아지는 것을 느꼈을 겁니다 — AI도 마찬가지입니다.</p>
            </div>
            <button onClick={resetGame} className="flex items-center gap-1.5 px-5 py-2.5 text-sm text-gray-500 hover:text-gray-800 mx-auto mt-2">
              <RotateCcw size={14} /> 처음부터 다시 하기
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Timer */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-gray-400">
                <span>{gamePhase === "attention" ? "⏱ 핵심 단어를 클릭!" : gamePhase === "predict" ? "⏱ 다음 단어를 예측!" : "결과"}</span>
                <span>{gamePhase !== "result" ? `${Math.round(timeLeft)}%` : ""}</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className={`h-full rounded-full transition-all duration-100 ${timeLeft > 30 ? "bg-gray-900" : "bg-red-500"}`} style={{ width: `${gamePhase !== "result" ? timeLeft : 0}%` }} />
              </div>
            </div>

            {/* Context */}
            <p className="text-xs text-gray-400 italic">{round.context}</p>

            {/* Sentence */}
            <div className="bg-gray-50 rounded-xl p-5">
              <p className="text-xs text-gray-400 mb-3">💬 {round.speaker}:</p>
              <div className="flex gap-2 flex-wrap">
                {round.words.map((w, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      if (gamePhase === "attention") {
                        setSelectedWords(prev => {
                          const next = new Set(prev);
                          if (next.has(w)) next.delete(w); else next.add(w);
                          return next;
                        });
                      }
                    }}
                    className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all ${selectedWords.has(w) ? "bg-gray-900 text-white border-gray-900" : "bg-white border-gray-200 text-gray-700 hover:border-gray-400"} ${gamePhase !== "attention" ? "cursor-default" : "cursor-pointer"}`}
                  >
                    {w}
                  </button>
                ))}
                <span className="px-4 py-2 text-gray-400 text-sm">???</span>
              </div>
            </div>

            {/* Prediction phase */}
            {gamePhase === "predict" && (
              <div className="space-y-3" style={{ animation: "fadeIn 0.5s ease-out" }}>
                <p className="text-sm text-gray-600 font-medium">다음 단어로 가장 적절한 것은?</p>
                <div className="grid grid-cols-2 gap-2">
                  {round.predictions.map((opt, i) => (
                    <button key={i} onClick={() => handlePrediction(opt)} className="p-3 bg-white rounded-xl border border-gray-200 hover:border-gray-400 text-sm text-gray-700 text-left transition-all">
                      <span className="font-medium">{opt.word}</span>
                      <span className="text-xs text-gray-400 ml-2">{opt.prob}%</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Result */}
            {gamePhase === "result" && (
              <div className="space-y-4" style={{ animation: "fadeIn 0.5s ease-out" }}>
                <div className={`p-5 rounded-xl border text-center ${gameScore >= 75 ? "bg-emerald-50 border-emerald-200" : gameScore >= 50 ? "bg-amber-50 border-amber-200" : "bg-red-50 border-red-200"}`}>
                  <div className="text-3xl font-bold mb-1">{gameScore}점</div>
                  <p className="text-sm text-gray-600">
                    {gameScore >= 75 ? "🎉 훌륭한 눈치! 부장님 레벨!" : gameScore >= 50 ? "👍 나쁘지 않아요!" : "😅 눈치가 아직..."}
                  </p>
                  <div className="mt-3 text-xs text-gray-500 space-y-1">
                    <p>어텐션 점수: {[...selectedWords].filter(w => round.keyWords.has(w)).length}/{round.keyWords.size} 핵심 단어 (정답: {[...round.keyWords].join(", ")})</p>
                    <p>예측: {selectedPrediction ? (selectedPrediction.correct ? "정답! ✅" : `"${selectedPrediction.word}" - 오답 ❌`) : "시간 초과 ⏰"}</p>
                  </div>
                </div>
                {/* Explanation */}
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                  <p className="text-xs font-medium text-gray-700 mb-1">🧠 부장님의 어텐션 분석</p>
                  <p className="text-xs text-gray-500">{round.explanation}</p>
                </div>
                <div className="flex justify-center gap-2">
                  {currentRound < rounds.length - 1 ? (
                    <button onClick={nextRound} className="flex items-center gap-1.5 px-5 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-xl hover:bg-gray-800 transition-all">
                      다음 라운드 <ArrowRight size={14} />
                    </button>
                  ) : (
                    <button onClick={() => { setRoundScores(prev => [...prev, gameScore]); setCurrentRound(rounds.length); }} className="flex items-center gap-1.5 px-5 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-xl hover:bg-gray-800 transition-all">
                      최종 결과 보기 <Award size={14} />
                    </button>
                  )}
                  <button onClick={resetGame} className="flex items-center gap-1.5 px-4 py-2 text-sm text-gray-500 hover:text-gray-800">
                    <RotateCcw size={14} /> 처음부터
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

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
  const renderNetworkDiagram = useCallback((w) => {
    if (!w) return null;
    const layers = [2, ...w.hidden.map(h => h.length), 1];
    const layerLabels = ["입력", ...w.hidden.map((_, i) => `은닉 ${i + 1}`), "출력"];
    const maxNeurons = Math.max(...layers);
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
          if (li < w.hidden.length) {
            weight = w.hidden[li][nj] ? w.hidden[li][nj][ni] || 0 : 0;
          } else {
            weight = w.output[ni] || 0;
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
  }, []);

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
                <span className="w-2 h-2 rounded-full bg-blue-500" /> 파랑 팀
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] bg-white/90 backdrop-blur px-2 py-1 rounded-full border border-gray-200">
                <span className="w-2 h-2 rounded-full bg-orange-500" /> 주황 팀
              </span>
            </div>
          </div>
          <p className="text-[10px] text-gray-400 mt-2 text-center">배경 색이 변하는 것 = AI가 '여기는 파랑, 여기는 주황' 이라고 판단하는 영역</p>
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
            {renderNetworkDiagram(weightsRef.current)}
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

      {/* 설명 박스 */}
      <div className="mt-5 p-4 bg-indigo-50 rounded-xl border border-indigo-200">
        <p className="text-xs font-medium text-indigo-800 mb-2">이게 뭔가요?</p>
        <div className="text-xs text-indigo-700 space-y-1.5">
          <p><strong>파랑 점과 주황 점</strong> = 두 종류의 데이터 (예: 정상 설비 vs 고장 설비)</p>
          <p><strong>배경 색 변화</strong> = AI가 "이 영역은 파랑(정상), 이 영역은 주황(고장)"이라고 판단하는 구역</p>
          <p><strong>학습 시작</strong>을 누르면 AI가 데이터를 반복해서 보면서 점점 정확하게 구분선을 그려갑니다</p>
          <p><strong>뉴런 수</strong>를 늘리면 AI가 더 복잡한 패턴을 학습할 수 있고, <strong>학습 속도</strong>를 높이면 빨리 배우지만 불안정할 수 있습니다</p>
        </div>
      </div>
    </div>
  );
};

// ─── TAB 3: AI in Power Industry ─────────────────────
const Tab3 = () => {
  const [scenario, setScenario] = useState(null);
  const [showAi, setShowAi] = useState(false);

  // Game state
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
    { id: "heat", label: "갑작스러운 폭염 🌡️", icon: "🌡️" },
    { id: "factory", label: "대규모 공장 가동 🏭", icon: "🏭" },
  ];

  // Game loop
  useEffect(() => {
    if (gameRunning && !gameOver) {
      gameRef.current = setInterval(() => {
        setGameTime(prev => {
          const newTime = prev + 1;
          if (newTime >= 100) {
            clearInterval(gameRef.current);
            setGameOver(true);
            setSurvived(true);
            return 100;
          }

          const demand = 50 + Math.sin(newTime * 0.15) * 20 + Math.sin(newTime * 0.07) * 15 + (Math.random() - 0.5) * 10;
          const clampedDemand = Math.max(10, Math.min(90, demand));

          setDemandHistory(prev => [...prev.slice(-40), clampedDemand]);

          if (aiMode) {
            setSliderVal(clampedDemand);
            setSupplyHistory(prev => [...prev.slice(-40), clampedDemand]);
          } else {
            setSupplyHistory(prev => [...prev.slice(-40), sliderVal]);
            const diff = Math.abs(sliderVal - clampedDemand);
            if (diff > 25) {
              setScore(prev => {
                const newScore = prev - 2;
                if (newScore <= 0) {
                  clearInterval(gameRef.current);
                  setGameOver(true);
                  setSurvived(false);
                  return 0;
                }
                return newScore;
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
    setGameRunning(true);
    setGameOver(false);
    setSurvived(false);
    setGameTime(0);
    setDemandHistory([]);
    setSupplyHistory([]);
    setScore(100);
    setAiMode(false);
    setSliderVal(50);
  };

  const MiniChart = ({ data, color, height = 60 }) => {
    if (data.length < 2) return <div style={{ height }} className="bg-gray-50 rounded-lg" />;
    const max = 100;
    const points = data.map((v, i) => `${(i / (data.length - 1)) * 100},${100 - (v / max) * 100}`).join(" ");
    return (
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{ height }} className="w-full">
        <polyline points={points} fill="none" stroke={color} strokeWidth="2" vectorEffect="non-scaling-stroke" />
      </svg>
    );
  };

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-2xl border border-gray-100 p-5 sm:p-8 shadow-sm">
        <ConceptHeader icon={BookOpen} title="개념 쏙쏙 — 전력망의 미래" />
        <p className="text-sm text-gray-500 mb-6">시나리오를 선택해 수동 예측 vs AI 예측의 차이를 비교해 보세요.</p>

        <div className="flex gap-3 mb-6">
          {scenarios.map(s => (
            <button key={s.id} onClick={() => { setScenario(s.id); setShowAi(false); }} className={`flex-1 p-4 rounded-xl border text-sm transition-all ${scenario === s.id ? "bg-gray-900 text-white border-gray-900" : "bg-white border-gray-200 text-gray-600 hover:border-gray-400"}`}>
              <span className="text-lg block mb-1">{s.icon}</span> {s.label}
            </button>
          ))}
        </div>

        {scenario && (
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-xl border border-gray-200 space-y-3">
              <div className="text-xs font-semibold text-gray-400 flex items-center gap-1.5"><User size={12} /> 수동 예측</div>
              <div className="h-24 bg-gray-50 rounded-lg flex items-center justify-center overflow-hidden relative">
                <svg viewBox="0 0 200 80" className="w-full h-full">
                  {scenario === "heat" ? (
                    <>
                      <polyline points="0,60 30,55 50,50 70,40 80,20 90,50 110,15 130,55 150,25 180,45 200,30" fill="none" stroke="#ef4444" strokeWidth="2" />
                      <polyline points="0,55 30,53 50,52 70,50 80,48 90,47 110,46 130,45 150,44 180,43 200,42" fill="none" stroke="#9ca3af" strokeWidth="2" strokeDasharray="4 2" />
                    </>
                  ) : (
                    <>
                      <polyline points="0,50 20,50 40,45 50,15 60,55 80,10 100,60 120,20 150,50 200,45" fill="none" stroke="#ef4444" strokeWidth="2" />
                      <polyline points="0,48 30,47 60,46 90,45 120,44 150,44 200,43" fill="none" stroke="#9ca3af" strokeWidth="2" strokeDasharray="4 2" />
                    </>
                  )}
                </svg>
              </div>
              <p className="text-xs text-red-500">⚠️ 예측 실패! 수급 불균형 발생</p>
            </div>
            <div className="p-4 rounded-xl border border-gray-200 space-y-3">
              <div className="text-xs font-semibold text-gray-400 flex items-center gap-1.5"><Bot size={12} /> AI 예측</div>
              <div className="h-24 bg-gray-50 rounded-lg flex items-center justify-center overflow-hidden relative">
                {showAi ? (
                  <svg viewBox="0 0 200 80" className="w-full h-full">
                    <polyline points="0,60 30,55 50,50 70,40 80,25 90,30 110,22 130,28 150,25 180,27 200,30" fill="none" stroke="#10b981" strokeWidth="2" />
                    <polyline points="0,58 30,54 50,49 70,39 80,26 90,31 110,23 130,29 150,26 180,28 200,31" fill="none" stroke="#6b7280" strokeWidth="2" strokeDasharray="4 2" />
                  </svg>
                ) : (
                  <p className="text-xs text-gray-400">AI를 활성화하세요</p>
                )}
              </div>
              {showAi && <p className="text-xs text-emerald-600">✅ 수만 건의 과거 데이터로 즉시 대응!</p>}
            </div>
          </div>
        )}
        {scenario && !showAi && (
          <button onClick={() => setShowAi(true)} className="mt-4 px-5 py-2.5 bg-gray-900 text-white text-sm rounded-xl hover:bg-gray-800 transition-all">
            AI 예측 활성화 ⚡
          </button>
        )}
      </div>

      {/* Game */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 sm:p-8 shadow-sm">
        <GameHeader icon={Gamepad2} title="실전 게임 — 블랙아웃을 막아라!" />

        {!gameRunning ? (
          <div className="text-center py-8 space-y-4">
            <p className="text-sm text-gray-500">전력 수요에 맞춰 발전량을 조절하세요! 차이가 크면 정전됩니다.</p>
            <button onClick={startGame} className="px-6 py-3 bg-gray-900 text-white text-sm font-medium rounded-xl hover:bg-gray-800 transition-all">
              <Play size={16} className="inline mr-2" /> 시작
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <Badge variant={score > 50 ? "success" : score > 20 ? "warning" : "error"}>
                  안정도: {score}%
                </Badge>
                <span className="text-xs text-gray-400">{Math.round(gameTime)}%</span>
              </div>
              {!aiMode && !gameOver && (
                <button onClick={() => setAiMode(true)} className="px-4 py-2 bg-gray-900 text-white text-xs font-medium rounded-lg hover:bg-gray-800 transition-all">
                  <Cpu size={12} className="inline mr-1" /> AI 모드 켜기
                </button>
              )}
              {aiMode && <Badge variant="info">🤖 AI 자동 제어 중</Badge>}
            </div>

            {/* Progress */}
            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-gray-900 rounded-full transition-all" style={{ width: `${gameTime}%` }} />
            </div>

            {/* Chart area */}
            <div className="bg-gray-50 rounded-xl p-4 space-y-2">
              <div className="flex gap-4 text-xs text-gray-400 mb-2">
                <span className="flex items-center gap-1"><div className="w-3 h-0.5 bg-red-500 rounded" /> 전력 수요</span>
                <span className="flex items-center gap-1"><div className="w-3 h-0.5 bg-blue-500 rounded" /> 발전량(나)</span>
              </div>
              <div className="h-20 relative">
                <MiniChart data={demandHistory} color="#ef4444" height={80} />
                <div className="absolute inset-0">
                  <MiniChart data={supplyHistory} color="#3b82f6" height={80} />
                </div>
              </div>
            </div>

            {/* Slider */}
            {!aiMode && !gameOver && (
              <div className="space-y-2">
                <label className="text-xs text-gray-500">발전량 조절: {Math.round(sliderVal)}%</label>
                <input type="range" min="0" max="100" value={sliderVal} onChange={e => setSliderVal(Number(e.target.value))} className="w-full accent-gray-900" />
              </div>
            )}

            {gameOver && (
              <div className={`p-5 rounded-xl text-center ${survived ? "bg-emerald-50 border border-emerald-200" : "bg-red-50 border border-red-200"}`}>
                <p className="text-lg font-bold mb-1">{survived ? "🎉 블랙아웃 방어 성공!" : "💥 정전 발생!"}</p>
                <p className="text-sm text-gray-600">{survived ? (aiMode ? "AI 덕분에 안정적으로 유지했습니다!" : "대단합니다! 수동으로 성공!") : "수요와 공급의 괴리가 너무 커졌습니다."}</p>
                <button onClick={startGame} className="mt-3 px-4 py-2 bg-gray-900 text-white text-xs rounded-lg">
                  <RotateCcw size={12} className="inline mr-1" /> 다시 하기
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// ─── TAB 4: Prompt Tips ──────────────────────────────
const Tab4 = () => {
  const [activeBlock, setActiveBlock] = useState(null);
  const blocks = [
    { id: "role", label: "역할 부여", color: "bg-gray-900", example: "넌 한국전력 10년 차 과장이야", icon: User },
    { id: "context", label: "구체적 맥락", color: "bg-gray-700", example: "지금 폭우로 송전탑 문제가 생겼어", icon: Target },
    { id: "format", label: "출력 형식", color: "bg-gray-500", example: "안내문을 3문단 텍스트로 써줘", icon: FileText },
  ];

  // Game
  const [slots, setSlots] = useState([null, null, null]);
  const [gameSubmitted, setGameSubmitted] = useState(false);

  const allBlocks = [
    { id: "g1", text: "넌 전력설비 전문 엔지니어야", type: "role", good: true },
    { id: "g2", text: "오늘 강풍으로 154kV 송전선이 끊겼어", type: "context", good: true },
    { id: "g3", text: "복구 절차를 단계별 체크리스트로 작성해", type: "format", good: true },
    { id: "b1", text: "대충 써줘", type: "bad", good: false },
    { id: "b2", text: "뭔가 좋은 거 만들어봐", type: "bad", good: false },
    { id: "b3", text: "알아서 해", type: "bad", good: false },
  ];

  const shuffled = useRef([...allBlocks].sort(() => Math.random() - 0.5));

  const handleSlotFill = (blockId, slotIndex) => {
    if (gameSubmitted) return;
    const newSlots = [...slots];
    // Remove from other slot if already placed
    const existingSlot = newSlots.indexOf(blockId);
    if (existingSlot !== -1) newSlots[existingSlot] = null;
    newSlots[slotIndex] = blockId;
    setSlots(newSlots);
  };

  const checkResult = () => setGameSubmitted(true);
  const resetGame = () => { setSlots([null, null, null]); setGameSubmitted(false); };

  const allGood = slots.every(s => allBlocks.find(b => b.id === s)?.good);
  const slotLabels = ["역할", "맥락", "형식"];

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-2xl border border-gray-100 p-5 sm:p-8 shadow-sm">
        <ConceptHeader icon={BookOpen} title="개념 쏙쏙 — 업무 지시 공식" />
        <p className="text-sm text-gray-500 mb-6">좋은 프롬프트는 세 가지 블록으로 구성됩니다. 각 블록을 클릭해 보세요.</p>

        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          {blocks.map((b, i) => (
            <div key={b.id} className="flex items-center gap-2 flex-1">
              <button onClick={() => setActiveBlock(activeBlock === b.id ? null : b.id)} className={`flex-1 p-4 rounded-xl border transition-all text-left ${activeBlock === b.id ? `${b.color} text-white border-transparent` : "bg-white border-gray-200 hover:border-gray-400"}`}>
                <div className="flex items-center gap-2 mb-1">
                  <b.icon size={16} />
                  <span className="text-xs font-semibold">{b.label}</span>
                </div>
                {activeBlock === b.id && <p className="text-xs mt-2 opacity-90">{b.example}</p>}
              </button>
              {i < blocks.length - 1 && <span className="text-gray-300 hidden sm:block">+</span>}
            </div>
          ))}
        </div>

        {activeBlock && (
          <div className="bg-gray-50 rounded-xl p-4" style={{ animation: "fadeIn 0.3s ease-out" }}>
            <div className="flex items-start gap-2">
              <Lightbulb size={16} className="text-gray-400 mt-0.5 shrink-0" />
              <div className="text-sm text-gray-600">
                {activeBlock === "role" && "AI에게 전문가 역할을 부여하면 해당 분야의 어조와 전문 용어를 사용한 답변을 받을 수 있습니다. 마치 신입사원에게 '넌 지금부터 안전관리 담당자야'라고 하면 그 역할에 맞게 행동하는 것과 같습니다."}
                {activeBlock === "context" && "현재 상황과 배경을 구체적으로 알려주세요. '문제가 생겼어'보다 '폭우로 인해 154kV 송전선이 끊겨서 3개 지역이 정전됐어'라고 하면 훨씬 정확한 답변을 얻습니다."}
                {activeBlock === "format" && "원하는 출력 형태를 명확히 지정하세요. '알려줘'보다 '3문단의 안내문 형식으로', '표로 정리해서', '5단계 체크리스트로' 처럼 구체적으로 요청하면 바로 쓸 수 있는 결과물을 얻습니다."}
              </div>
            </div>
          </div>
        )}

        <div className="mt-6 p-4 bg-gray-50 rounded-xl">
          <p className="text-xs text-gray-400 mb-2">💡 조립 결과 미리보기:</p>
          <p className="text-sm text-gray-700">
            <span className="font-semibold">[역할]</span> {blocks[0].example} + <span className="font-semibold">[맥락]</span> {blocks[1].example} + <span className="font-semibold">[형식]</span> {blocks[2].example}
          </p>
          <p className="text-xs text-gray-400 mt-2">→ 이렇게 조합하면 정확하고 실용적인 결과물을 얻을 수 있습니다!</p>
        </div>
      </div>

      {/* Game */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 sm:p-8 shadow-sm">
        <GameHeader icon={Gamepad2} title="실전 게임 — 프롬프트 깎는 장인" />
        <p className="text-sm text-gray-500 mb-6">아래 블록 중 좋은 3개를 골라 슬롯에 넣으세요!</p>

        {/* Slots */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {slotLabels.map((label, i) => {
            const filled = slots[i];
            const block = allBlocks.find(b => b.id === filled);
            return (
              <div key={i} className={`p-4 rounded-xl border-2 border-dashed min-h-[80px] flex flex-col items-center justify-center text-center transition-all ${filled ? (gameSubmitted ? (block?.good ? "border-emerald-300 bg-emerald-50" : "border-red-300 bg-red-50") : "border-gray-400 bg-gray-50") : "border-gray-200"}`}>
                <span className="text-[10px] text-gray-400 mb-1">슬롯 {i + 1}: {label}</span>
                {block ? (
                  <span className="text-xs font-medium text-gray-700">{block.text}</span>
                ) : (
                  <span className="text-xs text-gray-300">비어있음</span>
                )}
              </div>
            );
          })}
        </div>

        {/* Available blocks */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-6">
          {shuffled.current.map(block => {
            const inSlot = slots.includes(block.id);
            return (
              <div key={block.id} className={`p-3 rounded-xl border text-xs transition-all ${inSlot ? "opacity-40 border-gray-100" : "border-gray-200 hover:border-gray-400 cursor-pointer"}`}>
                <p className="font-medium text-gray-700 mb-2">{block.text}</p>
                {!inSlot && !gameSubmitted && (
                  <div className="flex gap-1">
                    {[0, 1, 2].map(si => (
                      <button key={si} onClick={() => handleSlotFill(block.id, si)} className="px-2 py-1 bg-gray-100 rounded text-[10px] text-gray-500 hover:bg-gray-900 hover:text-white transition-colors">
                        슬롯{si + 1}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Result */}
        {!gameSubmitted ? (
          <button onClick={checkResult} disabled={slots.some(s => s === null)} className="px-6 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-xl disabled:opacity-30 hover:bg-gray-800 transition-all">
            제출하기
          </button>
        ) : (
          <div className="space-y-4">
            <div className={`p-5 rounded-xl border text-center ${allGood ? "bg-emerald-50 border-emerald-200" : "bg-red-50 border-red-200"}`}>
              {allGood ? (
                <>
                  <p className="text-lg font-bold mb-1">🏆 100점! 프롬프트 장인!</p>
                  <p className="text-sm text-gray-600">완벽한 프롬프트 조합입니다!</p>
                </>
              ) : (
                <>
                  <p className="text-lg font-bold mb-1">😵 AI가 혼란스러워합니다!</p>
                  <p className="text-sm text-gray-600">"대충 써줘" 같은 모호한 지시로는 좋은 결과를 얻을 수 없어요.</p>
                </>
              )}
            </div>
            <button onClick={resetGame} className="flex items-center gap-1.5 px-4 py-2 text-sm text-gray-500 hover:text-gray-800">
              <RotateCcw size={14} /> 다시 하기
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// ─── TAB 5: AI Ethics & Hallucination ────────────────
const Tab5 = () => {
  const [tempSlider, setTempSlider] = useState(30);
  const [showSecurityDemo, setShowSecurityDemo] = useState(false);
  const [securityPhase, setSecurityPhase] = useState(0);

  // Game state
  const [currentCard, setCurrentCard] = useState(0);
  const [results, setResults] = useState([]);
  const [cardAnim, setCardAnim] = useState("");

  const hallucinationExamples = [
    { temp: 20, text: "한국전력은 전력 공급을 담당하는 공기업입니다.", label: "사실" },
    { temp: 40, text: "한국전력은 1961년에 설립된 공기업입니다.", label: "사실" },
    { temp: 60, text: "한국전력은 세계 최대 규모의 전력 회사 중 하나입니다.", label: "살짝 과장" },
    { temp: 80, text: "에디슨이 1899년에 한국전력을 직접 설립했다고 합니다.", label: "🚨 환각!" },
    { temp: 95, text: "에디슨이 조선시대에 한국전력을 세워 경복궁에 전기를 공급했습니다.", label: "🚨 심한 환각!" },
  ];

  const currentHallucination = hallucinationExamples.reduce((prev, curr) =>
    Math.abs(curr.temp - tempSlider) < Math.abs(prev.temp - tempSlider) ? curr : prev
  );

  // Security demo
  const handleSecurityDemo = () => {
    setShowSecurityDemo(true);
    setSecurityPhase(0);
    setTimeout(() => setSecurityPhase(1), 800);
    setTimeout(() => setSecurityPhase(2), 1600);
  };

  // Tinder game cards
  const cards = [
    { text: "우리 본부 하반기 예산안 엑셀 요약해 줘", danger: true, reason: "사내 기밀 예산 정보가 외부로 유출될 수 있습니다." },
    { text: "파이썬으로 데이터 정렬하는 코드 짜줘", danger: false, reason: "일반적인 프로그래밍 질문으로 보안 위험이 없습니다." },
    { text: "고객 김OO의 전화번호와 주소 정리해 줘", danger: true, reason: "고객 개인정보를 외부 AI에 입력하면 개인정보보호법 위반입니다." },
    { text: "이메일 문법 교정해 줘: '회의 참석 부탁드립니다'", danger: false, reason: "일반적인 문법 교정은 보안 위험이 없습니다." },
    { text: "신규 발전소 건설 도면 분석해 줘", danger: true, reason: "미공개 인프라 도면은 국가 핵심 기밀에 해당합니다." },
    { text: "엑셀 VLOOKUP 함수 사용법 알려줘", danger: false, reason: "일반 업무 도구 사용법은 보안 위험이 없습니다." },
  ];

  const handleSwipe = (block) => {
    const card = cards[currentCard];
    const correct = block === card.danger;
    setCardAnim(block ? "swipe-left" : "swipe-right");
    setTimeout(() => {
      setResults(prev => [...prev, { correct, card }]);
      setCurrentCard(prev => prev + 1);
      setCardAnim("");
    }, 300);
  };

  const resetGame = () => { setCurrentCard(0); setResults([]); setCardAnim(""); };
  const gameScore = results.filter(r => r.correct).length;

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-2xl border border-gray-100 p-5 sm:p-8 shadow-sm">
        <ConceptHeader icon={BookOpen} title="개념 쏙쏙 — AI 주의사항" />

        {/* Hallucination */}
        <div className="mb-8">
          <h3 className="font-semibold text-gray-900 mb-1 flex items-center gap-2">
            <AlertTriangle size={16} /> 환각 (Hallucination)
          </h3>
          <p className="text-sm text-gray-500 mb-4">상상력 온도를 올려보세요. AI가 점점 그럴싸한 거짓말을 만들어냅니다.</p>

          <div className="bg-gray-50 rounded-xl p-5 space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-gray-500">
                <span>🧊 정확</span>
                <span>상상력 온도: {tempSlider}%</span>
                <span>🔥 창의적(위험)</span>
              </div>
              <input type="range" min="0" max="100" value={tempSlider} onChange={e => setTempSlider(Number(e.target.value))} className="w-full accent-gray-900" />
            </div>

            <div className={`p-4 rounded-xl border transition-all ${tempSlider > 70 ? "bg-red-50 border-red-200" : tempSlider > 50 ? "bg-amber-50 border-amber-200" : "bg-white border-gray-200"}`}>
              <div className="flex items-center gap-2 mb-2">
                <Bot size={14} className="text-gray-400" />
                <span className="text-xs text-gray-400">AI 출력:</span>
                <Badge variant={tempSlider > 70 ? "error" : tempSlider > 50 ? "warning" : "success"}>
                  {currentHallucination.label}
                </Badge>
              </div>
              <p className="text-sm text-gray-700">{currentHallucination.text}</p>
            </div>
          </div>
        </div>

        {/* Security */}
        <div>
          <h3 className="font-semibold text-gray-900 mb-1 flex items-center gap-2">
            <Shield size={16} /> 보안 위험
          </h3>
          <p className="text-sm text-gray-500 mb-4">기밀 데이터를 AI에 입력하면 어떤 일이 생기는지 확인해 보세요.</p>

          <div className="bg-gray-50 rounded-xl p-5 space-y-4">
            {!showSecurityDemo ? (
              <div className="text-center">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-lg border border-gray-200 text-sm text-gray-600 mb-4">
                  <FileText size={14} /> "2026_발전소_설계도면_v3.dwg"
                </div>
                <br />
                <button onClick={handleSecurityDemo} className="px-5 py-2.5 bg-gray-900 text-white text-sm rounded-xl hover:bg-gray-800 transition-all">
                  AI에 업로드 시뮬레이션 ⬆️
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className={`flex items-center gap-3 p-3 rounded-lg transition-all ${securityPhase >= 0 ? "bg-white border border-gray-200 opacity-100" : "opacity-0"}`}>
                  <Send size={14} className="text-gray-400" />
                  <span className="text-sm text-gray-600">파일을 AI 서버로 전송 중...</span>
                </div>
                {securityPhase >= 1 && (
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-amber-50 border border-amber-200" style={{ animation: "fadeIn 0.3s" }}>
                    <Globe size={14} className="text-amber-600" />
                    <span className="text-sm text-amber-700">⚠️ 데이터가 외부 서버(미국)에 저장됨!</span>
                  </div>
                )}
                {securityPhase >= 2 && (
                  <div className="flex items-center gap-3 p-4 rounded-lg bg-red-50 border border-red-200" style={{ animation: "fadeIn 0.3s" }}>
                    <AlertTriangle size={18} className="text-red-600" />
                    <div>
                      <p className="text-sm font-semibold text-red-700">🚨 보안 경고!</p>
                      <p className="text-xs text-red-600 mt-1">기밀 도면이 외부 서버에 영구 저장될 수 있습니다. 절대 사내 기밀을 외부 AI에 입력하지 마세요!</p>
                    </div>
                  </div>
                )}
                <button onClick={() => { setShowSecurityDemo(false); setSecurityPhase(0); }} className="text-xs text-gray-400 hover:text-gray-600">리셋</button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Game */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 sm:p-8 shadow-sm">
        <GameHeader icon={Gamepad2} title="실전 게임 — 보안관 스와이프" />
        <p className="text-sm text-gray-500 mb-6">사내 직원의 AI 사용 요청을 심사하세요. 위험하면 차단, 안전하면 허용!</p>

        {currentCard < cards.length ? (
          <div className="space-y-6">
            <div className="flex justify-between text-xs text-gray-400">
              <span>{currentCard + 1} / {cards.length}</span>
              <span>정답: {gameScore} / {results.length}</span>
            </div>

            {/* Card */}
            <div className={`relative mx-auto max-w-sm transition-all duration-300 ${cardAnim === "swipe-left" ? "-translate-x-full opacity-0 rotate-[-10deg]" : cardAnim === "swipe-right" ? "translate-x-full opacity-0 rotate-[10deg]" : ""}`}>
              <div className="p-6 bg-gray-50 rounded-2xl border border-gray-200 min-h-[160px] flex flex-col items-center justify-center text-center">
                <MessageSquare size={20} className="text-gray-400 mb-3" />
                <p className="text-sm text-gray-700 font-medium leading-relaxed">"{cards[currentCard].text}"</p>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex justify-center gap-6">
              <button onClick={() => handleSwipe(true)} className="flex flex-col items-center gap-1.5 p-4 rounded-2xl border border-red-200 bg-red-50 hover:bg-red-100 transition-all group">
                <ThumbsDown size={24} className="text-red-500 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-medium text-red-600">차단</span>
              </button>
              <button onClick={() => handleSwipe(false)} className="flex flex-col items-center gap-1.5 p-4 rounded-2xl border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 transition-all group">
                <ThumbsUp size={24} className="text-emerald-500 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-medium text-emerald-600">허용</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className={`p-5 rounded-xl border text-center ${gameScore === cards.length ? "bg-emerald-50 border-emerald-200" : "bg-amber-50 border-amber-200"}`}>
              <p className="text-2xl font-bold mb-1">{gameScore}/{cards.length}</p>
              <p className="text-sm text-gray-600">
                {gameScore === cards.length ? "🛡️ 완벽한 보안관!" : `${cards.length - gameScore}건을 놓쳤습니다. 아래에서 확인하세요.`}
              </p>
            </div>

            <div className="space-y-2">
              {results.map((r, i) => (
                <div key={i} className={`p-3 rounded-xl border text-xs ${r.correct ? "border-emerald-100 bg-emerald-50/50" : "border-red-100 bg-red-50/50"}`}>
                  <div className="flex items-center gap-2">
                    {r.correct ? <CheckCircle2 size={14} className="text-emerald-500" /> : <XCircle size={14} className="text-red-500" />}
                    <span className="text-gray-700 font-medium">"{r.card.text}"</span>
                  </div>
                  <p className="text-gray-500 mt-1 ml-6">{r.card.reason}</p>
                </div>
              ))}
            </div>

            <button onClick={resetGame} className="flex items-center gap-1.5 px-4 py-2 text-sm text-gray-500 hover:text-gray-800">
              <RotateCcw size={14} /> 다시 하기
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// ─── MAIN APP ────────────────────────────────────────
const tabs = [
  { id: "concept", label: "AI 개념과 역사", icon: Brain, component: Tab1 },
  { id: "how", label: "AI의 동작원리", icon: Cpu, component: Tab2 },
  { id: "apply", label: "AI 실무적용", icon: Zap, component: Tab3 },
  { id: "prompt", label: "AI 프롬프트 활용 꿀팁", icon: Sparkles, component: Tab4 },
  { id: "ethics", label: "AI 주의사항", icon: Shield, component: Tab5 },
];

export default function App() {
  const [activeTab, setActiveTab] = useState("concept");
  const ActiveComponent = tabs.find(t => t.id === activeTab)?.component;

  return (
    <div className="min-h-screen bg-gray-50/50" style={{ fontFamily: "'Pretendard', 'Apple SD Gothic Neo', -apple-system, sans-serif" }}>
      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes shake { 0%, 100% { transform: translateX(0); } 25% { transform: translateX(-8px); } 50% { transform: translateX(8px); } 75% { transform: translateX(-4px); } }
      `}</style>

      {/* Header */}
      <header className="bg-white border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 py-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gray-900 flex items-center justify-center">
              <Zap size={18} className="text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900 tracking-tight">AI 기초 교육</h1>
              <p className="text-xs text-gray-400">전력산업 종사자를 위한 인터랙티브 가이드</p>
            </div>
          </div>
        </div>
      </header>

      {/* Tab nav */}
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex gap-1 overflow-x-auto py-2 scrollbar-hide">
            {tabs.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${activeTab === tab.id ? "bg-gray-900 text-white" : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"}`}
                >
                  <Icon size={15} />
                  <span className="hidden sm:inline">{tab.label}</span>
                  <span className="sm:hidden">{tab.label.split(" ").pop()}</span>
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        <ActiveComponent />
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-100 bg-white mt-12">
        <div className="max-w-4xl mx-auto px-4 py-6 text-center">
          <p className="text-xs text-gray-400">AI 기초 교육 · 전력산업 종사자를 위한 인터랙티브 학습 가이드</p>
        </div>
      </footer>
    </div>
  );
}
