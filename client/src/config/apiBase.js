/**
 * REACT_APP_API_URL should be the API server origin only, e.g.
 * https://playlister-xxxx.onrender.com or http://localhost:4000
 *
 * Store and song routes live under /api; auth lives under /auth.
 * If the env value accidentally ends with /api, it is stripped once
 * so both auth and API URLs stay correct.
 */
export const getServerOrigin = () => {
    const fallback = 'http://localhost:4000';
    const raw = (process.env.REACT_APP_API_URL || fallback).trim().replace(/\/+$/, '');
    if (raw.toLowerCase().endsWith('/api')) {
        return raw.slice(0, -4).replace(/\/+$/, '') || fallback;
    }
    return raw || fallback;
};

export const getApiBaseUrl = () => `${getServerOrigin()}/api`;

export const getAuthBaseUrl = () => `${getServerOrigin()}/auth`;
