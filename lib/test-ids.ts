export const testIds = {
  auth: {
    login: {
      screen: "auth.login.screen",
      emailInput: "auth.login.email-input",
      emailError: "auth.login.email-error",
      passwordInput: "auth.login.password-input",
      passwordError: "auth.login.password-error",
      formError: "auth.login.form-error",
      submitButton: "auth.login.submit-button",
      signupLink: "auth.login.signup-link",
    },
    signup: {
      screen: "auth.signup.screen",
      nameInput: "auth.signup.name-input",
      nameError: "auth.signup.name-error",
      emailInput: "auth.signup.email-input",
      emailError: "auth.signup.email-error",
      passwordInput: "auth.signup.password-input",
      passwordError: "auth.signup.password-error",
      confirmPasswordInput: "auth.signup.confirm-password-input",
      confirmPasswordError: "auth.signup.confirm-password-error",
      formError: "auth.signup.form-error",
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
