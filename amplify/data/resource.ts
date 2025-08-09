import { type ClientSchema, a, defineData } from '@aws-amplify/backend';
import { postConfirmation } from '../auth/post-confirmation/resource';

const CourseLevel = a.enum(['Beginner', 'Intermediate', 'Advanced']);
const CourseStatus = a.enum(['Draft', 'Published', 'Archived']);

const schema = a.schema({
  // UserProfile model
  UserProfile: a.model({
    userId: a.id().required().authorization(allow => [allow.ownerDefinedIn('userId').to(['read'])]),
    name: a.string(),
    email: a.email(),
    image: a.string(),
    courses: a.hasMany('Course', 'userId'),
  }).identifier(['userId'])
    .authorization(allow => [allow.ownerDefinedIn('userId')]),


  // Course model
  Course: a.model({
    courseId: a.id().authorization(allow => [
      allow.guest().to(['read']),
      allow.authenticated().to(['read']),
      allow.ownerDefinedIn('userId')
    ]),
    title: a.string(),
    description: a.string(),
    fileKey: a.string(),
    price: a.integer(),
    duration: a.integer(),
    level: CourseLevel,
    category: a.string(),
    smallDescription: a.string(),
    slug: a.string(),
    status: CourseStatus,
    userId: a.id().authorization(allow => [allow.ownerDefinedIn('userId').to(['read'])]),
    user: a.belongsTo('UserProfile', 'userId'),

  }).identifier(['courseId'])
    .authorization(allow => [
      allow.guest().to(['read']),
      allow.authenticated().to(['read']),
      allow.ownerDefinedIn('userId')
    ]),
}).authorization((allow) => [allow.resource(postConfirmation)]);



export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: 'userPool'
  },
});
