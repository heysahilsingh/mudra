import { subPageAddTransaction } from "./app-container/app-pages/sub-pages/subPageAddTransaction.js";
import { dbCategories, dbTransactions, dbAppSettings, dbWallets, } from "./db.js";
import { appendHTML, createHTML, dialogBoxClose, dialogBoxOpen, formatAmount, formatDate, saError, sortTransaction, } from "./helper.js";

// COMPONENT - TRANSACTION ROW
export function compTransactionRow(pObject) {
  /* IMPORTANT NOTES:
    1. To invoke this function, use compTransactionRow({}).
    2. Specify the transaction type and ID as follows: {pTransactionType: "expense"/"income"/"lend"/"borrow", pTransactionId: "ID of the transaction"}.
    3. To execute a callback function after closing subPageAddTransaction(), provide {pCallback: "your callback function"}.
  */

  try {
    // Destructer pObject
    const { pTransactionType, pTransactionId, pCallback } = pObject;

    // Find the right transaction from dbTransactions
    const transaction = dbTransactions[pTransactionType]?.find(obj => obj.id === pTransactionId);

    if (transaction) {
      // Find the right category from dbCategories
      const category = dbCategories[transaction.entryType]?.find(obj => obj.id === transaction.categoryId);

      // Find the right wallet from dbWallets
      const wallet = dbWallets.find(wallet => wallet.id === transaction.walletId);

      // Build Transaction Row HTML
      const transactionRow = createHTML("div", { class: "transaction-row", type: transaction.entryType });
      const transactionRowWrapper = createHTML("div", { class: `transaction-row-wrapper icon ${category?.icon}` });

      transactionRow.addEventListener("click", () => {
        subPageAddTransaction({
          pEditTransaction: transaction,
          pCallback: () => {
            if (pCallback && typeof pCallback === "function") {
              pCallback()
            }
          }
        })
      })

      // Detail-1
      const detail1 = createHTML("div", { class: "detail-1" });
      const transactionCategory = createHTML("p", { class: "transaction-category" }, category?.name);
      const transactionDescription = createHTML("p", { class: "transaction-description" }, transaction.description);
      const transactionDate = createHTML("p", { class: "transaction-date" }, formatDate(transaction.date).date);

      appendHTML([transactionCategory, transactionDescription, transactionDate], detail1);

      // Detail-2
      const detail2 = createHTML("div", { class: "detail-2" });
      const transactionAmount = createHTML("span", { class: "transaction-amount" }, `${formatAmount(transaction.amount)} ${dbAppSettings.userCurrency}`);
      const transactionWallet = createHTML("span", { class: `transaction-wallet icon ${wallet?.icon}` }, wallet?.name);

      appendHTML([transactionAmount, transactionWallet], detail2);

      appendHTML([detail1, detail2], transactionRowWrapper);
      appendHTML(transactionRowWrapper, transactionRow);

      return {
        html: transactionRow,
        transaction: transaction,
        category: category,
        wallet: wallet,
      };
    }
  } catch (error) {
    saError(error, "Transaction Type or Id not found.");
  }
}

