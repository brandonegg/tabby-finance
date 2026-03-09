import { Ionicons } from "@expo/vector-icons";
import { Stack, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Pressable, RefreshControl, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { apiUrl } from "@/lib/api";
import { horizontalScreenPadding, screenBottomPadding, screenTopPadding } from "@/lib/layout";
import { cardShadow, formatCurrency, formatDate, formatRelativeDate, tabbyColors } from "@/lib/ui";

interface Transaction {
  id: string;
  accountId: string;
  simplefinTransactionId: string;
  posted: number;
  amount: string;
  description: string;
  pending: number | null;
  transactedAt: number | null;
  createdAt: number;
  updatedAt: number;
}

interface AccountInfo {
  id: string;
  name: string;
  balance: string;
  currency: string;
  availableBalance: string | null;
  balanceDate: number;
  orgName: string | null;
}

interface TransactionsResponse {
  account: AccountInfo;
  transactions: Array<Transaction>;
  pagination: { limit: number; offset: number; count: number };
}

const PAGE_SIZE = 50;

export default function AccountTransactionsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const [account, setAccount] = useState<AccountInfo | null>(null);
  const [txns, setTxns] = useState<Array<Transaction>>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [pendingOnly, setPendingOnly] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTransactions = useCallback(
    async (offset = 0, append = false) => {
      try {
        const query = new URLSearchParams({
          limit: String(PAGE_SIZE),
          offset: String(offset),
        });
        if (pendingOnly) {
          query.set("pending", "1");
        }

        const res = await fetch(apiUrl(`/api/accounts/${id}/transactions?${query.toString()}`));
        if (!res.ok) {
          const body = await res.json().catch(() => null);
          throw new Error(body?.error ?? `Request failed (${res.status})`);
        }

        const data: TransactionsResponse = await res.json();
        setAccount(data.account);
        setTxns((prev) => (append ? [...prev, ...data.transactions] : data.transactions));
        setHasMore(data.pagination.count >= PAGE_SIZE);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load transactions");
      }
    },
    [id, pendingOnly],
  );

  useEffect(() => {
    setLoading(true);
    setTxns([]);
    setHasMore(true);
    void fetchTransactions(0).finally(() => setLoading(false));
  }, [fetchTransactions]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchTransactions(0);
    setRefreshing(false);
  }, [fetchTransactions]);

  const onEndReached = useCallback(async () => {
    if (loadingMore || !hasMore) {
      return;
    }

    setLoadingMore(true);
    await fetchTransactions(txns.length, true);
    setLoadingMore(false);
  }, [fetchTransactions, hasMore, loadingMore, txns.length]);

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-tabby-canvas">
        <ActivityIndicator size="large" color={tabbyColors.accent} />
      </View>
    );
  }

  if (error && account == null) {
    return (
      <View className="flex-1 items-center justify-center bg-tabby-canvas px-6">
        <Text className="text-center text-base leading-7 text-tabby-danger-strong">{error}</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-tabby-canvas">
      <Stack.Screen options={{ title: account?.name ?? "Activity" }} />

      <FlatList
        data={txns}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TransactionRow txn={item} currency={account?.currency ?? "USD"} />
        )}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={tabbyColors.accent}
          />
        }
        onEndReached={onEndReached}
        onEndReachedThreshold={0.3}
        ListHeaderComponent={
          <View className="pb-4">
            {account != null ? (
              <View className="overflow-hidden rounded-[32px] bg-tabby-ink px-6 py-7">
                <View className="absolute -right-10 -top-12 h-36 w-36 rounded-full bg-tabby-accent/30" />
                <View className="absolute -left-6 bottom-0 h-20 w-20 rounded-full bg-white/10" />

                <Text className="text-xs font-semibold uppercase tracking-[2px] text-white/60">
                  {account.orgName ?? "Account activity"}
                </Text>
                <Text className="mt-3 text-3xl font-semibold text-tabby-paper">{account.name}</Text>
                <Text className="mt-5 text-4xl font-semibold text-tabby-paper">
                  {formatCurrency(account.balance, account.currency)}
                </Text>
                <Text className="mt-2 text-sm leading-6 text-white/72">
                  Current balance as of {formatDate(account.balanceDate)}
                </Text>

                {account.availableBalance ? (
                  <View className="mt-6 rounded-[22px] bg-white/10 px-4 py-4">
                    <Text className="text-xs font-semibold uppercase tracking-[1.6px] text-white/60">
                      Available balance
                    </Text>
                    <Text className="mt-2 text-2xl font-semibold text-tabby-paper">
                      {formatCurrency(account.availableBalance, account.currency)}
                    </Text>
                  </View>
                ) : null}
              </View>
            ) : null}

            <View className="mt-5 flex-row items-center justify-between">
              <View>
                <Text className="text-2xl font-semibold text-tabby-ink">Recent activity</Text>
                <Text className="mt-1 text-sm leading-6 text-tabby-muted">
                  Review posted and pending transactions in one scroll.
                </Text>
              </View>
            </View>

            <View className="mt-4 flex-row gap-3">
              <FilterChip
                active={!pendingOnly}
                label="All activity"
                onPress={() => setPendingOnly(false)}
              />
              <FilterChip
                active={pendingOnly}
                label="Pending only"
                onPress={() => setPendingOnly(true)}
              />
            </View>

            {error ? (
              <View className="mt-4 rounded-[22px] border border-tabby-danger/20 bg-tabby-danger-soft px-4 py-4">
                <Text className="text-sm leading-6 text-tabby-danger-strong">{error}</Text>
              </View>
            ) : null}
          </View>
        }
        ListFooterComponent={
          loadingMore ? (
            <View className="py-6">
              <ActivityIndicator size="small" color={tabbyColors.accent} />
            </View>
          ) : null
        }
        ListEmptyComponent={
          <View
            className="mt-4 items-center rounded-[28px] border border-dashed border-tabby-line bg-tabby-paper px-6 py-12"
            style={cardShadow}
          >
            <View className="h-16 w-16 items-center justify-center rounded-full bg-tabby-cloud">
              <Ionicons name="receipt-outline" size={28} color={tabbyColors.accent} />
            </View>
            <Text className="mt-5 text-xl font-semibold text-tabby-ink">
              {pendingOnly ? "No pending transactions" : "No transactions found"}
            </Text>
            <Text className="mt-2 text-center text-sm leading-6 text-tabby-muted">
              {pendingOnly
                ? "Pending card holds and in-flight bank updates will appear here."
                : "Activity will appear here after your first sync."}
            </Text>
          </View>
        }
        contentContainerStyle={{
          flexGrow: 1,
          paddingHorizontal: horizontalScreenPadding,
          paddingTop: screenTopPadding,
          paddingBottom: insets.bottom + screenBottomPadding,
        }}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

