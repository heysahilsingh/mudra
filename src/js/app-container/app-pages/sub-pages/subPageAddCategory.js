import { dbCategories } from "../../../db.js";
import {
  appendHTML,
  closeSubPage,
  consoleError,
  createHTML,
  popMsg,
} from "../../../helper.js";
import { subPageIconPicker } from "./subPageIconPicker.js";
import { subPageParentCategoryPicker } from "./subPageParentCategoryPicker.js";

export function subPageAddCategory(pObject) {
  /* IMPORTANT NOTES TO BE NOTED
    1. To call this function, subPageAddCategory({}).
    */

  if (document.querySelector(".app .app-page")) {
    // Select Parent Page
    const parentPage = document.querySelector(".app .app-page");

    // Destructure parameter pObject
    const { pCategoryType, pEditCategory, pCallback } = pObject;

    // Sub Page
    const page = createHTML("div", { class: "sub-page add-category" });

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
          pCategoryType ? `Add ${pCategoryType} Category` : "Add Category"
        );


        // Done Icone
        const closeIcon = createHTML("i", { class: "ph ph-x" });

        // Click event on Back and Done button
        [btnBack, closeIcon].forEach(btn => {
          btn.addEventListener("click", () => {
            closeSubPage(page)
          })
        })

        appendHTML([btnBack, heading, closeIcon], header);
        return header;
      })();

      // Page Body
      const body = (() => {
        const body = createHTML("div", { class: "body" });

        let addCategory = {};

        // Section - Category
        const sectionCategory = (() => {
          const sectionCategory = createHTML("section", { class: `section-category ${pEditCategory ? "edit-category" : "add-category"}` });

          // Category
          const category = createHTML("div", { class: "category" });
          const categoryIcon = createHTML("i", { class: "icon", id: "" }, "Select icon");
          const categoryName = createHTML("input", { class: "category-name", type: "text", placeholder: "Category name" });
          const categoryDescription = createHTML("div", { class: "category-description" });
          const categoryDescriptionIcon = createHTML("i", { class: "ph-bold ph-text-align-left" });
          const categoryDescriptionInput = createHTML("input", { type: "text", placeholder: "Description" });

          categoryIcon.addEventListener("click", () => {
            subPageIconPicker({
              pSelectedIconId: categoryIcon.getAttribute("id"),
              pCallback: (iconId) => {
                categoryIcon.setAttribute("id", iconId);
                categoryIcon.className = `icon ${iconId}`
              }
            })
          })

          appendHTML([categoryDescriptionIcon, categoryDescriptionInput], categoryDescription);
          appendHTML([categoryIcon, categoryName], category);
          appendHTML([category, categoryDescription], sectionCategory)

          // Parent Category
          const parentCategory = createHTML("div", { class: "parent-category", id: "" });
          const parentCategoryIcon = createHTML("i", { class: `icon` });
          const parentCategoryName = createHTML("p", { class: "parent-category-name" }, "");
          const parentCategoryNamePlaceholder = createHTML("p", { class: "parent-category-name-placeholder" }, "Select Parent Category");

          parentCategory.addEventListener("click", () => {
            subPageParentCategoryPicker({
              pCategoryType: pCategoryType,
              pPreSelected: parentCategory.getAttribute("id"),
              pCallback: (value) => {
                if (value) {
                  parentCategory.setAttribute("id", value.id)
                  parentCategoryIcon.className = `icon ${value.icon}`;
                  parentCategoryName.textContent = value.name;
                  parentCategoryName.classList.add("present");
                } else{
                  parentCategory.setAttribute("id", "")
                  parentCategoryIcon.className = `icon`;
                  parentCategoryName.textContent = "";
                  parentCategoryName.classList.remove("present");
                }
              }
            })
          })

          appendHTML([parentCategoryIcon, parentCategoryName], parentCategory);
          appendHTML(parentCategory, sectionCategory);


          // Buttons
          const actionButtons = createHTML("div", { class: "action-buttons" });
          const deleteButton = createHTML("button", { class: "delete btn btn-stroke-red" }, "Delete");
          const saveButton = createHTML("button", { class: "save btn btn-primary" }, "Save");

          appendHTML([deleteButton, saveButton], actionButtons)
          appendHTML(actionButtons, sectionCategory)

          return sectionCategory
        })();

        appendHTML(sectionCategory, body)
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
