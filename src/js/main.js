// App
export const mainHTML = document.querySelector(".main");
export const appHTML = mainHTML.querySelector(".app");
// export const appCurrency = "Rs";

// Dialog Box
export const dialogBoxHTML = document.querySelector(".dialog-box");
export const dialogBoxWrapperHTML = dialogBoxHTML.querySelector(
  ".dialog-box-wrapper"
);

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
