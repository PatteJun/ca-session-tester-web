export const CONFIG = {
    REFRESH_ENDPOINT: 'https://ca-stage-lake.carit.ch/services/token/refresh',
    REFRESH_INTERVAL: 5 * 60 * 1000, // 5 minutes in milliseconds
    COOKIE_NAMES: {
        JWT: 'session_jwt',
        CSRF: 'csrf_token'
    }
};