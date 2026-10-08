/*
 * ASOIAF Genesys Character Builder
 * character.js
 *
 * Character state, calculations, and validation.
 */

"use strict";

const character = {

    // ============================================================
    // BASIC INFORMATION
    // ============================================================

    name: "",

    background: {
        name: "",
        skills: []
    },


    // ============================================================
    // CHARACTERISTICS
    // ============================================================

    characteristics: {
        brawn: 2,
        agility: 2,
        intellect: 2,
        cunning: 2,
        willpower: 2,
        presence: 2
    },

    weakness: null,

    thresholdProfile: null,


    // ============================================================
    // CAREER
    // ============================================================

    career: null,
    specialization: null,


    // ============================================================
    // SKILLS
    // ============================================================

    /*
     * skillRanks contains purchased/free ranks.
     *
     * Example:
     * {
     *     "melee-heavy": 2,
     *     "riding": 1
     * }
     */
    skillRanks: {},

    /*
     * The four free rank-1 skills selected from the character's
     * starting Career + Specialization package.
     */
    freeCareerSkills: [],


    // ============================================================
    // TALENTS
    // ============================================================

    talents: [],


    // ============================================================
    // OBLIGATION
    // ============================================================

    obligation: {
        base: 10,
        additional: 0,
        xpBonus: 0,
        wealthBonus: 0
    },


    // ============================================================
    // EQUIPMENT
    // ============================================================

    equipment: []
};


// ================================================================
// CHARACTERISTIC COSTS
// ================================================================

function getCharacteristicXPSpent() {
    let total = 0;

    for (const characteristic of GAME_DATA.characteristics) {
        const id = characteristic.id;
        const currentValue = character.characteristics[id];

        /*
         * A characteristic reduced to 1 through the weakness option
         * costs no XP. The +20 XP is handled separately.
         */
        if (currentValue <= 2) {
            continue;
        }

        /*
         * Genesys characteristic advancement:
         *
         * 2 -> 3 = 30 XP
         * 3 -> 4 = 40 XP
         * 4 -> 5 = 50 XP
         */
        for (let rating = 3; rating <= currentValue; rating++) {
            total += rating * 10;
        }
    }

    return total;
}


function getWeaknessBonusXP() {
    return Object.values(character.characteristics)
        .some(value => value === 1)
        ? 20
        : 0;
}


function getWeaknessCharacteristic() {
    const weakness = GAME_DATA.characteristics.find(
        stat => character.characteristics[stat.id] === 1
    );

    return weakness ? weakness.id : null;
}


function getCharacteristicIncreaseCost(id) {
    const current = character.characteristics[id];

    if (current === 1) {
        return 0;
    }

    return (current + 1) * 10;
}


function canIncreaseCharacteristic(id) {
    const current = character.characteristics[id];

    if (
        current >=
        GAME_DATA.characterCreation
            .characteristicMaximumAtCreation
    ) {
        return false;
    }

    /*
     * Raising a weakened characteristic from 1 to 2
     * removes the +20 weakness bonus.
     *
     * Test the resulting XP pool directly rather than
     * treating this as a characteristic XP purchase.
     */
    if (current === 1) {
        const xpAfterRemovingWeakness =
            getXPRemaining() -
            GAME_DATA.characterCreation.weakness.bonusXP;

        return xpAfterRemovingWeakness >= 0;
    }

    const cost = (current + 1) * 10;

    return cost <= getXPRemaining();
}


function canDecreaseCharacteristic(id) {
    const current = character.characteristics[id];

    /*
     * Nothing can fall below 1.
     */
    if (current <= 1) {
        return false;
    }

    /*
     * Purchased characteristic increases may always
     * be undone during character creation.
     */
    if (current > 2) {
        return true;
    }

    /*
     * At 2, this would create the character's one
     * permitted weakness. It is legal only if no
     * other characteristic is already at 1.
     */
    return getWeaknessCharacteristic() === null;
}

// ================================================================
// CAREER SKILLS
// ================================================================

function getCurrentCareerSkillIds() {
    if (!character.career) {
        return [];
    }

    return getCareerSkillIds(
        character.career,
        character.specialization
    );
}


function isCareerSkill(skillId) {
    return getCurrentCareerSkillIds().includes(skillId);
}


// ================================================================
// SKILL RANKS
// ================================================================

function getSkillRank(skillId) {
    return character.skillRanks[skillId] || 0;
}


function getBackgroundSkillRank(skillId) {
    return character.background.skills.includes(skillId) ? 1 : 0;
}


function getTotalSkillRank(skillId) {
    const purchasedRank =
        getSkillRank(skillId);

    const backgroundRank =
        getBackgroundSkillRank(skillId);

    const freeCareerRank =
        character.freeCareerSkills.includes(skillId)
            ? 1
            : 0;

    return Math.max(
        purchasedRank,
        backgroundRank,
        freeCareerRank
    );
}

// ================================================================
// SKILL XP COSTS
// ================================================================

