const User = require('../models/User');
const { Request } = require('../models/Request');
const { calculateMatch } = require('../services/matchingService');
const { getCompatibilityExplanation } = require('../services/geminiService');

function normalizeText(value) {
    return String(value ?? '')
        .trim()
        .toLowerCase()
        .replace(/\s+/g, ' ');
}

function toPublicProfile(userDoc) {
    const u = typeof userDoc?.toObject === 'function' ? userDoc.toObject() : (userDoc || {});
    return {
        _id: u._id,
        name: u.name || '',
        age: u.age ?? null,
        gender: u.gender || '',
        city: u.city || u.location?.city || '',
        location: {
            city: u.location?.city || u.city || '',
            state: u.location?.state || '',
        },
        profession: u.profession || '',
        intent: u.intent || '',
        budgetRange: u.budgetRange || (u.budget != null ? { min: Number(u.budget) || 0, max: Number(u.budget) || 0 } : { min: 0, max: 0 }),
        bio: u.bio || '',
        photo: u.photo || u.profilePicture || '',
        profilePicture: u.profilePicture || u.photo || '',
        lifestylePreferences: u.lifestylePreferences || {},
        roommatePreferences: u.roommatePreferences || {},
        verificationStatus: u.verificationStatus || {},
        trustScore: u.trustScore ?? 0,
        profileCompleted: Boolean(u.profileCompleted),
    };
}

function buildRequestStatusLookup(userId, requests) {
    const myId = String(userId);
    const statusByOtherId = new Map();

    for (const r of requests) {
        const fromId = String(r.fromUserId);
        const toId = String(r.toUserId);
        const otherId = fromId === myId ? toId : fromId;
        const isRoomScoped = Boolean(r.roomId);

        if (r.status === 'accepted') {
            statusByOtherId.set(otherId, 'connected');
            continue;
        }
        if (isRoomScoped) continue;

        const current = statusByOtherId.get(otherId);
        if (current === 'connected') continue;

        if (r.status === 'pending') {
            statusByOtherId.set(otherId, fromId === myId ? 'pending_sent' : 'pending_received');
        } else if (r.status === 'rejected' && fromId === myId && !current) {
            statusByOtherId.set(otherId, 'passed');
        }
    }
    return statusByOtherId;
}

