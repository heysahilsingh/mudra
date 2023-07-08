import { consoleError, getTransactions } from "./helper.js";

export let dbUserDetails = {
  currency: "Rs",
  accountBalance: {
    balance: "5439",
    status: "positive",
  },
  userName: "Sahil",
  firstTransaction: "2-May-2023",
  lasTransaction: "4-August-2023",
};

export let dbTransactions = {
  lend: [
    {
      id: "TRANS_Y3M2S3R0Y4N0V0k416803988203",
      amount: "2831",
      description: "",
      date: "Sunday 28-June-2023 6:52 AM",
      categoryId: "CAT_J3Z4K8d3Z1E9E7r61687611411968",
      walletId: "WALLET_N0A6P3v4S4c1n5g216876hU624997",
      entryType: "lend",
    },
    {
      id: "TRANS_Y3M2S3R0Y4N0V0k51680003988203",
      amount: "4432",
      description: "",
      date: "Monday 26-June-2023 9:18 AM",
      categoryId: "CAT_J3Z4K8d3Z1E9E7r61687611411968",
      walletId: "WALLET_T1c4d0S9h0o4A1E01687609709369",
      entryType: "lend",
    },
    {
      id: "TRANS_Y3M2S3R0Y4N0V0k61680003988203",
      amount: "1798",
      description: "",
      date: "Tuesday 27-June-2023 1:37 PM",
      categoryId: "CAT_J3Z4K8d3Z1E9E7r61687611411968",
      walletId: "WALLET_N0A6P3v4S4c1n5g21687609724997",
      entryType: "lend",
    },
  ],
  borrow: [
    {
      id: "TRANS_Y3M2S3R0Y4N0V0k40500003988203",
      amount: "2119",
      description: "Random three-word description",
      date: "Sunday 25-June-2023 6:52 AM",
      categoryId: "CAT_x1N4l5g2H0y2Z4f61687611420453",
      walletId: "WALLET_T1c4d0S9h0o4A1E01687609709369",
      entryType: "borrow",
    },
    {
      id: "TRANS_Y3M2S3R0Y4N0V0k50500003988203",
      amount: "3668",
      description: "",
      date: "Monday 26-June-2023 9:18 AM",
      categoryId: "CAT_x1N4l5g2H0y2Z4f61687611420453",
      walletId: "WALLET_N0A6P3v4S4c1n5g216876hU624997",
      entryType: "borrow",
    },
  ],
  expense: [
    {
      id: "TRANS_Y3M2S3R0Y4N0V0k41687653988203",
      amount: "399",
      description: "this is a description",
      date: "Sunday 25-June-2023 6:52 AM",
      categoryId: "CAT_K8Y9d0k1v9m4q9Q81687611472105",
      walletId: "WALLET_T1c4d0S9h0o4A1E01687609709369",
      entryType: "expense",
    },
    {
      id: "TRANS_Y3M2S3R0Y4N0V0k51687653988203",
      amount: "456565",
      description: "",
      date: "Monday 26-June-2023 3:15 PM",
      categoryId: "CAT_s7T9E5d0P8e8L6N31687610425861",
      walletId: "WALLET_N0A6P3v4S4c1n5g216876hU624997",
      entryType: "expense",
    },
    {
      id: "TRANS_Y3M2S3R0Y4N0V0k61687653988203",
      amount: "754",
      description: "",
      date: "Tuesday 27-June-2023 9:23 AM",
      categoryId: "CAT_D2g1n0h0q8l8c8T31687610742935",
      walletId: "WALLET_T1c4d0S9h0o4A1E01687609709369",
      entryType: "expense",
    },
    {
      id: "TRANS_Y3M2S3R0Y4N0V0k71687653988203",
      amount: "322",
      description: "",
      date: "Monday 26-June-2023 2:41 PM",
      categoryId: "CAT_s7T9E5d0P8e8L6N31687610425861",
      walletId: "WALLET_T1c4d0S9h0o4A1E01687609709369",
      entryType: "expense",
    },
    {
      id: "TRANS_Y3M2S3R0Y4N0V0k81687653988203",
      amount: "489",
      description: "",
      date: "Thursday 29-June-2023 7:56 AM",
      categoryId: "CAT_d6R0T8k4O0z5x7I91687610754151",
      walletId: "WALLET_T1c4d0S9h0o4A1E01687609709369",
      entryType: "expense",
    },
    {
      id: "TRANS_Y3M2S3R0Y4N0V0k91687653988203",
      amount: "647",
      description: "",
      date: "Friday 30-June-2023 4:29 PM",
      categoryId: "CAT_p2m2H1U9a7R5g4D01687610763912",
      walletId: "WALLET_N0A6P3v4S4c1n5g21687609724997",
      entryType: "expense",
    },
    {
      id: "TRANS_Y3M2S3R0Y4N0V0k10168765398820",
      amount: "234",
      description: "",
      date: "Saturday 1-July-2023 11:08 AM",
      categoryId: "CAT_J3T8f9S3i9c6B8F81687610773855",
      walletId: "WALLET_N0A6P3v4S4c1n5g216876hU624997",
      entryType: "expense",
    },
    {
      id: "TRANS_Y3M2S3R0Y4N0V0k11168765398820",
      amount: "125",
      description: "",
      date: "Sunday 2-July-2023 6:43 PM",
      categoryId: "CAT_s4s1Q7t6Y2f5A7S11687610801693",
      walletId: "WALLET_T1c4d0S9h0o4A1E01687609709369",
      entryType: "expense",
    },
  ],
  income: [
    {
      id: "TRANS_Y3M2S3R0Y4N0V0k41687653988243",
      amount: "4045",
      description: "",
      date: "Sunday 25-June-2023 6:02 AM",
      categoryId: "CAT_x6e7s0f3x9D5m2O51687611467734",
      walletId: "WALLET_T1c4d0S9h0o4A1E01687609709369",
      entryType: "income",
    },
    {
      id: "TRANS_Y3M2S3R0Y4N0V0k51687653988300",
      amount: "1997",
      description: "",
      date: "Monday 26-June-2023 2:14 PM",
      categoryId: "CAT_O9x3s7L2p2q9k7C51687611142474",
      walletId: "WALLET_N0A6P3v4S4c1n5g21687609724997",
      entryType: "income",
    },
    {
      id: "TRANS_Y3M2S3R0Y4N0V0k61687653988210",
      amount: "3224",
      description: "",
      date: "Tuesday 27-June-2023 9:58 AM",
      categoryId: "CAT_u5G3Z9k8x5F1T2S91687611175796",
      walletId: "WALLET_N0A6P3v4S4c1n5g216876hU624997",
      entryType: "income",
    },
    {
      id: "TRANS_Y3M2S3R0Y4N0V0k71687653988204",
      amount: "878",
      description: "Random Description",
      date: "Wednesday 28-June-2023 4:37 PM",
      categoryId: "CAT_x6e7s0f3x9D5m2O51687611467734",
      walletId: "WALLET_T1c4d0S9h0o4A1E01687609709369",
      entryType: "income",
    },
    {
      id: "TRANS_Y3M2S3R0Y4N0V0k81687653988200",
      amount: "1856",
      description: "",
      date: "Thursday 28-June-2023 8:21 AM",
      categoryId: "CAT_O9x3s7L2p2q9k7C51687611142474",
      walletId: "WALLET_T1c4d0S9h0o4A1E01687609709369",
      entryType: "income",
    },
    {
      id: "TRANS_Y3M2S3R0Y4N0V0k91687653988201",
      amount: "3609",
      description: "",
      date: "Friday 30-June-2023 3:09 PM",
      categoryId: "CAT_u5G3Z9k8x5F1T2S91687611175796",
      walletId: "WALLET_N0A6P3v4S4c1n5g21687609724997",
      entryType: "income",
    },
    {
      id: "TRANS_Y3M2S3R0Y4N0V0k10168765398824",
      amount: "2389",
      description: "",
      date: "Saturday 1-July-2023 7:43 AM",
      categoryId: "CAT_h2M1l9d0n6x3R9b71687611209455",
      walletId: "WALLET_N0A6P3v4S4c1n5g216876hU624997",
      entryType: "income",
    },
    {
      id: "TRANS_Y3M2S3R0Y4N0V0k11168765398822",
      amount: "4287",
      description: "",
      date: "Tuesday 2-May-2023 4:56 PM",
      categoryId: "CAT_x6e7s0f3x9D5m2O51687611467734",
      walletId: "WALLET_T1c4d0S9h0o4A1E01687609709369",
      entryType: "income",
    },
    {
      id: "TRANS_Y3M2S3R0Y4N0V0k12168765398821",
      amount: "2589",
      description: "",
      date: "Monday 3-July-2023 10:39 AM",
      categoryId: "CAT_O9x3s7L2p2q9k7C51687611142474",
      walletId: "WALLET_N0A6P3v4S4c1n5g21687609724997",
      entryType: "income",
    },
    {
      id: "TRANS_Y3M2S3R0Y4N0V0k13168765398821",
      amount: "1197",
      description: "Random Description",
      date: "Friday 4-August-2023 5:12 PM",
      categoryId: "CAT_h2M1l9d0n6x3R9b71687611209455",
      walletId: "WALLET_N0A6P3v4S4c1n5g216876hU624997",
      entryType: "income",
    },
  ],
};

