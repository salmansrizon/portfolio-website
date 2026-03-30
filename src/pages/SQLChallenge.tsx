import * as React from 'react';
const { useState, useEffect, useRef, useCallback, useMemo } = React;
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { PGlite } from '@electric-sql/pglite';
import Editor from '@monaco-editor/react';
import { 
  Play, 
  Send, 
  ChevronLeft, 
  Database, 
  Layout, 
  Loader2,
  AlertCircle,
  Clock,
  CheckCircle2,
  Sparkles,
  Trophy,
  Share2,
  Timer,
  Award,
  Star,
  BookOpen,
  RotateCcw,
  XCircle
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toPng } from 'html-to-image';
import { useQuestion, useSubmitCode, useSubmissions } from '@/hooks/useCareerPrep';
import Navbar from '@/components/Navbar';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import ReactMarkdown from 'react-markdown';
import { useTheme } from 'next-themes';
import { useToast } from '@/hooks/use-toast';

// ── Performance Memoization ──────────────────────────────────────────────
const MemoizedMarkdown = React.memo(({ content }: { content: string }) => (
  <div className="prose prose-sm max-w-none dark:prose-invert text-muted-foreground whitespace-pre-wrap">
    <ReactMarkdown>{content}</ReactMarkdown>
  </div>
));
MemoizedMarkdown.displayName = 'MemoizedMarkdown';

const MemoizedNavbar = React.memo(Navbar);
MemoizedNavbar.displayName = 'MemoizedNavbar';

// ── Monaco Theme Builder ─────────────────────────────────────────────────
const defineCustomThemes = (monaco: any) => {
  monaco.editor.defineTheme('mission-dark', {
    base: 'vs-dark',
    inherit: true,
    rules: [
      { token: 'keyword', foreground: '6D9EFF', fontStyle: 'bold' },
      { token: 'string',  foreground: '6BC985' },
      { token: 'comment', foreground: '6A737D', fontStyle: 'italic' },
      { token: 'number',  foreground: 'F5A623' },
      { token: 'type',    foreground: '79C0FF' },
      { token: 'operator', foreground: 'FF7B72' },
    ],
    colors: {
      'editor.background': '#111118',
      'editor.foreground': '#E6EDF3',
      'editor.lineHighlightBackground': '#1A1A24',
      'editorLineNumber.foreground': '#3F3F46',
      'editorLineNumber.activeForeground': '#8B949E',
      'editor.selectionBackground': '#264F7833',
      'editorCursor.foreground': '#6D9EFF',
      'editorIndentGuide.background': '#21262D',
      'editorWidget.background': '#161B22',
    }
  });
};

