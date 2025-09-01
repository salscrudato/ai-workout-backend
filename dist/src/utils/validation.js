// Validation utilities
// Firestore document IDs are strings, typically 20 characters long
// They can contain letters, numbers, and some special characters
export const isValidObjectId = (id) => {
    // Basic validation for Firestore document ID
    // Firestore IDs are typically 20 characters but can vary
    return typeof id === 'string' && id.length > 0 && id.length <= 1500;
};
export const sanitizeString = (str) => {
    return str.trim().replace(/[<>]/g, '');
};
export const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};
//# sourceMappingURL=validation.js.map