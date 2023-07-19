import { compNotFound, compTransactionRow, compTransactionsRow } from "../../components.js";
import { dbTransactions, dbAppSettings, dbCategories } from "../../db.js";
import { appendHTML, createHTML, formatAmount, getDates, getTransactions, popMsg, saError, sentenceCase, sortTransaction } from "../../helper.js";
import { subPageTransactionHistory } from "./sub-pages/subPageTransactionHistory.js";
import { subPageDatePicker } from './sub-pages/subPageDatePicker.js';

export function pageDashboard() {
  try {
    const pageDashboard = createHTML("div", { class: "page page-dashboard" });

    // Page Header
    const header = () => {
      const header = createHTML("div", { class: "header" });

      // Row 1
      const row1 = createHTML("div", { class: "row-1" });
      const userName = createHTML("span", { class: "user-name" }, `Hi ${dbAppSettings.userName}!`);
      const refreshBtn = createHTML("i", { class: "ph-bold ph-arrows-clockwise" });

      refreshBtn.addEventListener("click", () => popMsg("Refreshing app...", "warning").then(() => location.reload()));

      appendHTML([userName, refreshBtn], row1);

      // Row 2
      const row2 = createHTML("div", { class: "row-2" });
      const account = createHTML("div", { class: "account" });
      const accountReport = createHTML("span", { class: "report btn-link" }, "Total balance");
      const accountReportIcon = createHTML("i", { class: "ph-bold ph-caret-right" });

      appendHTML(accountReportIcon, accountReport);

      const accountBalance = createHTML(
        "span",
        { class: `ammount show ${(dbAppSettings.accountBalance < 0) ? "negative" : "positive"}` },
        formatAmount(dbAppSettings.accountBalance)
      );

      const eye = createHTML("i", { class: "ph-fill ph-eye" });

      eye.addEventListener("click", () => {
        eye.classList.toggle("ph-eye");
        eye.classList.toggle("ph-eye-slash");
        accountBalance.classList.toggle("show");
        accountBalance.classList.toggle("hidden");
        accountBalance.textContent = accountBalance.classList.contains("show") ? formatAmount(dbAppSettings.accountBalance) : "***00";
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

      // Helper function to iterate transactions
      function iterateTransactions(transactionsArray) {

        let totalIncomeAmount = 0;
        let totalExpenseAmount = 0;
        let expenseCategories = [];
        let incomeCategories = [];

        for (const transaction of transactionsArray) {
          // For Expenses
          if (transaction.entryType === "expense") {
            // Add amount in totalExpenseAmount
            totalExpenseAmount += transaction.amount;

            const isExist = expenseCategories.find(category => category.categoryObject.id === transaction.categoryId);

            if (isExist) {
              isExist.totalCategoryAmount += transaction.amount;
            }
            else {
              expenseCategories.push({
                categoryObject: dbCategories[transaction.entryType].find(category => category.id === transaction.categoryId),
                totalCategoryAmount: transaction.amount
              });
            }

          }


          // For Incomes
          else if (transaction.entryType === "income") {
            // Add amount in totalIncomeAmount
            totalIncomeAmount += transaction.amount

            const isExist = incomeCategories.find(category => category.categoryObject.id === transaction.categoryId);

            if (isExist) {
              isExist.totalCategoryAmount += transaction.amount;
            }
            else {
              incomeCategories.push({
                categoryObject: dbCategories[transaction.entryType].find(category => category.id === transaction.categoryId),
                totalCategoryAmount: transaction.amount
              });
            }
          }
        }

        return {
          totalIncomeAmount: totalIncomeAmount,
          totalExpenseAmount: totalExpenseAmount,
          incomeCategories: incomeCategories,
          expenseCategories: expenseCategories
        }
      }

      const colorGreen = getComputedStyle(document.documentElement).getPropertyValue("--c-green-100");
      const colorRed = getComputedStyle(document.documentElement).getPropertyValue("--c-red-100");
      const colorText = getComputedStyle(document.documentElement).getPropertyValue("--c-black-90");

      // Section: Recent Transactions
      const sectionRecentTransactions = () => {
        const sectionRecentTransactions = createHTML("section", { class: "section-recent-transactions" });

        // Section Heading
        const heading = createHTML("p", { class: "section-heading" }, "Recent Transactions");

        // Section Wrapper
        const wrapper = () => {
          const wrapper = createHTML("div", { class: "section-wrapper" });

          // Wrapper Transactions
          const transactions = createHTML("div", { class: "transactions" });

          let transactionRows = [];

          const sortedTransactions = sortTransaction([].concat(...Object.values(dbTransactions)), "date", "desc");

          for (const transaction of sortedTransactions.slice(0, 5)) {
            const row = compTransactionRow({
              pTransactionType: transaction.entryType,
              pTransactionId: transaction.id,
              pCallback: reRenderPage
            });

            transactionRows.push(row.html)
          }

          if (transactionRows.length === 0) {
            appendHTML(compNotFound("No recent transaction, please add one."), wrapper)
          } else {
            // Wrapper View more button
            const viewMore = createHTML("button", { class: "btn-link" }, "View Transactions");

            // Click Event on ViewMore
            viewMore.addEventListener("click", () => {
              subPageTransactionHistory({})
            })

            appendHTML(transactionRows, transactions)
            appendHTML([transactions, viewMore], wrapper);
          }

          return wrapper;
        };

        appendHTML([heading, wrapper()], sectionRecentTransactions);
        return sectionRecentTransactions;
      };

      // Section: Report Income vs Expense
      const sectionReportIncomeExpense = () => {
        const sectionReportIncomeExpense = createHTML("section", { class: "section-report-income-expense" });

        // Section wrapper
        const wrapper = (transactionsArray) => {
          sectionReportIncomeExpense.querySelector(".section-wrapper")?.remove();

          const wrapper = createHTML("div", { class: "section-wrapper" });

          const transactions = transactionsArray ? transactionsArray : getTransactions({
            based: "date",
            basedIds: getDates(dbAppSettings.firstTransaction, dbAppSettings.lasTransaction)
          });

          const data = iterateTransactions(transactions);

          // Chart Canvas
          const chart = createHTML("div", { class: "chart" });
          const chartCanvas = createHTML("canvas");

          const barChart = new Chart(chartCanvas, {
            type: 'bar',
            data: {
              labels: ["", ""],
              datasets: [{
                data: [data.totalIncomeAmount, data.totalExpenseAmount],
                backgroundColor: [colorGreen, colorRed],
              }]
            },
            options: {
              plugins: {
                legend: {
                  display: false
                }
              },
              scales: {
                y: {
                  display: false,
                },
                x: {
                  display: false,
                }
              },
              layout: {
                padding: 0,
              },
              barPercentage: 0.8,
              categoryPercentage: 1
            }
          });

          appendHTML(chartCanvas, chart)

          // Chart informations
          const chartInfo = createHTML("div", { class: "chart-info" });
          const chartInfoTotalIncome = createHTML("p", { class: "chart-info-income", value: `${formatAmount(data.totalIncomeAmount)}` }, "Income");
          const chartInfoTotalExpense = createHTML("p", { class: "chart-info-expense", value: `${formatAmount(data.totalExpenseAmount)}` }, "Expence");
          const chartInfoTotal = createHTML("p", { class: "chart-info-total" }, `${formatAmount(data.totalIncomeAmount - data.totalExpenseAmount)}`);

          appendHTML([chartInfoTotalIncome, chartInfoTotalExpense, chartInfoTotal], chartInfo)


          // Append data
          if (data.totalExpenseAmount === 0 && data.totalIncomeAmount === 0) {
            appendHTML(compNotFound("No data found."), wrapper)
          } else {
            appendHTML([chart, chartInfo], wrapper)
          }
          return wrapper
        }

        // Section Heading
        const heading = () => {
          const heading = createHTML("p", { class: "heading-wrapper" });
          const headingText = createHTML("p", { class: "section-heading" }, "Report: Income vs Expense");

          let dateFilter = {
            id: "allTime",
            name: "All Time",
            dates: ""
          };

          const headingDateFilter = createHTML("div", { class: "section-heading-filter" }, dateFilter.name);

          headingDateFilter.addEventListener("click", () => {
            subPageDatePicker({
              selectedListId: dateFilter.id,
              selectedListDates: dateFilter.dates,
              callback: (value) => {
                dateFilter.dates = value.rangeDates || value.dates;
                dateFilter.id = value.row.id;
                headingDateFilter.textContent = value.row.name;

                // Re render wrapper()
                const transactions = getTransactions({
                  based: "date",
                  basedIds: value.dates
                });

                appendHTML(wrapper(transactions), sectionReportIncomeExpense)
              }
            })

          })

          appendHTML([headingText, headingDateFilter], heading)
          return heading
        };

        appendHTML([heading(), wrapper()], sectionReportIncomeExpense)
        return sectionReportIncomeExpense
      }

      // Section: Report Income
      const sectionReportIncomes = () => {
        const sectionReportIncomes = createHTML("section", { class: "section-report-incomes" });

        // Section wrapper
        const wrapper = (transactionsArray) => {
          sectionReportIncomes.querySelector(".section-wrapper")?.remove();

          const wrapper = createHTML("div", { class: "section-wrapper" });

          const transactions = transactionsArray ? transactionsArray : getTransactions({
            based: "date",
            basedIds: getDates(dbAppSettings.firstTransaction, dbAppSettings.lasTransaction)
          });

          const data = iterateTransactions(transactions);

          // Chart Canvas
          const chart = createHTML("div", { class: "chart" });
          const chartCanvas = createHTML("canvas");

          const pieChart = new Chart(chartCanvas, {
            type: 'doughnut',
            data: {
              labels: data.incomeCategories.map(category => sentenceCase(category.categoryObject.name)),
              datasets: [{
                data: data.incomeCategories.map(category => category.totalCategoryAmount),
              }]
            },
            options: {
              plugins: {
                legend: {
                  display: true,
                  position: "bottom",
                  labels: {
                    usePointStyle: true,
                    textAlign: "center",
                    padding: 20,
                    generateLabels: function (chart) {
                      const data = chart.data;
                      if (data.labels.length && data.datasets.length) {
                        return data.labels.map((label, i) => {
                          const dataset = data.datasets[0];
                          const value = dataset.data[i];
                          const total = dataset.data.reduce((sum, num) => sum + num);
                          const percentage = ((value / total) * 100).toFixed(2);

                          return {
                            text: ` ${label} (${percentage}%)`,
                            fillStyle: dataset.backgroundColor[i],
                            hidden: isNaN(dataset.data[i]) || chart.getDatasetMeta(0).data[i].hidden,
                            index: i,
                            fontColor: colorText,
                            lineWidth: 0,
                          };
                        });
                      }
                      return [];
                    },
                  },
                }
              },
              borderWidth: 0
            }
          });

          appendHTML(chartCanvas, chart)

          // Append data
          if (data.totalExpenseAmount === 0 && data.totalIncomeAmount === 0) {
            appendHTML(compNotFound("No data found."), wrapper)
          } else {
            appendHTML(chart, wrapper)
          }
          return wrapper
        }

        // Section Heading
        const heading = () => {
          const heading = createHTML("p", { class: "heading-wrapper" });
          const headingText = createHTML("p", { class: "section-heading" }, "Report: Incomes");

          let dateFilter = {
            id: "allTime",
            name: "All Time",
            dates: []
          };

          const headingDateFilter = createHTML("div", { class: "section-heading-filter" }, dateFilter.name);

          headingDateFilter.addEventListener("click", () => {
            subPageDatePicker({
              selectedListId: dateFilter.id,
              selectedListDates: dateFilter.dates,
              callback: (value) => {
                dateFilter.dates = value.rangeDates || value.dates;
                dateFilter.id = value.row.id;
                headingDateFilter.textContent = value.row.name;

                // Re render wrapper()
                const transactions = getTransactions({
                  based: "date",
                  basedIds: value.dates
                });

                appendHTML(wrapper(transactions), sectionReportIncomes)
              }
            })

          })

          appendHTML([headingText, headingDateFilter], heading)
          return heading
        };

        appendHTML([heading(), wrapper()], sectionReportIncomes)
        return sectionReportIncomes
      }

      // Section: Report Income
      const sectionReportExpenses = () => {
        const sectionReportExpenses = createHTML("section", { class: "section-report-expenses" });

        // Section wrapper
        const wrapper = (transactionsArray) => {
          sectionReportExpenses.querySelector(".section-wrapper")?.remove();

          const wrapper = createHTML("div", { class: "section-wrapper" });

          const transactions = transactionsArray ? transactionsArray : getTransactions({
            based: "date",
            basedIds: getDates(dbAppSettings.firstTransaction, dbAppSettings.lasTransaction)
          });

          const data = iterateTransactions(transactions);

          // Chart Canvas
          const chart = createHTML("div", { class: "chart" });
          const chartCanvas = createHTML("canvas");

          const pieChart = new Chart(chartCanvas, {
            type: 'doughnut',
            data: {
              labels: data.expenseCategories.map(category => sentenceCase(category.categoryObject.name)),
              datasets: [{
                data: data.expenseCategories.map(category => category.totalCategoryAmount),
              }]
            },
            options: {
              plugins: {
                legend: {
                  display: true,
                  position: "bottom",
                  labels: {
                    usePointStyle: true,
                    textAlign: "center",
                    padding: 20,
                    generateLabels: function (chart) {
                      const data = chart.data;
                      if (data.labels.length && data.datasets.length) {
                        return data.labels.map((label, i) => {
                          const dataset = data.datasets[0];
                          const value = dataset.data[i];
                          const total = dataset.data.reduce((sum, num) => sum + num);
                          const percentage = ((value / total) * 100).toFixed(2);

                          return {
                            text: ` ${label} (${percentage}%)`,
                            fillStyle: dataset.backgroundColor[i],
                            hidden: isNaN(dataset.data[i]) || chart.getDatasetMeta(0).data[i].hidden,
                            index: i,
                            fontColor: colorText,
                            lineWidth: 0,
                          };
                        });
                      }
                      return [];
                    },
                  },
                }
              },
              borderWidth: 0
            }
          });

          appendHTML(chartCanvas, chart)

          // Append data
          if (data.totalExpenseAmount === 0 && data.totalIncomeAmount === 0) {
            appendHTML(compNotFound("No data found."), wrapper)
          } else {
            appendHTML(chart, wrapper)
          }
          return wrapper
        }

        // Section Heading
        const heading = () => {
          const heading = createHTML("p", { class: "heading-wrapper" });
          const headingText = createHTML("p", { class: "section-heading" }, "Report: Expenses");

          let dateFilter = {
            id: "allTime",
            name: "All Time",
            dates: []
          };

          const headingDateFilter = createHTML("div", { class: "section-heading-filter" }, dateFilter.name);

          headingDateFilter.addEventListener("click", () => {
            subPageDatePicker({
              selectedListId: dateFilter.id,
              selectedListDates: dateFilter.dates,
              callback: (value) => {
                dateFilter.dates = value.rangeDates || value.dates;
                dateFilter.id = value.row.id;
                headingDateFilter.textContent = value.row.name;

                // Re render wrapper()
                appendHTML(wrapper(), sectionReportExpenses)
              }
            })

          })

          appendHTML([headingText, headingDateFilter], heading)
          return heading
        };

        appendHTML([heading(), wrapper()], sectionReportExpenses)
        return sectionReportExpenses
      }

      // Section: Customize Overview
      const sectionCustomizeOverview = () => {
        const sectionCustomizeOverview = createHTML("section", { class: "section-customize-overview" });

        const button = createHTML("button", { class: "btn btn-disable", style: "width: 100%" }, "Customize my overview");

        appendHTML(button, sectionCustomizeOverview)
        return sectionCustomizeOverview
      }

      appendHTML([
        sectionReportIncomeExpense(),
        sectionReportIncomes(),
        sectionReportExpenses(),
        sectionRecentTransactions(),
        sectionCustomizeOverview()
      ], body);
      return body;
    };

    function reRenderPage() {
      pageDashboard.querySelector(".header")?.remove();
      pageDashboard.querySelector(".body")?.remove();
      appendHTML([header(), body()], pageDashboard)
    }

    // Append
    appendHTML([header(), body()], pageDashboard);
    return pageDashboard;
  } catch (error) {
    saError(error, "Error while executing pageDashboard().");
  }
}