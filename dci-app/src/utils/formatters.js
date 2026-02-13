/**
 * Robustly formats a date value which could be a Firestore Timestamp, 
 * ISO string, or Date object.
 * @param {any} dateValue - The date to format
 * @param {boolean} includeTime - Whether to include time in the output
 * @returns {string} Formatted date string or 'N/A'/'Invalid Date'
 */
export const formatDate = (dateValue, includeTime = false) => {
    if (!dateValue) return 'N/A';

    let date;

    // Handle Firestore Timestamp
    if (dateValue && typeof dateValue.toDate === 'function') {
        date = dateValue.toDate();
    } else if (dateValue instanceof Date) {
        date = dateValue;
    } else {
        // Handle ISO string or other date strings
        date = new Date(dateValue);
    }

    if (isNaN(date.getTime())) return 'Invalid Date';

    return includeTime ? date.toLocaleString() : date.toLocaleDateString();
};
