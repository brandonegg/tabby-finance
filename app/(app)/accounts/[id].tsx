import { Stack, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, Text, View } from "react-native";

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
  const [account, setAccount] = useState<AccountInfo | null>(null);
  const [txns, setTxns] = useState<Array<Transaction>>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTransactions = useCallback(
    async (offset = 0, append = false) => {
      try {
        const res = await fetch(
          `/api/accounts/${id}/transactions?limit=${PAGE_SIZE}&offset=${offset}`,
        );
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
    [id],
  );

  useEffect(() => {
    setLoading(true);
    void fetchTransactions(0).finally(() => setLoading(false));
  }, [fetchTransactions]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchTransactions(0);
    setRefreshing(false);
  }, [fetchTransactions]);

  const onEndReached = useCallback(async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    await fetchTransactions(txns.length, true);
    setLoadingMore(false);
  }, [loadingMore, hasMore, txns.length, fetchTransactions]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#1a73e8" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: account?.name ?? "Transactions" }} />

      {account != null ? (
        <View style={styles.header}>
          <Text style={styles.accountName}>{account.name}</Text>
          {account.orgName ? <Text style={styles.orgName}>{account.orgName}</Text> : null}
          <Text style={styles.balance}>{formatCurrency(account.balance, account.currency)}</Text>
          <Text style={styles.balanceLabel}>
            Current Balance
            {account.balanceDate ? ` (as of ${formatDate(account.balanceDate)})` : ""}
          </Text>
        </View>
      ) : null}

      <FlatList
        data={txns}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TransactionRow txn={item} currency={account?.currency ?? "USD"} />
        )}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#1a73e8" />
        }
        onEndReached={onEndReached}
        onEndReachedThreshold={0.3}
        ListFooterComponent={
          loadingMore ? (
            <View style={styles.footer}>
              <ActivityIndicator size="small" color="#1a73e8" />
            </View>
          ) : null
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No transactions found</Text>
          </View>
        }
        contentContainerStyle={txns.length === 0 ? styles.emptyList : undefined}
      />
    </View>
  );
}

function TransactionRow({ txn, currency }: { txn: Transaction; currency: string }) {
  const amt = Number.parseFloat(txn.amount);
  const isPositive = amt >= 0;
  const isPending = txn.pending === 1;
  const displayDate = txn.transactedAt ?? txn.posted;

  return (
    <View style={[styles.txnRow, isPending && styles.txnRowPending]}>
      <View style={styles.txnLeft}>
        <Text style={[styles.txnDescription, isPending && styles.txnPendingText]}>
          {txn.description}
        </Text>
        <View style={styles.txnMeta}>
          <Text style={styles.txnDate}>{formatDate(displayDate)}</Text>
          {isPending && (
            <View style={styles.pendingBadge}>
              <Text style={styles.pendingBadgeText}>Pending</Text>
            </View>
          )}
        </View>
      </View>
      <Text
        style={[
          styles.txnAmount,
          isPositive ? styles.amountPositive : styles.amountNegative,
          isPending && styles.txnPendingText,
        ]}
      >
        {isPositive ? "+" : ""}
        {formatCurrency(txn.amount, currency)}
      </Text>
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

function formatDate(timestamp: number): string {
  const normalizedTimestamp = timestamp > 1_000_000_000_000 ? timestamp : timestamp * 1000;

  return new Date(normalizedTimestamp).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    backgroundColor: "#fff",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  accountName: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1a1a1a",
  },
  orgName: {
    fontSize: 14,
    color: "#888",
    marginTop: 2,
  },
  balance: {
    fontSize: 28,
    fontWeight: "700",
    color: "#1a73e8",
    marginTop: 12,
  },
  balanceLabel: {
    fontSize: 12,
    color: "#888",
    marginTop: 4,
  },
  txnRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  txnRowPending: {
    backgroundColor: "#fafafa",
  },
  txnLeft: {
    flex: 1,
    marginRight: 12,
  },
  txnDescription: {
    fontSize: 15,
    color: "#1a1a1a",
    fontWeight: "500",
  },
  txnPendingText: {
    fontStyle: "italic",
    opacity: 0.7,
  },
  txnMeta: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
    gap: 8,
  },
  txnDate: {
    fontSize: 12,
    color: "#888",
  },
  pendingBadge: {
    backgroundColor: "#fef3c7",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  pendingBadgeText: {
    fontSize: 10,
    color: "#92400e",
    fontWeight: "600",
  },
  txnAmount: {
    fontSize: 15,
    fontWeight: "600",
  },
  amountPositive: {
    color: "#16a34a",
  },
  amountNegative: {
    color: "#dc2626",
  },
  errorText: {
    color: "#e53e3e",
    fontSize: 16,
  },
  empty: {
    alignItems: "center",
    paddingTop: 40,
  },
  emptyText: {
    fontSize: 16,
    color: "#888",
  },
  emptyList: {
    flexGrow: 1,
  },
  footer: {
    padding: 16,
    alignItems: "center",
  },
});
