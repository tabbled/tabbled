import {AccessType} from "./permissions";

export interface MenuConfigInterface {
    id: string,
    title: string,
    path?: string,
    page?: string,
    icon?: string,
    items?: MenuConfigInterface[],
    visibilityRoles: string[],
    visibility: AccessType
}