/*
 * ASOIAF Genesys Character Builder
 * app.js
 *
 * UI rendering and user interaction.
 */

"use strict";

let currentStep = "characteristics";

document.addEventListener("DOMContentLoaded", () => {
    initializeNavigation();
    initializeNameField();
    renderCurrentStep();
    updateSummary();
});


// ================================================================
// INITIALIZATION
// ================================================================

function initializeNavigation() {
    const buttons = document.querySelectorAll(
        "#creation-nav button"
    );

    buttons.forEach(button => {
        button.addEventListener("click", () => {
            currentStep = button.dataset.step;
            renderCurrentStep();
            updateNavigation();
        });
    });

    updateNavigation();
}


function initializeNameField() {
    const nameInput = document.getElementById("name");

    nameInput.addEventListener("input", event => {
        character.name = event.target.value;
    });
}


// ================================================================
// NAVIGATION
// ================================================================

function updateNavigation() {
    const buttons = document.querySelectorAll(
        "#creation-nav button"
    );

    buttons.forEach(button => {
        button.classList.toggle(
            "active",
            button.dataset.step === currentStep
        );
    });
}


function renderCurrentStep() {
    switch (currentStep) {

        case "characteristics":
            renderCharacteristics();
            break;

        case "career":
            renderCareer();
            break;

        case "background":
            renderBackground();
            break;

        case "skills":
            renderSkills();
            break;

        case "talents":
            renderTalents();
            break;

        case "obligation":
            renderPlaceholder("Obligation");
            break;

        case "equipment":
            renderPlaceholder("Equipment");
            break;

        default:
            renderCharacteristics();
    }
}


function renderPlaceholder(title) {
    const content = document.getElementById(
        "builder-content"
    );

    content.innerHTML = `
        <h2>${title}</h2>
        <p>This section has not yet been implemented.</p>
    `;
}


// ================================================================
// CHARACTERISTICS
// ================================================================

function renderCharacteristics() {
    const content = document.getElementById(
        "builder-content"
    );

    const characteristicRows =
        GAME_DATA.characteristics.map(stat => {

            const value =
                character.characteristics[stat.id];

            const decreaseDisabled =
                canDecreaseCharacteristic(stat.id)
                    ? ""
                    : "disabled";

            const increaseDisabled =
                canIncreaseCharacteristic(stat.id)
                    ? ""
                    : "disabled";

            return `
                <div class="characteristic-row">

                    <span class="characteristic-name">
                        ${stat.name}
                    </span>

                    <button
                        type="button"
                        class="characteristic-decrease"
                        data-characteristic="${stat.id}"
                        ${decreaseDisabled}
                    >
                        −
                    </button>

                    <span class="characteristic-value">
                        ${value}
                    </span>

                    <button
                        type="button"
                        class="characteristic-increase"
                        data-characteristic="${stat.id}"
                        ${increaseDisabled}
                    >
                        +
                    </button>

                </div>
            `;
        }).join("");

    const profileOptions =
        GAME_DATA.thresholdProfiles.map(profile => {

            const checked =
                character.thresholdProfile === profile.id
                    ? "checked"
                    : "";

            return `
                <label class="threshold-option">

                    <input
                        type="radio"
                        name="threshold-profile"
                        value="${profile.id}"
                        ${checked}
                    >

                    <strong>
                        ${profile.name}
                    </strong>

                    <span>
                        WT ${profile.woundBase} + Brawn,
                        ST ${profile.strainBase} + Willpower
                    </span>

                </label>
            `;
        }).join("");

    const weaknessCharacteristic =
        getWeaknessCharacteristic();

    let weaknessDisplay = "";

    if (weaknessCharacteristic) {
        weaknessDisplay = `
            <p class="characteristic-weakness-active">
                Weakness:
                <strong>
                    ${getCharacteristicName(
                        weaknessCharacteristic
                    )}
                </strong>
                (+20 XP)
            </p>
        `;
    }

    content.innerHTML = `
        <h2>Characteristics</h2>

        <p>
            All characteristics begin at 2.
            Spend starting XP to increase them.
        </p>

        <p class="characteristic-weakness-note">
            You may reduce one characteristic from 2 to 1
            to gain +20 starting XP.
        </p>

        ${weaknessDisplay}

        <div class="characteristics-list">
            ${characteristicRows}
        </div>

        <div class="xp-display">
            Characteristic XP Spent:
            <strong>
                ${getCharacteristicXPSpent()}
            </strong>
        </div>

        <div class="xp-display">
            XP Remaining:
            <strong>
                ${getXPRemaining()}
            </strong>
        </div>

        <h3>Threshold Profile</h3>

        <div class="threshold-profiles">
            ${profileOptions}
        </div>
    `;

    bindCharacteristicControls();
}


