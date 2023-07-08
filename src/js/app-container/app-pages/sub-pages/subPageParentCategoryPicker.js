import { dbCategories } from "../../../db.js";
import {
  appendHTML,
  closeSubPage,
  consoleError,
  createHTML,
} from "../../../helper.js";

export function subPageParentCategoryPicker(pObject) {
  /* IMPORTANT NNOTES TO BE NOTED
1. To call this function, subPageParentCategoryPicker({}).
3. It is necessary to specify the category type, {pCategoryType: "expense"/"income"/"lend"/"borrow"}
2. To preselect category, {pPreSelected = "id of the category"}.
3. To run callback function, {pCallback: () => {"Your Function"}}.
4. You will receive an object of selected category.
*/
  // Destructure parameter object
  const { pCategoryType, pPreSelected, pCallback } = pObject;

  if (document.querySelector(".app .app-page")) {
    // Select Parent Page
    const parentPage = document.querySelector(".app .app-page");

    // Sub Page
    const page = createHTML("div", {
      class: "sub-page parent-category-picker",
    });

    const pageWrapper = (() => {
      const pageWrapper = createHTML("div", { class: "sub-page-wrapper" });

      // Page Header
      const header = (() => {
        const header = createHTML("div", { class: "header" });

        const btnBack = createHTML("i", { class: "ph ph-arrow-left" });

        const heading = createHTML(
          "p",
          { class: "page-heading" },
          "Select Parent Category"
        );

        const done = createHTML("i", { class: "ph ph-check" });

        // Click event on btnBack and done btn
        [btnBack, done].forEach((element) => {
          element.addEventListener("click", () => {
            closeSubPage(page);
          });
        });

        appendHTML([btnBack, heading, done], header);
        return header;
      })();

      // Page Body
      const body = (() => {
        const body = createHTML("div", { class: "body" });

        const parentCategories = dbCategories[pCategoryType].filter(
          (category) => !category.isChild
        );

        // Helper Function - to create category HTML
        const createCategoryElement = (category) => {
          const categoryElement = createHTML("li", {
            class: `category icon ${category.icon}`,
          });
          const categoryName = createHTML(
            "li",
            { class: "category-name" },
            category.name
          );
          const selectedCategoryIcon = createHTML("i", {
            class: "ph-fill ph-check-circle",
          });

          // Add Event Listener
          categoryElement.addEventListener("click", () => {
            // Remove the "selected" class from any existing <li> elements
            const selectedCategory =
              body.querySelectorAll(".category.selected");

            if (selectedCategory.length > 0) {
              selectedCategory.forEach((ele) =>
                ele.classList.remove("selected")
              );
            }
            categoryElement.classList.add("selected");

            // Run pCallback
            if (pCallback && typeof pCallback === "function") {
              pCallback(category);
            }
          });

          // Preselected
          if (pPreSelected && pPreSelected === category.id) {
            categoryElement.click();
          }

          appendHTML([categoryName, selectedCategoryIcon], categoryElement);
          return categoryElement;
        };

        // Section - no category
        const sectionNoCategory = () => {
          const sectionNoCategory = createHTML("section", {
            class: "section-no-category",
          });

          const category = createHTML("li", {
            class: `category ${!pPreSelected ? "selected" : ""}`,
          });
          const categoryName = createHTML(
            "li",
            { class: "category-name" },
            "Not selected"
          );
          const selectedCategoryIcon = createHTML("i", {
            class: "ph-fill ph-check-circle",
          });

          appendHTML([categoryName, selectedCategoryIcon], category);
          appendHTML(category, sectionNoCategory);

          // Add Event Listener
          category.addEventListener("click", () => {
            // Remove the "selected" class from any existing <li> elements
            const selectedCategory =
              body.querySelectorAll(".category.selected");

            if (selectedCategory.length > 0) {
              selectedCategory.forEach((ele) =>
                ele.classList.remove("selected")
              );
            }
            category.classList.add("selected");

            // Run pCallback
            if (pCallback && typeof pCallback === "function") {
              pCallback();
            }
          });

          return sectionNoCategory;
        };

        // Section - category
        const sectionParentCategories = () => {
          const sectionParentCategories = createHTML("section", {
            class: "section-parent-categories",
          });

          parentCategories.forEach((parentCategory) => {
            const categoryElement = createCategoryElement(parentCategory);
            appendHTML(categoryElement, sectionParentCategories);
          });

          return sectionParentCategories;
        };

        appendHTML([sectionNoCategory(), sectionParentCategories()], body);
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
