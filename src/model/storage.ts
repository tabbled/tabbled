export interface Storage {
    insert(data: object): Promise<any>
    update(id: number | string, data: object): Promise<any>
    getMany(filters?: object[]): Promise<any>
    getById(id: number | string): Promise<any>
    removeById(id: number | string): Promise<any>
}