'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { run, GenkitError } from '@genkit-ai/flow/client';
import { getAdminDashboardStatsFlow, getRemoteConfigValuesFlow, setRemoteConfigValueFlow } from '@/ai/flows/admin-stats';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Users, Briefcase, Sparkles, AlertTriangle, ToggleLeft, ToggleRight } from 'lucide-react';
import { useUser } from 'reactfire';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';

// ... (StatCard component is unchanged)

const featureFlags = [
    { key: 'isSocialBurstEnabled', label: 'AI Social Burst' },
    { key: 'isNewsletterGeneratorEnabled', label: 'AI Newsletter Generator' },
    { key: 'isImageGeneratorEnabled', label: 'AI Image Generator' },
    { key: 'isBlogGeneratorEnabled', label: 'AI Blog Generator' },
];

export default function AdminDashboardPage() {
    const { data: user } = useUser();
    const isAdmin = user?.customClaims.role === 'admin';
    const queryClient = useQueryClient();
    const { toast } = useToast();

    // Fetch dashboard stats
    const { data: stats, isLoading: isLoadingStats } = useQuery({
        queryKey: ['adminStats'],
        queryFn: () => run(getAdminDashboardStatsFlow),
        enabled: isAdmin,
    });

    // Fetch feature flag values
    const { data: configValues, isLoading: isLoadingConfig } = useQuery({
        queryKey: ['remoteConfig'],
        queryFn: () => run(getRemoteConfigValuesFlow),
        enabled: isAdmin,
    });

    // Mutation for updating a feature flag
    const updateFlagMutation = useMutation({
        mutationFn: ({ parameterName, value }: { parameterName: string, value: boolean }) =>
            run(setRemoteConfigValueFlow, { parameterName, value }),
        onSuccess: () => {
            toast({ title: "Feature flag updated successfully!" });
            queryClient.invalidateQueries({ queryKey: ['remoteConfig'] });
        },
        onError: (error) => {
            toast({ variant: "destructive", title: "Update failed", description: (error as GenkitError).message });
        },
    });

    if (!isAdmin) { /* ... (unchanged) */ }
    
    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold text-copy-primary">Admin Dashboard</h1>
            
            {/* Stats Section */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {isLoadingStats ? [...Array(4)].map((_, i) => <div key={i} className="h-28 bg-gray-700 rounded-lg animate-pulse" />)
                 : stats && <>
                    <StatCard title="Total Users" value={stats.totalUsers} icon={Users} />
                    {/* ... other cards */}
                 </>
                }
            </div>

            {/* Feature Flags Section */}
            <Card className="bg-surface border-gray-700">
                <CardHeader>
                    <CardTitle>Feature Flags</CardTitle>
                    <CardDescription>Enable or disable major features in real-time without deploying new code.</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4 md:grid-cols-2">
                    {isLoadingConfig ? <p>Loading flags...</p>
                     : featureFlags.map(flag => (
                        <div key={flag.key} className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
                            <Label htmlFor={flag.key} className="font-medium">{flag.label}</Label>
                            <Switch
                                id={flag.key}
                                checked={configValues?.[flag.key] ?? false}
                                onCheckedChange={(value) => {
                                    updateFlagMutation.mutate({ parameterName: flag.key, value });
                                }}
                                disabled={updateFlagMutation.isPending}
                            />
                        </div>
                    ))}
                </CardContent>
            </Card>
        </div>
    );
}
