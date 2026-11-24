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

    // Budget vs listing rent (supports exact single budgets & legacy scalar/half-specified bounds)
    const rent = Number(room?.monthlyRent ?? 0);
    const budget = user?.budgetRange || {};
    const legacy = user?.budget != null ? Number(user.budget) : 0;
    const rawMin = Number(budget?.min ?? (legacy > 0 ? legacy : 0));
    const rawMax = Number(budget?.max ?? (legacy > 0 ? legacy : 0));
    const minB = Number.isFinite(rawMin) && rawMin > 0 ? rawMin : 0;
    const maxB = Number.isFinite(rawMax) && rawMax > 0 ? rawMax : 0;
    if (rent > 0 && (minB > 0 || maxB > 0)) {
        const effMin = minB > 0 ? minB : maxB;
        const effMax = maxB > 0 ? Math.max(effMin, maxB) : minB;
        if (rent >= effMin && rent <= effMax) {
            score += POINTS.budget;
        } else if (rent >= effMin * 0.85 && rent <= effMax * 1.15) {
            score += Math.round(POINTS.budget * 0.5);
        }
    }

    // Age match
    const age = Number(user?.age ?? NaN);
    const ageMin = prefs?.ageMin != null ? Number(prefs.ageMin) : null;
    const ageMax = prefs?.ageMax != null ? Number(prefs.ageMax) : null;
    if (Number.isFinite(age) && ageMin != null && ageMax != null && ageMin !== 0 && ageMax !== 0) {
        if (age >= ageMin && age <= ageMax) score += POINTS.age;
    } else if (!ageMin && !ageMax) {
        score += POINTS.age;
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
        if ((user?.profession || '').toLowerCase() === occupation.toLowerCase()) score += POINTS.occupation;
    } else {
        score += POINTS.occupation;
    }

    // Cleanliness similarity (difference <= 1), supporting both cleanliness & legacy cleanlinessLevel
    const cleanRoom = (prefs?.cleanlinessLevel || '').toString().toLowerCase();
    const cleanUser = (userPrefs?.cleanliness || userPrefs?.cleanlinessLevel || '').toString().toLowerCase();
    if (!cleanRoom || cleanRoom === 'any' || !cleanUser || cleanlinessDiff(cleanRoom, cleanUser) <= 1) {
        score += POINTS.cleanliness;
    }

    // Sleep schedule match
    const sleepRoom = (prefs?.sleepSchedule || '').toString().toLowerCase();
    const sleepUser = (userPrefs?.sleepSchedule || '').toString().toLowerCase();
    if (sleepRoom && sleepRoom !== 'any') {
        if (!sleepUser || sleepRoom === sleepUser || sleepUser === 'flexible') score += POINTS.sleep;
    } else {
        score += POINTS.sleep;
    }

    // Food preference match
    const foodRoom = (prefs?.foodPreference || '').toString().toLowerCase();
    const foodUser = (userPrefs?.foodPreference || '').toString().toLowerCase();
    if (foodRoom && foodRoom !== 'any') {
        if (foodRoom === foodUser || foodUser === 'both') score += POINTS.food;
    } else {
        score += POINTS.food;
    }

    // Smoking constraint
    const smokingAllowed = (prefs?.smokingAllowed || '').toString().toLowerCase();
    const smokingUser = (userPrefs?.smoking || '').toString().toLowerCase();
    if (smokingAllowed === 'not_allowed') {
        if (!smokingUser || smokingUser === 'no' || smokingUser === 'never') score += POINTS.smoking;
    } else {
        score += POINTS.smoking;
    }

    // Drinking constraint
    const drinkingAllowed = (prefs?.drinkingAllowed || '').toString().toLowerCase();
    const drinkingUser = (userPrefs?.drinking || '').toString().toLowerCase();
    if (drinkingAllowed === 'not_allowed') {
        if (!drinkingUser || drinkingUser === 'no' || drinkingUser === 'never') score += POINTS.drinking;
    } else {
        score += POINTS.drinking;
    }

    // Pets constraint
    const petsAllowedPref = (prefs?.petsAllowed || '').toString().toLowerCase();
    const userHasPets = Boolean(userPrefs?.petsAllowed);
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
