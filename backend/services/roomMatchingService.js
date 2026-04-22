/**
 * Room listing compatibility scoring.
 *
 * This intentionally mirrors the existing 0–100 "matchScore" style in
 * matchingService.js, but matches against a room's `flatmatePreferences`
 * instead of user-to-user lifestyle matching.
 */

const CLEAN_ORDER = { low: 0, medium: 1, high: 2, '': -1 };

const POINTS = {
    city: 15,
    budget: 20,
    age: 20,
    gender: 10,
    occupation: 10,
    cleanliness: 15,
    sleep: 5,
    food: 5,
    smoking: 5,
    drinking: 5,
    pets: 5,
};

const TOTAL_POINTS =
    POINTS.city +
    POINTS.budget +
    POINTS.age +
    POINTS.gender +
    POINTS.occupation +
    POINTS.cleanliness +
    POINTS.sleep +
    POINTS.food +
    POINTS.smoking +
    POINTS.drinking +
    POINTS.pets; // should be 100

function normalizeCity(x) {
    return (x ?? '').toString().trim().toLowerCase();
}

function cleanlinessDiff(levelA, levelB) {
    const a = CLEAN_ORDER[levelA] ?? -1;
    const b = CLEAN_ORDER[levelB] ?? -1;
    if (a < 0 || b < 0) return 999;
    return Math.abs(a - b);
}

/**
 * Calculates compatibility score (0-100) between a room's preferences and a user's profile.
 */
function calculateRoomCompatibility(room, user) {
    if (!room || !user) return 0;

    const prefs = room?.flatmatePreferences || {};
    const userPrefs = user?.lifestylePreferences || {};

    let score = 0;

    // City match
    const cityRoom = normalizeCity(room?.location?.city);
    const cityUser = normalizeCity(user?.city || user?.location?.city);
    if (cityRoom && cityUser && cityRoom === cityUser) score += POINTS.city;

    // Budget vs listing rent
    const rent = Number(room?.monthlyRent ?? 0);
    const budget = user?.budgetRange || {};
    const minB = Number(budget?.min ?? 0);
    const maxB = Number(budget?.max ?? 0);
    if (rent > 0 && minB > 0 && maxB > 0) {
        if (rent >= minB && rent <= maxB) score += POINTS.budget;
    }

    // Age match
    const age = Number(user?.age ?? NaN);
    const ageMin = prefs?.ageMin != null ? Number(prefs.ageMin) : null;
    const ageMax = prefs?.ageMax != null ? Number(prefs.ageMax) : null;
    if (Number.isFinite(age) && ageMin != null && ageMax != null && ageMin !== 0 && ageMax !== 0) {
        if (age >= ageMin && age <= ageMax) score += POINTS.age;
    }

    // Preferred gender match
    const preferredGender = prefs?.preferredGender || '';
    if (preferredGender && preferredGender !== 'any') {
        if ((user?.gender || '') === preferredGender) score += POINTS.gender;
    } else {
        score += POINTS.gender;
    }

    // Occupation match
    const occupation = prefs?.occupation || '';
    if (occupation && occupation !== 'any') {
        if ((user?.profession || '') === occupation) score += POINTS.occupation;
    } else {
        score += POINTS.occupation;
    }

    // Cleanliness similarity (difference <= 1)
    // Note: Model uses "cleanliness", while service was using "cleanlinessLevel"
    const cleanRoom = prefs?.cleanlinessLevel || '';
    const cleanUser = userPrefs?.cleanliness || ''; 
    if (cleanlinessDiff(cleanRoom, cleanUser) <= 1) score += POINTS.cleanliness;

    // Sleep schedule match
    const sleepRoom = prefs?.sleepSchedule || '';
    const sleepUser = userPrefs?.sleepSchedule || '';
    if (sleepRoom && sleepRoom !== 'any') {
        if (sleepRoom === sleepUser) score += POINTS.sleep;
    } else {
        score += POINTS.sleep;
    }

    // Food preference match
    const foodRoom = prefs?.foodPreference || '';
    const foodUser = userPrefs?.foodPreference || '';
    if (foodRoom && foodRoom !== 'any') {
        if (foodRoom === foodUser) score += POINTS.food;
    } else {
        score += POINTS.food;
    }

    // Smoking constraint
    const smokingAllowed = prefs?.smokingAllowed || '';
    const smokingUser = (userPrefs?.smoking || '').toString();
    if (smokingAllowed === 'not_allowed') {
        if (smokingUser === 'no') score += POINTS.smoking;
    } else {
        score += POINTS.smoking;
    }

    // Drinking constraint
    const drinkingAllowed = prefs?.drinkingAllowed || '';
    const drinkingUser = (userPrefs?.drinking || '').toString();
    if (drinkingAllowed === 'not_allowed') {
        if (drinkingUser === 'no') score += POINTS.drinking;
    } else {
        score += POINTS.drinking;
    }

    // Pets constraint (Note: model has petsAllowed boolean, but userPrefs might have something else. Checking User.js line 6: petsAllowed)
    const petsAllowedPref = prefs?.petsAllowed || '';
    const userHasPets = !!userPrefs?.petsAllowed;
    if (petsAllowedPref === 'not_allowed') {
        if (!userHasPets) score += POINTS.pets;
    } else {
        score += POINTS.pets;
    }

    // Final Percentage
    const pct = TOTAL_POINTS > 0 ? Math.round((score / TOTAL_POINTS) * 100) : 0;
    return Math.max(0, Math.min(100, pct));
}

module.exports = { 
    calculateRoomCompatibility 
};
