import React from "react";
import {
  Animated,
  ImageBackground,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";

type SlideItem = {
  image: { uri: string } | number;
  top: string;
  title: string;
  desc: string;
};

type Props = {
  slide: SlideItem;
  fadeAnim: Animated.Value;
};

export default function SlideLeft({ slide, fadeAnim }: Props) {
  const { width } = useWindowDimensions();

  // Responsive font sizes: smaller on narrow screens
  const titleSize = width < 600 ? 26 : width < 900 ? 32 : 40;
  const titleLineHeight = width < 600 ? 34 : width < 900 ? 40 : 48;
  const topSize = width < 600 ? 14 : 18;
  const paddingBottom = width < 600 ? 80 : 170;

  return (
    <Animated.View style={[styles.leftSection, { opacity: fadeAnim }]}>
      <ImageBackground
        source={slide.image}
        resizeMode="cover"
        style={styles.leftBackground}
      >
        <View style={styles.leftOverlay} />

        <View style={[styles.leftContent, { paddingBottom }]}>
          <Text style={[styles.leftTop, { fontSize: topSize }]}>{slide.top}</Text>
          <Text style={[styles.leftTitle, { fontSize: titleSize, lineHeight: titleLineHeight }]}>
            {slide.title}
          </Text>
          <Text style={styles.leftDesc}>{slide.desc}</Text>
        </View>
      </ImageBackground>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  leftSection: {
    flex: 1,
    // Hero luon chiem nua man hinh khi hien (da an bang conditional render tren <900px)
  },

  leftBackground: {
    flex: 1,
    justifyContent: "flex-end",
  },

  leftOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 88, 44, 0.45)",
  },

  leftContent: {
    paddingHorizontal: 35,
  },

  leftTop: {
    lineHeight: 22,
    fontWeight: "600",
    color: "#E8FFF1",
    marginBottom: 15,
  },

  leftTitle: {
    maxWidth: 560,
    fontWeight: "700",
    color: "#FFFFFF",
  },

  leftDesc: {
    marginTop: 12,
    maxWidth: 560,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "500",
    color: "#E8FFF1",
  },
});
