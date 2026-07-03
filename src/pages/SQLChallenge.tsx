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
  XCircle,
  Info,
  History
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
import remarkGfm from 'remark-gfm';
import { useTheme } from 'next-themes';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';

// ── Performance Memoization ──────────────────────────────────────────────
const MemoizedMarkdown = React.memo(({ content }: { content: string }) => (
  <div className="prose prose-sm max-w-none dark:prose-invert prose-code:before:content-none prose-code:after:content-none prose-pre:bg-muted prose-pre:border prose-pre:border-border prose-pre:rounded-xl prose-table:text-sm prose-th:bg-muted/50 prose-th:p-3 prose-td:p-3 prose-h1:text-xl prose-h1:font-black prose-h2:text-lg prose-h2:font-black prose-h3:text-base prose-h3:font-bold prose-strong:text-foreground prose-headings:text-foreground prose-a:text-primary text-muted-foreground whitespace-pre-wrap leading-relaxed [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
    <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
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
  const isMobile = useIsMobile();
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
  const [failCount, setFailCount] = useState<Record<number, number>>({});

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
    const pg = pgRef.current;
    const isMultiStep = missionQueue.length > 1;
    let isCorrect = false;

    if (currentQ.question_type === 'mcq') {
      isCorrect = mcqAnswer === currentQ.correct_option;
    } else if (pg && currentQ.solution_sql) {
      // Validate by comparing user query results with solution query results
      try {
        const userRes = await pg.query(code);
        const solRes = await pg.query(currentQ.solution_sql);
        // Compare stringified sorted results
        const normalize = (rows: any[]) => JSON.stringify(rows.map(r => JSON.stringify(Object.values(r))).sort());
        isCorrect = normalize(userRes.rows) === normalize(solRes.rows);
      } catch {
        isCorrect = false;
      }
    }

    const currentIdx = cursorIdx;

    if (isCorrect) {
      // Log submission only on correct answer
      await logSubmission(currentQ.id, currentQ.question_type === 'mcq' ? `Choice: ${mcqAnswer}` : code, true, executionTime || 0);
      refreshSubmissions();
      setStepResults(prev => ({ ...prev, [currentIdx]: true }));
      
      if (isMultiStep) {
        toast({ title: 'Step Verified', description: 'Proceeding to next mission step.' });
        handleAdvance();
      } else {
        toast({ title: 'Challenge Cleared', description: 'Perfect solution provided!' });
        handleAdvance();
      }
    } else {
      // Increment fail count and show Mission Failed dialog
      setFailCount(prev => ({ ...prev, [currentIdx]: (prev[currentIdx] || 0) + 1 }));
      setShowFailedDialog(true);
    }
  };

  if (qLoading) return (
    <div className="h-screen flex flex-col items-center justify-center bg-background"><Loader2 className="w-12 h-12 animate-spin text-primary opacity-20" /></div>
  );

  if (isMissionComplete) return (
    <div className="h-screen flex flex-col items-center justify-center bg-background text-foreground p-8 relative overflow-hidden">
       <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[100px] animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[100px] animate-pulse delay-700"></div>
       </div>
       <div className="relative z-10 w-full max-w-md text-center">
          <div ref={resultsRef} className="p-8 space-y-6 bg-card/60 backdrop-blur-2xl border border-border/80 rounded-[32px] shadow-2xl">
              <div className="w-16 h-16 bg-gradient-to-br from-success to-emerald-600 rounded-2xl flex items-center justify-center mb-4 mx-auto shadow-lg shadow-success/20"><CheckCircle2 className="w-8 h-8 text-white" /></div>
              <div className="space-y-1">
                <h2 className="text-2xl font-black uppercase tracking-tight italic text-foreground">Mission Complete</h2>
                <p className="text-[11px] text-muted-foreground font-medium px-4">Finalized <span className="text-primary font-bold uppercase">{question?.title}</span>.</p>
              </div>
              <div className="grid grid-cols-3 gap-2">
                 {[
                   { label: 'XP', value: `+${missionResults?.xpEarned || 0}`, icon: <Star className="w-3.5 h-3.5 text-warning" /> },
                   { label: 'Time', value: formatTime(missionResults?.timeTaken || 0), icon: <Timer className="w-3.5 h-3.5 text-primary" /> },
                   { label: 'Score', value: `${missionResults?.accuracy || 0}%`, icon: <CheckCircle2 className="w-3.5 h-3.5 text-success" /> }
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
                                 <CheckCircle2 className="w-2.5 h-2.5 text-success shrink-0" />
                               ) : (
                                 <AlertCircle className="w-2.5 h-2.5 text-danger shrink-0" />
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
                   <Button variant="ghost" className="h-11 w-full rounded-xl border border-dashed border-danger/30 text-danger/80 hover:bg-danger/5 text-xs font-black uppercase tracking-widest gap-2" onClick={() => {
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
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-primary/5 rounded-full blur-[100px] animate-pulse delay-700"></div>
      </div>
      <div className="flex-1 flex flex-col relative z-10 pt-16 overflow-hidden">
        <div className="h-2 shrink-0 flex gap-1.5 px-3 py-1 bg-muted/30 border-b border-border/50">
          {missionQueue.map((_, idx) => {
            const isCompleted = idx < cursorIdx;
            const isCurrent = idx === cursorIdx;
            const wasCorrect = stepResults[idx];
            
            let colorClass = 'bg-muted/50';
            if (isCurrent) colorClass = 'bg-primary shadow-[0_0_15px_rgba(var(--primary),0.6)]';
            else if (isCompleted) colorClass = wasCorrect ? 'bg-success' : 'bg-danger';

            return (
              <div 
                key={idx} 
                className={`flex-1 h-1.5 rounded-full transition-all duration-700 ${colorClass}`} 
              />
            );
          })}
        </div>

        <header className="h-16 shrink-0 border-b bg-background/50 backdrop-blur-2xl flex items-center justify-between px-6 z-40 border-primary/5">
           <div className="flex items-center gap-2 md:gap-5 min-w-0">
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary transition-all hover:bg-primary/5 rounded-xl px-1 md:px-2 shrink-0" onClick={() => navigate('/career-prep')}>
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-2 md:gap-4 overflow-hidden">
                <Badge className="hidden sm:inline-flex bg-primary/10 text-primary border-primary/30 text-[9px] font-black uppercase tracking-[0.2em] h-5 px-2.5 shrink-0">Mission Step {cursorIdx + 1}</Badge>
                <div className="flex items-center gap-2 min-w-0">
                  <h1 className="text-sm md:text-xl font-black tracking-tight text-foreground uppercase italic bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent truncate pr-2">
                    {currentQ?.title || question?.title}
                  </h1>
                </div>
                {!isMobile && (
                  <Badge variant="outline" className="text-[9px] font-black uppercase tracking-widest border-border/50 text-muted-foreground h-5 px-2 bg-muted/30 shrink-0">
                    {currentQ?.difficulty || 'LEVEL 1'}
                  </Badge>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 md:gap-4 shrink-0">
            {timeLeft !== null && (
              <div className="hidden sm:flex bg-card/40 px-3 md:px-5 py-1.5 md:py-2 rounded-xl md:rounded-2xl border border-primary/10 items-center gap-2 group transition-all hover:bg-primary/5">
                <Clock className="w-3.5 h-3.5 text-primary animate-pulse" />
                <span className="text-[10px] md:text-xs font-mono font-black text-foreground tracking-tighter">{formatTime(timeLeft)}</span>
              </div>
            )}
            
            {showsEditor && (
              <Button size="sm" onClick={handleRun} disabled={!envReady} className="bg-primary/10 hover:bg-primary/20 text-primary h-9 px-3 rounded-xl font-black text-[10px] uppercase gap-2 border border-primary/20 transition-all active:scale-95">
                {envBooting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" fill="currentColor" />}
                <span>Run</span>
              </Button>
            )}

            <Button size="sm" onClick={handleSubmit} disabled={isSubmitting || (showsEditor && !envReady)} className="bg-primary hover:bg-primary/90 text-primary-foreground h-9 px-4 rounded-xl font-black text-[10px] uppercase gap-2 shadow-lg shadow-primary/20 transition-all active:scale-95 group">
              <Send className="w-3.5 h-3.5" />
              <span>Submit</span>
            </Button>
          </div>
        </header>
        <div className="flex-1 flex overflow-hidden">
          <PanelGroup direction={isMobile ? "vertical" : "horizontal"}>
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
                    <div className="space-y-6 p-4">
                      <div className="bg-muted/40 rounded-2xl border border-border/60 p-6 space-y-3">
                        <div className="flex items-center gap-2">
                          <Info className="w-4 h-4 text-primary" />
                          <span className="text-[10px] font-black uppercase tracking-[0.25em] text-foreground">Submission Policy</span>
                        </div>
                        <div className="text-[12px] text-muted-foreground leading-relaxed space-y-2">
                          <p>Your query will be validated by executing it against our test database and comparing the result set with the expected solution. Both result sets are sorted and stringified before comparison — <strong className="text-foreground">row order does not matter</strong>.</p>
                          <ul className="list-disc pl-5 space-y-1">
                            <li>Each failed attempt reveals a progressive hint (if available).</li>
                            <li>The full solution is revealed after 5 failed attempts.</li>
                            <li>Only <strong className="text-foreground">correct</strong> submissions are recorded — failed attempts do not count toward your XP.</li>
                            <li>Your output must match the expected columns and data exactly.</li>
                          </ul>
                        </div>
                      </div>
                      {submissions.length > 0 && (
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <History className="w-3.5 h-3.5 text-muted-foreground" />
                            <span className="text-[10px] font-black uppercase tracking-[0.25em] text-muted-foreground">Submission History ({submissions.length})</span>
                          </div>
                          {submissions.map(sub => (
                            <div key={sub.id} className="p-4 rounded-xl border border-border bg-muted/30 hover:bg-muted/50 transition-colors">
                              <div className="flex justify-between items-center mb-3">
                                <Badge className={sub.is_correct ? 'bg-success/10 text-success border-0' : 'bg-danger/10 text-danger border-0'}>{sub.is_correct ? 'ACCEPTED' : 'FAILED'}</Badge>
                                <span className="text-[9px] font-mono text-muted-foreground">{new Date(sub.created_at).toLocaleString()}</span>
                              </div>
                              <pre className="text-[11px] font-mono text-foreground/80 bg-muted/50 p-3 rounded-lg border border-border/50 overflow-x-auto whitespace-pre-wrap">{sub.submitted_code}</pre>
                            </div>
                          ))}
                        </div>
                      )}
                      {submissions.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-12 text-muted-foreground gap-2">
                          <Send className="w-8 h-8 opacity-20" />
                          <p className="text-[11px] font-medium">No submissions yet for this question.</p>
                        </div>
                      )}
                    </div>}
                </div>
              </div>
            </Panel>
            <PanelResizeHandle className={isMobile ? "h-1 bg-border/20" : "w-[1px] bg-border hover:bg-primary/40 transition-colors z-50 cursor-col-resize"} />
            <Panel defaultSize={isMobile ? 40 : 30} minSize={isMobile ? 20 : 20}>
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
{currentQ.options?.map((opt: any, idx: number) => {
                                   const optionLabel = opt.label || String.fromCharCode(65 + idx);
                                   return (
                                   <button key={`${currentQ.id}-${idx}`} onClick={() => setMcqAnswer(optionLabel)} className={`flex items-start gap-4 p-5 rounded-3xl border-2 transition-all duration-300 text-left relative ${mcqAnswer === optionLabel ? 'border-primary bg-primary/5 shadow-xl' : 'border-border/50 bg-card/30 hover:border-primary/30'}`}>
                                     <div className={`shrink-0 w-10 h-10 rounded-2xl flex items-center justify-center font-black text-sm transition-all ${mcqAnswer === optionLabel ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>{optionLabel}</div>
                                     <div className="pt-2 text-[14px] font-bold text-foreground">{opt.text}</div>
                                   </button>
                                   );
                                 })}
                             </div>
                          </div>
                       </div>
                    </div>
                  ) : (
                    <PanelGroup direction="vertical">
                      <Panel defaultSize={65} minSize={30}>
                         <div className="h-full flex flex-col relative">
                           <div className="h-8 shrink-0 flex items-center px-4 justify-between bg-muted/50 border-b border-border">
                             <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground"><Layout className="w-3.5 h-3.5 text-primary" />Terminal</div>
                             <Button size="sm" onClick={handleRun} disabled={!envReady} variant="ghost" className="h-6 px-3 text-[10px] font-black uppercase tracking-widest gap-1.5 text-primary hover:bg-primary/10 rounded-lg">
                               {envBooting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Play className="w-3 h-3" fill="currentColor" />}
                               Run
                             </Button>
                           </div>
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
      {/* Mission Failed Dialog */}
      <Dialog open={showFailedDialog} onOpenChange={setShowFailedDialog}>
        <DialogContent className="sm:max-w-md bg-card border-destructive/30">
          <DialogHeader className="items-center text-center">
            <div className="w-16 h-16 bg-destructive/10 rounded-2xl flex items-center justify-center mb-3 mx-auto border border-destructive/20">
              <XCircle className="w-8 h-8 text-destructive" />
            </div>
            <DialogTitle className="text-2xl font-black uppercase tracking-tight italic text-destructive">
              Mission Failed
            </DialogTitle>
            <DialogDescription className="text-muted-foreground text-sm">
              Your solution doesn't match the expected output. Review your query and try again — no XP or attempts are recorded for failed submissions.
            </DialogDescription>
          </DialogHeader>

          {/* Progressive Hints */}
          {(() => {
            const fails = failCount[cursorIdx] || 0;
            const hints = currentQ?.hints || [];
            const revealedCount = Math.min(fails, hints.length);
            const nextHintAt = revealedCount < hints.length ? revealedCount + 1 : null;

            if (hints.length === 0 && fails >= 3) {
              // No hints available, reveal solution after 5 fails
              return fails >= 5 && currentQ?.solution_sql ? (
                <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 space-y-2">
                  <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.2em] text-primary">
                    <Sparkles className="w-3 h-3" /> Solution Revealed
                  </div>
                  <pre className="text-xs font-mono text-foreground/80 whitespace-pre-wrap bg-muted/50 p-3 rounded-lg border border-border/50">
                    {currentQ.question_type === 'mcq' ? `Correct: ${currentQ.correct_option}` : currentQ.solution_sql}
                  </pre>
                </div>
              ) : (
                <p className="text-center text-[10px] text-muted-foreground font-medium">
                  {fails >= 3 ? `No hints available. Solution reveals after ${5 - fails} more attempt${5 - fails !== 1 ? 's' : ''}.` : ''}
                </p>
              );
            }

            return revealedCount > 0 ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground px-1">
                  <AlertCircle className="w-3 h-3 text-warning" />
                  {revealedCount}/{hints.length} Hint{revealedCount !== 1 ? 's' : ''} Unlocked
                </div>
                <div className="space-y-2">
                  {hints.slice(0, revealedCount).map((hint: string, i: number) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="bg-warning/5 border border-warning/20 rounded-xl p-3 flex items-start gap-3"
                    >
                      <span className="shrink-0 w-6 h-6 rounded-lg bg-warning/10 text-warning flex items-center justify-center text-[10px] font-black">{i + 1}</span>
                      <p className="text-sm text-foreground/80 pt-0.5">{hint}</p>
                    </motion.div>
                  ))}
                </div>
                {nextHintAt && (
                  <p className="text-center text-[10px] text-muted-foreground font-medium">
                    Next hint unlocks after {nextHintAt} more failed attempt{nextHintAt !== 1 ? 's' : ''}
                  </p>
                )}
                {revealedCount >= hints.length && fails >= hints.length + 2 && currentQ?.solution_sql && (
                  <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 space-y-2 mt-2">
                    <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.2em] text-primary">
                      <Sparkles className="w-3 h-3" /> Solution Revealed
                    </div>
                    <pre className="text-xs font-mono text-foreground/80 whitespace-pre-wrap bg-muted/50 p-3 rounded-lg border border-border/50">
                      {currentQ.question_type === 'mcq' ? `Correct: ${currentQ.correct_option}` : currentQ.solution_sql}
                    </pre>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-center text-[10px] text-muted-foreground font-medium">
                💡 Hint unlocks after 1 more failed attempt
              </p>
            );
          })()}

          <div className="flex flex-col gap-3 pt-2">
            <Button
              onClick={() => setShowFailedDialog(false)}
              className="w-full h-11 rounded-xl font-black text-xs uppercase tracking-widest gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Retry
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

function extractFirstTable(schemaSql: string): string {
  const match = schemaSql.match(/CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?(\w+)/i);
  return match ? match[1] : 'your_table';
}

export default SQLChallenge;