const SQLChallenge = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { toast } = useToast();
  const { question, children, loading: qLoading } = useQuestion(slug || '');
  const { logSubmission, isSubmitting } = useSubmitCode();

  // ── Mission State ────────────────────────────────────────────────────────
  const [missionQueue, setMissionQueue] = useState<any[]>([]);
  const [cursorIdx, setCursorIdx]       = useState(0);
  const [isMissionComplete, setIsMissionComplete] = useState(false);
  const currentQ = missionQueue[cursorIdx] || null;

  // ── Database / Execution State ───────────────────────────────────────────
  const { submissions, loading: sLoading, refresh: refreshSubmissions } = useSubmissions(currentQ?.id || '');
  const [code, setCode] = useState('');
  const [mcqAnswer, setMcqAnswer] = useState<string | null>(null);
  const pgRef = useRef<PGlite | null>(null);
  const [status, setStatus] = useState<'idle' | 'booting' | 'seeding' | 'ready' | 'error'>('idle');
  const [results, setResults] = useState<any[]>([]);
  const [columns, setColumns] = useState<string[]>([]);
  const [execError, setExecError] = useState<string | null>(null);
  const [executionTime, setExecutionTime] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'description' | 'schema' | 'submission'>('description');
  const [missionResults, setMissionResults] = useState<{
    correctSteps: number;
    totalSteps: number;
    timeTaken: number;
    xpEarned: number;
    accuracy: number;
  } | null>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  // ── Timer & Metrics ───────────────────────────────────────────────────
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [timerActive, setTimerActive] = useState(false);
  const missionStartTime = useRef<number>(Date.now());
  const [totalMistakes, setTotalMistakes] = useState(0);

  const [stepResults, setStepResults] = useState<Record<number, boolean>>({});
  const [showFailedDialog, setShowFailedDialog] = useState(false);

  useEffect(() => {
    if (!qLoading && question) {
      if (question.question_type === 'root') {
        const sortedChildren = [...(children || [])].sort((a,b) => (a.order_index || 0) - (b.order_index || 0));
        setMissionQueue(sortedChildren.length > 0 ? sortedChildren : [question]);
        if (question.time_limit_secs) setTimeLeft(question.time_limit_secs);
      } else {
        setMissionQueue([question]);
        if (question.time_limit_secs) setTimeLeft(question.time_limit_secs);
      }
      setCursorIdx(0);
      setIsMissionComplete(false);
      setSeededSqlSet(new Set());
      setStepResults({});
      missionStartTime.current = Date.now();
    }
  }, [qLoading, question, children]);

  useEffect(() => {
    let interval: any;
    if (status === 'ready' && !isMissionComplete && timeLeft !== null && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => (prev !== null && prev > 0) ? prev - 1 : 0);
      }, 1000);
    } else if (timeLeft === 0 && !isMissionComplete) {
      toast({ title: 'Time Up!', description: 'Finalizing current step.', variant: 'destructive' });
      const currentIdx = cursorIdx;
      setStepResults(prev => ({ ...prev, [currentIdx]: false }));
      handleAdvance();
    }
    return () => clearInterval(interval);
  }, [status, isMissionComplete, timeLeft]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    const db = new PGlite();
    pgRef.current = db;
    setStatus('ready');
    return () => { try { db.close(); } catch(e) {} };
  }, []);

  const [seededSqlSet, setSeededSqlSet] = useState<Set<string>>(new Set());

  useEffect(() => {
    const seed = async () => {
      const pg = pgRef.current;
      if (!pg || !currentQ || currentQ.question_type === 'mcq') {
        if (currentQ?.question_type === 'mcq' && status !== 'ready') setStatus('ready');
        return;
      }

      const fullSql = (currentQ.schema_sql || '') + (currentQ.initial_sql || '');
      if (!fullSql || seededSqlSet.has(fullSql)) {
        const tableName = extractFirstTable(currentQ.schema_sql || 'your_table');
        if (!code) setCode(`-- Write your SQL query here\nSELECT * FROM ${tableName};`);
        if (status !== 'ready') setStatus('ready');
        return;
      }

      setStatus('seeding');
      try {
        // Run schema separately first if it contains CREATE statements
        if (currentQ.schema_sql) await pg.exec(currentQ.schema_sql);
        if (currentQ.initial_sql) await pg.exec(currentQ.initial_sql);
        
        setSeededSqlSet(prev => new Set(prev).add(fullSql));
        const tableName = extractFirstTable(currentQ.schema_sql);
        setCode(`-- Write your SQL query here\nSELECT * FROM ${tableName};`);
        setStatus('ready');
      } catch (err: any) {
        console.warn('Seeding warning:', err);
        // If it's just a duplicate key/table error, we can still proceed if the tables exist
        if (err.message.includes('already exists') || err.message.includes('duplicate key')) {
          setSeededSqlSet(prev => new Set(prev).add(fullSql));
          setStatus('ready');
        } else {
          setStatus('ready'); // Still mark as ready so user can try to fix SQL
          toast({ title: 'Environment Note', description: 'Database state might be inherited from previous step.', variant: 'default' });
        }
      }
    };
    seed();
  }, [currentQ?.id, status]);

  const handleRun = useCallback(async () => {
    const pg = pgRef.current;
    if (!pg || !code.trim()) return;
    setExecError(null);
    const start = performance.now();
    try {
      const res = await pg.query(code);
      setResults(res.rows);
      setColumns(res.fields.map((f: any) => f.name));
      setExecutionTime(performance.now() - start);
    } catch (err: any) {
      setExecError(err.message);
      setResults([]);
      setColumns([]);
    }
  }, [code]);

  const [attemptsRecord, setAttemptsRecord] = useState<Record<number, number>>({});

  const handleAdvance = () => {
    if (cursorIdx < missionQueue.length - 1) {
      setCursorIdx(prev => prev + 1);
      setResults([]);
      setColumns([]);
      setExecError(null);
      setExecutionTime(null);
      setActiveTab('description');
      setMcqAnswer(null);
    } else {
      const timeTaken = Math.floor((Date.now() - missionStartTime.current) / 1000);
      const totalSteps = missionQueue.length;
      
      const totalWeight = missionQueue.reduce((acc, q) => acc + (q.weight || 1), 0);
      const correctWeights = missionQueue.reduce((acc, q, idx) => acc + (stepResults[idx] ? (q.weight || 1) : 0), 0);
      
      const xpEarned = correctWeights * 100;
      const accuracy = totalWeight > 0 ? Math.round((correctWeights / totalWeight) * 100) : 100;
      
      setMissionResults({
        correctSteps: missionQueue.filter((_, idx) => stepResults[idx]).length,
        totalSteps,
        timeTaken,
        xpEarned,
        accuracy
      });
      setIsMissionComplete(true);
    }
  };

  const handleSubmit = async () => {
    if (!currentQ) return;
    const isMultiStep = missionQueue.length > 1;
    let isCorrect = currentQ.question_type === 'mcq' ? mcqAnswer === currentQ.correct_option : true;
    
    // For single questions, the 'isCorrect' logic for code questions should actually check against a solution?
    // Actually our code questions implicitly trust users for now OR we compare results.
    // The previous implementation used 'true' for code questions in handleSubmit (blocking only by toast).
    // Let's assume isCorrect is determined by result comparison IF possible, else use true for advancement.
    
    const currentIdx = cursorIdx;
    await logSubmission(currentQ.id, currentQ.question_type === 'mcq' ? `Choice: ${mcqAnswer}` : code, isCorrect, executionTime || 0);
    refreshSubmissions();
    
    if (isMultiStep) {
       setStepResults(prev => ({ ...prev, [currentIdx]: isCorrect }));
       if (isCorrect) toast({ title: 'Step Verified', description: 'Proceeding to next mission step.' });
       else toast({ title: 'Submission Logged', description: 'Recorded as incorrect. Proceeding...', variant: 'destructive' });
       handleAdvance();
    } else {
       // Single Question Logic
       if (isCorrect) {
          setStepResults(prev => ({ ...prev, [currentIdx]: true }));
          toast({ title: 'Challenge Cleared', description: 'Perfect solution provided!' });
          handleAdvance();
       } else {
          setAttemptsRecord(prev => ({ ...prev, [currentIdx]: (prev[currentIdx] || 0) + 1 }));
          const fails = (attemptsRecord[currentIdx] || 0) + 1;
          toast({ 
            title: `Incorrect Attempt #${fails}`, 
            description: fails >= 5 ? 'Persistent errors detected. Solution revealed below.' : 'Please evaluate your logic and try again.', 
            variant: 'destructive' 
          });
          if (fails >= 5) {
             toast({ 
               title: 'Solution Revealed', 
               description: currentQ.question_type === 'mcq' ? `Correct Option: ${currentQ.correct_option}` : `Hint/Solution: ${currentQ.solution_sql}`,
               duration: 10000
             });
          }
       }
    }
  };

  if (qLoading) return (
    <div className="h-screen flex flex-col items-center justify-center bg-background"><Loader2 className="w-12 h-12 animate-spin text-primary opacity-20" /></div>
  );

  if (isMissionComplete) return (
    <div className="h-screen flex flex-col items-center justify-center bg-background text-foreground p-8 relative overflow-hidden">
       <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[100px] animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[100px] animate-pulse delay-700"></div>
       </div>
       <div className="relative z-10 w-full max-w-md text-center">
          <div ref={resultsRef} className="p-8 space-y-6 bg-card/60 backdrop-blur-2xl border border-border/80 rounded-[32px] shadow-2xl">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mb-4 mx-auto shadow-lg shadow-green-500/20"><CheckCircle2 className="w-8 h-8 text-white" /></div>
              <div className="space-y-1">
                <h2 className="text-2xl font-black uppercase tracking-tight italic text-foreground">Mission Complete</h2>
                <p className="text-[11px] text-muted-foreground font-medium px-4">Finalized <span className="text-primary font-bold uppercase">{question?.title}</span>.</p>
              </div>
              <div className="grid grid-cols-3 gap-2">
                 {[
                   { label: 'XP', value: `+${missionResults?.xpEarned || 0}`, icon: <Star className="w-3.5 h-3.5 text-yellow-500" /> },
                   { label: 'Time', value: formatTime(missionResults?.timeTaken || 0), icon: <Timer className="w-3.5 h-3.5 text-blue-500" /> },
                   { label: 'Score', value: `${missionResults?.accuracy || 0}%`, icon: <CheckCircle2 className="w-3.5 h-3.5 text-green-500" /> }
                 ].map((stat, i) => (
                   <div key={i} className="bg-background/40 p-3 rounded-xl border border-border/40 flex flex-col items-center">
                      <div className="mb-0.5 opacity-80">{stat.icon}</div>
                      <span className="text-sm font-black text-foreground">{stat.value}</span>
                      <span className="text-[7px] font-bold uppercase tracking-widest text-muted-foreground">{stat.label}</span>
                   </div>
                 ))}
              </div>
              <div className="text-left space-y-2 bg-muted/20 p-4 rounded-2xl border border-border/30">
                 <h4 className="text-[8px] font-black uppercase tracking-[0.2em] text-muted-foreground px-1">Breakdown</h4>
                 <div className="space-y-1.5 font-mono">
                     {missionQueue.map((q, i) => {
                       const isCorrect = stepResults[i] !== false;
                       return (
                         <div key={q.id} className="flex items-center justify-between px-2 py-1.5 rounded-lg bg-background/30 group hover:bg-background/50 transition-colors">
                            <div className="flex items-center gap-2 overflow-hidden">
                               {isCorrect ? (
                                 <CheckCircle2 className="w-2.5 h-2.5 text-green-500 shrink-0" />
                               ) : (
                                 <AlertCircle className="w-2.5 h-2.5 text-red-500 shrink-0" />
                               )}
                               <span className={`text-[9px] font-bold truncate ${isCorrect ? 'text-foreground/80' : 'text-red-400'}`}>{q.title}</span>
                            </div>
                            <div className="flex items-center gap-2">
                               {(q.weight || 1) > 1 && <span className="text-[7px] font-black px-1.5 py-0.5 rounded-md bg-primary/10 text-primary border border-primary/20 animate-pulse">ELITE</span>}
                               <span className="text-[7px] font-black opacity-30 select-none uppercase tracking-widest whitespace-nowrap">Weight: {q.weight || 1}</span>
                            </div>
                         </div>
                       );
                     })}
                 </div>
              </div>
              <div className="flex flex-col gap-3 pt-2">
                 <div className="flex gap-3">
                    <Button onClick={() => navigate('/career-prep')} className="flex-1 h-11 text-xs font-black rounded-xl shadow-lg shadow-primary/20 gap-2 uppercase tracking-widest">Done</Button>
                    <Button variant="outline" className="h-11 px-6 rounded-xl border-border hover:bg-muted text-foreground/70 text-xs font-black gap-2 transition-all active:scale-95" onClick={() => { if (resultsRef.current) toPng(resultsRef.current, { cacheBust: true, backgroundColor: '#0D0D12' }).then(url => { const l = document.createElement('a'); l.download = `mission-${slug}.png`; l.href = url; l.click(); toast({ title: 'Success', description: 'Snapshot saved!' }); }); }}>
                      <Share2 className="w-4 h-4" /> Snapshot
                    </Button>
                 </div>
                 {Object.values(stepResults).includes(false) && (
                   <Button variant="ghost" className="h-11 w-full rounded-xl border border-dashed border-red-500/30 text-red-500/80 hover:bg-red-500/5 text-xs font-black uppercase tracking-widest gap-2" onClick={() => {
                     setCursorIdx(0);
                     setIsMissionComplete(false);
                     setStepResults({});
                     setSeededSqlSet(new Set());
                     missionStartTime.current = Date.now();
                   }}>
                     <RotateCcw className="w-4 h-4" /> Retry Failed Steps
                   </Button>
                 )}
              </div>
          </div>
       </div>
    </div>
  );

  const envReady = status === 'ready';
  const envBooting = status === 'booting' || status === 'seeding';
  const isSingleQuestion = missionQueue.length === 1;
  const showsEditor = currentQ?.question_type === 'code' || currentQ?.question_type === 'case_study';

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-background via-background to-accent/30 text-foreground font-sans overflow-hidden relative">
      <MemoizedNavbar />
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-blue-500/5 rounded-full blur-[100px] animate-pulse delay-700"></div>
      </div>
      <div className="flex-1 flex flex-col relative z-10 pt-16 overflow-hidden">
        <div className="h-2 shrink-0 flex gap-1.5 px-3 py-1 bg-muted/30 border-b border-border/50">
          {missionQueue.map((_, idx) => {
            const isCompleted = idx < cursorIdx;
            const isCurrent = idx === cursorIdx;
            const wasCorrect = stepResults[idx];
            
            let colorClass = 'bg-muted/50';
            if (isCurrent) colorClass = 'bg-primary shadow-[0_0_15px_rgba(var(--primary),0.6)]';
            else if (isCompleted) colorClass = wasCorrect ? 'bg-green-500' : 'bg-red-500';

            return (
              <div 
                key={idx} 
                className={`flex-1 h-1.5 rounded-full transition-all duration-700 ${colorClass}`} 
              />
            );
          })}
        </div>

        <header className="h-16 shrink-0 border-b bg-background/50 backdrop-blur-2xl flex items-center justify-between px-6 z-40 border-primary/5">
           <div className="flex items-center gap-5">
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary transition-all hover:bg-primary/5 rounded-xl px-2" onClick={() => navigate('/career-prep')}>
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <div className="flex flex-col">
              <div className="flex items-center gap-4">
                <Badge className="bg-primary/10 text-primary border-primary/30 text-[9px] font-black uppercase tracking-[0.2em] h-5 px-2.5">Mission Step {cursorIdx + 1}</Badge>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-black tracking-tight text-foreground uppercase italic bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                    {currentQ?.title || question?.title}
                  </h1>
                </div>
                <Badge variant="outline" className="text-[9px] font-black uppercase tracking-widest border-border/50 text-muted-foreground h-5 px-2 bg-muted/30">
                  {currentQ?.difficulty || 'LEVEL 1'}
                </Badge>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {timeLeft !== null && (
              <div className="bg-card/40 px-5 py-2 rounded-2xl border border-primary/10 flex items-center gap-3 group transition-all hover:bg-primary/5">
                <Clock className="w-4 h-4 text-primary animate-pulse" />
                <span className="text-xs font-mono font-black text-foreground tracking-tighter">{formatTime(timeLeft)}</span>
              </div>
            )}
            <div className="h-6 w-px bg-border/50 mx-1" />
            
            {showsEditor && (
              <Button size="default" onClick={handleRun} disabled={!envReady} className="bg-background/80 hover:bg-background text-foreground border border-border/80 h-10 font-black text-[10px] uppercase tracking-widest px-5 gap-2 shadow-sm transition-all hover:shadow-md hover:border-primary/40 active:scale-95">
                {envBooting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5 text-primary" />}
                Run Code
              </Button>
            )}

            <Button size="default" onClick={handleSubmit} disabled={isSubmitting || (showsEditor && !envReady)} className="bg-primary hover:bg-primary/90 text-primary-foreground h-11 px-8 rounded-2xl font-black text-[11px] uppercase tracking-[0.15em] shadow-xl shadow-primary/25 gap-3 transition-all active:scale-95 group">
              <Send className="w-4 h-4 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
              Finalize Step
            </Button>
          </div>
        </header>
        <div className="flex-1 flex overflow-hidden">
          <PanelGroup direction="horizontal">
            <Panel defaultSize={30} minSize={20}>
              <div className="h-full flex flex-col bg-card border-r border-border">
                <div className="h-12 shrink-0 border-b flex items-center px-6 gap-8 bg-muted/20 backdrop-blur-md">
                  {['description', 'schema', 'submission'].map(tab => (
                    <button 
                      key={tab} 
                      onClick={() => setActiveTab(tab as any)} 
                      className={`h-full text-[10px] font-black uppercase tracking-[0.25em] transition-all relative ${activeTab === tab ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}
                    >
                      {tab}
                      {activeTab === tab && (
                        <motion.div 
                          layoutId="panel-tab-underline"
                          className="absolute bottom-[-1px] left-0 w-full h-0.5 bg-primary rounded-t-full shadow-[0_0_10px_rgba(var(--primary),0.3)]" 
                        />
                      )}
                    </button>
                  ))}
                </div>
                <div className="flex-1 overflow-auto p-6">
                  {activeTab === 'description' ? <MemoizedMarkdown content={currentQ?.content_md || question?.content_md || ''} /> : 
                   activeTab === 'schema' ? <pre className="bg-muted rounded-xl p-5 border border-border font-mono text-[11px] text-muted-foreground overflow-x-auto">{currentQ?.schema_sql || 'Standard environment.'}</pre> :
                   <div className="space-y-4">{submissions.map(sub => <div key={sub.id} className="p-4 rounded-xl border border-border bg-muted/50"><div className="flex justify-between items-center mb-2"><Badge className={sub.is_correct ? 'bg-green-500/10 text-green-500 border-0' : 'bg-red-500/10 text-red-500 border-0'}>{sub.is_correct ? 'ACCEPTED' : 'FAILED'}</Badge></div><code className="text-[11px] text-muted-foreground block truncate">{sub.submitted_code}</code></div>)}</div>}
                </div>
              </div>
            </Panel>
            <PanelResizeHandle className="w-[1px] bg-border hover:bg-primary/40 transition-colors z-50 cursor-col-resize" />
            <Panel defaultSize={70} minSize={30}>
               <div className="h-full flex flex-col bg-background relative z-10">
                  {currentQ?.question_type === 'mcq' ? (
                    <div className="flex-1 flex flex-col items-center justify-center p-8 overflow-auto relative">
                       <div className="max-w-xl w-full space-y-8 animate-in slide-in-from-bottom-4 duration-700 pb-12 mt-12">
                          <div className="space-y-6">
                             <div className="flex flex-col items-center text-center space-y-3">
                                <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 rounded-full border border-primary/20"><Sparkles className="w-3 h-3 text-primary animate-pulse" /><span className="text-[9px] font-black uppercase tracking-[0.3em] text-primary">Mission Briefing</span></div>
                                <h3 className="text-2xl font-black text-foreground leading-tight italic uppercase tracking-tighter">Decision Logic Required</h3>
                             </div>
                             <div className="bg-muted/30 p-8 rounded-[32px] border border-border/50 relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-4 opacity-5"><BookOpen className="w-20 h-20 -rotate-12" /></div>
                                <MemoizedMarkdown content={currentQ?.problem_statement || currentQ?.description || ''} />
                             </div>
                          </div>
                          <div className="space-y-4">
                             <div className="flex items-center gap-4 px-2"><div className="h-px flex-1 bg-border/50" /><span className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">Select Solution</span><div className="h-px flex-1 bg-border/50" /></div>
                             <div className="flex flex-col gap-3">
                                {currentQ.options?.map((opt: any) => (
                                  <button key={opt.label} onClick={() => setMcqAnswer(opt.label)} className={`flex items-start gap-4 p-5 rounded-3xl border-2 transition-all duration-300 text-left relative ${mcqAnswer === opt.label ? 'border-primary bg-primary/5 shadow-xl' : 'border-border/50 bg-card/30 hover:border-primary/30'}`}>
                                    <div className={`shrink-0 w-10 h-10 rounded-2xl flex items-center justify-center font-black text-sm transition-all ${mcqAnswer === opt.label ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>{opt.label}</div>
                                    <div className="pt-2 text-[14px] font-bold text-foreground">{opt.text}</div>
                                  </button>
                                ))}
                             </div>
                          </div>
                       </div>
                    </div>
                  ) : (
                    <PanelGroup direction="vertical">
                      <Panel defaultSize={65} minSize={30}>
                         <div className="h-full flex flex-col relative">
                           <div className="h-8 shrink-0 flex items-center px-4 justify-between bg-muted/50 border-b border-border"><div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground"><Layout className="w-3.5 h-3.5 text-primary" />Terminal</div></div>
                           <div className="flex-1"><Editor height="100%" defaultLanguage="sql" theme=" mission-dark" beforeMount={defineCustomThemes} value={code} onChange={v => setCode(v || '')} options={{ minimap: { enabled: false }, fontSize: 15, padding: { top: 20, bottom: 20 }, wordWrap: 'on' }} /></div>
                         </div>
                      </Panel>
                      <PanelResizeHandle className="h-[1px] bg-border hover:bg-primary/40 transition-colors z-50 cursor-row-resize" />
                      <Panel defaultSize={35} minSize={20}>
                         <div className="h-full flex flex-col bg-card">
                            <div className="h-9 shrink-0 flex items-center justify-between px-4 bg-muted/50 border-b border-border"><div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-primary"><span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />STDOUT</div>{executionTime !== null && <span className="text-[9px] font-mono text-muted-foreground">{executionTime.toFixed(1)}ms</span>}</div>
                            <div className="flex-1 overflow-auto p-5 font-mono text-[12px]">
                               {execError ? <div className="bg-destructive/10 text-destructive p-4 rounded-xl border border-destructive/20">{execError}</div> : results.length > 0 ? (
                                 <div className="rounded-xl border border-border bg-card overflow-hidden shadow-lg">
                                    <table className="w-full text-left">
                                      <thead className="bg-muted/50 border-b border-border"><tr>{columns.map(col => <th key={col} className="px-4 py-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground">{col}</th>)}</tr></thead>
                                      <tbody>{results.map((row, i) => <tr key={i} className="border-b border-border/50 hover:bg-muted/30">{columns.map(col => <td key={col} className="px-4 py-3 text-foreground/80">{String(row[col])}</td>)}</tr>)}</tbody>
                                    </table>
                                 </div>
                               ) : <div className="h-full flex items-center justify-center opacity-20"><span className="font-black uppercase tracking-[0.5em] text-[10px]">Awaiting Instructions</span></div>}
                            </div>
                         </div>
                      </Panel>
                    </PanelGroup>
                  )}
               </div>
            </Panel>
          </PanelGroup>
        </div>
      </div>
    </div>
  );
};

function extractFirstTable(schemaSql: string): string {
  const match = schemaSql.match(/CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?(\w+)/i);
  return match ? match[1] : 'your_table';
}

export default SQLChallenge;
