import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, radii } from "../../../theme";

type RegisterErrors = {
  storeName?: string;
  phone?: string;
  email?: string;
  address?: string;
  password?: string;
  rePassword?: string;
  agree?: string;
};

type Props = {
  storeName: string;
  phone: string;
  email: string;
  address: string;
  password: string;
  rePassword: string;
  agree: boolean;
  errors?: RegisterErrors;
  loading?: boolean;
  onChangeStoreName: (value: string) => void;
  onChangePhone: (value: string) => void;
  onChangeEmail: (value: string) => void;
  onChangeAddress: (value: string) => void;
  onChangePassword: (value: string) => void;
  onChangeRePassword: (value: string) => void;
  onToggleAgree: () => void;
  onRegisterPress?: () => void;
};

function RequiredLabel({ label }: { label: string }) {
  return (
    <Text style={styles.label}>
      {label} <Text style={styles.requiredStar}>*</Text>
    </Text>
  );
}

function ErrorText({ message }: { message?: string }) {
  if (!message) {
    return null;
  }

  return <Text style={styles.errorText}>{message}</Text>;
}

export default function RegisterForm({
  storeName,
  phone,
  email,
  address,
  password,
  rePassword,
  agree,
  errors,
  loading = false,
  onChangeStoreName,
  onChangePhone,
  onChangeEmail,
  onChangeAddress,
  onChangePassword,
  onChangeRePassword,
  onToggleAgree,
  onRegisterPress,
}: Props) {
  const [showPassword, setShowPassword] = useState(false);
  const [showRePassword, setShowRePassword] = useState(false);

  return (
    <View style={styles.formWrap}>
      <View style={styles.inputGroup}>
        <RequiredLabel label="Tên cửa hàng" />

        <TextInput
          style={[styles.input, errors?.storeName && styles.inputError]}
          placeholder="Tên cửa hàng"
          placeholderTextColor={colors.textSubtle}
          value={storeName}
          onChangeText={onChangeStoreName}
        />

        <ErrorText message={errors?.storeName} />
      </View>

      <View style={styles.inputGroup}>
        <RequiredLabel label="Điện thoại liên hệ" />

        <TextInput
          style={[styles.input, errors?.phone && styles.inputError]}
          placeholder="Điện thoại liên hệ"
          placeholderTextColor={colors.textSubtle}
          value={phone}
          keyboardType="phone-pad"
          maxLength={10}
          onChangeText={(text) => {
            const onlyNumber = text.replace(/\D/g, "").slice(0, 10);
            onChangePhone(onlyNumber);
          }}
        />

        <ErrorText message={errors?.phone} />
      </View>

      <View style={styles.inputGroup}>
        <RequiredLabel label="Email" />

        <TextInput
          style={[styles.input, errors?.email && styles.inputError]}
          placeholder="Email"
          placeholderTextColor={colors.textSubtle}
          value={email}
          keyboardType="email-address"
          autoCapitalize="none"
          onChangeText={onChangeEmail}
        />

        <ErrorText message={errors?.email} />
      </View>

      <View style={styles.inputGroup}>
        <RequiredLabel label="Địa chỉ lấy hàng" />

        <TextInput
          style={[styles.input, errors?.address && styles.inputError]}
          placeholder="Nhập địa chỉ"
          placeholderTextColor={colors.textSubtle}
          value={address}
          onChangeText={onChangeAddress}
        />

        <ErrorText message={errors?.address} />
      </View>

      <View style={styles.inputGroup}>
        <RequiredLabel label="Mật khẩu" />

        <View
          style={[styles.passwordBox, errors?.password && styles.inputError]}
        >
          <TextInput
            style={styles.passwordInput}
            placeholder="Mật khẩu"
            placeholderTextColor={colors.textSubtle}
            secureTextEntry={!showPassword}
            value={password}
            onChangeText={onChangePassword}
          />

          <TouchableOpacity
            style={styles.eyeButton}
            activeOpacity={0.7}
            onPress={() => setShowPassword((prev) => !prev)}
          >
            <Ionicons
              name={showPassword ? "eye-off-outline" : "eye-outline"}
              size={20}
              color={colors.textMuted}
            />
          </TouchableOpacity>
        </View>

        <Text style={styles.passwordHint}>
          Mật khẩu gồm chữ hoa, chữ thường, số và ký tự đặc biệt
        </Text>

        <ErrorText message={errors?.password} />
      </View>

      <View style={styles.inputGroup}>
        <RequiredLabel label="Nhập lại mật khẩu" />

        <View
          style={[styles.passwordBox, errors?.rePassword && styles.inputError]}
        >
          <TextInput
            style={styles.passwordInput}
            placeholder="Nhập lại mật khẩu"
            placeholderTextColor={colors.textSubtle}
            secureTextEntry={!showRePassword}
            value={rePassword}
            onChangeText={onChangeRePassword}
          />

          <TouchableOpacity
            style={styles.eyeButton}
            activeOpacity={0.7}
            onPress={() => setShowRePassword((prev) => !prev)}
          >
            <Ionicons
              name={showRePassword ? "eye-off-outline" : "eye-outline"}
              size={20}
              color={colors.textMuted}
            />
          </TouchableOpacity>
        </View>

        <ErrorText message={errors?.rePassword} />
      </View>

      <View style={styles.supportRow}>
        <Text style={styles.supportText}>Bạn đang gặp khó khăn? </Text>

        <TouchableOpacity activeOpacity={0.8}>
          <Text style={styles.supportLink}>Để lại SĐT để tư vấn</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.agreeRow}
        activeOpacity={0.8}
        onPress={onToggleAgree}
      >
        <View style={[styles.checkbox, agree && styles.checkboxActive]}>
          {agree && <Text style={styles.checkboxTick}>✓</Text>}
        </View>

        <Text style={styles.agreeText}>
          Tôi đã đọc và đồng ý với Điều khoản & Quy định và Chính sách bảo mật
        </Text>
      </TouchableOpacity>

      <ErrorText message={errors?.agree} />

      <TouchableOpacity
        style={[
          styles.registerButton,
          loading && styles.registerButtonDisabled,
        ]}
        disabled={loading}
        activeOpacity={0.85}
        onPress={onRegisterPress}
      >
        <Text style={styles.registerButtonText}>
          {loading ? "Đang đăng ký..." : "Đăng ký"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  formWrap: {
    maxWidth: 520,
    width: "100%",
  },

  inputGroup: {
    marginBottom: 8,
  },

  label: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 5,
  },

  requiredStar: {
    color: colors.danger,
  },

  input: {
    height: 48,              // min touch target: 44px+
    borderWidth: 1,
    borderColor: colors.borderStrong,
    borderRadius: radii.sm,
    backgroundColor: colors.surface,
    paddingHorizontal: 14,
    fontSize: 14,
    color: colors.text,
  },

  inputError: {
    borderColor: colors.danger,
  },

  errorText: {
    fontSize: 12,
    color: colors.danger,
    marginTop: 4,
  },

  passwordBox: {
    height: 48,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    borderRadius: radii.sm,
    backgroundColor: colors.surface,
    flexDirection: "row",
    alignItems: "center",
  },

  passwordInput: {
    flex: 1,
    height: 46,
    paddingHorizontal: 14,
    paddingRight: 8,
    fontSize: 14,
    color: colors.text,
  },

  eyeButton: {
    width: 48,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
  },

  passwordHint: {
    fontSize: 12,
    color: colors.textSubtle,
    marginTop: 4,
  },

  supportRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 2,
    marginBottom: 10,
  },

  supportText: {
    fontSize: 13,
    fontWeight: "500",
    color: colors.textMuted,
  },

  supportLink: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.brand,
  },

  agreeRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 6,
  },

  checkbox: {
    width: 16,
    height: 16,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    borderRadius: 3,
    backgroundColor: colors.surfaceMuted,
    marginTop: 1,
    marginRight: 8,
    alignItems: "center",
    justifyContent: "center",
  },

  checkboxActive: {
    backgroundColor: colors.brand,
    borderColor: colors.brand,
  },

  checkboxTick: {
    fontSize: 11,
    fontWeight: "700",
    color: "#FFFFFF",
    lineHeight: 13,
  },

  agreeText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 17,
    color: colors.textMuted,
  },

  registerButton: {
    height: 50,
    borderRadius: radii.sm,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.brand,
    marginTop: 10,
  },

  registerButtonDisabled: {
    opacity: 0.55,
  },

  registerButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});
