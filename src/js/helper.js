import { dbTransactions, dbAppSettings } from "./db.js";
import { dialogBoxHTML, dialogBoxWrapperHTML } from "./main.js";

// FUNCTION - SA_ERROR
export function saError(err, msg) { console.error(`SA_ERROR: ${msg} ${err.stack}`); }

// FUNCTION - CONSOLE ERROR
export function consoleError(msg) { console.error(`SA_ERROR: ${msg}`); }

// FUNCTION - GET UNIQUE ID
export function getUniqueId(prefix) {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
  const numbers = "0123456789";

  let uniqueId = "";

  // Generate a random string of alphabets and numbers
  for (let i = 0; i < 8; i++) {
    uniqueId += alphabet.charAt(Math.floor(Math.random() * alphabet.length));
    uniqueId += numbers.charAt(Math.floor(Math.random() * numbers.length));
  }

  // Append current timestamp
  uniqueId += new Date().getTime();

  return prefix ? prefix.toUpperCase() + "_" + uniqueId : uniqueId;
}

// FUNCTION - SENTENCE CASE
export function sentenceCase(str) {
  if (!str) return '';
  return str
    .toLowerCase()
    .replace(/(^|\s)\S/g, (match) => match.toUpperCase());
}


// FUNCTION - SORT TRANSACTION BASED ON EITHER TRANSACTION "DATE" OR "AMOUNT"
export function sortTransaction(array, sortBy, sortOrder) {
  /* IMPORTANT NOTES TO BE NOTED
     1. To call this function, use sortTransaction(array, sortBy, sortOrder)
     2. The first parameter is an array of transactions to be sorted.
     3. The second parameter is the sorting criterion, which should be either "date" or "amount".
     4. The third parameter is the sorting order, which should be either "asc" for ascending or "desc" for descending.
     5. This function will return a new array of transactions sorted based on the specified criterion and order.
  */
  if (sortBy !== "date" && sortBy !== "amount") {
    consoleError(`SA_ERROR: Invalid sortBy argument. Only "date" or "amount" are allowed.`);
    return array; // Return the original array if sortBy is invalid
  }

  if (sortOrder !== "asc" && sortOrder !== "desc") {
    consoleError(`SA_ERROR: Invalid sortOrder argument. Only "asc" or "desc" are allowed.`);
    return array; // Return the original array if sortOrder is invalid
  }

  const newArray = [...array];

  newArray.sort((a, b) => {
    const valueA = sortBy === "date" ? formatDate(a[sortBy]).saveDate : parseInt(a[sortBy]);
    const valueB = sortBy === "date" ? formatDate(b[sortBy]).saveDate : parseInt(b[sortBy]);

    if (sortBy === "date") {
      const comparison = new Date(valueA) - new Date(valueB);
      return sortOrder === "asc" ? comparison : -comparison;
    } else {
      return sortOrder === "asc" ? valueA - valueB : valueB - valueA;
    }
  });

  return newArray;
}


// FUNCTION - GET TRANSACTIONS
export function getTransactions(pObject) {
  /* IMPORTANT NOTES TO BE NOTED
     1. To call this function use getTransactions({})
     2. First property of the object will be "based", {based: "date"/"category"/"wallet"/"amount"/"entryType"}
     2. Second property will be an array of that based's Ids, {basedIds: [ "dates"/"walletId"/"categoryId"]}
     3. Third property is optional. For filtering out more, use {filters: {}}
     4. {filters: {
          date: ["array of dates by using formatDate()"],
          categoryId: ["array of categoryIds"],
          walletId: ["array of categoryIds"],
          amount: ["array of amounts"],
          entryType: ["array of entryType"],
     }}.
     5. This fucntion will return an array of transacions.
  */

  // Destructure pObject
  const { based, basedIds, filters } = pObject;

  let returnArray = [];

  for (const basedId of basedIds) {
    for (const type in dbTransactions) {
      for (const transaction of dbTransactions[type]) {
        if (
          (based === "date" && formatDate(transaction.date).date === formatDate(basedId).date) ||
          (based === "category" && transaction.categoryId === basedId) ||
          (based === "wallet" && transaction.walletId === basedId) ||
          (based === "amount" && transaction.amount === basedId) ||
          (based === "entryType" && transaction.entryType === basedId)
        ) {
          let matchFilters = true;

          // Check additional filters
          if (filters) {
            for (const filterKey in filters) {
              const filterValues = filters[filterKey];

              if (
                filterKey === "date" &&
                !filterValues.includes(formatDate(transaction.date).date) // Compare formatted dates
              ) {
                matchFilters = false;
                break; // No need to check other filters if one doesn't match
              } else if (
                filterKey !== "date" &&
                !filterValues.includes(transaction[filterKey])
              ) {
                matchFilters = false;
                break; // No need to check other filters if one doesn't match
              }
            }
          }

          if (matchFilters) {
            returnArray.push(transaction);
          }
        }
      }
    }
  }

  return returnArray;
}

