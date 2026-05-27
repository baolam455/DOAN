import React from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
} from "react-native";
import { DashboardStats } from "../../../services/orderApi";
import { colors, radii } from "../../../theme";

type Props = {
    stats?: DashboardStats;
    onPressGenerated?: () => void;
    onPressSuccess?: () => void;
    onPressDelivering?: () => void;
    onPressShippingFee?: () => void;
};

function MetricCard({
    title,
    children,
    onPress,
}: {
    title: string;
    children: React.ReactNode;
    onPress?: () => void;
}) {
    return (
        <TouchableOpacity
            activeOpacity={0.85}
            onPress={onPress}
            style={styles.metricCard}
        >
            <View style={styles.metricCardInner}>
                <Text style={styles.metricTitle}>{title}</Text>
                {children}
            </View>
        </TouchableOpacity>
    );
}

function MetricText({
    value,
    label,
}: {
    value: string;
    label: string;
}) {
    return (
        <View style={styles.metricItem}>
            <Text style={styles.metricValue}>{value}</Text>
            <Text style={styles.metricLabel}>{label}</Text>
        </View>
    );
}

function formatMoneyShort(amount: number): string {
    if (amount >= 1_000_000_000) return `${(amount / 1_000_000_000).toFixed(1)}tỷ`;
    if (amount >= 1_000_000) return `${(amount / 1_000_000).toFixed(1)}tr`;
    if (amount >= 1_000) return `${(amount / 1_000).toFixed(0)}k`;
    return `${amount}`;
}

export default function DashboardMetricGrid({
    stats,
    onPressGenerated,
    onPressSuccess,
    onPressDelivering,
    onPressShippingFee,
}: Props) {
    const total = stats?.total ?? 0;
    const totalQty = stats?.totalQuantity ?? 0;
    const totalCod = stats?.totalCod ?? 0;

    const delivered = stats?.delivered ?? 0;
    const deliveredQty = stats?.deliveredQuantity ?? 0;
    // COD da thu cua don thanh cong — neu API chua tra ve thi hien "—"
    const deliveredCodStr =
        stats?.deliveredCod !== undefined
            ? `${formatMoneyShort(stats.deliveredCod)}d`
            : "---";

    const delivering = stats?.delivering ?? 0;
    const deliveringQty = stats?.deliveringQuantity ?? 0;
    // COD chua thu cua don dang giao
    const deliveringCodStr =
        stats?.deliveringCod !== undefined
            ? `${formatMoneyShort(stats.deliveringCod)}d`
            : "---";

    const shippingFeeDeliver = stats?.totalShippingFee ?? 0;

    return (
        <View style={styles.metricGrid}>
            {/* Phat sinh: tong tat ca don trong ky */}
            <MetricCard title="Phat sinh" onPress={onPressGenerated}>
                <View style={styles.metricRow}>
                    <MetricText value={String(total)} label="DH" />
                    <MetricText value={String(totalQty)} label="SP" />
                    <MetricText value={`${formatMoneyShort(totalCod)}d`} label="CoD" />
                </View>
            </MetricCard>

            {/* Thanh cong: chi don da giao, CoD da thu */}
            <MetricCard title="Thanh cong" onPress={onPressSuccess}>
                <View style={styles.metricRow}>
                    <MetricText value={String(delivered)} label="DH" />
                    <MetricText value={String(deliveredQty)} label="SP" />
                    <MetricText value={deliveredCodStr} label="CoD" />
                </View>
            </MetricCard>

            {/* Dang giao: don chua hoan thanh, CoD chua thu */}
            <MetricCard title="Đang giao" onPress={onPressDelivering}>
                <View style={styles.metricRow}>
                    <MetricText value={String(delivering)} label="DH" />
                    <MetricText value={String(deliveringQty)} label="SP" />
                    <MetricText value={deliveringCodStr} label="CoD" />
                </View>
            </MetricCard>

            <MetricCard title="Phí vận chuyển" onPress={onPressShippingFee}>
                <View style={styles.feeRow}>
                    <Text style={styles.feeText}>{formatMoneyShort(shippingFeeDeliver)}d Giao</Text>
                    <Text style={styles.feeText}>0d Hoan</Text>
                </View>
            </MetricCard>
        </View>
    );
}

const styles = StyleSheet.create({
    metricGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        backgroundColor: colors.surface,
        borderRadius: radii.md,
        borderWidth: 1,
        borderColor: colors.border,
        padding: 18,
        marginBottom: 14,
        shadowColor: "#101828",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 3,
        elevation: 1,
    },

    metricCard: {
        width: "50%",
        minHeight: 96,
        paddingHorizontal: 4,
        marginBottom: 12,
    },

    metricCardInner: {
        backgroundColor: colors.surfaceMuted,
        borderRadius: radii.sm,
        borderWidth: 1,
        borderColor: colors.border,
        paddingHorizontal: 18,
        paddingVertical: 16,
        flex: 1,
    },

    metricTitle: {
        fontSize: 13,
        color: colors.textMuted,
        fontWeight: "500",
        marginBottom: 12,
    },

    metricRow: {
        flexDirection: "row",
        alignItems: "center",
        flexWrap: "wrap",
    },

    metricItem: {
        flexDirection: "row",
        alignItems: "center",
        marginRight: 20,
        marginBottom: 2,
    },

    metricValue: {
        fontSize: 15,
        color: colors.text,
        fontWeight: "600",
        marginRight: 4,
    },

    metricLabel: {
        fontSize: 13,
        color: colors.textMuted,
        fontWeight: "500",
    },

    feeRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },

    feeText: {
        fontSize: 15,
        color: colors.text,
        fontWeight: "600",
    },
});
