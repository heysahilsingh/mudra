import { compConfirmDialogBox } from "../../../components.js";
import { dbCategories, dbDeleteCategory, dbSaveCategory } from "../../../db.js";
import { appendHTML, closeSubPage, consoleError, createHTML, getUniqueId, popMsg, } from "../../../helper.js";
import { subPageIconPicker } from "./subPageIconPicker.js";
import { subPageParentCategoryPicker } from "./subPageParentCategoryPicker.js";

export function subPageAddCategory(pObject) {
  /* IMPORTANT NOTES TO BE NOTED
    1. To call this function, subPageAddCategory({}).
    2. It is necessary to specify the type of the category. {pCategoryType: "expense"/"income"/"lend"/"borrow"}.
    3. To edit a category, pass that category object, {pEditCategory: {"object of that category"}}.
    4. To run a callback function, when clicking on save button, {pCallback: "Your function"}
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
        const heading = createHTML("p", { class: "page-heading" }, pCategoryType ? `Add ${pCategoryType} Category` : "Add Category"
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
          const category = createHTML("div", { class: "category", id: pEditCategory?.id || getUniqueId("CAT") });
          const categoryIcon = createHTML("i", { class: `icon ${pEditCategory?.icon || ""}`, id: pEditCategory?.icon || "" }, "Select icon");
          const categoryName = createHTML("input", { class: "category-name", type: "text", placeholder: "Category name" });
          categoryName.value = pEditCategory ? pEditCategory.name : "";
          const categoryDescription = createHTML("div", { class: "category-description" });
          const categoryDescriptionIcon = createHTML("i", { class: "ph-bold ph-text-align-left" });
          const categoryDescriptionInput = createHTML("input", { type: "text", placeholder: "Description" });
          categoryDescriptionInput.value = pEditCategory && pEditCategory.description ? pEditCategory.description : "";

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
          function createParentCategory(pParentCategoryObject) {
            const parentCategoryObject = pParentCategoryObject ? dbCategories[pCategoryType].find(parentCategory => parentCategory.id === pEditCategory.parentId) : null;

            const parentCategory = createHTML("div", { class: "parent-category", id: parentCategoryObject?.id || "" });
            const parentCategoryIcon = createHTML("i", { class: `icon ${parentCategoryObject?.icon || ""}` });
            const parentCategoryName = createHTML("p", { class: `parent-category-name ${parentCategoryObject ? "present" : ""}` }, parentCategoryObject?.name || "");

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
                  } else {
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
          }

          if (pEditCategory) {
            if (pEditCategory && pEditCategory.isChild === true) {
              createParentCategory(pEditCategory.parentId)
            }
          }
          else {
            createParentCategory()
          }

          // Buttons
          const actionButtons = createHTML("div", { class: "action-buttons" });
          const saveButton = createHTML("button", { class: "save btn btn-primary" }, "Save");

          if (pEditCategory) {
            const deleteButton = createHTML("button", { class: "delete btn btn-stroke-red" }, "Delete");

            deleteButton.addEventListener("click", () => {
              compConfirmDialogBox({
                pButton1: "No",
                pButton2: "Yes",
                pMessage: "Deleting this category will cause all associated transaction(s) to be moved to the default category. Are you sure you want to delete?",
                pCallback: () => {
                  dbDeleteCategory(pEditCategory);
                  popMsg("Category deleted successfully.", "success")
                  closeSubPage(page);

                  // Run Callback
                  if (pCallback && typeof pCallback === "function") {
                    pCallback()
                  }
                }
              })
            })

            appendHTML(deleteButton, actionButtons)

          }

          // Save Button Event Listener
          saveButton.addEventListener("click", () => {
            // Check for category name
            if (categoryName.value.trim() === '') {
              popMsg("Please enter a category name.", "error")
            } else {
              addCategory.id = category.getAttribute("id");
              addCategory.name = categoryName.value;
              addCategory.description = categoryDescriptionInput.value;
              addCategory.icon = categoryIcon.getAttribute("id");
              addCategory.entryType = pCategoryType;

              if (body.querySelector(".parent-category")?.getAttribute("id")) {
                addCategory.isChild = true;
                addCategory.parentId = body.querySelector(".parent-category").getAttribute("id");
              }
              else {
                addCategory.isChild = false;
                addCategory.parentId = null;
              }

              dbSaveCategory(addCategory);
              popMsg("Category saved!", "success")
              closeSubPage(page);

              // Run Callback
              if (pCallback && typeof pCallback === "function") {
                pCallback()
              }
            }

          })

          appendHTML(saveButton, actionButtons)
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
