import { useState } from 'react';
import { toPng } from 'html-to-image';

// ── ResultRenderer ────────────────────────────────────────────────────────────
// Internal module: handles result display, share-to-PNG, and XP calculation.
// Used by SQLChallenge.tsx.

export interface MissionResults {
  correctSteps: number;
  totalSteps: number;
  timeTaken: number;
  xpEarned: number;
  accuracy: number;
}

export function useResultRenderer() {
  const [missionResults, setMissionResults] = useState<MissionResults | null>(null);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [shareImageUrl, setShareImageUrl] = useState<string | null>(null);

  const calculateXP = (correctSteps: number, totalSteps: number, timeTaken: number, mistakes: number): number => {
    const baseXP = 100;
    const accuracyBonus = Math.round((correctSteps / totalSteps) * 50);
    const timeBonus = Math.max(0, 25 - Math.round(timeTaken / 60));  // bonus for completing quickly
    const mistakePenalty = mistakes * 5;
    return Math.max(0, baseXP + accuracyBonus + timeBonus - mistakePenalty);
  };

  const recordMissionResults = (correctSteps: number, totalSteps: number, timeTaken: number, mistakes: number) => {
    const xpEarned = calculateXP(correctSteps, totalSteps, timeTaken, mistakes);
    const accuracy = Math.round((correctSteps / totalSteps) * 100);
    
    setMissionResults({
      correctSteps,
      totalSteps,
      timeTaken,
      xpEarned,
      accuracy,
    });
  };

  const shareResults = async (elementId: string) => {
    try {
      const element = document.getElementById(elementId);
      if (!element) return;

      const dataUrl = await toPng(element, { quality: 0.95 });
      setShareImageUrl(dataUrl);
      setShowShareDialog(true);
    } catch (error) {
      console.error('Error generating share image:', error);
    }
  };

  const downloadShareImage = () => {
    if (!shareImageUrl) return;
    const link = document.createElement('a');
    link.download = 'sql-challenge-results.png';
    link.href = shareImageUrl;
    link.click();
  };

  return {
    missionResults,
    showShareDialog,
    shareImageUrl,
    recordMissionResults,
    shareResults,
    downloadShareImage,
    setShowShareDialog,
  };
}
