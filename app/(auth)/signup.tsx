import { Link, useRouter } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import { AuthShell } from "@/components/ui/auth-shell";
import { FormField } from "@/components/ui/form-field";
import { authClient } from "@/lib/auth-client";
import { testIds } from "@/lib/test-ids";

interface SignUpErrors {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  form?: string;
}

export default function SignUpScreen() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<SignUpErrors>({});
  const [loading, setLoading] = useState(false);

  const clearErrors = (fields: Array<keyof SignUpErrors>) => {
    setErrors((current) => {
      const nextErrors = {
        ...current,
        form: undefined,
      };

      for (const field of fields) {
        nextErrors[field] = undefined;
      }

      return nextErrors;
    });
  };

  const validateSignUp = () => {
    const nextErrors: SignUpErrors = {};

    if (!name.trim()) {
      nextErrors.name = "Enter the name you want on your account.";
    }

    if (!email.trim()) {
      nextErrors.email = "Enter an email so you can sign back in.";
    }

    if (!password) {
      nextErrors.password = "Choose a password with at least 8 characters.";
    } else if (password.length < 8) {
      nextErrors.password = "Password must be at least 8 characters.";
    }

    if (!confirmPassword) {
      nextErrors.confirmPassword = "Repeat your password to confirm it.";
    } else if (password !== confirmPassword) {
      nextErrors.confirmPassword = "Passwords do not match yet.";
    }

    setErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  };

  const handleSignUp = async () => {
    if (!validateSignUp()) {
      return;
    }

    setErrors({});
    setLoading(true);
    try {
      const { error } = await authClient.signUp.email({
        name: name.trim(),
        email: email.trim(),
        password,
      });

      if (error) {
        setErrors({ form: error.message ?? "Could not create account." });
        return;
      }

      router.replace("/(app)");
    } catch {
      setErrors({ form: "Something went wrong. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      eyebrow="New workspace"
      title="Build a steadier money routine."
      subtitle="Create your account to review balances, institutions, and activity in one consistent mobile flow."
      testID={testIds.auth.signup.screen}
    >
      <Text className="text-2xl font-semibold text-tabby-ink">Create account</Text>
      <Text className="mt-2 text-sm leading-6 text-tabby-muted">
        Start with the basics. You can connect institutions after setup.
      </Text>

      <View className="mt-6">
        <FormField
          label="Full name"
          placeholder="Alex Morgan"
          value={name}
          onChangeText={(value) => {
            setName(value);
            clearErrors(["name"]);
          }}
          autoCapitalize="words"
          testID={testIds.auth.signup.nameInput}
          error={errors.name}
          errorTestID={testIds.auth.signup.nameError}
        />

        <FormField
          label="Email"
          placeholder="you@company.com"
          value={email}
          onChangeText={(value) => {
            setEmail(value);
            clearErrors(["email"]);
          }}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          testID={testIds.auth.signup.emailInput}
          error={errors.email}
          errorTestID={testIds.auth.signup.emailError}
        />

        <FormField
          label="Password"
          placeholder="At least 8 characters"
          value={password}
          onChangeText={(value) => {
            setPassword(value);
            clearErrors(["password", "confirmPassword"]);
          }}
          secureTextEntry
          testID={testIds.auth.signup.passwordInput}
          error={errors.password}
          errorTestID={testIds.auth.signup.passwordError}
        />

        <FormField
          label="Confirm password"
          placeholder="Repeat your password"
          value={confirmPassword}
          onChangeText={(value) => {
            setConfirmPassword(value);
            clearErrors(["confirmPassword"]);
          }}
          secureTextEntry
          testID={testIds.auth.signup.confirmPasswordInput}
          error={errors.confirmPassword}
          errorTestID={testIds.auth.signup.confirmPasswordError}
        />
      </View>

      {errors.form ? (
        <View
          className="mt-3 rounded-[22px] border border-tabby-danger/20 bg-tabby-danger-soft px-4 py-4"
          testID={testIds.auth.signup.formError}
        >
          <Text className="text-sm leading-6 text-tabby-danger-strong">{errors.form}</Text>
        </View>
      ) : null}

      <Pressable
        className={`mt-4 items-center rounded-2xl px-4 py-4 ${
          loading ? "bg-tabby-accent/70" : "bg-tabby-accent"
        }`}
        onPress={handleSignUp}
        disabled={loading}
        testID={testIds.auth.signup.submitButton}
      >
        {loading ? (
          <ActivityIndicator color="#fffaf2" />
        ) : (
          <Text className="text-base font-semibold text-tabby-paper">Create Account</Text>
        )}
      </Pressable>

      <Text className="mt-4 text-center text-sm leading-6 text-tabby-muted">
        Tabby keeps the UI simple and the financial context clear from day one.
      </Text>

      <Link href="/(auth)/login" asChild>
        <Pressable
          className="mt-6 min-h-11 items-center justify-center rounded-2xl border border-tabby-line bg-tabby-cloud px-4 py-3"
          testID={testIds.auth.signup.loginLink}
        >
          <Text className="text-sm text-tabby-muted">
            Already have an account?{" "}
            <Text className="font-semibold text-tabby-accent">Sign in</Text>
          </Text>
        </Pressable>
      </Link>
    </AuthShell>
  );
}
