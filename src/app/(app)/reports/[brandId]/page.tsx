'use client';

import { useParams } from 'next/navigation';
import { useFirestore, useFirestoreCollectionData, useUser } from 'reactfire';
import { collection, query, where, doc, getDoc } from 'firebase/firestore';
import { AdCampaign, Brand } from '@/types/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Lightbulb, TrendingUp, BarChart } from 'lucide-react';
import { useEffect, useState } from 'react';
import { run } from '@genkit-ai/flow/client';
import { generatePerformanceInsightsFlow } from '@/ai/flows/strategic-analysis';

type Insights = {
    overallSummary: string;
    keyObservations: string[];
    actionableRecommendations: string[];
};

export default function ReportsPage() {
    const params = useParams();
    const brandId = params.brandId as string;
    const { data: user } = useUser();
    const firestore = useFirestore();

    // Correctly fetch campaigns for the specific brand
    const campaignsCollection = collection(firestore, 'adCampaigns');
    const campaignsQuery = query(
        campaignsCollection, 
        where('brandId', '==', brandId),
        where('ownerId', '==', user?.uid || '')
    );
    const { status: campaignsStatus, data: campaigns } = useFirestoreCollectionData(campaignsQuery, { idField: 'id' });
    
    const [insights, setInsights] = useState<Insights | null>(null);
    const [isLoadingInsights, setIsLoadingInsights] = useState(false);

    useEffect(() => {
        const fetchInsights = async () => {
            // Now we check if campaigns data is successfully loaded and not empty
            if (campaignsStatus === 'success' && campaigns && campaigns.length > 0 && user) {
                setIsLoadingInsights(true);
                try {
                    const brandRef = doc(firestore, 'brands', brandId);
                    const brandSnap = await getDoc(brandRef);
                    if (brandSnap.exists()) {
                        const result = await run(generatePerformanceInsightsFlow, {
                            brand: brandSnap.data() as Brand,
                            campaigns: campaigns as AdCampaign[],
                        });
                        setInsights(result);
                    }
                } catch (error) {
                    console.error("Failed to generate insights:", error);
                } finally {
                    setIsLoadingInsights(false);
                }
            }
        };
        fetchInsights();
    }, [campaignsStatus, campaigns, user, brandId, firestore]);

    if (campaignsStatus === 'loading') {
        return <div className="p-8"><div className="w-full h-96 bg-gray-700 rounded-lg animate-pulse" /></div>;
    }

    return (
        <div className="p-4 md:p-8 space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-copy-primary">Unified Dashboard</h1>
                <p className="text-copy-secondary">Your marketing command center for brand: <strong>{brandId}</strong></p>
            </div>

            {/* AI Insights Section */}
            <Card className="bg-gradient-to-br from-indigo-900/50 to-surface border-primary">
                <CardHeader><CardTitle className="flex items-center gap-2"><Lightbulb /> AI Strategic Insights</CardTitle></CardHeader>
                <CardContent>
                    {isLoadingInsights && <p>Analyzing your data...</p>}
                    {insights && (
                        <div className="space-y-4 text-sm">
                             <p className="text-copy-secondary">{insights.overallSummary}</p>
                             <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <h4 className="font-semibold text-copy-primary mb-1">Key Observations</h4>
                                    <ul className="list-disc pl-5 space-y-1 text-copy-secondary">
                                        {insights.keyObservations.map((obs, i) => <li key={i}>{obs}</li>)}
                                    </ul>
                                </div>
                                 <div>
                                    <h4 className="font-semibold text-copy-primary mb-1">Actionable Recommendations</h4>
                                    <ul className="list-disc pl-5 space-y-1 text-copy-secondary">
                                        {insights.actionableRecommendations.map((rec, i) => <li key={i}>{rec}</li>)}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    )}
                     {!isLoadingInsights && !insights && <p>Not enough campaign data to generate insights for this brand.</p>}
                </CardContent>
            </Card>

            {/* Campaign Performance Table */}
            <Card className="bg-surface border-gray-700">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><BarChart /> Campaign Performance</CardTitle>
                    <CardDescription>Raw performance data from your ad campaigns.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Campaign ID</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Impressions</TableHead>
                                <TableHead className="text-right">Clicks</TableHead>
                                <TableHead className="text-right">Spend ($)</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {campaigns && campaigns.length > 0 ? (campaigns as AdCampaign[]).map((campaign) => (
                                <TableRow key={campaign.id}>
                                    <TableCell className="font-mono text-xs">{campaign.platformCampaignId}</TableCell>
                                    <TableCell>{campaign.status}</TableCell>
                                    <TableCell className="text-right">{campaign.performance?.impressions || 0}</TableCell>
                                    <TableCell className="text-right">{campaign.performance?.clicks || 0}</TableCell>
                                    <TableCell className="text-right">{campaign.performance?.spend.toFixed(2) || '0.00'}</TableCell>
                                </TableRow>
                            )) : (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center h-24">No campaign data to display.</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
