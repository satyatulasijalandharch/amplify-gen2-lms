import { type ClientSchema, a, defineData } from '@aws-amplify/backend';
import { postConfirmation } from '../auth/post-confirmation/resource';

const schema = a.schema({
  // UserProfile model
  UserProfile: a.model({
    name: a.string().required(),
    email: a.email().required(),
    image: a.string(),
    enrollments: a.hasMany("Enrollment", "userId"),
    stripeCustomerId: a.string(),

  }).authorization(allow => [
    allow.guest().to(['read']),
    allow.authenticated().to(['read', "create", "update"]),
    allow.groups(['ADMIN'])
  ]),

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
    enrollments: a.hasMany("Enrollment", "courseId"),

  }).secondaryIndexes((index) => [index("slug")])
    .authorization(allow => [
      allow.guest().to(['read']),
      allow.authenticated().to(['read']),
      allow.groups(['ADMIN'])
    ]),

  // Chapter model
  Chapter: a.model({
    title: a.string().required(),
    position: a.integer().required(),
    courseId: a.id().required(),
    course: a.belongsTo("Course", "courseId"),
    lessons: a.hasMany("Lesson", "chapterId"),

  }).authorization(allow => [
    allow.guest().to(['read']),
    allow.authenticated().to(['read']),
    allow.groups(['ADMIN'])
  ]),

  // Lesson model
  Lesson: a.model({
    title: a.string().required(),
    description: a.string(),
    thumbnailKey: a.string(),
    videoKey: a.string(),
    position: a.integer().required(),
    chapterId: a.id().required(),
    chapter: a.belongsTo("Chapter", "chapterId"),

  }).authorization(allow => [
    allow.guest().to(['read']),
    allow.authenticated().to(['read']),
    allow.groups(['ADMIN'])
  ]),

  // Enrollment
  Enrollment: a.model({
    amount: a.integer().required(),
    status: a.enum(['Pending', 'Active', 'Canceled']),
    courseId: a.id().required(),
    course: a.belongsTo("Course", "courseId"),
    userId: a.id().required(),
    user: a.belongsTo("UserProfile", "userId"),

  }).identifier(['userId', 'courseId']) // Composite Key to uniquely identify enrollments
    .authorization(allow => [
      allow.guest().to(["read", "update"]),
      allow.authenticated().to(["read", "create", "update"]),
      allow.groups(['ADMIN']),
    ]),

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
