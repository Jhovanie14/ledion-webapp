type PageHeaderProps = {
    title: string;
    description?: string;
};

export function PageHeader({ title, description }: PageHeaderProps) {
    return (
        <section className="relative overflow-hidden border-b border-border">
            <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-primary/10 to-transparent" />
            <div className="mx-auto max-w-7xl px-4 py-16 text-center sm:px-6 lg:px-8 lg:py-20">
                <h1 className="font-heading text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
                    {title}
                </h1>
                {description && (
                    <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">{description}</p>
                )}
            </div>
        </section>
    );
}
