import axios, { type AxiosRequestConfig } from "axios";
import { apiBaseUrl } from "@/Services/api-base-url";

let refreshPromise: Promise<void> | null = null;

export function createAuthenticatedApi(config: AxiosRequestConfig) {
  const api = axios.create(config);
  api.interceptors.response.use(undefined, async (error) => {
    const request = error.config as (AxiosRequestConfig & { _retried?: boolean }) | undefined;
    if (!request || error.response?.status !== 401 || request._retried) {
      return Promise.reject(error);
    }

    request._retried = true;
    refreshPromise ??= axios.post(`${apiBaseUrl}/api/auth/refresh`, null, {
      withCredentials: true,
    }).then(() => undefined).finally(() => { refreshPromise = null; });

    try {
      await refreshPromise;
      return api(request);
    } catch {
      return Promise.reject(error);
    }
  });
  return api;
}
