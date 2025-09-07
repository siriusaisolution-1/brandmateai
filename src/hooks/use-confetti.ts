'use client';

import confetti from 'canvas-confetti';

export const useConfetti = () => {
  const fire = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    });
  };

  return { fire };
};