// ================================================================
// CHARACTERISTIC EVENTS
// ================================================================

function bindCharacteristicControls() {

    document.querySelectorAll(
        ".characteristic-increase"
    ).forEach(button => {

        button.addEventListener("click", () => {
            const id = button.dataset.characteristic;
            increaseCharacteristic(id);
        });
    });


    document.querySelectorAll(
        ".characteristic-decrease"
    ).forEach(button => {

        button.addEventListener("click", () => {
            const id = button.dataset.characteristic;
            decreaseCharacteristic(id);
        });
    });


    document.querySelectorAll(
        'input[name="threshold-profile"]'
    ).forEach(input => {

        input.addEventListener("change", () => {
            character.thresholdProfile = input.value;
            updateSummary();
        });
    });
}


function increaseCharacteristic(id) {

    if (!canIncreaseCharacteristic(id)) {
        return;
    }

    character.characteristics[id]++;

    renderCharacteristics();
    updateSummary();
}


function decreaseCharacteristic(id) {

    if (!canDecreaseCharacteristic(id)) {
        return;
    }

    character.characteristics[id]--;

    renderCharacteristics();
    updateSummary();
}


// ================================================================
// CAREER
// ================================================================

function renderCareer() {
    const content = document.getElementById(
        "builder-content"
    );

    const careerOptions =
        GAME_DATA.careers.map(career => `
            <option
                value="${career.id}"
                ${
                    character.career === career.id
                        ? "selected"
                        : ""
                }
            >
                ${career.name}
            </option>
        `).join("");

    content.innerHTML = `
        <h2>Career & Specialization</h2>

        <label for="career-select">
            Career
        </label>

        <select id="career-select">
            <option value="">
                Choose Career
            </option>

            ${careerOptions}
        </select>

        <div id="specialization-container"></div>

        <div id="career-skills-display"></div>
    `;

    const careerSelect =
        document.getElementById(
            "career-select"
        );

    careerSelect.addEventListener(
        "change",
        () => {

            const oldCareer =
                character.career;

            character.career =
                careerSelect.value || null;

            /*
             * Changing Career invalidates the existing
             * Specialization and all choices that depend
             * on the Career/Specialization package.
             */
            if (character.career !== oldCareer) {
                character.specialization = null;
                character.freeCareerSkills = [];
                character.background.skills = [];
            }

            renderCareer();
            updateSummary();
        }
    );

    renderSpecializations();
    renderCareerSkills();
}


function renderSpecializations() {
    const container =
        document.getElementById(
            "specialization-container"
        );

    if (!character.career) {
        container.innerHTML = "";
        return;
    }

    const career =
        getCareerById(character.career);

    const options =
        career.specializations.map(spec => `
            <option
                value="${spec.id}"
                ${
                    character.specialization === spec.id
                        ? "selected"
                        : ""
                }
            >
                ${spec.name}
            </option>
        `).join("");

    container.innerHTML = `
        <label for="specialization-select">
            Specialization
        </label>

        <select id="specialization-select">
            <option value="">
                Choose Specialization
            </option>

            ${options}
        </select>
    `;

    const specializationSelect =
        document.getElementById(
            "specialization-select"
        );

    specializationSelect.addEventListener(
        "change",
        event => {

            const oldSpecialization =
                character.specialization;

            character.specialization =
                event.target.value || null;

            /*
             * A new Specialization changes the eight
             * starting Career skills, so dependent
             * selections must be reset.
             */
            if (
                character.specialization !==
                oldSpecialization
            ) {
                character.freeCareerSkills = [];
                character.background.skills = [];
            }

            renderCareer();
            updateSummary();
        }
    );
}


