import { useState, useEffect } from 'react';

// ── MissionRunner ────────────────────────────────────────────────────────────
// Internal module: manages mission queue state (multiple questions in a case study).
// Used by SQLChallenge.tsx.

export interface MissionState {
  missionQueue: any[];
  cursorIdx: number;
  isMissionComplete: boolean;
  currentQuestion: any | null;
}

export function useMissionRunner(question: any, children: any[]) {
  const [missionQueue, setMissionQueue] = useState<any[]>([]);
  const [cursorIdx, setCursorIdx] = useState(0);
  const [isMissionComplete, setIsMissionComplete] = useState(false);

  // Initialize mission queue when question loads
  useEffect(() => {
    if (!question) return;

    if (question.question_type === 'root') {
      // Root case study: use children as mission queue
      const sortedChildren = [...(children || [])].sort((a, b) => (a.order_index || 0) - (b.order_index || 0));
      setMissionQueue(sortedChildren.length > 0 ? sortedChildren : [question]);
    } else {
      // Single question (not a case study)
      setMissionQueue([question]);
    }
    setCursorIdx(0);
    setIsMissionComplete(false);
  }, [question, children]);

  const currentQuestion = missionQueue[cursorIdx] || null;

  const advanceMission = () => {
    if (cursorIdx < missionQueue.length - 1) {
      setCursorIdx(prev => prev + 1);
      return false; // not complete
    } else {
      setIsMissionComplete(true);
      return true; // mission complete
    }
  };

  const resetMission = () => {
    setCursorIdx(0);
    setIsMissionComplete(false);
  };

  return {
    missionQueue,
    cursorIdx,
    isMissionComplete,
    currentQuestion,
    advanceMission,
    resetMission,
  };
}
