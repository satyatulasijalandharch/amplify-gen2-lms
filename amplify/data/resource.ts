import { type ClientSchema, a, defineData } from '@aws-amplify/backend';

const schema = a.schema({
  Course: a.model({
    title: a.string().required(),
    description: a.string().required(),
  }).authorization(allow => [
    allow.guest().to(['read']),
    allow.owner()
  ]),
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: 'userPool',
  },
});
