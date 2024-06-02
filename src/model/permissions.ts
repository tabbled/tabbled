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

export function hasPermission(config, action: string, userPermissions: any) {
    if (userPermissions.admin)
        return true;

    if (!config.permissions)
        return true

    let t = 'can' + action
    let perm = config.permissions[t]

    if (perm === undefined)
        return true

    switch (perm) {
        case 'all': return true;
        case 'nobody': return false;
        case 'roles':
            return config.permissions[`can${action}Roles`].some(r=> userPermissions.roles.includes(r))
        default: return false
    }
}