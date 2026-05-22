import { StatusBar } from "expo-status-bar";
import React from "react";
import { Platform } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import HomeWebScreen from "./screens/Web/HomeScreen";
import LoginWebScreen from "./screens/Web/LoginScreen";
import RegisterWebScreen from "./screens/Web/RegisterScreen";
import DashboardWebScreen from "./screens/Web/DashboardScreen";
import FeatureWebScreen from "./screens/Web/FeatureScreen";
import CreateOrderWebScreen from "./screens/Web/CreateOrderScreen";
import OrderListWebScreen from "./screens/Web/OrderListScreen";
import OrderDetailWebScreen from "./screens/Web/OrderDetailScreen";

import WelcomeMobileScreen from "./screens/Mobile/WelcomeMobileScreen";
import LoginMobileScreen from "./screens/Mobile/LoginMobileScreen";
import RegisterMobileScreen from "./screens/Mobile/RegisterMobileScreen";
import BusinessRegisterMobileScreen from "./screens/Mobile/BusinessRegisterMobileScreen";
import DashboardMobileScreen from "./screens/Mobile/DashboardMobileScreen";
import ProfileMobileScreen from "./screens/Mobile/ProfileMobileScreen";
import ProfileWebScreen from "./screens/Web/ProfileScreen";

export type RootStackParamList = {
  Home: undefined;
  Login: undefined;
  Register: undefined;
  BusinessRegister: undefined;
  Dashboard: undefined;
  Profile: undefined;
  CreateOrder: undefined;
  OrderList: undefined;
  OrderDetail: { orderId: string };
  Feature: {
    title?: string;
    description?: string;
  };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const HomePage = Platform.OS === "web" ? HomeWebScreen : WelcomeMobileScreen;

const LoginPage = Platform.OS === "web" ? LoginWebScreen : LoginMobileScreen;

const RegisterPage =
  Platform.OS === "web" ? RegisterWebScreen : RegisterMobileScreen;

const BusinessRegisterPage =
  Platform.OS === "web" ? RegisterWebScreen : BusinessRegisterMobileScreen;

const DashboardPage =
  Platform.OS === "web" ? DashboardWebScreen : DashboardMobileScreen;

const ProfilePage =
  Platform.OS === "web" ? ProfileWebScreen : ProfileMobileScreen;

export default function App() {
  return (
    <>
      <StatusBar style="dark" />

      <NavigationContainer>
        <Stack.Navigator
          screenOptions={{
            headerShown: false,
            animation: Platform.OS === "ios" ? "slide_from_right" : "fade",
            gestureEnabled: false,
          }}
        >
          <Stack.Screen name="Home" component={HomePage} />

          <Stack.Screen name="Login" component={LoginPage} />

          <Stack.Screen name="Register" component={RegisterPage} />

          <Stack.Screen
            name="BusinessRegister"
            component={BusinessRegisterPage}
          />

          <Stack.Screen name="Dashboard" component={DashboardPage} />

          <Stack.Screen name="Profile" component={ProfilePage} />

          <Stack.Screen name="CreateOrder" component={CreateOrderWebScreen} />

          <Stack.Screen name="OrderList" component={OrderListWebScreen} />

          <Stack.Screen name="OrderDetail" component={OrderDetailWebScreen} />

          <Stack.Screen name="Feature" component={FeatureWebScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </>
  );
}