export let dbCategories = {
  lend: [
    {
      id: "CAT_J3Z4K8d3Z1E9E7r61687611411968",
      name: "default (lend)",
      canEdit: false,
      isChild: false,
      parentId: null,
      icon: "icon-cat-1",
      entryType: "lend",
    },
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
    },
  ],
  expense: [
    {
      id: "CAT_K8Y9d0k1v9m4q9Q81687611472105",
      name: "default (expense)",
      canEdit: false,
      isChild: false,
      parentId: null,
      icon: "icon-cat-3",
      entryType: "expense",
    },
    {
      id: "CAT_s7T9E5d0P8e8L6N31687610425861",
      name: "enjoyment",
      description: "",
      isChild: false,
      parentId: null,
      icon: "icon-cat-4",
      entryType: "expense",
    },
    {
      id: "CAT_D2g1n0h0q8l8c8T31687610742935",
      name: "fare",
      description: "",
      isChild: true,
      parentId: "CAT_s7T9E5d0P8e8L6N31687610425861",
      icon: "icon-cat-5",
      entryType: "expense",
    },
    {
      id: "CAT_D2g1n0h0q8l8cKKKK687610742935",
      name: "NO CAT",
      description: "",
      isChild: true,
      parentId: "CAT_s7T9E5d0P8e8L6N31687610425861",
      icon: "icon-cat-50",
      entryType: "expense",
    },
    {
      id: "CAT_d6R0T8k4O0z5x7I91687610754151",
      name: "food",
      description: "sasasas hai toh",
      isChild: true,
      parentId: "CAT_s7T9E5d0P8e8L6N31687610425861",
      icon: "icon-cat-6",
      entryType: "expense",
    },
    {
      id: "CAT_p2m2H1U9a7R5g4D01687610763912",
      name: "movies",
      description: "",
      isChild: true,
      parentId: "CAT_s7T9E5d0P8e8L6N31687610425861",
      icon: "icon-cat-7",
      entryType: "expense",
    },
    {
      id: "CAT_J3T8f9S3i9c6B8F81687610773855",
      name: "other",
      description: "",
      isChild: true,
      parentId: "CAT_s7T9E5d0P8e8L6N31687610425861",
      icon: "icon-cat-8",
      entryType: "expense",
    },
    {
      id: "CAT_s4s1Q7t6Y2f5A7S11687610801693",
      name: "office",
      description: "office expenses",
      isChild: false,
      parentId: null,
      icon: "icon-cat-9",
      entryType: "expense",
    },
    {
      id: "CAT_D6f5y2j8K3A2u7d01687610893056",
      name: "rikshaw",
      description: "",
      isChild: true,
      parentId: "CAT_s4s1Q7t6Y2f5A7S11687610801693",
      icon: "icon-cat-10",
      entryType: "expense",
    },
    {
      id: "CAT_z9k4V0D4U0J0d4F91687610945253",
      name: "metro",
      description: "",
      isChild: true,
      parentId: "CAT_s4s1Q7t6Y2f5A7S11687610801693",
      icon: "icon-cat-11",
      entryType: "expense",
    },
    {
      id: "CAT_E8z5O9J9H2X8N7A51687610971944",
      name: "personal",
      description: "",
      isChild: false,
      parentId: null,
      icon: "icon-cat-15",
      entryType: "expense",
    },
  ],
  income: [
    {
      id: "CAT_x6e7s0f3x9D5m2O51687611467734",
      name: "default (income)",
      canEdit: false,
      icon: "icon-cat-13",
      entryType: "income",
    },
    {
      id: "CAT_O9x3s7L2p2q9k7C51687611142474",
      name: "freelance",
      description: "",
      isChild: false,
      parentId: null,
      icon: "icon-cat-14",
      entryType: "income",
    },
    {
      id: "CAT_u5G3Z9k8x5F1T2S91687611175796",
      name: "fiverr",
      description: "",
      isChild: true,
      parentId: "CAT_O9x3s7L2p2q9k7C51687611142474",
      icon: "icon-cat-15",
      entryType: "income",
    },
    {
      id: "CAT_u8f3W9e9Z8q9j2X01687611192010",
      name: "local",
      description: "",
      isChild: true,
      parentId: "CAT_O9x3s7L2p2q9k7C51687611142474",
      icon: "icon-cat-16",
      entryType: "income",
    },
    {
      id: "CAT_h2M1l9d0n6x3R9b71687611209455",
      name: "monthly budget",
      description: "Monthly Budget",
      isChild: false,
      parentId: null,
      icon: "icon-cat-17",
      entryType: "income",
    },
  ],
};

