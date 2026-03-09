import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { floatingTabBarHeight, getFloatingTabBarBottom } from "@/lib/layout";
import { testIds } from "@/lib/test-ids";
import { tabbyColors } from "@/lib/ui";

const TAB_TINT = tabbyColors.accent;
const TAB_MUTED = tabbyColors.muted;

export default function AppTabsLayout() {
  const insets = useSafeAreaInsets();
  const tabBarBottom = getFloatingTabBarBottom(insets.bottom);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: TAB_TINT,
        tabBarInactiveTintColor: TAB_MUTED,
        tabBarStyle: {
          position: "absolute",
          left: 16,
          right: 16,
          bottom: tabBarBottom,
          height: floatingTabBarHeight,
          paddingTop: 10,
          paddingBottom: 12,
          borderTopWidth: 0,
          backgroundColor: tabbyColors.paper,
          borderRadius: 28,
          shadowColor: tabbyColors.ink,
          shadowOpacity: 0.12,
          shadowRadius: 20,
          shadowOffset: { width: 0, height: 12 },
          elevation: 12,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "600",
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Accounts",
          tabBarButtonTestID: testIds.app.tabs.accounts,
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? "wallet" : "wallet-outline"} size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarButtonTestID: testIds.app.tabs.profile,
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? "person" : "person-outline"} size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
