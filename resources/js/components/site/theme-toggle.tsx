import { Moon, Sun } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { useAppearance } from '@/hooks/use-appearance';

export function ThemeToggle() {
    const { resolvedAppearance, updateAppearance } = useAppearance();

    return (
        <Button
            variant="ghost"
            size="icon"
            aria-label={resolvedAppearance === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            onClick={() => updateAppearance(resolvedAppearance === 'dark' ? 'light' : 'dark')}
        >
            <Sun className="hidden dark:block" />
            <Moon className="block dark:hidden" />
        </Button>
    );
}
