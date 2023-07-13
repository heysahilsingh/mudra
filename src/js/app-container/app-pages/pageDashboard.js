import { compTransactionsRow } from "../../components.js";
import { dbTransactions, dbUserDetails } from "../../db.js";
import { appendHTML, createHTML, formatAmount, popMsg, saError } from "../../helper.js";
import { subPageAddTransaction } from "./sub-pages/subPageAddTransaction.js";
import { subPageAddWallet } from "./sub-pages/subPageAddWallet.js";
import { subPageTransactionHistory } from "./sub-pages/subPageTransactionHistory.js";
import { subPageWalletPicker } from "./sub-pages/subPageWalletPicker.js";

export function pageDashboard() {
  try {
    const pageDashboard = createHTML("div", { class: "page page-dashboard" });

    // Page Header
    const header = () => {
      const header = createHTML("div", { class: "header" });

      // Row 1
      const row1 = createHTML("div", { class: "row-1" });
      const userName = createHTML("span", { class: "user-name" }, `Hi ${dbUserDetails.userName}!`);
      const refreshBtn = createHTML("i", { class: "ph-bold ph-arrows-clockwise" });

      refreshBtn.addEventListener("click", () => popMsg("Refreshing Data...", "warning").then(() => location.reload()));

      appendHTML([userName, refreshBtn], row1);

      // Row 2
      const row2 = createHTML("div", { class: "row-2" });
      const account = createHTML("div", { class: "account" });
      const accountReport = createHTML("span", { class: "report btn-link" }, "Total balance");
      const accountReportIcon = createHTML("i", { class: "ph-bold ph-caret-right" });

      appendHTML(accountReportIcon, accountReport);

      const accountBalance = createHTML(
        "span",
        { class: `ammount show ${(dbUserDetails.accountBalance < 0) ? "negative" : "positive"}` },
        formatAmount(dbUserDetails.accountBalance)
      );

      const eye = createHTML("i", { class: "ph-fill ph-eye" });

      eye.addEventListener("click", () => {
        eye.classList.toggle("ph-eye");
        eye.classList.toggle("ph-eye-slash");
        accountBalance.classList.toggle("show");
        accountBalance.classList.toggle("hidden");
        accountBalance.textContent = accountBalance.classList.contains("show") ? formatAmount(dbUserDetails.accountBalance) : "***00";
      });


      appendHTML([accountReport, accountBalance], account);
      appendHTML([account, eye], row2);

      // Append
      appendHTML([row1, row2], header);

      return header;
    };

    // Page Body
    const body = () => {
      const body = createHTML("div", { class: "body" });

      // Section: Recent Transactions
      const recentTransactions = (() => {
        const recentTransactions = createHTML("section", { class: "recent-transactions" });

        // Section Heading
        const heading = createHTML("p", { class: "section-heading" }, "Recent Transactions");

        // Section Wrapper
        const wrapper = (() => {
          const wrapper = createHTML("div", { class: "section-wrapper" });

          const transactions = (() => {
            const transactions = createHTML("div", { class: "transactions" }, "Recent Transactions Will Be Shown Here");

            const sa2 = compTransactionsRow({
              pDate: "26 june 2023",
              pTransactions: dbTransactions.expense
            });

            if (sa2) appendHTML(sa2.html, transactions)

            return transactions;
          })();

          const viewMore = createHTML("button", { class: "btn-link" }, "View Transactions");
          const viewMoreIcon = createHTML("i", { class: "ph-bold ph-caret-right" });

          // Click Event on ViewMore
          viewMore.addEventListener("click", () => {
            subPageTransactionHistory({})
          })

          appendHTML(viewMoreIcon, viewMore);
          appendHTML([transactions, viewMore], wrapper);
          return wrapper;
        })();

        appendHTML([heading, wrapper], recentTransactions);
        return recentTransactions;
      })();

      appendHTML([recentTransactions], body);
      return body;
    };

    // Append
    appendHTML([header(), body()], pageDashboard);
    return pageDashboard;
  } catch (error) {
    saError(error, "Error while executing pageDashboard().");
  }
}

// setTimeout(() => {
//   subPageAddWallet({
//     // pEditWallet: {
//     //   id: "Paytm_WALLET_T1c4d0S9h0o4A1E01687609789369",
//     //   name: "paytm",
//     //   icon: "icon-wallet-2",
//     //   balance: -20156,
//     //   // status: "negative",
//     //   isActive: false,
//     // }
//   })
// })

// setTimeout(() => {
//   subPageAddTransaction({
//     pEditTransaction: {
//       id: "TRANS_Y3M2S3R0Y4N0V0k61687653988203",
//       amount: 754,
//       description: "",
//       date: "Tuesday 27-June-2023 9:23 AM",
//       categoryId: "CAT_D2g1n0h0q8l8c8T31687610742935",
//       walletId: "Cash_WALLET_T1c4d0S9h0o4A1E01687609709369",
//       entryType: "expense",
//     }
//   })
// })

// setTimeout(() => {
//   subPageWalletPicker({})
// })