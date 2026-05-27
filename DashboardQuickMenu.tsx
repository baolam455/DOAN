import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { colors, radii } from "../../../theme";

type Props = {
    onLogout: () => void;
    onPressProfile?: () => void;
};

export default function DashboardQuickMenu({ onLogout, onPressProfile }: Props) {
    return (
        <View style={styles.quickMenu}>
            <TouchableOpacity activeOpacity={0.8} style={styles.quickMenuItem} onPress={onPressProfile}>
                <View style={styles.quickMenuIcon}>
                    <MaterialCommunityIcons
                        name="account-outline"
                        size={22}
                        color={colors.text}
                    />
                </View>

                <Text style={styles.quickMenuText}>Thông tin tài khoản</Text>
            </TouchableOpacity>

            <TouchableOpacity activeOpacity={0.8} style={styles.quickMenuItem}>
                <View style={styles.quickMenuIcon}>
                    <MaterialCommunityIcons
                        name="help-circle-outline"
                        size={22}
                        color={colors.text}
                    />
                </View>

                <Text style={styles.quickMenuText}>Hỗ trợ</Text>
            </TouchableOpacity>

            <TouchableOpacity
                activeOpacity={0.8}
                style={styles.quickMenuItem}
                onPress={onLogout}
            >
                <View style={[styles.quickMenuIcon, styles.logoutIconBg]}>
                    <MaterialCommunityIcons name="logout" size={22} color={colors.danger} />
                </View>

                <Text style={styles.logoutText}>Đăng xuất</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    quickMenu: {
        position: "absolute",
        left: 12,
        bottom: 68,
        width: 250,
        backgroundColor: colors.surface,
        borderRadius: radii.md,
        borderWidth: 1,
        borderColor: colors.border,
        paddingVertical: 8,
        paddingHorizontal: 10,
        zIndex: 30,
        shadowColor: "#101828",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.12,
        shadowRadius: 12,
        elevation: 8,
    },

    quickMenuItem: {
        height: 48,
        flexDirection: "row",
        alignItems: "center",
    },

    quickMenuIcon: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: colors.surfaceMuted,
        alignItems: "center",
        justifyContent: "center",
        marginRight: 12,
    },

    quickMenuText: {
        fontSize: 14,
        fontWeight: "500",
        color: colors.text,
    },

    logoutIconBg: {
        backgroundColor: colors.dangerSoft,
    },

    logoutText: {
        fontSize: 14,
        fontWeight: "600",
        color: colors.danger,
    },
});