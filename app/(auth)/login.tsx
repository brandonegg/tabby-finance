import { Link, useRouter } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Alert, Pressable, Text, View } from "react-native";
import { AuthShell } from "@/components/ui/auth-shell";
import { FormField } from "@/components/ui/form-field";
import { authClient } from "@/lib/auth-client";

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please fill in all fields.");
      return;
    }

    setLoading(true);
    try {
      const { error } = await authClient.signIn.email({
        email,
        password,
      });

      if (error) {
        Alert.alert("Login Failed", error.message ?? "Invalid credentials.");
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
      eyebrow="Tabby Finance"
      title="See the whole picture."
      subtitle="Track every linked account in one calm mobile view, without losing trust or context."
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
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
        />

        <FormField
          label="Password"
          placeholder="Enter your password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
      </View>

      <Pressable
        className={`mt-3 items-center rounded-2xl px-4 py-4 ${
          loading ? "bg-tabby-accent/70" : "bg-tabby-accent"
        }`}
        onPress={handleLogin}
        disabled={loading}
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
        <Pressable className="mt-6 items-center">
          <Text className="text-sm text-tabby-muted">
            Need an account? <Text className="font-semibold text-tabby-accent">Create one</Text>
          </Text>
        </Pressable>
      </Link>
    </AuthShell>
  );
}
