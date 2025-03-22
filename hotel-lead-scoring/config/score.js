/**
 * Shared scoring rules to be used across the application
 * This eliminates redundancy between controllers and ensures consistent scoring
 */

// Score values for different actions
const SCORE_RULES = {
    // User attributes
    name: 5,
    email: 10,
    phone: 20,
    
    // User actions
    view_hotel: 10,
    wishlist: 15,
    booking: 50,
};

// Sales representative mapping
const SALES_REPS = {
    hot: "rep1@example.com",
    warm: "rep2@example.com",
    cold: "rep3@example.com"
};

/**
 * Categorize a lead based on their score
 * @param {number} score - The lead's current score
 * @returns {string} The lead category (hot, warm, or cold)
 */
const categorizeLead = (score) => {
    if (score >= 100) return "hot";
    if (score >= 75) return "warm";
    return "cold";
};

/**
 * Get the next best action for a lead based on their category
 * @param {Object} lead - The lead object with category and phone properties
 * @returns {string} Description of the recommended next action
 */
const getNextBestAction = (lead) => {
    if (lead.category === "hot") return "Call the lead immediately.";
    if (lead.category === "warm") {
        if (lead.phone) {
            return "Send WhatsApp message to lead.";
        }
        return "WhatsApp unavailable. Send a personalized email.";
    }
    return "Send an introductory email.";
};

module.exports = {
    SCORE_RULES,
    SALES_REPS,
    categorizeLead,
    getNextBestAction
}; 