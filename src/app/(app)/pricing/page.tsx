'use client';

import { useState } from 'react';
// ... (imports are unchanged)
import { track } from '@/lib/analytics'; // <-- IMPORT TRACKER

// ... (component and pricingPlans array are unchanged)

export default function PricingPage() {
    const [isLoading, setIsLoading] = useState<string | null>(null);

    const handleUpgrade = async (priceId: string, planName: string) => {
        setIsLoading(priceId);
        track('Upgrade Button Clicked', { plan: planName, location: 'pricing_page' }); // <-- TRACK EVENT
        try {
            // ... (rest of the logic is unchanged)
        } catch (error) {
            console.error('Error creating checkout session:', error);
            setIsLoading(null);
        }
    };

    return (
        // ... (JSX is unchanged, just update the onClick handler)
        <Button 
            // ... (other props)
            onClick={() => plan.priceId && handleUpgrade(plan.priceId, plan.name)}
        >
            {/* ... */}
        </Button>
    );
}
