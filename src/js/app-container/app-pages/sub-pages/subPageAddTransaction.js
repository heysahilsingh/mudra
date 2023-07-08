import { dbEntryType } from "../../../db.js";
import { appendHTML, closeSubPage, createHTML, consoleError } from "../../../helper.js";

export function subPageAddTransaction(pObject) {
    /* IMPORTANT NOTES TO BE NOTED
    1. TO call this function, subPageAddTransaction({}).
    */
    if (document.querySelector(".app .app-page")) {
        // Select Parent Page
        const parentPage = document.querySelector(".app .app-page");

        // Destructure Parameter
        const { pEditTransaction, pCallback } = pObject;

        // Sub Page
        const page = createHTML("div", { class: "sub-page add-transaction" });

        const pageWrapper = (() => {
            const pageWrapper = createHTML("div", { class: "sub-page-wrapper" });

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
                    const transactionTypeNameText = createHTML("p", { class: "transaction-type-text", entryType: pEditTransaction?.entryType || "expense" }, pEditTransaction?.entryType || "expense");
                    const transactionTypeNameIcon = createHTML("i", { class: "ph-fill ph-caret-down" });

                    transactionTypeName.addEventListener("click", () => {
                        transactionTypePicker(transactionTypeNameText.getAttribute("entryType"))
                    })

                    appendHTML([transactionTypeNameText, transactionTypeNameIcon], transactionTypeName)
                    appendHTML(transactionTypeName, transactionType)

                    // Transaction Type Picker
                    function transactionTypePicker(pSelectedEntryType) {
                        const transactionTypePicker = createHTML("ul", { class: "transaction-type-picker open" });

                        dbEntryType.forEach(type => {
                            const liType = createHTML("li", { class: "type" });
                            const liTypeName = createHTML("p", { class: "type-name", id: type }, type);
                            const liTypeIcon = createHTML("i", { class: "ph-fill ph-check-circle" });

                            // Add event listener
                            liType.addEventListener("click", () => {
                                const selectedLiType = transactionTypePicker.querySelectorAll("li.selected");

                                if (selectedLiType.length > 0) { selectedLiType.forEach((ele) => ele.classList.remove("selected")); }

                                liType.classList.add("selected");
                                transactionTypeNameText.textContent = type;
                                transactionTypeNameText.setAttribute("entryType", type)

                                transactionTypePicker.classList.add("closing")
                                setTimeout(() => {
                                    transactionTypePicker?.remove()
                                }, 250)
                            })

                            if(pSelectedEntryType && pSelectedEntryType === type){
                                liType.classList.add("selected")
                            }

                            appendHTML([liTypeName, liTypeIcon], liType)
                            appendHTML(liType, transactionTypePicker)
                        })

                        appendHTML(transactionTypePicker, transactionType)


                        console.log(transactionTypePicker.offsetHeight)
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
            const body = (() => {
                const body = createHTML("div", { class: "body" });

                

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