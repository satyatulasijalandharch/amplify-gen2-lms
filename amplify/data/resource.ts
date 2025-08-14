import { type ClientSchema, a, defineData } from '@aws-amplify/backend';
import { postConfirmation } from '../auth/post-confirmation/resource';

const schema = a.schema({
  // UserProfile model
  UserProfile: a.model({
    id: a.id().required().authorization(allow => [allow.ownerDefinedIn('id').to(['read'])]),
    name: a.string(),
    email: a.email(),
    image: a.string(),
  }).identifier(['id'])
    .authorization(allow => [allow.ownerDefinedIn('id')]),

  // Course model
  Course: a.model({
    id: a.id().authorization(allow => [
      allow.guest().to(['read']),
      allow.authenticated().to(['read']),
    ]),
    title: a.string(),
    description: a.string(),
    fileKey: a.string(),
    price: a.integer(),
    duration: a.integer(),
    level: a.ref("CourseLevel"),
    category: a.string(),
    smallDescription: a.string(),
    slug: a.string(),
    status: a.ref("CourseStatus"),

  }).identifier(['id'])
    .authorization(allow => [
      allow.guest().to(['read']),
      allow.authenticated().to(['read']),
      allow.groups(['ADMIN'])
    ]),

  CourseStatus: a.enum(['Draft', 'Published', 'Archived']),
  CourseLevel: a.enum(['Beginner', 'Intermediate', 'Advanced'])

}).authorization((allow) => [allow.resource(postConfirmation)]);



export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: 'userPool'
  },
});
