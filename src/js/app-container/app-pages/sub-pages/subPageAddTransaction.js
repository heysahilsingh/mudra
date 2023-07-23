import { compConfirmDialogBox, compDatePicker } from "../../../components.js";
import { dbCategories, dbDeleteTransaction, dbEntryType, dbSaveTransaction, dbAppSettings, dbWallets } from "../../../db.js";
import { appendHTML, closeSubPage, createHTML, consoleError, formatDate, getUniqueId, popMsg, formatAmount } from "../../../helper.js";
import { subPageCategoryPicker } from "./subPageCategoryPicker.js";
import { subPageWalletPicker } from "./subPageWalletPicker.js";

export function subPageAddTransaction(pObject) {
    /* IMPORTANT NOTES TO BE NOTED
    1. To call this function, subPageAddTransaction({}).
    2. To call this function as a page, then {pAsParentPage: true}
    2. If you want to edit a transaction, pass that tyransaction's object, {pEditTransaction: "object of transaction"}.
    3. To run a callback function, when clicking on save button, {pCallback: "Your function"}
    */

    if (pObject?.pAsParentPage === true) {
        return renderAddTransactionPage()
    }
    else {
        if (document.querySelector(".app .app-page")) {
            // Select Parent Page
            const parentPage = document.querySelector(".app .app-page");
            const page = renderAddTransactionPage();
            appendHTML(page, parentPage);
        } else {
            consoleError(".app-page HTML not found.");
        }
    }

    // Function - Render Page
    function renderAddTransactionPage() {
        // Destructure Parameter
        const { pEditTransaction, pCallback } = pObject;

        let addTransaction = {
            id: pEditTransaction?.id || getUniqueId("TRANS"),
            amount: pEditTransaction?.amount || 0,
            description: pEditTransaction && pEditTransaction.description ? pEditTransaction.description : "",
            date: formatDate(pEditTransaction?.date || new Date()).saveDate,
            categoryId: pEditTransaction?.categoryId || null,
            walletId: pEditTransaction?.walletId || dbAppSettings.defaultWallet,
            entryType: pEditTransaction?.entryType || "expense",
        };

        // Sub Page
        const page = createHTML("div", { class: "sub-page add-transaction" });

        const pageWrapper = (() => {
            const pageWrapper = createHTML("div", { class: "sub-page-wrapper" });

            // Function - Body Wrapper
            function bodyWrapper(tType) {
                page.querySelector(".body-wrapper")?.remove()

                const bodyWrapper = createHTML("div", { class: "body-wrapper" });

                // SECTION - TRANSACTION FORM
                const sectionTransactionForm = createHTML("section", { class: `transaction-form tt-${tType}` });

                // Transaction Amount
                const transactionAmountWrapper = createHTML("div", { class: "transaction-amount" });
                const transactionAmount = createHTML("input", { type: "text", placeholder: 0 });
                transactionAmount.value = formatAmount(addTransaction.amount);

                transactionAmount.addEventListener('input', handleInput);

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

                appendHTML(transactionAmount, transactionAmountWrapper)

                // Transaction Category
                const existCategory = addTransaction.categoryId ? dbCategories[addTransaction.entryType].find(category => category.id === addTransaction.categoryId) : null;

                const transactionCategory = createHTML("div", { class: "transaction-category" });
                const transactionCategoryIcon = createHTML("i", { class: `icon ${existCategory?.icon || ""}` });
                const transactionCategoryName = createHTML("p", { class: `transaction-category-name` }, existCategory?.name || "Select category");

                transactionCategory.addEventListener("click", () => {
                    subPageCategoryPicker({
                        pHeading: "Select a category",
                        pCategoryType: addTransaction.entryType,
                        pMode: "select",
                        pPreSelected: [addTransaction.categoryId],
                        pCallback: (value) => {
                            transactionCategoryIcon.className = `icon ${value[0].icon}`;
                            transactionCategoryName.textContent = value[0].name;

                            // Update categoryId property of addTransaction{}
                            addTransaction.categoryId = value[0].id
                        }
                    })
                })

                appendHTML([transactionCategoryIcon, transactionCategoryName], transactionCategory);

                // Transaction Description
                const transactionDescription = createHTML("div", { class: "transaction-description" });
                const transactionDescriptionIcon = createHTML("i", { class: "ph-bold ph-text-align-left" });
                const transactionDescriptionInput = createHTML("input", { type: "text", placeholder: "Description" });
                transactionDescriptionInput.value = addTransaction.description;

                appendHTML([transactionDescriptionIcon, transactionDescriptionInput], transactionDescription)

                // Transaction Date
                const transactionDate = createHTML("div", { class: "transaction-date" });
                const transactionDateIcon = createHTML("i", { class: "ph-fill ph-calendar-plus" });
                const transactionDateText = createHTML("p", { class: "transaction-date-text", time: formatDate(addTransaction.date).time }, formatDate(addTransaction.date).date);

                transactionDate.addEventListener("click", () => {
                    compDatePicker({
                        type: "single",
                        dates: [formatDate(addTransaction.date).date],
                        callback: (value) => {
                            transactionDateText.textContent = formatDate(value._date).date;
                            transactionDateText.setAttribute("time", formatDate(new Date()).time)

                            // Update the date property of addTransaction{}
                            addTransaction.date = formatDate(formatDate(value._date).date + " " + formatDate(new Date()).time).saveDate;
                        }
                    })
                })

                appendHTML([transactionDateIcon, transactionDateText], transactionDate)


                // Transaction Wallet
                const existWallet = addTransaction.walletId ? dbWallets.find(wallet => wallet.id === addTransaction.walletId) : null;

                const transactionWallet = createHTML("div", { class: "transaction-wallet" });
                const transactionWalletIcon = createHTML("i", { class: `icon ${existWallet?.icon || ""}` });
                const transactionWalletName = createHTML("p", { class: `transaction-wallet-name` }, existWallet?.name || "Select wallet");

                transactionWallet.addEventListener("click", () => {
                    subPageWalletPicker({
                        selectedWalletIds: [addTransaction.walletId],
                        callback: (value) => {
                            transactionWalletIcon.className = `icon ${value[0].icon}`;
                            transactionWalletName.textContent = value[0].name;

                            // Update walletId property of addTransaction{}
                            addTransaction.walletId = value[0].id;
                        }
                    })
                })

                appendHTML([transactionWalletIcon, transactionWalletName], transactionWallet);

                // SECTION - ACTION BUTTONS
                const sectionActionButtons = createHTML("div", { class: "section-action-buttons" });
                const saveButton = createHTML("button", { class: "save btn btn-primary" }, "Save");

                // Delete button
                if (pEditTransaction) {
                    const deleteButton = createHTML("button", { class: "delete btn btn-stroke-red" }, "Delete");

                    deleteButton.addEventListener("click", () => {
                        compConfirmDialogBox({
                            pButton1: "No",
                            pButton2: "Yes",
                            pMessage: "Are you sure you want to delete? You won't be able to restore this transaction if deleted.",
                            pCallback: () => {
                                dbDeleteTransaction(pEditTransaction)
                                popMsg("Transaction deleted successfully.", "success")
                                closeSubPage(page);

                                // Run Callback
                                if (pCallback && typeof pCallback === "function") {
                                    pCallback()
                                }
                            }
                        })
                    })

                    appendHTML(deleteButton, sectionActionButtons)
                }

                appendHTML(saveButton, sectionActionButtons)

                // Save Button Event Listener
                saveButton.addEventListener("click", () => {
                    const isActiveWallet = dbWallets.find(wallet => wallet.id === addTransaction.walletId);

                    // Validation
                    if (transactionAmount.value.trim() === '' || transactionAmount.value == 0) {
                        popMsg("Please enter amount.", "error")
                    } else if (!addTransaction.categoryId) {
                        popMsg("Please select a categry.", "error")
                    } else if (!pEditTransaction && !isActiveWallet?.isActive) {
                        popMsg("Please select a different wallet or activate the currently chosen one.", "error")
                    }
                    else {
                        addTransaction.amount = Number(parseFloat(transactionAmount.value.match(/\d+(\.\d+)?/g).join("")));

                        dbSaveTransaction(addTransaction);

                        if (pEditTransaction) {
                            popMsg("Transaction updated.", "success")
                        } else {
                            popMsg("Transaction added.", "success")
                        }

                        closeSubPage(page);

                        // Run Callback
                        if (pCallback && typeof pCallback === "function") {
                            pCallback()
                        }

                    }

                })

                // Main Appendings
                appendHTML([transactionAmountWrapper, transactionCategory, transactionDescription, transactionDate, transactionWallet], sectionTransactionForm)
                appendHTML([sectionTransactionForm, sectionActionButtons], bodyWrapper)
                appendHTML(bodyWrapper, body)
            }

            // Page Header
            const header = (() => {
                const header = createHTML("div", { class: "header" });

                // Back Button
                const btnBack = createHTML("i", { class: "ph ph-arrow-left" });

                // Page Heading
                const transactionType = (() => {
                    const transactionType = createHTML("div", { class: "transaction-type" });

                    // Name
                    const transactionTypeName = createHTML("div", { class: "transaction-type-name" });
                    const transactionTypeNameText = createHTML("p", { class: "transaction-type-text" }, addTransaction.entryType);
                    const transactionTypeNameIcon = createHTML("i", { class: "ph-fill ph-caret-down" });

                    if (!pEditTransaction) {
                        transactionTypeName.addEventListener("click", () => {
                            transactionTypePicker(addTransaction.entryType)
                        })
                    }

                    appendHTML([transactionTypeNameText, transactionTypeNameIcon], transactionTypeName)
                    appendHTML(transactionTypeName, transactionType)

                    // Transaction Type Picker
                    function transactionTypePicker(pSelectedEntryType) {
                        const transactionTypePicker = createHTML("ul", { class: "transaction-type-picker open" });

                        dbEntryType.forEach(type => {
                            const liType = createHTML("li", { class: "type" });
                            const liTypeName = createHTML("p", { class: "type-name", id: type }, type);
                            const liTypeIcon = createHTML("i", { class: "ph-fill ph-check-circle" });

                            const handleClick = () => {
                                const selectedLiType = transactionTypePicker.querySelectorAll("li.selected");
                                selectedLiType.forEach((ele) => ele.classList.remove("selected"));

                                liType.classList.add("selected");
                                transactionTypeNameText.textContent = type;

                                transactionTypePicker.classList.add("closing");
                                setTimeout(() => {
                                    transactionTypePicker?.remove();
                                }, 250);

                                addTransaction.entryType = type;
                                bodyWrapper(type);
                            };

                            liType.addEventListener("click", handleClick);

                            if (pSelectedEntryType === type) {
                                liType.classList.add("selected");
                            }

                            appendHTML([liTypeName, liTypeIcon], liType);
                            appendHTML(liType, transactionTypePicker);
                        });

                        const handleOutsideClick = (event) => {
                            if (!transactionTypePicker.contains(event.target)) {
                                transactionTypePicker.classList.add("closing");
                                setTimeout(() => {
                                    transactionTypePicker?.remove();
                                }, 250);
                            }
                        };

                        setTimeout(() => {
                            document.addEventListener("click", handleOutsideClick);
                        });

                        appendHTML(transactionTypePicker, transactionType);
                    }

                    return transactionType
                })();

                // Done Btn
                const closeIcon = createHTML("i", { class: "ph ph-x" });

                // Click event on Back and Done button
                [btnBack, closeIcon].forEach((btn) => {
                    btn.addEventListener("click", () => {
                        closeSubPage(page);
                    });
                });

                appendHTML([btnBack, transactionType, closeIcon], header);

                return header;
            })();

            // Page Body
            const body = createHTML("div", { class: "body" });

            // Render body
            bodyWrapper(addTransaction.entryType)

            appendHTML([header, body], pageWrapper);
            return pageWrapper;
        })();

        // Append
        appendHTML(pageWrapper, page);

        return page
    }
}

