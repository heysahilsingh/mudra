import { dbCategories } from "../../../db.js";
import { appendHTML, closeSubPage, consoleError, createHTML, popMsg, } from "../../../helper.js";
import { subPageAddCategory } from "./subPageAddCategory.js";

export function subPageCategoryPicker(pObject) {
  /* IMPORTANT NOTES TO BE NOTED
  1. To call this function, subPageCategoryPicker({}).
  2. To specify the page heading, {pHeading: "Heading of the page"}
  3. To specifically open a category type tab, {pCategoryType: "expense"/"income"/"lend"/"borrow"}
  4. It is necessary to specify the mode, {pMode: "edit"/"select"}.
  5. If pMode === "select", then you can also allow the multiple selection, {pSelectMultiple: true}.
  6. To select pre selected category(ies), just pass the category Id(s) in an array, {pPreSelected: ["id of category"]}.
  7. To run a callback function, {pCallback: "your function"}.
  8. In callback function, you'll receive an array of selected category(ies)'s object(s).
  */

  if (document.querySelector(".app .app-page")) {
    // Select Parent Page
    const parentPage = document.querySelector(".app .app-page");

    // Destructure parameter pObject
    const { pHeading, pCategoryType, pMode, pSelectMultiple, pPreSelected, pCallback } = pObject;

    // Sub Page
    const page = createHTML("div", { class: "sub-page category-picker" });

    const pageWrapper = (() => {
      const pageWrapper = createHTML("div", { class: "sub-page-wrapper" });

      // Page Header
      const header = (() => {
        const header = createHTML("div", { class: "header" });

        // Back Button
        const btnBack = createHTML("i", { class: "ph ph-arrow-left" });

        // Click event on Back button
        btnBack.addEventListener("click", () => { closeSubPage(page); });

        // Page Heading
        const heading = createHTML("p", { class: "page-heading" }, pHeading ? pHeading : "Categories");

        appendHTML([btnBack, heading], header);

        // Edit/Done Button
        if (pMode === "select") {
          const edit = createHTML("div", { class: "edit" }, "Edit");
          const editIcon = createHTML("i", { class: "ph-fill ph-pencil-simple-line" });

          appendHTML(editIcon, edit);
          appendHTML(edit, header);

          edit.addEventListener("click", () => {
            subPageCategoryPicker({
              pHeading: "Edit Categories",
              pMode: "edit",
            });
          });
        } else {
          const doneIcon = createHTML("i", { class: "ph ph-check" });
          doneIcon.addEventListener("click", () => {
            closeSubPage(page);
          });
          appendHTML(doneIcon, header);
        }

        return header;
      })();

      // Page Body
      const body = (() => {
        const body = createHTML("div", { class: "body" });

        // Section Tabs
        const sectionTabs = (() => {
          const sectionTabs = createHTML("section", { class: "section-tabs" });

          // Tab Expenses
          const tabExpense = createHTML("div", { class: "tab tab-expenses active" }, "Expense");
          addTabEventListener(tabExpense, ["expense"]);

          // Tab Incomes
          const tabIncome = createHTML("div", { class: "tab tab-incomes" }, "Income");
          addTabEventListener(tabIncome, ["income"]);

          // Tab Lend/Borrow
          const tabLend = createHTML("div", { class: "tab tab-lend" }, "Lend");
          addTabEventListener(tabLend, ["lend"]);

          // Tab Lend/Borrow
          const tabBorrow = createHTML("div", { class: "tab tab-borrow" }, "Borrow");
          addTabEventListener(tabBorrow, ["borrow"]);

          // Event Listener
          function addTabEventListener(tab, type) {
            tab.addEventListener("click", () => {
              const activeTab = sectionTabs.querySelectorAll(".tab");

              if (activeTab.length > 0) {
                activeTab.forEach((tab) => tab.classList.remove("active"));
              }
              tab.classList.add("active");
              renderData(type);
            });
          }

          if (pCategoryType) {
            [tabExpense, tabIncome, tabBorrow, tabLend].forEach(tab => {
              if (tab.textContent.toLowerCase() === pCategoryType.toLowerCase()) {
                tab.classList.add("active")
                appendHTML(tab, sectionTabs)
              }
            })
          } else {
            appendHTML(
              [tabExpense, tabIncome, tabLend, tabBorrow],
              sectionTabs
            );
          }

          appendHTML(sectionTabs, body);
        })();

        // Section - Render data function
        function renderData(pCategoryEntryType) {
          body.querySelector(".section-categories")?.remove();

          const categories = dbCategories[pCategoryEntryType];
          let data = [];
          let returnArray = [];

          // Section - Categories
          const sectionCategories = (() => {
            const sectionCategories = createHTML("section", { class: "section-categories" });

            // Build Node for section-category
            categories.forEach((parentCategory) => {
              if (!parentCategory.isChild) {
                // Create category parent HTML elements
                const wrapper = createHTML("ul", { class: "category" });
                const categoryParent = createHTML("div", { class: "category-parent" }, parentCategory.name);
                const categoryParentIcon = createHTML("i", { class: `icon ${parentCategory.icon}` });

                appendHTML(categoryParentIcon, categoryParent);
                appendHTML(categoryParent, wrapper);
                appendHTML(wrapper, sectionCategories);

                // Find child categories
                const childCategories = categories.filter(childCategory => childCategory.parentId === parentCategory.id);

                // If child exists
                if (childCategories.length > 0) {
                  // Create category children HTML elements
                  const categoryChildrenWrapper = createHTML("div", { class: "category-children" });

                  // Create an array to hold child category data
                  const childData = childCategories.map((childCategory) => {
                    const categoryChild = createHTML("li", { class: "category-child" }, childCategory.name);

                    const categoryChildIcon = createHTML("i", { class: `icon ${childCategory.icon}` });

                    appendHTML(categoryChildIcon, categoryChild);
                    appendHTML(categoryChild, categoryChildrenWrapper);
                    appendHTML(categoryChildrenWrapper, wrapper);

                    return {
                      childHTML: categoryChild,
                      childObject: childCategory,
                    };
                  });

                  // Create parent category data object with child data
                  const parentData = {
                    parentHTML: categoryParent,
                    parentObject: parentCategory,
                    child: childData,
                  };

                  // Add parent data to the main data array
                  data.push(parentData);
                } else {
                  // If child doesn't exist
                  // Create parent category data object without child data
                  const parentData = {
                    parentHTML: categoryParent,
                    parentObject: parentCategory,
                  };

                  // Add parent data to the main data array
                  data.push(parentData);
                }
              }
            });

            // Add class and event listener
            data.forEach(parent => {
              // IF PMODE === "SELECT"
              if (pMode === "select") {
                // Add click event listener on parent category
                parent.parentHTML.addEventListener("click", () => {
                  onClickFunction({
                    elementHTML: parent.parentHTML,
                    elementObject: parent.parentObject,
                  });
                });

                // Add ".selected" class on parent category if pPreSelected is provided
                if (pPreSelected && pPreSelected.some(selected => selected === parent.parentObject.id)) parent.parentHTML.click();

                // On child category
                if (parent.child) {
                  // On child category
                  parent.child.forEach((child) => {
                    // Add click event listener
                    child.childHTML.addEventListener("click", () => {
                      onClickFunction({
                        elementHTML: child.childHTML,
                        elementObject: child.childObject,
                      });
                    });

                    // Add ".selected" class if pPreSelected is provided
                    if (pPreSelected && pPreSelected.some(selected => selected === child.childObject.id)) child.childHTML.click();
                  });
                }

              }
              // IF PMODE === "EDIT"
              else if (pMode === "edit") {
                // Add event listener on all parentCategory
                if (parent.parentObject.canEdit === false) {
                  parent.parentHTML.classList.add("default");
                  parent.parentHTML.addEventListener("click", () => {
                    popMsg("You can't edit this category", "warning");
                  });
                } else {
                  parent.parentHTML.addEventListener("click", () => {
                    subPageAddCategory({
                      pCategoryType: parent.parentObject.entryType,
                      pEditCategory: parent.parentObject,
                      pCallback: () => {
                        renderData(parent.parentObject.entryType)
                      }
                    })
                  });
                }

                // Add event listener on all childCategory
                if (parent.child) {
                  parent.child.forEach((child) => {
                    child.childHTML.addEventListener("click", () => {
                      subPageAddCategory({
                        pCategoryType: child.childObject.entryType,
                        pEditCategory: child.childObject,
                        pCallback: () => {
                          renderData(child.childObject.entryType)
                        }
                      })
                    });
                  });
                }
              }
            });

            // Helper Function - On Click Function
            function onClickFunction(p) {
              // Destructure passed argument
              const { elementHTML, elementObject } = p;

              if (pSelectMultiple && pSelectMultiple === true) {
                // Toggle class of parent category HTML
                elementHTML.classList.toggle("selected");

                // Add/Remove this parent category object from returnArray[]
                if (returnArray.length > 0) {
                  let found = false;
                  // Check if this parent category object exists in returnArray[] or not.
                  for (const value of returnArray) {
                    if (value.id === elementObject.id) {
                      found = true;
                      break;
                    }
                  }

                  // If not exists, then add
                  if (!found) {
                    returnArray.push(elementObject);
                  }
                  // If exists, then remove
                  else {
                    returnArray = returnArray.filter(
                      (value) => value.id !== elementObject.id
                    );
                  }
                } else {
                  returnArray.push(elementObject);
                }

                // Ensure to have at least one selected li
                const selectedLi = sectionCategories.querySelectorAll(
                  ".section-categories .selected"
                );
                if (selectedLi.length === 0) {
                  // If no category is selected, add the ".selected" class to the current elementHTML
                  elementHTML.classList.add("selected");
                  returnArray.push(elementObject);
                }
              } else {
                // Remove the "selected" class from any existing category element
                const selectedCategory = sectionCategories.querySelectorAll(
                  ".section-categories .selected"
                );

                if (selectedCategory.length > 0) {
                  selectedCategory.forEach((ele) =>
                    ele.classList.remove("selected")
                  );
                }
                elementHTML.classList.add("selected");

                // Push this category in returnArray[]
                returnArray = [elementObject];
              }

              // Run Callback
              if (pCallback && typeof pCallback === "function") {
                pCallback([...returnArray]);
              }
            }

            return sectionCategories;
          })();

          // Section - Add Category Button
          body.querySelector(".section-add-category")?.remove();

          const addCategory = createHTML("div", { class: "section-add-category" });
          const addCategoryIcon = createHTML("i", { class: "ph-fill ph-plus-circle" });
          addCategoryIcon.addEventListener("click", () => {
            subPageAddCategory({
              pCategoryType: pCategoryEntryType,
              pCallback: () => {
                renderData(pCategoryEntryType)
              }
            });
          });

          appendHTML(addCategoryIcon, addCategory)
          appendHTML(addCategory, body);
          appendHTML(sectionCategories, body);
          
        }

        renderData([pCategoryType ? pCategoryType : "expense"]);

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
