import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Platform,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import {
  AdminPostOffice,
  findNearestPostOffices,
} from "../../../services/adminApi";
import { colors, radii } from "../../../theme";

type Props = {
  postOffices: AdminPostOffice[];
};

const webNoOutline =
  Platform.OS === "web"
    ? ({ outlineStyle: "none", outlineWidth: 0, outlineColor: "transparent" } as any)
    : null;

export default function AdminPostOfficePanel({ postOffices }: Props) {
  const [provinceQuery, setProvinceQuery] = useState("");
  const [latInput, setLatInput] = useState("10.7757");
  const [lngInput, setLngInput] = useState("106.7004");
  const [nearest, setNearest] = useState(() =>
    findNearestPostOffices(postOffices, 10.7757, 106.7004, 5),
  );

  useEffect(() => {
    setNearest(findNearestPostOffices(postOffices, 10.7757, 106.7004, 5));
  }, [postOffices]);

  const visibleOffices = useMemo(() => {
    const cleanQuery = provinceQuery.trim().toLowerCase();

    if (!cleanQuery) return postOffices.slice(0, 16);

    return postOffices
      .filter(
        (office) =>
          office.province.toLowerCase().includes(cleanQuery) ||
          office.district.toLowerCase().includes(cleanQuery) ||
          office.name.toLowerCase().includes(cleanQuery),
      )
      .slice(0, 20);
  }, [postOffices, provinceQuery]);

  const handleFindNearest = () => {
    const lat = Number(latInput.replace(",", "."));
    const lng = Number(lngInput.replace(",", "."));

    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;

    setNearest(findNearestPostOffices(postOffices, lat, lng, 5));
  };

  return (
    <View style={styles.panel}>
      <View style={styles.panelHeader}>
        <View>
          <Text style={styles.panelTitle}>Quản lý bưu cục</Text>
          <Text style={styles.panelDesc}>50 điểm bưu cục mẫu, tìm 5 điểm gần nhất theo tọa độ</Text>
        </View>

        <View style={styles.countPill}>
          <MaterialCommunityIcons name="map-marker-radius-outline" size={18} color={colors.brandDark} />
          <Text style={styles.countText}>{postOffices.length} bưu cục</Text>
        </View>
      </View>

      <View style={styles.locator}>
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Vĩ độ</Text>
          <TextInput
            style={[styles.coordInput, webNoOutline]}
            value={latInput}
            onChangeText={setLatInput}
            keyboardType="decimal-pad"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Kinh độ</Text>
          <TextInput
            style={[styles.coordInput, webNoOutline]}
            value={lngInput}
            onChangeText={setLngInput}
            keyboardType="decimal-pad"
          />
        </View>

        <TouchableOpacity
          activeOpacity={0.82}
          style={[styles.findButton, webNoOutline]}
          onPress={handleFindNearest}
        >
          <MaterialCommunityIcons name="crosshairs-gps" size={18} color={colors.surface} />
          <Text style={styles.findButtonText}>Tìm gần nhất</Text>
        </TouchableOpacity>

        <View style={styles.searchBox}>
          <MaterialCommunityIcons name="magnify" size={19} color={colors.textMuted} />
          <TextInput
            style={[styles.searchInput, webNoOutline]}
            value={provinceQuery}
            onChangeText={setProvinceQuery}
            placeholder="Lọc theo tỉnh, quận, tên bưu cục"
            placeholderTextColor={colors.textSubtle}
          />
        </View>
      </View>

      <View style={styles.contentRow}>
        <View style={styles.nearestPanel}>
          <Text style={styles.sectionTitle}>5 bưu cục gần nhất</Text>

          {nearest.map((item, index) => (
            <View key={item.office.code} style={styles.nearestRow}>
              <View style={styles.rankCircle}>
                <Text style={styles.rankText}>{index + 1}</Text>
              </View>

              <View style={styles.nearestInfo}>
                <Text style={styles.officeName}>{item.office.name}</Text>
                <Text style={styles.officeAddress}>{item.office.address}</Text>
                <Text style={styles.officeMeta}>
                  {item.office.district}, {item.office.province}
                </Text>
              </View>

              <Text style={styles.distanceText}>{item.distanceKm.toFixed(1)} km</Text>
            </View>
          ))}
        </View>

        <View style={styles.officePanel}>
          <Text style={styles.sectionTitle}>Danh sách bưu cục</Text>

          <ScrollView style={styles.officeList} showsVerticalScrollIndicator>
            {visibleOffices.map((office) => (
              <View key={office.code} style={styles.officeRow}>
                <View style={styles.officeCodeBox}>
                  <Text style={styles.officeCode}>{office.code}</Text>
                </View>

                <View style={styles.officeMain}>
                  <Text style={styles.officeName}>{office.name}</Text>
                  <Text style={styles.officeAddress}>{office.address}</Text>
                  <Text style={styles.officeMeta}>
                    {office.staffCount} nhân viên · {office.activeShipperCount} shipper · {office.queueOrders} đơn chờ
                  </Text>
                </View>

                <View style={styles.locationBox}>
                  <Text style={styles.locationText}>{office.province}</Text>
                  <Text style={styles.locationSub}>{office.district}</Text>
                </View>
              </View>
            ))}
          </ScrollView>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 18,
  },

  panelHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },

  panelTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.text,
  },

  panelDesc: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 4,
  },

  countPill: {
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.brandSoft,
    paddingHorizontal: 13,
    flexDirection: "row",
    alignItems: "center",
  },

  countText: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.brandDark,
    marginLeft: 7,
  },

  locator: {
    minHeight: 64,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceMuted,
    padding: 12,
    flexDirection: "row",
    alignItems: "flex-end",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 16,
  },

  inputGroup: {
    width: 135,
  },

  inputLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.textMuted,
    marginBottom: 5,
  },

  coordInput: {
    height: 38,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    backgroundColor: colors.surface,
    paddingHorizontal: 11,
    fontSize: 14,
    color: colors.text,
  },

  findButton: {
    height: 38,
    borderRadius: radii.sm,
    backgroundColor: colors.brand,
    paddingHorizontal: 13,
    flexDirection: "row",
    alignItems: "center",
  },

  findButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.surface,
    marginLeft: 7,
  },

  searchBox: {
    flex: 1,
    minWidth: 160,
    height: 38,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    backgroundColor: colors.surface,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 11,
  },

  searchInput: {
    flex: 1,
    height: 36,
    fontSize: 14,
    color: colors.text,
    marginLeft: 8,
  },

  contentRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    flexWrap: "wrap",
  },

  nearestPanel: {
    width: 410,
    flexShrink: 1,
    minWidth: 260,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    marginRight: 14,
    marginBottom: 12,
  },

  officePanel: {
    flex: 1,
    minWidth: 260,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    marginBottom: 12,
  },

  sectionTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 12,
  },

  nearestRow: {
    minHeight: 78,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
  },

  rankCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.brandSoft,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },

  rankText: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.brandDark,
  },

  nearestInfo: {
    flex: 1,
    paddingRight: 8,
  },

  officeName: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.text,
  },

  officeAddress: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 4,
    lineHeight: 16,
  },

  officeMeta: {
    fontSize: 12,
    color: colors.textSubtle,
    marginTop: 4,
  },

  distanceText: {
    width: 64,
    fontSize: 13,
    fontWeight: "700",
    color: colors.brand,
    textAlign: "right",
  },

  officeList: {
    maxHeight: 560,
  },

  officeRow: {
    minHeight: 78,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
  },

  officeCodeBox: {
    width: 58,
    height: 32,
    borderRadius: radii.sm,
    backgroundColor: colors.surfaceMuted,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 11,
  },

  officeCode: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.textMuted,
  },

  officeMain: {
    flex: 1,
    paddingRight: 10,
  },

  locationBox: {
    width: 140,
    alignItems: "flex-end",
  },

  locationText: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.text,
    textAlign: "right",
  },

  locationSub: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 4,
    textAlign: "right",
  },
});
