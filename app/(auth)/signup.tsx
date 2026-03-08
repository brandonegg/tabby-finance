import { Link, useRouter } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Alert, Pressable, Text, View } from "react-native";
import { AuthShell } from "@/components/ui/auth-shell";
import { FormField } from "@/components/ui/form-field";
import { authClient } from "@/lib/auth-client";

export default function SignUpScreen() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignUp = async () => {
    if (!name || !email || !password || !confirmPassword) {
      Alert.alert("Error", "Please fill in all fields.");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match.");
      return;
    }

    if (password.length < 8) {
      Alert.alert("Error", "Password must be at least 8 characters.");
      return;
    }

    setLoading(true);
    try {
      const { error } = await authClient.signUp.email({
        name,
        email,
        password,
      });

      if (error) {
        Alert.alert("Sign Up Failed", error.message ?? "Could not create account.");
        return;
      }

      router.replace("/(app)");
    } catch {
      Alert.alert("Error", "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      eyebrow="New workspace"
      title="Build a steadier money routine."
      subtitle="Create your account to review balances, institutions, and activity in one consistent mobile flow."
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
          onChangeText={setName}
          autoCapitalize="words"
        />

        <FormField
          label="Email"
          placeholder="you@company.com"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
        />

        <FormField
          label="Password"
          placeholder="At least 8 characters"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <FormField
          label="Confirm password"
          placeholder="Repeat your password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
        />
      </View>

      <Pressable
        className={`mt-3 items-center rounded-2xl px-4 py-4 ${
          loading ? "bg-tabby-accent/70" : "bg-tabby-accent"
        }`}
        onPress={handleSignUp}
        disabled={loading}
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
        <Pressable className="mt-6 items-center">
          <Text className="text-sm text-tabby-muted">
            Already have an account?{" "}
            <Text className="font-semibold text-tabby-accent">Sign in</Text>
          </Text>
        </Pressable>
      </Link>
    </AuthShell>
  );
}
