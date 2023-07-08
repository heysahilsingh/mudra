import { compTransactionsRow } from "../../components.js";
import { dbTransactions, dbUserDetails } from "../../db.js";
import { appendHTML, createHTML, formatAmount, popMsg, saError } from "../../helper.js";
import { subPageAddTransaction } from "./sub-pages/subPageAddTransaction.js";
import { subPageTransactionHistory } from "./sub-pages/subPageTransactionHistory.js";

export function pageDashboard() {
  try {
    const pageDashboard = createHTML("div", { class: "page page-dashboard" });

    // Page Header
    const header = () => {
      const header = createHTML("div", { class: "header" });

      // Row 1
      const row1 = createHTML("div", { class: "row-1" });
      const userName = createHTML(
        "span",
        { class: "user-name" },
        `Hi ${dbUserDetails.userName}!`
      );
      const refreshBtn = createHTML("i", {
        class: "ph-bold ph-arrows-clockwise",
      });
      refreshBtn.addEventListener("click", () =>
        popMsg("Refreshing Data...", "warning").then(() => location.reload())
      );

      appendHTML([userName, refreshBtn], row1);

      // Row 2
      const row2 = createHTML("div", { class: "row-2" });
      const account = createHTML("div", { class: "account" });
      const accountReport = createHTML(
        "span",
        { class: "report btn-link" },
        "Total balance"
      );
      const accountReportIcon = createHTML("i", {
        class: "ph-bold ph-caret-right",
      });
      appendHTML(accountReportIcon, accountReport);

      const accountBalance = createHTML(
        "span",
        { class: `ammount show ${dbUserDetails.accountBalance.status}` },
        `${formatAmount(dbUserDetails.accountBalance.balance)} ${dbUserDetails.currency}`
      );

      const eye = createHTML("i", { class: "ph-fill ph-eye" });
      eye.addEventListener("click", () => {
        eye.classList.toggle("ph-eye");
        eye.classList.toggle("ph-eye-slash");
        if (accountBalance.classList.contains("show")) {
          accountBalance.classList.remove("show");
          accountBalance.classList.add("hidden");
          accountBalance.textContent = `***00 ${dbUserDetails.currency}`;
        } else if (accountBalance.classList.contains("hidden")) {
          accountBalance.classList.remove("hidden");
          accountBalance.classList.add("show");
          accountBalance.textContent = `${formatAmount(dbUserDetails.accountBalance.balance)} ${dbUserDetails.currency}`;
        }
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
        const recentTransactions = createHTML("section", {
          class: "recent-transactions",
        });

        // Section Heading
        const heading = createHTML(
          "p",
          { class: "section-heading" },
          "Recent Transactions"
        );

        // Section Wrapper
        const wrapper = (() => {
          const wrapper = createHTML("div", { class: "section-wrapper" });

          const transactions = (() => {
            const transactions = createHTML(
              "div",
              { class: "transactions" },
              "Recent Transactions Will Be Shown Here");

            //  const sa = compTransactionRow("expense", "TRANS_Y3M2S3R0Y4N0V0k51687653988203");
            const sa2 = compTransactionsRow("26 june 2023", dbTransactions.expense);

            if (sa2) {
              appendHTML(sa2.html, transactions)
            }

            return transactions;
          })();

          const viewMore = createHTML(
            "button",
            { class: "btn-link" },
            "View Transactions"
          );
          const viewMoreIcon = createHTML("i", {
            class: "ph-bold ph-caret-right",
          });

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

setTimeout(() => {
  subPageAddTransaction({
    
  })
})


