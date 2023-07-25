import { consoleError, formatDate, getTransactions } from "./helper.js";

// Fallback Demo Data
const demoData = {
  dbAppSettings: {
    userName: null,
    userCurrency: "Rs",
    isLogged: false,
    accountBalance: setTimeout(dbUpdateAccountBalance),
    defaultWallet: null,
    defaultTransaction: "expense",
    firstTransaction: formatDate(new Date()).saveDate,
    lastTransaction: formatDate(new Date()).saveDate,
    themeColor: "#35A1FE",
    darkMode: true,
    pageDashboardSectionSequence: [
      {
        sectionName: "Report: Income vs Expense",
        sectionFunction: "sectionReportIncomeExpense",
        sectionActive: true
      },
      {
        sectionName: "Recent Transactions",
        sectionFunction: "sectionRecentTransactions",
        sectionActive: true
      },
      {
        sectionName: "Report: Expenses",
        sectionFunction: "sectionReportExpenses",
        sectionActive: true
      },
      {
        sectionName: "Report: Incomes",
        sectionFunction: "sectionReportIncomes",
        sectionActive: true
      },
    ]
  },
  dbTransactions: {
    lend: [],
    borrow: [],
    expense: [],
    income: []
  },
  dbCategories: {
    lend: [
      {
        id: "CAT_J3Z4K8d3Z1E9E7r61687611411968",
        name: "default (lend)",
        canEdit: false,
        isChild: false,
        parentId: null,
        icon: "icon-cat-87",
        entryType: "lend",
      }
    ],
    borrow: [
      {
        id: "CAT_x1N4l5g2H0y2Z4f61687611420453",
        name: "default (borrow)",
        canEdit: false,
        isChild: false,
        parentId: null,
        icon: "icon-cat-2",
        entryType: "borrow",
      }
    ],
    expense: [
      {
        id: "CAT_K8Y9d0k1v9m4q9Q81687611472105",
        name: "default (expense)",
        canEdit: false,
        isChild: false,
        parentId: null,
        icon: "icon-cat-104",
        entryType: "expense",
      }
    ],
    income: [
      {
        id: "CAT_x6e7s0f3x9D5m2O51687611467734",
        name: "default (income)",
        canEdit: false,
        icon: "icon-cat-86",
        entryType: "income",
      }
    ]
  },
  dbWallets: [
    // {
    //   id: "WALLET_T1c4d0S9h0o4A1E01687609709369",
    //   name: "demo wallet",
    //   icon: "icon-wallet-1",
    //   balance: 0,
    //   isActive: true,
    // }
  ]
}

// DB Transactions
export let dbAppSettings = getDB("dbAppSettings") ? getDB("dbAppSettings", true) : demoData.dbAppSettings

// // DB Transactions
export let dbTransactions = getDB("dbTransactions") ? getDB("dbTransactions", true) : demoData.dbTransactions

// // DB Categories
export let dbCategories = getDB("dbCategories") ? getDB("dbCategories", true) : demoData.dbCategories

// // DB Wallets
export let dbWallets = getDB("dbWallets") ? getDB("dbWallets", true) : demoData.dbWallets

// // DB Entry Type
export let dbEntryType = ["income", "borrow", "expense", "lend"];

// FUNCTION - RESET DATABASE
export function resetDb() {
  localStorage.clear();
  location.reload();
}

// FUNCTION - GET DB
export function getDB(item, parse) {
  if (parse === true) {
    return JSON.parse(localStorage.getItem(item));
  } else {
    return localStorage.getItem(item);
  }
}

// FUNCTION - UPDATE DATABASE
export function updateDb() {
  localStorage.clear();
  // Save db AppSettings
  saveDB("dbAppSettings", dbAppSettings, true);
  // Save db Transactions
  saveDB("dbTransactions", dbTransactions, true);
  // Save db Categories
  saveDB("dbCategories", dbCategories, true);
  // Save db Wallets
  saveDB("dbWallets", dbWallets, true);
  // Save db dbEntryTypee
  saveDB("dbEntryType", dbEntryType, true);
}

