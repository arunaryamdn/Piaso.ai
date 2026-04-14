import axios, { AxiosError, AxiosRequestConfig } from 'axios';
import { UI_STRINGS, API } from '../config`;

type ApiResponse<T> = {
  data?: T;
  error?: {
    message: string;
    code?: number;
    retryable?: boolean;
  };
};

const API_TIMEOUT = 10000; // 10 seconds
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second initial delay

async function fetchWithRetry<T>(
  endpoint: string,
  config?: AxiosRequestConfig,
  retries = MAX_RETRIES
): Promise<ApiResponse<T>> {
  try {
    const source = axios.CancelToken.source();
    const timeout = setTimeout(() => {
      source.cancel(`Request timeout after ${API_TIMEOUT}ms`);
    }, API_TIMEOUT);

    const response = await axios({
      url: `${API.BASE_URL}/${endpoint}`,
      cancelToken: source.token,
      headers: {
        Authorization: `Bearer ${localStorage.getItem(`token') || sessionStorage.getItem('token')}`,
        ...config?.headers,
      },
      ...config,
    });

    clearTimeout(timeout);
    return { data: response.data };
  } catch (error) {
    if (axios.isCancel(error)) {
      return {
        error: {
          message: UI_STRINGS.API.TIMEOUT_ERROR,
          code: 408,
          retryable: true,
        },
      };
    }

    const axiosError = error as AxiosError;

    if (retries > 0 && shouldRetry(axiosError)) {
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * (MAX_RETRIES - retries + 1)));
      return fetchWithRetry<T>(endpoint, config, retries - 1);
    }

    return {
      error: {
        message: getErrorMessage(axiosError),
        code: axiosError.response?.status,
        retryable: shouldRetry(axiosError),
      },
    };
  }
}

function shouldRetry(error: AxiosError): boolean {
  // Retry on network errors or 5xx status codes
  return !error.response ||
    (error.response.status >= 500 && error.response.status <= 599) ||
    error.response.status === 429;
}

function getErrorMessage(error: AxiosError): string {
  if (!error.response) return UI_STRINGS.API.NETWORK_ERROR;

  switch (error.response.status) {
    case 401: return UI_STRINGS.API.UNAUTHORIZED;
    case 403: return UI_STRINGS.API.FORBIDDEN;
    case 404: return UI_STRINGS.API.NOT_FOUND;
    case 429: return UI_STRINGS.API.RATE_LIMITED;
    default: return error.response.data?.message || UI_STRINGS.API.UNKNOWN_ERROR;
  }
}

export const fetchFromBackend = async <T>(endpoint: string): Promise<T> => {
  const response = await fetchWithRetry<T>(endpoint);
  if (response.error) throw new Error(response.error.message);
  return response.data!;
};

export const postToBackend = async <T>(endpoint: string, data: any): Promise<T> => {
  const response = await fetchWithRetry<T>(endpoint, {
    method: 'POST',
    data,
  });
  if (response.error) throw new Error(response.error.message);
  return response.data!;
};