export function formatTodayHeader() {
    const today = new Date();
    return new Intl.DateTimeFormat('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    }).format(today);
}

export function getMonthName(monthIndex) {
    const date = new Date();
    date.setMonth(monthIndex - 1);
    return date.toLocaleString('default', { month: 'long' });
}