function renderCareerSkills() {
    const container =
        document.getElementById(
            "career-skills-display"
        );

    if (
        !character.career ||
        !character.specialization
    ) {
        container.innerHTML = "";
        return;
    }

    const skillIds =
        getCurrentCareerSkillIds();

    const skillNames =
        skillIds.map(id => {

            const skill =
                getSkillById(id);

            return `
                <li>
                    ${skill.name}
                    <span>
                        (${getCharacteristicName(
                            skill.characteristic
                        )})
                    </span>
                </li>
            `;
        }).join("");

    container.innerHTML = `
        <h3>Career Skills</h3>

        <p>
            Your Career and Specialization provide
            these eight Career skills.
        </p>

        <ul class="career-skill-list">
            ${skillNames}
        </ul>
    `;
}


// ================================================================
// BACKGROUND
// ================================================================

function renderBackground() {
    const content = document.getElementById(
        "builder-content"
    );

    if (
        !character.career ||
        !character.specialization
    ) {
        content.innerHTML = `
            <h2>Background</h2>

            <p>
                Choose a Career and Specialization
                before selecting Background skills.
            </p>
        `;

        return;
    }

    const career =
        getCareerById(
            character.career
        );

    const specialization =
        getSpecializationById(
            character.career,
            character.specialization
        );

    const careerSkills =
        getCurrentCareerSkillIds()
            .map(id => getSkillById(id));

    const validSkills =
        getValidBackgroundSkills();

    const careerSkillList =
        careerSkills.map(skill => `
            <li>
                ${skill.name}
                <span>
                    (${getCharacteristicName(
                        skill.characteristic
                    )})
                </span>
            </li>
        `).join("");

    const categories = [
        "General",
        "Combat",
        "Social",
        "Knowledge"
    ];

    const skillGroups =
        categories.map(category => {

            const skills =
                validSkills.filter(
                    skill =>
                        skill.category === category
                );

            if (skills.length === 0) {
                return "";
            }

            const choices =
                skills.map(skill => {

                    const checked =
                        character.background.skills
                            .includes(skill.id)
                            ? "checked"
                            : "";

                    /*
                     * Once two Background skills have
                     * been chosen, unselected choices
                     * are disabled until one of the
                     * existing selections is removed.
                     */
                    const disabled =
                        character.background.skills
                            .length >= 2 &&
                        !character.background.skills
                            .includes(skill.id)
                            ? "disabled"
                            : "";

                    return `
                        <label class="background-skill">

                            <input
                                type="checkbox"
                                class="background-skill-checkbox"
                                value="${skill.id}"
                                ${checked}
                                ${disabled}
                            >

                            <span>
                                ${skill.name}
                            </span>

                            <small>
                                ${getCharacteristicName(
                                    skill.characteristic
                                )}
                            </small>

                        </label>
                    `;
                }).join("");

            return `
                <div class="background-skill-group">

                    <h3>
                        ${category}
                    </h3>

                    ${choices}

                </div>
            `;
        }).join("");

    content.innerHTML = `
        <h2>Background</h2>

        <p>
            Describe your character's life before
            the beginning of the game.
        </p>

        <label for="background-name">
            Background
        </label>

        <input
            type="text"
            id="background-name"
            value="${escapeHTML(
                character.background.name
            )}"
            placeholder="e.g. Hunter, Scribe, Sailor"
        >

        <h3>Your Career Skills</h3>

        <p>
            ${career.name} — ${specialization.name}
        </p>

        <ul class="career-skill-list">
            ${careerSkillList}
        </ul>

        <h3>Background Skills</h3>

        <p>
            Choose two skills outside your Career
            to begin at Rank 1.
        </p>

        <p>
            Selected:
            <strong>
                ${character.background.skills.length} / 2
            </strong>
        </p>

        <div class="background-skill-list">
            ${skillGroups}
        </div>
    `;

    bindBackgroundControls();
}


// ================================================================
// BACKGROUND EVENTS
// ================================================================

function bindBackgroundControls() {

    const backgroundName =
        document.getElementById(
            "background-name"
        );

    backgroundName.addEventListener(
        "input",
        event => {

            character.background.name =
                event.target.value;

            updateSummary();
        }
    );


    document.querySelectorAll(
        ".background-skill-checkbox"
    ).forEach(checkbox => {

        checkbox.addEventListener(
            "change",
            () => {

                const skillId =
                    checkbox.value;

                if (checkbox.checked) {

                    if (
                        character.background.skills
                            .length >= 2
                    ) {
                        checkbox.checked = false;
                        return;
                    }

                    if (
                        !isValidBackgroundSkill(
                            skillId
                        )
                    ) {
                        checkbox.checked = false;
                        return;
                    }

                    character.background.skills.push(
                        skillId
                    );

                } else {

                    character.background.skills =
                        character.background.skills
                            .filter(
                                id => id !== skillId
                            );
                }

                renderBackground();
                updateSummary();
            }
        );
    });
}

