import { CONFIG } from './config.js';
import { Logger } from './logger.js';

export class SessionManager {
    constructor() {
        this.logger = new Logger();
        this.refreshInterval = null;
        this.onSessionExpired = null;
    }

    startRefreshTimer() {
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
        }
        
        this.refreshInterval = setInterval(() => {
            this.refreshSession();
        }, CONFIG.REFRESH_INTERVAL);
        
        // Initial refresh
        this.refreshSession();
    }

    async refreshSession() {
        const jwt = this.getCookie(CONFIG.COOKIE_NAMES.JWT);
        const csrfToken = this.getCookie(CONFIG.COOKIE_NAMES.CSRF);

        if (!jwt || !csrfToken) {
            this.handleSessionExpired('Missing tokens');
            return;
        }

        try {
            const response = await fetch(CONFIG.REFRESH_ENDPOINT, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'CSRF-Token': csrfToken
                },
                body: JSON.stringify({ jwt }),
                credentials: 'include'
            });

            const data = await response.json();
            
            this.logger.log({
                url: CONFIG.REFRESH_ENDPOINT,
                method: 'POST',
                status: response.status,
                request: { jwt: '***' },
                response: data
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            // Update tokens if they're in the response
            if (data.jwt) {
                this.setCookie(CONFIG.COOKIE_NAMES.JWT, data.jwt);
            }
            if (data.csrfToken) {
                this.setCookie(CONFIG.COOKIE_NAMES.CSRF, data.csrfToken);
            }

        } catch (error) {
            this.handleSessionExpired(error.message);
        }
    }

    handleSessionExpired(reason) {
        this.logger.log({
            type: 'error',
            message: `Session expired: ${reason}`
        });
        
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
            this.refreshInterval = null;
        }

        if (this.onSessionExpired) {
            this.onSessionExpired();
        }
    }

    setCookie(name, value) {
        document.cookie = `${name}=${value}; path=/; Secure; SameSite=Strict`;
    }

    getCookie(name) {
        const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`));
        return match ? match[2] : null;
    }

    setTestTokens() {
        this.setCookie(CONFIG.COOKIE_NAMES.JWT, 'test-jwt-token');
        this.setCookie(CONFIG.COOKIE_NAMES.CSRF, 'test-csrf-token');
        this.startRefreshTimer();
    }
}