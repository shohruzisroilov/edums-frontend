import { request } from './client';
import type {
    AuthUser,
    DataResponse,
    LoginResponse,
    SuperAdminLoginResponse,
    VerifyTokenResponse,
} from '@/types/api';

/** POST /api/auth/login — center_admin / manager / teacher. */
export function loginStaff(payload: {
    phone_number: string;
    password: string;
}) {
    return request<LoginResponse>('/auth/login', {
        method: 'POST',
        body: payload,
        skipAuth: true,
    });
}

/** GET /api/auth/me — joriy xodim profili. */
export async function getMe() {
    const res = await request<DataResponse<AuthUser>>('/auth/me');
    return res.data;
}

/** POST /api/super_admin/login. */
export function loginSuperAdmin(payload: {
    phone_number: string;
    password: string;
}) {
    return request<SuperAdminLoginResponse>('/super_admin/login', {
        method: 'POST',
        body: payload,
        skipAuth: true,
    });
}

/** GET /api/super_admin/verify_token. */
export function verifySuperAdminToken() {
    return request<VerifyTokenResponse>('/super_admin/verify_token');
}
