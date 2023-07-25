import { appendHTML, createHTML, saError } from '../../helper.js';
import { renderPage } from '../../screenApp.js';
import { pageDashboard } from './pageDashboard.js';
import { subPageAddTransaction } from './sub-pages/subPageAddTransaction.js';

export function pageAdd() {
    try {
        const pageAdd = createHTML("div", { class: "page page-add" });

        // Page Body
        const body = () => {
            const body = createHTML("div", { class: "body" });


            const page = subPageAddTransaction({
                pAsParentPage: true,
                pCallback: () => {
                    renderPage(pageDashboard);
                    document.querySelector(".app > .app-container > .navigation ul .add-transaction")?.classList.remove("active");
                    document.querySelector(".app > .app-container > .navigation ul .dashboard")?.classList.add("active");
                }
            });

            appendHTML(page, body)
            return body;
        };

        // Append
        appendHTML([body()], pageAdd);

        return pageAdd

    } catch (error) {
        saError(error, "Error while executing pageAdd().");
    }
}
