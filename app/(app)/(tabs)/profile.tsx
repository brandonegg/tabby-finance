import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { ActivityIndicator, Alert, Pressable, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { authClient } from "@/lib/auth-client";
import {
  getFloatingTabBarContentPadding,
  horizontalScreenPadding,
  screenTopPadding,
} from "@/lib/layout";
import { testIds } from "@/lib/test-ids";
import { cardShadow, formatDate, getInitials, tabbyColors } from "@/lib/ui";

export default function ProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { data: session, isPending } = authClient.useSession();

  const handleLogout = async () => {
    try {
      await authClient.signOut();
      router.replace("/(auth)/login");
    } catch {
      Alert.alert("Error", "Failed to sign out.");
    }
  };

  if (isPending) {
    return (
      <View className="flex-1 items-center justify-center bg-tabby-canvas">
        <ActivityIndicator size="large" color={tabbyColors.accent} />
      </View>
    );
  }

  const user = session?.user;

  return (
    <ScrollView
      className="flex-1 bg-tabby-canvas"
      contentContainerStyle={{
        paddingHorizontal: horizontalScreenPadding,
        paddingTop: insets.top + screenTopPadding,
        paddingBottom: getFloatingTabBarContentPadding(insets.bottom),
      }}
      showsVerticalScrollIndicator={false}
      testID={testIds.app.profile.screen}
    >
      <View className="overflow-hidden rounded-[32px] bg-tabby-ink px-6 py-7">
        <View className="absolute -right-8 -top-10 h-32 w-32 rounded-full bg-tabby-accent/30" />
        <View className="absolute -left-8 bottom-0 h-20 w-20 rounded-full bg-white/10" />

        <View className="h-16 w-16 items-center justify-center rounded-full bg-white/12">
          <Text className="text-2xl font-semibold text-tabby-paper">{getInitials(user?.name)}</Text>
        </View>

        <Text className="mt-5 text-3xl font-semibold text-tabby-paper">
          {user?.name ?? "Tabby member"}
        </Text>
        <Text className="mt-2 text-base leading-7 text-white/72">
          {user?.email ?? "No email available"}
        </Text>

        <View className="mt-6 rounded-[24px] bg-white/10 px-4 py-4">
          <Text className="text-xs font-semibold uppercase tracking-[1.6px] text-white/60">
            Member since
          </Text>
          <Text className="mt-2 text-xl font-semibold text-tabby-paper">
            {user?.createdAt ? formatDate(new Date(user.createdAt).getTime()) : "Recently"}
          </Text>
        </View>
      </View>

      <View
        className="mt-5 rounded-[28px] border border-tabby-line bg-tabby-paper p-5"
        style={cardShadow}
      >
        <Text className="text-xl font-semibold text-tabby-ink">Account details</Text>
        <Text className="mt-2 text-sm leading-6 text-tabby-muted">
          Keep personal details and sign-in information easy to verify at a glance.
        </Text>

        <DetailRow label="Display name" value={user?.name ?? "Not set"} />
        <DetailRow label="Email" value={user?.email ?? "Not set"} />
        <DetailRow label="Security" value="Email and password authentication enabled" isLast />
      </View>

      <View
        className="mt-4 rounded-[28px] border border-tabby-line bg-tabby-paper p-5"
        style={cardShadow}
      >
        <Text className="text-xl font-semibold text-tabby-ink">Design notes</Text>
        <Text className="mt-2 text-sm leading-6 text-tabby-muted">
          The product uses clear surfaces, restrained accents, and high-contrast labels to keep
          financial information legible on mobile.
        </Text>

        <View className="mt-5 gap-3">
          <InfoPill icon="shield-checkmark-outline" label="Trust-first visual hierarchy" />
          <InfoPill icon="phone-portrait-outline" label="Comfortable thumb-sized touch targets" />
          <InfoPill icon="sparkles-outline" label="Reusable card and badge patterns" />
        </View>
      </View>

      <Pressable
        className="mt-4 flex-row items-center justify-center rounded-[24px] border border-tabby-danger/30 bg-tabby-danger-soft px-4 py-4"
        onPress={handleLogout}
        testID={testIds.app.profile.signOutButton}
      >
        <Ionicons name="log-out-outline" size={18} color={tabbyColors.danger} />
        <Text className="ml-2 text-base font-semibold text-tabby-danger">Sign Out</Text>
      </Pressable>
    </ScrollView>
  );
}

function DetailRow({
  label,
  value,
  isLast = false,
}: {
  label: string;
  value: string;
  isLast?: boolean;
}) {
  return (
    <View className={`mt-5 ${isLast ? "" : "border-b border-tabby-line pb-5"}`}>
      <Text className="text-xs font-semibold uppercase tracking-[1.6px] text-tabby-muted">
        {label}
      </Text>
      <Text className="mt-2 text-base leading-7 text-tabby-ink">{value}</Text>
    </View>
  );
}

function InfoPill({ icon, label }: { icon: keyof typeof Ionicons.glyphMap; label: string }) {
  return (
    <View className="flex-row items-center rounded-[22px] bg-tabby-cloud px-4 py-4">
      <View className="h-10 w-10 items-center justify-center rounded-full bg-tabby-paper">
        <Ionicons name={icon} size={18} color={tabbyColors.accent} />
      </View>
      <Text className="ml-3 flex-1 text-sm leading-6 text-tabby-ink">{label}</Text>
    </View>
  );
}