// FUNCTION - SAVE DB
export function saveDB(key, value, strigify) {
  if (strigify === true) {
    localStorage.setItem(key, JSON.stringify(value));
  } else {
    localStorage.setItem(key, value);
  }
}

// FUNCTION - DB SAVE CATEGORY
export function dbSaveCategory(pCategoryObject) {
  const isExist = dbCategories[pCategoryObject.entryType].find(category => category.id === pCategoryObject.id);
  if (isExist) {
    isExist.id = pCategoryObject.id;
    isExist.name = pCategoryObject.name;
    isExist.description = pCategoryObject.description;
    isExist.isChild = pCategoryObject.isChild;
    isExist.parentId = pCategoryObject.parentId;
    isExist.icon = pCategoryObject.icon;
    isExist.entryType = pCategoryObject.entryType;
  } else {
    dbCategories[pCategoryObject.entryType].push(pCategoryObject)
  }

  dbUpdateAccountBalance();
  updateDb();
}

// FUNCTION - DB DELETE CATEGORY
export function dbDeleteCategory(pCategoryObject) {
  // Retrieve the category list for easier access
  const categoryList = dbCategories[pCategoryObject.entryType];

  // Check if the category exists
  const isExist = categoryList.find(category => category.id === pCategoryObject.id);

  // Get transactions based on the category
  const thisCategoryTransactions = getTransactions({ based: "category", basedIds: [pCategoryObject.id] });

  if (isExist) {
    // Assign transactions to the parent or default category
    if (thisCategoryTransactions.length > 0) {
      thisCategoryTransactions.forEach(transaction => {
        transaction.categoryId = isExist.isChild ? isExist.parentId : categoryList[0].id;
      });
    }

    // If the category is a parent, assign child categories to the default category
    if (!isExist.isChild) {
      const thisCategoryChildCategories = categoryList.filter(childCategory => childCategory.parentId === pCategoryObject.id);

      if (thisCategoryChildCategories.length > 0) {
        thisCategoryChildCategories.forEach(childCategory => {
          childCategory.parentId = categoryList[0].id;
        });
      }
    }

    // Delete the category from the category list
    dbCategories[pCategoryObject.entryType] = categoryList.filter(category => category.id !== pCategoryObject.id);

    dbUpdateAccountBalance();
    updateDb();

  } else {
    consoleError("Category not found in database.");
  }
}

// FUNCTION - DB SAVE TRANSACTION
export function dbSaveTransaction(pTransactionObject) {
  // Transactions
  let oldTransaction = dbTransactions[pTransactionObject.entryType].find(transaction => transaction.id === pTransactionObject.id);
  const newTransaction = pTransactionObject;

  // Wallets
  const oldWallet = dbWallets.find(wallet => wallet.id === oldTransaction?.walletId);
  const newWallet = dbWallets.find(wallet => wallet.id === newTransaction.walletId);

  // If trying to edit an old transaction
  if (oldTransaction && oldWallet) {
    // Update Wallets
    // Update oldWallet
    if (oldWallet?.id === newWallet?.id) {

      if (newTransaction.entryType === "expense" || newTransaction.entryType === "lend") {
        oldWallet.balance += oldTransaction.amount;
        oldWallet.balance -= newTransaction.amount

      } else if (newTransaction.entryType === "income" || newTransaction.entryType === "borrow") {
        oldWallet.balance -= oldTransaction.amount;
        oldWallet.balance += newTransaction.amount
      }

    }
    // Update both old and new wallets
    else {

      if (newTransaction.entryType === "expense" || newTransaction.entryType === "lend") {
        oldWallet.balance += oldTransaction.amount;
        newWallet.balance -= newTransaction.amount;

      } else if (newTransaction.entryType === "income" || newTransaction.entryType === "borrow") {
        oldWallet.balance -= oldTransaction.amount;
        newWallet.balance += newTransaction.amount;
      }

    }

    // Update old transaction in dbTransactions.
    oldTransaction.id = newTransaction.id;
    oldTransaction.amount = newTransaction.amount;
    oldTransaction.description = newTransaction.description;
    oldTransaction.date = newTransaction.date;
    oldTransaction.categoryId = newTransaction.categoryId;
    oldTransaction.walletId = newTransaction.walletId;
    oldTransaction.entryType = newTransaction.entryType;

  }

  // If trying to add a new transaction
  else {
    // Update wallet
    if (newTransaction.entryType === "expense" || newTransaction.entryType === "lend") {
      newWallet.balance -= newTransaction.amount;;
    } else if (newTransaction.entryType === "income" || newTransaction.entryType === "borrow") {
      newWallet.balance += newTransaction.amount;
    }

    // Add transaction in dbTransaction
    dbTransactions[newTransaction.entryType].push(newTransaction)
  }

  dbAppSettings.lastTransaction = pTransactionObject.date;

  dbUpdateAccountBalance();
  updateDb();
}