export let dbWallets = [
  {
    id: "WALLET_T1c4d0S9h0o4A1E01687609709369",
    name: "cash",
    icon: "icon-wallet-1",
    description: "In hand money",
    balance: "201565",
    status: "positive",
    isActive: true,
  },
  {
    id: "WALLET_T1c4d0S9h0o4A1E01687609789369",
    name: "paytm",
    icon: "icon-wallet-2",
    description: "Paytm wallet",
    balance: "20156",
    status: "negative",
    isActive: false,
  },
  {
    id: "WALLET_N0A6P3v4S4c1n5g21687609724997",
    name: "phonepe",
    icon: "icon-wallet-3",
    description: "",
    balance: "589",
    status: "positive",
    isActive: true,
  },
  {
    id: "WALLET_N0A6P3v4S4c1n5g216876hU624997",
    name: "bank",
    icon: "icon-wallet-4",
    description: "",
    balance: "5898",
    status: "negative",
    isActive: true,
  },
];

export let dbEntryType = ["income", "borrow", "expense", "lend"];


// FUNCTION - DB SAVE CATEGORY
export function dbSaveCategory(pCategoryObject) {
  const isExist = dbCategories[pCategoryObject.entryType].find(category => category.id === pCategoryObject.id);
  if (isExist) {
    console.log("Category Edited")
    isExist.id = pCategoryObject.id;
    isExist.name = pCategoryObject.name;
    isExist.description = pCategoryObject.description;
    isExist.isChild = pCategoryObject.isChild;
    isExist.parentId = pCategoryObject.parentId;
    isExist.icon = pCategoryObject.icon;
    isExist.entryType = pCategoryObject.entryType;
  } else {
    console.log("Category Added")
    dbCategories[pCategoryObject.entryType].push(pCategoryObject)
  }
  updateDb()
}

