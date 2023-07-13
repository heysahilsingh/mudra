import { appendHTML, createHTML } from '../../helper.js';

export function pageSettings() {
    const pageSettings = createHTML("div", { class: "page page-settings" });

    // Page Header
    const header = createHTML("div", { class: "header" }, "Settings");

    // Page Body
    const body = () => {
        const body = createHTML("div", { class: "body" });

        // Section - User profile
        const sectionUserProfile = () => {
            const sectionUserProfile = createHTML("section", { class: "section-user-profile" }, "User Profile");
            const sectionHeading = createHTML("p", {class: "section-heading"}, "User Profile");
            const sectionContainer = createHTML("div", {class: "section-container"});

            // Main Appendings
            appendHTML([sectionHeading, sectionContainer], sectionUserProfile)
            return sectionUserProfile
        }

        // Section - Appearance
        const sectionAppearance = () => {
            const sectionAppearance = createHTML("section", { class: "section-appearance" });
            const sectionHeading = createHTML("p", {class: "section-heading"}, "Appearance");
            const sectionContainer = createHTML("div", {class: "section-container"});

            // Dark Mode
            const darkMode = createHTML("div", {class: "setting dark-mode"});
            const darkModeIcon = createHTML("i", {class: "setting-icon ph-fill ph-moon-stars"});
            const darkModeName = createHTML("p", {class: "setting-name dark-mode-name"}, "Dark mode");
            const darkModeCheck = createHTML("input", { class: "setting-controller dark-mode-check", type: "checkbox" });

            darkModeCheck.addEventListener("change", () => console.log("sa"))

            appendHTML([darkModeIcon, darkModeName, darkModeCheck], darkMode)


            // Theme Color
            const themeColor = createHTML("div", {class: "setting theme-color"});
            const themeColorIcon = createHTML("i", {class: "setting-icon ph-fill ph-paint-roller"});
            const themeColorName = createHTML("p", {class: "setting-name theme-color-name"}, "Theme color");
            const themeColorBox = createHTML("span", {class: "setting-controller theme-color-box"});

            themeColorBox.addEventListener("change", () => console.log("sa"))

            appendHTML([themeColorIcon, themeColorName, themeColorBox], themeColor)

            // Main Appendings
            appendHTML([darkMode, themeColor], sectionContainer);
            appendHTML([sectionHeading, sectionContainer], sectionAppearance)
            return sectionAppearance
        }

        // Section - Preferences
        const sectionPreferences = () => {
            const sectionPreferences = createHTML("section", { class: "section-preferences" });
            const sectionHeading = createHTML("p", {class: "section-heading"}, "Preferences");
            const sectionContainer = createHTML("div", {class: "section-container"});

            // Main Appending
            appendHTML([sectionHeading, sectionContainer], sectionPreferences)
            return sectionPreferences
        }

        // Section - Others
        const sectionOthers = () => {
            const sectionOthers = createHTML("section", { class: "section-others" });
            const sectionHeading = createHTML("p", {class: "section-heading"}, "Others");
            const sectionContainer = createHTML("div", {class: "section-container"});

            // Main Appendings
            appendHTML([sectionHeading, sectionContainer], sectionOthers)
            return sectionOthers
        }

        appendHTML([sectionUserProfile(), sectionAppearance(), sectionPreferences(), sectionOthers()], body)
        return body;
    };

    // Append
    appendHTML([header, body()], pageSettings);
    return pageSettings
}