export function preventCloseOnPortalClick(e: Event) {
    const target = e.target as HTMLElement;
    if (target.closest('[data-slot="select-content"]') ||
        target.closest('[data-radix-popper-content-wrapper]'
        )) {
        e.preventDefault();
    }
}