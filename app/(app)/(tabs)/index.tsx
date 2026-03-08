import { useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  SectionList,
  Text,
  View,
} from "react-native";
import { apiUrl } from "@/lib/api";

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

interface AccountSection {
  title: string;
  data: Array<AccountSummary>;
}

export default function AccountsListScreen() {
  const router = useRouter();
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

  const sections = accounts.reduce<Array<AccountSection>>((grouped, account) => {
    const title = account.orgName?.trim() || "Other institutions";
    const existing = grouped.find((section) => section.title === title);

    if (existing) {
      existing.data.push(account);
      return grouped;
    }

    grouped.push({ title, data: [account] });
    return grouped;
  }, []);

  return (
    <View className="flex-1 bg-slate-100">
      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color="#1a73e8" size="large" />
        </View>
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={(item) => item.id}
          renderSectionHeader={({ section }) => (
            <View className="mb-3 mt-2">
              <Text className="text-xs font-semibold uppercase tracking-[1.5px] text-slate-500">
                {section.title}
              </Text>
            </View>
          )}
          renderItem={({ item }) => (
            <Pressable
              className="mb-3 rounded-2xl border border-slate-200 bg-white p-5"
              onPress={() => router.push(`/accounts/${item.id}`)}
            >
              <View className="mb-4 flex-row items-start justify-between">
                <View className="mr-4 flex-1">
                  <Text className="text-lg font-semibold text-slate-900">{item.name}</Text>
                  <Text className="mt-1 text-sm text-slate-500">
                    {item.orgName ?? "Institution unavailable"}
                  </Text>
                </View>

                <View className="rounded-full bg-blue-50 px-3 py-1">
                  <Text className="text-xs font-medium uppercase tracking-wide text-blue-700">
                    Live
                  </Text>
                </View>
              </View>

              <Text className="text-2xl font-bold text-slate-950">
                {formatCurrency(item.balance, item.currency)}
              </Text>
              <Text className="mt-1 text-sm text-slate-500">
                Current balance as of {formatDate(item.balanceDate)}
              </Text>

              <View className="mt-4 border-t border-slate-100 pt-4">
                <Text className="text-sm text-slate-600">
                  Last updated {formatDate(item.updatedAt)}
                </Text>
              </View>
            </Pressable>
          )}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#1a73e8" />
          }
          ListHeaderComponent={
            <View className="mb-6">
              <Text className="text-3xl font-bold text-slate-950">Connected accounts</Text>
              <Text className="mt-2 text-base leading-6 text-slate-600">
                Monitor balances across all linked institutions and tap into a full transaction
                history.
              </Text>
            </View>
          }
          ListEmptyComponent={
            <View className="items-center rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12">
              <Text className="text-lg font-semibold text-slate-900">
                No accounts connected yet
              </Text>
              <Text className="mt-2 text-center text-sm leading-6 text-slate-500">
                Connect a financial institution to start tracking balances and transactions.
              </Text>
              <Text className="mt-4 text-center text-sm font-medium text-slate-700">
                The account connection flow is the next step in the SimpleFin rollout.
              </Text>
            </View>
          }
          contentContainerStyle={{
            flexGrow: 1,
            paddingHorizontal: 20,
            paddingTop: 20,
            paddingBottom: 32,
          }}
          showsVerticalScrollIndicator={false}
        />
      )}

      {error ? (
        <View className="border-t border-rose-200 bg-rose-50 px-5 py-4">
          <Text className="text-sm text-rose-700">{error}</Text>
        </View>
      ) : null}
    </View>
  );
}

function formatCurrency(amount: string, currency: string): string {
  const num = Number.parseFloat(amount);
  try {
    return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(num);
  } catch {
    return `${num.toFixed(2)} ${currency}`;
  }
}

function normalizeTimestamp(timestamp: number): number {
  return timestamp > 1_000_000_000_000 ? timestamp : timestamp * 1000;
}

function formatDate(timestamp: number): string {
  return new Date(normalizeTimestamp(timestamp)).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