const PREFERENCE_RULES = [
    {
        label: 'Non-Veg',
        patterns: ['non-veg', 'non veg', 'nonveg', 'non-vegetarian', 'non vegetarian'],
        test: (u) => {
            const fp = normalizeText(u.lifestylePreferences?.foodPreference);
            return fp === 'non-veg' || fp === 'both';
        },
    },
    {
        label: 'Vegetarian',
        patterns: ['vegetarian', 'veg'],
        test: (u) => {
            const fp = normalizeText(u.lifestylePreferences?.foodPreference);
            return fp === 'veg' || fp === 'both';
        },
    },
    {
        label: 'Eggetarian',
        patterns: ['eggetarian', 'egg'],
        test: (u) => normalizeText(u.lifestylePreferences?.foodPreference) === 'egg',
    },
    {
        label: 'Non-Smoker',
        patterns: ['non-smoker', 'non smoker', 'nonsmoker', 'non-smoking', 'non smoking', 'no smoking'],
        test: (u) => {
            const sm = normalizeText(u.lifestylePreferences?.smoking);
            return sm === 'no' || sm === 'never';
        },
    },
    {
        label: 'Smoker',
        patterns: ['social smoker', 'smoker', 'smoking'],
        test: (u) => {
            const sm = normalizeText(u.lifestylePreferences?.smoking);
            return sm === 'yes' || sm === 'social';
        },
    },
    {
        label: 'Night Owl',
        patterns: ['night owl', 'night_owl', 'late sleeper'],
        test: (u) => normalizeText(u.lifestylePreferences?.sleepSchedule) === 'night_owl',
    },
    {
        label: 'Early Sleeper',
        patterns: ['early sleeper', 'early_sleeper', 'early bird', 'early riser'],
        test: (u) => normalizeText(u.lifestylePreferences?.sleepSchedule) === 'early_sleeper',
    },
    {
        label: 'Flexible Sleep',
        patterns: ['flexible sleep', 'flexible'],
        test: (u) => normalizeText(u.lifestylePreferences?.sleepSchedule) === 'flexible',
    },
    {
        label: 'No Pets',
        patterns: ['no pets', 'pets not allowed', 'non pet'],
        test: (u) => u.lifestylePreferences?.petsAllowed === false,
    },
    {
        label: 'Pet Friendly',
        patterns: ['pet friendly', 'pet-friendly', 'pets allowed', 'pets'],
        test: (u) => u.lifestylePreferences?.petsAllowed === true,
    },
    {
        label: 'High Cleanliness',
        patterns: ['high cleanliness', 'sparkling', 'very clean', 'clean'],
        test: (u) => {
            const cl = normalizeText(u.lifestylePreferences?.cleanliness || u.lifestylePreferences?.cleanlinessLevel);
            return cl === 'high';
        },
    },
    {
        label: 'Moderate Cleanliness',
        patterns: ['moderate cleanliness', 'medium cleanliness', 'moderate', 'tidy'],
        test: (u) => {
            const cl = normalizeText(u.lifestylePreferences?.cleanliness || u.lifestylePreferences?.cleanlinessLevel);
            return cl === 'medium';
        },
    },
    {
        label: 'Relaxed Cleanliness',
        patterns: ['relaxed cleanliness', 'low cleanliness', 'relaxed'],
        test: (u) => {
            const cl = normalizeText(u.lifestylePreferences?.cleanliness || u.lifestylePreferences?.cleanlinessLevel);
            return cl === 'low';
        },
    },
    {
        label: 'Student',
        patterns: ['student'],
        test: (u) => normalizeText(u.profession) === 'student',
    },
    {
        label: 'Working',
        patterns: ['working professional', 'working'],
        test: (u) => normalizeText(u.profession) === 'working',
    },
    {
        label: 'WFH',
        patterns: ['wfh', 'work from home', 'remote'],
        test: (u) => normalizeText(u.profession) === 'wfh',
    },
    {
        label: 'Hybrid',
        patterns: ['hybrid'],
        test: (u) => normalizeText(u.profession) === 'hybrid',
    },
    {
        label: 'Non-Binary',
        patterns: ['non-binary', 'non binary', 'nonbinary'],
        test: (u) => normalizeText(u.gender) === 'non_binary',
    },
    {
        label: 'Female',
        patterns: ['female'],
        test: (u) => normalizeText(u.gender) === 'female',
    },
    {
        label: 'Male',
        patterns: ['male'],
        test: (u) => normalizeText(u.gender) === 'male',
    },
];

function extractMatchedPreferences(queryStr) {
    let remaining = ` ${queryStr} `;
    const matchedRules = [];

    for (const rule of PREFERENCE_RULES) {
        for (const pattern of rule.patterns) {
            const padded = ` ${pattern} `;
            if (remaining.includes(padded)) {
                matchedRules.push(rule);
                remaining = remaining.split(padded).join(' ');
                break;
            }
        }
    }

    return {
        matchedRules,
        residualQuery: normalizeText(remaining),
    };
}

/**
 * GET /matches
 * Returns compatible users sorted by match percentage (auth required).
 * Excludes blocked users and already accepted/pending requests.
 */
