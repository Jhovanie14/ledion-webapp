import { useEffect, useRef, useState } from 'react';

import { router } from '@inertiajs/react';
import { ArrowLeft, ArrowRight } from 'lucide-react';

import BookingController from '@/actions/App/Http/Controllers/BookingController';
import { Button } from '@/components/ui/button';
import { StepIndicator } from '@/components/site/booking/step-indicator';
import { ServiceTypeStep } from '@/components/site/booking/steps/service-type-step';
import { ServiceStep } from '@/components/site/booking/steps/service-step';
import { ScheduleStep } from '@/components/site/booking/steps/schedule-step';
import { DetailsStep } from '@/components/site/booking/steps/details-step';
import { ReviewStep } from '@/components/site/booking/steps/review-step';
import {
    emptyBookingState,
    formatDateInput,
    isItemSelected,
    type BookingState,
    type CarInfo,
    type CartItem,
    type CustomerInfo,
} from '@/lib/booking';

const STEPS = ['Type', 'Service', 'Schedule', 'Details', 'Review'];

function isStepValid(step: number, state: BookingState): boolean {
    switch (step) {
        case 0:
            return state.serviceType !== null;
        case 1:
            return state.items.length > 0;
        case 2:
            return state.date !== null && state.timeSlot !== null;
        case 3: {
            const { fullName, email, phone, address } = state.customer;
            const { year, make, model } = state.car;
            const baseValid =
                fullName.trim() !== '' &&
                email.includes('@') &&
                phone.trim() !== '' &&
                year.trim() !== '' &&
                make.trim() !== '' &&
                model.trim() !== '';
            const addressValid = state.serviceType === 'home_service' ? address.trim() !== '' : true;
            return baseValid && addressValid;
        }
        default:
            return true;
    }
}

export function BookingStepper() {
    const [state, setState] = useState<BookingState>(emptyBookingState);
    const [step, setStep] = useState(0);
    const [submitting, setSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);
    const topRef = useRef<HTMLDivElement>(null);

    const canProceed = isStepValid(step, state);

    // Scroll to the top of the stepper AFTER the new step renders. Skip first mount.
    const isFirstRender = useRef(true);
    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }
        const id = requestAnimationFrame(() => {
            topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
        return () => cancelAnimationFrame(id);
    }, [step]);

    function toggleItem(item: CartItem) {
        setState((prev) => ({
            ...prev,
            items: isItemSelected(prev.items, item.kind, item.slug)
                ? prev.items.filter((existing) => !(existing.kind === item.kind && existing.slug === item.slug))
                : [...prev.items, item],
        }));
    }

    function updateCustomer(patch: Partial<CustomerInfo>) {
        setState((prev) => ({ ...prev, customer: { ...prev.customer, ...patch } }));
    }

    function updateCar(patch: Partial<CarInfo>) {
        setState((prev) => ({ ...prev, car: { ...prev.car, ...patch } }));
    }

    function next() {
        if (canProceed) {
            setStep((current) => Math.min(current + 1, STEPS.length - 1));
        }
    }

    function back() {
        setStep((current) => Math.max(current - 1, 0));
    }

    function submit() {
        if (!canProceed || submitting) {
            return;
        }
        setSubmitError(null);
        router.post(
            BookingController.store.url(),
            {
                service_type: state.serviceType,
                items: state.items,
                scheduled_date: state.date ? formatDateInput(state.date) : null,
                scheduled_time: state.timeSlot,
                customer_name: state.customer.fullName,
                customer_email: state.customer.email,
                customer_phone: state.customer.phone,
                customer_address: state.customer.address,
                car_year: state.car.year,
                car_make: state.car.make,
                car_model: state.car.model,
            },
            {
                onStart: () => setSubmitting(true),
                onFinish: () => setSubmitting(false),
                onError: () => setSubmitError('Something went wrong. Please review your details and try again.'),
            },
        );
    }

    return (
        <div ref={topRef} className="scroll-mt-24">
            <div className="flex flex-col gap-10">
                <StepIndicator steps={STEPS} current={step} />

                <div>
                    {step === 0 && (
                        <ServiceTypeStep
                            value={state.serviceType}
                            onChange={(serviceType) => setState((prev) => ({ ...prev, serviceType }))}
                        />
                    )}
                    {step === 1 && <ServiceStep items={state.items} onToggle={toggleItem} />}
                    {step === 2 && (
                        <ScheduleStep
                            date={state.date}
                            timeSlot={state.timeSlot}
                            onDateChange={(date) => setState((prev) => ({ ...prev, date: date ?? null }))}
                            onSlotChange={(timeSlot) => setState((prev) => ({ ...prev, timeSlot }))}
                        />
                    )}
                    {step === 3 && (
                        <DetailsStep
                            serviceType={state.serviceType}
                            customer={state.customer}
                            car={state.car}
                            onCustomerChange={updateCustomer}
                            onCarChange={updateCar}
                        />
                    )}
                    {step === 4 && <ReviewStep state={state} />}
                </div>

                {submitError && <p className="text-sm text-destructive">{submitError}</p>}

                <div className="flex items-center justify-between gap-4 border-t border-border pt-6">
                    <Button variant="outline" onClick={back} disabled={step === 0 || submitting}>
                        <ArrowLeft className="size-4" />
                        Back
                    </Button>
                    {step < STEPS.length - 1 ? (
                        <Button onClick={next} disabled={!canProceed}>
                            Next
                            <ArrowRight className="size-4" />
                        </Button>
                    ) : (
                        <Button onClick={submit} disabled={submitting}>
                            {submitting ? 'Confirming…' : 'Confirm booking'}
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
}
