import { defineStorage } from '@aws-amplify/backend';

export const storage = defineStorage({
    name: 'demoLMS',
    access: (allow) => ({
        'media/profile-pictures/*': [
            allow.guest.to(['read']),
            allow.authenticated.to(['read']),
            allow.groups(['ADMIN']).to(['read', 'write', 'delete'])
        ],
        'media/thumbnail-image/*': [
            allow.guest.to(['get']),
            allow.authenticated.to(['read']),
            allow.groups(['ADMIN']).to(['read', 'write', 'delete'])
        ],
        'media/thumbnail-video/*': [
            allow.guest.to(['get']),
            allow.authenticated.to(['read']),
            allow.groups(['ADMIN']).to(['read', 'write', 'delete'])
        ],
    })
});