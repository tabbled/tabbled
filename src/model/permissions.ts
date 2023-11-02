export type AccessType = 'all' | 'roles' | 'nobody'

export class AccessTypeItem {
    alias: AccessType
    title: string
}

export function getAccessTypes(t):Array<AccessTypeItem> {
    return [{
        alias: 'all',
        title: t('all')
    }, {
        alias: 'roles',
        title: t('roles')
    }, {
        alias: 'nobody',
        title: t('nobody')
    }]
}