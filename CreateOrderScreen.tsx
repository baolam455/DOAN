import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";
// Alert chỉ còn dùng cho GPS native — mọi thông báo web đã chuyển sang topNotice banner
import { useNavigation } from "@react-navigation/native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import {
  CustomerProfile,
  getCurrentCustomer,
  logoutCustomer,
} from "../../services/customerApi";
import { createOrder } from "../../services/orderApi";
import { quoteShippingFee } from "../../services/publicApi";
import { getInitials, showComingSoon } from "../../utils/helpers";
import { colors, radii } from "../../theme";

import DashboardSidebar from "../../components/Web/Dashboard/DashboardSidebar";
import DashboardQuickMenu from "../../components/Web/Dashboard/DashboardQuickMenu";

type LocationTarget = "receiver" | "pickup";
type LocationStatus = "idle" | "loading" | "success" | "error";

const CUSTOMER_SHIP_PAYER = "customer";
const SHOP_SHIP_PAYER = "shop";

const webNoOutline =
  Platform.OS === "web"
    ? ({ outlineStyle: "none", outlineWidth: 0, outlineColor: "transparent" } as any)
    : null;

// Đã xóa alertMessage() dùng browser alert() — thay bằng topNotice banner inline

function cleanMoney(value: string) {
  return value.replace(/\D/g, "");
}

function moneyToNumber(value: string) {
  return Number(cleanMoney(value) || 0);
}

function formatMoney(value: number) {
  return value.toLocaleString("vi-VN");
}

function formatMoneyInput(value: string) {
  const number = moneyToNumber(value);
  return number ? formatMoney(number) : "";
}

function parseWeight(value: string) {
  const parsed = Number(value.replace(",", "."));
  return Number.isFinite(parsed) ? parsed : 0;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function SectionCard({
  title,
  subtitle,
  icon,
  children,
}: {
  title: string;
  subtitle?: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.sectionCard}>
      <View style={styles.sectionHeader}>
        <View style={styles.sectionIcon}>
          <MaterialCommunityIcons name={icon} size={17} color={colors.brand} />
        </View>
        <View style={styles.sectionTitleWrap}>
          <Text style={styles.sectionTitle}>{title}</Text>
          {subtitle ? <Text style={styles.sectionSubtitle}>{subtitle}</Text> : null}
        </View>
      </View>
      {children}
    </View>
  );
}

function Field({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType = "default",
  multiline = false,
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  keyboardType?: "default" | "phone-pad" | "numeric" | "decimal-pad";
  multiline?: boolean;
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={[styles.input, multiline && styles.textArea, webNoOutline]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textSubtle}
        keyboardType={keyboardType}
        multiline={multiline}
      />
    </View>
  );
}

function OptionChip({
  label,
  description,
  active,
  icon,
  onPress,
}: {
  label: string;
  description?: string;
  active: boolean;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      activeOpacity={0.84}
      style={[styles.optionChip, active && styles.optionChipActive, webNoOutline]}
      onPress={onPress}
    >
      <MaterialCommunityIcons
        name={icon}
        size={17}
        color={active ? colors.brand : colors.textMuted}
      />
      <View style={styles.optionTextWrap}>
        <Text style={[styles.optionLabel, active && styles.optionLabelActive]}>{label}</Text>
        {description ? <Text style={styles.optionDescription}>{description}</Text> : null}
      </View>
    </TouchableOpacity>
  );
}

