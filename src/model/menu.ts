export interface MenuConfigInterface {
    _id: string,
    title: string,
    path?: string,
    page?: string,
    icon?: string,
    items?: MenuConfigInterface[]
}