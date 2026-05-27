import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { colors, radii } from "../../../theme";

type RightTab = "banchay" | "hoancao";

type Props = {
    title: string;
    onPress?: () => void;
};

export default function DashboardRightCard({ title, onPress }: Props) {
    const [activeTab, setActiveTab] = useState<RightTab>("banchay");

    return (
        <TouchableOpacity
            activeOpacity={0.9}
            style={styles.rightCard}
            onPress={onPress}
        >
            <View style={styles.rightCardHeader}>
                <Text style={styles.rightTitle}>{title}</Text>

                <View style={styles.tabs}>
                    <TouchableOpacity
                        style={[styles.tabItem, activeTab === "banchay" && styles.tabActive]}
                        onPress={(e) => { e.stopPropagation?.(); setActiveTab("banchay"); }}
                    >
                        <Text style={[styles.tabText, activeTab === "banchay" && styles.tabTextActive]}>
                            Ban chay
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.tabItem, activeTab === "hoancao" && styles.tabActive]}
                        onPress={(e) => { e.stopPropagation?.(); setActiveTab("hoancao"); }}
                    >
                        <Text style={[styles.tabText, activeTab === "hoancao" && styles.tabTextActive]}>
                            Hoan cao
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>

            <View style={styles.emptyBox}>
                <Text style={styles.emptyText}>Đang cập nhật dữ liệu</Text>
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    rightCard: {
        height: 340,
        backgroundColor: colors.surface,
        borderRadius: radii.md,
        borderWidth: 1,
        borderColor: colors.border,
        padding: 20,
        marginBottom: 14,
        shadowColor: "#101828",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 3,
        elevation: 1,
    },

    rightCardHeader: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 4,
    },

    rightTitle: {
        fontSize: 15,
        fontWeight: "600",
        color: colors.text,
    },

    tabs: {
        height: 32,
        backgroundColor: colors.surfaceMuted,
        borderRadius: radii.sm,
        flexDirection: "row",
        padding: 2,
    },

    tabItem: {
        height: 28,
        paddingHorizontal: 14,
        borderRadius: radii.sm,
        justifyContent: "center",
        alignItems: "center",
    },

    tabActive: {
        backgroundColor: colors.surface,
        shadowColor: "#101828",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 2,
        elevation: 1,
    },

    tabText: {
        fontSize: 13,
        color: colors.textMuted,
        fontWeight: "500",
    },

    tabTextActive: {
        color: colors.brand,
        fontWeight: "600",
    },

    emptyBox: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
    },

    emptyText: {
        fontSize: 14,
        fontWeight: "400",
        color: colors.textSubtle,
    },
});