import { request } from './client';
import type {
    AuthUser,
    DataResponse,
    LoginResponse,
    MessageResponse,
    RegisterPayload,
    ResetForgottenPasswordPayload,
    SendCodeResponse,
    Session,
    SuperAdminLoginResponse,
    UpdateOwnProfilePayload,
    VerifyTokenResponse,
} from '@/types/api';

/** POST /api/auth/login — markaz foydalanuvchisi. */
export function loginUser(payload: { phone_number: string; password: string }) {
    return request<LoginResponse>('/auth/login', {
        method: 'POST',
        body: payload,
        skipAuth: true,
    });
}

/** POST /api/auth/register/send-code — telefonga 6 xonali kod. */
export function sendRegistrationCode(phone_number: string) {
    return request<SendCodeResponse>('/auth/register/send-code', {
        method: 'POST',
        body: { phone_number },
        skipAuth: true,
    });
}

/** POST /api/auth/register — markaz + owner + sinov muddati; javob login bilan bir xil. */
export function register(payload: RegisterPayload) {
    return request<LoginResponse>('/auth/register', {
        method: 'POST',
        body: payload,
        skipAuth: true,
    });
}

/** POST /api/auth/password/send-code — "parolni unutdim": login telefoniga kod. */
export function sendPasswordResetCode(phone_number: string) {
    return request<SendCodeResponse>('/auth/password/send-code', {
        method: 'POST',
        body: { phone_number },
        skipAuth: true,
    });
}

/** POST /api/auth/password/reset — yangi parol; javob login bilan bir xil. */
export function resetForgottenPassword(payload: ResetForgottenPasswordPayload) {
    return request<LoginResponse>('/auth/password/reset', {
        method: 'POST',
        body: payload,
        skipAuth: true,
    });
}

/** GET /api/auth/me — profil, rollar va samarali ruxsatlar. */
export async function getMe() {
    const res = await request<DataResponse<AuthUser>>('/auth/me');
    return res.data;
}

/** PATCH /api/auth/me — o'z ismi, familiyasi va rasmi. */
export async function updateMe(payload: UpdateOwnProfilePayload) {
    const res = await request<DataResponse<AuthUser>>('/auth/me', {
        method: 'PATCH',
        body: payload,
    });
    return res.data;
}

/** PATCH /api/auth/me/password — joriy parol noto'g'ri bo'lsa 400. */
/**
 * Boshqa qurilmalardagi sessiyalar tugaydi; javobdagi yangi token bilan
 * shu sessiya davom etadi — uni sessiyaga yozish kerak.
 */
export function changeMyPassword(payload: {
    current_password: string;
    new_password: string;
}) {
    return request<MessageResponse & { token: string }>('/auth/me/password', {
        method: 'PATCH',
        body: payload,
    });
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

/** /auth/login va /auth/me javobidan sessiya yasaydi. */
export function sessionFromAuthUser(token: string, user: AuthUser): Session {
    return {
        token,
        kind: 'user',
        id: user.id,
        phone_number: user.phone_number,
        first_name: user.first_name,
        last_name: user.last_name,
        avatar_url: user.avatar_url,
        education: { id: user.education.id, name: user.education.name },
        roles: user.roles,
        is_owner: user.is_owner,
        permissions: user.permissions,
        subscription: user.subscription,
    };
}
