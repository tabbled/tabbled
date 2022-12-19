export interface MenuConfigInterface {
    id: string,
    title: string,
    path?: string,
    page?: string,
    icon?: string,
    items?: MenuConfigInterface[]
}