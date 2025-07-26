'use client';

import { useUser, useFirestore, useFirestoreDocData } from 'reactfire';
import { doc } from 'firebase/firestore';
import { Sparkles } from 'lucide-react';
import Link from 'next/link';
import { User } from '@/types/firestore';

// Define monthly quotas for each plan in BMK
const PLAN_QUOTAS: Record<string, number> = {
    free: 1000, // Trial credits
    solo: 6000,
    pro: 18000,
    agency: 36000,
};

export function BmkUsageDisplay() {
    const { data: user } = useUser();
    const firestore = useFirestore();
    
    const userRef = user ? doc(firestore, 'users', user.uid) : null;
    const { status, data: userData } = useFirestoreDocData(userRef);

    if (status === 'loading' || !userData) {
        return <div className="h-10 w-full bg-gray-700 rounded-md animate-pulse" />;
    }

    const appUser = userData as User;
    const quota = PLAN_QUOTAS[appUser.subscriptionPlan] || 0;
    const usage = appUser.bmkUsage || 0;
    const remaining = Math.max(0, quota - usage);

    return (
        <div className="p-3 bg-gray-800 rounded-lg">
            <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-bold text-copy-primary flex items-center gap-1"><Sparkles size={12} className="text-yellow-400"/> BMK Remaining</span>
                <span className="text-xs text-copy-secondary">{remaining} / {quota}</span>
            </div>
            <div className="w-full bg-gray-600 rounded-full h-1.5">
                <div 
                    className="bg-primary h-1.5 rounded-full" 
                    style={{ width: `${(remaining / quota) * 100}%` }}
                ></div>
            </div>
            <Link href="/pricing" className="text-xs text-center block mt-2 text-indigo-400 hover:underline">
                Upgrade Plan or Top-up
            </Link>
        </div>
    );
}
