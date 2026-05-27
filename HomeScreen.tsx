import React from "react";
import { SafeAreaView, StyleSheet, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { showComingSoon } from "../../utils/helpers";

import HomeHeader from "../../components/Web/Home/HomeHeader";
import HomeHeroBanner from "../../components/Web/Home/HomeHeroBanner";
import HomeActionBar from "../../components/Web/Home/HomeActionBar";

export default function HomeScreen() {
  const navigation = useNavigation<any>();

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <HomeHeader
          onPressConsult={() => showComingSoon("Tư vấn doanh nghiệp")}
          onPressMenuItem={(item) => showComingSoon(item)}
        />
        <HomeHeroBanner />
        <HomeActionBar
          onLoginPress={() => navigation.navigate("Login")}
          onPostOfficePress={() => navigation.navigate("PostOfficeSearch")}
          onTrackOrderPress={() => navigation.navigate("TrackOrder")}
          onRatePress={() => navigation.navigate("ShippingFeeLookup")}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },

  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
});
