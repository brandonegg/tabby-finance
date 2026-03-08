import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";

const TAB_TINT = "#1a73e8";
const TAB_MUTED = "#64748b";

export default function AppTabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: "#1a73e8" },
        headerTintColor: "#fff",
        headerTitleStyle: { fontWeight: "bold" },
        tabBarActiveTintColor: TAB_TINT,
        tabBarInactiveTintColor: TAB_MUTED,
        tabBarStyle: {
          height: 64,
          paddingTop: 8,
          paddingBottom: 8,
          borderTopWidth: 1,
          borderTopColor: "#dbe3ef",
          backgroundColor: "#ffffff",
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
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? "wallet" : "wallet-outline"} size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? "person" : "person-outline"} size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
