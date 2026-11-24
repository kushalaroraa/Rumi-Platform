/**
 * Rumi seeker compatibility scoring (0–100).
 * Compares personal lifestyle traits (self-description) + roommatePreferences (desired flatmate)
 * across two users, reading both `cleanliness` and legacy `cleanlinessLevel`.
 */

const POINTS = {
    sameCity: 20,
    budgetOverlap: 20,
    cleanlinessSimilar: 15,
    sleepSchedule: 10,
    foodPreference: 10,
    smoking: 10,
    workingStatus: 5,
    roommateFit: 10,
};
const MAX_SCORE = 100;

/** Cleanliness order for "difference ≤ 1" (low=0, medium=1, high=2). */
const CLEAN_ORDER = { low: 0, medium: 1, high: 2, '': -1 };

function normalizeBudgetBounds(user) {
    const legacy = user?.budget != null ? Number(user.budget) : 0;
    const rawMin = Number(user?.budgetRange?.min ?? (legacy > 0 ? legacy : 0));
    const rawMax = Number(user?.budgetRange?.max ?? (legacy > 0 ? legacy : 0));
    const minVal = Number.isFinite(rawMin) && rawMin > 0 ? rawMin : 0;
    const maxVal = Number.isFinite(rawMax) && rawMax > 0 ? rawMax : 0;
    if (minVal === 0 && maxVal === 0) return null;
    const effMin = minVal > 0 ? minVal : maxVal;
    const effMax = maxVal > 0 ? Math.max(effMin, maxVal) : minVal;
    return { min: effMin, max: effMax };
}

function budgetOverlap(userA, userB) {
    const a = normalizeBudgetBounds(userA);
    const b = normalizeBudgetBounds(userB);
    if (!a || !b) return false;
    return a.max >= b.min && b.max >= a.min;
}

function cleanlinessDifference(levelA, levelB) {
    const va = CLEAN_ORDER[levelA] ?? -1;
    const vb = CLEAN_ORDER[levelB] ?? -1;
    if (va < 0 || vb < 0) return 999;
    return Math.abs(va - vb);
}

function normalizeSmoking(val) {
    const s = (val || '').toString().trim().toLowerCase();
    if (s === 'never') return 'no';
    return s;
}

function checkGenderAndAgeFit(seeker, candidate) {
    const rp = seeker?.roommatePreferences || {};
    let fit = 0;

    const prefGender = (rp.preferredGender || 'any').toString().toLowerCase();
    const candGender = (candidate?.gender || '').toString().toLowerCase();
    if (!prefGender || prefGender === 'any' || (candGender && candGender === prefGender)) {
        fit += 1.5;
    }

    const candAge = Number(candidate?.age);
    const ageMin = rp.ageMin != null ? Number(rp.ageMin) : null;
    const ageMax = rp.ageMax != null ? Number(rp.ageMax) : null;
    if (!Number.isFinite(candAge) || !ageMin || !ageMax || (candAge >= ageMin && candAge <= ageMax)) {
        fit += 2;
    }

    const petsPref = (rp.petsPreference || 'any').toString().toLowerCase();
    const candHasPets = Boolean(candidate?.lifestylePreferences?.petsAllowed);
    if (!petsPref || petsPref === 'any' || (petsPref === 'allowed') || (petsPref === 'not_allowed' && !candHasPets)) {
        fit += 1.5;
    }

    return fit; // max 5 per direction -> 10 mutual
}

/**
 * Calculate compatibility score (0–100) and reasons.
 * @param {Object} userA - User document
 * @param {Object} userB - User document
 * @returns {{ matchScore: number, reasons: string[] }}
 */
function calculateMatch(userA, userB) {
    if (!userA || !userB) return { matchScore: 0, reasons: [] };

    let score = 0;
    const reasons = [];

    const cityA = (userA.city || userA.location?.city || '').toString().trim().toLowerCase();
    const cityB = (userB.city || userB.location?.city || '').toString().trim().toLowerCase();
    if (cityA && cityB && cityA === cityB) {
        score += POINTS.sameCity;
        reasons.push('Same city');
    }

    if (budgetOverlap(userA, userB)) {
        score += POINTS.budgetOverlap;
        reasons.push('Budget overlap');
    }

    const prefsA = userA.lifestylePreferences || {};
    const prefsB = userB.lifestylePreferences || {};
    const cleanA = (prefsA.cleanliness || prefsA.cleanlinessLevel || '').toString().toLowerCase();
    const cleanB = (prefsB.cleanliness || prefsB.cleanlinessLevel || '').toString().toLowerCase();
    const cleanDiff = cleanlinessDifference(cleanA, cleanB);
    if (cleanDiff <= 1 && cleanDiff < 999) {
        score += POINTS.cleanlinessSimilar;
        reasons.push('Similar cleanliness');
    }

    const sleepA = (prefsA.sleepSchedule || '').toString().toLowerCase();
    const sleepB = (prefsB.sleepSchedule || '').toString().toLowerCase();
    if (sleepA && sleepB) {
        if (sleepA === sleepB) {
            score += POINTS.sleepSchedule;
            reasons.push('Similar sleep schedule');
        } else if (sleepA === 'flexible' || sleepB === 'flexible') {
            score += Math.round(POINTS.sleepSchedule * 0.7);
            reasons.push('Flexible sleep schedule');
        }
    }

    const foodA = (prefsA.foodPreference || '').toString().toLowerCase();
    const foodB = (prefsB.foodPreference || '').toString().toLowerCase();
    if (foodA && foodB) {
        if (foodA === foodB) {
            score += POINTS.foodPreference;
            reasons.push('Same food preference');
        } else if (foodA === 'both' || foodB === 'both') {
            score += Math.round(POINTS.foodPreference * 0.7);
            reasons.push('Compatible food preference');
        }
    }

    const smokeA = normalizeSmoking(prefsA.smoking);
    const smokeB = normalizeSmoking(prefsB.smoking);
    if (smokeA && smokeB) {
        if (smokeA === smokeB) {
            score += POINTS.smoking;
            reasons.push('Smoking preference match');
        } else if ((smokeA === 'yes' && smokeB === 'social') || (smokeA === 'social' && smokeB === 'yes')) {
            score += Math.round(POINTS.smoking * 0.5);
        }
    }

    const workA = (userA.profession || '').toString().toLowerCase();
    const workB = (userB.profession || '').toString().toLowerCase();
    if (workA && workB && workA === workB) {
        score += POINTS.workingStatus;
        reasons.push('Similar profession');
    }

    const mutualFit = Math.round(checkGenderAndAgeFit(userA, userB) + checkGenderAndAgeFit(userB, userA));
    score += Math.min(POINTS.roommateFit, mutualFit);

    const compatibility = Math.max(0, Math.min(MAX_SCORE, Math.round(score)));
    return {
        matchScore: compatibility,
        reasons,
    };
}

module.exports = { calculateMatch };
