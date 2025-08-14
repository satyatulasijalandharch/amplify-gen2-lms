import { type ClientSchema, a, defineData } from '@aws-amplify/backend';
import { postConfirmation } from '../auth/post-confirmation/resource';

const schema = a.schema({
  // UserProfile model
  UserProfile: a.model({
    id: a.id().required().authorization(allow => [allow.ownerDefinedIn('id').to(['read'])]),
    name: a.string().required(),
    email: a.email().required(),
    image: a.string(),
  }).identifier(['id'])
    .authorization(allow => [allow.ownerDefinedIn('id')]),

  // Course model
  Course: a.model({
    id: a.id().required().authorization(allow => [
      allow.guest().to(['read']),
      allow.authenticated().to(['read']),
    ]),
    title: a.string().required(),
    description: a.string().required(),
    fileKey: a.string().required(),
    price: a.integer().required(),
    duration: a.integer().required(),
    level: a.ref("CourseLevel").required(),
    category: a.string().required(),
    smallDescription: a.string().required(),
    slug: a.string().required(),
    status: a.ref("CourseStatus").required(),
    chapter: a.hasMany("Chapter", "id"),

  }).identifier(['id'])
    .authorization(allow => [
      allow.guest().to(['read']),
      allow.authenticated().to(['read']),
      allow.groups(['ADMIN'])
    ]),

  CourseStatus: a.enum(['Draft', 'Published', 'Archived']),
  CourseLevel: a.enum(['Beginner', 'Intermediate', 'Advanced']),

  // Chapter model
  Chapter: a.model({
    id: a.id().required(),
    title: a.string().required(),
    position: a.integer().required(),
    Course: a.belongsTo("Course", "id"),
    courseId: a.id().required(),
    lessons: a.hasMany("Lesson", "id"),
  }).identifier(['id'])
    .authorization(allow => [
      allow.guest().to(['read']),
      allow.authenticated().to(['read']),
      allow.groups(['ADMIN'])
    ]),

  // Lesson model
  Lesson: a.model({
    id: a.id().required(),
    title: a.string().required(),
    description: a.string(),
    thumbnailKey: a.string(),
    videoKey: a.string(),
    position: a.integer().required(),
    Chapter: a.belongsTo("Chapter", "id"),
    chapterId: a.id().required(),
  }).identifier(['id'])
    .authorization(allow => [
      allow.guest().to(['read']),
      allow.authenticated().to(['read']),
      allow.groups(['ADMIN'])
    ]),

}).authorization((allow) => [allow.resource(postConfirmation)]);



export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: 'userPool'
  },
});
