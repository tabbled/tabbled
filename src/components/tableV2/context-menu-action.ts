export interface ContextMenuAction {
    title?: string
    action: string | 'divider',
    onClick?: () => void
}