// Constants
const REFRESH_INTERVAL = 5 * 60 * 1000; // 5 minutes
const ENDPOINT = 'https://ca-stage-lake.carit.ch/services/token/refresh';

// State
let jwt = getCookie('jwt') || 'dummy-jwt-token';
let csrfToken = getCookie('csrf-token') || 'dummy-csrf-token';

// DOM Elements
const statusEl = document.getElementById('status');
const logsEl = document.getElementById('logs');

// Initialize
updateStatus('Session active');
startRefreshTimer();

// Main refresh function
async function refreshSession() {
    try {
        const response = await fetch(ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'CSRF-Token': csrfToken
            },
            body: JSON.stringify({ jwt })
        });

        const responseData = await response.json().catch(() => null);
        
        if (!response.ok) {
            throw new Error(response.status === 401 ? 'Session expired' : 'Refresh failed');
        }

        // Log the successful request
        logRequest({
            url: ENDPOINT,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'CSRF-Token': csrfToken
            },
            body: { jwt },
            status: response.status,
            response: responseData
        }, 'success');

        // Update tokens if returned in response
        if (responseData?.jwt) {
            jwt = responseData.jwt;
            setCookie('jwt', jwt);
        }
        if (responseData?.csrfToken) {
            csrfToken = responseData.csrfToken;
            setCookie('csrf-token', csrfToken);
        }

        updateStatus('Session refreshed successfully');
    } catch (error) {
        logRequest({
            url: ENDPOINT,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'CSRF-Token': csrfToken
            },
            body: { jwt },
            error: error.message
        }, 'error');

        if (error.message === 'Session expired') {
            updateStatus('Session expired. Please log in again.', 'error');
        } else {
            updateStatus(`Error: ${error.message}`, 'error');
        }
    }
}

// Timer function
function startRefreshTimer() {
    refreshSession(); // Initial refresh
    setInterval(refreshSession, REFRESH_INTERVAL);
}

// UI update functions
function updateStatus(message, type = 'success') {
    statusEl.textContent = message;
    statusEl.className = `status ${type}`;
}

function logRequest(data, type = 'success') {
    const logEntry = document.createElement('div');
    logEntry.className = `log-entry ${type}`;
    
    const timestamp = new Date().toISOString();
    logEntry.innerHTML = `
        <div class="timestamp">${timestamp}</div>
        <div class="request-info">
            ${data.method} ${data.url}
            Headers: ${JSON.stringify(data.headers, null, 2)}
            Body: ${JSON.stringify(data.body, null, 2)}
        </div>
        <div class="response-info">
            ${data.error 
                ? `Error: ${data.error}`
                : `Status: ${data.status}
                   Response: ${JSON.stringify(data.response, null, 2)}`
            }
        </div>
    `;

    logsEl.insertBefore(logEntry, logsEl.firstChild);
}

// Cookie utilities
function setCookie(name, value) {
    document.cookie = `${name}=${value};path=/;secure;samesite=strict`;
}

function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
}