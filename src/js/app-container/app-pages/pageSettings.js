import { appendHTML, createHTML } from '../../helper.js';

export function pageSettings(){
    const pageSettings = createHTML("div", {class: "page page-settings"}, "Page settings");

    return pageSettings
}