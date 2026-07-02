import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { TIME_SLOTS } from '@/lib/booking';

type Props = {
    date: Date | null;
    timeSlot: string | null;
    onDateChange: (date: Date | undefined) => void;
    onSlotChange: (slot: string) => void;
};

export function ScheduleStep({ date, timeSlot, onDateChange, onSlotChange }: Props) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return (
        <Card className="rounded-2xl">
            <CardHeader>
                <CardTitle className="text-xl">Date &amp; time</CardTitle>
                <CardDescription>We&apos;re open Monday–Saturday. Sundays and past dates are unavailable.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="grid gap-8 lg:grid-cols-2">
                    <div className="rounded-md border border-border p-3">
                        <p className="mb-3 text-sm font-medium">Select a date</p>
                        <Calendar
                            mode="single"
                            selected={date ?? undefined}
                            onSelect={onDateChange}
                            disabled={[{ before: today }, { dayOfWeek: [0] }]}
                            className="w-full"
                        />
                    </div>

                    <div className="rounded-md border border-border p-4">
                        <p className="text-sm font-medium">Select a time</p>
                        <div className="mt-3 grid grid-cols-2 gap-3">
                            {TIME_SLOTS.map((slot) => {
                                const selected = timeSlot === slot;
                                return (
                                    <button
                                        key={slot}
                                        type="button"
                                        onClick={() => onSlotChange(slot)}
                                        disabled={!date}
                                        aria-pressed={selected}
                                        className={cn(
                                            'rounded-md border p-3 text-sm font-medium transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/30 disabled:cursor-not-allowed disabled:opacity-50',
                                            selected ? 'border-primary bg-primary text-primary-foreground' : 'border-border hover:border-primary/50',
                                        )}
                                    >
                                        {slot}
                                    </button>
                                );
                            })}
                        </div>
                        {!date && <p className="mt-3 text-sm text-muted-foreground">Select a date first.</p>}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
