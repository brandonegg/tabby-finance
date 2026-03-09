import { Link, useRouter } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import { AuthShell } from "@/components/ui/auth-shell";
import { FormField } from "@/components/ui/form-field";
import { authClient } from "@/lib/auth-client";
import { testIds } from "@/lib/test-ids";

interface LoginErrors {
  email?: string;
  password?: string;
  form?: string;
}

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<LoginErrors>({});
  const [loading, setLoading] = useState(false);

  const handleEmailChange = (value: string) => {
    setEmail(value);
    setErrors((current) => ({
      ...current,
      email: undefined,
      form: undefined,
    }));
  };

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    setErrors((current) => ({
      ...current,
      password: undefined,
      form: undefined,
    }));
  };

  const validateLogin = () => {
    const nextErrors: LoginErrors = {};

    if (!email.trim()) {
      nextErrors.email = "Enter the email tied to your account.";
    }

    if (!password) {
      nextErrors.password = "Enter your password to continue.";
    }

    setErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validateLogin()) {
      return;
    }

    setErrors({});
    setLoading(true);
    try {
      const { error } = await authClient.signIn.email({
        email: email.trim(),
        password,
      });

      if (error) {
        setErrors({ form: error.message ?? "Invalid credentials." });
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
      eyebrow="Tabby Finance"
      title="See the whole picture."
      subtitle="Track every linked account in one calm mobile view, without losing trust or context."
      testID={testIds.auth.login.screen}
    >
      <Text className="text-2xl font-semibold text-tabby-ink">Sign in</Text>
      <Text className="mt-2 text-sm leading-6 text-tabby-muted">
        Use the email and password tied to your account.
      </Text>

      <View className="mt-6">
        <FormField
          label="Email"
          placeholder="you@company.com"
          value={email}
          onChangeText={handleEmailChange}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          testID={testIds.auth.login.emailInput}
          error={errors.email}
        />

        <FormField
          label="Password"
          placeholder="Enter your password"
          value={password}
          onChangeText={handlePasswordChange}
          secureTextEntry
          testID={testIds.auth.login.passwordInput}
          error={errors.password}
        />
      </View>

      {errors.form ? (
        <View className="mt-3 rounded-[22px] border border-tabby-danger/20 bg-tabby-danger-soft px-4 py-4">
          <Text className="text-sm leading-6 text-tabby-danger-strong">{errors.form}</Text>
        </View>
      ) : null}

      <Pressable
        className={`mt-4 items-center rounded-2xl px-4 py-4 ${
          loading ? "bg-tabby-accent/70" : "bg-tabby-accent"
        }`}
        onPress={handleLogin}
        disabled={loading}
        testID={testIds.auth.login.submitButton}
      >
        {loading ? (
          <ActivityIndicator color="#fffaf2" />
        ) : (
          <Text className="text-base font-semibold text-tabby-paper">Sign In</Text>
        )}
      </Pressable>

      <Text className="mt-4 text-center text-sm leading-6 text-tabby-muted">
        Your credentials stay between you and your provider.
      </Text>

      <Link href="/(auth)/signup" asChild>
        <Pressable
          className="mt-6 min-h-11 items-center justify-center rounded-2xl border border-tabby-line bg-tabby-cloud px-4 py-3"
          testID={testIds.auth.login.signupLink}
        >
          <Text className="text-sm text-tabby-muted">
            Need an account? <Text className="font-semibold text-tabby-accent">Create one</Text>
          </Text>
        </Pressable>
      </Link>
    </AuthShell>
  );
}
