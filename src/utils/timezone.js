export function getUserTimezone() {
    try {
        return Intl.DateTimeFormat().resolvedOptions().timeZone;
    } catch {
        return 'UTC';
    }
}

export function convertToLocal(utcDateString, timezone = getUserTimezone()) {
    if (!utcDateString) return 'Invalid Date';
    const date = new Date(utcDateString);
    return new Intl.DateTimeFormat('en-US', {
        timeZone: timezone,
        dateStyle: 'medium',
        timeStyle: 'short'
    }).format(date);
}

export function formatTime(dateObj, timezone = getUserTimezone()) {
    return new Intl.DateTimeFormat('en-US', {
        timeZone: timezone,
        timeStyle: 'short'
    }).format(dateObj);
}
