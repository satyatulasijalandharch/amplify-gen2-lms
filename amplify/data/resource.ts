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
    title: a.string().required(),
    description: a.string().required(),
    fileKey: a.string().required(),
    price: a.integer().required(),
    duration: a.integer().required(),
    level: a.enum(['Beginner', 'Intermediate', 'Advanced']),
    category: a.string().required(),
    smallDescription: a.string().required(),
    slug: a.string().required(),
    status: a.enum(['Draft', 'Published', 'Archived']),
    chapters: a.hasMany("Chapter", "courseId"),
  }),

  // Chapter model
  Chapter: a.model({
    title: a.string().required(),
    position: a.integer().required(),
    courseId: a.id().required(),
    course: a.belongsTo("Course", "courseId"),
    lessons: a.hasMany("Lesson", "chapterId"),
  }),

  // Lesson model
  Lesson: a.model({
    title: a.string().required(),
    description: a.string(),
    thumbnailKey: a.string(),
    videoKey: a.string(),
    position: a.integer().required(),
    chapterId: a.id().required(),
    chapter: a.belongsTo("Chapter", "chapterId"),
  }),

}).authorization((allow) => [
  allow.resource(postConfirmation),
  allow.authenticated(),
]);



export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: 'userPool'
  },
});
