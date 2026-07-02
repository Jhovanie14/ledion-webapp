import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { type CarInfo, type CustomerInfo, type ServiceType } from '@/lib/booking';

type Props = {
    serviceType: ServiceType | null;
    customer: CustomerInfo;
    car: CarInfo;
    onCustomerChange: (patch: Partial<CustomerInfo>) => void;
    onCarChange: (patch: Partial<CarInfo>) => void;
};

export function DetailsStep({ serviceType, customer, car, onCustomerChange, onCarChange }: Props) {
    const isHome = serviceType === 'home_service';

    return (
        <div className="flex flex-col gap-6">
            <Card className="rounded-2xl">
                <CardHeader>
                    <CardTitle className="text-xl">Your details</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="fullName">Full name</Label>
                            <Input
                                id="fullName"
                                value={customer.fullName}
                                onChange={(event) => onCustomerChange({ fullName: event.target.value })}
                                placeholder="Jane Doe"
                                required
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="phone">Phone number</Label>
                            <Input
                                id="phone"
                                type="tel"
                                value={customer.phone}
                                onChange={(event) => onCustomerChange({ phone: event.target.value })}
                                placeholder="0917 123 4567"
                                required
                            />
                        </div>
                        <div className="flex flex-col gap-2 sm:col-span-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                value={customer.email}
                                onChange={(event) => onCustomerChange({ email: event.target.value })}
                                placeholder="jane@example.com"
                                required
                            />
                        </div>
                        {isHome && (
                            <div className="flex flex-col gap-2 sm:col-span-2">
                                <Label htmlFor="address">Service address</Label>
                                <Input
                                    id="address"
                                    value={customer.address}
                                    onChange={(event) => onCustomerChange({ address: event.target.value })}
                                    placeholder="Where should we come to?"
                                    required
                                />
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            <Card className="rounded-2xl">
                <CardHeader>
                    <CardTitle className="text-xl">Vehicle details</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4 sm:grid-cols-3">
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="year">Year</Label>
                            <Input
                                id="year"
                                inputMode="numeric"
                                value={car.year}
                                onChange={(event) => onCarChange({ year: event.target.value })}
                                placeholder="2020"
                                required
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="make">Make</Label>
                            <Input
                                id="make"
                                value={car.make}
                                onChange={(event) => onCarChange({ make: event.target.value })}
                                placeholder="Toyota"
                                required
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="model">Model</Label>
                            <Input
                                id="model"
                                value={car.model}
                                onChange={(event) => onCarChange({ model: event.target.value })}
                                placeholder="Vios"
                                required
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
