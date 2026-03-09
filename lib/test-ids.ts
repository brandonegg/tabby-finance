export const testIds = {
  auth: {
    login: {
      screen: "auth.login.screen",
      emailInput: "auth.login.email-input",
      passwordInput: "auth.login.password-input",
      submitButton: "auth.login.submit-button",
      signupLink: "auth.login.signup-link",
    },
    signup: {
      screen: "auth.signup.screen",
      nameInput: "auth.signup.name-input",
      emailInput: "auth.signup.email-input",
      passwordInput: "auth.signup.password-input",
      confirmPasswordInput: "auth.signup.confirm-password-input",
      submitButton: "auth.signup.submit-button",
      loginLink: "auth.signup.login-link",
    },
  },
  app: {
    tabs: {
      accounts: "app.tabs.accounts",
      profile: "app.tabs.profile",
    },
    accounts: {
      screen: "app.accounts.screen",
      heading: "app.accounts.heading",
    },
    profile: {
      screen: "app.profile.screen",
      signOutButton: "app.profile.sign-out-button",
    },
  },
} as const;
