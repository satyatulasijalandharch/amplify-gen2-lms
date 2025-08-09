import { type ClientSchema, a, defineData } from '@aws-amplify/backend';

const CourseLevel = a.enum(['Beginner', 'Intermediate', 'Advanced']);
const CourseStatus = a.enum(['Draft', 'Published', 'Archived']);

const schema = a.schema({
  // User model
  User: a.model({
    userId: a.id(),
    name: a.string(),
    email: a.email(),
    emailVerified: a.boolean(),
    image: a.string(),
    courses: a.hasMany('Course', 'userId'),
  }).authorization(allow => [allow.owner()]),

  // Course model

  Course: a.model({
    courseId: a.id(),
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
    userId: a.id(),
    user: a.belongsTo('User', 'userId'),

  }).authorization(allow => [
    allow.guest().to(['read']),
    allow.owner()
  ]),
});



export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: 'userPool'
  },
});
