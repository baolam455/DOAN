import React from "react";
import { ImageBackground, StyleSheet, View } from "react-native";

export default function HomeHeroBanner() {
  return (
    <ImageBackground
      source={{
        uri: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1600&q=80",
      }}
      resizeMode="cover"
      style={styles.banner}
    >
      <View style={styles.bannerOverlay} />
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  banner: {
    flex: 1,
    minHeight: 280,          // dam bao hero luon co chieu cao toi thieu
    justifyContent: "flex-end",
  },

  bannerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.18)",
  },
});