function SummaryRow({
  label,
  value,
  strong = false,
}: {
  label: string;
  value: string;
  strong?: boolean;
}) {
  return (
    <View style={styles.summaryRow}>
      <Text style={styles.summaryLabel}>{label}</Text>
      <Text style={[styles.summaryValue, strong && styles.summaryValueStrong]}>{value}</Text>
    </View>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function CreateOrderScreen() {
  const navigation = useNavigation<any>();

  const { width } = useWindowDimensions();
  const isMobile = width < 768;

  const [quickMenuVisible, setQuickMenuVisible] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [customer, setCustomer] = useState<CustomerProfile | null>(null);
  const [saving, setSaving] = useState(false);
  const [feeLoading, setFeeLoading] = useState(false);
  const [shippingFee, setShippingFee] = useState(0);
  const [locationStatus, setLocationStatus] = useState<Record<LocationTarget, LocationStatus>>({
    receiver: "idle",
    pickup: "idle",
  });

  // Banner thông báo nội tuyến — thay thế browser alert()
  const [topNotice, setTopNotice] = useState<{ type: "error" | "success"; text: string } | null>(null);

  const showNotice = (type: "error" | "success", text: string) => {
    setTopNotice({ type, text });
    // Tự ẩn sau 5 giây (lỗi) hoặc 2 giây (thành công)
    const delay = type === "success" ? 2000 : 5000;
    setTimeout(() => setTopNotice(null), delay);
  };

  const [receiverPhone, setReceiverPhone] = useState("");
  const [receiverName, setReceiverName] = useState("");
  const [detailAddress, setDetailAddress] = useState("");
  const [ward, setWard] = useState("");
  const [province, setProvince] = useState("");

  const [pickupAddress, setPickupAddress] = useState("");
  const [pickupMethod, setPickupMethod] = useState<"home" | "post">("home");
  const [shippingType, setShippingType] = useState<"express" | "bbs">("express");
  const [transportType, setTransportType] = useState<"road" | "air">("road");
  const [shipPayer, setShipPayer] =
    useState<typeof CUSTOMER_SHIP_PAYER | typeof SHOP_SHIP_PAYER>(CUSTOMER_SHIP_PAYER);

  const [productName, setProductName] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [weight, setWeight] = useState("0.5");
  const [codAmount, setCodAmount] = useState("");
  const [productValue, setProductValue] = useState("");
  const [shopOrderCode, setShopOrderCode] = useState("");

  const customerName = customer?.store_name || customer?.full_name || "Khách hàng";
  const customerInitials = getInitials(customerName);
  const codNumber = moneyToNumber(codAmount);
  const productValueNumber = moneyToNumber(productValue);
  const quantityNumber = Number(quantity.replace(/\D/g, "") || 1);
  const weightNumber = useMemo(() => parseWeight(weight), [weight]);
  const totalCollection =
    shipPayer === CUSTOMER_SHIP_PAYER ? codNumber + shippingFee : codNumber;

  // Lấy profile khách hàng, pre-fill địa chỉ lấy hàng từ profile (vẫn chỉnh sửa được)
  useEffect(() => {
    const loadCustomer = async () => {
      try {
        const profile = await getCurrentCustomer();
        if (profile) {
          setCustomer(profile);
          setPickupAddress((current) => current || profile.address || "");
        }
      } catch (error) {
        console.log("Không lấy được thông tin khách hàng:", error);
      }
    };
    loadCustomer();
  }, []);

  // Tự động quote phí khi tỉnh / kg / gói thay đổi
  useEffect(() => {
    if (!Number.isFinite(weightNumber) || weightNumber <= 0) {
      setShippingFee(0);
      return;
    }
    let cancelled = false;
    const loadFee = async () => {
      try {
        setFeeLoading(true);
        const fee = await quoteShippingFee({
          receiverProvince: province.trim() || undefined,
          shippingType,
          totalWeight: weightNumber,
        });
        if (!cancelled) setShippingFee(fee);
      } catch {
        if (!cancelled) setShippingFee(0);
      } finally {
        if (!cancelled) setFeeLoading(false);
      }
    };
    loadFee();
    return () => { cancelled = true; };
  }, [province, shippingType, weightNumber]);

  const setLocationState = (target: LocationTarget, status: LocationStatus) => {
    setLocationStatus((prev) => ({ ...prev, [target]: status }));
  };

  // Lấy vị trí GPS hiện tại rồi reverse geocode → điền vào form
  const fillAddressFromCurrentLocation = (target: LocationTarget) => {
    if (Platform.OS !== "web") {
      // Trên native dùng Alert.alert bình thường
      Alert.alert("Chưa hỗ trợ", "Tính năng GPS chỉ hỗ trợ trên web.");
      return;
    }
    const geo = (globalThis.navigator as any)?.geolocation;
    if (!geo) {
      showNotice("error", "Trình duyệt của bạn không hỗ trợ định vị GPS.");
      return;
    }
    setLocationState(target, "loading");
    geo.getCurrentPosition(
      async (position: any) => {
        try {
          const { latitude: lat, longitude: lon } = position.coords;
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&accept-language=vi`,
          );
          const data = await res.json();
          const addr = data?.address || {};
          const displayName = data?.display_name || `${lat}, ${lon}`;
          if (target === "receiver") {
            setDetailAddress(displayName);
            setWard(addr.suburb || addr.ward || addr.village || addr.town || "");
            setProvince(addr.city || addr.state || addr.province || "");
          } else {
            setPickupAddress(displayName);
          }
          setLocationState(target, "success");
        } catch {
          setLocationState(target, "error");
          showNotice("error", "Lấy tọa độ thành công nhưng không chuyển được thành địa chỉ. Vui lòng nhập thủ công.");
        }
      },
      () => {
        setLocationState(target, "error");
        showNotice("error", "Không lấy được vị trí. Vui lòng cấp quyền định vị cho trình duyệt.");
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 },
    );
  };

  const handleLogout = async () => {
    try { await logoutCustomer(); } finally {
      navigation.reset({ index: 0, routes: [{ name: "Login" }] });
    }
  };

  const handleCreateOrder = async () => {
    const phone = receiverPhone.replace(/\D/g, "");
    const receiver = receiverName.trim();
    const addressLine = detailAddress.trim();
    const receiverAddress = [addressLine, ward.trim(), province.trim()].filter(Boolean).join(", ");
    const product = productName.trim();
    const pickup = pickupAddress.trim();

    // Validation — hiển thị lỗi ngay trên màn hình, không dùng browser alert
    if (!/^\d{10}$/.test(phone)) {
      showNotice("error", "Số điện thoại người nhận cần đủ 10 số.");
      return;
    }
    if (!receiver || !receiverAddress || !product) {
      showNotice("error", "Vui lòng nhập đủ: tên người nhận, địa chỉ và tên sản phẩm.");
      return;
    }
    if (pickupMethod === "home" && !pickup) {
      showNotice("error", "Vui lòng nhập địa chỉ lấy hàng hoặc dùng GPS.");
      return;
    }
    if (!Number.isFinite(weightNumber) || weightNumber <= 0) {
      showNotice("error", "Khối lượng phải lớn hơn 0 kg.");
      return;
    }

    setSaving(true);
    setTopNotice(null); // Xóa thông báo cũ trước khi gửi
    try {
      await createOrder({
        receiverPhone: phone,
        receiverName: receiver,
        receiverAddress,
        receiverWard: ward.trim() || undefined,
        receiverProvince: province.trim() || undefined,
        shippingType,
        transportType,
        pickupMethod,
        shipPayer,
        codAmount: codNumber,
        productValue: productValueNumber,
        totalWeight: weightNumber,
        productName: product,
        quantity: quantityNumber,
        shopOrderCode: shopOrderCode.trim() || undefined,
        pickupAddress: pickup || undefined,
        pickupNote: pickupMethod === "post" ? "Khách gửi tại bưu cục" : undefined,
      });
      // Thành công: hiển thị banner xanh rồi chuyển trang
      showNotice("success", "Tạo đơn hàng thành công! Đang chuyển sang danh sách đơn...");
      setTimeout(() => navigation.navigate("OrderList"), 1500);
    } catch (error: any) {
      showNotice("error", error?.message || "Không tạo được đơn. Vui lòng thử lại.");
    } finally {
      setSaving(false);
    }
  };

  const locationLabel = (target: LocationTarget) => {
    const status = locationStatus[target];
    if (status === "loading") return "Đang lấy vị trí...";
    if (status === "success") return "Đã cập nhật vị trí";
    if (status === "error") return "Thử lại";
    return "Dùng vị trí hiện tại (GPS)";
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.root}>
        {/* Backdrop trong suốt cho QuickMenu — chỉ bắt click, không che tối */}
        {quickMenuVisible && (
          <TouchableOpacity
            activeOpacity={1}
            style={styles.backdrop}
            onPress={() => setQuickMenuVisible(false)}
          />
        )}
        {quickMenuVisible && <DashboardQuickMenu onLogout={handleLogout} />}

        {/* Backdrop tối cho sidebar mobile overlay */}
        {isMobile && sidebarOpen && (
          <TouchableOpacity
            activeOpacity={1}
            style={styles.sidebarBackdrop}
            onPress={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar desktop */}
        {!isMobile && (
          <DashboardSidebar
            initials={customerInitials}
            activePage="orders"
            onToggleQuickMenu={() => { setQuickMenuVisible((prev) => !prev); setSidebarOpen(false); }}
            onPressOverview={() => navigation.navigate("Dashboard")}
            onPressOrders={() => navigation.navigate("OrderList")}
            onPressReport={() => showComingSoon("Báo cáo thống kê")}
            onPressMoney={() => showComingSoon("COD và đối soát")}
            onPressChat={() => showComingSoon("Hỗ trợ khách hàng")}
          />
        )}

        {/* Sidebar overlay mobile */}
        {isMobile && sidebarOpen && (
          <View style={styles.sidebarOverlay}>
            <DashboardSidebar
              initials={customerInitials}
              activePage="orders"
              onToggleQuickMenu={() => { setQuickMenuVisible((prev) => !prev); setSidebarOpen(false); }}
              onPressOverview={() => { setSidebarOpen(false); navigation.navigate("Dashboard"); }}
              onPressOrders={() => { setSidebarOpen(false); navigation.navigate("OrderList"); }}
              onPressReport={() => { setSidebarOpen(false); showComingSoon("Báo cáo thống kê"); }}
              onPressMoney={() => { setSidebarOpen(false); showComingSoon("COD và đối soát"); }}
              onPressChat={() => { setSidebarOpen(false); showComingSoon("Hỗ trợ khách hàng"); }}
            />
          </View>
        )}

        <View style={styles.mainArea}>
          {/* Header */}
          <View style={styles.header}>
            {isMobile && (
              <TouchableOpacity
                activeOpacity={0.75}
                onPress={() => setSidebarOpen((v) => !v)}
                style={styles.hamburgerBtn}
              >
                <MaterialCommunityIcons name="menu" size={26} color={colors.text} />
              </TouchableOpacity>
            )}
            <View style={{ flex: 1 }}>
              <Text style={styles.pageTitle}>Tạo đơn hàng</Text>
              <Text style={styles.pageSubtitle}>Điền thông tin bên dưới để tạo đơn mới</Text>
            </View>
            <TouchableOpacity
              activeOpacity={0.86}
              style={[styles.createButton, saving && styles.buttonDisabled, webNoOutline]}
              onPress={handleCreateOrder}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <MaterialCommunityIcons name="check" size={17} color="#FFFFFF" />
              )}
              <Text style={styles.createButtonText}>
                {saving ? "Đang tạo..." : "Tạo đơn"}
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.scrollArea}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Banner thông báo nội tuyến — thay thế browser alert */}
            {topNotice && (
              <View style={[styles.noticeBanner, topNotice.type === "success" ? styles.noticeBannerSuccess : styles.noticeBannerError]}>
                <MaterialCommunityIcons
                  name={topNotice.type === "success" ? "check-circle-outline" : "alert-circle-outline"}
                  size={18}
                  color={topNotice.type === "success" ? "#027A48" : "#B42318"}
                />
                <Text style={[styles.noticeText, topNotice.type === "success" ? styles.noticeTextSuccess : styles.noticeTextError]}>
                  {topNotice.text}
                </Text>
                <TouchableOpacity style={[styles.noticeClose, webNoOutline]} onPress={() => setTopNotice(null)}>
                  <MaterialCommunityIcons name="close" size={16} color={topNotice.type === "success" ? "#027A48" : "#B42318"} />
                </TouchableOpacity>
              </View>
            )}

            {/* formGrid: 2 cột trên desktop, 1 cột trên mobile */}
            <View style={styles.formGrid}>
              {/* Cột trái: người nhận + lấy hàng */}
              <View style={[styles.leftColumn, isMobile && styles.fullWidthColumn]}>
                <SectionCard
                  title="Thông tin người nhận"
                  subtitle="Nhập địa chỉ thủ công hoặc lấy theo GPS"
                  icon="account-arrow-right-outline"
                >
                  <View style={styles.twoColumns}>
                    <Field
                      label="Số điện thoại"
                      value={receiverPhone}
                      onChangeText={(text) =>
                        setReceiverPhone(text.replace(/\D/g, "").slice(0, 10))
                      }
                      placeholder="0901 234 567"
                      keyboardType="phone-pad"
                    />
                    <Field
                      label="Tên người nhận"
                      value={receiverName}
                      onChangeText={setReceiverName}
                      placeholder="Nguyễn Văn A"
                    />
                  </View>

                  <Field
                    label="Địa chỉ chi tiết"
                    value={detailAddress}
                    onChangeText={setDetailAddress}
                    placeholder="Số nhà, tên đường, tòa nhà..."
                    multiline
                  />

                  <View style={styles.twoColumns}>
                    <Field
                      label="Phường / Xã"
                      value={ward}
                      onChangeText={setWard}
                      placeholder="Phường Bến Nghé"
                    />
                    <Field
                      label="Tỉnh / Thành phố"
                      value={province}
                      onChangeText={setProvince}
                      placeholder="TP. Hồ Chí Minh"
                    />
                  </View>

                  <TouchableOpacity
                    activeOpacity={0.84}
                    style={[styles.ghostButton, webNoOutline]}
                    onPress={() => fillAddressFromCurrentLocation("receiver")}
                  >
                    {locationStatus.receiver === "loading" ? (
                      <ActivityIndicator size="small" color={colors.brand} />
                    ) : (
                      <MaterialCommunityIcons
                        name="crosshairs-gps"
                        size={16}
                        color={colors.brand}
                      />
                    )}
                    <Text style={styles.ghostButtonText}>{locationLabel("receiver")}</Text>
                  </TouchableOpacity>
                </SectionCard>

                <SectionCard
                  title="Lấy hàng & Vận chuyển"
                  subtitle="Địa chỉ lấy hàng có thể nhập thủ công hoặc dùng GPS"
                  icon="truck-fast-outline"
                >
                  <Text style={styles.groupLabel}>Hình thức gửi hàng</Text>
                  <View style={styles.optionRow}>
                    <OptionChip
                      label="Lấy tận nơi"
                      description="Shipper đến địa chỉ lấy hàng"
                      icon="home-map-marker"
                      active={pickupMethod === "home"}
                      onPress={() => setPickupMethod("home")}
                    />
                    <OptionChip
                      label="Gửi bưu cục"
                      description="Shop tự mang ra bưu cục"
                      icon="store-outline"
                      active={pickupMethod === "post"}
                      onPress={() => setPickupMethod("post")}
                    />
                  </View>

                  {/* Địa chỉ lấy hàng: luôn có thể nhập / thay đổi */}
                  <Field
                    label="Địa chỉ lấy hàng"
                    value={pickupAddress}
                    onChangeText={setPickupAddress}
                    placeholder="Nhập địa chỉ kho / cửa hàng của bạn"
                    multiline
                  />

                  <TouchableOpacity
                    activeOpacity={0.84}
                    style={[styles.ghostButton, webNoOutline]}
                    onPress={() => fillAddressFromCurrentLocation("pickup")}
                  >
                    {locationStatus.pickup === "loading" ? (
                      <ActivityIndicator size="small" color={colors.brand} />
                    ) : (
                      <MaterialCommunityIcons
                        name="map-marker-radius-outline"
                        size={16}
                        color={colors.brand}
                      />
                    )}
                    <Text style={styles.ghostButtonText}>{locationLabel("pickup")}</Text>
                  </TouchableOpacity>

                  <Text style={styles.groupLabel}>Gói dịch vụ</Text>
                  <View style={styles.optionRow}>
                    <OptionChip
                      label="EXPRESS"
                      description="Dưới 20 kg"
                      icon="lightning-bolt-outline"
                      active={shippingType === "express"}
                      onPress={() => setShippingType("express")}
                    />
                    <OptionChip
                      label="BBS"
                      description="Nặng / cồng kềnh"
                      icon="package-variant"
                      active={shippingType === "bbs"}
                      onPress={() => setShippingType("bbs")}
                    />
                  </View>

                  <Text style={styles.groupLabel}>Phương thức vận chuyển</Text>
                  <View style={styles.optionRow}>
                    <OptionChip
                      label="Đường bộ"
                      icon="truck-outline"
                      active={transportType === "road"}
                      onPress={() => setTransportType("road")}
                    />
                    <OptionChip
                      label="Đường bay"
                      icon="airplane"
                      active={transportType === "air"}
                      onPress={() => setTransportType("air")}
                    />
                  </View>
                </SectionCard>
              </View>

              {/* Cột phải: hàng hóa + thanh toán */}
              <View style={[styles.rightColumn, isMobile && styles.fullWidthColumn]}>
                <SectionCard
                  title="Thông tin hàng hóa"
                  subtitle="Giá trị tiền tính theo VNĐ"
                  icon="package-variant-closed"
                >
                  <Field
                    label="Tên sản phẩm"
                    value={productName}
                    onChangeText={setProductName}
                    placeholder="Ví dụ: Áo thun cotton nam"
                  />
                  <View style={styles.twoColumns}>
                    <Field
                      label="Số lượng"
                      value={quantity}
                      onChangeText={(text) => setQuantity(text.replace(/\D/g, "") || "1")}
                      placeholder="1"
                      keyboardType="numeric"
                    />
                    <Field
                      label="Khối lượng (kg)"
                      value={weight}
                      onChangeText={setWeight}
                      placeholder="0.5"
                      keyboardType="decimal-pad"
                    />
                  </View>
                  <Field
                    label="Mã đơn của shop"
                    value={shopOrderCode}
                    onChangeText={setShopOrderCode}
                    placeholder="Tùy chọn"
                  />
                  <Field
                    label="Tiền thu hộ COD (₫)"
                    value={formatMoneyInput(codAmount)}
                    onChangeText={(text) => setCodAmount(cleanMoney(text))}
                    placeholder="0"
                    keyboardType="numeric"
                  />
                  <Field
                    label="Giá trị hàng hóa (₫)"
                    value={formatMoneyInput(productValue)}
                    onChangeText={(text) => setProductValue(cleanMoney(text))}
                    placeholder="0"
                    keyboardType="numeric"
                  />
                </SectionCard>

                <SectionCard
                  title="Thanh toán"
                  subtitle="Phí ship tính tự động theo tỉnh, kg và gói dịch vụ"
                  icon="wallet-outline"
                >
                  <Text style={styles.groupLabel}>Người chịu phí vận chuyển</Text>
                  <View style={styles.optionColumn}>
                    <OptionChip
                      label="Khách trả phí ship"
                      description="Tổng thu = COD + phí ship"
                      icon="account-cash-outline"
                      active={shipPayer === CUSTOMER_SHIP_PAYER}
                      onPress={() => setShipPayer(CUSTOMER_SHIP_PAYER)}
                    />
                    <OptionChip
                      label="Shop trả phí ship"
                      description="Tổng thu chỉ gồm COD"
                      icon="store-outline"
                      active={shipPayer === SHOP_SHIP_PAYER}
                      onPress={() => setShipPayer(SHOP_SHIP_PAYER)}
                    />
                  </View>

                  <View style={styles.summaryBox}>
                    <SummaryRow label="Tiền thu hộ COD" value={`${formatMoney(codNumber)} ₫`} />
                    <SummaryRow
                      label="Phí vận chuyển"
                      value={feeLoading ? "Đang tính..." : `${formatMoney(shippingFee)} ₫`}
                    />
                    <SummaryRow
                      label="Giá trị hàng"
                      value={`${formatMoney(productValueNumber)} ₫`}
                    />
                    <View style={styles.summaryDivider} />
                    <SummaryRow
                      label="Tổng tiền cần thu"
                      value={`${formatMoney(totalCollection)} ₫`}
                      strong
                    />
                  </View>
                </SectionCard>
              </View>
            </View>
          </ScrollView>
        </View>
      </View>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },

  root: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: colors.background,
  },

  // Backdrop trong suốt — chỉ đóng QuickMenu khi bấm ra ngoài
  backdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 20,
  },

  // Backdrop tối — che phủ nội dung khi sidebar mobile đang mở
  sidebarBackdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 25,
    backgroundColor: "rgba(0,0,0,0.2)",
  },

  sidebarOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    bottom: 0,
    zIndex: 30,
  },

  hamburgerBtn: {
    marginRight: 12,
    padding: 4,
  },

  mainArea: {
    flex: 1,
    backgroundColor: colors.background,
  },

  header: {
    minHeight: 68,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingHorizontal: 24,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  pageTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.text,
  },

  pageSubtitle: {
    marginTop: 3,
    fontSize: 13,
    color: colors.textMuted,
  },

  createButton: {
    height: 40,
    borderRadius: radii.md,
    backgroundColor: colors.brand,
    paddingHorizontal: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  buttonDisabled: {
    opacity: 0.65,
  },

  createButtonText: {
    marginLeft: 7,
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
  },

  scrollArea: {
    flex: 1,
  },

  scrollContent: {
    padding: 22,
    paddingBottom: 40,
  },

  /* Layout 2 cột — tự wrap khi màn < ~650px */
  formGrid: {
    flexDirection: "row",
    alignItems: "flex-start",
    flexWrap: "wrap",
  },

  leftColumn: {
    flex: 1,
    minWidth: 300,
    paddingRight: 16,
    marginBottom: 16,
  },

  rightColumn: {
    /* Bo width co dinh, dung flex giong leftColumn de tu adapt theo man hinh */
    flex: 1,
    minWidth: 280,
    marginBottom: 16,
  },

  // Tren mobile: full width, khong can minWidth nua
  fullWidthColumn: {
    width: "100%" as any,
    flex: undefined,
    minWidth: undefined,
    paddingRight: 0,
  },

  /* Section card */
  sectionCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    padding: 18,
    marginBottom: 14,
    shadowColor: "#101828",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },

  sectionIcon: {
    width: 34,
    height: 34,
    borderRadius: radii.md,
    backgroundColor: colors.brandSoft,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },

  sectionTitleWrap: {
    flex: 1,
  },

  sectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.text,
  },

  sectionSubtitle: {
    marginTop: 2,
    fontSize: 12,
    color: colors.textMuted,
  },

  twoColumns: {
    /* flexWrap de 2 field tu xuong hang khi section card hep (<350px) */
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },

  field: {
    flex: 1,
    marginBottom: 13,
  },

  label: {
    marginBottom: 6,
    fontSize: 12,
    fontWeight: "600",
    color: colors.text,
  },

  input: {
    minHeight: 40,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    backgroundColor: colors.surface,
    paddingHorizontal: 11,
    paddingVertical: 8,
    fontSize: 14,
    color: colors.text,
  },

  textArea: {
    minHeight: 72,
    textAlignVertical: "top",
  },

  groupLabel: {
    marginBottom: 8,
    fontSize: 12,
    fontWeight: "600",
    color: colors.textMuted,
  },

  optionRow: {
    flexDirection: "row",
    flexWrap: "wrap",   // chip tự xuống dòng nếu không đủ chỗ trên màn hẹp
    gap: 10,
    marginBottom: 14,
  },

  optionColumn: {
    gap: 8,
    marginBottom: 14,
  },

  optionChip: {
    flex: 1,
    minHeight: 50,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: 11,
    paddingVertical: 9,
    flexDirection: "row",
    alignItems: "center",
  },

  optionChipActive: {
    borderColor: colors.brand,
    backgroundColor: colors.brandSoft,
  },

  optionTextWrap: {
    flex: 1,
    marginLeft: 8,
  },

  optionLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.text,
  },

  optionLabelActive: {
    color: colors.brandDark,
  },

  optionDescription: {
    marginTop: 2,
    fontSize: 11,
    color: colors.textMuted,
  },

  ghostButton: {
    height: 38,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceMuted,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },

  ghostButtonText: {
    marginLeft: 7,
    fontSize: 13,
    fontWeight: "500",
    color: colors.brandDark,
  },

  summaryBox: {
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceMuted,
    padding: 14,
  },

  summaryRow: {
    minHeight: 28,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  summaryLabel: {
    fontSize: 13,
    color: colors.textMuted,
  },

  summaryValue: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.text,
  },

  summaryValueStrong: {
    fontSize: 17,
    fontWeight: "700",
    color: colors.brandDark,
  },

  summaryDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 8,
  },

  // ─── Notice Banner — thay thế browser alert() ───────────────────────────────
  noticeBanner: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: radii.md,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 11,
    marginBottom: 14,
  },

  noticeBannerError: {
    backgroundColor: "#FEF3F2",
    borderColor: "#FECDCA",
  },

  noticeBannerSuccess: {
    backgroundColor: "#ECFDF3",
    borderColor: "#A9EFC5",
  },

  noticeText: {
    flex: 1,
    fontSize: 13,
    fontWeight: "600",
    marginHorizontal: 10,
    lineHeight: 19,
  },

  noticeTextError: {
    color: "#B42318",
  },

  noticeTextSuccess: {
    color: "#027A48",
  },

  noticeClose: {
    padding: 4,
  },
});
