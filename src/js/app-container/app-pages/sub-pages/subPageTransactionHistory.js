import { compTransactionsRow, compNotFound } from "../../../components.js";
import { dbTransactions, dbUserDetails } from "../../../db.js";
import {
  appendHTML,
  closeSubPage,
  consoleError,
  createHTML,
  formatAmount,
  getDates,
  getTransactions,
} from "../../../helper.js";
import { subPageCategoryPicker } from "./subPageCategoryPicker.js";
import { subPageDatePicker } from "./subPageDatePicker.js";
import { subPageWalletPicker } from "./subPageWalletPicker.js";

export function subPageTransactionHistory(parameter) {
  /* IMPORTANT NOTES TO BE NOTED
  // To invoke this function, simply call it with an object as an argument: subPageTransactionHistory({}).
  // To display data only for specific date(s), pass the date(s) as an array to the "pDates" property, like this: {pDates: ["dd mmmm yyyy", "dd mmmm mmmm", ...]}.
  // To display data only for specific transaction(s), pass the transaction(s) as an array of objects to the "pTransactions" property, like this: {pTransactions: [{..whole object of transaction}, ....]}.
  */

  if (document.querySelector(".app .app-page")) {
    // Select Parent Page
    const parentPage = document.querySelector(".app .app-page");

    // Destructure parameter object
    const { pDates, pTransactions, pDateRangeId } = parameter;

    // Sub Page
    const page = createHTML("div", { class: "sub-page transactions-history" });

    const pageWrapper = (() => {
      const pageWrapper = createHTML("div", { class: "sub-page-wrapper" });

      // Page Header
      const header = (() => {
        const header = createHTML("div", { class: "header" });

        const btnBack = createHTML("i", { class: "ph ph-arrow-left" });

        // Click event on btnBack
        btnBack.addEventListener("click", () => {
          closeSubPage(page);
        });

        const heading = createHTML(
          "p",
          { class: "page-heading" },
          "Transactions History"
        );

        const search = createHTML("i", { class: "ph ph-magnifying-glass" });

        appendHTML([btnBack, heading, search], header);
        return header;
      })();

      // Page Body
      const body = (() => {
        const body = createHTML("div", { class: "body" });

        // Important Data Variables
        let dataDates =
          pDates ||
          getDates(new Date("09/30/2023"), dbUserDetails.firstTransaction);
        let dataTransactions =
          pTransactions || [].concat(...Object.values(dbTransactions));

        let isDTassignable = true;

        let dataCategories = [];
        let dataWallets = [];

        // Section Filters
        const filters = (() => {
          const filters = createHTML("section", { class: "section-filters" });

          // Filter: Transactions Date
          const filterDate = (() => {
            const filterDate = createHTML("div", {
              class: "filter filter-date",
            });

            const filterHeading = createHTML(
              "p",
              { class: "filter-heading" },
              "Date Ranges:"
            );
            const filterText = createHTML(
              "p",
              {
                class: "filter-text",
                date_range_id: pDateRangeId || "allTime",
              },
              pDateRangeId
                ? pDateRangeId.charAt(0).toUpperCase() +
                    pDateRangeId.slice(1).replace(/([A-Z])/g, " $1")
                : "All"
            );

            const filterTextIcon = createHTML("i", {
              class: "ph-bold ph-caret-right",
            });

            // Store Selected Dates for "Custom Date Range"
            let selectedDates = [];

            // Event Listener on filterDate
            filterDate.addEventListener("click", () => {
              // Select the date_range_id attribute
              const dateRangeId = filterText.getAttribute("date_range_id");

              // Check the length of selectedDates and selectedDatesForRange
              const selLength = selectedDates.length > 0 ? selectedDates : null;

              // Call the subPageDatePicker()
              subPageDatePicker({
                selectedListId: dateRangeId,
                selectedListDates:
                  dateRangeId === "customRange" ? null : selLength,
                callback: (value) => {
                  // Update the filterText's HTML
                  filterText.textContent = value.row.name;
                  filterText.setAttribute("date_range_id", value.row.id);
                  // Store and Update latest dates
                  dataDates = value.dates;
                  selectedDates = value.dates;
                  // Render the data section again
                  renderData();
                },
              });
            });

            appendHTML([filterHeading, filterText, filterTextIcon], filterDate);
            return filterDate;
          })();

          // Filter: Transactions Category
          const filterCategory = (() => {
            const filterCategory = createHTML("div", {
              class: "filter filter-category",
            });

            const filterHeading = createHTML(
              "p",
              { class: "filter-heading" },
              "Category: "
            );
            const filterText = createHTML("p", { class: "filter-text" }, "All");
            const filterTextIcon = createHTML("i", {
              class: "ph-bold ph-caret-right",
            });

            // Event Listener on filterCategory
            filterCategory.addEventListener("click", () => {
              subPageCategoryPicker({
                pHeading: "Select Category",
                pMode: "select"
              });
            });

            appendHTML(
              [filterHeading, filterText, filterTextIcon],
              filterCategory
            );

            return filterCategory;
          })();

          // Filter: Transactions Wallet
          const filterWallet = (() => {
            const filterWallet = createHTML("div", {
              class: "filter filter-wallet",
            });

            const filterHeading = createHTML(
              "p",
              { class: "filter-heading" },
              "Wallet: "
            );
            const filterText = createHTML("p", { class: "filter-text" }, "All");
            const filterTextIcon = createHTML("i", {
              class: "ph-bold ph-caret-right",
            });

            // Store selected wallet(s)
            let selectedWallets = [];

            // Event Listener on filterCategory
            filterWallet.addEventListener("click", () => {
              // Populate WalletIDs
              let walletIds = [];
              selectedWallets.forEach((wallet) => walletIds.push(wallet.id));

              // Run subPageWalletPicker()
              subPageWalletPicker({
                selectedWalletIds: walletIds.length > 0 ? walletIds : null,
                selectMultiple: true,
                callback: (value) => {
                  // Update the selectedWallets[]
                  selectedWallets = value;

                  // Update dataTransactions[]
                  const walletTransactions = getTransactions({
                    based: "wallet",
                    basedIds: value.map((obj) => obj.id),
                  });

                  ////////////////////////////////////////////////////////////////////////////
                  // Populate transactions in dataTransactions[]
                  // If dataTransactions[] is open for assigning
                  // if (isDTassignable === true) {
                  //   dataTransactions = [...walletTransactions];
                  //   isDTassignable = false;
                  // }
                  // If dataTransactions[] is not open for assigning
                  dataTransactions = dataTransactions.filter(transaction => {
                    const walletIds = value.map(obj => obj.id);
                    return walletIds.includes(transaction.walletId);
                  });
                  

                    // dataTransactions = filteredArr1
                    // console.log(value)
                    // console.log(filteredArr1)



                  // else {
                  //   const newTransactions = [];

                  //   // Iterate transactions in walletTransactions[] 
                  //   for (let i = 0; i < walletTransactions.length; i++) {
                  //     let found = false;
                  //     // Check if 
                  //     for (let j = 0; j < dataTransactions.length; j++) {
                  //       if (walletTransactions[i].walletId === dataTransactions[j].walletId) {
                  //         found = true;
                  //         dataTransactions.splice(j, 1); // Remove the matched element from dataTransactions
                  //         break;
                  //       }
                  //     }

                  //     if (!found) {
                  //       newTransactions.push(walletTransactions[i]); // Add the walletTransactions element to newTransactions
                  //     }
                  //   }

                  //   dataTransactions = dataTransactions.concat(newTransactions); // Concatenate newTransactions with dataTransactions
                  // }

                  // Update the filterText
                  
                  ////////////////////////////////////////////////////////////////////////////
                  
                  const result = value.map((wallet) => wallet.name).join(", ");
                  filterText.textContent = result;

                  // Re render section data
                  renderData();
                },
              });
            });

            appendHTML(
              [filterHeading, filterText, filterTextIcon],
              filterWallet
            );

            return filterWallet;
          })();

          appendHTML([filterDate, filterCategory, filterWallet], filters);
          return filters;
        })();

        // Section Net Balance
        const netBalance = (() => {
          const netBalance = createHTML("section", {
            class: "section-net-balance",
          });

          const incomeHeading = createHTML(
            "p",
            { class: "income" },
            "Total Income"
          );
          const incomeData = createHTML("p", {}, "0 Rs");

          const expenseHeading = createHTML(
            "p",
            { class: "expense" },
            "Total Expense"
          );
          const expenseData = createHTML("p", {}, "0 Rs");

          appendHTML([incomeData], incomeHeading);
          appendHTML([expenseData], expenseHeading);
          appendHTML([incomeHeading, expenseHeading], netBalance);
          return {
            netBalance: netBalance,
            incomeData: incomeData,
            expenseData: expenseData,
          };
        })();

        // Section Render Data
        function renderData() {
          body.querySelector(".section-data")?.remove();

          const data = createHTML("section", { class: "section-data" });

          let newIncome = 0;
          let newExpense = 0;
          let rows = [];

          // Iterate dataDates and print transactionsRow
          for (let date of dataDates) {
            const row = compTransactionsRow(date, dataTransactions);
            if (typeof row === "object") {
              newIncome += row.totalIncome;
              newExpense += row.totalExpense;

              // Update the categories[] and wallets[]
              function checkAndPush(array, item) {
                if (!array.some((obj) => obj.id === item.id)) {
                  array.push(item);
                }
              }

              for (const category of row.categories) {
                checkAndPush(dataCategories, category);
              }

              for (const wallet of row.wallets) {
                checkAndPush(dataWallets, wallet);
              }

              rows.push(row.html);
            }
          }

          // Update netBalance's data
          netBalance.incomeData.textContent = `${formatAmount(newIncome)} ${
            dbUserDetails.currency
          }`;
          netBalance.expenseData.textContent = `${formatAmount(newExpense)} ${
            dbUserDetails.currency
          }`;

          // Conditionaly append element in data
          rows.length > 0
            ? appendHTML(rows, data)
            : appendHTML(compNotFound("No Transaction Found."), data);

          appendHTML(data, body);
          return data;
        }

        appendHTML([filters, netBalance.netBalance, renderData()], body);
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
