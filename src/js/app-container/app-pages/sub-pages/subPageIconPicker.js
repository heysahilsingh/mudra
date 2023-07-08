import { appendHTML, closeSubPage, createHTML, consoleError } from "../../../helper.js";

export function subPageIconPicker(pObject) {
  /* IMPORTANT NOTES TO BE NOTED
  1. TO call this function, subPageIconPicker({}).
  2. To preselect any specific Id, {pSelectedIconId: "id of that icon"}.
  3. To run callback, {pCallback: "your function"}.
  4. You'll receive an id of selected icon in callback.
  */
  if (document.querySelector(".app .app-page")) {
    // Select Parent Page
    const parentPage = document.querySelector(".app .app-page");

    // Destructure Parameter
    const { pSelectedIconId, pCallback } = pObject;

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

        // Generate icons function
        function generateIcons(iconType, iconCount) {
          for (let i = 1; i <= iconCount; i++) {
            const icon = createHTML("i", {
              class: `icon icon-${iconType}-${i}`,
              id: `icon-${iconType}-${i}`,
            });

            appendHTML(icon, sectionIcons);

            icon.addEventListener("click", handleClick);

            if (
              pSelectedIconId &&
              pSelectedIconId === icon.getAttribute("id")
            ) {
              icon.click();
            }
          }
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
          if (pCallback && typeof pCallback === "function") {
            pCallback(this.getAttribute("id"));
          }
        }

        // Print Category Icons
        generateIcons("cat", 104);

        // Print Wallet Icons
        generateIcons("wallet", 5);

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
