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

// FUNCTION - SORT TRANSACTION BASED ON EITHER TRANSACTION "DATE" OR "AMOUNT"
export function sortTransaction(array, sortBy) {
  if (sortBy !== "date" && sortBy !== "amount") {
    consoleError(`SA_ERROR: Invalid sortBy argument. Only "date" or "amount" are allowed.`)
  }

  const newArray = [...array];

  newArray.sort((a, b) => {
    const valueA = sortBy === "date" ? formatDate(a[sortBy]).saveDate : parseInt(a[sortBy]);
    const valueB = sortBy === "date" ? formatDate(b[sortBy]).saveDate : parseInt(b[sortBy]);

    if (sortBy === "date") {
      return new Date(valueA) - new Date(valueB);
    } else {
      return valueA - valueB;
    }
  });

  return newArray;
}

// FUNCTION - GET TRANSACTIONS
export function getTransactions(pObject) {
  /*
  IMPORTANT NOTES TO BE NOTED
   1. To call this function use getTransactions({})
   2. First property of the object will be "based", {based: "date"/"category"/"wallet"/"amount"/"entryType"}
   2. Second property will be an array of that based's Ids, {basedIds: ["categoryId" / "walletId" / "dates"]}
   3. Third property is optional. For filtering out more, use {filters: {}}
   4. {filters: {
        date: ["array of dates by using formatDate()"],
        categoryId: ["array of categoryIds"],
        walletId: ["array of categoryIds"],
        amount: ["array of amounts"],
        entryType: ["array of entryType"],
   }}
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
  let locale = new Intl.NumberFormat(dbAppSettings.userCountryCodeLanguage);

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
  }, 1500);
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

// ========================================= APP PREFERENCES SPECIFIC 

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

// FUNCTION - STYLE UPDATE APP PRIMARY COLOR
export function styleUpdateAppPrimaryColor() {
  const elementId = "style-app-primary-color";
  const existingElement = document.getElementById(elementId);
  if (existingElement) existingElement.remove();

  const styles = cssVaribaleColor({
    name: "primary",
    color: dbAppSettings.themeColor,
    alpha: true
  })

  const styleElement = createHTML("style", { id: elementId });
  styleElement.innerHTML = `:root {\n${styles.join(`;\n`)}}`;
  document.head.appendChild(styleElement);

}

// FUNCTION - STYLE UPDATE THEME MODE COLOR
export function styleUpdateThemeModeColor() {
  const elementId = "style-theme-mode-color";
  const existingElement = document.getElementById(elementId);
  if (existingElement) existingElement.remove();

  const blackColor = cssVaribaleColor({
    name: "black",
    color: dbAppSettings.darkMode ? "#ffffff" : "#000000",
    alpha: true
  })

  const whiteColor = cssVaribaleColor({
    name: "white",
    color: dbAppSettings.darkMode ? "#000000" : "#ffffff",
    alpha: true
  });

  const exstraColor = () => {
    if (dbAppSettings.darkMode) return `--c-bg: #0a0a0a;\n --c-grey: #515151;\n --c-box-shadow: rgb(0 0 0 / 80%);\n --c-page-shadow: rgba(0, 0, 0, 0.8);\n`
    else return `--c-bg: #ebebeb;\n --c-grey: #747474;\n --c-box-shadow: rgb(0 0 0 / 10%);\n --c-page-shadow: rgba(0, 0, 0, 0.3);\n`
  };

  const styleElement = createHTML("style", { id: elementId });
  styleElement.innerHTML = `:root {${blackColor.join(`;\n`)}; ${whiteColor.join(`;\n`)}; ${exstraColor()}}`;
  document.head.appendChild(styleElement);

}

// FUNCTION - STYLE UPDATE USER CURRENCY
export function styleUpdateUserCurrency() {
  document.getElementById("style-user-currency")?.remove()

  const styleElement = createHTML("style", { id: "style-user-currency" });

  styleElement.innerHTML = styleElement.innerHTML = `:root { --currency: "${dbAppSettings.userCurrency}"; }`;
  document.head.appendChild(styleElement);

}
