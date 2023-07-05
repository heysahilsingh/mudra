import { dbCategories, dbTransactions } from "../../../db.js";
import { appendHTML, closeSubPage, createHTML } from "../../../helper.js";

export function subPageCategoryPicker(pObject) {
  /* IMPORTANT NOTES
  1. To call this sub page function, use subPageCategoryPicker({}).
  2. To specify the heading of the page, use {pHeading: "Heading of the page"}.
  3. It is necessary to specify the mode for initialization of the function {pMode: `either "select" or "edit"`}.
  //
  4. If {pMode: "select"}, you can allow selection of multiple categories by adding this property {pSelectMultiple: true}.
  5. To run callback, use {callback: "your callback function"}
  6. A callback function will run with an array of selected category(s) whenever any clickable category is being clicked. 
  */
  if (document.querySelector(".app .app-page")) {
    // Select Parent Page
    const parentPage = document.querySelector(".app .app-page");

    // Destructure parameter pObject
    const { pHeading, pMode, pSelectMultiple, pPreSelected, pCallback } =
      pObject;

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
        btnBack.addEventListener("click", () => {
          closeSubPage(page);
        });

        // Page Heading
        const heading = createHTML(
          "p",
          { class: "page-heading" },
          pHeading ? pHeading : "Categories"
        );

        appendHTML([btnBack, heading], header);

        // Edit/Done Button
        if (pMode === "select") {
          const edit = createHTML("div", { class: "edit" }, "Edit");
          const editIcon = createHTML("i", {
            class: "ph-fill ph-pencil-simple-line",
          });

          appendHTML(editIcon, edit);
          appendHTML(edit, header);

          edit.addEventListener("click", () => {
            subPageCategoryPicker({
              pHeading: "Edit Categories",
              pMode: "edit",
              pCallback: () => {
                console.log("pMode edit callback runned");
              },
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
          const tabExpenses = createHTML(
            "div",
            { class: "tab tab-expenses active" },
            "Expenses"
          );
          addTabEventListener(tabExpenses, ["expense"]);

          // Tab Incomes
          const tabIncomes = createHTML(
            "div",
            { class: "tab tab-incomes" },
            "Incomes"
          );
          addTabEventListener(tabIncomes, ["income"]);

          // Tab Lend/Borrow
          const tabLendBorrow = createHTML(
            "div",
            { class: "tab tab-lend-borrow" },
            "Lend/Borrow"
          );
          addTabEventListener(tabLendBorrow, ["lend", "borrow"]);

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

          appendHTML([tabExpenses, tabIncomes, tabLendBorrow], sectionTabs);
          appendHTML(sectionTabs, body);
        })();

        // Section - Render data function
        function renderData(types) {
          body.querySelector(".section-categories")?.remove();

          // Return data
          let returnArray = [];

          const sectionCategories = createHTML("section", {
            class: "section-categories",
          });

          // Iterate over "types" parameter
          types.forEach((type) => {
            const categories = dbCategories[type];

            categories.forEach((category) => {
              if (!category.isChild) {
                // Create wrapper
                const wrapper = createHTML("ul", { class: "category" });

                // Create Parent Category
                const categoryParent = createHTML(
                  "div",
                  { class: "category-parent" },
                  category.name
                );
                const categoryParentIcon = createHTML("i", {
                  class: `icon icon-${category.icon}`,
                });

                // Add .selected class if this category id is exists in pPreSelected[]
                if (
                  pPreSelected &&
                  pPreSelected.some((selected) => selected === category.id)
                ) {
                  categoryParent.classList.add("selected");
                  returnArray.push({ ...category });
                }

                // Append Parent category in wrapper
                appendHTML(categoryParentIcon, categoryParent);
                appendHTML(categoryParent, wrapper);

                // Check for any chldCategory presence.
                const childCategories = categories.filter(
                  (childCategory) => childCategory.parentId === category.id
                );

                // If childCategories does exists
                if (childCategories.length > 0) {
                  // Create Child Category
                  const categoryChildrenWrapper = createHTML("div", {
                    class: "category-children",
                  });

                  childCategories.forEach((childCategory) => {
                    const categoryChild = createHTML(
                      "li",
                      {
                        class: `category-child icon icon-${childCategory.icon}`,
                      },
                      childCategory.name
                    );

                    appendHTML(categoryChild, categoryChildrenWrapper);
                    appendHTML(categoryChildrenWrapper, wrapper);
                  });
                }
                // If childCategories dosen't exists
                else {
                  // Add Event Listener
                  // If multipleSelection is allowed
                  if (pSelectMultiple && pSelectMultiple === true) {
                    categoryParent.addEventListener("click", () => {
                      // Toggle class of parent category HTML
                      categoryParent.classList.toggle("selected");

                      // Add/Remove this parent category object from returnArray[]
                      if (returnArray.length > 0) {
                        let found = false;
                        // Check if this parent category object exists in returnArray[] or not.
                        for (const value of returnArray) {
                          if (value.id === category.id) {
                            found = true;
                            break;
                          }
                        }

                        // If not exists, then add
                        if (!found) {
                          returnArray.push(category);
                        }
                        // If exists, then remove
                        else {
                          returnArray = returnArray.filter(
                            (value) => value.id !== category.id
                          );
                        }
                      } else {
                        returnArray.push({ ...category });
                      }

                      // Ensure to have atleast one selected li
                      const selectedLi = sectionCategories.querySelectorAll(
                        "ul.category .selected"
                      );
                      if (selectedLi.length === 0) {
                        // If no <li> elements are selected, add the "selected" class to the current <li>
                        categoryParent.classList.add("selected");
                        returnArray.push({ ...category });
                      }

                      returnArray.push({ ...category });
                      console.log(returnArray);
                    });
                  }
                  // If multipleSelection not allowed
                  else {
                    categoryParent.addEventListener("click", () => {
                      // Remove the "selected" class from any existing category element
                      const selectedCategory =
                        sectionCategories.querySelectorAll(
                          "ul.category .selected"
                        );

                      if (selectedCategory.length > 0) {
                        selectedCategory.forEach((ele) =>
                          ele.classList.remove("selected")
                        );
                      }
                      categoryParent.classList.add("selected");

                      // Push this category in returArray[]
                      returnArray = [{ ...category }];
                      console.log(returnArray);
                    });
                  }
                }

                // Append wraper to sectionCategories
                appendHTML(wrapper, sectionCategories);
              }
            });
          });

          appendHTML(sectionCategories, body);
        }

        renderData(["expense"]);

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
