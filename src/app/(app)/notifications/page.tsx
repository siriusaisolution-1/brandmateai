'use client';

import { useFirestore, useFirestoreCollectionData, useUser } from 'reactfire';
import { collection, query, where, orderBy } from 'firebase/firestore';
import { Notification } from '@/types/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Bell, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function NotificationsPage() {
    const { data: user } = useUser();
    const firestore = useFirestore();

    const notificationsCollection = collection(firestore, 'notifications');
    const notificationsQuery = query(
        notificationsCollection,
        where('ownerId', '==', user?.uid || ''),
        orderBy('createdAt', 'desc')
    );

    const { status, data: notifications } = useFirestoreCollectionData(notificationsQuery, { idField: 'id' });

    if (status === 'loading') {
        return (
            <div className="p-8 space-y-4">
                 {[...Array(3)].map((_, i) => <div key={i} className="w-full h-24 bg-gray-700 rounded-lg animate-pulse" />)}
            </div>
        );
    }

    return (
        <div className="p-4 md:p-8">
            <h1 className="text-2xl font-bold text-copy-primary mb-4">Notifications</h1>
            <div className="max-w-3xl mx-auto space-y-4">
                {notifications && notifications.length > 0 ? (
                    (notifications as Notification[]).map(notif => (
                        <Link href={`/notifications/${notif.id}`} key={notif.id}>
                            <Card className={`bg-surface border-gray-700 hover:border-primary transition-colors ${!notif.isRead ? 'border-primary' : ''}`}>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Bell className="w-5 h-5 text-primary" />
                                        {notif.title}
                                    </CardTitle>
                                    <CardDescription>{notif.summary}</CardDescription>
                                </CardHeader>
                            </Card>
                        </Link>
                    ))
                ) : (
                    <Card className="bg-surface border-gray-700 text-center">
                        <CardHeader>
                            <AlertCircle className="w-12 h-12 mx-auto text-copy-secondary mb-4" />
                            <CardTitle>No Notifications Yet</CardTitle>
                            <CardDescription>Your AI-generated reports and alerts will appear here.</CardDescription>
                        </CardHeader>
                    </Card>
                )}
            </div>
        </div>
    );
}
