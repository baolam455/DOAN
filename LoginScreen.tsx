import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  SafeAreaView,
  ScrollView,
  View,
  StyleSheet,
  useWindowDimensions,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { loginCustomer, getErrorMessage } from "../../services/customerApi";
import { showComingSoon } from "../../utils/helpers";
import { colors } from "../../theme";

import LoginPageHeader from "../../components/Web/Login/LoginPageHeader";
import SlideLeft from "../../components/Web/Login/SlideLeft";
import LoginHeaderBlock from "../../components/Web/Login/LoginHeaderBlock";
import LoginForm from "../../components/Web/Login/LoginForm";

export default function LoginScreen() {
  const navigation = useNavigation<any>();

  const slides = useMemo(
    () => [
      {
        image: {
          uri: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1600&q=80",
        },
        top: "Nền tảng giao hàng - vận hành - đối soát",
        title:
          "Giải pháp giao nhận hàng toàn diện cho shop online và doanh nghiệp",
        desc: "Kết nối lấy hàng, giao hàng, quản lý đơn, theo dõi hành trình và nâng hiệu suất xử lý ở mọi giai đoạn vận hành",
      },
      {
        image: {
          uri: "https://images.unsplash.com/photo-1553413077-190dd305871c?auto=format&fit=crop&w=1600&q=80",
        },
        top: "Nền tảng giao hàng - vận hành - đối soát",
        title: "Quy trình giao nhận hàng chuyên nghiệp",
        desc: "Đảm bảo đơn hàng được xử lý và giao đúng thời gian",
      },
      {
        image: {
          uri: "https://images.unsplash.com/photo-1587293852726-70cdb56c2866?auto=format&fit=crop&w=1600&q=80",
        },
        top: "Nền tảng giao hàng - vận hành - đối soát",
        title: "Đòn bẩy tăng trưởng dành riêng cho doanh nghiệp",
        desc: "Quản lý hàng hóa, phân loại và xử lý đơn hàng nhanh chóng",
      },
    ],
    [],
  );

  const [slideIndex, setSlideIndex] = useState(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const [account, setAccount] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);

  const [errors, setErrors] = useState({
    account: "",
    password: "",
    loginError: "", // lỗi chung hiển thị trực tiếp trong form (Alert.alert không hoạt động trên web)
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

  // Breakpoints theo thiet bi thuc te:
  // Phone  : < 768px  -> chi hien form (khong hero)
  // Tablet : 768-1023px portrait -> chi hien form; landscape -> 2 cot
  // Desktop: >= 1024px -> 2 cot hero + form
  const { width } = useWindowDimensions();
  const isNarrow = width < 900; // iPad portrait (768) + iPad Air portrait (820) = no-hero

  const validateLoginForm = () => {
    const accountValue = account.trim();
    const phoneDigits = accountValue.replace(/\D/g, "");

    const nextErrors = {
      account: "",
      password: "",
      loginError: "",
    };

    if (!accountValue) {
      nextErrors.account = "Vui lòng nhập số điện thoại hoặc email";
    } else if (accountValue.includes("@")) {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(accountValue)) {
        nextErrors.account = "Email không hợp lệ";
      }
    } else if (!/^\d{10}$/.test(phoneDigits)) {
      nextErrors.account = "Số điện thoại phải đủ 10 số hoặc nhập email hợp lệ";
    }

    if (!password) {
      nextErrors.password = "Vui lòng nhập mật khẩu";
    }

    setErrors(nextErrors);

    return !Object.values(nextErrors).some(Boolean);
  };

  const handleLogin = async () => {
    const isValid = validateLoginForm();

    if (!isValid) {
      return;
    }

    try {
      setLoading(true);

      const accountValue = account.trim();
      const loginAccount = accountValue.includes("@")
        ? accountValue.toLowerCase()
        : accountValue.replace(/\D/g, "");

      const session = await loginCustomer({
        account: loginAccount,
        password,
      });

      navigation.reset({
        index: 0,
        routes: [{ name: session.role === "admin" ? "AdminDashboard" : "Dashboard" }],
      });
    } catch (error) {
      // Alert.alert không hoạt động trên React Native Web → hiển thị lỗi trực tiếp trong form
      setErrors((prev) => ({ ...prev, loginError: getErrorMessage(error) }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <LoginPageHeader
          onHomePress={() => navigation.navigate("Home")}
          onPressConsult={() => showComingSoon("Tư vấn doanh nghiệp")}
          onPressMenuItem={(item) => showComingSoon(item)}
        />

        <View style={styles.body}>
          {/* Hero image: only on desktop (width >= 820px) */}
          {!isNarrow && <SlideLeft slide={current} fadeAnim={fadeAnim} />}

          {/* Form: ScrollView cho phep cuon tren mobile */}
          <ScrollView
            style={styles.rightScroll}
            contentContainerStyle={styles.rightContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <LoginHeaderBlock
              onRegisterPress={() => navigation.navigate("Register")}
            />

            <LoginForm
              account={account}
              password={password}
              errors={errors}
              loading={loading}
              onChangeAccount={(v) => {
                setAccount(v);
                if (errors.loginError) setErrors((p) => ({ ...p, loginError: "" }));
              }}
              onChangePassword={(v) => {
                setPassword(v);
                if (errors.loginError) setErrors((p) => ({ ...p, loginError: "" }));
              }}
              onLoginPress={handleLogin}
              onForgotPassword={() => showComingSoon("Khôi phục mật khẩu")}
            />
          </ScrollView>
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

  container: {
    flex: 1,
    backgroundColor: colors.surface,
  },

  body: {
    flex: 1,
    flexDirection: "row",
    // KHONG dung flexWrap: wrap
    // Voi flexDirection:"row" va khong wrap, alignItems:"stretch" (default)
    // buoc ca hero lan form STRETCH theo chieu cao cua body (full viewport)
    // -> khong bi khoang trang phia duoi nhu khi dung flexWrap
    // Responsive duoc xu ly bang conditional render {!isNarrow && <Hero />}
    backgroundColor: colors.surface,
  },

  rightScroll: {
    flex: 1,                 // luon chiem nua man hinh khi co hero, full width khi khong co hero
    backgroundColor: colors.surface,
  },

  rightContent: {
    // flexGrow: 1 + justifyContent center: form can giua doc tren desktop (noi dung ngan)
    // Khi noi dung vuot viewport height: ScrollView tu cuon (tren mobile/tablet)
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 40,
    paddingVertical: 40,
  },
});
