import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { colors, radii } from "../../../theme";

type Props = {
    onPressReason?: (reason: string) => void;
};

function ReturnReason({
    label,
    onPress,
}: {
    label: string;
    onPress?: () => void;
}) {
    return (
        <TouchableOpacity
            activeOpacity={0.85}
            style={styles.reasonRow}
            onPress={onPress}
        >
            <Text style={styles.reasonLabel}>{label}</Text>

            <View style={styles.reasonRight}>
                <Text style={styles.reasonNumber}>0</Text>
                <Text style={styles.reasonPercent}>0%</Text>

                <MaterialCommunityIcons
                    name="chevron-right"
                    size={20}
                    color={colors.textMuted}
                />
            </View>
        </TouchableOpacity>
    );
}

export default function DashboardReturnCard({ onPressReason }: Props) {
    const returnReasons = [
        "Đơn shop hủy",
        "Không liên hệ được",
        "KH từ chối nhận",
        "Hoàn vì lý do khác",
        "Giao lại, Giao KH mới",
    ];

    return (
        <View style={styles.bigCard}>
            <Text style={styles.cardTitle}>Đơn hoàn</Text>

            <View style={styles.returnBody}>
                <View style={styles.donutWrap}>
                    <View style={styles.donutOuter}>
                        <View style={styles.donutInner}>
                            <Text style={styles.donutLabel}>Đơn hàng</Text>
                            <Text style={styles.donutValue}>0</Text>

                            <Text style={styles.donutLabel}>Tỷ lệ hoàn</Text>
                            <Text style={styles.donutValue}>0</Text>
                        </View>
                    </View>
                </View>

                <View style={styles.reasonList}>
                    {returnReasons.map((item) => (
                        <ReturnReason
                            key={item}
                            label={item}
                            onPress={() => onPressReason?.(item)}
                        />
                    ))}
                </View>
            </View>
        </View>
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

    returnBody: {
        marginTop: 26,
        flexDirection: "row",
        alignItems: "center",
        flexWrap: "wrap",
    },

    donutWrap: {
        width: 320,
        flexShrink: 1,
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 12,
    },

    donutOuter: {
        width: 220,
        height: 220,
        borderRadius: 110,
        borderWidth: 40,
        borderColor: colors.brandSoft,
        alignItems: "center",
        justifyContent: "center",
    },

    donutInner: {
        width: 110,
        height: 110,
        borderRadius: 55,
        backgroundColor: colors.surface,
        alignItems: "center",
        justifyContent: "center",
    },

    donutLabel: {
        fontSize: 13,
        color: colors.textMuted,
        marginBottom: 2,
    },

    donutValue: {
        fontSize: 15,
        color: colors.text,
        fontWeight: "600",
        marginBottom: 8,
    },

    reasonList: {
        flex: 1,
        minWidth: 220,
        paddingLeft: 16,
    },

    reasonRow: {
        height: 52,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },

    reasonLabel: {
        fontSize: 14,
        color: colors.textMuted,
        fontWeight: "400",
    },

    reasonRight: {
        flexDirection: "row",
        alignItems: "center",
    },

    reasonNumber: {
        fontSize: 14,
        fontWeight: "600",
        color: colors.text,
        marginRight: 12,
    },

    reasonPercent: {
        fontSize: 14,
        fontWeight: "600",
        color: colors.brand,
        marginRight: 6,
    },
});