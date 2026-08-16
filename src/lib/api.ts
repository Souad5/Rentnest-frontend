const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
const PAYMENT_BASE_URL =
  process.env.NEXT_PUBLIC_PAYMENT_API_URL || "http://localhost:5000/api";

export interface APIErrorResponse {
  message: string;
  statusCode?: number;
  errors?: Record<string, string[]>;
}

export class APIError extends Error {
  statusCode: number;
  data: APIErrorResponse;

  constructor(message: string, statusCode: number, data: APIErrorResponse) {
    super(message);
    this.name = "APIError";
    this.statusCode = statusCode;
    this.data = data;
  }
}

interface FetchOptions extends RequestInit {
  isPaymentApi?: boolean;
}

export async function apiFetch<T>(
  endpoint: string,
  options: FetchOptions = {},
): Promise<T> {
  const {
    isPaymentApi = false,
    headers: customHeaders,
    ...restOptions
  } = options;

  const baseUrl = isPaymentApi ? PAYMENT_BASE_URL : BASE_URL;
  // Ensure correct slash concatenation
  const url = `${baseUrl.replace(/\/$/, "")}/${endpoint.replace(/^\//, "")}`;

  let token: string | null = null;
  if (typeof window !== "undefined") {
    token = localStorage.getItem("token");
  }

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...customHeaders,
  };

  const response = await fetch(url, {
    ...restOptions,
    headers,
  });

  if (!response.ok) {
    let errorData: APIErrorResponse;
    try {
      errorData = await response.json();
    } catch {
      errorData = {
        message: response.statusText || "An unexpected error occurred",
      };
    }
    throw new APIError(
      errorData.message || "Request failed",
      response.status,
      errorData,
    );
  }

  // Handle empty 204 responses
  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}
