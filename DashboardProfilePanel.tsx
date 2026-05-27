import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Platform,
  Image,
  Alert,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";

import {
  CustomerProfile,
  updateProfile,
  changePassword,
  uploadUserImage,
  ImageUploadType,
} from "../../../services/customerApi";
import { colors, radii } from "../../../theme";

type Props = {
  profile: CustomerProfile | null;
  onProfileUpdated: (updated: CustomerProfile) => void;
};

const webNoOutline =
  Platform.OS === "web"
    ? ({ outlineStyle: "none", outlineWidth: 0, outlineColor: "transparent" } as any)
    : null;

// ─── Helpers ────────────────────────────────────────────────────────────────

async function pickImage(): Promise<string | null> {
  // Yêu cầu quyền truy cập thư viện ảnh
  if (Platform.OS !== "web") {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Cần quyền truy cập",
        "Vui lòng cho phép ứng dụng truy cập thư viện ảnh trong cài đặt thiết bị.",
      );
      return null;
    }
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    quality: 0.85,
  });

  if (result.canceled || !result.assets?.length) return null;
  return result.assets[0].uri;
}

// ─── Component: ImageUploadBox (dùng cho ảnh đại diện + CCCD + GPKD) ────────

function ImageUploadBox({
  label,
  imageUri,
  uploading,
  onPick,
  size = "square",
}: {
  label: string;
  imageUri?: string | null;
  uploading?: boolean;
  onPick: () => void;
  size?: "square" | "wide";
}) {
  const boxStyle = size === "wide" ? styles.imgBoxWide : styles.imgBoxSquare;

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPick}
      style={[styles.imgBox, boxStyle]}
      disabled={uploading}
    >
      {uploading ? (
        <ActivityIndicator size="small" color={colors.brand} />
      ) : imageUri ? (
        <Image source={{ uri: imageUri }} style={styles.imgPreview} resizeMode="cover" />
      ) : (
        <View style={styles.imgPlaceholder}>
          <MaterialCommunityIcons name="plus" size={28} color={colors.brand} />
          <Text style={styles.imgPlaceholderText}>{label}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

// ─── Section: Ảnh đại diện + CCCD + Giấy phép kinh doanh ────────────────────

function MediaSection({
  profile,
  onProfileUpdated,
}: Props) {
  const [avatarUri, setAvatarUri] = useState<string | null>(profile?.avatar_url || null);
  const [cccdFrontUri, setCccdFrontUri] = useState<string | null>(
    profile?.cccd_front_url || null,
  );
  const [cccdBackUri, setCccdBackUri] = useState<string | null>(profile?.cccd_back_url || null);
  const [licenseUri, setLicenseUri] = useState<string | null>(
    profile?.business_license_url || null,
  );
  const [uploading, setUploading] = useState<ImageUploadType | null>(null);
  const [notice, setNotice] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  useEffect(() => {
    setAvatarUri(profile?.avatar_url || null);
    setCccdFrontUri(profile?.cccd_front_url || null);
    setCccdBackUri(profile?.cccd_back_url || null);
    setLicenseUri(profile?.business_license_url || null);
  }, [profile]);

  const handleUpload = async (type: ImageUploadType) => {
    if (!profile?.id) return;
    const uri = await pickImage();
    if (!uri) return;

    setUploading(type);
    setNotice(null);
    try {
      const publicUrl = await uploadUserImage(profile.id, uri, type);

      // Cập nhật state local
      if (type === "avatar") setAvatarUri(publicUrl);
      else if (type === "cccd_front") setCccdFrontUri(publicUrl);
      else if (type === "cccd_back") setCccdBackUri(publicUrl);
      else if (type === "business_license") setLicenseUri(publicUrl);

      // Nếu là avatar thì lưu luôn vào profile
      if (type === "avatar") {
        const updated = await updateProfile({ avatar_url: publicUrl });
        onProfileUpdated(updated);
      }

      setNotice({ type: "success", msg: "Tải ảnh lên thành công!" });
    } catch (e: any) {
      setNotice({ type: "error", msg: e?.message || "Tải ảnh lên thất bại" });
    } finally {
      setUploading(null);
    }
  };

  return (
    <View style={styles.section}>
      {/* Ảnh đại diện */}
      <View style={styles.mediaBlock}>
        <Text style={styles.sectionTitle}>Ảnh đại diện</Text>
        <View style={styles.imgRow}>
          <ImageUploadBox
            label="Thêm ảnh"
            imageUri={avatarUri}
            uploading={uploading === "avatar"}
            onPick={() => handleUpload("avatar")}
          />
          {/* Slot thứ 2 — có thể dùng cho ảnh thứ 2 hoặc banner */}
          <ImageUploadBox
            label="Thêm ảnh"
            onPick={() => handleUpload("avatar")}
          />
        </View>
      </View>

      {/* Giấy phép kinh doanh */}
      <View style={styles.mediaBlock}>
        <Text style={styles.sectionTitle}>Giấy phép đăng ký kinh doanh</Text>
        <ImageUploadBox
          label="Tải lên"
          imageUri={licenseUri}
          uploading={uploading === "business_license"}
          onPick={() => handleUpload("business_license")}
          size="wide"
        />
      </View>

      {/* CCCD */}
      <View style={styles.mediaBlock}>
        <Text style={styles.sectionTitle}>Căn cước công dân</Text>
        <Text style={styles.sectionDesc}>
          Ảnh CMND/CCCD được lưu bảo mật. Bạn có thể cập nhật bằng cách chọn ảnh mới.
        </Text>
        <View style={styles.imgRow}>
          <ImageUploadBox
            label="Mặt trước"
            imageUri={cccdFrontUri}
            uploading={uploading === "cccd_front"}
            onPick={() => handleUpload("cccd_front")}
            size="wide"
          />
          <ImageUploadBox
            label="Mặt sau"
            imageUri={cccdBackUri}
            uploading={uploading === "cccd_back"}
            onPick={() => handleUpload("cccd_back")}
            size="wide"
          />
        </View>
      </View>

      {notice && (
        <View
          style={[
            styles.notice,
            notice.type === "error" ? styles.noticeError : styles.noticeSuccess,
          ]}
        >
          <MaterialCommunityIcons
            name={notice.type === "success" ? "check-circle-outline" : "alert-circle-outline"}
            size={16}
            color={notice.type === "success" ? colors.brand : colors.danger}
          />
          <Text
            style={[styles.noticeText, notice.type === "error" && styles.noticeTextError]}
          >
            {notice.msg}
          </Text>
        </View>
      )}
    </View>
  );
}

// ─── Section: Thong tin tai khoan ───────────────────────────────────────────

function ProfileSection({ profile, onProfileUpdated }: Props) {
  const [storeName, setStoreName] = useState(profile?.store_name || profile?.full_name || "");
  const [phone, setPhone] = useState(profile?.phone || "");
  const [address, setAddress] = useState(profile?.address || "");
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  // Dong bo khi profile thay doi tu ben ngoai
  useEffect(() => {
    setStoreName(profile?.store_name || profile?.full_name || "");
    setPhone(profile?.phone || "");
    setAddress(profile?.address || "");
  }, [profile]);

  const handleSave = async () => {
    const cleanName = storeName.trim();
    const cleanPhone = phone.replace(/\D/g, "");
    const cleanAddr = address.trim();

    if (!cleanName) {
      setNotice({ type: "error", msg: "Tên shop không được để trống" });
      return;
    }
    if (cleanPhone && !/^\d{10}$/.test(cleanPhone)) {
      setNotice({ type: "error", msg: "Số điện thoại phải đủ 10 số" });
      return;
    }

    setLoading(true);
    setNotice(null);
    try {
      const updated = await updateProfile({
        storeName: cleanName,
        phone: cleanPhone || undefined,
        address: cleanAddr || undefined,
      });
      onProfileUpdated(updated);
      setNotice({ type: "success", msg: "Cập nhật thành công!" });
    } catch (e: any) {
      setNotice({ type: "error", msg: e?.message || "Cập nhật thất bại, vui lòng thử lại" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Thông tin tài khoản</Text>
      <Text style={styles.sectionDesc}>Cập nhật tên shop, số điện thoại và địa chỉ lấy hàng</Text>

      <View style={styles.field}>
        <Text style={styles.label}>Email (không thể đổi)</Text>
        <View style={styles.readonlyBox}>
          <Text style={styles.readonlyText}>{profile?.email || "---"}</Text>
          <MaterialCommunityIcons name="lock-outline" size={16} color={colors.textSubtle} />
        </View>
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Tên shop / Họ tên</Text>
        <TextInput
          style={[styles.input, webNoOutline]}
          value={storeName}
          onChangeText={setStoreName}
          placeholder="Tên cửa hàng của bạn"
          placeholderTextColor={colors.textSubtle}
        />
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Số điện thoại</Text>
        <TextInput
          style={[styles.input, webNoOutline]}
          value={phone}
          onChangeText={setPhone}
          placeholder="0912345678"
          placeholderTextColor={colors.textSubtle}
          keyboardType="phone-pad"
        />
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Địa chỉ lấy hàng</Text>
        <TextInput
          style={[styles.input, webNoOutline]}
          value={address}
          onChangeText={setAddress}
          placeholder="Số nhà, đường, phường, quận, tỉnh"
          placeholderTextColor={colors.textSubtle}
        />
      </View>

      {notice ? (
        <View
          style={[
            styles.notice,
            notice.type === "error" ? styles.noticeError : styles.noticeSuccess,
          ]}
        >
          <MaterialCommunityIcons
            name={notice.type === "success" ? "check-circle-outline" : "alert-circle-outline"}
            size={16}
            color={notice.type === "success" ? colors.brand : colors.danger}
          />
          <Text style={[styles.noticeText, notice.type === "error" && styles.noticeTextError]}>
            {notice.msg}
          </Text>
        </View>
      ) : null}

      <TouchableOpacity
        activeOpacity={0.82}
        style={[styles.saveButton, loading && styles.saveButtonDisabled, webNoOutline]}
        onPress={handleSave}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator size="small" color="#FFFFFF" />
        ) : (
          <Text style={styles.saveButtonText}>Lưu thay đổi</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

// ─── Section: Doi mat khau ──────────────────────────────────────────────────

function PasswordSection() {
  const [oldPw, setOldPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [oldVisible, setOldVisible] = useState(false);
  const [newVisible, setNewVisible] = useState(false);
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  const handleChange = async () => {
    setLoading(true);
    setNotice(null);
    try {
      await changePassword({
        oldPassword: oldPw,
        newPassword: newPw,
        confirmPassword: confirmPw,
      });
      setOldPw("");
      setNewPw("");
      setConfirmPw("");
      setNotice({ type: "success", msg: "Đổi mật khẩu thành công!" });
    } catch (e: any) {
      setNotice({ type: "error", msg: e?.message || "Đổi mật khẩu thất bại" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Đổi mật khẩu</Text>
      <Text style={styles.sectionDesc}>
        Để bảo mật, hãy dùng mật khẩu có chữ hoa, chữ thường, số và ký tự đặc biệt
      </Text>

      <View style={styles.field}>
        <Text style={styles.label}>Mật khẩu hiện tại</Text>
        <View style={styles.pwBox}>
          <TextInput
            style={[styles.pwInput, webNoOutline]}
            value={oldPw}
            onChangeText={setOldPw}
            placeholder="Nhập mật khẩu hiện tại"
            placeholderTextColor={colors.textSubtle}
            secureTextEntry={!oldVisible}
            autoCapitalize="none"
          />
          <TouchableOpacity
            activeOpacity={0.7}
            style={styles.eyeBtn}
            onPress={() => setOldVisible((v) => !v)}
          >
            <MaterialCommunityIcons
              name={oldVisible ? "eye-off-outline" : "eye-outline"}
              size={19}
              color={colors.textMuted}
            />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Mật khẩu mới</Text>
        <View style={styles.pwBox}>
          <TextInput
            style={[styles.pwInput, webNoOutline]}
            value={newPw}
            onChangeText={setNewPw}
            placeholder="Mật khẩu mới (8+ ký tự, chữ hoa, số, ký tự đặc biệt)"
            placeholderTextColor={colors.textSubtle}
            secureTextEntry={!newVisible}
            autoCapitalize="none"
          />
          <TouchableOpacity
            activeOpacity={0.7}
            style={styles.eyeBtn}
            onPress={() => setNewVisible((v) => !v)}
          >
            <MaterialCommunityIcons
              name={newVisible ? "eye-off-outline" : "eye-outline"}
              size={19}
              color={colors.textMuted}
            />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Xác nhận mật khẩu mới</Text>
        <View style={styles.pwBox}>
          <TextInput
            style={[styles.pwInput, webNoOutline]}
            value={confirmPw}
            onChangeText={setConfirmPw}
            placeholder="Nhập lại mật khẩu mới"
            placeholderTextColor={colors.textSubtle}
            secureTextEntry={!confirmVisible}
            autoCapitalize="none"
          />
          <TouchableOpacity
            activeOpacity={0.7}
            style={styles.eyeBtn}
            onPress={() => setConfirmVisible((v) => !v)}
          >
            <MaterialCommunityIcons
              name={confirmVisible ? "eye-off-outline" : "eye-outline"}
              size={19}
              color={colors.textMuted}
            />
          </TouchableOpacity>
        </View>
      </View>

      {notice ? (
        <View
          style={[
            styles.notice,
            notice.type === "error" ? styles.noticeError : styles.noticeSuccess,
          ]}
        >
          <MaterialCommunityIcons
            name={notice.type === "success" ? "check-circle-outline" : "alert-circle-outline"}
            size={16}
            color={notice.type === "success" ? colors.brand : colors.danger}
          />
          <Text style={[styles.noticeText, notice.type === "error" && styles.noticeTextError]}>
            {notice.msg}
          </Text>
        </View>
      ) : null}

      <TouchableOpacity
        activeOpacity={0.82}
        style={[styles.saveButton, loading && styles.saveButtonDisabled, webNoOutline]}
        onPress={handleChange}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator size="small" color="#FFFFFF" />
        ) : (
          <Text style={styles.saveButtonText}>Cập nhật mật khẩu</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

// ─── Main export ─────────────────────────────────────────────────────────────

export default function DashboardProfilePanel({ profile, onProfileUpdated }: Props) {
  return (
    <View style={styles.panel}>
      <Text style={styles.panelTitle}>Hồ sơ tài khoản</Text>

      <View style={styles.columns}>
        <View style={styles.col}>
          <ProfileSection profile={profile} onProfileUpdated={onProfileUpdated} />
        </View>

        <View style={styles.col}>
          <PasswordSection />
        </View>
      </View>

      {/* Khu vực ảnh bên dưới — chiếm toàn bộ chiều rộng */}
      <View style={styles.mediaRow}>
        <MediaSection profile={profile} onProfileUpdated={onProfileUpdated} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    flex: 1,
    padding: 24,
  },

  panelTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 20,
  },

  columns: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
    marginBottom: 16,
  },

  col: {
    flex: 1,
    minWidth: 280,
  },

  mediaRow: {
    width: "100%",
  },

  section: {
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 20,
    marginBottom: 16,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 4,
  },

  sectionDesc: {
    fontSize: 13,
    color: colors.textMuted,
    marginBottom: 14,
    lineHeight: 18,
  },

  mediaBlock: {
    marginBottom: 20,
  },

  imgRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginTop: 10,
  },

  imgBox: {
    borderWidth: 2,
    borderColor: colors.brand,
    borderStyle: "dashed",
    borderRadius: radii.sm,
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
  },

  imgBoxSquare: {
    width: 140,
    height: 140,
  },

  imgBoxWide: {
    width: 200,
    height: 130,
    flex: 1,
    minWidth: 160,
  },

  imgPreview: {
    width: "100%",
    height: "100%",
  },

  imgPlaceholder: {
    justifyContent: "center",
    alignItems: "center",
    gap: 4,
  },

  imgPlaceholderText: {
    fontSize: 13,
    color: colors.brand,
    fontWeight: "600",
  },

  field: {
    marginBottom: 14,
  },

  label: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.textMuted,
    marginBottom: 6,
  },

  input: {
    height: 42,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    backgroundColor: colors.surface,
    paddingHorizontal: 12,
    fontSize: 14,
    color: colors.text,
  },

  readonlyBox: {
    height: 42,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceMuted,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  readonlyText: {
    fontSize: 14,
    color: colors.textMuted,
  },

  pwBox: {
    height: 42,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    backgroundColor: colors.surface,
    flexDirection: "row",
    alignItems: "center",
    paddingLeft: 12,
  },

  pwInput: {
    flex: 1,
    height: 40,
    fontSize: 14,
    color: colors.text,
  },

  eyeBtn: {
    width: 40,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
  },

  notice: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: radii.sm,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 12,
    gap: 8,
  },

  noticeSuccess: {
    backgroundColor: colors.brandSoft,
    borderWidth: 1,
    borderColor: "#B7E4C7",
  },

  noticeError: {
    backgroundColor: colors.dangerSoft,
    borderWidth: 1,
    borderColor: "#FECDCA",
  },

  noticeText: {
    fontSize: 13,
    fontWeight: "500",
    color: colors.brand,
    flex: 1,
  },

  noticeTextError: {
    color: colors.danger,
  },

  saveButton: {
    height: 44,
    borderRadius: radii.sm,
    backgroundColor: colors.brand,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
  },

  saveButtonDisabled: {
    opacity: 0.65,
  },

  saveButtonText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FFFFFF",
  },
});
