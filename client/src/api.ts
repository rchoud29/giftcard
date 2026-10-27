export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  emailVerified: boolean;
  createdAt: string;
}

export interface SecurityEvent {
  type: string;
  ip: string | null;
  userAgent: string | null;
  createdAt: string;
}

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public details: Record<string, string[]> = {},
  ) {
    super(message);
  }
}

async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
  const res = await fetch(`/api${path}`, {
    method,
    credentials: 'same-origin',
    headers: body === undefined ? undefined : { 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  if (res.status === 204) return undefined as T;
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(res.status, data.error ?? 'Something went wrong', data.details);
  return data as T;
}

type Message = { message: string };

export const api = {
  me: () => request<{ user: User }>('GET', '/auth/me'),
  register: (input: { email: string; password: string; firstName: string; lastName: string }) =>
    request<Message>('POST', '/auth/register', input),
  login: (email: string, password: string) => request<{ user: User }>('POST', '/auth/login', { email, password }),
  logout: () => request<void>('POST', '/auth/logout'),
  verifyEmail: (token: string) => request<Message>('POST', '/auth/verify-email', { token }),
  resendVerification: (email: string) => request<Message>('POST', '/auth/resend-verification', { email }),
  forgotPassword: (email: string) => request<Message>('POST', '/auth/forgot-password', { email }),
  resetPassword: (token: string, password: string) =>
    request<Message>('POST', '/auth/reset-password', { token, password }),
  updateProfile: (input: { firstName?: string; lastName?: string; phone?: string | null }) =>
    request<{ user: User }>('PATCH', '/account', input),
  changePassword: (currentPassword: string, newPassword: string) =>
    request<Message>('POST', '/account/change-password', { currentPassword, newPassword }),
  activity: () => request<{ events: SecurityEvent[] }>('GET', '/account/activity'),
};
