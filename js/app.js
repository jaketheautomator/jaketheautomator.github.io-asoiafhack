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
            renderPlaceholder("Skills");
            break;

        case "talents":
            renderPlaceholder("Talents");
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

            return `
                <div class="characteristic-row">
                    <span class="characteristic-name">
                        ${stat.name}
                    </span>

                   <button
                        class="characteristic-decrease"
                        data-characteristic="${stat.id}"
                        ${canDecreaseCharacteristic(stat.id) ? "" : "disabled"}
                    >
                        −
                    </button>
                    
                    <span class="characteristic-value">
                        ${value}
                    </span>
                    
                    <button
                        class="characteristic-increase"
                        data-characteristic="${stat.id}"
                        ${canIncreaseCharacteristic(stat.id) ? "" : "disabled"}
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

                    <strong>${profile.name}</strong>

                    <span>
                        WT ${profile.woundBase} + Brawn,
                        ST ${profile.strainBase} + Willpower
                    </span>
                </label>
            `;
        }).join("");

    content.innerHTML = `
        <h2>Characteristics</h2>

        <p>
            All characteristics begin at 2.
            Spend starting XP to increase them.
        </p>

        <div class="characteristics-list">
            ${characteristicRows}
        </div>

        <div class="xp-display">
            Characteristic XP:
            <strong>${getCharacteristicXPSpent()}</strong>
        </div>

        <p class="characteristic-weakness-note">
            You may reduce one characteristic from 2 to 1
            to gain +20 starting XP.
        </p>

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

    character.characteristics[id]++;

    /*
     * Don't permit characteristic purchases that exceed
     * the XP available for characteristics.
     *
     * Obligation XP is intentionally excluded.
     */
    if (
        getCharacteristicXPSpent() >
        getBaseAvailableXP()
    ) {
        character.characteristics[id]--;
        return;
    }

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
        document.getElementById("career-select");

    careerSelect.addEventListener(
        "change",
        () => {

            const oldCareer = character.career;

            character.career =
                careerSelect.value || null;

            /*
             * Changing Career invalidates the existing
             * Specialization.
             */
            if (character.career !== oldCareer) {
                character.specialization = null;
                character.freeCareerSkills = [];

                /*
                 * Background selections depend on the
                 * Career package, so clear them as well.
                 */
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

    document.getElementById(
        "specialization-select"
    ).addEventListener(
        "change",
        event => {

            const oldSpecialization =
                character.specialization;

            character.specialization =
                event.target.value || null;

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
            const skill = getSkillById(id);

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
        getCareerById(character.career);

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

                    return `
                        <label class="background-skill">
                            <input
                                type="checkbox"
                                class="background-skill-checkbox"
                                value="${skill.id}"
                                ${checked}
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
                    <h3>${category}</h3>
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

                const skillId = checkbox.value;

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
