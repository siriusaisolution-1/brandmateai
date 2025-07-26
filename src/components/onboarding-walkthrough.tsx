'use client';

import { useState, useEffect } from 'react';
import Joyride, { Step, CallBackProps } from 'react-joyride';

const ONBOARDING_STEPS: Step[] = [
  {
    target: 'body',
    content: 'Welcome to BrandMate AI! I will be your co-pilot on this journey. Let me quickly show you around.',
    placement: 'center',
    title: 'Greetings!',
  },
  {
    target: '#master-ai-chat-button',
    content: 'This is me, your Master AI assistant. Click here anytime you want to create content, ask a question, or get strategic advice.',
    title: 'Your AI Co-pilot',
    placement: 'top',
  },
  {
    target: '#new-brand-button', // We will need to add this ID to the "New Brand" button
    content: 'Everything starts with a brand. You can create a new brand manually or use our "AI Brand Audit" to import everything from a website instantly.',
    title: 'Creating a Brand',
  },
   {
    target: 'body',
    content: "That's it for now! Feel free to explore. What would you like to create today?",
    placement: 'center',
    title: 'Ready to Go!',
  },
];

export function OnboardingWalkthrough() {
  const [run, setRun] = useState(false);

  useEffect(() => {
    // In a real app, you'd check a flag in the user's Firestore document.
    // For now, we use localStorage to show it only once per browser session.
    const hasBeenOnboarded = localStorage.getItem('hasBeenOnboarded');
    if (!hasBeenOnboarded) {
      setRun(true);
    }
  }, []);

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status } = data;
    const finishedStatuses: string[] = ['finished', 'skipped'];

    if (finishedStatuses.includes(status)) {
        setRun(false);
        localStorage.setItem('hasBeenOnboarded', 'true');
    }
  };

  return (
    <Joyride
      run={run}
      steps={ONBOARDING_STEPS}
      continuous
      showProgress
      showSkipButton
      callback={handleJoyrideCallback}
      styles={{
        options: {
          arrowColor: '#1F2937',
          backgroundColor: '#1F2937',
          primaryColor: '#4F46E5',
          textColor: '#F9FAFB',
          zIndex: 1000,
        },
        tooltip: {
            borderRadius: '0.5rem'
        },
        buttonClose: {
            display: 'none',
        }
      }}
    />
  );
}
