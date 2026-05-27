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

type LoginErrors = {
  account?: string;
  password?: string;
  loginError?: string; // lỗi chung khi đăng nhập thất bại (thay Alert.alert trên web)
};

type Props = {
  account: string;
  password: string;
  errors?: LoginErrors;
  loading?: boolean;
  onChangeAccount: (value: string) => void;
  onChangePassword: (value: string) => void;
  onLoginPress?: () => void;
  onForgotPassword?: () => void;
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

export default function LoginForm({
  account,
  password,
  errors,
  loading = false,
  onChangeAccount,
  onChangePassword,
  onLoginPress,
  onForgotPassword,
}: Props) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <View style={styles.formWrap}>
      {/* Lỗi đăng nhập chung (thay Alert.alert — không hiển thị trên web) */}
      {!!errors?.loginError && (
        <View style={styles.loginErrorBox}>
          <Text style={styles.loginErrorText}>{errors.loginError}</Text>
        </View>
      )}

      <View style={styles.inputGroup}>
        <RequiredLabel label="Số điện thoại / Email" />

        <TextInput
          style={[styles.input, errors?.account && styles.inputError]}
          placeholder="Nhập số điện thoại hoặc email"
          placeholderTextColor={colors.textSubtle}
          value={account}
          autoCapitalize="none"
          keyboardType="email-address"
          onChangeText={onChangeAccount}
        />

        <ErrorText message={errors?.account} />
      </View>

      <View style={styles.inputGroup}>
        <RequiredLabel label="Mật khẩu" />

        <View
          style={[styles.passwordBox, errors?.password && styles.inputError]}
        >
          <TextInput
            style={styles.passwordInput}
            placeholder="Nhập mật khẩu"
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

        <ErrorText message={errors?.password} />
      </View>

      <TouchableOpacity activeOpacity={0.8} style={styles.forgotRow} onPress={onForgotPassword}>
        <Text style={styles.forgotText}>Quên mật khẩu?</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.loginButton, loading && styles.loginButtonDisabled]}
        disabled={loading}
        activeOpacity={0.85}
        onPress={onLoginPress}
      >
        <Text style={styles.loginButtonText}>
          {loading ? "Đang đăng nhập..." : "Đăng nhập"}
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
    marginBottom: 12,
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
    height: 48,              // min touch target: 44px+
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

  forgotRow: {
    alignSelf: "flex-end",
    marginTop: 2,
    marginBottom: 18,
  },

  forgotText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.brand,
  },

  loginButton: {
    height: 50,              // button cần to hơn input để nổi bật hơn
    borderRadius: radii.sm,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.brand,
  },

  loginButtonDisabled: {
    opacity: 0.55,
  },

  loginButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#FFFFFF",
  },

  loginErrorBox: {
    backgroundColor: colors.dangerSoft,
    borderWidth: 1,
    borderColor: colors.danger,
    borderRadius: radii.sm,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 14,
  },

  loginErrorText: {
    fontSize: 13,
    color: colors.danger,
    fontWeight: "600",
  },
});
