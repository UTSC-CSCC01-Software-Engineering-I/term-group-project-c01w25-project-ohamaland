import Cookies from 'js-cookie';

export function getAccessToken() {
    return Cookies.get('accessToken');
}

export function setAccessToken(token: string) {
    Cookies.set('accessToken', token, { 
        expires: 1, // 1 day
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
    });
}

export function getRefreshToken() {
    return Cookies.get('refreshToken');
}

export function setRefreshToken(token: string) {
    Cookies.set('refreshToken', token, { 
        expires: 7, // 7 days
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
    });
}

export function removeAccessToken() {
    Cookies.remove('accessToken');
}

export function removeRefreshToken() {
    Cookies.remove('refreshToken');
}

export function isAuthenticated() {
    const token = getAccessToken();
    return !!token;
}

export function logout() {
    removeAccessToken();
    removeRefreshToken();
    window.location.href = '/login';
}