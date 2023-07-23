import { compTransactionsRow, compNotFound, compFilteredIcons } from "../../../components.js";
import { dbAppSettings, dbCategories, dbWallets } from "../../../db.js";
import { appendHTML, closeSubPage, consoleError, createHTML, formatAmount, getDates, getTransactions, searchData } from "../../../helper.js";
import { subPageCategoryPicker } from "./subPageCategoryPicker.js";
import { subPageDatePicker } from "./subPageDatePicker.js";
import { subPageWalletPicker } from "./subPageWalletPicker.js";

export function subPageTransactionHistory(parameter) {
  /* IMPORTANT NOTES TO BE NOTED
  1. To envoke this function, subPageTransactionsHistory({}).
  2. To call this function as a page, then {pAsParentPage: true}
  3. To print desired transactions, {pTransactions, ["array of transaction object"]}
  4. To print transactions of desired dates, 
     {pFIlterDates: {
        dates: ["array of dates"],
        id: "id of date, allowed only: allTime/thisWeek/thisMonth/lastMonth/thisQuarter/lastQuarter/thisYear/lastYear/customSingle/customMultiple/customRange",
        name: "readable name of the id"
       }
     }
  5. To print transactions of desired categories, {pFilterCategories: ["object(s) of category(ies) in array"].
  6. To print transactions of desired wallets, {pFilterWallets: ["object(s) of wallet(s) in array"].
  7. To run callback function when finished editing a transaction, {pCallback: "your callback function"}.
  */
  if (parameter?.pAsParentPage === true) {
    return renderTransactionHistoryPage()
  }
  else {
    if (document.querySelector(".app .app-page")) {
      // Select Parent Page
      const parentPage = document.querySelector(".app .app-page");
      const page = renderTransactionHistoryPage();
      appendHTML(page, parentPage);
    } else {
      consoleError(".app-page HTML not found.");
    }
  }

  function renderTransactionHistoryPage() {
    // Destructure parameter object
    const { pTransactions, pFIlterDates, pFilterCategories, pFilterWallets, pCallback } = parameter;

    // Sub Page
    const page = createHTML("div", { class: "sub-page transactions-history" });

    const pageWrapper = (() => {
      const pageWrapper = createHTML("div", { class: "sub-page-wrapper" });

      // Page Header
      const header = (() => {
        const header = createHTML("div", { class: "header" });

        const btnBack = createHTML("i", { class: "ph ph-arrow-left" });

        const heading = createHTML("p", { class: "page-heading" }, "Transactions History");

        const close = createHTML("i", { class: "ph ph-x" });

        // Click event
        [btnBack, close].forEach(elem => elem.addEventListener("click", () => closeSubPage(page)))

        appendHTML([btnBack, heading, close], header);
        return header;
      })();

      // Page Body
      const body = (() => {
        const body = createHTML("div", { class: "body" });

        // Important Data Variable
        let dataFilters = {
          filterDate: pFIlterDates?.dates || getDates(dbAppSettings.lastTransaction, dbAppSettings.firstTransaction),
          filterCategory: pFilterCategories || Object.values(dbCategories).flatMap(categoryArray => categoryArray),
          filterWallet: pFilterWallets || dbWallets
        };

        // Section Filters
        const sectionFilters = (() => {
          const sectionFilters = createHTML("section", { class: "section-filters" });

          if (pFIlterDates || pFilterCategories || pFilterWallets) {
            sectionFilters.setAttribute("filterStatus", "active")
          } else {
            sectionFilters.setAttribute("filterStatus", "inactive")
          }

          const sectionFiltersHeading = createHTML("p", { class: "section-filters-heading" }, "Show Filters")

          const sectionFiltersWrapper = createHTML("div", { class: "section-filters-wrapper" });

          sectionFiltersHeading.addEventListener("click", () => {
            if (sectionFiltersWrapper.classList.contains("expanded")) {
              sectionFiltersWrapper.classList.remove("expanded");
              sectionFiltersHeading.textContent = "Show Filters";
            } else {
              sectionFiltersWrapper.classList.add("expanded");
              sectionFiltersHeading.textContent = "Hide Filters";
            }
          });


          // Filter: Transactions Date
          const filterDate = (() => {
            const filterDate = createHTML("div", { class: "filter filter-date" });

            let filter = {
              id: pFIlterDates?.id || "allTime",
              name: pFIlterDates?.name || "All time",
              dates: pFIlterDates?.dates || null,
            }

            const filterHeading = createHTML("p", { class: "filter-heading" }, "Date Ranges:");
            const filterText = createHTML("p", { class: "filter-text" }, filter.name);
            const filterTextIcon = createHTML("i", { class: "ph-bold ph-caret-right" });

            // Event Listener on filterDate
            filterDate.addEventListener("click", () => {
              // Call the subPageDatePicker()
              subPageDatePicker({
                selectedListId: filter.id,
                selectedListDates: filter.dates,
                callback: (value) => {
                  // Update the filterText's text
                  filterText.textContent = value.row.name;

                  // Update filter{}
                  filter.id = value.row.id;
                  filter.name = value.row.name;
                  filter.dates = value.dates;

                  // Update sectionFIlters's attribute
                  sectionFilters.setAttribute("filterStatus", "active")

                  // Update dataFilters.filterDate
                  dataFilters.filterDate = value.dates

                  // Render sectionTransactions
                  renderSectionTransactions()
                },
              });
            });

            appendHTML([filterHeading, filterText, filterTextIcon], filterDate);
            return filterDate;
          })();

          // Filter: Transactions Category
          const filterCategory = (() => {
            const filterCategory = createHTML("div", { class: "filter filter-category" });

            let selectedCategories = pFilterCategories ? pFilterCategories : [];

            const filterHeading = createHTML("p", { class: "filter-heading" }, "Categories: ");

            const filterText = createHTML("p", { class: "filter-text" });
            if (selectedCategories.length > 0) appendHTML(compFilteredIcons(selectedCategories), filterText)
            else filterText.innerHTML = "All";


            const filterTextIcon = createHTML("i", { class: "ph-bold ph-caret-right" });

            // Event Listener on filterCategory
            filterCategory.addEventListener("click", () => {
              subPageCategoryPicker({
                pHeading: "Select Category",
                pMode: "select",
                pSelectMultiple: true,
                pPreSelected: selectedCategories.map(category => category?.id),
                pCallback: (value) => {
                  // Update selectedCategories []
                  selectedCategories = value;

                  // Update filterText's innerHTML
                  filterText.innerHTML = "";
                  appendHTML(compFilteredIcons(value), filterText)

                  // Update dataFilters.filterCategory
                  dataFilters.filterCategory = value;

                  // Render sectionTransactions
                  renderSectionTransactions()
                }
              });
            });

            appendHTML([filterHeading, filterText, filterTextIcon], filterCategory);
            return filterCategory;
          })();

          // Filter: Transactions Category
          const filterWallet = (() => {
            const filterWallet = createHTML("div", { class: "filter filter-wallet" });

            let selectedWallets = pFilterWallets ? pFilterWallets : [];

            const filterHeading = createHTML("p", { class: "filter-heading" }, "Wallets: ");

            const filterText = createHTML("p", { class: "filter-text" });
            if (selectedWallets.length > 0) appendHTML(compFilteredIcons(selectedWallets), filterText)
            else filterText.innerHTML = "All";

            const filterTextIcon = createHTML("i", { class: "ph-bold ph-caret-right" });

            // Event Listener on filterWallet
            filterWallet.addEventListener("click", () => {
              subPageWalletPicker({
                selectMultiple: true,
                showInactiveWallets: true,
                selectedWalletIds: selectedWallets.map(wallet => wallet.id),
                callback: (value) => {
                  // Update selectedCategories []
                  selectedWallets = value;

                  // Update filterText's innerHTML
                  filterText.innerHTML = "";
                  appendHTML(compFilteredIcons(value), filterText)

                  // Update dataFilters.filterCategory
                  dataFilters.filterWallet = value;

                  // Render sectionTransactions
                  renderSectionTransactions()
                }
              });
            });

            appendHTML([filterHeading, filterText, filterTextIcon], filterWallet);
            return filterWallet;
          })();

          appendHTML([filterDate, filterCategory, filterWallet], sectionFiltersWrapper);
          appendHTML([sectionFiltersHeading, sectionFiltersWrapper], sectionFilters)
          return sectionFilters;
        })();

        // Section Net Balance
        const sectionNetBalance = (() => {
          const sectionNetBalance = createHTML("section", { class: "section-net-balance" });

          const totalIncomeHeading = createHTML("p", { class: "income" }, "Total Income");
          const toatlIncome = createHTML("p", { balanceStatus: "positive" }, "0 Rs");

          const totalExpenseHeading = createHTML("p", { class: "expense" }, "Total Expense");
          const totalExpense = createHTML("p", { balanceStatus: "negative" }, "0 Rs");

          appendHTML([toatlIncome], totalIncomeHeading);
          appendHTML([totalExpense], totalExpenseHeading);
          appendHTML([totalIncomeHeading, totalExpenseHeading], sectionNetBalance);
          return {
            sectionNetBalance: sectionNetBalance,
            toatlIncome: toatlIncome,
            totalExpense: totalExpense,
          };
        })();

        // Function render section transactions
        function renderSectionTransactions() {
          body.querySelector(".section-transactions")?.remove();

          const sectionTransactions = createHTML("section", { class: "section-transactions" });

          // Filter transactions based on filter(s) provided
          const filteredDataTransactions = pTransactions ? pTransactions :
            getTransactions({
              based: "date",
              basedIds: dataFilters.filterDate,
              filters: {
                categoryId: dataFilters.filterCategory.map(category => category?.id),
                walletId: dataFilters.filterWallet.map(wallet => wallet?.id)
              }
            })

          // Store compTransactionsRow HTML
          let transactionsRowsHTML = [];

          // Store Total balance
          let totalIncome = 0;
          let totalExpense = 0

          // Create and push compTransactionsRow in transactionRows[]
          for (const date of dataFilters.filterDate) {
            const row = compTransactionsRow({
              pDate: date,
              pTransactions: filteredDataTransactions,
              pCallback: () => {
                renderSectionTransactions();

                if (pCallback && typeof pCallback === "function") {
                  pCallback()
                }
              }
            });

            if (typeof row === "object") {
              // Push row.HTML in transactionsRowsHTML
              transactionsRowsHTML.push(row.html);

              // Update total balance data
              totalIncome += row.totalIncome;
              totalExpense += row.totalExpense;

            }

          }

          // Update section netBalance's data
          sectionNetBalance.toatlIncome.textContent = formatAmount(totalIncome);
          sectionNetBalance.totalExpense.textContent = formatAmount(totalExpense);

          // Conditionaly append element in sectionTransactions
          appendHTML(
            transactionsRowsHTML.length > 0 ? transactionsRowsHTML : compNotFound("No Transaction Found."),
            sectionTransactions
          );

          appendHTML(sectionTransactions, body);
        }

        appendHTML([sectionFilters, sectionNetBalance.sectionNetBalance], body);

        // Render Section Transactions
        renderSectionTransactions()

        // Section Search
        const sectionSearch = (() => {
          const sectionSearch = createHTML("section", { class: "section-search search-wrapper" });

          const searchInput = createHTML("input", { type: "search", placeholder: "Search" });

          searchInput.addEventListener("input", (e) => {
            const transactionsRows = Array.from(body.querySelectorAll(".section-transactions .transactions-row"));
            const transactionRows = Array.from(body.querySelectorAll(".section-transactions .transaction-row"));

            searchData(e.target.value, transactionRows);

            transactionsRows.forEach(transactionsRow => {
              const children = transactionsRow.querySelectorAll(".transaction-row");
              const hiddenChild = Array.from(children).filter(child => child.classList.contains("search-hide"));

              transactionsRow.classList.toggle("search-hide", hiddenChild.length === children.length);
            });
          });

          appendHTML(searchInput, sectionSearch)
          body.insertBefore(sectionSearch, body.firstChild)
        })()

        return body;
      })();

      appendHTML([header, body], pageWrapper);
      return pageWrapper;
    })();

    // Append
    appendHTML(pageWrapper, page);

    return page;
  }
}