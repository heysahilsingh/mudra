import { compNotFound } from "../../../components.js";
import { dbWallets } from "../../../db.js";
import { appendHTML, closeSubPage, consoleError, createHTML, formatAmount } from "../../../helper.js";

export function subPageWalletPicker(pObject) {
  /* 
  IMPORTANT NOTES TO BE NOTED
  1. Call the function using curly braces {} as the parameter.
  2. To include inactive wallets in the selection and display, use {showInactiveWallets: true}.
  3. To specify selected wallets, provide the wallet ID(s) as an array: {selectedWalletIds: ["WALLET_ID_1"] or ["WALLET_ID_1", "WALLET_ID_2"]}.
  4. To enable multiple wallet selection, include the property {selectMultiple: true}.
  5. If you want to execute a callback function when a wallet is selected, use the property {callback: "your callback function"}.
  6. The callback function will receive an array containing the selected wallet object(s).
  */

  // Destructure parameter object
  const { selectedWalletIds, selectMultiple, showInactiveWallets, callback } = pObject;

  if (document.querySelector(".app .app-page")) {
    // Select Parent Page
    const parentPage = document.querySelector(".app .app-page");

    // Sub Page
    const page = createHTML("div", { class: "sub-page wallet-picker" });

    const pageWrapper = (() => {
      const pageWrapper = createHTML("div", { class: "sub-page-wrapper" });

      // Page Header
      const header = (() => {
        const header = createHTML("div", { class: "header" });

        const btnBack = createHTML("i", { class: "ph ph-arrow-left" });

        const heading = createHTML("p", { class: "page-heading" }, "Select Wallet");

        const done = createHTML("i", { class: "ph ph-check" });

        // Click event on btnBack and done btn
        [btnBack, done].forEach((element) => {
          element.addEventListener("click", () => {
            closeSubPage(page);
          });
        });

        appendHTML([btnBack, heading, done], header);
        return header;
      })();

      // Page Body
      const body = (() => {
        const body = createHTML("div", { class: "body" });

        let returnArray = [];

        // Section Wallets Lists
        const wallets = () => {
          const walletsList = createHTML("ul", { class: "wallets" });

          // Function to create wallets
          const addWalletToList = (wallet) => {
            // HTML li
            const li = createHTML("li", { class: `wallet icon ${wallet.icon}`, id: wallet.id });
            // HTML Icon
            const liIcon = createHTML("i", { class: "ph-fill ph-check-circle" });

            // HTML Info
            const info = createHTML("div", { class: "info" });

            // HTML Name
            const name = createHTML("p", { class: "wallet-name" }, wallet.name);

            // HTML Balance
            const balance = createHTML("p", { class: "wallet-balance", balanceStatus: (wallet.balance < 0) ? "negative" : "positive" }, formatAmount(wallet.balance));

            appendHTML([name, balance], info);

            // Add Event Listener to li
            li.addEventListener("click", () => {
              // if selectMultiple argument is true
              if (selectMultiple && selectMultiple === true) {
                // Toggle class of wallet HTML
                li.classList.toggle("selected");

                // Add/Remove this wallet object from returnArray[]
                if (returnArray.length > 0) {
                  let found = false;
                  // Check if this wallet object exists in returnArray[] or not.
                  for (const value of returnArray) {
                    if (value.id === wallet.id) {
                      found = true;
                      break;
                    }
                  }

                  // If not exists, then add
                  if (!found) {
                    returnArray.push(wallet);
                  }
                  // If exists, then remove
                  else {
                    returnArray = returnArray.filter((value) => value.id !== wallet.id);
                  }
                } else {
                  returnArray.push(wallet);
                }

                // Ensure to have at least one selected li
                const selectedLi = walletsList.querySelectorAll("li.selected");

                if (selectedLi.length === 0) {
                  // If no <li> elements are selected, add the "selected" class to the current <li>
                  li.classList.add("selected");
                  returnArray.push(wallet);
                }
              }
              // if selectMultiple argument is not true
              else {
                // Remove the "selected" class from any existing <li> elements
                const selectedLi = walletsList.querySelectorAll("li.selected");

                if (selectedLi.length > 0) selectedLi.forEach((ele) => ele.classList.remove("selected"));

                li.classList.add("selected");

                // Push this wallet in returnArray.wallets[]
                returnArray = [wallet];
              }

              // Run Call Function
              if (callback && typeof callback === "function") callback(returnArray);
            });

            // Populate returnArray and add ".selected" class if selectedWalletIds parameter is passed
            if (selectedWalletIds && Array.isArray(selectedWalletIds)) {
              if (selectedWalletIds.includes(wallet.id)) {
                li.classList.add("selected");
                returnArray.push(wallet);
              }
            }

            appendHTML([info, liIcon], li);
            appendHTML(li, walletsList);
          };

          // Itewrate dbWallets to render wallet list
          for (const wallet of dbWallets) {
            if (showInactiveWallets && showInactiveWallets === true) {
              addWalletToList(wallet);
            } else {
              if (wallet.isActive === true) {
                addWalletToList(wallet);
              }
            }
          }

          // Render compNotFound() if no wallet in the list
          if (!walletsList.hasChildNodes()) appendHTML(compNotFound("No active wallet."), walletsList);

          return walletsList;
        };

        appendHTML(wallets(), body)
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
