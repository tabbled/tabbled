import {HandlerInterface} from "./handler";

export type DataSourceEvent = 'onAdd' | 'onUpdate' | 'onRemove'
export type Event = DataSourceEvent

export interface EventHandlerInterface {
    event: Event,
    handler: HandlerInterface
}