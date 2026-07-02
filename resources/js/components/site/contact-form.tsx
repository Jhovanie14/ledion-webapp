import { useState } from 'react';
import { CheckCircle2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

export function ContactForm() {
    const [submitted, setSubmitted] = useState(false);

    function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        // No backend yet — acknowledge the submission locally.
        setSubmitted(true);
    }

    if (submitted) {
        return (
            <div className="flex flex-col items-center gap-3 rounded-2xl border border-border bg-muted/40 p-8 text-center">
                <CheckCircle2 className="size-10 text-primary" aria-hidden="true" />
                <h3 className="text-lg font-medium">Thanks for reaching out!</h3>
                <p className="text-sm text-muted-foreground">
                    We&apos;ve received your message and will get back to you shortly.
                </p>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-2">
                    <Label htmlFor="name">Name</Label>
                    <Input id="name" name="name" required placeholder="Jane Doe" />
                </div>
                <div className="flex flex-col gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" name="email" type="email" required placeholder="jane@example.com" />
                </div>
            </div>
            <div className="flex flex-col gap-2">
                <Label htmlFor="subject">Subject</Label>
                <Input id="subject" name="subject" placeholder="How can we help?" />
            </div>
            <div className="flex flex-col gap-2">
                <Label htmlFor="message">Message</Label>
                <Textarea id="message" name="message" required rows={5} placeholder="Tell us about your vehicle and what you need…" />
            </div>
            <Button type="submit" size="lg" className="sm:self-start">
                Send message
            </Button>
        </form>
    );
}
