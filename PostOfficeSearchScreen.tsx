import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import type { AdminPostOffice } from "../../services/adminApi";
import { getPublicPostOffices } from "../../services/publicApi";
import { colors, radii } from "../../theme";

const webNoOutline =
  Platform.OS === "web"
    ? ({ outlineStyle: "none", outlineWidth: 0, outlineColor: "transparent" } as any)
    : null;

export default function PostOfficeSearchScreen() {
  const navigation = useNavigation<any>();

  const [offices, setOffices] = useState<AdminPostOffice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [activeProvince, setActiveProvince] = useState("Tất cả");

  useEffect(() => {
    const loadOffices = async () => {
      try {
        setLoading(true);
        setError("");
        setOffices(await getPublicPostOffices());
      } catch (e) {
        setError(e instanceof Error ? e.message : "Không tải được danh sách bưu cục");
      } finally {
        setLoading(false);
      }
    };

    loadOffices();
  }, []);

  const provinces = useMemo(() => {
    const values = new Set(offices.map((office) => office.province).filter(Boolean));
    return ["Tất cả", ...Array.from(values).sort()];
  }, [offices]);

  const filtered = useMemo(() => {
    const keyword = query.trim().toLowerCase();

    return offices.filter((office) => {
      const byProvince = activeProvince === "Tất cả" || office.province === activeProvince;
      const byKeyword =
        !keyword ||
        office.name.toLowerCase().includes(keyword) ||
        office.code.toLowerCase().includes(keyword) ||
        office.address.toLowerCase().includes(keyword) ||
        office.district.toLowerCase().includes(keyword) ||
        office.province.toLowerCase().includes(keyword);

      return byProvince && byKeyword;
    });
  }, [activeProvince, offices, query]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity
          activeOpacity={0.8}
          style={[styles.backButton, webNoOutline]}
          onPress={() => navigation.goBack()}
        >
          <MaterialCommunityIcons name="chevron-left" size={28} color={colors.text} />
        </TouchableOpacity>

        <View>
          <Text style={styles.title}>Tra cứu bưu cục</Text>
          <Text style={styles.subtitle}>
            {loading ? "Đang tải dữ liệu..." : `${filtered.length} / ${offices.length} bưu cục`}
          </Text>
        </View>
      </View>

      <View style={styles.searchRow}>
        <View style={styles.searchBox}>
          <MaterialCommunityIcons name="magnify" size={21} color={colors.textMuted} />
          <TextInput
            style={[styles.searchInput, webNoOutline]}
            value={query}
            onChangeText={setQuery}
            placeholder="Nhập tỉnh/thành, quận/huyện, mã hoặc tên bưu cục"
            placeholderTextColor={colors.textSubtle}
          />
          {query ? (
            <TouchableOpacity style={webNoOutline} onPress={() => setQuery("")}>
              <MaterialCommunityIcons name="close-circle" size={18} color={colors.textSubtle} />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      <View style={styles.filterBand}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
          {provinces.map((province) => {
            const active = province === activeProvince;

            return (
              <TouchableOpacity
                key={province}
                activeOpacity={0.82}
                style={[styles.filterChip, active && styles.filterChipActive, webNoOutline]}
                onPress={() => setActiveProvince(province)}
              >
                <Text style={[styles.filterText, active && styles.filterTextActive]}>
                  {province}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {loading ? (
        <View style={styles.centerBox}>
          <ActivityIndicator size="large" color={colors.brand} />
          <Text style={styles.centerText}>Đang tải danh sách bưu cục...</Text>
        </View>
      ) : error ? (
        <View style={styles.centerBox}>
          <MaterialCommunityIcons name="alert-circle-outline" size={54} color="#DC2626" />
          <Text style={styles.errorTitle}>Không tải được dữ liệu</Text>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : filtered.length === 0 ? (
        <View style={styles.centerBox}>
          <MaterialCommunityIcons name="map-marker-off-outline" size={54} color={colors.borderStrong} />
          <Text style={styles.emptyTitle}>Không tìm thấy bưu cục</Text>
          <Text style={styles.emptyText}>Thử đổi từ khóa hoặc chọn tỉnh/thành khác.</Text>
        </View>
      ) : (
        <ScrollView style={styles.list} contentContainerStyle={styles.listContent} showsVerticalScrollIndicator>
          {filtered.map((office) => (
            <View key={office.id || office.code} style={styles.officeRow}>
              <View style={styles.officeIcon}>
                <MaterialCommunityIcons name="map-marker-radius-outline" size={22} color={colors.brand} />
              </View>

              <View style={styles.officeMain}>
                <View style={styles.officeTitleRow}>
                  <Text style={styles.officeName}>{office.name}</Text>
                  <Text style={styles.officeCode}>{office.code}</Text>
                </View>

                <Text style={styles.officeAddress}>{office.address}</Text>
                <Text style={styles.officeMeta}>
                  {office.district}, {office.province}
                </Text>
              </View>
            </View>
          ))}
        </ScrollView>
      )}
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
    paddingHorizontal: 22,
    flexDirection: "row",
    alignItems: "center",
  },

  backButton: {
    width: 40,
    height: 40,
    borderRadius: radii.sm,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  title: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.text,
  },

  subtitle: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 3,
  },

  searchRow: {
    backgroundColor: colors.surface,
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },

  searchBox: {
    height: 42,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    backgroundColor: colors.surface,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
  },

  searchInput: {
    flex: 1,
    height: 40,
    marginLeft: 9,
    marginRight: 8,
    fontSize: 14,
    color: colors.text,
  },

  filterBand: {
    height: 50,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },

  filterRow: {
    alignItems: "center",
    paddingHorizontal: 16,
  },

  filterChip: {
    height: 30,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    paddingHorizontal: 14,
    justifyContent: "center",
    marginRight: 8,
    backgroundColor: colors.surface,
  },

  filterChipActive: {
    borderColor: colors.brand,
    backgroundColor: colors.brandSoft,
  },

  filterText: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.textMuted,
  },

  filterTextActive: {
    color: colors.brandDark,
  },

  centerBox: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },

  centerText: {
    marginTop: 12,
    fontSize: 14,
    color: colors.textMuted,
  },

  errorTitle: {
    marginTop: 14,
    fontSize: 17,
    fontWeight: "700",
    color: colors.danger,
  },

  errorText: {
    marginTop: 8,
    fontSize: 14,
    color: colors.textMuted,
    textAlign: "center",
  },

  emptyTitle: {
    marginTop: 14,
    fontSize: 17,
    fontWeight: "700",
    color: colors.text,
  },

  emptyText: {
    marginTop: 7,
    fontSize: 14,
    color: colors.textMuted,
  },

  list: {
    flex: 1,
  },

  listContent: {
    paddingHorizontal: 22,
    paddingTop: 16,
    paddingBottom: 28,
  },

  officeRow: {
    minHeight: 84,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 10,
    shadowColor: "#101828",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },

  officeIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.brandSoft,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 13,
  },

  officeMain: {
    flex: 1,
  },

  officeTitleRow: {
    flexDirection: "row",
    flexWrap: "wrap",       // code badge tự xuống dòng nếu tên quá dài
    alignItems: "center",
    justifyContent: "space-between",
    gap: 6,
  },

  officeName: {
    flex: 1,
    fontSize: 15,
    fontWeight: "700",
    color: colors.text,
    marginRight: 12,
  },

  officeCode: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.brandDark,
    backgroundColor: colors.brandSoft,
    overflow: "hidden",
    borderRadius: 10,
    paddingHorizontal: 9,
    paddingVertical: 3,
  },

  officeAddress: {
    marginTop: 5,
    fontSize: 13,
    color: colors.text,
    lineHeight: 19,
  },

  officeMeta: {
    marginTop: 3,
    fontSize: 12,
    color: colors.textMuted,
  },
});
