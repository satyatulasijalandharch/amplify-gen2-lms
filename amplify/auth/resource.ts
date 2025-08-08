import { defineAuth } from '@aws-amplify/backend';

export const auth = defineAuth({
  loginWith: {
    email: {
      verificationEmailStyle: 'CODE',
      verificationEmailSubject: 'Welcome you onboard!',
      verificationEmailBody: (createCode) => `Use this code to confirm your account: ${createCode()}`,
      userInvitation: {
        emailSubject: 'You are invited to join our platform!',
        emailBody: (user, code) => `We're happy to have you! You can now login with email: ${user()} and temporary password: ${code()}`,
      }
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
