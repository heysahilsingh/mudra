import { dbCategories } from "../../../db.js";
import { appendHTML, closeSubPage, consoleError, createHTML } from "../../../helper.js";

export function subPageCategoryPicker(pObject) {
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

        // Section - Add Category Button
        if (pMode === "edit") {
          const addCategory = createHTML("i", {
            class: "section-add-category ph-fill ph-plus-circle",
          });

          addCategory.addEventListener("click", () => {
            console.log("add category");
          });

          appendHTML(addCategory, body);
        }

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
          const tabLend = createHTML("div", { class: "tab tab-lend" }, "Lend");
          addTabEventListener(tabLend, ["lend"]);

          // Tab Lend/Borrow
          const tabBorrow = createHTML(
            "div",
            { class: "tab tab-borrow" },
            "Borrow"
          );
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

          appendHTML(
            [tabExpenses, tabIncomes, tabLend, tabBorrow],
            sectionTabs
          );
          appendHTML(sectionTabs, body);
        })();

        // Section - Render data function
        function renderData(pCategoryType) {
          body.querySelector(".section-categories")?.remove();

          const categories = dbCategories[pCategoryType];
          let data = [];
          let returnArray = [];

          // Section - Categories
          const sectionCategories = (() => {
            const sectionCategories = createHTML("section", {
              class: "section-categories",
            });

            // Build Node for section-category
            categories.forEach((parentCategory) => {
              if (!parentCategory.isChild) {
                // Create category parent HTML elements
                const wrapper = createHTML("ul", { class: "category" });
                const categoryParent = createHTML(
                  "div",
                  { class: "category-parent" },
                  parentCategory.name
                );
                const categoryParentIcon = createHTML("i", {
                  class: `icon ${parentCategory.icon}`,
                });

                appendHTML(categoryParentIcon, categoryParent);
                appendHTML(categoryParent, wrapper);
                appendHTML(wrapper, sectionCategories);

                // Find child categories
                const childCategories = categories.filter(
                  (childCategory) =>
                    childCategory.parentId === parentCategory.id
                );

                // If child exists
                if (childCategories.length > 0) {
                  // Create category children HTML elements
                  const categoryChildrenWrapper = createHTML("div", {
                    class: "category-children",
                  });

                  // Create an array to hold child category data
                  const childData = childCategories.map((childCategory) => {
                    const categoryChild = createHTML(
                      "li",
                      {
                        class: "category-child",
                      },
                      childCategory.name
                    );

                    const categoryChildIcon = createHTML("i", {
                      class: `icon ${childCategory.icon}`,
                    });

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
                }
                // If child dosen't  exists
                else {
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

            // Add class and eventlistener
            data.forEach((parentCategory) => {
              // IF MODE === "SELECT"
              if (pMode === "select") {
                // ADD ".SELECTED" CLASS IF PPRESELECTED PROVIDED
                // On childCategory
                if (parentCategory.child) {
                  parentCategory.child.forEach((childCategory) => {
                    if (
                      pPreSelected &&
                      pPreSelected.some(
                        (selected) => selected === childCategory.childObject.id
                      )
                    ) {
                      childCategory.childHTML.classList.add("selected");
                      returnArray.push(childCategory.childObject);
                    }
                  });
                }
                // On parentCategory
                else {
                  if (
                    pPreSelected &&
                    pPreSelected.some(
                      (selected) => selected === parentCategory.parentObject.id
                    )
                  ) {
                    parentCategory.parentHTML.classList.add("selected");
                    returnArray.push(parentCategory.parentObject);
                  }
                }

                // ADD CLICK EVENT LISTENER
                // If pSelectMultiple is provided and true
                if (pSelectMultiple && pSelectMultiple === true) {
                  // On parent category who don't have any child
                  if (!parentCategory.child) {
                    const elementHTML = parentCategory.parentHTML;
                    const elementObject = parentCategory.parentObject;

                    elementHTML.addEventListener("click", () => {
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

                      // Ensure to have atleast one selected li
                      const selectedLi = sectionCategories.querySelectorAll(
                        ".section-categories .selected"
                      );
                      if (selectedLi.length === 0) {
                        // If no category is selected, add the ".selected" class to the current elmementHTML
                        elementHTML.classList.add("selected");
                        returnArray.push(elementObject);
                      }

                      console.log(returnArray);
                    });
                  }
                  // On child category
                  else if (parentCategory.child) {
                    parentCategory.child.forEach((child) => {
                      const elementHTML = child.childHTML;
                      const elementObject = child.childObject;

                      elementHTML.addEventListener("click", () => {
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

                        // Ensure to have atleast one selected li
                        const selectedLi = sectionCategories.querySelectorAll(
                          ".section-categories .selected"
                        );
                        if (selectedLi.length === 0) {
                          // If no category is selected, add the ".selected" class to the current elmementHTML
                          elementHTML.classList.add("selected");
                          returnArray.push(elementObject);
                        }

                        console.log(returnArray);
                      });
                    });
                  }
                }
                // If pSelectMultiple not provided
                else {
                  // On parent category who don't have any child
                  if (!parentCategory.child) {
                    const elementHTML = parentCategory.parentHTML;
                    const elementObject = parentCategory.parentObject;

                    elementHTML.addEventListener("click", () => {
                      // Remove the "selected" class from any existing category element
                      const selectedCategory =
                        sectionCategories.querySelectorAll(
                          ".section-categories .selected"
                        );

                      if (selectedCategory.length > 0) {
                        selectedCategory.forEach((ele) =>
                          ele.classList.remove("selected")
                        );
                      }
                      elementHTML.classList.add("selected");

                      // Push this category in returArray[]
                      returnArray = [elementObject];
                      console.log(returnArray);
                    });
                  }
                  // On child category
                  else if (parentCategory.child) {
                    parentCategory.child.forEach((child) => {
                      const elementHTML = child.childHTML;
                      const elementObject = child.childObject;

                      elementHTML.addEventListener("click", () => {
                        // Remove the "selected" class from any existing category element
                        const selectedCategory =
                          sectionCategories.querySelectorAll(
                            ".section-categories .selected"
                          );

                        if (selectedCategory.length > 0) {
                          selectedCategory.forEach((ele) =>
                            ele.classList.remove("selected")
                          );
                        }
                        elementHTML.classList.add("selected");

                        // Push this category in returArray[]
                        returnArray = [elementObject];
                        console.log(returnArray);
                      });
                    });
                  }
                }
              }

              // IF MODE === "EDIT"
              else if (pMode === "edit") {
                // Add event listener on all parentCategory
                if (parentCategory.parentObject.canEdit === false) {
                  parentCategory.parentHTML.classList.add("default");
                } else {
                  parentCategory.parentHTML.addEventListener("click", () => {
                    console.log(parentCategory.parentObject);
                  });
                }

                // Add event listener on all childCategory
                if (parentCategory.child) {
                  parentCategory.child.forEach((child) => {
                    child.childHTML.addEventListener("click", () => {
                      console.log(child.childObject);
                    });
                  });
                }
              }
            });

            return sectionCategories;
          })();

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
