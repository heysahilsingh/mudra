import { dbAppSettings, updateDb } from "../../../db.js";
import { appendHTML, closeSubPage, createHTML, consoleError } from "../../../helper.js";

export function subPageCustomizeDashboard(callback) {
    /* IMPORTANT NOTES TO BE NOTED
    1. To call this function, subPageCustomizeDashboard({}).
    */
    if (document.querySelector(".app .app-page")) {
        // Select Parent Page
        const parentPage = document.querySelector(".app .app-page");

        // Sub Page
        const page = createHTML("div", { class: "sub-page customize-dashboard" });

        const pageWrapper = (() => {
            const pageWrapper = createHTML("div", { class: "sub-page-wrapper" });

            // Page Header
            const header = (() => {
                const header = createHTML("div", { class: "header" });

                // Back Button
                const btnBack = createHTML("i", { class: "ph ph-arrow-left" });

                // Page Heading
                const heading = createHTML("p", { class: "page-heading" }, "Customize dashboard");

                // Done Btn
                const doneIcon = createHTML("i", { class: "ph ph-check" });

                // Click event on Back and Done button
                [btnBack, doneIcon].forEach(btn => btn.addEventListener("click", () => closeSubPage(page)));

                appendHTML([btnBack, heading, doneIcon], header);

                return header;
            })();

            // Page Body
            const body = (() => {
                const body = createHTML("div", { class: "body" });

                // Function to Render Sections
                const renderSections = () => {
                    body.querySelector("ul.sections")?.remove();

                    const sections = createHTML("ul", { class: "sections" });

                    for (const section of dbAppSettings.pageDashboardSectionSequence) {
                        const li = createHTML("li", { class: "section", sF: section.sectionFunction, sA: `${section.sectionActive}` });
                        const liText = createHTML("p", {}, section.sectionName);
                        const liToggle = createHTML("input", { type: "checkbox" });

                        if (section.sectionActive) {
                            liToggle.checked = true
                        }

                        liToggle.addEventListener("change", () => updateDbAppSettingsPageDashboardSectionSequence(sections));

                        const liDrag = createHTML("i", { class: "drag-icon ph-bold ph-dots-six-vertical" });

                        appendHTML([liText, liToggle, liDrag], li)
                        appendHTML(li, sections)
                    }

                    // Apply drag functionality
                    applyDrag(sections)

                    return sections
                };

                appendHTML(renderSections(), body)
                return body;
            })();

            // Helper function - apply drag functionality
            function applyDrag(itemsContainer) {
                // Apply the "apply-drag" CSS class to the itemsContainer element
                itemsContainer.classList.add("apply-drag");
                // Get all list items within the itemsContainer element
                let children = itemsContainer.getElementsByTagName("li"), current = null;

                // Utility function to detect whether the device is a touchscreen or not
                const isTouchDevice = () => {
                    return 'ontouchstart' in window || navigator.maxTouchPoints > 0 || navigator.msMaxTouchPoints > 0;
                };

                // Loop through all list items
                for (let child of children) {
                    // Make each list item draggable
                    child.draggable = true;

                    // Function to handle drag start (both desktop and touchscreen)
                    const dragStartHandler = e => {
                        current = child;
                        // Add "drop-zone" class to all other list items to show yellow highlight as drop zones
                        for (let it of children) {
                            if (it !== current) { it.classList.add("drop-zone"); }
                        }
                        // Add "being-dragged" class to the item being dragged
                        current.classList.add("being-dragged");
                    };

                    // Function to handle drag end (both desktop and touchscreen)
                    const dragEndHandler = () => {
                        // Remove all "drop-zone" class to remove highlights
                        for (let it of children) {
                            it.classList.remove("drop-zone");
                        }
                        // Remove "being-dragged" class from the item being dragged
                        current.classList.remove("being-dragged");

                    };

                    // Function to handle drag over (desktop only)
                    const dragOverHandler = e => e.preventDefault();

                    // If the device is a touchscreen, use touch event listeners
                    if (isTouchDevice()) {
                        child.ontouchstart = dragStartHandler; // Touchstart to initiate drag
                        child.ontouchend = dragEndHandler; // Touchend to end drag and remove highlights
                        child.ontouchmove = e => {
                            e.preventDefault();
                            const touch = e.touches[0];
                            const elementFromPoint = document.elementFromPoint(touch.clientX, touch.clientY);
                            // Swap the positions of the dragged item and the element it's hovering over
                            if (elementFromPoint && elementFromPoint.tagName === "LI" && elementFromPoint !== current) {
                                if (current.offsetTop < elementFromPoint.offsetTop) {
                                    // Update position of the element
                                    elementFromPoint.parentNode.insertBefore(current, elementFromPoint.nextSibling);
                                } else {
                                    // Update position of the element
                                    elementFromPoint.parentNode.insertBefore(current, elementFromPoint);
                                }

                                // Run function when dragged and dropped
                                updateDbAppSettingsPageDashboardSectionSequence(itemsContainer)
                            }
                        };
                    } else {
                        // If it's a desktop, use drag event listeners
                        child.ondragstart = dragStartHandler; // Dragstart to initiate drag
                        child.ondragend = dragEndHandler; // Dragend to end drag and remove highlights
                        child.ondragover = dragOverHandler; // Dragover to prevent default "drop" behavior and allow custom sorting
                        child.ondrop = e => {
                            e.preventDefault();
                            if (child !== current) {
                                let currentpos = 0, droppedpos = 0;
                                // Get the current and dropped positions of the list items
                                for (let it = 0; it < children.length; it++) {
                                    if (current === children[it]) { currentpos = it; }
                                    if (child === children[it]) { droppedpos = it; }
                                }
                                // Insert the dragged item before or after the element it's hovering over
                                if (currentpos < droppedpos) {
                                    // Update position of the element
                                    child.parentNode.insertBefore(current, child.nextSibling);
                                } else {
                                    // Update position of the element
                                    child.parentNode.insertBefore(current, child);
                                }

                                // Run function when dragged and dropped
                                updateDbAppSettingsPageDashboardSectionSequence(itemsContainer)
                            }
                        };
                    }
                }
            }


            // Helper function - update dbAppSettings.pageDashboardSectionSequence
            function updateDbAppSettingsPageDashboardSectionSequence(container) {
                let newSequence = [];

                const items = container.querySelectorAll("li");

                for (const item of items) {
                    newSequence.push({
                        sectionName: item.querySelector("p").textContent,
                        sectionFunction: dbAppSettings.pageDashboardSectionSequence.find(sec => sec.sectionName === item.querySelector("p").textContent).sectionFunction,
                        sectionActive: item.querySelector("input").checked,
                    });

                }

                // Update dbAppSettings.pageDashboardSectionSequence
                dbAppSettings.pageDashboardSectionSequence = newSequence

                // Update db
                updateDb()

                // Run callback function
                if (callback && typeof callback === "function") {
                    callback(newSequence)
                }
            }

            appendHTML([header, body], pageWrapper);
            return pageWrapper;
        })();

        // Append
        appendHTML(pageWrapper, page);
        appendHTML(page, parentPage);
    } else {
        consoleError(".app-page HTML not found.");
    }
}