// Section: Reports
const reports = () => {
    const reports = createHTML("section", { class: "section-reports" });

    // Section Heading
    const heading = createHTML("p", { class: "section-heading" }, "Report: Income vs Expense");

    const wrapper = () => {
        const wrapper = createHTML("div", { class: "section-wrapper" });

        // ===========================================================================
        const colorGreen = getComputedStyle(document.documentElement).getPropertyValue("--c-green-100");
        const colorRed = getComputedStyle(document.documentElement).getPropertyValue("--c-red-100");

        const reportIncomeExpense = createHTML("div", { class: "report-income-expense" });

        const reportIncomeExpenseCanvas = createHTML("canvas", { class: "report-income-expense-canvas" });

        new Chart(reportIncomeExpenseCanvas, {
            type: 'bar',
            data: {
                labels: ['Income', 'Expense'],
                datasets: [
                    {
                        data: [12, 19],
                        backgroundColor: [colorGreen, colorRed],
                    }
                ]
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
                        offset: false,
                        grid: {
                            offset: false
                        }
                    }
                },
                layout: {
                    padding: 0
                }
            }
        });

        const reportIncomeExpenseInfo = createHTML("div", { class: "report-income-expense-info" });

        const reportIncomeExpenseInfoIncome = createHTML("p", { class: "report-income-expense-info-income", value: "100" }, "Income");
        const reportIncomeExpenseInfoExpense = createHTML("p", { class: "report-income-expense-info-expense", value: "100" }, "Expence");
        const reportIncomeExpenseInfoTotal = createHTML("p", { class: "report-income-expense-info-total", value: "100" });

        appendHTML([reportIncomeExpenseInfoIncome, reportIncomeExpenseInfoExpense, reportIncomeExpenseInfoTotal], reportIncomeExpenseInfo)
        appendHTML([reportIncomeExpenseCanvas, reportIncomeExpenseInfo], reportIncomeExpense)


        // ===========================================================================

        appendHTML([reportIncomeExpense], wrapper)
        return wrapper
    }

    appendHTML([heading, wrapper()], reports)
    return reports
}