// FUNCTION - DB DELETE CATEGORY
export function dbDeleteCategory(pCategoryObject) {
  const isExist = dbCategories[pCategoryObject.entryType].find(category => category.id === pCategoryObject.id);

  if (isExist) {

    // Assign all the tranctions to default category
    const thisCategoryTransactions = getTransactions({
      based: "category",
      basedIds: [pCategoryObject.id]
    });

    if(thisCategoryTransactions.length > 0){
      thisCategoryTransactions.forEach(transaction => {
        transaction.categoryId = dbCategories[pCategoryObject.entryType][0].id
      })
    }

    // Assign all the child category (if exists) to default category
    const thisCategoryChildCategories = dbCategories[pCategoryObject.entryType].filter(childCategories => childCategories.parentId === pCategoryObject.id);

    if(thisCategoryChildCategories.length > 0){
      thisCategoryChildCategories.forEach(childCategory => {
        childCategory.parentId = dbCategories[pCategoryObject.entryType][0].id
      })
    }

    dbCategories[pCategoryObject.entryType] = dbCategories[pCategoryObject.entryType].filter((category) => {
      return category.id !== pCategoryObject.id;
    })

    updateDb()

  } else{
    consoleError("Category not found in database.")
  }
}

// FUNCTION - UPDATE DATABASE
function updateDb() {
  console.log("Database updated successfully!")
}
