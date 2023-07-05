import { appendHTML, createHTML } from "../helper.js";
import { renderPage } from './../screenApp.js';
// Pages
import { pageDashboard } from "./app-pages/pageDashboard.js";
import { pageWallets } from "./app-pages/pageWallets.js";
import { pageAdd } from "./app-pages/pageAdd.js";
import { pageReports } from "./app-pages/pageReports.js";
import { pageSettings } from "./app-pages/pageSettings.js";

export function appNav() {
  const navigation = createHTML("div", { class: "navigation" });

  // Nav Items
  const ul = createHTML("ul");
  const navItems = [
    {
      class: "dashboard active",
      icon: "ph-house",
      text: "Dashboard",
      page: pageDashboard,
    },
    {
      class: "wallets",
      icon: "ph-wallet",
      text: "Wallets",
      page: pageWallets,
    },
    {
      class: "add-transaction",
      icon: "ph-plus-circle",
      text: "",
      page: pageAdd,
    },
    {
      class: "reports",
      icon: "ph-chart-bar",
      text: "Reports",
      page: pageReports,
    },
    {
      class: "settings",
      icon: "ph-gear-fine",
      text: "Settings",
      page: pageSettings,
    },
  ];

  // Array to store li elements
  const liElements = [];

  navItems.forEach((item) => {
    const li = createHTML("li", { class: item.class });
    const icon = createHTML("i", { class: `ph-fill ${item.icon}` });
    const text = createHTML("span", {}, item.text);

    // Add eventListener
    li.addEventListener("click", () => {
      handleNavEvent(liElements, li, item.page);
    });

    appendHTML([icon, text], li);
    appendHTML(li, ul);

    //Add li to the liElements array 
    liElements.push(li);
  });

  // Append
  appendHTML(ul, navigation);
  return navigation;
}

// Nav Event Handler Function
function handleNavEvent(navItems, clickedItem, callback) {
  navItems.forEach((HTML) => {
    if (HTML !== clickedItem) {
      HTML.classList.remove("active");
    }
  });
  clickedItem.classList.add("active");

  renderPage(callback);
}
