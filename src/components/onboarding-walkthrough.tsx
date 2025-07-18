'use client';

import React, { useState, useEffect } from 'react';
import Joyride, { Step } from 'react-joyride';

export const OnboardingWalkthrough = () => {
  const [run, setRun] = useState(false);

  useEffect(() => {
    const hasOnboardingBeenSeen = localStorage.getItem('onboarding_seen');
    if (!hasOnboardingBeenSeen) {
      setRun(true);
      localStorage.setItem('onboarding_seen', 'true');
    }
  }, []);

  const steps: Step[] = [
    {
      target: 'body',
      content: 'Welcome to BrandMate AI! Let us guide you through the key features.',
      placement: 'center',
    },
    {
      target: '#master-ai-chat-button', // We will add this ID to the chat button
      content: 'This is your AI assistant. You can talk to it to get anything done.',
    },
    {
      target: '#create-first-brand-button', // We will add this ID to a button
      content: 'Lets start by creating your first brand. You can do it manually or let our AI do the magic!',
    },
  ];

  return (
    <Joyride
      steps={steps}
      run={run}
      continuous
      showProgress
      showSkipButton
      styles={{
        options: {
          primaryColor: '#4F46E5',
          textColor: '#F9FAFB',
          arrowColor: '#1F2937',
          backgroundColor: '#1F2937',
        },
      }}
    />
  );
};
