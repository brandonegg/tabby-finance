import type { ReactNode } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { screenBottomPadding, screenTopPadding } from "@/lib/layout";
import { cardShadow } from "@/lib/ui";

interface AuthShellProps {
  eyebrow: string;
  title: string;
  subtitle: string;
  children: ReactNode;
  testID?: string;
}

export function AuthShell({ eyebrow, title, subtitle, children, testID }: AuthShellProps) {
  const insets = useSafeAreaInsets();

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-tabby-canvas"
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View
          className="flex-1 px-5"
          style={{
            paddingTop: screenTopPadding,
            paddingBottom: insets.bottom + screenBottomPadding,
          }}
        >
          <View className="overflow-hidden rounded-[32px] bg-tabby-ink px-6 py-7">
            <View className="absolute -right-8 -top-12 h-36 w-36 rounded-full bg-tabby-accent/25" />
            <View className="absolute -left-10 bottom-0 h-24 w-24 rounded-full bg-white/10" />

            <Text className="text-xs font-semibold uppercase tracking-[2px] text-white/65">
              {eyebrow}
            </Text>
            <Text className="mt-4 text-4xl font-semibold leading-tight text-tabby-paper">
              {title}
            </Text>
            <Text className="mt-3 max-w-[280px] text-base leading-7 text-white/72">{subtitle}</Text>

            <View className="mt-6 flex-row flex-wrap gap-3">
              <View className="rounded-full border border-white/10 bg-white/10 px-4 py-2">
                <Text className="text-xs font-medium text-tabby-paper">Private by default</Text>
              </View>
              <View className="rounded-full border border-white/10 bg-white/10 px-4 py-2">
                <Text className="text-xs font-medium text-tabby-paper">
                  Built for daily clarity
                </Text>
              </View>
            </View>
          </View>

          <View
            className="mt-6 rounded-[28px] border border-tabby-line bg-tabby-paper px-5 py-6"
            style={cardShadow}
            testID={testID}
          >
            {children}
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