// FUNCTION - FORMAT AMOUNT
export function formatAmount(number, prefix, suffix) {
  let locale = new Intl.NumberFormat("en-IN");

  if (prefix) {
    return prefix + " " + locale.format(Number(number))
  } else if (suffix) {
    return locale.format(Number(number)) + " " + suffix
  } else if (prefix && suffix) {
    return prefix + " " + locale.format(Number(number)) + " " + suffix
  } else {
    return locale.format(Number(number));
  }
}

// FUNCTION - CREATE HTML ELEMENTS
export function createHTML(tagName, attributes = {}, content = "") {
  try {
    const HTML = document.createElement(tagName);

    for (const [key, value] of Object.entries(attributes)) {
      if (typeof value === "function") {
        HTML.setAttribute(key, value());
      } else if (typeof value === "boolean") {
        if (value) {
          HTML.setAttribute(key, "");
        } else {
          HTML.removeAttribute(key);
        }
      } else {
        HTML.setAttribute(key, value);
      }
    }

    if (typeof content === "function") {
      HTML.appendChild(content());
    } else if (content instanceof Node) {
      HTML.appendChild(content);
    } else {
      HTML.textContent = content;
    }

    return HTML;
  } catch (error) {
    saError(error, "");
  }
}

// FUNCTION - APPEND HTML ELEMENT
export function appendHTML(child, parent) {
  try {
    if (Array.isArray(child)) {
      for (let i = 0; i < child.length; i++) {
        parent.appendChild(child[i]);
      }
    } else {
      parent.appendChild(child);
    }
  } catch (error) {
    saError(error, "Child or Parent is either undefined or Null.");
  }
}

// FUNCTION - POP MESSAGE
export async function popMsg(message, messageType) {
  try {
    const popMessageHTML = document.querySelector(".pop-message");
    const messageElement = popMessageHTML.querySelector(".message");
    const closeBtn = popMessageHTML.querySelector(".close");

    // Set the message and add the message classes
    if (message instanceof HTMLElement) {
      messageElement.appendChild(message);
    } else {
      messageElement.textContent = message;
    }
    popMessageHTML.classList.add("active");
    popMessageHTML.classList.add(messageType);

    // Function to remove the active class
    const removePopMsg = () => {
      popMessageHTML.classList.remove("active");
      setTimeout(() => {
        popMessageHTML.classList.remove(messageType);
        messageElement.textContent = "";
      }, 1000);
    };

    // Add click event listener to close button
    closeBtn.addEventListener("click", () => {
      removePopMsg();
      clearTimeout(autoCloseTimeout);
    });

    // Remove active class after 3 seconds
    const autoCloseTimeout = setTimeout(removePopMsg, 3000);

    // Create a promise that resolves after the active class is removed
    const completionPromise = new Promise((resolve) => {
      setTimeout(() => {
        removePopMsg();
        resolve();
      }, 3000);
    });

    // Wait for the completion promise to resolve
    await completionPromise;
  } catch (error) {
    saError(error, "");
  }
}

// FUNCTION - CLOSE SUB PAGE
export function closeSubPage(pPage) {
  pPage.querySelector(".sub-page-wrapper").classList.add("closed");
  setTimeout(() => {
    pPage.remove();
  }, 600);
}

// FUNCTION - OPEN DIALOG BOX
export function dialogBoxOpen(pContent) {
  dialogBoxHTML.classList.add("active");
  appendHTML(pContent, dialogBoxWrapperHTML);
}

// FUNCTION - CLOSE DIALOG BOX
export function dialogBoxClose(pContent) {
  dialogBoxWrapperHTML.classList.add("closing");
  setTimeout(() => {
    dialogBoxHTML.classList.remove("active");
    pContent.remove();
    dialogBoxWrapperHTML.classList.remove("closing");
  }, 100)
}

