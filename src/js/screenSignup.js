import { appHTML } from "./main.js"
import { appendHTML, createHTML } from './helper.js';

export async function signup(){
    const signup = createHTML("div", {class: "signup"}, "Sign Up Page Rendered");
    return appendHTML(signup, appHTML)
}