async function getMatches(req, res) {
    try {
        const userId = req.userId;
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found.' });
        }

        const blocked = user.blockedUsers || [];
        const allOthers = await User.find({
            _id: { $nin: [userId, ...blocked] },
            profileCompleted: true,
            intent: { $ne: 'offer' },
        }).select('-passwordHash -otpCode -otpExpiresAt');

        // For explore/matches we only consider legacy user-to-user requests
        // (i.e. requests without a roomId).
        const acceptedOrPending = await Request.find({
            $and: [
                { $or: [{ fromUserId: userId }, { toUserId: userId }] },
                { status: { $in: ['accepted', 'pending', 'rejected'] } },
                { $or: [{ roomId: null }, { roomId: { $exists: false } }] },
            ],
        }).select('fromUserId toUserId').lean();
        const acceptedOrPendingWith = new Set([userId.toString()]);
        for (const r of acceptedOrPending) {
            acceptedOrPendingWith.add(r.fromUserId?.toString());
            acceptedOrPendingWith.add(r.toUserId?.toString());
        }

        const candidates = allOthers.filter(
            (u) => !acceptedOrPendingWith.has(u._id.toString())
        );

        const results = candidates.map((other) => {
            const { matchScore, reasons } = calculateMatch(user, other);
            const u = other.toObject();
            const budgetRange = u.budgetRange || {};
            const budgetStr = [budgetRange.min, budgetRange.max].every((n) => n != null && n > 0)
                ? `${budgetRange.min}-${budgetRange.max}`
                : null;
            return {
                user: u,
                matchScore,
                compatibility: matchScore,
                reasons,
                name: u.name,
                city: u.city || u.location?.city || '',
                budget: budgetStr,
            };
        });

        results.sort((a, b) => b.matchScore - a.matchScore);
        const limit = Math.min(parseInt(req.query.limit, 10) || 20, 20);
        const list = results.slice(0, limit);

        return res.json({
            success: true,
            matches: list,
        });
    } catch (err) {
        console.error('getMatches error:', err);
        return res.status(500).json({ success: false, message: err.message || 'Server error.' });
    }
}

/**
 * GET /matches/explain?userId=...
 * Returns match score + Gemini compatibility explanation for the current user and target user.
 */
async function getMatchExplain(req, res) {
    try {
        const userId = req.userId;
        const targetId = req.query.userId;
        if (!targetId) {
            return res.status(400).json({ success: false, message: 'userId query required.' });
        }

        const [user, target] = await Promise.all([
            User.findById(userId).select('-passwordHash -otpCode -otpExpiresAt'),
            User.findById(targetId).select('-passwordHash -otpCode -otpExpiresAt'),
        ]);
        if (!user || !target) {
            return res.status(404).json({ success: false, message: 'User not found.' });
        }

        const matchResult = calculateMatch(user, target);
        const compatibilityExplanation = await getCompatibilityExplanation(
            user.toObject(),
            target.toObject(),
            matchResult
        );

        return res.json({
            success: true,
            matchScore: matchResult.matchScore,
            reasons: matchResult.reasons,
            compatibilityExplanation: compatibilityExplanation || undefined,
        });
    } catch (err) {
        console.error('getMatchExplain error:', err);
        return res.status(500).json({ success: false, message: err.message || 'Server error.' });
    }
}

/**
 * GET /api/matches/search?q=...&limit=10
 * Intelligent profile search across persisted name, city/location, and lifestyle preferences.
 */
