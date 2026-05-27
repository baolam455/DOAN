import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  SafeAreaView,
  ScrollView,
  View,
  Text,
  StyleSheet,
  useWindowDimensions,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { registerCustomer, getErrorMessage } from "../../services/customerApi";
import { showComingSoon } from "../../utils/helpers";
import { colors, radii } from "../../theme";

import RegisterPageHeader from "../../components/Web/Register/RegisterPageHeader";
import RegisterSlideLeft from "../../components/Web/Register/RegisterSlideLeft";
import RegisterHeaderBlock from "../../components/Web/Register/RegisterHeaderBlock";
import RegisterForm from "../../components/Web/Register/RegisterForm";

export default function RegisterScreen() {
  const navigation = useNavigation<any>();

  const slides = useMemo(
    () => [
      {
        image: {
          uri: "https://images.unsplash.com/photo-1587293852726-70cdb56c2866?auto=format&fit=crop&w=1600&q=80",
        },
        top: "Nền tảng giao hàng - vận hành - đối soát",
        title: "ĐÒN BẨY TĂNG TRƯỞNG DÀNH RIÊNG CHO DOANH NGHIỆP",
        desc: "Quản lý hàng hóa, phân loại và xử lý đơn hàng nhanh chóng",
      },
      {
        image: {
          uri: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1600&q=80",
        },
        top: "Nền tảng giao hàng - vận hành - đối soát",
        title: "GIẢI PHÁP GIAO NHẬN HÀNG TOÀN DIỆN CHO SHOP ONLINE",
        desc: "Kết nối lấy hàng, giao hàng, quản lý đơn",
      },
      {
        image: {
          uri: "https://images.unsplash.com/photo-1553413077-190dd305871c?auto=format&fit=crop&w=1600&q=80",
        },
        top: "Nền tảng giao hàng - vận hành - đối soát",
        title: "QUY TRÌNH GIAO NHẬN HÀNG CHUYÊN NGHIỆP",
        desc: "Quy trình giao nhận tối ưu và chuyên nghiệp",
      },
    ],
    [],
  );

  const [slideIndex, setSlideIndex] = useState(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const [storeName, setStoreName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [password, setPassword] = useState("");
  const [rePassword, setRePassword] = useState("");
  const [agree, setAgree] = useState(false);

  const [loading, setLoading] = useState(false);

  const [notice, setNotice] = useState({
    visible: false,
    type: "success" as "success" | "error",
    title: "",
    message: "",
  });

  const [errors, setErrors] = useState({
    storeName: "",
    phone: "",
    email: "",
    address: "",
    password: "",
    rePassword: "",
    agree: "",
  });

  useEffect(() => {
    const timer = setInterval(() => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 350,
        useNativeDriver: true,
      }).start(() => {
        setSlideIndex((prev) => (prev + 1) % slides.length);

        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 350,
          useNativeDriver: true,
        }).start();
      });
    }, 2800);

    return () => clearInterval(timer);
  }, [fadeAnim, slides.length]);

  const current = slides[slideIndex];

  // Phone (<900px): chi form. Tablet landscape + Desktop (>=900px): 2 cot
  const { width } = useWindowDimensions();
  const isNarrow = width < 900;

  const validateRegisterForm = () => {
    const phoneDigits = phone.replace(/\D/g, "");

    const nextErrors = {
      storeName: "",
      phone: "",
      email: "",
      address: "",
      password: "",
      rePassword: "",
      agree: "",
    };

    if (!storeName.trim()) {
      nextErrors.storeName = "Vui lòng nhập tên cửa hàng";
    }

    if (!phoneDigits) {
      nextErrors.phone = "Vui lòng nhập số điện thoại";
    } else if (!/^\d{10}$/.test(phoneDigits)) {
      nextErrors.phone = "Số điện thoại phải đủ 10 số";
    }

    if (!email.trim()) {
      nextErrors.email = "Vui lòng nhập email";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      nextErrors.email = "Email không hợp lệ";
    }

    if (!address.trim()) {
      nextErrors.address = "Vui lòng nhập địa chỉ lấy hàng";
    }

    if (!password) {
      nextErrors.password = "Vui lòng nhập mật khẩu";
    } else if (
      !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{6,}$/.test(password)
    ) {
      nextErrors.password =
        "Mật khẩu phải có chữ hoa, chữ thường, số và ký tự đặc biệt";
    }

    if (!rePassword) {
      nextErrors.rePassword = "Vui lòng nhập lại mật khẩu";
    } else if (password !== rePassword) {
      nextErrors.rePassword = "Mật khẩu xác nhận không khớp";
    }

    if (!agree) {
      nextErrors.agree = "Vui lòng đồng ý điều khoản trước khi đăng ký";
    }

    setErrors(nextErrors);

    return !Object.values(nextErrors).some(Boolean);
  };

  const handleRegister = async () => {
    const isValid = validateRegisterForm();

    if (!isValid) {
      return;
    }

    try {
      setLoading(true);

      await registerCustomer({
        storeName: storeName.trim(),
        phone: phone.replace(/\D/g, ""),
        email: email.trim().toLowerCase(),
        address: address.trim(),
        password,
        rePassword,
      });

      setNotice({
        visible: true,
        type: "success",
        title: "Đăng ký thành công",
        message: "Đang chuyển về màn hình đăng nhập...",
      });

      setTimeout(() => {
        setNotice((prev) => ({
          ...prev,
          visible: false,
        }));

        navigation.reset({
          index: 0,
          routes: [{ name: "Login" }],
        });
      }, 1200);
    } catch (error) {
      const message = getErrorMessage(error);

      setNotice({
        visible: true,
        type: "error",
        title: "Đăng ký thất bại",
        message,
      });
    } finally {
      setLoading(false);
    }
  };

  const closeNotice = () => {
    setNotice((prev) => ({
      ...prev,
      visible: false,
    }));
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <RegisterPageHeader
          onHomePress={() => navigation.navigate("Home")}
          onPressConsult={() => showComingSoon("Tư vấn doanh nghiệp")}
          onPressMenuItem={(item) => showComingSoon(item)}
        />

        <View style={styles.body}>
          {/* Hero image: only on desktop (width >= 820px) */}
          {!isNarrow && <RegisterSlideLeft slide={current} fadeAnim={fadeAnim} />}

          {/* Form: ScrollView cho phep cuon tren mobile */}
          <ScrollView
            style={styles.rightScroll}
            contentContainerStyle={styles.rightContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <RegisterHeaderBlock
              onLoginPress={() => navigation.navigate("Login")}
            />

            <RegisterForm
              storeName={storeName}
              phone={phone}
              email={email}
              address={address}
              password={password}
              rePassword={rePassword}
              agree={agree}
              errors={errors}
              loading={loading}
              onChangeStoreName={setStoreName}
              onChangePhone={setPhone}
              onChangeEmail={setEmail}
              onChangeAddress={setAddress}
              onChangePassword={setPassword}
              onChangeRePassword={setRePassword}
              onToggleAgree={() => setAgree((prev) => !prev)}
              onRegisterPress={handleRegister}
            />
          </ScrollView>
        </View>
      </View>

      {notice.visible && (
        <View style={styles.noticeOverlay}>
          <View style={styles.noticeBox}>
            <View
              style={[
                styles.noticeIcon,
                notice.type === "error" && styles.noticeIconError,
              ]}
            >
              <Text style={styles.noticeIconText}>
                {notice.type === "success" ? "✓" : "!"}
              </Text>
            </View>

            <Text style={styles.noticeTitle}>{notice.title}</Text>

            <Text style={styles.noticeDesc}>{notice.message}</Text>

            {notice.type === "error" && (
              <Text style={styles.closeNoticeText} onPress={closeNotice}>
                Đóng
              </Text>
            )}
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },

  container: {
    flex: 1,
    backgroundColor: colors.surface,
  },

  body: {
    flex: 1,
    flexDirection: "row",
    // Khong dung flexWrap - de alignItems:stretch (default) buoc ca hai panel fill full height
    backgroundColor: colors.surface,
  },

  rightScroll: {
    flex: 1,
    backgroundColor: colors.surface,
  },

  rightContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 40,
    paddingVertical: 40,
  },

  noticeOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(16, 24, 40, 0.4)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 999,
  },

  noticeBox: {
    maxWidth: 360,
    width: "90%",
    minHeight: 200,
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 28,
    paddingVertical: 28,
    shadowColor: "#101828",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.14,
    shadowRadius: 20,
    elevation: 10,
  },

  noticeIcon: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: colors.brand,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },

  noticeIconError: {
    backgroundColor: colors.danger,
  },

  noticeIconText: {
    fontSize: 30,
    fontWeight: "700",
    color: "#FFFFFF",
    lineHeight: 34,
  },

  noticeTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 8,
    textAlign: "center",
  },

  noticeDesc: {
    fontSize: 14,
    color: colors.textMuted,
    textAlign: "center",
    lineHeight: 20,
  },

  closeNoticeText: {
    marginTop: 16,
    fontSize: 14,
    fontWeight: "600",
    color: colors.brand,
    cursor: "pointer" as any,
  },
});