// ================================================================
// SKILLS
// ================================================================

function renderSkills() {
    const content = document.getElementById(
        "builder-content"
    );

    if (
        !character.career ||
        !character.specialization
    ) {
        content.innerHTML = `
            <h2>Skills</h2>

            <p>
                Choose a Career and Specialization
                before selecting skill ranks.
            </p>
        `;

        return;
    }

    const careerSkills =
        getCurrentCareerSkillIds().map(
            id => getSkillById(id)
        );

    const freeCareerChoices =
        careerSkills.map(skill => {

            const checked =
                character.freeCareerSkills
                    .includes(skill.id)
                    ? "checked"
                    : "";

            const disabled =
                character.freeCareerSkills.length >=
                    GAME_DATA.characterCreation
                        .startingCareerSkillRanks &&
                !character.freeCareerSkills
                    .includes(skill.id)
                    ? "disabled"
                    : "";

            return `
                <label class="free-career-skill">

                    <input
                        type="checkbox"
                        class="free-career-skill-checkbox"
                        value="${skill.id}"
                        ${checked}
                        ${disabled}
                    >

                    <span>
                        ${skill.name}
                    </span>

                    <small>
                        ${getCharacteristicName(
                            skill.characteristic
                        )}
                    </small>

                </label>
            `;
        }).join("");

    const categories = [
        "General",
        "Combat",
        "Social",
        "Knowledge"
    ];

    const skillGroups =
        categories.map(category => {

            const skills =
                GAME_DATA.skills.filter(
                    skill =>
                        skill.category === category
                );

            const rows =
                skills.map(skill =>
                    renderSkillRow(skill)
                ).join("");

            return `
                <div class="skill-group">

                    <h3>${category}</h3>

                    <div class="skill-table">
                        ${rows}
                    </div>

                </div>
            `;
        }).join("");

    content.innerHTML = `
        <h2>Skills</h2>

        <h3>Starting Career Skills</h3>

        <p>
            Choose four of your eight Career skills
            to begin at Rank 1.
        </p>

        <p>
            Selected:
            <strong>
                ${character.freeCareerSkills.length}
                /
                ${GAME_DATA.characterCreation
                    .startingCareerSkillRanks}
            </strong>
        </p>

        <div class="free-career-skill-list">
            ${freeCareerChoices}
        </div>

        <h3>Purchase Skill Ranks</h3>

        <p>
            Career skills cost 5 XP × the new rank.
            Non-Career skills cost 5 additional XP
            per rank.
        </p>

        <p>
            Skill XP Spent:
            <strong>
                ${getSkillXPSpent()}
            </strong>
        </p>

        <p>
            XP Remaining:
            <strong>
                ${getXPRemaining()}
            </strong>
        </p>

        <div class="skill-groups">
            ${skillGroups}
        </div>
    `;

    bindSkillControls();
}


function renderSkillRow(skill) {
    const rank =
        getTotalSkillRank(skill.id);

    const career =
        isCareerSkill(skill.id);

    const freeCareer =
        character.freeCareerSkills
            .includes(skill.id);

    const background =
        character.background.skills
            .includes(skill.id);

    const tags = [];

    if (career) {
        tags.push("Career");
    } else {
        tags.push("Non-Career");
    }

    if (freeCareer) {
        tags.push("Free Rank");
    }

    if (background) {
        tags.push("Background");
    }

    const decreaseDisabled =
        canDecreaseSkillRank(skill.id)
            ? ""
            : "disabled";

    const increaseDisabled =
        canIncreaseSkillRank(skill.id)
            ? ""
            : "disabled";

    return `
        <div class="skill-row">

            <div class="skill-info">

                <strong>
                    ${skill.name}
                </strong>

                <small>
                    ${getCharacteristicName(
                        skill.characteristic
                    )}
                    ·
                    ${tags.join(" · ")}
                </small>

            </div>

            <button
                type="button"
                class="skill-decrease"
                data-skill="${skill.id}"
                ${decreaseDisabled}
            >
                −
            </button>

            <span class="skill-rank">
                ${rank}
            </span>

            <button
                type="button"
                class="skill-increase"
                data-skill="${skill.id}"
                ${increaseDisabled}
            >
                +
            </button>

        </div>
    `;
}