// COMPONENT - TRANSACTIONS ROW
export function compTransactionsRow(pObject) {
  /* IMPORTANT NOTES:
    1. To invoke this function, use compTransactionsRow({}).
    2. Specify the date for printing transactions as {pDate: "dd mmmm yyyy"}.
    3. Print selected transactions by passing an array of transaction objects as {pTransactions: ["array of transaction's object."]}.
    4. To execute a callback function after closing subPageAddTransaction(), provide {pCallback: "your callback function"}.
  */
  try {
    // Desttructure pObject
    const { pDate, pTransactions, pCallback } = pObject;

    // Important Variables
    let transactionsArray = [];
    let totalIncome = 0;
    let totalExpense = 0;
    let categories = [];
    let wallets = [];
    let htmlTransactionRows = [];

    // Populate transactionsArray[]
    if (pTransactions && Array.isArray(pTransactions)) {
      for (const transaction of pTransactions) {
        if (typeof transaction === "object") {
          if (formatDate(transaction.date).date === formatDate(pDate).date) {
            transactionsArray.push(transaction);
          }
        }
      }
    } else {
      for (const key in dbTransactions) {
        for (const transaction of dbTransactions[key]) {
          if (formatDate(transaction.date).date === formatDate(pDate).date) {
            transactionsArray.push(transaction);
          }
        }
      }
    }

    // Print Transactions Row HTML
    if (transactionsArray.length > 0) {
      // Create Transactions Row Div
      const transactionsRow = createHTML("div", { class: "transactions-row" });

      // Data of Transactions Row
      const data = (() => {
        const data = createHTML("div", { class: "data expanded" });

        // Append transaction Row
        const sortedTransactionsArray = sortTransaction(transactionsArray, "date", "asc");

        sortedTransactionsArray.forEach((transaction) => {
          // Create HTML
          const row = compTransactionRow({
            pTransactionType: transaction.entryType,
            pTransactionId: transaction.id,
            pCallback: () => {
              if (pCallback && typeof pCallback === "function") {
                pCallback()
              }
            }
          });

          // Push the HTML to htmlTransactionRows[]
          htmlTransactionRows.push(row)

          // Update the categories[] and wallets[]
          function checkAndPush(array, item) {
            if (!array.some((obj) => obj.id === item.id)) {
              array.push(item);
            }
          }

          checkAndPush(categories, row.category);
          checkAndPush(wallets, row.wallet);

          // Update the transaction amount
          if (transaction.entryType === "income" || transaction.entryType === "borrow") totalIncome += Number(row.transaction.amount);
          else if (transaction.entryType === "expense" || transaction.entryType === "lend") totalExpense += Number(row.transaction.amount);

          appendHTML(row.html, data);
        });

        return data;
      })();

      // Handler of Transactions Row
      const handler = (() => {
        const handler = createHTML("div", { class: "handler" });

        // Date
        const date = (() => {
          const date = createHTML("div", { class: "date" });
          // Day of Month
          const dayOfMonth = createHTML("p", { class: "day-of-month" }, formatDate(pDate).dayOfMonth);
          // Day Wrapper
          const dayWrapper = (() => {
            const dayWrapper = createHTML("div", { class: "day-wrapper" });
            const day = createHTML("p", { class: "day" }, formatDate(pDate).day);
            const date = createHTML("p", { Class: "date" }, formatDate(pDate).date.slice(3));

            appendHTML([day, date], dayWrapper);
            return dayWrapper;
          })();

          appendHTML([dayOfMonth, dayWrapper], date);
          return date;
        })();

        // Total Amount
        const totalAmount = (() => {
          const totalAmount = createHTML("div", { class: "total-amount" });

          let amount = [];

          if (totalIncome > 0) {
            const tIncome = createHTML("p", { class: "total-income" }, `${formatAmount(totalIncome)} ${dbAppSettings.userCurrency}`);
            amount.push(tIncome);
          }

          if (totalExpense > 0) {
            const tExpense = createHTML("p", { class: "total-expense" }, `${formatAmount(totalExpense)} ${dbAppSettings.userCurrency}`);
            amount.push(tExpense);
          }

          appendHTML(amount, totalAmount);
          return totalAmount;
        })();

        // Handler Event
        handler.addEventListener("click", () => {
          data.classList.toggle("expanded");
          data.classList.toggle("collapse");
        });

        appendHTML([date, totalAmount], handler);
        return handler;
      })();

      // Append and Return
      appendHTML([handler, data], transactionsRow);
      return {
        html: transactionsRow,
        htmlTransactionRows: htmlTransactionRows,
        totalIncome: totalIncome,
        totalExpense: totalExpense,
        categories: categories,
        wallets: wallets,
      };
    }
  } catch (error) {
    saError(error, "Some problem while running compTransactionsRow().");
  }
}

// COMPONENT - NOT FOUND
export function compNotFound(msg) {
  const notFound = createHTML("p", { class: "not-found-data" });

  const icon = createHTML("i", { class: "ph-fill ph-smiley-sad" });
  const text = createHTML("p", {}, msg);

  appendHTML([icon, text], notFound);
  return notFound;
}

