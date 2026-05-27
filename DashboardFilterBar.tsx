import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { colors, radii } from "../../../theme";

export type DateFilter = "all" | "today" | "7days" | "30days";

type Props = {
    activeFilter?: DateFilter;
    onPressToday?: () => void;
    onPressSevenDays?: () => void;
    onPressThirtyDays?: () => void;
    onPressCustom?: () => void;
    onPressNotice?: () => void;
};

export default function DashboardFilterBar({
    activeFilter = "all",
    onPressToday,
    onPressSevenDays,
    onPressThirtyDays,
    onPressCustom,
    onPressNotice,
}: Props) {
    return (
        <View style={styles.filterBar}>
            <View style={styles.dateTabs}>
                <TouchableOpacity
                    activeOpacity={0.8}
                    style={[styles.dateTab, activeFilter === "today" && styles.dateTabActive]}
                    onPress={onPressToday}
                >
                    <Text style={[styles.dateTabText, activeFilter === "today" && styles.dateTabTextActive]}>
                        Hôm nay
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    activeOpacity={0.8}
                    style={[styles.dateTab, activeFilter === "7days" && styles.dateTabActive]}
                    onPress={onPressSevenDays}
                >
                    <Text style={[styles.dateTabText, activeFilter === "7days" && styles.dateTabTextActive]}>
                        7 ngày trước
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    activeOpacity={0.8}
                    style={[styles.dateTab, activeFilter === "30days" && styles.dateTabActive]}
                    onPress={onPressThirtyDays}
                >
                    <Text style={[styles.dateTabText, activeFilter === "30days" && styles.dateTabTextActive]}>
                        30 ngày trước
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    activeOpacity={0.8}
                    style={styles.dateTab}
                    onPress={onPressCustom}
                >
                    <Text style={styles.dateTabText}>Tùy chọn</Text>

                    <MaterialCommunityIcons
                        name="chevron-down"
                        size={18}
                        color={colors.textMuted}
                        style={styles.dateArrow}
                    />
                </TouchableOpacity>
            </View>

            <TouchableOpacity
                activeOpacity={0.8}
                style={styles.noticePill}
                onPress={onPressNotice}
            >
                <View style={styles.redDot} />

                <Text style={styles.noticeText}>
                    <Text style={styles.noticeBold}>Thông báo:</Text> Không có
                </Text>

                <MaterialCommunityIcons name="chevron-right" size={18} color={colors.textMuted} />
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    filterBar: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 20,
        flexWrap: "wrap",
        gap: 10,
    },

    dateTabs: {
        height: 44,
        backgroundColor: colors.surfaceMuted,
        borderRadius: radii.md,
        borderWidth: 1,
        borderColor: colors.border,
        flexDirection: "row",
        alignItems: "center",
    },

    dateTab: {
        height: 44,
        paddingHorizontal: 16,
        borderRadius: radii.md,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
    },

    dateTabActive: {
        backgroundColor: colors.surface,
        shadowColor: "#101828",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 3,
        elevation: 2,
    },

    dateTabText: {
        fontSize: 14,
        fontWeight: "500",
        color: colors.textMuted,
    },

    dateTabTextActive: {
        color: colors.brand,
        fontWeight: "600",
    },

    dateArrow: {
        marginLeft: 4,
    },

    noticePill: {
        height: 44,
        minWidth: 260,
        backgroundColor: colors.surface,
        borderRadius: radii.md,
        borderWidth: 1,
        borderColor: colors.border,
        paddingHorizontal: 16,
        flexDirection: "row",
        alignItems: "center",
        shadowColor: "#101828",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 2,
        elevation: 1,
    },

    redDot: {
        width: 7,
        height: 7,
        borderRadius: 4,
        backgroundColor: colors.danger,
        marginRight: 10,
    },

    noticeText: {
        flex: 1,
        fontSize: 14,
        color: colors.text,
    },

    noticeBold: {
        fontWeight: "600",
    },
});