async function searchProfiles(req, res) {
    try {
        const userId = req.userId;
        const rawQuery = req.query?.q || '';
        const q = normalizeText(rawQuery);
        if (!q) {
            return res.json({ success: true, profiles: [] });
        }

        const limit = Math.min(Math.max(parseInt(req.query?.limit, 10) || 10, 1), 20);
        const currentUser = await User.findById(userId);
        if (!currentUser) {
            return res.status(404).json({ success: false, message: 'User not found.' });
        }

        const blocked = currentUser.blockedUsers || [];
        const candidates = await User.find({
            _id: { $nin: [userId, ...blocked] },
            profileCompleted: true,
            intent: { $ne: 'offer' },
        })
            .select('-passwordHash -otpCode -otpExpiresAt -email -phone -verificationDocuments')
            .lean();

        const visibleCandidates = candidates.filter(
            (u) => !(u.blockedUsers || []).some((id) => String(id) === String(userId))
        );

        const requests = await Request.find({
            $or: [{ fromUserId: userId }, { toUserId: userId }],
        })
            .select('fromUserId toUserId roomId status')
            .lean();
        const requestStatusMap = buildRequestStatusLookup(userId, requests);

        const { matchedRules, residualQuery } = extractMatchedPreferences(q);
        const queryTokens = q.split(' ').filter(Boolean);
        const residualTokens = residualQuery ? residualQuery.split(' ').filter(Boolean) : [];

        const scored = [];

        for (const other of visibleCandidates) {
            const nameNorm = normalizeText(other.name);
            const nameWords = nameNorm.split(' ').filter(Boolean);
            const cityNorm = normalizeText(other.city || other.location?.city);
            const stateNorm = normalizeText(other.location?.state);

            let relevance = 0;
            const matchedOn = [];

            // 1. Name relevance
            if (nameNorm && nameNorm === q) {
                relevance += 1000;
                matchedOn.push('Exact name');
            } else if (nameNorm && (nameNorm.startsWith(q) || nameWords.some((w) => w.startsWith(q)))) {
                relevance += 750;
                matchedOn.push('Name');
            } else if (nameNorm && nameNorm.includes(q)) {
                relevance += 450;
                matchedOn.push('Name');
            } else if (residualTokens.length > 0 && nameWords.length > 0 && residualTokens.every((t) => nameWords.some((w) => w.includes(t)))) {
                relevance += 400;
                matchedOn.push('Name');
            }

            // 2. City / location relevance (persisted city/state fields only)
            const locationTarget = residualQuery || q;
            if (cityNorm && cityNorm === locationTarget) {
                relevance += 600;
                matchedOn.push(other.city || other.location?.city || 'City');
            } else if (cityNorm && cityNorm.startsWith(locationTarget) && locationTarget.length >= 2) {
                relevance += 420;
                matchedOn.push(other.city || other.location?.city || 'City');
            } else if (cityNorm && cityNorm.includes(locationTarget) && locationTarget.length >= 2) {
                relevance += 260;
                matchedOn.push(other.city || other.location?.city || 'City');
            } else if (stateNorm && stateNorm === locationTarget) {
                relevance += 240;
                matchedOn.push(other.location?.state || 'State');
            } else if (residualTokens.length > 0 && cityNorm && residualTokens.some((t) => t.length >= 2 && cityNorm.includes(t))) {
                relevance += 220;
                matchedOn.push(other.city || other.location?.city || 'City');
            }

            // 3. Structured lifestyle/profession/gender preferences (never inferred from bio/name)
            let prefMatchCount = 0;
            for (const rule of matchedRules) {
                if (rule.test(other)) {
                    prefMatchCount += 1;
                    relevance += 320;
                    matchedOn.push(rule.label);
                }
            }

            // Combined query consistency check: if user entered both a preference and a residual term (e.g. "delhi non-veg"),
            // require BOTH to match so partial single-criterion matches from other cities are not returned.
            if (matchedRules.length > 0 && residualTokens.length > 0) {
                const matchedText = nameNorm.includes(residualQuery) || cityNorm.includes(residualQuery) || stateNorm.includes(residualQuery)
                    || residualTokens.every((t) => cityNorm.includes(t) || stateNorm.includes(t) || nameWords.some((w) => w.includes(t)));
                if (prefMatchCount > 0 && matchedText) {
                    relevance += 350;
                } else {
                    relevance = 0;
                }
            } else if (matchedRules.length > 0 && prefMatchCount === 0 && queryTokens.length === 1) {
                // Single preference token like "non-veg" or "smoker" only matches stored preferences unless it's literally a name/city
                if (!nameNorm.includes(q) && !cityNorm.includes(q)) {
                    relevance = 0;
                }
            }

            if (relevance <= 0) continue;

            const { matchScore, reasons } = calculateMatch(currentUser, other);
            const publicProfile = toPublicProfile(other);

            scored.push({
                ...publicProfile,
                compatibility: matchScore,
                matchScore,
                reasons,
                matchedOn: [...new Set(matchedOn)].slice(0, 3),
                requestStatus: requestStatusMap.get(String(other._id)) || null,
                _relevance: relevance,
            });
        }

        scored.sort((a, b) => {
            if (b._relevance !== a._relevance) return b._relevance - a._relevance;
            if (b.matchScore !== a.matchScore) return b.matchScore - a.matchScore;
            return (b.trustScore || 0) - (a.trustScore || 0);
        });

        const results = scored.slice(0, limit).map(({ _relevance, ...item }) => item);

        return res.json({
            success: true,
            profiles: results,
        });
    } catch (err) {
        console.error('searchProfiles error:', err);
        return res.status(500).json({ success: false, message: err.message || 'Server error.' });
    }
}