// COMPONENT - DATE PICKER
export function compDatePicker(parameter) {
  /*
  IMPORTANT NOTES TO BE NOTED
   1. To call this function use comDatePicker({})
   2. It is necessary to pass "type" property {type: "single"/"multiple"/"range"}
   3. To pass predefined dates pass this property {dates: [this will be an array of dates]}
   3.1. To pass predefined dates of type: "single" {dates: ["dd mmmm yyyy"]}
   3.2. To pass predefined dates of type: "multiple" {dates: ["dd mmmm yyyy", "dd mmmm yyyy", "dd mmmm yyyy"....]}
   3.3. To pass predefined dates of type: "range" {dates: ["from-to" / "dd mmmm yyyy-dd mmm yyyy"]}
   4. To run callback function, pass this property {callback: "your function"}
   4.1 type="single", callback would have an object of seleced date. Then you can extract the selected date array by value.date.
   4.2 type="multiple callback would have an object of selected dates. Then you can extract the selected dates array by value.dates.
   4.3 type="range callback would have an object of selected dates. Then you can extract the selected dates array by value.dateFrom and value.dateTo
*/

  const { type, dates, callback } = parameter;

  const datePicker = createHTML("div", { class: "date-picker" });
  const input = createHTML("input", { class: "duDatepicker-input", type: "hidden" });
  appendHTML(input, datePicker);
  dialogBoxOpen(datePicker);

  // Setting default config of duDatepicker()
  duDatepicker.defaults({
    root: datePicker,
    format: "dd mmmm yyyy",
    cancelBtn: true,
    overlayClose: false,
    priorYears: 10,
    laterYears: 10,
    events: {
      hidden: () => {
        dialogBoxClose(datePicker);
      },
    },
  });

  // Conditionally render datePicker HTML based on type
  // Type = "single"
  if (type === "single") {
    duDatepicker(input, "show");
    if (dates && Array.isArray(dates)) duDatepicker(input, "setValue", dates[0]);
  }

  // Type = "multiple"
  else if (type === "multiple") {
    duDatepicker(input, { multiple: true });
    duDatepicker(input, "show");
    if (dates && Array.isArray(dates)) duDatepicker(input, "setValue", dates);
  }

  // Type = "range"
  else if (type === "range") {
    duDatepicker(input, { range: true });
    duDatepicker(input, "show");
    if (dates && Array.isArray(dates)) duDatepicker(input, "setValue", dates[0]);
  }

  // After clicking "Ok"
  input.addEventListener("datechanged", function (e) {
    if (callback && typeof callback === "function") {
      callback(e.data);
    }
  });
}

// COMPONENT - CONFIRM DIALOG BOX
export function compConfirmDialogBox(pObject) {
  /* IMPORTANT NOTES TO BE NOTED
  1. To invoke this function, compComfirmDialogBoc({}).
  3. You can set a css id to box, {pBoxId: "id"}.
  2. To show mesage, {pMessage: "Message"}.
  3. You can set the cancel button text, {pButton1: "Text of the button"}.
  4. You can set the ok button text, {pButton2: "Text of the button"}.
  5. To run a callback function after clicking on ok or second button, {pCallback: "your callback function."}
  */
  // Destructure pObject argument
  const { pMessage, pButton1, pButton2, pBoxId, pCallback } = pObject;

  // Wrapper
  const wrapper = createHTML("div", { class: "confirm-dialog-box", id: pBoxId ? pBoxId : "" });

  // Icon
  const Icon = createHTML("i", { class: "ph-fill ph-warning" });

  // Message
  const message = createHTML("p", { class: "message" }, pMessage ? pMessage : "");

  // Buttons
  const buttons = createHTML("div", { class: "buttons" });
  const button1 = createHTML("button", { class: "button-1 btn-link-red" }, pButton1 ? pButton1 : "Cancel");
  const button2 = createHTML("button", { class: "button-2 btn-link" }, pButton2 ? pButton2 : "Ok");

  // Event Listener on Buttons
  button1.addEventListener("click", () => {
    dialogBoxClose(wrapper)
  })

  button2.addEventListener("click", () => {
    dialogBoxClose(wrapper);

    if (pCallback && typeof pCallback === "function") pCallback();
  })

  appendHTML([button1, button2], buttons)
  appendHTML([Icon, message, buttons], wrapper)

  dialogBoxOpen(wrapper)
}


// COMPONENT - FILTERED ICONS
export function compFilteredIcons(data) {
  /* IMPORTANT NOTES TO BE OBSERVED
    1. The "data" parameter expects an array of objects. These objects can be of any type, as long as they have an "icon" property.
    2. The function returns an HTML node.
  */

  const filteredIconsWrapper = createHTML("div", { class: "filtered-icons-wrapper" });
  const icons = data.map(obj => obj.icon);

  const iconsHTMLArray = icons.slice(0, 6).map(icon => createHTML("i", { class: `icon ${icon}` }));

  iconsHTMLArray.forEach(icon => appendHTML(icon, filteredIconsWrapper));

  if (iconsHTMLArray.length < icons.length) {
    const remainingIcons = icons.length - iconsHTMLArray.length;
    const more = createHTML("p", {}, `+${remainingIcons} more`);
    appendHTML(more, filteredIconsWrapper);
  }

  return filteredIconsWrapper;
}