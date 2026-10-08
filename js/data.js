/*
 * ASOIAF Genesys Character Builder
 * data.js
 *
 * Static game data only.
 * Application logic belongs in character.js and app.js.
 */

"use strict";

const GAME_DATA = {

    // ============================================================
    // CHARACTER CREATION
    // ============================================================

    characterCreation: {
        startingXP: 110,
        startingObligation: 10,
        startingWealth: 1000,

        characteristicMinimum: 1,
        characteristicStartingValue: 2,
        characteristicMaximumAtCreation: 5,

        weakness: {
            allowed: true,
            maximumReductions: 1,
            reduction: 1,
            bonusXP: 20
        },

        startingCareerSkillRanks: 4,

        background: {
            skillChoices: 2,
            startingRank: 1,
            mustBeNonCareer: true,
            mustBeDifferent: true
        },

        obligation: {
            normalMaximumIncrease: 10,
            soloMaximumIncrease: 30,

            options: [
                {
                    obligation: 5,
                    xp: 5,
                    wealth: 1000
                },
                {
                    obligation: 10,
                    xp: 10,
                    wealth: 2500
                }
            ],

            xpRestrictions: {
                characteristics: false,
                skills: true,
                talents: true
            }
        }
    },


    // ============================================================
    // CHARACTERISTICS
    // ============================================================

    characteristics: [
        {
            id: "brawn",
            name: "Brawn"
        },
        {
            id: "agility",
            name: "Agility"
        },
        {
            id: "intellect",
            name: "Intellect"
        },
        {
            id: "cunning",
            name: "Cunning"
        },
        {
            id: "willpower",
            name: "Willpower"
        },
        {
            id: "presence",
            name: "Presence"
        }
    ],


    // ============================================================
    // THRESHOLD PROFILES
    // ============================================================

    thresholdProfiles: [
        {
            id: "balanced",
            name: "Balanced",
            woundBase: 10,
            woundCharacteristic: "brawn",
            strainBase: 10,
            strainCharacteristic: "willpower"
        },
        {
            id: "hardy",
            name: "Hardy",
            woundBase: 12,
            woundCharacteristic: "brawn",
            strainBase: 8,
            strainCharacteristic: "willpower"
        },
        {
            id: "resolute",
            name: "Resolute",
            woundBase: 8,
            woundCharacteristic: "brawn",
            strainBase: 12,
            strainCharacteristic: "willpower"
        }
    ],


    // ============================================================
    // SKILLS
    // ============================================================

    skills: [

        // General Skills

        {
            id: "athletics",
            name: "Athletics",
            category: "General",
            characteristic: "brawn"
        },
        {
            id: "cool",
            name: "Cool",
            category: "General",
            characteristic: "presence"
        },
        {
            id: "coordination",
            name: "Coordination",
            category: "General",
            characteristic: "agility"
        },
        {
            id: "discipline",
            name: "Discipline",
            category: "General",
            characteristic: "willpower"
        },
        {
            id: "masonry",
            name: "Masonry",
            category: "General",
            characteristic: "intellect"
        },
        {
            id: "medicine",
            name: "Medicine",
            category: "General",
            characteristic: "intellect"
        },
        {
            id: "navigation",
            name: "Navigation",
            category: "General",
            characteristic: "cunning"
        },
        {
            id: "perception",
            name: "Perception",
            category: "General",
            characteristic: "cunning"
        },
        {
            id: "resilience",
            name: "Resilience",
            category: "General",
            characteristic: "brawn"
        },
        {
            id: "riding",
            name: "Riding",
            category: "General",
            characteristic: "agility"
        },
        {
            id: "sailing",
            name: "Sailing",
            category: "General",
            characteristic: "cunning"
        },
        {
            id: "skulduggery",
            name: "Skulduggery",
            category: "General",
            characteristic: "cunning"
        },
        {
            id: "smithing",
            name: "Smithing",
            category: "General",
            characteristic: "intellect"
        },
        {
            id: "stealth",
            name: "Stealth",
            category: "General",
            characteristic: "agility"
        },
        {
            id: "streetwise",
            name: "Streetwise",
            category: "General",
            characteristic: "cunning"
        },
        {
            id: "survival",
            name: "Survival",
            category: "General",
            characteristic: "cunning"
        },
        {
            id: "vigilance",
            name: "Vigilance",
            category: "General",
            characteristic: "willpower"
        },
        {
            id: "warfare",
            name: "Warfare",
            category: "General",
            characteristic: "intellect"
        },
        {
            id: "woodworking",
            name: "Woodworking",
            category: "General",
            characteristic: "intellect"
        },

        // Combat Skills

        {
            id: "brawl",
            name: "Brawl",
            category: "Combat",
            characteristic: "brawn"
        },
        {
            id: "melee-heavy",
            name: "Melee (Heavy)",
            category: "Combat",
            characteristic: "brawn"
        },
        {
            id: "melee-light",
            name: "Melee (Light)",
            category: "Combat",
            characteristic: "brawn"
        },
        {
            id: "ranged",
            name: "Ranged",
            category: "Combat",
            characteristic: "agility"
        },
        {
            id: "siege-weapons",
            name: "Siege Weapons",
            category: "Combat",
            characteristic: "intellect"
        },

        // Social Skills

        {
            id: "charm",
            name: "Charm",
            category: "Social",
            characteristic: "presence"
        },
        {
            id: "coercion",
            name: "Coercion",
            category: "Social",
            characteristic: "willpower"
        },
        {
            id: "deception",
            name: "Deception",
            category: "Social",
            characteristic: "cunning"
        },
        {
            id: "leadership",
            name: "Leadership",
            category: "Social",
            characteristic: "presence"
        },
        {
            id: "negotiation",
            name: "Negotiation",
            category: "Social",
            characteristic: "presence"
        },

        // Knowledge Skills

        {
            id: "history",
            name: "History",
            category: "Knowledge",
            characteristic: "intellect"
        },
        {
            id: "religion",
            name: "Religion",
            category: "Knowledge",
            characteristic: "intellect"
        },
        {
            id: "society",
            name: "Society",
            category: "Knowledge",
            characteristic: "intellect"
        }
    ],


    // ============================================================
    // CAREERS
    // ============================================================

    careers: [

        // --------------------------------------------------------
        // WARRIOR
        // --------------------------------------------------------

        {
            id: "warrior",
            name: "Warrior",

            coreSkills: [
                "cool",
                "resilience",
                "melee-heavy",
                "melee-light"
            ],

            specializations: [
                {
                    id: "knight",
                    name: "Knight",
                    skills: [
                        "leadership",
                        "riding",
                        "society",
                        "warfare"
                    ]
                },
                {
                    id: "man-at-arms",
                    name: "Man-at-Arms",
                    skills: [
                        "athletics",
                        "brawl",
                        "discipline",
                        "siege-weapons"
                    ]
                },
                {
                    id: "archer",
                    name: "Archer",
                    skills: [
                        "coordination",
                        "perception",
                        "ranged",
                        "survival"
                    ]
                }
            ]
        },


        // --------------------------------------------------------
        // COMMANDER
        // --------------------------------------------------------

        {
            id: "commander",
            name: "Commander",

            coreSkills: [
                "cool",
                "discipline",
                "leadership",
                "warfare"
            ],

            specializations: [
                {
                    id: "captain",
                    name: "Captain",
                    skills: [
                        "navigation",
                        "sailing",
                        "perception",
                        "survival"
                    ]
                },
                {
                    id: "castellan",
                    name: "Castellan",
                    skills: [
                        "masonry",
                        "negotiation",
                        "society",
                        "vigilance"
                    ]
                },
                {
                    id: "marshal",
                    name: "Marshal",
                    skills: [
                        "athletics",
                        "history",
                        "melee-light",
                        "riding"
                    ]
                }
            ]
        },


        // --------------------------------------------------------
        // COURTIER
        // --------------------------------------------------------

        {
            id: "courtier",
            name: "Courtier",

            coreSkills: [
                "charm",
                "negotiation",
                "perception",
                "society"
            ],

            specializations: [
                {
                    id: "diplomat",
                    name: "Diplomat",
                    skills: [
                        "cool",
                        "discipline",
                        "history",
                        "leadership"
                    ]
                },
                {
                    id: "schemer",
                    name: "Schemer",
                    skills: [
                        "coercion",
                        "deception",
                        "streetwise",
                        "vigilance"
                    ]
                },
                {
                    id: "assassin",
                    name: "Assassin",
                    skills: [
                        "melee-light",
                        "ranged",
                        "skulduggery",
                        "stealth"
                    ]
                }
            ]
        },


        // --------------------------------------------------------
        // ROGUE
        // --------------------------------------------------------

        {
            id: "rogue",
            name: "Rogue",

            coreSkills: [
                "cool",
                "stealth",
                "streetwise",
                "vigilance"
            ],

            specializations: [
                {
                    id: "thief",
                    name: "Thief",
                    skills: [
                        "athletics",
                        "coordination",
                        "perception",
                        "skulduggery"
                    ]
                },
                {
                    id: "spy",
                    name: "Spy",
                    skills: [
                        "charm",
                        "deception",
                        "discipline",
                        "society"
                    ]
                },
                {
                    id: "outlaw",
                    name: "Outlaw",
                    skills: [
                        "brawl",
                        "coercion",
                        "melee-light",
                        "ranged"
                    ]
                }
            ]
        },


        // --------------------------------------------------------
        // SCHOLAR
        // --------------------------------------------------------

        {
            id: "scholar",
            name: "Scholar",

            coreSkills: [
                "history",
                "medicine",
                "religion",
                "society"
            ],

            specializations: [
                {
                    id: "engineer",
                    name: "Engineer",
                    skills: [
                        "masonry",
                        "siege-weapons",
                        "warfare",
                        "woodworking"
                    ]
                },
                {
                    id: "physician",
                    name: "Physician",
                    skills: [
                        "cool",
                        "discipline",
                        "perception",
                        "resilience"
                    ]
                },
                {
                    id: "devout",
                    name: "Devout",
                    skills: [
                        "charm",
                        "coercion",
                        "leadership",
                        "vigilance"
                    ]
                }
            ]
        },


        // --------------------------------------------------------
        // EXPERT
        // --------------------------------------------------------

        {
            id: "expert",
            name: "Expert",

            coreSkills: [
                "coordination",
                "negotiation",
                "perception",
                "resilience"
            ],

            specializations: [
                {
                    id: "artisan",
                    name: "Artisan",
                    skills: [
                        "discipline",
                        "masonry",
                        "smithing",
                        "woodworking"
                    ]
                },
                {
                    id: "steward",
                    name: "Steward",
                    skills: [
                        "history",
                        "leadership",
                        "riding",
                        "society"
                    ]
                },
                {
                    id: "sailor",
                    name: "Sailor",
                    skills: [
                        "athletics",
                        "navigation",
                        "sailing",
                        "survival"
                    ]
                }
            ]
        },


        // --------------------------------------------------------
        // SCOUT
        // --------------------------------------------------------

        {
            id: "scout",
            name: "Scout",

            coreSkills: [
                "navigation",
                "perception",
                "stealth",
                "survival"
            ],

            specializations: [
                {
                    id: "hunter",
                    name: "Hunter",
                    skills: [
                        "athletics",
                        "ranged",
                        "skulduggery",
                        "vigilance"
                    ]
                },
                {
                    id: "raider",
                    name: "Raider",
                    skills: [
                        "cool",
                        "melee-heavy",
                        "melee-light",
                        "warfare"
                    ]
                },
                {
                    id: "messenger",
                    name: "Messenger",
                    skills: [
                        "charm",
                        "resilience",
                        "riding",
                        "streetwise"
                    ]
                }
            ]
        }
    ]
};


// ================================================================
// LOOKUP HELPERS
// ================================================================
//
// These are intentionally simple data-access helpers.
// Character-building rules and XP calculations should NOT go here.
// ================================================================

function getSkillById(skillId) {
    return GAME_DATA.skills.find(skill => skill.id === skillId);
}


function getCareerById(careerId) {
    return GAME_DATA.careers.find(career => career.id === careerId);
}


function getSpecializationById(careerId, specializationId) {
    const career = getCareerById(careerId);

    if (!career) {
        return undefined;
    }

    return career.specializations.find(
        specialization => specialization.id === specializationId
    );
}


function getCareerSkillIds(careerId, specializationId) {
    const career = getCareerById(careerId);

    if (!career) {
        return [];
    }

    const specialization = getSpecializationById(
        careerId,
        specializationId
    );

    if (!specialization) {
        return [...career.coreSkills];
    }

    return [
        ...career.coreSkills,
        ...specialization.skills
    ];
}


function getThresholdProfileById(profileId) {
    return GAME_DATA.thresholdProfiles.find(
        profile => profile.id === profileId
    );
}