function getSkillXPSpent() {
    let total = 0;

    for (const skill of GAME_DATA.skills) {

        const skillId = skill.id;
        const finalRank = getSkillRank(skillId);

        if (finalRank === 0) {
            continue;
        }

        const career = isCareerSkill(skillId);
        const hasFreeCareerRank =
            character.freeCareerSkills.includes(skillId);
        
        const hasFreeBackgroundRank =
            character.background.skills.includes(skillId);
        
        const hasFreeRank =
            hasFreeCareerRank || hasFreeBackgroundRank;

        /*
         * Starting Career skill:
         *
         * Rank 1 is free if selected as one of the four
         * starting Career skill ranks.
         *
         * Subsequent ranks cost normally.
         */
        const startingPaidRank = hasFreeRank ? 2 : 1;

        for (
            let rank = startingPaidRank;
            rank <= finalRank;
            rank++
        ) {
            let cost = rank * 5;

            if (!career) {
                cost += 5;
            }

            total += cost;
        }
    }

    return total;
}


// ================================================================
// TALENT XP COSTS
// ================================================================

function getTalentXPSpent() {
    /*
     * Talents will eventually contain objects such as:
     *
     * {
     *     id: "grit",
     *     tier: 1
     * }
     *
     * Genesys talent cost:
     *
     * Tier 1 = 5 XP
     * Tier 2 = 10 XP
     * Tier 3 = 15 XP
     * Tier 4 = 20 XP
     * Tier 5 = 25 XP
     */

    return character.talents.reduce(
        (total, talent) => total + (talent.tier * 5),
        0
    );
}


// ================================================================
// XP TOTALS
// ================================================================

function getBaseAvailableXP() {
    return (
        GAME_DATA.characterCreation.startingXP +
        getWeaknessBonusXP()
    );
}


function getObligationBonusXP() {
    return character.obligation.xpBonus;
}


function getTotalAvailableXP() {
    return (
        getBaseAvailableXP() +
        getObligationBonusXP()
    );
}


function getXPSpent() {
    return (
        getCharacteristicXPSpent() +
        getSkillXPSpent() +
        getTalentXPSpent()
    );
}


function getXPRemaining() {
    return getTotalAvailableXP() - getXPSpent();
}


// ================================================================
// OBLIGATION XP RESTRICTION
// ================================================================

function getNonCharacteristicXPAvailable() {
    /*
     * Obligation XP cannot purchase characteristics.
     *
     * This tells us how much XP remains available for skills
     * and talents after characteristic purchases.
     */

    return (
        getTotalAvailableXP() -
        getCharacteristicXPSpent()
    );
}


// ================================================================
// THRESHOLDS
// ================================================================

function getThresholdProfile() {
    if (!character.thresholdProfile) {
        return null;
    }

    return getThresholdProfileById(
        character.thresholdProfile
    );
}


function getWoundThreshold() {
    const profile = getThresholdProfile();

    if (!profile) {
        return null;
    }

    return (
        profile.woundBase +
        character.characteristics[
            profile.woundCharacteristic
        ]
    );
}


function getStrainThreshold() {
    const profile = getThresholdProfile();

    if (!profile) {
        return null;
    }

    return (
        profile.strainBase +
        character.characteristics[
            profile.strainCharacteristic
        ]
    );
}


function getBaseSoak() {
    return character.characteristics.brawn;
}


// ================================================================
// BACKGROUND VALIDATION
// ================================================================

function getValidBackgroundSkills() {
    const careerSkills = getCurrentCareerSkillIds();

    return GAME_DATA.skills.filter(
        skill => !careerSkills.includes(skill.id)
    );
}


function isValidBackgroundSkill(skillId) {
    return (
        getValidBackgroundSkills()
            .some(skill => skill.id === skillId)
    );
}


function isBackgroundValid() {
    const skills = character.background.skills;

    if (skills.length !== 2) {
        return false;
    }

    if (skills[0] === skills[1]) {
        return false;
    }

    return skills.every(
        skillId => isValidBackgroundSkill(skillId)
    );
}


// ================================================================
// STARTING CAREER SKILL VALIDATION
// ================================================================

function isValidFreeCareerSkill(skillId) {
    return isCareerSkill(skillId);
}


function areFreeCareerSkillsValid() {
    const skills = character.freeCareerSkills;

    if (
        skills.length !==
        GAME_DATA.characterCreation.startingCareerSkillRanks
    ) {
        return false;
    }

    const uniqueSkills = new Set(skills);

    if (uniqueSkills.size !== skills.length) {
        return false;
    }

    return skills.every(
        skillId => isValidFreeCareerSkill(skillId)
    );
}


// ================================================================
// OBLIGATION
// ================================================================

function getTotalObligation() {
    return (
        character.obligation.base +
        character.obligation.additional
    );
}


// ================================================================
// WEALTH
// ================================================================

function getStartingWealth() {
    return (
        GAME_DATA.characterCreation.startingWealth +
        character.obligation.wealthBonus
    );
}


// ================================================================
// GENERAL VALIDATION
// ================================================================

function validateCharacter() {
    const errors = [];

    if (!character.thresholdProfile) {
        errors.push("Choose a threshold profile.");
    }

    if (!character.career) {
        errors.push("Choose a Career.");
    }

    if (!character.specialization) {
        errors.push("Choose a Specialization.");
    }

    if (
        character.career &&
        character.specialization &&
        !areFreeCareerSkillsValid()
    ) {
        errors.push(
            "Choose exactly four valid starting Career skills."
        );
    }

    if (
        character.career &&
        character.specialization &&
        !isBackgroundValid()
    ) {
        errors.push(
            "Choose two different non-career Background skills."
        );
    }

    if (getXPRemaining() < 0) {
        errors.push("Character has spent too much XP.");
    }

    return errors;
}
