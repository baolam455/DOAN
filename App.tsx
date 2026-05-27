import { StatusBar } from "expo-status-bar";
import React from "react";
import { Platform } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import HomeWebScreen from "./screens/Web/HomeScreen";
import LoginWebScreen from "./screens/Web/LoginScreen";
import RegisterWebScreen from "./screens/Web/RegisterScreen";
import DashboardWebScreen from "./screens/Web/DashboardScreen";
import AdminDashboardWebScreen from "./screens/Web/AdminDashboardScreen";
import FeatureWebScreen from "./screens/Web/FeatureScreen";
import CreateOrderWebScreen from "./screens/Web/CreateOrderScreen";
import OrderListWebScreen from "./screens/Web/OrderListScreen";
import OrderDetailWebScreen from "./screens/Web/OrderDetailScreen";
import PostOfficeSearchScreen from "./screens/Web/PostOfficeSearchScreen";
import ShippingFeeLookupScreen from "./screens/Web/ShippingFeeLookupScreen";
import TrackOrderScreen from "./screens/Web/TrackOrderScreen";

import WelcomeMobileScreen from "./screens/Mobile/WelcomeMobileScreen";
import LoginMobileScreen from "./screens/Mobile/LoginMobileScreen";
import RegisterMobileScreen from "./screens/Mobile/RegisterMobileScreen";
import BusinessRegisterMobileScreen from "./screens/Mobile/BusinessRegisterMobileScreen";
import DashboardMobileScreen from "./screens/Mobile/DashboardMobileScreen";
import CreateOrderMobileScreen from "./screens/Mobile/CreateOrderMobileScreen";
import OrderListMobileScreen from "./screens/Mobile/OrderListMobileScreen";
import OrderDetailMobileScreen from "./screens/Mobile/OrderDetailMobileScreen";

export type RootStackParamList = {
  Home: undefined;
  Login: undefined;
  Register: undefined;
  BusinessRegister: undefined;
  Dashboard: undefined;
  AdminDashboard: undefined;
  CreateOrder: undefined;
  OrderList: undefined;
  OrderDetail: { orderId: string };
  ShippingFeeLookup: undefined;
  TrackOrder: undefined;
  Feature: {
    title?: string;
    description?: string;
  };
  PostOfficeSearch: undefined;
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

const AdminDashboardPage =
  Platform.OS === "web" ? AdminDashboardWebScreen : DashboardMobileScreen;

const CreateOrderPage =
  Platform.OS === "web" ? CreateOrderWebScreen : CreateOrderMobileScreen;

const OrderListPage =
  Platform.OS === "web" ? OrderListWebScreen : OrderListMobileScreen;

const OrderDetailPage =
  Platform.OS === "web" ? OrderDetailWebScreen : OrderDetailMobileScreen;

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

          <Stack.Screen name="AdminDashboard" component={AdminDashboardPage} />

          <Stack.Screen name="CreateOrder" component={CreateOrderPage} />

          <Stack.Screen name="OrderList" component={OrderListPage} />

          <Stack.Screen name="OrderDetail" component={OrderDetailPage} />

          <Stack.Screen name="Feature" component={FeatureWebScreen} />

          <Stack.Screen name="PostOfficeSearch" component={PostOfficeSearchScreen} />

          <Stack.Screen name="ShippingFeeLookup" component={ShippingFeeLookupScreen} />

          <Stack.Screen name="TrackOrder" component={TrackOrderScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </>
  );
}
