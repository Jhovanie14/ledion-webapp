import { about, booking, contact, faq, gallery, pricing, services } from '@/routes';

/**
 * Marketing-site nav item. Named `SiteNavItem` (not `NavItem`) to avoid
 * colliding with the existing `@/types` `NavItem` used by the authenticated
 * app, which has a different shape (`title`/`href`/`icon`).
 */
export type SiteNavItem = {
    /** Visible text for the link. */
    label: string;
    /** Resolved URL string (from a Wayfinder route helper). */
    href: string;
    /** "cta" renders as a primary button; defaults to "link". */
    variant?: 'link' | 'cta';
    /** Which surfaces show this item; defaults to "all". */
    visibility?: 'all' | 'desktop' | 'mobile';
};

/**
 * Single source of truth for site navigation. Add a page by appending one
 * entry — desktop and mobile navs both update. Hrefs come from Wayfinder
 * named routes so a renamed/removed route is a compile error.
 *
 * NOTE: In Phase 1 only Book Now targets a real page. Content links
 * (Services, Pricing, ...) are added in Phase 2 when those routes exist.
 */
export const NAV_ITEMS: readonly SiteNavItem[] = [
    { label: 'Services', href: services().url },
    { label: 'Pricing', href: pricing().url },
    { label: 'Gallery', href: gallery().url },
    { label: 'About', href: about().url },
    { label: 'FAQ', href: faq().url },
    { label: 'Contact', href: contact().url },
    { label: 'Book Now', href: booking().url, variant: 'cta' },
];

/** Whether an item should render on the given surface. */
export function isVisible(item: SiteNavItem, surface: 'desktop' | 'mobile'): boolean {
    const visibility = item.visibility ?? 'all';
    return visibility === 'all' || visibility === surface;
}

/** True for call-to-action items (rendered as a button, kept out of the link row). */
export function isCta(item: SiteNavItem): boolean {
    return item.variant === 'cta';
}