// FUNCTION - DB DELETE TRANSACTION
export function dbDeleteTransaction(pTransactionObject) {
  const isExist = dbTransactions[pTransactionObject.entryType].find(transaction => transaction?.id === pTransactionObject.id);

  if (isExist) {
    const wallet = dbWallets.find(wallet => wallet?.id === pTransactionObject.walletId);

    // Reverse wallet balance
    if (pTransactionObject.entryType === "expense" || pTransactionObject.entryType === "lend") {
      wallet.balance += pTransactionObject.amount;

    } else if (pTransactionObject.entryType === "income" || pTransactionObject.entryType === "borrow") {
      wallet.balance -= pTransactionObject.amount;
    }

    dbTransactions[pTransactionObject.entryType] = dbTransactions[pTransactionObject.entryType].filter(transaction => {
      return transaction.id !== pTransactionObject.id;
    })

    dbUpdateAccountBalance();
    updateDb();

  } else {
    consoleError("Transaction not found in database.")
  }
}

// FUNCTION - DB SAVE WALLET  
export function dbSaveWallet(pWalletObject) {

  let isExist = dbWallets.find(wallet => wallet?.id === pWalletObject.id);

  if (isExist) {
    // Update wallet
    isExist.id = pWalletObject.id;
    isExist.name = pWalletObject.name;
    isExist.icon = pWalletObject.icon;
    isExist.balance = pWalletObject.balance;
    isExist.isActive = pWalletObject.isActive;

  } else {
    // Add wallet in dbWallets
    dbWallets.push(pWalletObject)
  }

  if(!dbAppSettings.defaultWallet){
    dbAppSettings.defaultWallet = pWalletObject.id;
  }

  dbUpdateAccountBalance();
  updateDb();
}
// FUNCTION - DB DELETE WALLET
export function dbDeleteWallet(pWalletObject) {
  const isExist = dbWallets.find(wallet => wallet?.id === pWalletObject.id);

  if (isExist) {

    // Delete the wallet
    dbWallets = dbWallets.filter(wallet => { return wallet?.id !== pWalletObject.id; })

    // Delete all transaction
    for (const transactions in dbTransactions) {
      dbTransactions[transactions] = dbTransactions[transactions].filter(transaction => { return transaction?.walletId !== pWalletObject.id; })
    }

    dbUpdateAccountBalance();
    updateDb();

  } else {
    consoleError("Wallet not found in database.")
  }
}

// FUNCTION - UPDATE ACCOUNT BALANCE
export function dbUpdateAccountBalance() {
  let totalBalance = 0
  for (const wallet of dbWallets) {
    if (wallet.isActive === true) {
      totalBalance += wallet.balance
    }
  }

  dbAppSettings.accountBalance = totalBalance;
  return totalBalance
}