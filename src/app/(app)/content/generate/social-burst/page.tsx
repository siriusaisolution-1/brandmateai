'use client';

import { useFeatureFlag } from '@/hooks/use-feature-flag';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { EyeOff } from 'lucide-react';
// ... (all other imports for the page)

const FeatureDisabledCard = () => (
    <Card className="max-w-2xl mx-auto mt-16 bg-surface border-yellow-500/50">
        <CardHeader className="text-center">
            <EyeOff className="mx-auto h-12 w-12 text-yellow-500" />
            <CardTitle className="mt-4">Feature Temporarily Disabled</CardTitle>
            <CardDescription>This feature is currently turned off by the administrators. Please check back later.</CardDescription>
        </CardHeader>
    </Card>
);

export default function SocialBurstPage() {
    const isEnabled = useFeatureFlag('isSocialBurstEnabled');

    if (!isEnabled) {
        return <FeatureDisabledCard />;
    }

    // ... (the rest of the original component code)
    // const [selectedBrandId, setSelectedBrandId] = useState<string | null>(null);
    // ...
    return (
        // ... (original JSX for the Social Burst page)
    );
}
