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

        let addCategory = {
          id: pEditCategory?.id || getUniqueId("CAT"),
          name: pEditCategory?.name || "",
          description: pEditCategory && pEditCategory.description ? pEditCategory.description : "",
          isChild: pEditCategory?.isChild || false,
          parentId: pEditCategory?.parentId || null,
          icon: pEditCategory?.icon || "",
          entryType: pEditCategory?.entryType || pCategoryType
        };

        // Section - Category
        const sectionCategory = (() => {
          const sectionCategory = createHTML("section", { class: `section-category ${pEditCategory ? "edit-category" : "add-category"}` });

          // Category
          const category = createHTML("div", { class: "category" });
          const categoryIcon = createHTML("i", { class: `icon ${addCategory.icon}` }, "Select icon");
          const categoryName = createHTML("input", { class: "category-name", type: "text", placeholder: "Category name" });
          categoryName.value = addCategory.name;
          const categoryDescription = createHTML("div", { class: "category-description" });
          const categoryDescriptionIcon = createHTML("i", { class: "ph-bold ph-text-align-left" });
          const categoryDescriptionInput = createHTML("input", { type: "text", placeholder: "Description" });
          categoryDescriptionInput.value = addCategory.description;

          categoryIcon.addEventListener("click", () => {
            subPageIconPicker({
              pSelectedIconId: addCategory.icon,
              pCallback: (iconId) => {
                categoryIcon.className = `icon ${iconId}`

                // Update addCategory's icon property
                addCategory.icon = iconId;
              }
            })
          })

          appendHTML([categoryDescriptionIcon, categoryDescriptionInput], categoryDescription);
          appendHTML([categoryIcon, categoryName], category);
          appendHTML([category, categoryDescription], sectionCategory)

          // Parent Category
          function createParentCategory(pParentCategoryObject) {
            const parentCategoryObject = pParentCategoryObject ? dbCategories[pCategoryType].find(parentCategory => parentCategory.id === addCategory.parentId) : null;

            const parentCategory = createHTML("div", { class: "parent-category" });
            const parentCategoryIcon = createHTML("i", { class: `icon ${parentCategoryObject?.icon || ""}` });
            const parentCategoryName = createHTML("p", { class: `parent-category-name ${parentCategoryObject ? "present" : ""}` }, parentCategoryObject?.name || "");

            parentCategory.addEventListener("click", () => {
              subPageParentCategoryPicker({
                pCategoryType: pCategoryType,
                pPreSelected: addCategory.parentId,
                pCallback: (value) => {
                  if (value) {
                    parentCategoryIcon.className = `icon ${value.icon}`;
                    parentCategoryName.textContent = value.name;
                    parentCategoryName.classList.add("present");

                    // Update addCategory's parentId and isChild property
                    addCategory.parentId = value.id;
                    addCategory.isChild = true;

                  } else {
                    parentCategoryIcon.className = `icon`;
                    parentCategoryName.textContent = "";
                    parentCategoryName.classList.remove("present");

                    // Update addCategory's parentId and isChild property
                    addCategory.parentId = null;
                    addCategory.isChild = false;
                  }
                }
              })
            })

            appendHTML([parentCategoryIcon, parentCategoryName], parentCategory);
            appendHTML(parentCategory, sectionCategory);
          }

          if (pEditCategory) {
            if (addCategory.isChild === true) {
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
                pMessage: addCategory.isChild === true ? "Are you sure you want to delete this category? If you proceed, all related transactions will be transferred to the parent category." : "Are you sure you want to delete this category? Doing so will move all associated transactions and child categories to the default category." ,
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
              addCategory.name = categoryName.value;
              addCategory.description = categoryDescriptionInput.value;

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
