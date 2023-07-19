import { appendHTML, createHTML, saError } from '../../helper.js';
import { subPageTransactionHistory } from './sub-pages/subPageTransactionHistory.js';

export function pageTransactions() {
    try {
        const pageTransactions = createHTML("div", { class: "page page-transactions" });

        // Page Body
        const body = () => {
            const body = createHTML("div", { class: "body" });

            const page = subPageTransactionHistory({
                pAsParentPage: true
            });

            appendHTML(page, body)
            return body;
        };

        // Append
        appendHTML(body(), pageTransactions);

        return pageTransactions

    } catch (error) {
        saError(error, "Error while executing pageTransactions().");
    }
}