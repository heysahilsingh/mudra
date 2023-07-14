import { appendHTML, createHTML, saError } from '../../helper.js';

export function pageReports() {
    try {
        const pageReports = createHTML("div", { class: "page page-reports" });

        // Page Header
        const header = createHTML("div", { class: "header" }, "Reports");

        // Page Body
        const body = () => {
            const body = createHTML("div", { class: "body" });

            return body;
        };

        // Append
        appendHTML([header, body()], pageReports);
        return pageReports;
    } catch (error) {
        saError(error, "Error while executing pageReports().");
    }
}