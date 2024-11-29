export class Logger {
    constructor() {
        this.logsElement = document.getElementById('logs');
    }

    log(data) {
        const timestamp = new Date().toISOString();
        const logEntry = document.createElement('div');
        logEntry.className = `log-entry ${data.type === 'error' ? 'log-error' : 'log-success'}`;

        const timestampElement = document.createElement('div');
        timestampElement.className = 'log-timestamp';
        timestampElement.textContent = timestamp;

        const detailsElement = document.createElement('div');
        detailsElement.className = 'log-details';
        detailsElement.textContent = JSON.stringify(data, null, 2);

        logEntry.appendChild(timestampElement);
        logEntry.appendChild(detailsElement);

        this.logsElement.insertBefore(logEntry, this.logsElement.firstChild);
    }

    clear() {
        this.logsElement.innerHTML = '';
    }
}