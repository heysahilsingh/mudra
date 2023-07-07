import {
  appendHTML,
  closeSubPage,
  createHTML,
  consoleError,
} from "../../../helper.js";

export function subPageIconPicker(pSelectedIconId, pCallback) {
  if (document.querySelector(".app .app-page")) {
    // Select Parent Page
    const parentPage = document.querySelector(".app .app-page");

    // Sub Page
    const page = createHTML("div", { class: "sub-page icon-picker" });

    const pageWrapper = (() => {
      const pageWrapper = createHTML("div", { class: "sub-page-wrapper" });

      // Page Header
      const header = (() => {
        const header = createHTML("div", { class: "header" });

        // Back Button
        const btnBack = createHTML("i", { class: "ph ph-arrow-left" });

        // Page Heading
        const heading = createHTML(
          "p",
          { class: "page-heading" },
          "Select an Icon"
        );

        // Done Btn
        const doneIcon = createHTML("i", { class: "ph ph-check" });

        // Click event on Back and Done button
        [btnBack, doneIcon].forEach((btn) => {
          btn.addEventListener("click", () => {
            closeSubPage(page);
          });
        });

        appendHTML([btnBack, heading, doneIcon], header);

        return header;
      })();

      // Page Body
      const body = (() => {
        const body = createHTML("div", { class: "body" });

        const sectionIcons = createHTML("section", { class: "section-icons" });

        // Print Category Icons
        for (let i = 1; i <= 104; i++) {
          const icon = createHTML("i", {
            class: `icon icon-cat-${i}`,
            id: `cat-${i}`,
          });

          appendHTML(icon, sectionIcons);

          icon.addEventListener("click", handleClick);
        }

        // Print Wallet Icons
        for (let i = 1; i <= 5; i++) {
          const icon = createHTML("i", {
            class: `icon icon-wallet-${i}`,
            id: `wallet-${i}`,
          });

          appendHTML(icon, sectionIcons);

          icon.addEventListener("click", handleClick);
        }

        // Handle click function for each icon
        function handleClick() {
          const selectedIcons = sectionIcons.querySelectorAll(
            ".section-icons .selected"
          );

          if (selectedIcons.length > 0) {
            selectedIcons.forEach((ele) => ele.classList.remove("selected"));
          }

          this.classList.add("selected");
          console.log(this.getAttribute("id"));
        }

        appendHTML(sectionIcons, body);
        return body;
      })();

      appendHTML([header, body], pageWrapper);
      return pageWrapper;
    })();

    // Append
    appendHTML(pageWrapper, page);
    // parentPage.prepend(page)
    appendHTML(page, parentPage);
  } else {
    consoleError(".app-page HTML not found.");
  }
}