// FUNCTION - FORMAT DATE "DAY DD-MM-YYYY TIME AM/PM"
export function formatDate(date) {
  try {
    const currentDate = new Date(date);
    const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday",
    ];
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December",
    ];
    const day = dayNames[currentDate.getDay()];
    const dayOfMonth = ("0" + currentDate.getDate()).slice(-2);
    const month = monthNames[currentDate.getMonth()];
    const year = currentDate.getFullYear();
    let hours = currentDate.getHours();
    const minutes = ("0" + currentDate.getMinutes()).slice(-2);
    const amOrPm = hours >= 12 ? "PM" : "AM";

    // Convert to 12-hour format
    if (hours > 12) {
      hours -= 12;
    }

    return {
      saveDate: `${day} ${dayOfMonth}-${month}-${year} ${hours}:${minutes} ${amOrPm}`,
      date: `${dayOfMonth} ${month} ${year}`,
      day: day,
      dayOfMonth: dayOfMonth,
      month: month,
      year: year,
      time: `${hours}:${minutes} ${amOrPm}`,
    };
  } catch (error) {
    saError(error, "");
  }
}

// FUNCTION - GET ARRAY OF DATES
export function getDates(pFrom, pTo) {
  let startDate = new Date(pFrom);
  let endDate = new Date(pTo);
  const dates = [];

  if (endDate < startDate) {
    [startDate, endDate] = [endDate, startDate];
  }

  for (
    let currentDate = endDate;
    currentDate >= startDate;
    currentDate.setDate(currentDate.getDate() - 1)
  ) {
    dates.push(formatDate(new Date(currentDate)).date);
  }

  return dates;
}

// FUNCTION - SEARCH
export function searchData(searchedText, searchableContainerArray) {
  const sanitizedsearchedText = searchedText.replace(/[^\w\s]/g, "").toLowerCase();
  searchableContainerArray.forEach(element => {
    const sanitizedElement = element.innerText.replace(/[^\w\s]/g, "").toLowerCase();
    element.classList.toggle("search-hide", !sanitizedElement.includes(sanitizedsearchedText));
  });
}


// ========================================= APP PREFERENCES SPECIFIC 

// FUNCTION - CSS VARIABLE COLOR
function cssVaribaleColor(pObject) {
  /* IMPORTANT REMINDERS:
    1. To invoke this function, use `cssVaribaleColor({})`.
    2. It is essential to provide the following parameters: `{ name: "name of the CSS variable color", color: "color code in hexadecimal" }`.
    3. If you desire to obtain an alpha RGB value, include `{ alpha: true }`.
  */

  // Destruckture pObject
  const { name, color, alpha } = pObject;

  let returnArray = [];

  // Helper function to convert hexadecimal color code to RGB values
  function hexToRGB(hex) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return { r, g, b };
  };

  // Helper function to generate CSS variable with opacity
  function generateCSSVariable(color, opacity) {
    return `rgba(${color.r}, ${color.g}, ${color.b}, ${opacity})`;
  };

  const rgbColor = hexToRGB(color);

  if (alpha && alpha === true) {
    for (let i = 5; i <= 100; i += 5) {
      const opacity = i / 100;
      returnArray.push(`--c-${name}-${i}: ${generateCSSVariable(rgbColor, opacity)}`)
    }
  }
  else {
    returnArray.push(`--c-${name}: rgb(${rgbColor.r}, ${rgbColor.g}, ${rgbColor.b})`)
  }

  return returnArray
}

