import { dbAppSettings } from '../../db.js';
import { appendHTML, createHTML, styleUpdateAppPrimaryColor, styleUpdateThemeModeColor } from '../../helper.js';

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
            const sectionHeading = createHTML("p", { class: "section-heading" }, "User Profile");
            const sectionContainer = createHTML("div", { class: "section-container" });

            // Main Appendings
            appendHTML([sectionHeading, sectionContainer], sectionUserProfile)
            return sectionUserProfile
        }

        // Section - Appearance
        const sectionAppearance = () => {
            const sectionAppearance = createHTML("section", { class: "section-appearance" });
            const sectionHeading = createHTML("p", { class: "section-heading" }, "Appearance");
            const sectionContainer = createHTML("div", { class: "section-container" });

            // Dark Mode
            const darkMode = () => {
                const setting = createHTML("div", { class: "setting dark-mode" });
                const settingIcon = createHTML("i", { class: "setting-icon ph-fill ph-moon-stars" });
                const settingName = createHTML("p", { class: "setting-name dark-mode-name" }, "Dark mode");
                const settingController = createHTML("input", { class: "setting-controller dark-mode-check", type: "checkbox" });
    
                settingController.addEventListener("change", () => {
                    dbAppSettings.darkMode = !dbAppSettings.darkMode;
                    styleUpdateThemeModeColor()
                })
    
                if (dbAppSettings.darkMode) settingController.click()
    
                appendHTML([settingIcon, settingName, settingController], setting);
                return setting
            }

            // Theme Color
            const themeColor = () => {
                const setting = createHTML("div", { class: "setting theme-color" });
                const settingIcon = createHTML("i", { class: "setting-icon ph-fill ph-paint-roller" });
                const settingName = createHTML("p", { class: "setting-name theme-color-name" }, "Theme color");
                const settingController = createHTML("span", { class: "setting-controller theme-color-box" });
    
                const settingControllerPicker = createHTML("ul", { class: "theme-color-picker" });
    
                const settingControllerPickerOptions = [
                    { color: "#00aff0" },
                    { color: "#a767e5" },
                    { color: "#44ce7b" },
                    { color: "#ff5722" },
                    { color: "#3f51b5" },
                    { color: "#f43636" },
                ];
    
                settingController.addEventListener("click", () => settingControllerPicker.classList.toggle("opened"));
    
                settingControllerPickerOptions.forEach((option) => {
                    const optionElement = createHTML("li", { color: option.color });
                    optionElement.style.backgroundColor = option.color;
    
                    optionElement.addEventListener("click", () => {
                        dbAppSettings.themeColor = optionElement.getAttribute("color");
                        styleUpdateAppPrimaryColor();
                        settingControllerPicker.classList.toggle("opened");
                    });
    
                    settingControllerPicker.appendChild(optionElement);
                });
    
                appendHTML([settingIcon, settingName, settingController, settingControllerPicker], setting);
                return setting
            }

            // Main Appendings
            appendHTML([darkMode(), themeColor()], sectionContainer);
            appendHTML([sectionHeading, sectionContainer], sectionAppearance)
            return sectionAppearance
        }

        // Section - Preferences
        const sectionPreferences = () => {
            const sectionPreferences = createHTML("section", { class: "section-preferences" });
            const sectionHeading = createHTML("p", { class: "section-heading" }, "Preferences");
            const sectionContainer = createHTML("div", { class: "section-container" });

            // Default Wallet
            const defaultWallet = () => {
                const setting = createHTML("div", { class: "setting default-wallet" });
                const settingIcon = createHTML("i", { class: "setting-icon ph-fill ph-wallet" });
                const settingName = createHTML("p", { class: "setting-name default-wallet-name" }, "Default wallet");
                const settingController = createHTML("div", { class: "setting-controller default-wallet-content", type: "checkbox" });

                appendHTML([settingIcon, settingName, settingController], setting);
                return setting
            }


            // Main Appending
            appendHTML([defaultWallet()], sectionContainer)
            appendHTML([sectionHeading, sectionContainer], sectionPreferences)
            return sectionPreferences
        }

        // Section - Others
        const sectionOthers = () => {
            const sectionOthers = createHTML("section", { class: "section-others" });
            const sectionHeading = createHTML("p", { class: "section-heading" }, "Others");
            const sectionContainer = createHTML("div", { class: "section-container" });

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