// ================================================================
// SKILL EVENTS
// ================================================================

function bindSkillControls() {

    document.querySelectorAll(
        ".free-career-skill-checkbox"
    ).forEach(checkbox => {

        checkbox.addEventListener(
            "change",
            () => {

                const skillId =
                    checkbox.value;

                if (checkbox.checked) {

                    if (
                        character.freeCareerSkills.length >=
                        GAME_DATA.characterCreation
                            .startingCareerSkillRanks
                    ) {
                        checkbox.checked = false;
                        return;
                    }

                    if (!isCareerSkill(skillId)) {
                        checkbox.checked = false;
                        return;
                    }

                    character.freeCareerSkills.push(
                        skillId
                    );

                } else {

                    character.freeCareerSkills =
                        character.freeCareerSkills
                            .filter(
                                id => id !== skillId
                            );
                }

                renderSkills();
                updateSummary();
            }
        );
    });


    document.querySelectorAll(
        ".skill-increase"
    ).forEach(button => {

        button.addEventListener(
            "click",
            () => {

                increaseSkillRank(
                    button.dataset.skill
                );
            }
        );
    });


    document.querySelectorAll(
        ".skill-decrease"
    ).forEach(button => {

        button.addEventListener(
            "click",
            () => {

                decreaseSkillRank(
                    button.dataset.skill
                );
            }
        );
    });
}


// ================================================================
// SKILL RANK CHANGES
// ================================================================

function getNextSkillRankCost(skillId) {
    const newRank =
        getTotalSkillRank(skillId) + 1;

    let cost = newRank * 5;

    if (!isCareerSkill(skillId)) {
        cost += 5;
    }

    return cost;
}


function canIncreaseSkillRank(skillId) {
    const currentRank =
        getTotalSkillRank(skillId);

    /*
     * During character creation, no skill may
     * be raised above Rank 2.
     */
    if (currentRank >= 2) {
        return false;
    }

    return (
        getNextSkillRankCost(skillId) <=
        getXPRemaining()
    );
}


function canDecreaseSkillRank(skillId) {
    const storedRank =
        getSkillRank(skillId);

    const freeRank =
        character.freeCareerSkills
            .includes(skillId) ||
        character.background.skills
            .includes(skillId);

    /*
     * A stored purchased rank can always be undone.
     */
    if (storedRank > 1) {
        return true;
    }

    /*
     * Rank 1 is removable only if it was actually
     * purchased rather than granted for free.
     */
    if (storedRank === 1 && !freeRank) {
        return true;
    }

    return false;
}


function increaseSkillRank(skillId) {

    if (!canIncreaseSkillRank(skillId)) {
        return;
    }

    const newRank =
        getTotalSkillRank(skillId) + 1;

    character.skillRanks[skillId] =
        newRank;

    renderSkills();
    updateSummary();
}


function decreaseSkillRank(skillId) {

    if (!canDecreaseSkillRank(skillId)) {
        return;
    }

    const storedRank =
        getSkillRank(skillId);

    const freeRank =
        character.freeCareerSkills
            .includes(skillId) ||
        character.background.skills
            .includes(skillId);

    if (storedRank > 1) {

        const newRank =
            storedRank - 1;

        /*
         * If reducing to Rank 1 and Rank 1 is free,
         * no stored rank is necessary.
         */
        if (newRank === 1 && freeRank) {
            delete character.skillRanks[skillId];
        } else {
            character.skillRanks[skillId] =
                newRank;
        }

    } else {

        delete character.skillRanks[skillId];
    }

    renderSkills();
    updateSummary();
}


// ============================================================
// TALENTS
// ============================================================

