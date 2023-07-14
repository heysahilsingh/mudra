import { appendHTML, createHTML } from './helper.js';
import { appHTML } from './main.js';
import { appNav } from './app-container/appNav.js';
import { pageDashboard } from './app-container/app-pages/pageDashboard.js';
import { pageWallets } from './app-container/app-pages/pageWallets.js';
import { pageSettings } from './app-container/app-pages/pageSettings.js';
import { pageReports } from './app-container/app-pages/pageReports.js';

export const appContainer = createHTML("div", { class: "app-container" });
appendHTML(appContainer, appHTML)

export async function screenApp() {
    appendHTML(appNav(), appContainer)
    renderPage(pageDashboard);
}

// Render Page
export function renderPage(pageName) {
    document.querySelector(".app .app-page")?.remove();

    const appPage = createHTML("div", { class: "app-page" });

    const page = pageName();
    appendHTML(page, appPage);
    appendHTML(appPage, appContainer);

    return appPage
}