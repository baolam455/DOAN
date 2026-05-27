import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

const ACCESS_TOKEN_KEY = "accessToken";
const REFRESH_TOKEN_KEY = "refreshToken";

const defaultHost =
  Platform.OS === "android" ? "http://10.0.2.2:3000" : "http://localhost:3000";

function normalizeBaseUrl(value?: string) {
  const raw = (value || defaultHost).trim().replace(/\/+$/, "");
  return raw.endsWith("/api") ? raw : `${raw}/api`;
}

export const API_BASE_URL = normalizeBaseUrl(process.env.EXPO_PUBLIC_API_URL);

type ApiRequestOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
  skipAuth?: boolean;
  retryAuth?: boolean;
};

export async function saveAuthTokens(accessToken?: string, refreshToken?: string) {
  const entries: [string, string][] = [];

  if (accessToken) entries.push([ACCESS_TOKEN_KEY, accessToken]);
  if (refreshToken) entries.push([REFRESH_TOKEN_KEY, refreshToken]);
  if (entries.length) await AsyncStorage.multiSet(entries);
}

export async function getAccessToken() {
  return AsyncStorage.getItem(ACCESS_TOKEN_KEY);
}

export async function getRefreshToken() {
  return AsyncStorage.getItem(REFRESH_TOKEN_KEY);
}

export async function clearAuthTokens() {
  await AsyncStorage.multiRemove([ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY]);
}

async function parseResponse(response: Response) {
  const text = await response.text();
  if (!text) return null;

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

function makeUrl(path: string) {
  return `${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

async function refreshAccessToken() {
  const refreshToken = await getRefreshToken();
  if (!refreshToken) return null;

  const response = await fetch(makeUrl("/auth/refresh"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
  });

  if (!response.ok) {
    await clearAuthTokens();
    return null;
  }

  const data = await parseResponse(response);
  await saveAuthTokens(data?.accessToken, data?.refreshToken);
  return data?.accessToken || null;
}

export async function apiRequest<T>(path: string, options: ApiRequestOptions = {}): Promise<T> {
  const { skipAuth = false, retryAuth = true, headers, body, ...rest } = options;
  const token = skipAuth ? null : await getAccessToken();
  const requestBody =
    body === undefined || body === null
      ? undefined
      : typeof body === "string"
        ? body
        : JSON.stringify(body);
  const requestHeaders: Record<string, string> = {
    Accept: "application/json",
    ...(requestBody ? { "Content-Type": "application/json" } : {}),
    ...(headers as Record<string, string> | undefined),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const response = await fetch(makeUrl(path), {
    ...rest,
    headers: requestHeaders,
    body: requestBody,
  });

  if (response.status === 401 && retryAuth && !skipAuth) {
    const nextToken = await refreshAccessToken();
    if (nextToken) {
      return apiRequest<T>(path, { ...options, retryAuth: false });
    }
  }

  const data = await parseResponse(response);

  if (!response.ok) {
    const message =
      data?.error ||
      data?.message ||
      `API ${response.status}: ${response.statusText || "Request failed"}`;
    throw new Error(message);
  }

  return data as T;
}