function renderTalents() {
    const content =
        document.getElementById(
            "builder-content"
        );

    content.innerHTML = "";

    const section =
        document.createElement("section");

    section.className = "talents-section";


    // --------------------------------------------------------
    // Heading
    // --------------------------------------------------------

    const heading =
        document.createElement("h2");

    heading.textContent = "Talents";

    section.appendChild(heading);


    const instructions =
        document.createElement("p");

    instructions.textContent =
        "Purchase talents using the Genesys talent pyramid. " +
        "Each occupied tier must contain fewer talents than " +
        "the tier below it. Ranked talents increase in tier " +
        "with each additional rank.";

    section.appendChild(instructions);


    // --------------------------------------------------------
    // Pyramid summary
    // --------------------------------------------------------

    const pyramid =
        document.createElement("div");

    pyramid.className = "talent-pyramid-summary";

    for (let tier = 1; tier <= 5; tier++) {

        const count =
            getTalentCountByTier(tier);

        const tierSummary =
            document.createElement("div");

        tierSummary.className =
            "talent-pyramid-tier";

        tierSummary.textContent =
            `Tier ${tier}: ${count}`;

        pyramid.appendChild(tierSummary);
    }

    section.appendChild(pyramid);


    // --------------------------------------------------------
    // Talent tiers
    // --------------------------------------------------------

    for (let tier = 1; tier <= 5; tier++) {

        section.appendChild(
            renderTalentTier(tier)
        );
    }


    content.appendChild(section);
}


function renderTalentTier(tier) {
    const tierSection =
        document.createElement("section");

    tierSection.className =
        "talent-tier";


    const heading =
        document.createElement("h3");

    const occupied =
        getTalentCountByTier(tier);

    heading.textContent =
        `Tier ${tier} — ${occupied} Purchased`;

    tierSection.appendChild(heading);


    /*
     * A talent belongs in this display tier if:
     *
     * 1. Its next purchase would occupy this tier, OR
     * 2. It already has a purchased rank occupying this tier.
     *
     * This matters for ranked talents. Grit, for example,
     * begins at Tier 1 but Grit II occupies Tier 2.
     */
    const relevantTalents =
        GAME_DATA.talents.filter(
            talent =>
                talentHasRankAtTier(
                    talent.id,
                    tier
                ) ||
                getNextTalentTier(
                    talent.id
                ) === tier
        );


    if (relevantTalents.length === 0) {

        const empty =
            document.createElement("p");

        empty.textContent =
            "No talents available at this tier.";

        tierSection.appendChild(empty);

        return tierSection;
    }


    const list =
        document.createElement("div");

    list.className =
        "talent-list";


    for (const talent of relevantTalents) {

        list.appendChild(
            renderTalentCard(
                talent,
                tier
            )
        );
    }


    tierSection.appendChild(list);

    return tierSection;
}


function talentHasRankAtTier(
    talentId,
    tier
) {
    const ranks =
        getTalentRank(talentId);

    for (
        let rank = 1;
        rank <= ranks;
        rank++
    ) {
        if (
            getTalentEffectiveTier(
                talentId,
                rank
            ) === tier
        ) {
            return true;
        }
    }

    return false;
}


function getTalentRankAtTier(
    talentId,
    tier
) {
    const ranks =
        getTalentRank(talentId);

    for (
        let rank = 1;
        rank <= ranks;
        rank++
    ) {
        if (
            getTalentEffectiveTier(
                talentId,
                rank
            ) === tier
        ) {
            return rank;
        }
    }

    return null;
}


