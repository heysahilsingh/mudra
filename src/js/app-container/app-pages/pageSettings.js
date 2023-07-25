import { compConfirmDialogBox } from '../../components.js';
import { dbAppSettings, dbWallets, resetDb, updateDb } from '../../db.js';
import { appendHTML, createHTML, popMsg, updateAppColors } from '../../helper.js';
import { subPageCategoryPicker } from './sub-pages/subPageCategoryPicker.js';
import { subPageWalletPicker } from './sub-pages/subPageWalletPicker.js';

export function pageSettings() {
    const pageSettings = createHTML("div", { class: "page page-settings" });

    // Page Header
    const header = createHTML("div", { class: "header" }, "Settings");

    // Page Body
    const body = () => {
        const body = createHTML("div", { class: "body" });

        // Section - User profile
        const sectionUserProfile = () => {
            const sectionUserProfile = createHTML("section", { class: "section-user-profile" });
            const sectionHeading = createHTML("p", { class: "section-heading" }, "User Profile");
            const sectionContainer = createHTML("div", { class: "section-container" });

            // User name
            const setting = createHTML("div", { class: "setting arrow user-name" });
            const settingIcon = createHTML("i", { class: "setting-icon ph-fill ph-user" });
            const settingName = createHTML("p", { class: "setting-name" }, "User name");
            const settingController = createHTML("div", { class: "setting-controller" }, dbAppSettings.userName);

            const userNameContainer = createHTML("div", { class: "user-name-container" });
            const userNameInput = createHTML("input", { type: "text" });
            userNameInput.value = dbAppSettings.userName;

            settingController.addEventListener("click", () => {
                compConfirmDialogBox({
                    pBoxId: "page-settings",
                    pButton2: "Save",
                    pMessage: userNameContainer
                });

                userNameInput.focus()
            })

            userNameInput.addEventListener("input", () => {
                if (userNameInput.value.trim() === '') {
                    popMsg("Please enter your name.", "error")
                } else {
                    settingController.textContent = userNameInput.value;
                    dbAppSettings.userName = userNameInput.value;

                    // Update db
                    updateDb()
                }
            })

            appendHTML(userNameInput, userNameContainer)
            appendHTML([settingIcon, settingName, settingController], setting)

            // Main Appendings
            appendHTML(setting, sectionContainer)
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
                const settingName = createHTML("p", { class: "setting-name" }, "Dark mode");
                const settingController = createHTML("input", { class: "setting-controller", type: "checkbox" });

                // Realtime dark mode handler
                window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', event => {
                    const newColorScheme = event.matches ? 'dark' : 'light';
                    settingController.checked = newColorScheme === 'dark';
                });

                settingController.addEventListener("change", () => {
                    dbAppSettings.darkMode = !dbAppSettings.darkMode;
                    updateAppColors();

                    // Update db
                    updateDb()
                })

                if (dbAppSettings.darkMode) settingController.click();

                appendHTML([settingIcon, settingName, settingController], setting);
                return setting
            }

            // Theme Color
            const themeColor = () => {
                const setting = createHTML("div", { class: "setting theme-color" });
                const settingIcon = createHTML("i", { class: "setting-icon ph-fill ph-paint-roller" });
                const settingName = createHTML("p", { class: "setting-name" }, "Theme color");
                const settingController = createHTML("span", { class: "setting-controller" });

                const settingControllerPicker = createHTML("ul", { class: "theme-color-picker" });

                const settingControllerPickerOptions = [
                    { color: "#35A1FE" },
                    { color: "#44ce7b" },
                    { color: "#ff5722" },
                    { color: "#3f51b5" },
                    { color: "#5856D6FF" },
                    { color: "#FF9500FF" },
                    { color: "#FF2D55FF" },
                    { color: "#AF52DEFF" },
                    { color: "#353CFE" },
                    { color: "#4d4d4d" },
                    { color: "#2AC2A9" },
                ];

                settingControllerPickerOptions.forEach((option) => {
                    const optionElement = createHTML("li", { color: option.color });
                    optionElement.style.backgroundColor = option.color;

                    optionElement.addEventListener("click", () => {
                        dbAppSettings.themeColor = optionElement.getAttribute("color");
                        updateAppColors();

                        // Update db
                        updateDb()
                    });

                    settingControllerPicker.appendChild(optionElement);
                });

                settingController.addEventListener("click", () => {
                    compConfirmDialogBox({
                        pBoxId: "page-settings",
                        pMessage: settingControllerPicker,
                    })
                })

                appendHTML([settingIcon, settingName, settingController], setting);
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
            const editCategories = () => {
                const wallet = dbWallets.find(wallet => wallet.id === dbAppSettings.defaultWallet);

                const setting = createHTML("div", { class: "setting arrow edit-categories" });
                const settingIcon = createHTML("i", { class: "setting-icon ph-fill ph-grid-four" });
                const settingName = createHTML("p", { class: "setting-name" }, "Edit categories");

                setting.addEventListener("click", () => {
                    subPageCategoryPicker({
                        pMode: "edit"
                    })
                })

                appendHTML([settingIcon, settingName], setting);
                return setting
            }

            // Default Wallet
            const defaultWallet = () => {
                const wallet = dbWallets.find(wallet => wallet.id === dbAppSettings.defaultWallet);

                const setting = createHTML("div", { class: "setting arrow default-wallet" });
                const settingIcon = createHTML("i", { class: "setting-icon ph-fill ph-wallet" });
                const settingName = createHTML("p", { class: "setting-name" }, "Default wallet");
                const settingController = createHTML("div", { id: wallet?.id }, wallet?.name);
                settingController.className = `setting-controller icon ${wallet?.icon}`

                setting.addEventListener("click", () => {
                    subPageWalletPicker({
                        selectedWalletIds: [settingController.getAttribute("id")],
                        callback: (value) => {
                            settingController.textContent = value[0].name;
                            settingController.className = `setting-controller icon ${value[0].icon}`;
                            settingController.setAttribute("id", value[0].id);
                            dbAppSettings.defaultWallet = value[0].id;

                            // Update db
                            updateDb()
                        }
                    })
                })

                appendHTML([settingIcon, settingName, settingController], setting);
                return setting
            }

            // Currency
            const currency = () => {
                const setting = createHTML("div", { class: "setting arrow currency" });
                const settingIcon = createHTML("i", { Class: "setting-icon ph-fill ph-coins" });
                const settingName = createHTML("p", { class: "setting-name" }, "Currency");
                const settingController = createHTML("div", { class: "setting-controller" }, `"${dbAppSettings.userCurrency}"`);

                appendHTML([settingIcon, settingName, settingController], setting)
                return setting
            }


            // Main Appending
            appendHTML([editCategories(), defaultWallet(), currency()], sectionContainer)
            appendHTML([sectionHeading, sectionContainer], sectionPreferences)
            return sectionPreferences
        }

        // Section - Others
        const sectionOthers = () => {
            const sectionOthers = createHTML("section", { class: "section-others" });
            const sectionHeading = createHTML("p", { class: "section-heading" }, "Others");
            const sectionContainer = createHTML("div", { class: "section-container" });

            // Download Data
            const shareApp = () => {
                const setting = createHTML("div", { class: "setting arrow reset-app" });
                const settingIcon = createHTML("i", { class: "setting-icon ph-fill ph-share-fat" });
                const settingName = createHTML("p", { class: "setting-name" }, "Share this app");

                setting.addEventListener("click", () => {
                    if (navigator.share) {
                        navigator.share({
                            title: document.title,
                            text: document.querySelector('meta[name="description"]').getAttribute('content'),
                            url: window.location.href
                        })
                    } else {
                        alert('Your browser does not supporting share web content directly.\n\nPlease copy the link and share it.');
                    }
                })

                appendHTML([settingIcon, settingName], setting);
                return setting
            }

            // Download Data
            const downloadData = () => {
                const setting = createHTML("div", { class: "setting arrow reset-app" });
                const settingIcon = createHTML("i", { class: "setting-icon ph-fill ph-cloud-arrow-down" });
                const settingName = createHTML("p", { class: "setting-name" }, "Download my data");

                appendHTML([settingIcon, settingName], setting);
                return setting
            }

            // Download Data
            const deleteData = () => {
                const setting = createHTML("div", { class: "setting arrow reset-app" });
                const settingIcon = createHTML("i", { class: "setting-icon ph-fill ph-trash" });
                const settingName = createHTML("p", { class: "setting-name" }, "Delete my data");

                setting.addEventListener("click", () => {
                    compConfirmDialogBox({
                        pMessage: "Download data before deletion. Proceeding erases all app data permanently. Confirm deletion?",
                        pButton1: "No",
                        pButton2: "Yes",
                        pCallback: () => {
                            resetDb();
                            popMsg("Please wait...", "warning").then(() => {
                                location.reload()
                            })
                        }
                    })
                })

                appendHTML([settingIcon, settingName], setting);
                return setting
            }

            // Reset App
            const resetApp = () => {
                const setting = createHTML("div", { class: "setting arrow reset-app" });
                const settingIcon = createHTML("i", { class: "setting-icon ph-bold ph-arrows-clockwise" });
                const settingName = createHTML("p", { class: "setting-name" }, "Reset app");

                setting.addEventListener("click", () => {
                    compConfirmDialogBox({
                        pMessage: "All the data of this app will be lost and won't be recovered. Are you sure you want to reset the app?",
                        pButton1: "No",
                        pButton2: "Yes",
                        pCallback: () => {
                            resetDb();
                            popMsg("Resetting app, please wait...", "warning").then(() => {
                                location.reload()
                            })
                        }
                    })
                })

                appendHTML([settingIcon, settingName], setting);
                return setting
            }

            // Main Appendings
            appendHTML([shareApp(), downloadData(), deleteData(), resetApp()], sectionContainer)
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