function FilterChip({
  active,
  label,
  onPress,
}: {
  active: boolean;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      className={`min-h-11 flex-row items-center justify-center rounded-full px-4 py-2 ${
        active ? "bg-tabby-accent" : "bg-tabby-paper"
      }`}
      style={active ? undefined : cardShadow}
      onPress={onPress}
    >
      <Text className={`text-sm font-semibold ${active ? "text-tabby-paper" : "text-tabby-ink"}`}>
        {label}
      </Text>
    </Pressable>
  );
}

function TransactionRow({ txn, currency }: { txn: Transaction; currency: string }) {
  const amount = Number.parseFloat(txn.amount);
  const isPositive = amount >= 0;
  const isPending = txn.pending === 1;
  const displayDate = txn.transactedAt ?? txn.posted;

  const toneClass = isPending
    ? "bg-tabby-warning-soft"
    : isPositive
      ? "bg-tabby-positive-soft"
      : "bg-tabby-danger-soft";

  const iconColor = isPending
    ? tabbyColors.warningStrong
    : isPositive
      ? tabbyColors.positive
      : tabbyColors.dangerStrong;

  const iconName: keyof typeof Ionicons.glyphMap = isPending
    ? "time-outline"
    : isPositive
      ? "arrow-down-outline"
      : "arrow-up-outline";

  return (
    <View
      className="mb-4 flex-row items-center rounded-[28px] border border-tabby-line bg-tabby-paper p-4"
      style={cardShadow}
    >
      <View className={`h-12 w-12 items-center justify-center rounded-[18px] ${toneClass}`}>
        <Ionicons name={iconName} size={20} color={iconColor} />
      </View>

      <View className="ml-4 flex-1">
        <Text className="text-base font-semibold text-tabby-ink">{txn.description}</Text>
        <View className="mt-2 flex-row items-center gap-2">
          <Text className="text-sm text-tabby-muted">{formatDate(displayDate)}</Text>
          {isPending ? (
            <View className="rounded-full bg-tabby-warning-soft px-2 py-1">
              <Text className="text-xs font-semibold uppercase tracking-[1.2px] text-tabby-warning-strong">
                Pending
              </Text>
            </View>
          ) : (
            <Text className="text-sm text-tabby-muted">
              Updated {formatRelativeDate(txn.updatedAt)}
            </Text>
          )}
        </View>
      </View>

      <Text
        className={`ml-4 text-base font-semibold ${
          isPending
            ? "text-tabby-warning-strong"
            : isPositive
              ? "text-tabby-positive"
              : "text-tabby-danger"
        }`}
      >
        {isPositive ? "+" : ""}
        {formatCurrency(txn.amount, currency)}
      </Text>
    </View>
  );
}
