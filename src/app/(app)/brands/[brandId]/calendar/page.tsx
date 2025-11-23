'use client';

import {
  addDays,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  startOfMonth,
  startOfWeek,
} from 'date-fns';
import { useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import { CalendarDays, Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useBrandCalendarEvents } from '@/hooks/brand-content';
import type { CalendarEvent } from '@/types/firestore';

type CalendarEventWithDates = Omit<CalendarEvent, 'startTime' | 'endTime'> & {
  startTime?: Date;
  endTime?: Date;
};

function formatTimeRange(event: CalendarEventWithDates) {
  if (!event.startTime) return 'No time set';
  const start = format(event.startTime, 'MMM d, p');
  if (!event.endTime) return start;
  return `${start} - ${format(event.endTime, 'p')}`;
}

export default function BrandCalendarPage() {
  const params = useParams<{ brandId: string }>();
  const brandId = params?.brandId;

  const [referenceDate, setReferenceDate] = useState<Date>(() => new Date());

  if (!brandId) {
    return (
      <Alert>
        <div className="font-semibold">Select a brand</div>
        <AlertDescription>Pick a brand to review the calendar.</AlertDescription>
      </Alert>
    );
  }

  const monthStart = startOfMonth(referenceDate);
  const monthEnd = endOfMonth(referenceDate);
  const gridStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const { status, data } = useBrandCalendarEvents(brandId, { start: gridStart, end: gridEnd });
  const events: CalendarEventWithDates[] = data ?? [];

  const grouped = useMemo(() => {
    return events.reduce<Record<string, CalendarEventWithDates[]>>(
      (acc, event) => {
        const key = event.startTime ? format(event.startTime, 'yyyy-MM-dd') : 'unknown';
        acc[key] = acc[key] ? [...acc[key], event] : [event];
        return acc;
      },
      {},
    );
  }, [events]);

  const days: Date[] = [];
  let current = gridStart;
  while (current <= gridEnd) {
    days.push(current);
    current = addDays(current, 1);
  }

  const handleMonthChange = (delta: number) => {
    const newDate = new Date(referenceDate);
    newDate.setMonth(referenceDate.getMonth() + delta);
    setReferenceDate(newDate);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold text-copy-primary">Calendar</h1>
        <p className="text-muted-foreground text-sm">
          Read-only view of planned content and calendar events for this brand.
        </p>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="secondary" onClick={() => handleMonthChange(-1)}>
          Previous
        </Button>
        <div className="text-lg font-semibold">{format(referenceDate, 'LLLL yyyy')}</div>
        <Button variant="secondary" onClick={() => handleMonthChange(1)}>
          Next
        </Button>
      </div>

      {status === 'loading' && (
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading events...
        </div>
      )}

      {status === 'success' && events.length === 0 && (
        <Card className="bg-surface border-gray-700">
          <CardHeader>
            <CardTitle>No events for this period</CardTitle>
            <CardDescription>
              Once you add requests or outputs with dates, they will show up here.
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      {status === 'success' && (
        <Card className="bg-surface border-gray-700">
          <CardContent className="p-0">
            <div className="grid grid-cols-7 gap-px bg-gray-800 text-xs md:text-sm">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
                <div key={day} className="bg-gray-900 px-2 py-2 font-semibold text-muted-foreground">
                  {day}
                </div>
              ))}

              {days.map((day) => {
                const key = format(day, 'yyyy-MM-dd');
                const dayEvents = grouped[key] ?? [];
                const muted = !isSameMonth(day, referenceDate);

                return (
                  <div
                    key={key}
                    className={`min-h-[120px] bg-background px-2 py-2 border border-gray-800 ${
                      isSameDay(day, new Date()) ? 'border-primary' : ''
                    } ${muted ? 'opacity-60' : ''}`}
                  >
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span>{format(day, 'd')}</span>
                      {dayEvents.length > 0 && (
                        <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                          <CalendarDays className="h-3 w-3" />
                          {dayEvents.length}
                        </span>
                      )}
                    </div>

                    <div className="mt-2 space-y-1">
                      {dayEvents.map((event) => (
                        <div key={event.id} className="rounded-md bg-gray-900 p-2 text-[11px] leading-tight">
                          <div className="font-semibold">{event.title}</div>
                          {event.channel && <div className="text-muted-foreground">{event.channel}</div>}
                          <div className="text-muted-foreground">{formatTimeRange(event)}</div>
                        </div>
                      ))}

                      {dayEvents.length === 0 && (
                        <div className="text-[11px] text-muted-foreground">No items</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}