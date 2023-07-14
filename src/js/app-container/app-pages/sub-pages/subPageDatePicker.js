import { compDatePicker } from "../../../components.js";
import { dbAppSettings } from "../../../db.js";
import { appendHTML, closeSubPage, consoleError, createHTML, getDates, } from "../../../helper.js";

export function subPageDatePicker(parameter) {
  /* IMPORTANT NOTES TO BE NOTED
  1. To run this function simply call this function with an {}
  2. To automatically select the particular list, pass this property {selectedListId: "allTime / thisWeek / thisMonth / lastMonth / thisQuarter / LastQuarter / thisYear / lastYear / customSingle / customMultiple / customRange"}
  3. To prselect the dates in list customSingle, pass the date in array by using this property {selectedListDate : ["dd mmm yyyy"]}
  3.1. To prselect the dates in list customMultiple, pass the dates in array by using this property {selectedListDate : ["dd mmm yyyy", "dd mmmm yyyy", ...]}
  3.2. To prselect the dates in list customRange, pass the date in array by using this property {selectedListDate : ["from-to" / "dd mmmm yyyy-dd mmm yyyy"]}
  4. The callback {callback: "your function"} will be executed with and object {dates: "an array of selected dates", row: "the object of that selected row"}
  */

  if (document.querySelector(".app .app-page")) {
    // Select Parent Page
    const parentPage = document.querySelector(".app .app-page");

    // Destructure parameter
    const { selectedListId, selectedListDates, callback } = parameter;

    // Sub Page
    const page = createHTML("div", { class: "sub-page date-picker" });

    const pageWrapper = (() => {
      const pageWrapper = createHTML("div", { class: "sub-page-wrapper" });

      const today = new Date();
      let returnDatesArray = [];

      // Page Header
      const header = (() => {
        const header = createHTML("div", { class: "header" });

        const btnBack = createHTML("i", { class: "ph ph-arrow-left" });

        const heading = createHTML("p", { class: "page-heading" }, "Select Date Range");

        const done = createHTML("i", { class: "ph ph-check" });

        // Click event on btnBack and done
        [btnBack, done].forEach((el) => {
          el.addEventListener("click", () => {
            closeSubPage(page);
          });
        });

        appendHTML([btnBack, heading, done], header);
        return header;
      })();

      // Page Body
      const body = (() => {
        const body = createHTML("div", { class: "body" });

        // Section Predefined Dates
        const datesPredefined = (() => {
          const wrapper = createHTML("ul", { class: "dates-predefined" });

          // Date Ranges Data
          const rows = {
            allTime: {
              datesArray: getDates(today, dbAppSettings.firstTransaction),
              name: "All time",
              id: "allTime",
            },
            thisWeek: {
              datesArray: getDates(today, getFirstDayDate("thisWeek")),
              name: "This week",
              id: "thisWeek",
            },
            thisMonth: {
              datesArray: getDates(
                getFirstDayDate("thisMonth"),
                new Date(today.getFullYear(), today.getMonth() + 1, 0)
              ),
              name: "This month",
              id: "thisMonth",
            },
            lastMonth: {
              datesArray: getDates(
                getFirstDayDate("lastMonth"),
                getFirstDayDate("thisMonth")
              ).slice(1),
              name: "Last Month",
              id: "lastMonth",
            },
            thisQuarter: {
              datesArray: getDates(today, getFirstDayDate("thisQuarter")),
              name: "This quarter",
              id: "thisQuarter",
            },
            lastQuarter: {
              datesArray: getDates(
                getFirstDayDate("lastQuarter"),
                getFirstDayDate("thisQuarter")
              ).slice(1),
              name: "Last quarter",
              id: "lastQuarter",
            },
            thisYear: {
              datesArray: getDates(today, getFirstDayDate("thisYear")),
              name: "This year",
              id: "thisYear",
            },
            lastYear: {
              datesArray: getDates(
                getFirstDayDate("lastYear"),
                getFirstDayDate("thisYear")
              ).slice(0, -1),
              name: "Last year",
              id: "lastYear",
            },
          };

          // Append each dateRange li in dateRangesWrapper
          for (const row in rows) {
            if (rows.hasOwnProperty(row)) {
              // Create HTML
              const rowHTML = createHTML("li", { id: `${row}` }, `${rows[row].name}`);

              // Icon
              const liIcon = createHTML("i", { class: "ph-fill ph-check-circle", });

              if (selectedListId && selectedListId === rows[row].id) rowHTML.classList.add("selected");

              // Event Listener
              rowHTML.addEventListener("click", () => {
                // Set new dates to returnDatesArray[]
                returnDatesArray = [...rows[row].datesArray];

                // Run Callback For predefined Rows
                if (callback && typeof callback === "function") callback({ dates: returnDatesArray, row: rows[row] });

                // Remove/Add Class
                const selectedLi = body.querySelectorAll("li.selected");
                if (selectedLi) selectedLi.forEach((ele) => ele.classList.remove("selected"));
                rowHTML.classList.add("selected");

                // Remove p content of section datesCustom
                const pContent = body.querySelectorAll("li p.selected-date");
                if (pContent) {
                  for (const p of pContent) {
                    p.textContent = "";
                  }
                }
              });

              appendHTML(liIcon, rowHTML);
              appendHTML(rowHTML, wrapper);
            }
          }

          return wrapper;
        })();

        // Section Custom Dates
        const datesCustom = (() => {
          const wrapper = createHTML("ul", { class: "dates-custom" });

          // Date Ranges Data
          const rows = {
            customSingle: {
              name: "Custom Single Date",
              id: "customSingle",
              type: "single",
              content: selectedListDates || "",
              cFunction: (dates) => {
                returnDatesArray = [dates.date];
                const liContent = wrapper.querySelector(
                  `#${rows.customSingle.id} p`
                );
                updateP(liContent, dates.date);

                // Run parameter callback
                if (callback && typeof callback == "function") {
                  callback({ dates: returnDatesArray, row: rows.customSingle });
                }
              },
            },
            customMultiple: {
              name: "Custom Multiple Dates",
              id: "customMultiple",
              type: "multiple",
              content: selectedListDates || "",
              cFunction: (dates) => {
                returnDatesArray = dates.dates;
                const liContent = wrapper.querySelector(
                  `#${rows.customMultiple.id} p`
                );
                updateP(liContent, dates.dates);

                // Run parameter callback
                if (callback && typeof callback == "function") {
                  callback({
                    dates: returnDatesArray,
                    row: rows.customMultiple,
                  });
                }
              },
            },
            customRange: {
              name: "Custom Date Ranges",
              id: "customRange",
              type: "range",
              // content: selectedListDates || "",
              cFunction: (dates) => {
                returnDatesArray = getDates(dates.dateFrom, dates.dateTo);
                const liContent = wrapper.querySelector(
                  `#${rows.customRange.id} p`
                );
                updateP(liContent, `${dates.dateFrom} - ${dates.dateTo}`);

                // Run parameter callback
                if (callback && typeof callback == "function") {
                  callback({ dates: returnDatesArray, row: rows.customRange });
                }
              },
            },
          };

          // Append each dateRange li in dateRangesWrapper
          for (const row in rows) {
            if (rows.hasOwnProperty(row)) {
              // Create HTML
              const rowHTML = createHTML(
                "li",
                { id: `${row}` },
                `${rows[row].name}`
              );
              // Content
              const liContent = createHTML("p", { class: "selected-date" });
              // Icon
              const liIcon = createHTML("i", {
                class: "ph-fill ph-check-circle",
              });

              // For preselected row
              if (selectedListId && selectedListId === rows[row].id) {
                rowHTML.classList.add("selected");
                liContent.textContent = rows[row].content;
              }

              // Event Listener
              rowHTML.addEventListener("click", () => {
                // Remove/Add Class
                const selectedLi = body.querySelectorAll("li.selected");
                if (selectedLi) selectedLi.forEach((ele) => ele.classList.remove("selected"));
                rowHTML.classList.add("selected");

                // Remove p content
                const pContent = body.querySelectorAll("li p.selected-date");
                if (pContent) {
                  for (const p of pContent) {
                    p.textContent = "";
                  }
                }

                // Open Date Picker Lightbox
                compDatePicker({
                  type: rows[row].type,
                  dates: rows[row].content,
                  callback: rows[row].cFunction,
                });
              });

              appendHTML([liContent, liIcon], rowHTML);
              appendHTML(rowHTML, wrapper);
            }
          }

          // Update content of p
          function updateP(element, content) {
            element.textContent = content;
          }

          return wrapper;
        })();

        appendHTML([datesPredefined, datesCustom], body);
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

// Helper
function getFirstDayDate(arg) {
  const today = new Date();
  let year = today.getFullYear();
  let month = today.getMonth();

  switch (arg) {
    case "thisWeek":
      const day = today.getDay();
      const diff = today.getDate() - day + (day === 0 ? -6 : 1);
      return new Date(year, month, diff);
    case "thisMonth":
      return new Date(year, month, 1);
    case "lastMonth":
      month--;
      if (month < 0) {
        month = 11;
        year--;
      }
      return new Date(year, month, 1);
    case "thisQuarter":
      const quarterMonth = Math.floor(month / 3) * 3;
      return new Date(year, quarterMonth, 1);
    case "lastQuarter":
      month -= 3;
      if (month < 0) {
        month += 12;
        year--;
      }
      const lastQuarterMonth = Math.floor(month / 3) * 3;
      return new Date(year, lastQuarterMonth, 1);
    case "thisYear":
      return new Date(year, 0, 1);
    case "lastYear":
      return new Date(year - 1, 0, 1);
    default:
      return null;
  }
}
