'use client';

import { useFirestore, useFirestoreCollectionData, useUser } from 'reactfire';
import { collection, query, where, Timestamp } from 'firebase/firestore';
import { Calendar, dateFnsLocalizer, Event as BigCalendarEvent } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import enUS from 'date-fns/locale/en-US';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { useParams } from 'next/navigation';
import { CalendarEvent as CalendarEventType } from '@/types/firestore';
import { Instagram, Linkedin, Twitter, Newspaper, FileText, Rocket } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";
import { run } from '@genkit-ai/flow/client';
import { launchAdCampaignFlow } from '@/ai/flows/manage-ads'; // Import the new flow

const locales = { 'en-US': enUS };
const localizer = dateFnsLocalizer({ format, parse, startOfWeek, getDay, locales });

const platformIcons: { [key: string]: React.ElementType } = {
  Instagram: Instagram, LinkedIn: Linkedin, X: Twitter, Newsletter: Newspaper, Blog: FileText, Facebook: Instagram,
};

const CustomEvent = ({ event }: { event: BigCalendarEvent }) => { /* ... unchanged ... */ };

export default function CalendarPage() {
    const params = useParams();
    const brandId = params.brandId as string;
    const { data: user } = useUser();
    const firestore = useFirestore();
    const { toast } = useToast();

    const eventsCollection = collection(firestore, 'calendarEvents');
    const eventsQuery = query(
        eventsCollection,
        where('brandId', '==', brandId),
        where('ownerId', '==', user?.uid || '')
    );

    const { status, data: eventsData } = useFirestoreCollectionData(eventsQuery, { idField: 'id' });

    const handleSelectEvent = (event: BigCalendarEvent) => {
        const calendarEvent = event.resource as CalendarEventType & { id: string };
        
        const action = window.confirm(`What would you like to do with "${calendarEvent.title}"?

OK - Launch Ad Campaign
Cancel - Close`);

        if (action) {
            const adAccountId = window.prompt("Please enter your Meta Ad Account ID (e.g., act_1234567890):");
            if (adAccountId) {
                toast({ title: "Launching Campaign...", description: "This may take a moment." });
                run(launchAdCampaignFlow, { eventId: calendarEvent.id, adAccountId })
                    .then(result => {
                        if (result.success) {
                            toast({ title: "Campaign Launched!", description: result.message });
                        } else {
                            toast({ variant: "destructive", title: "Campaign Failed", description: result.message });
                        }
                    })
                    .catch(err => toast({ variant: "destructive", title: "Error", description: err.message }));
            }
        }
    };

    if (status === 'loading') return <div className="p-8"><div className="w-full h-[80vh] bg-gray-700 rounded-lg animate-pulse" /></div>;

    const formattedEvents: BigCalendarEvent[] = (eventsData as CalendarEventType[] || []).map(event => ({
        title: event.title,
        start: (event.scheduledAt as Timestamp).toDate(),
        end: (event.scheduledAt as Timestamp).toDate(),
        resource: event,
    }));

    return (
        <div className="p-4 md:p-8">
            <h1 className="text-2xl font-bold text-copy-primary mb-4">Content Calendar</h1>
            <div className="h-[80vh] bg-surface p-4 rounded-lg text-copy-primary">
                <Calendar
                    localizer={localizer}
                    events={formattedEvents}
                    startAccessor="start"
                    endAccessor="end"
                    style={{ height: '100%' }}
                    onSelectEvent={handleSelectEvent}
                    components={{ event: ({ event }) => {
                        const Icon = platformIcons[event.resource.platform] || FileText;
                        return (<div className="flex items-center gap-1 text-xs"><Icon size={12} /><span>{event.title}</span></div>);
                    }}}
                />
            </div>
        </div>
    );
}