function renderTalentCard(
    talent,
    displayTier
) {
    const card =
        document.createElement("div");

    card.className =
        "talent-card";


    // --------------------------------------------------------
    // Name
    // --------------------------------------------------------

    const title =
        document.createElement("h4");

    title.textContent =
        talent.name;

    card.appendChild(title);


    // --------------------------------------------------------
    // Metadata
    // --------------------------------------------------------

    const metadata =
        document.createElement("div");

    metadata.className =
        "talent-metadata";


    const purchasedRank =
        getTalentRankAtTier(
            talent.id,
            displayTier
        );


    if (purchasedRank !== null) {

        const purchased =
            document.createElement("span");

        if (talent.ranked) {
            purchased.textContent =
                `Purchased Rank ${purchasedRank}`;
        } else {
            purchased.textContent =
                "Purchased";
        }

        metadata.appendChild(purchased);
    }


    const activation =
        document.createElement("span");

    activation.textContent =
        talent.activation;

    metadata.appendChild(activation);


    if (talent.ranked) {

        const ranked =
            document.createElement("span");

        ranked.textContent =
            "Ranked";

        metadata.appendChild(ranked);
    }


    card.appendChild(metadata);


    // --------------------------------------------------------
    // Description
    // --------------------------------------------------------

    const description =
        document.createElement("p");

    description.className =
        "talent-description";

    description.textContent =
        talent.description;

    card.appendChild(description);


    // --------------------------------------------------------
    // Prerequisites
    // --------------------------------------------------------

    if (
        talent.prerequisites.length > 0
    ) {
        const prerequisites =
            document.createElement("p");

        prerequisites.className =
            "talent-prerequisites";

        const names =
            talent.prerequisites.map(
                prerequisiteId => {

                    const prerequisite =
                        getTalentById(
                            prerequisiteId
                        );

                    return prerequisite
                        ? prerequisite.name
                        : prerequisiteId;
                }
            );

        prerequisites.textContent =
            `Prerequisite: ${names.join(", ")}`;

        card.appendChild(prerequisites);
    }


    // --------------------------------------------------------
    // Controls
    // --------------------------------------------------------

    const controls =
        document.createElement("div");

    controls.className =
        "talent-controls";


    /*
     * The minus button is shown on the tier containing the
     * talent's CURRENT HIGHEST RANK.
     *
     * Example:
     *
     * Grit I  -> Tier 1
     * Grit II -> Tier 2
     *
     * Once Grit II exists, its refund control belongs with
     * the Tier 2 instance rather than Grit I.
     */
    const currentRank =
        getTalentRank(talent.id);

    const currentHighestTier =
        currentRank > 0
            ? getTalentEffectiveTier(
                talent.id,
                currentRank
            )
            : null;


    if (
        currentRank > 0 &&
        currentHighestTier === displayTier
    ) {
        const removeButton =
            document.createElement("button");

        removeButton.type =
            "button";

        removeButton.textContent =
            "−";

        removeButton.disabled =
            !canRemoveTalent(
                talent.id
            );

        removeButton.addEventListener(
            "click",
            () => {
                removeTalent(
                    talent.id
                );

                renderTalents();
                updateSummary();
            }
        );

        controls.appendChild(
            removeButton
        );
    }


    // --------------------------------------------------------
    // Purchase control
    // --------------------------------------------------------

    const nextTier =
        getNextTalentTier(
            talent.id
        );

    const canShowPurchase =
        nextTier === displayTier &&
        (
            talent.ranked ||
            !hasTalent(talent.id)
        );


    if (canShowPurchase) {

        const cost =
            getNextTalentCost(
                talent.id
            );


        const purchaseButton =
            document.createElement(
                "button"
            );

        purchaseButton.type =
            "button";

        purchaseButton.textContent =
            `+ ${cost} XP`;

        purchaseButton.disabled =
            !canPurchaseTalent(
                talent.id
            );


        purchaseButton.addEventListener(
            "click",
            () => {
                purchaseTalent(
                    talent.id
                );

                renderTalents();
                updateSummary();
            }
        );


        controls.appendChild(
            purchaseButton
        );
    }


    card.appendChild(controls);

    return card;
}


// ================================================================
// SUMMARY
// ================================================================

function updateSummary() {

    const background =
        document.querySelector(
            "#summary-background span"
        );

    const career =
        document.querySelector(
            "#summary-career span"
        );

    const specialization =
        document.querySelector(
            "#summary-specialization span"
        );

    const xp =
        document.querySelector(
            "#summary-xp span"
        );

    const obligation =
        document.querySelector(
            "#summary-obligation span"
        );

    const wealth =
        document.querySelector(
            "#summary-wealth span"
        );


    background.textContent =
        character.background.name || "—";


    if (character.career) {

        career.textContent =
            getCareerById(
                character.career
            ).name;

    } else {

        career.textContent = "—";
    }


    if (
        character.career &&
        character.specialization
    ) {

        specialization.textContent =
            getSpecializationById(
                character.career,
                character.specialization
            ).name;

    } else {

        specialization.textContent = "—";
    }


    xp.textContent =
        getXPRemaining();


    obligation.textContent =
        getTotalObligation();


    wealth.textContent =
        getStartingWealth()
            .toLocaleString();
}


// ================================================================
// HELPERS
// ================================================================

function getCharacteristicName(id) {
    const characteristic =
        GAME_DATA.characteristics.find(
            item => item.id === id
        );

    return characteristic
        ? characteristic.name
        : id;
}


function escapeHTML(value) {
    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}
