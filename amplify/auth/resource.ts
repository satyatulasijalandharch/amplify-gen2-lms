import { defineAuth } from '@aws-amplify/backend';

export const auth = defineAuth({
  loginWith: {
    email: {
      verificationEmailSubject: 'Welcome! Verify your email!'
    }
  },
  userAttributes: {
    email: {
      required: true,
      mutable: true,
    },
    fullname: {
      required: false,
      mutable: true,
    },
    profilePicture: {
      required: false,
      mutable: true,
    }
  },
  groups: ["ADMINS"],
});
