import { dbAppSettings } from "./db.js";
import { updateAppColors, updateAppUserCurrency } from "./helper.js";

// App
export const mainHTML = document.querySelector(".main");
export const appHTML = mainHTML.querySelector(".app");
// export const appCurrency = "Rs";

// Dialog Box
export const dialogBoxHTML = document.querySelector(".dialog-box");
export const dialogBoxWrapperHTML = dialogBoxHTML.querySelector(
  ".dialog-box-wrapper"
);

// Detect user's theme preference
if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
  dbAppSettings.darkMode = true;
  updateAppColors();
}

const colorSchemeChangeHandler = event => {
  dbAppSettings.darkMode = event.matches;
  updateAppColors();
};

const colorSchemeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
colorSchemeMediaQuery.addEventListener('change', colorSchemeChangeHandler);


// Add CSS variables
updateAppUserCurrency();
updateAppColors();

// Render Sign Up Screen or App Container Screen
try {
  if (true) {
    import("./screenApp.js").then(({ screenApp }) => {
      screenApp();
    });
  } else {
    import("./screenSignup.js").then(({ screenSignup }) => {
      screenSignup();
    });
  }
} catch (error) {
  alert(error);
}
