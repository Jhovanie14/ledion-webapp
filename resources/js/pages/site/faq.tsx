import { Head, Link } from '@inertiajs/react';

import { PageHeader } from '@/components/site/landing/page-header';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { contact } from '@/routes';

const FAQS = [
    {
        question: "What's the difference between in-shop and home service?",
        answer: 'In-shop service is performed at our fully equipped studio, ideal for deep details and ceramic coatings. Home service brings our mobile team to your driveway for convenience — both deliver the same professional results.',
    },
    {
        question: 'How long does a detail take?',
        answer: "It depends on the package and your vehicle's condition. An Essential detail typically takes 1–2 hours, while a Signature package with paint correction and ceramic coating can take a full day.",
    },
    {
        question: 'Do I need to do anything to prepare my car?',
        answer: "Just remove any personal belongings you'd like to keep. We handle the rest — there's no need to pre-wash or vacuum beforehand.",
    },
    {
        question: 'How long does ceramic coating last?',
        answer: "With proper care, our ceramic coatings can protect your paint for several years. We'll walk you through simple maintenance to keep it performing at its best.",
    },
    {
        question: 'What areas do you serve for home service?',
        answer: "We cover most of the metro area. When you book, you'll be able to confirm whether your address is within our service range.",
    },
    {
        question: 'How do I pay and book?',
        answer: 'Booking is done online — choose your service, in-shop or home, and a time that works for you. Payment details are confirmed at the time of service.',
    },
];

export default function Faq() {
    return (
        <>
            <Head title="FAQ — Ledion Autocare" />
            <main>
                <PageHeader title="Frequently Asked Questions" description="Everything you need to know before you book." />
                <div className="mx-auto max-w-3xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
                    <Accordion type="single" collapsible className="w-full">
                        {FAQS.map((item, index) => (
                            <AccordionItem key={item.question} value={`item-${index}`}>
                                <AccordionTrigger className="text-left text-base">{item.question}</AccordionTrigger>
                                <AccordionContent className="text-muted-foreground">{item.answer}</AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                    <div className="mt-12 text-center">
                        <p className="text-muted-foreground">Still have a question?</p>
                        <Button asChild variant="outline" className="mt-4">
                            <Link href={contact().url}>Contact us</Link>
                        </Button>
                    </div>
                </div>
            </main>
        </>
    );
}
