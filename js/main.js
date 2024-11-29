import { SessionManager } from './sessionManager.js';
import { Logger } from './logger.js';

const sessionManager = new SessionManager();
const logger = new Logger();

// UI Elements
const sessionStatus = document.getElementById('sessionStatus');
const setTokensBtn = document.getElementById('setTokensBtn');
const clearLogsBtn = document.getElementById('clearLogsBtn');

// Event Handlers
setTokensBtn.addEventListener('click', () => {
    sessionManager.setTestTokens();
    sessionStatus.textContent = 'Active';
    sessionStatus.parentElement.classList.remove('status-error');
});

clearLogsBtn.addEventListener('click', () => {
    logger.clear();
});

// Session expiration handler
sessionManager.onSessionExpired = () => {
    sessionStatus.textContent = 'Session expired. Please log in again.';
    sessionStatus.parentElement.classList.add('status-error');
};