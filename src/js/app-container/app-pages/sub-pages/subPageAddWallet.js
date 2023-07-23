import { compConfirmDialogBox } from "../../../components.js";
import { dbSaveWallet, dbDeleteWallet } from "../../../db.js";
import { appendHTML, closeSubPage, consoleError, createHTML, formatAmount, getUniqueId, popMsg, } from "../../../helper.js";
import { subPageIconPicker } from "./subPageIconPicker.js";

export function subPageAddWallet(pObject) {
    /* IMPORTANT NOTES TO BE NOTED
      1. To call this function, subPageAddWallet({}).
      2. You can specify the page heading, {pPageHeading: "Your heading"},
      3. To edit a wallet, {pEditWallet: {"object of that wallet"}}.
      4. To run a callback after clicking on save button, {pCallback: (your callback function)}.
    */

    if (document.querySelector(".app .app-page")) {
        // Select Parent Page
        const parentPage = document.querySelector(".app .app-page");

        // Destructure parameter pObject
        const { pPageHeading, pEditWallet, pCallback } = pObject;

        // Sub Page
        const page = createHTML("div", { class: "sub-page add-wallet" });

        const pageWrapper = (() => {
            const pageWrapper = createHTML("div", { class: "sub-page-wrapper" });

            // Page Header
            const header = (() => {
                const header = createHTML("div", { class: "header" });

                // Back Button
                const btnBack = createHTML("i", { class: "ph ph-arrow-left" });

                // Page Heading
                const heading = createHTML("p", { class: "page-heading" }, pPageHeading ? pPageHeading : "Wallet"
                );


                // Done Icone
                const closeIcon = createHTML("i", { class: "ph ph-x" });

                // Click event on Back and Done button
                [btnBack, closeIcon].forEach(btn => {
                    btn.addEventListener("click", () => {
                        closeSubPage(page)
                    })
                })

                appendHTML([btnBack, heading, closeIcon], header);
                return header;
            })();

            // Page Body
            const body = (() => {
                const body = createHTML("div", { class: "body" });

                let addWallet = {
                    id: pEditWallet?.id || getUniqueId("WALLET"),
                    name: pEditWallet?.name || "",
                    icon: pEditWallet?.icon || "",
                    balance: pEditWallet?.balance || 0,
                    isActive: pEditWallet ? pEditWallet.isActive : true,
                }

                // Section - Wallet
                const sectionWallet = createHTML("section", { class: `section-wallet ${pEditWallet ? "edit-wallet" : "add-wallet"}` });

                // Wallet Name
                const wallet = createHTML("div", { class: "wallet" });
                const walletIcon = createHTML("i", { class: `icon ${addWallet.icon}` }, "Select icon");
                const walletName = createHTML("input", { class: "wallet-name", type: "text", placeholder: "Wallet name" });
                walletName.value = addWallet.name;

                walletIcon.addEventListener("click", () => {
                    subPageIconPicker({
                        pSelectedIconId: addWallet.icon,
                        pCallback: (iconId) => {
                            walletIcon.className = `icon ${iconId}`

                            // Update addWallet's icon property
                            addWallet.icon = iconId;
                        }
                    })
                })

                appendHTML([walletIcon, walletName], wallet)

                // Wallet Balance
                const walletBalance = createHTML("div", { class: "wallet-balance" });
                const WalletBalanceText = createHTML("p", { class: "wallet-balance-text" }, pEditWallet ? "Current balance: " : "Add initial balance: ");
                const walletBalanceInput = createHTML("input", { type: "text", placeholder: "0" });
                walletBalanceInput.value = formatAmount(addWallet.balance);

                if (pEditWallet) {
                    walletBalanceInput.setAttribute("readonly", true);
                    walletBalanceInput.setAttribute("balanceStatus", addWallet.balance < 0 ? "negative" : "positive");
                    walletBalanceInput.addEventListener("click", () => popMsg("Wallet balance can't be edited.", "error"))
                } 
                else {
                    walletBalanceInput.addEventListener('input', handleInput);

                    function handleInput(event) {
                        const input = event.target;
                        const inputValue = input.value;

                        // Remove all non-digit characters from the input value
                        const numericValue = inputValue.replace(/\D/g, '');

                        // Format the numeric value
                        const formattedValue = formatAmount(numericValue);

                        // Update the input value with the formatted value
                        input.value = formattedValue;
                    }
                }

                appendHTML([WalletBalanceText, walletBalanceInput], walletBalance)

                // Wallet Active Status
                const walletActiveStatus = createHTML("div", { class: "wallet-active-status" });
                const walletActiveStatusText = createHTML("p", { class: "wallet-active-status-text" }, "Active:");
                const walletActiveStatusCheck = createHTML("input", { class: "wallet-active-status-check", type: "checkbox" });

                walletActiveStatusCheck.addEventListener("change", () => addWallet.isActive = !addWallet.isActive)

                if (addWallet.isActive === true) walletActiveStatusCheck.click()

                appendHTML([walletActiveStatusText, walletActiveStatusCheck], walletActiveStatus)
                appendHTML([wallet, walletBalance, walletActiveStatus], sectionWallet)

                // Section - Action Buttons
                const sectionActionButton = createHTML("section", { class: "action-buttons" });

                const saveButton = createHTML("button", { class: "save btn btn-primary" }, "Save");

                if (pEditWallet) {
                    const deleteButton = createHTML("button", { class: "delete btn btn-stroke-red" }, "Delete");

                    deleteButton.addEventListener("click", () => {
                        compConfirmDialogBox({
                            pButton1: "No",
                            pButton2: "Yes",
                            pMessage: "Deleting this wallet will also delete all associated transaction(s). Are you sure you want to delete this wallet?",
                            pCallback: () => {
                                dbDeleteWallet(addWallet)
                                popMsg("Wallet deleted successfully.", "success")
                                closeSubPage(page);

                                // Run Callback
                                if (pCallback && typeof pCallback === "function") {
                                    pCallback()
                                }
                            }
                        })
                    })

                    appendHTML(deleteButton, sectionActionButton)
                }

                // Save Button Event Listener
                saveButton.addEventListener("click", () => {
                    // Check for category name
                    if (walletName.value.trim() === '') {
                        popMsg("Please enter a wallet name.", "error")
                    } else {
                        addWallet.name = walletName.value;

                        if (walletBalanceInput.value.trim() === '') {
                            addWallet.balance = 0;
                        } else {
                            addWallet.balance = parseFloat(walletBalanceInput.value.replace(/[^\d-.]/g, ''));
                        }

                        dbSaveWallet(addWallet)
                        popMsg("Wallet saved!", "success")
                        closeSubPage(page);

                        // Run Callback
                        if (pCallback && typeof pCallback === "function") {
                            pCallback()
                        }
                    }

                })

                appendHTML(saveButton, sectionActionButton)

                appendHTML([sectionWallet, sectionActionButton], body)
                return body;
            })();

            appendHTML([header, body], pageWrapper);
            return pageWrapper;
        })();

        // Append
        appendHTML(pageWrapper, page);
        // parentPage.prepend(page)
        appendHTML(page, parentPage);
    } else {
        consoleError(".app-page HTML not found.");
    }
}
