export type HandlerType = 'script' | 'function'

export interface HandlerInterface {
    type: HandlerType,
    script?: string,
    functionId?: string | null
}