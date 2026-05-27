import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { colors, radii } from "../../../theme";

type ChartTab = "dongtien" | "dhsp";

type Props = {
    onPress?: () => void;
};

export default function DashboardTrendChart({ onPress }: Props) {
    const [activeTab, setActiveTab] = useState<ChartTab>("dhsp");

    return (
        <TouchableOpacity
            activeOpacity={0.9}
            style={styles.bigCard}
            onPress={onPress}
        >
            <View style={styles.chartHeader}>
                <Text style={styles.cardTitle}>Xu huong hang - tien</Text>

                <View style={styles.chartTabs}>
                    <TouchableOpacity
                        style={[styles.chartTab, activeTab === "dongtien" && styles.chartTabActive]}
                        onPress={(e) => { e.stopPropagation?.(); setActiveTab("dongtien"); }}
                    >
                        <Text style={[styles.chartTabText, activeTab === "dongtien" && styles.chartTabTextActive]}>
                            Dong tien
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.chartTab, activeTab === "dhsp" && styles.chartTabActive]}
                        onPress={(e) => { e.stopPropagation?.(); setActiveTab("dhsp"); }}
                    >
                        <Text style={[styles.chartTabText, activeTab === "dhsp" && styles.chartTabTextActive]}>
                            DH & SP
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>

            <View style={styles.chartBox}>
                {[5, 4, 3, 2, 1, 0].map((item) => (
                    <View key={item} style={styles.chartLineRow}>
                        <Text style={styles.chartNumber}>{item}</Text>
                        <View style={styles.chartLine} />
                        <Text style={styles.chartPercent}>{item}%</Text>
                    </View>
                ))}

                <View style={styles.legendRow}>
                    <View style={styles.legendItem}>
                        <View style={styles.legendDash} />
                        <Text style={styles.legendText}>Tỷ lệ hoàn</Text>
                    </View>

                    <View style={styles.legendItem}>
                        <View style={styles.legendDash} />
                        <Text style={styles.legendText}>Đơn hàng</Text>
                    </View>

                    <View style={styles.legendItem}>
                        <View style={styles.legendDash} />
                        <Text style={styles.legendText}>Sản phẩm</Text>
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    bigCard: {
        backgroundColor: colors.surface,
        borderRadius: radii.md,
        borderWidth: 1,
        borderColor: colors.border,
        padding: 22,
        marginBottom: 14,
        shadowColor: "#101828",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 3,
        elevation: 1,
    },

    cardTitle: {
        fontSize: 15,
        fontWeight: "600",
        color: colors.text,
    },

    chartHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },

    chartTabs: {
        height: 32,
        backgroundColor: colors.surfaceMuted,
        borderRadius: radii.sm,
        flexDirection: "row",
        padding: 2,
    },

    chartTab: {
        height: 28,
        paddingHorizontal: 16,
        borderRadius: radii.sm,
        justifyContent: "center",
    },

    chartTabActive: {
        backgroundColor: colors.surface,
        shadowColor: "#101828",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 2,
        elevation: 1,
    },

    chartTabText: {
        fontSize: 13,
        color: colors.textMuted,
        fontWeight: "500",
    },

    chartTabTextActive: {
        color: colors.brand,
        fontWeight: "600",
    },

    chartBox: {
        height: 430,
        marginTop: 28,
        paddingBottom: 16,
    },

    chartLineRow: {
        flexDirection: "row",
        alignItems: "center",
        height: 56,
    },

    chartNumber: {
        width: 25,
        fontSize: 12,
        color: colors.textSubtle,
    },

    chartLine: {
        flex: 1,
        height: 1,
        borderTopWidth: 1,
        borderTopColor: colors.border,
        borderStyle: "dashed",
    },

    chartPercent: {
        width: 35,
        fontSize: 12,
        color: colors.textSubtle,
        textAlign: "right",
    },

    legendRow: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 16,
        paddingLeft: 25,
    },

    legendItem: {
        flexDirection: "row",
        alignItems: "center",
        marginRight: 30,
    },

    legendDash: {
        width: 22,
        height: 2,
        backgroundColor: colors.brand,
        marginRight: 8,
    },

    legendText: {
        fontSize: 13,
        color: colors.textMuted,
    },
});