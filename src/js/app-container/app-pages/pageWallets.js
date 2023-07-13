import { compNotFound } from '../../components.js';
import { dbWallets } from '../../db.js';
import { appendHTML, createHTML, formatAmount, saError } from '../../helper.js';
import { subPageAddWallet } from './sub-pages/subPageAddWallet.js';

export function pageWallets() {
    try {
        const pageWallets = createHTML("div", { class: "page page-wallets" });

        // Page Header
        const header = createHTML("div", { class: "header" }, "Wallets");

        // Page Body
        const body = () => {
            const body = createHTML("div", { class: "body" });

            // Function - render body wrapper
            function renderBodyWrapper() {
                document.querySelector(".page-wallets .body > .body-wrapper")?.remove();

                const bodyWrapper = createHTML("div", { class: "body-wrapper" });

                // Section - Total Amount
                const sectionTotalBalance = createHTML("section", { class: "section-total-balance"});

                // Section - Active Wallets
                const sectionActiveWallets = createHTML("section", { class: "section-active-wallets" });
                const sectionActiveWalletsHeading = createHTML("p", { class: "heading" }, "Active Wallets");

                const activeWalletContainer = createHTML("div", { class: "wallet-container" });

                appendHTML([sectionActiveWalletsHeading, activeWalletContainer], sectionActiveWallets)

                // Section - Inactive Wallets
                const sectionInactiveWallets = createHTML("section", { class: "section-inactive-wallets" });
                const sectionInactiveWalletsHeading = createHTML("p", { class: "heading" }, "Inactive Wallets");

                const inactiveWalletContainer = createHTML("div", { class: "wallet-container" });

                appendHTML([sectionInactiveWalletsHeading, inactiveWalletContainer], sectionInactiveWallets)

                // Toatal section balance calculation
                let totalActiveWalletBalance = 0;
                let totalInactiveWalletBalance = 0;

                // Print wallet(s) in appropriate section
                for (const wallet of dbWallets) {
                    // Wallet row
                    const walletRow = createHTML("div", { class: `wallet-row icon ${wallet.icon}` });

                    // Wallet Info
                    const walletInfo = createHTML("div", { class: "info" });

                    // Wallet Name
                    const walletName = createHTML("p", { class: "wallet-name" }, wallet.name);

                    // Wallet Balance
                    const walletBalance = createHTML("p", { class: "wallet-balance",  balanceStatus: (wallet.balance < 0) ? "negative" : "positive"}, formatAmount(wallet.balance));

                    walletRow.addEventListener("click", () => {
                        subPageAddWallet({
                            pPageHeading: "Edit wallet",
                            pEditWallet: wallet,
                            pCallback: renderBodyWrapper
                        })

                    })

                    appendHTML([walletName, walletBalance], walletInfo);
                    appendHTML([walletInfo], walletRow);

                    if (wallet.isActive === true) {
                        totalActiveWalletBalance += wallet.balance
                        appendHTML(walletRow, activeWalletContainer)
                    }
                    else if (wallet.isActive === false) {
                        totalInactiveWalletBalance += wallet.balance
                        appendHTML(walletRow, inactiveWalletContainer)
                    }
                }

                // Update Section Headings
                sectionTotalBalance.textContent = formatAmount(totalActiveWalletBalance);
                sectionTotalBalance.setAttribute("balanceStatus", (totalActiveWalletBalance < 0) ? "negative" : "positive");


                sectionActiveWalletsHeading.setAttribute("balance", formatAmount(totalActiveWalletBalance));
                sectionActiveWalletsHeading.setAttribute("balanceStatus", (totalActiveWalletBalance < 0) ? "negative" : "positive");

                sectionInactiveWalletsHeading.setAttribute("balance", formatAmount(totalInactiveWalletBalance));
                sectionInactiveWalletsHeading.setAttribute("balanceStatus", (totalInactiveWalletBalance < 0) ? "negative" : "positive");

                // Render compNotFound()
                if (activeWalletContainer.childElementCount === 0) appendHTML(compNotFound("No active wallet"), activeWalletContainer);

                // Section - Add Wallet
                const sectionAddWallet = createHTML("section", {class: "section-add-wallet ph-fill ph-plus-circle"});

                sectionAddWallet.addEventListener("click", () => {
                    subPageAddWallet({
                        pPageHeading: "Add a wallet",
                        pCallback: renderBodyWrapper
                    })
                })

                appendHTML([sectionTotalBalance, sectionActiveWallets, sectionInactiveWallets, sectionAddWallet], bodyWrapper)
                appendHTML(bodyWrapper, body)
            }

            renderBodyWrapper()

            return body;
        };

        // Append
        appendHTML([header, body()], pageWallets);
        return pageWallets;
    } catch (error) {
        saError(error, "Error while executing pageWallets().");
    }
}
