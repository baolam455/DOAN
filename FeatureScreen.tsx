import React from "react";
import { SafeAreaView, View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { colors, radii } from "../../theme";

type RouteParams = {
    title?: string;
    description?: string;
};

export default function FeatureScreen() {
    const navigation = useNavigation<any>();
    const route = useRoute<any>();

    const params = (route.params || {}) as RouteParams;

    const title = params.title || "Chức năng";
    const description =
        params.description ||
        "Màn hình này đang được xây dựng. Sau này sẽ nối API và dữ liệu thật.";

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.header}>
                <TouchableOpacity
                    activeOpacity={0.8}
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <MaterialCommunityIcons name="chevron-left" size={28} color={colors.text} />
                </TouchableOpacity>

                <Text style={styles.headerTitle}>{title}</Text>
            </View>

            <View style={styles.content}>
                <View style={styles.card}>
                    <MaterialCommunityIcons name="tools" size={54} color={colors.brand} />
                    <Text style={styles.title}>{title}</Text>
                    <Text style={styles.desc}>{description}</Text>

                    <TouchableOpacity
                        activeOpacity={0.85}
                        style={styles.button}
                        onPress={() => navigation.goBack()}
                    >
                        <Text style={styles.buttonText}>Quay về tổng quan</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: colors.background,
    },

    header: {
        height: 68,
        backgroundColor: colors.surface,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 24,
    },

    backButton: {
        width: 40,
        height: 40,
        borderRadius: radii.sm,
        alignItems: "center",
        justifyContent: "center",
        marginRight: 12,
    },

    headerTitle: {
        fontSize: 20,
        fontWeight: "700",
        color: colors.text,
    },

    content: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
    },

    card: {
        /* responsive: co lại trên màn nhỏ, tối đa 520px */
        maxWidth: 520,
        width: "100%",
        minHeight: 260,
        backgroundColor: colors.surface,
        borderRadius: radii.md,
        borderWidth: 1,
        borderColor: colors.border,
        alignItems: "center",
        justifyContent: "center",
        padding: 32,
        shadowColor: "#101828",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 3,
        elevation: 1,
    },

    title: {
        fontSize: 20,
        fontWeight: "700",
        color: colors.text,
        marginTop: 16,
        marginBottom: 8,
        textAlign: "center",
    },

    desc: {
        fontSize: 14,
        color: colors.textMuted,
        textAlign: "center",
        lineHeight: 22,
        marginBottom: 22,
    },

    button: {
        height: 42,
        borderRadius: radii.sm,
        backgroundColor: colors.brand,
        paddingHorizontal: 22,
        alignItems: "center",
        justifyContent: "center",
    },

    buttonText: {
        fontSize: 14,
        fontWeight: "600",
        color: "#FFFFFF",
    },
});
