export type ServiceType = 'in_shop' | 'home_service';

export type CartItemKind = 'service' | 'bundle';

export type CartItem = {
    kind: CartItemKind;
    slug: string;
    title: string;
    /** Display price string, e.g. "₱8,000". */
    price: string;
};

export type CustomerInfo = {
    fullName: string;
    email: string;
    phone: string;
    /** Required only for home service. */
    address: string;
};

export type CarInfo = {
    year: string;
    make: string;
    model: string;
};

export type BookingState = {
    serviceType: ServiceType | null;
    items: CartItem[];
    date: Date | null;
    timeSlot: string | null;
    customer: CustomerInfo;
    car: CarInfo;
};

/** A persisted booking as returned by the server (see App\Models\Booking). */
export type BookingRecord = {
    id: number;
    reference: string;
    service_type: ServiceType;
    status: string;
    scheduled_date: string; // "Y-m-d"
    scheduled_time: string;
    customer_name: string;
    customer_email: string;
    customer_phone: string;
    customer_address: string | null;
    car_year: string;
    car_make: string;
    car_model: string;
    items: CartItem[];
    estimated_total: number;
    created_at: string;
};

export const SERVICE_TYPE_LABELS: Record<ServiceType, string> = {
    in_shop: 'In-Shop Service',
    home_service: 'Home Service',
};

export const TIME_SLOTS = [
    '09:00 AM',
    '10:30 AM',
    '12:00 PM',
    '01:30 PM',
    '03:00 PM',
    '04:30 PM',
] as const;

export function emptyBookingState(): BookingState {
    return {
        serviceType: null,
        items: [],
        date: null,
        timeSlot: null,
        customer: { fullName: '', email: '', phone: '', address: '' },
        car: { year: '', make: '', model: '' },
    };
}

/** Strip the currency formatting to a number, e.g. "₱8,000" -> 8000. */
export function parsePrice(price: string): number {
    const digits = price.replace(/[^\d]/g, '');
    return digits ? Number(digits) : 0;
}

export function formatPeso(amount: number): string {
    return `₱${amount.toLocaleString('en-PH')}`;
}

/** Sum of the selected items' starting prices (an estimate). */
export function cartTotal(items: CartItem[]): number {
    return items.reduce((sum, item) => sum + parsePrice(item.price), 0);
}

export function isItemSelected(items: CartItem[], kind: CartItemKind, slug: string): boolean {
    return items.some((item) => item.kind === kind && item.slug === slug);
}

/** Serialize a Date to a local "Y-m-d" string for the server payload. */
export function formatDateInput(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}