// FUNCTION - STYLE UPDATE THEME MODE COLOR
export function updateAppColors() {
  const elementId = "style-theme-mode-color";
  const existingElement = document.getElementById(elementId);
  if (existingElement) existingElement.remove();

  const primaryColor = cssVaribaleColor({
    name: "primary",
    color: dbAppSettings.themeColor,
    alpha: true
  })

  const blackColor = cssVaribaleColor({
    name: "black",
    color: dbAppSettings.darkMode ? "#ffffff" : "#000000",
    alpha: true
  })

  const whiteColor = cssVaribaleColor({
    name: "white",
    color: dbAppSettings.darkMode ? "#151516" : "#ffffff",
    alpha: true
  });

  const tintRed = cssVaribaleColor({
    name: "red",
    color: dbAppSettings.darkMode ? "#FF453AFF" : "#FF3B30FF",
    alpha: true
  });

  const tintGreen = cssVaribaleColor({
    name: "green",
    color: dbAppSettings.darkMode ? "#30D158FF" : "#34C759FF",
    alpha: true
  });

  const tintYellow = cssVaribaleColor({
    name: "yellow",
    color: dbAppSettings.darkMode ? "#FFD60AFF" : "#FFCC00FF",
    alpha: true
  });

  const extraColor = () => dbAppSettings.darkMode
    ? `
      --c-border: #2d2d2d;
      --c-bg: #010101;
      --c-grey: #6a6a6a;
      --c-box-shadow: rgb(0 0 0 / 80%);
      --c-page-shadow: rgba(0, 0, 0, 0.8);
    `
    : `
      --c-border: #DEDEDE;
      --c-bg: #F2F1F6;
      --c-grey: #b2b2b2;
      --c-box-shadow: rgb(0 0 0 / 10%);
      --c-page-shadow: rgba(0, 0, 0, 0.3);
    `;

  const styleElement = createHTML("style", { id: elementId });

  styleElement.innerHTML = `:root {
    ${primaryColor.join(`;\n`)};
    ${blackColor.join(`;\n`)};
    ${whiteColor.join(`;\n`)};
    ${tintRed.join(`;\n`)};
    ${tintGreen.join(`;\n`)};
    ${tintYellow.join(`;\n`)};
    ${extraColor()};
    --themeColor: ${dbAppSettings.themeColor};
  }`;

  document.head.appendChild(styleElement);

  insertThemeColorMeta();
  updateManifestThemeColor();
}

// FUNCTION - STYLE UPDATE USER CURRENCY
export function updateAppUserCurrency() {
  document.getElementById("style-user-currency")?.remove()

  const styleElement = createHTML("style", { id: "style-user-currency" });

  styleElement.innerHTML = styleElement.innerHTML = `:root { --currency: "${dbAppSettings.userCurrency}"; }`;
  document.head.appendChild(styleElement);

}

// FUNCTION - INSERT THEME COLOR META
function insertThemeColorMeta() {
  const head = document.querySelector('head');

  head.querySelector(`meta[name="theme-color"]`)?.remove();
  head.querySelector(`meta[name="msapplication-TileColor"]`)?.remove();
  head.querySelector(`meta[name="msapplication-navbutton-color"]`)?.remove();
  head.querySelector(`meta[name="apple-mobile-web-app-status-bar-style"]`)?.remove();

  const themeColor = getComputedStyle(document.documentElement).getPropertyValue("--themeColor")

  const metaTags = [
    { name: 'theme-color', content: themeColor },
    { name: 'msapplication-TileColor', content: themeColor },
    { name: 'msapplication-navbutton-color', content: themeColor },
    { name: 'apple-mobile-web-app-status-bar-style', content: themeColor }
  ];

  metaTags.forEach(meta => {
    const metaTag = document.createElement('meta');
    metaTag.setAttribute('name', meta.name);
    metaTag.setAttribute('content', meta.content);
    head.appendChild(metaTag);
  });
}

// FUNCTION - UPDATE MANIFEST THEME COLOR PROPERTY
function updateManifestThemeColor() {
  const themeColor = getComputedStyle(document.documentElement).getPropertyValue("--themeColor");

  // Fetch the manifest.json file
  fetch('./manifest.json')
    .then((response) => response.json())
    .then((manifest) => {
      // Update the theme_color property
      manifest.theme_color = themeColor;

      // Save the updated manifest.json
      const updatedManifest = JSON.stringify(manifest, null, 2);
      const blob = new Blob([updatedManifest], { type: 'application/json' });
      const manifestURL = URL.createObjectURL(blob);

      // Remove any previously added manifest links
      const existingLink = document.querySelector('link[rel="manifest"]');
      if (existingLink) {
        document.head.removeChild(existingLink);
      }

      // Append the updated manifest link to the head
      const link = document.createElement('link');
      link.rel = 'manifest';
      link.href = manifestURL;

      document.head.appendChild(link);
    })
    .catch((error) => {
      console.error('Error fetching or updating manifest.json:', error);
    });
}


