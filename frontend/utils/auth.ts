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

export function removeAccessToken() {
    Cookies.remove('accessToken');
}

export function isAuthenticated() {
    const token = getAccessToken();
    return !!token;
}