import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Pressable, RefreshControl, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { apiUrl } from "@/lib/api";
import {
  getFloatingTabBarContentPadding,
  horizontalScreenPadding,
  screenTopPadding,
} from "@/lib/layout";
import { testIds } from "@/lib/test-ids";
import { cardShadow, formatCurrency, formatDate, formatRelativeDate, tabbyColors } from "@/lib/ui";

interface AccountSummary {
  id: string;
  name: string;
  orgName: string | null;
  balance: string;
  currency: string;
  balanceDate: number;
  updatedAt: number;
}

interface AccountsResponse {
  accounts: Array<AccountSummary>;
}

export default function AccountsListScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [accounts, setAccounts] = useState<Array<AccountSummary>>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAccounts = useCallback(async () => {
    const response = await fetch(apiUrl("/api/accounts"));
    if (!response.ok) {
      const body = await response.json().catch(() => null);
      throw new Error(body?.error ?? `Request failed (${response.status})`);
    }

    const data: AccountsResponse = await response.json();
    setAccounts(data.accounts);
    setError(null);
  }, []);

  useEffect(() => {
    setLoading(true);
    void fetchAccounts()
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Failed to load accounts");
      })
      .finally(() => setLoading(false));
  }, [fetchAccounts]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await fetchAccounts();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to refresh accounts");
    } finally {
      setRefreshing(false);
    }
  }, [fetchAccounts]);

  const currencies = Array.from(new Set(accounts.map((account) => account.currency))).filter(
    Boolean,
  );
  const sharedCurrency = currencies.length === 1 ? currencies[0] : null;
  const institutionCount = new Set(accounts.map((account) => account.orgName ?? account.id)).size;
  const latestUpdate = Math.max(...accounts.map((account) => account.updatedAt), 0);
  const totalBalance = accounts.reduce(
    (sum, account) => sum + Number.parseFloat(account.balance),
    0,
  );

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-tabby-canvas">
        <ActivityIndicator color={tabbyColors.accent} size="large" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-tabby-canvas" testID={testIds.app.accounts.screen}>
      <FlatList
        data={accounts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Pressable
            className="mb-4 rounded-[28px] border border-tabby-line bg-tabby-paper p-5"
            style={cardShadow}
            onPress={() => router.push(`/accounts/${item.id}`)}
          >
            <View className="flex-row items-start justify-between">
              <View className="mr-4 flex-1">
                <Text className="text-xs font-semibold uppercase tracking-[1.8px] text-tabby-muted">
                  {item.orgName ?? "Linked institution"}
                </Text>
                <Text className="mt-2 text-2xl font-semibold text-tabby-ink">{item.name}</Text>
              </View>

              <View className="rounded-full bg-tabby-accent-soft px-3 py-2">
                <Text className="text-xs font-semibold uppercase tracking-[1.2px] text-tabby-accent">
                  Synced
                </Text>
              </View>
            </View>

            <Text className="mt-6 text-3xl font-semibold text-tabby-ink">
              {formatCurrency(item.balance, item.currency)}
            </Text>
            <Text className="mt-2 text-sm leading-6 text-tabby-muted">
              Balance date {formatDate(item.balanceDate)}
            </Text>

            <View className="mt-5 flex-row items-center justify-between border-t border-tabby-line pt-4">
              <Text className="text-sm text-tabby-muted">
                Updated {formatRelativeDate(item.updatedAt)}
              </Text>
              <Ionicons name="chevron-forward" size={18} color={tabbyColors.muted} />
            </View>
          </Pressable>
        )}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={tabbyColors.accent}
          />
        }
        ListHeaderComponent={
          <View className="pb-3">
            <View className="overflow-hidden rounded-[32px] bg-tabby-ink px-6 py-7">
              <View className="absolute -right-10 -top-14 h-40 w-40 rounded-full bg-tabby-accent/30" />
              <View className="absolute -left-6 bottom-0 h-24 w-24 rounded-full bg-white/10" />

              <Text className="text-xs font-semibold uppercase tracking-[2px] text-white/60">
                Accounts overview
              </Text>
              <Text className="mt-4 text-4xl font-semibold leading-tight text-tabby-paper">
                {sharedCurrency
                  ? formatCurrency(totalBalance, sharedCurrency)
                  : `${accounts.length} connected accounts`}
              </Text>
              <Text className="mt-3 max-w-[280px] text-sm leading-6 text-white/72">
                {sharedCurrency
                  ? "A single view of your linked balances, refreshed whenever you pull to sync."
                  : "Your accounts use multiple currencies, so balances stay grouped by account for accuracy."}
              </Text>

              <View className="mt-7 flex-row gap-3">
                <View className="flex-1 rounded-[24px] bg-white/10 px-4 py-4">
                  <Text className="text-xs font-semibold uppercase tracking-[1.6px] text-white/60">
                    Institutions
                  </Text>
                  <Text className="mt-2 text-2xl font-semibold text-tabby-paper">
                    {institutionCount}
                  </Text>
                </View>
                <View className="flex-1 rounded-[24px] bg-white/10 px-4 py-4">
                  <Text className="text-xs font-semibold uppercase tracking-[1.6px] text-white/60">
                    Last sync
                  </Text>
                  <Text className="mt-2 text-2xl font-semibold text-tabby-paper">
                    {latestUpdate ? formatRelativeDate(latestUpdate) : "Pending"}
                  </Text>
                </View>
              </View>
            </View>

            <View className="mt-5 flex-row items-center justify-between">
              <View>
                <Text
                  className="text-2xl font-semibold text-tabby-ink"
                  testID={testIds.app.accounts.heading}
                >
                  Linked accounts
                </Text>
                <Text className="mt-1 text-sm leading-6 text-tabby-muted">
                  Tap into any account to review recent activity.
                </Text>
              </View>
              <View className="rounded-full bg-tabby-cloud px-3 py-2">
                <Text className="text-xs font-semibold uppercase tracking-[1.4px] text-tabby-ink">
                  Pull to refresh
                </Text>
              </View>
            </View>

            {error ? (
              <View className="mt-5 rounded-[24px] border border-tabby-danger/20 bg-tabby-danger-soft px-4 py-4">
                <Text className="text-sm leading-6 text-tabby-danger-strong">{error}</Text>
              </View>
            ) : null}
          </View>
        }
        ListEmptyComponent={
          <View
            className="mt-4 items-center rounded-[28px] border border-dashed border-tabby-line bg-tabby-paper px-6 py-12"
            style={cardShadow}
          >
            <View className="h-16 w-16 items-center justify-center rounded-full bg-tabby-cloud">
              <Ionicons name="wallet-outline" size={28} color={tabbyColors.accent} />
            </View>
            <Text className="mt-5 text-xl font-semibold text-tabby-ink">No accounts yet</Text>
            <Text className="mt-2 text-center text-sm leading-6 text-tabby-muted">
              Once the connection flow is enabled, linked accounts will show up here with balances
              and recent activity.
            </Text>
          </View>
        }
        contentContainerStyle={{
          flexGrow: 1,
          paddingHorizontal: horizontalScreenPadding,
          paddingTop: insets.top + screenTopPadding,
          paddingBottom: getFloatingTabBarContentPadding(insets.bottom),
        }}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}
