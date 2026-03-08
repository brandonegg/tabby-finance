import { Redirect, Stack } from "expo-router";
import { ActivityIndicator, View } from "react-native";
import { authClient } from "@/lib/auth-client";
import { tabbyColors } from "@/lib/ui";

export default function AppLayout() {
  const { data: session, isPending } = authClient.useSession();

  if (isPending) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: tabbyColors.canvas,
        }}
      >
        <ActivityIndicator size="large" color={tabbyColors.accent} />
      </View>
    );
  }

  if (!session) {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <Stack
      screenOptions={{
        contentStyle: { backgroundColor: tabbyColors.canvas },
        headerStyle: { backgroundColor: tabbyColors.ink },
        headerTintColor: tabbyColors.paper,
        headerShadowVisible: false,
        headerTitleStyle: { fontWeight: "700" },
      }}
    >
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="accounts/[id]" />
    </Stack>
  );
}
