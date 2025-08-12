import { defineStorage } from '@aws-amplify/backend';

export const storage = defineStorage({
    name: 'demoLMS',
    access: (allow) => ({
        'profile-pictures/*': [
            allow.guest.to(['read']),
            allow.entity('identity').to(['read', 'write', 'delete'])
        ],
        'thumbnail-image/*': [
            allow.authenticated.to(['read', 'write']),
            allow.guest.to(['read']),
            allow.entity('identity').to(['read', 'write', 'delete'])
        ]
    })
});