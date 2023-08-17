import { compNotFound, compTransactionRow, compTransactionsRow } from "../../components.js";
import { dbTransactions, dbAppSettings, dbCategories } from "../../db.js";
import { appendHTML, createHTML, formatAmount, getDates, getTransactions, popMsg, saError, sentenceCase, sortTransaction } from "../../helper.js";
import { subPageTransactionHistory } from "./sub-pages/subPageTransactionHistory.js";
import { subPageDatePicker } from './sub-pages/subPageDatePicker.js';
import { subPageCustomizeDashboard } from "./sub-pages/subPageCustomizeDashboard.js";

// setTimeout(() => subPageCustomizeDashboard({}))

export function pageDashboard() {
  try {
    const pageDashboard = createHTML("div", { class: "page page-dashboard" });

    // Page Header
    const header = () => {
      const header = createHTML("div", { class: "header" });

      // Row 1
      const row1 = createHTML("div", { class: "row-1" });
      const userName = createHTML("span", { class: "user-name" }, `Hi ${dbAppSettings.userName}! Sa`);
      const refreshBtn = createHTML("i", { class: "ph-bold ph-arrows-clockwise" });

      refreshBtn.addEventListener("click", () => popMsg("Refreshing app...", "warning").then(() => location.reload()));

      appendHTML([userName, refreshBtn], row1);

      // Row 2
      const row2 = createHTML("div", { class: "row-2" });
      const account = createHTML("div", { class: "account" });
      const accountReport = createHTML("span", { class: "report btn-link" }, "Total balance");

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
          if (transaction.entryType === "expense" || transaction.entryType === "lend") {
            // Add amount in totalExpenseAmount
            totalExpenseAmount += transaction.amount;

            const isExist = expenseCategories.find(category => category?.categoryObject?.id === transaction.categoryId);

            if (isExist) {
              isExist.totalCategoryAmount += transaction.amount;
            }
            else {
              expenseCategories.push({
                categoryObject: dbCategories[transaction.entryType].find(category => category?.id === transaction.categoryId),
                totalCategoryAmount: transaction.amount
              });
            }

          }


          // For Incomes
          else if (transaction.entryType === "income" || transaction.entryType === "borrow") {
            // Add amount in totalIncomeAmount
            totalIncomeAmount += transaction.amount

            const isExist = incomeCategories.find(category => category?.categoryObject?.id === transaction.categoryId);

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

      const today = new Date();

      const colorGreen = getComputedStyle(document.documentElement).getPropertyValue("--c-green-100");
      const colorRed = getComputedStyle(document.documentElement).getPropertyValue("--c-red-100");
      const colorText = getComputedStyle(document.documentElement).getPropertyValue("--c-black-90");
      const currency = getComputedStyle(document.documentElement).getPropertyValue("--currency");

      // Function Render Report Section's Heading
      const renderReportSectionHeading = (title, callback) => {
        const heading = createHTML("p", { class: "heading-wrapper" });
        const headingText = createHTML("p", { class: "section-heading" }, title);

        let dateFilter = {
          id: "thisMonth",
          name: "This Month",
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

              if (callback && typeof callback === "function") {
                callback(transactions)
              }
            }
          })

        })

        appendHTML([headingText, headingDateFilter], heading)
        return heading
      }

      // Function Render Doughnut Chart
      const renderReportDoughnutChart = (labels, data, categoryObjects) => {
        // Chart Canvas
        const chartWrapper = createHTML("div", { class: "chart" });
        const chartCanvas = createHTML("canvas");

        const saChart = new Chart(chartCanvas, {
          type: 'doughnut',
          data: {
            labels: labels,
            datasets: [{
              data: data,
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
                          text: ` ${label} (${formatAmount(value)} ${currency.replace(/"/g, '')}, ${percentage}%)`,
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

        // Add a click event listener to the chart
        saChart.canvas.addEventListener('click', function (evt) {
          const clickedElement = saChart.getElementsAtEventForMode(evt, 'nearest', { intersect: true }, true)[0];

          if (clickedElement) {
            const clickedElementIndex = clickedElement.index;
            const clickedCategory = categoryObjects[clickedElementIndex];

            // Render subPageTransactionHistory
            subPageTransactionHistory({
              pFilterCategories: [clickedCategory],
              pCallback: reRenderPage
            })
          }
        });


        appendHTML(chartCanvas, chartWrapper)
        return chartWrapper
      }

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

            if (row) {
              transactionRows.push(row.html)
            }
          }

          if (transactionRows.length === 0) {
            appendHTML(compNotFound("No recent transaction, please add one."), wrapper)
          } else {
            // Wrapper View more button
            const viewMore = createHTML("button", { class: "btn-link" }, "View All Transactions");

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
        return {
          sectionFunction: "sectionRecentTransactions",
          html: sectionRecentTransactions
        };
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
            basedIds: getDates(new Date(today.getFullYear(), today.getMonth(), 1), new Date(today.getFullYear(), today.getMonth() + 1, 0))
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
        const heading = renderReportSectionHeading("Report: Income vs Expense", (transactions) => appendHTML(wrapper(transactions), sectionReportIncomeExpense));

        appendHTML([heading, wrapper()], sectionReportIncomeExpense)
        return {
          sectionFunction: "sectionReportIncomeExpense",
          html: sectionReportIncomeExpense
        }
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
            basedIds: getDates(new Date(today.getFullYear(), today.getMonth(), 1), new Date(today.getFullYear(), today.getMonth() + 1, 0))
          });

          const data = iterateTransactions(transactions);

          // Chart
          const chart = renderReportDoughnutChart(
            data.incomeCategories.map(category => sentenceCase(category.categoryObject?.name)),
            data.incomeCategories.map(category => category.totalCategoryAmount),
            data.incomeCategories.map(category => category.categoryObject)
          );

          // Append
          if (data.totalExpenseAmount === 0 && data.totalIncomeAmount === 0) {
            appendHTML(compNotFound("No data found."), wrapper)
          } else {
            appendHTML(chart, wrapper)
          }
          return wrapper
        }

        // Section Heading
        const heading = renderReportSectionHeading("Report: Incomes", (e) => appendHTML(wrapper(e), sectionReportIncomes));

        appendHTML([heading, wrapper()], sectionReportIncomes)
        return {
          sectionFunction: "sectionReportIncomes",
          html: sectionReportIncomes
        }
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
            basedIds: getDates(new Date(today.getFullYear(), today.getMonth(), 1), new Date(today.getFullYear(), today.getMonth() + 1, 0))
          });

          const data = iterateTransactions(transactions);

          // Chart
          const chart = renderReportDoughnutChart(
            data.expenseCategories.map(category => sentenceCase(category.categoryObject?.name)),
            data.expenseCategories.map(category => category.totalCategoryAmount),
            data.expenseCategories.map(category => category.categoryObject)
          );

          // Append
          if (data.totalExpenseAmount === 0 && data.totalIncomeAmount === 0) {
            appendHTML(compNotFound("No data found."), wrapper)
          } else {
            appendHTML(chart, wrapper)
          }
          return wrapper
        }

        // Section Heading
        const heading = renderReportSectionHeading("Report: Expenses", (transactions) => appendHTML(wrapper(transactions), sectionReportExpenses));

        appendHTML([heading, wrapper()], sectionReportExpenses)
        return {
          sectionFunction: "sectionReportExpenses",
          html: sectionReportExpenses
        }
      }

      // Section: Customize Overview
      const sectionCustomizeDashboard = () => {
        const sectionCustomizeDashboard = createHTML("section", { class: "section-customize-dashboard" });

        const button = createHTML("button", { class: "btn btn-disable", style: "width: 100%" }, "Customize my dashboard");

        button.addEventListener("click", () => {
          subPageCustomizeDashboard((e) => {
            reRenderPage()
          })
        })

        appendHTML(button, sectionCustomizeDashboard)
        return sectionCustomizeDashboard
      }

      // Append
      const sections = [sectionReportIncomes(), sectionReportExpenses(), sectionReportIncomeExpense(), sectionRecentTransactions()];

      for (const sequence of dbAppSettings.pageDashboardSectionSequence) {
        const section = sections.find(value => value.sectionFunction === sequence.sectionFunction && sequence.sectionActive === true);
        if (section) {
          appendHTML(section.html, body)
        }
      }

      appendHTML(sectionCustomizeDashboard(), body)
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