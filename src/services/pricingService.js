// src/services/pricingService.js

function calculateFinalPrice({ base_price, is_resident, familyRegistrationRank, quotient_familial, has_pass_sport }) {
    // Step A: resident vs non-resident
    let price = is_resident ? base_price : base_price * 1.35;

    // Step B: family degressivity — based on which registration this is for the household
    if (familyRegistrationRank === 2) {
        price = price * 0.85; // -15%
    } else if (familyRegistrationRank >= 3) {
        price = price * 0.70; // -30%
    }
    // familyRegistrationRank === 1 → 0% discount, no change

    // Step C: QF social discount — cumulative, applied on top of step B's result
    if (quotient_familial < 600) {
        price = price * 0.60; // -40%
    } else if (quotient_familial <= 900) {
        price = price * 0.80; // -20%
    }
    // QF > 900 → no additional discount

    // Step D: Pass'Sport flat deduction
    if (has_pass_sport) {
        price = price - 50;
    }

    // Step E: absolute floor — never below 15.00
    if (price < 15) {
        price = 15;
    }

    // Round to 2 decimals (money should never carry floating-point noise)
    return Math.round(price * 100) / 100;
}

module.exports = { calculateFinalPrice };