import axios, { AxiosError } from "axios";
import type { FieldErrors } from "@/lib/api/errors";

/** Normalized error for every failed API call made through `api`. */
export class ApiClientError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly fieldErrors?: FieldErrors,
  ) {
    super(message);
    this.name = "ApiClientError";
  }
}

// Same-origin API client for the admin CMS. The session cookie is HttpOnly and
// sent automatically; no tokens are stored in JavaScript.
export const api = axios.create({
  baseURL: "/api",
  timeout: 20_000,
  withCredentials: true,
  // Required by the server's CSRF check (lib/auth/csrf.ts).
  headers: { "X-Terrace-Request": "1" },
});

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ message?: string; fieldErrors?: FieldErrors }>) => {
    const status = error.response?.status ?? 0;
    const data = error.response?.data;
    let message = data?.message;
    if (!message) {
      if (error.code === AxiosError.ECONNABORTED) message = "Permintaan terlalu lama. Coba lagi.";
      else if (status === 0) message = "Tidak dapat terhubung ke server.";
      else message = "Terjadi kesalahan. Coba lagi.";
    }

    if (status === 401 && typeof window !== "undefined" && window.location.pathname !== "/admin/login") {
      const next = encodeURIComponent(window.location.pathname);
      // A full reload is intentional: it discards all cached admin data client-side.
      // eslint-disable-next-line @next/next/no-location-assign-relative-destination
      window.location.assign(`/admin/login?next=${next}`);
    }
    return Promise.reject(new ApiClientError(message, status, data?.fieldErrors));
  },
);