/**
 * GET /api/matches/city?city=...&limit=20
 * Strictly returns eligible profiles matching the selected (or authenticated user's) city, sorted by compatibility,
 * plus dynamic availableCities from eligible users in the database.
 */
async function getCityMatches(req, res) {
    try {
        const userId = req.userId;
        const limit = Math.min(Math.max(parseInt(req.query?.limit, 10) || 20, 1), 30);

        const currentUser = await User.findById(userId);
        if (!currentUser) {
            return res.status(404).json({ success: false, message: 'User not found.' });
        }

        const blocked = currentUser.blockedUsers || [];
        const candidates = await User.find({
            _id: { $nin: [userId, ...blocked] },
            profileCompleted: true,
            intent: { $ne: 'offer' },
        })
            .select('-passwordHash -otpCode -otpExpiresAt -email -phone -verificationDocuments')
            .lean();

        const visibleCandidates = candidates.filter(
            (other) => !(other.blockedUsers || []).some((id) => String(id) === String(userId))
        );

        const requests = await Request.find({
            $or: [{ fromUserId: userId }, { toUserId: userId }],
        })
            .select('fromUserId toUserId roomId status')
            .lean();
        const requestStatusMap = buildRequestStatusLookup(userId, requests);

        const cityDisplayMap = new Map();
        const addCityOption = (raw) => {
            const cleaned = String(raw || '').trim();
            const key = normalizeText(cleaned);
            if (key && !cityDisplayMap.has(key)) {
                cityDisplayMap.set(key, cleaned);
            }
        };

        const userDefaultCity = (currentUser.city || currentUser.location?.city || '').trim();
        addCityOption(userDefaultCity);
        for (const other of visibleCandidates) {
            const reqStatus = requestStatusMap.get(String(other._id)) || null;
            if (reqStatus === 'passed') continue;
            addCityOption(other.city || other.location?.city);
        }

        const availableCities = Array.from(cityDisplayMap.values()).sort((a, b) =>
            a.localeCompare(b, undefined, { sensitivity: 'base' })
        );

        const requestedCity = String(req.query?.city || '').trim();
        const rawCity = requestedCity || userDefaultCity;
        const targetCityNorm = normalizeText(rawCity);
        const displayCity = (targetCityNorm && cityDisplayMap.get(targetCityNorm)) || rawCity;

        if (!targetCityNorm) {
            return res.json({
                success: true,
                city: '',
                availableCities,
                missingCity: true,
                profiles: [],
            });
        }

        const cityMatches = [];

        for (const other of visibleCandidates) {
            const otherCityNorm = normalizeText(other.city || other.location?.city);
            if (!otherCityNorm || otherCityNorm !== targetCityNorm) continue;

            const reqStatus = requestStatusMap.get(String(other._id)) || null;
            if (reqStatus === 'passed') continue;

            const { matchScore, reasons } = calculateMatch(currentUser, other);
            const publicProfile = toPublicProfile(other);

            cityMatches.push({
                ...publicProfile,
                compatibility: matchScore,
                matchScore,
                reasons,
                requestStatus: reqStatus,
            });
        }

        cityMatches.sort((a, b) => {
            if (b.matchScore !== a.matchScore) return b.matchScore - a.matchScore;
            if ((b.trustScore || 0) !== (a.trustScore || 0)) return (b.trustScore || 0) - (a.trustScore || 0);
            return (b.reasons?.length || 0) - (a.reasons?.length || 0);
        });

        return res.json({
            success: true,
            city: displayCity,
            availableCities,
            missingCity: false,
            profiles: cityMatches.slice(0, limit),
        });
    } catch (err) {
        console.error('getCityMatches error:', err);
        return res.status(500).json({ success: false, message: err.message || 'Server error.' });
    }
}

module.exports = {
    getMatches,
    getMatchExplain,
    searchProfiles,
    getCityMatches
};
