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

// Function to update the app's primary color
export function styleUpdateAppPrimaryColor(colorCode, variableName) {
  const elementId = "style-app-primary-color";
  const existingElement = document.getElementById(elementId);
  if (existingElement) {
    existingElement.remove();
  }

  const color = hexToRGB(colorCode);
  let styles = "";

  for (let i = 5; i <= 100; i += 5) {
    const opacity = i / 100;
    const cssValue = generateCSSVariable(color, opacity);
    const variable = `${variableName}-${i}`;
    styles += `--c-${variable}: ${cssValue};\n`;
  }

  const styleElement = createHTML("style", { id: elementId });
  styleElement.innerHTML = `:root {\n${styles}}`;
  document.head.appendChild(styleElement);
}

// Function to update the theme mode color
export function styleUpdateThemeModeColor(themeMode) {
  const elementId = "style-theme-mode-color";
  const existingElement = document.getElementById(elementId);
  if (existingElement) {
    existingElement.remove();
  }

  let styles = "";

  if (themeMode === "dark") {
    const colorBlack = hexToRGB("#ffffff");
    const colorWhite = hexToRGB("#000000");

    for (let i = 5; i <= 100; i += 5) {
      const opacity = i / 100;
      const cssValue = generateCSSVariable(colorBlack, opacity);
      const variable = `${"black"}-${i}`;
      styles += `--c-${variable}: ${cssValue};\n`;
    }

    for (let i = 5; i <= 100; i += 5) {
      const opacity = i / 100;
      const cssValue = generateCSSVariable(colorWhite, opacity);
      const variable = `${"white"}-${i}`;
      styles += `--c-${variable}: ${cssValue};\n`;
    }

    styles += `
      --c-bg: #0a0a0a;\n
      --c-grey: #515151;\n
      --c-box-shadow: rgb(0 0 0 / 80%);\n
      --c-page-shadow: rgba(0, 0, 0, 0.8);\n  
    `;
  } else {
    const colorBlack = hexToRGB("#000000");
    const colorWhite = hexToRGB("#ffffff");

    for (let i = 5; i <= 100; i += 5) {
      const opacity = i / 100;
      const cssValue = generateCSSVariable(colorBlack, opacity);
      const variable = `${"black"}-${i}`;
      styles += `--c-${variable}: ${cssValue};\n`;
    }

    for (let i = 5; i <= 100; i += 5) {
      const opacity = i / 100;
      const cssValue = generateCSSVariable(colorWhite, opacity);
      const variable = `${"white"}-${i}`;
      styles += `--c-${variable}: ${cssValue};\n`;
    }

    styles += `
      --c-bg: #ebebeb;\n
      --c-grey: #747474;\n
      --c-box-shadow: rgb(0 0 0 / 10%);\n
      --c-page-shadow: rgba(0, 0, 0, 0.3);\n  
    `;
  }

  const styleElement = createHTML("style", { id: elementId });
  styleElement.innerHTML = `:root {\n${styles}}`;
  document.head.appendChild(styleElement);
}


// FUNCTION - STYLE UPDATE USER CURRENCY
export function styleUpdateUserCurrency() {
  document.getElementById("style-user-currency")?.remove()

  const styleElement = createHTML("style", { id: "style-user-currency" });

  styleElement.innerHTML =   styleElement.innerHTML = `:root { --currency: "${dbAppSettings.userCurrency}"; }`;
  document.head.appendChild(styleElement);

}