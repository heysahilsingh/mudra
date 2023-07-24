import { appendHTML, createHTML, popMsg, sentenceCase } from './helper.js';
import { dbAppSettings, updateDb } from "./db.js";
import { appContainer, screenApp } from "./screenApp.js";

export async function screenSignup() {
    const signup = createHTML("div", { class: "signup" });

    // Style
    const styleElement = (() => {
        const styles = `
        .signup {
            flex-grow: 1;
            display: flex;
            flex-direction: column;
            background-color: var(--c-bg);
          }
          
          .signup .step-wrapper {
            flex-grow: 1;
            padding: var(--body-padding) var(--body-padding) calc(var(--body-padding) * 5);
            display: flex;
            align-items: center;
            justify-content: center;
            flex-direction: column;
            gap: var(--body-padding);
          }
          
          .signup .step-wrapper button {
            width: 100%;
          }
          
          /* Step Enter Name */
          .signup .step-enter-name .input-wrapper{
            width: 100%;
          }
          
          .signup .step-enter-name input{
            width: -webkit-fill-available;
            padding: var(--body-padding);
            border-radius: var(--btn-border-radius);
            text-align: center;
            border: solid 2px var(--c-border);
            margin-bottom: calc(var(--body-padding) * 2);
          }
          
          .signup .step-enter-name input:focus{
            border: solid 2px var(--c-primary-100)
          }`;
        const styleElement = createHTML("style", { id: "signup" });
        styleElement.innerHTML = styles;
        document.head.appendChild(styleElement);
    })();

    // Step Enter Name
    const stepEnterName = () => {
        const wrapper = createHTML("div", { class: "step-enter-name step-wrapper" });

        const inputWrapper = createHTML("div", {class: "input-wrapper"});
        const inputText = createHTML("input", {type: "text", placeholder: "Write your name"});
        const inputButton = createHTML("button", {class: "btn"}, "Enter");
        const inputButtonIcon = createHTML("i", { class: "ph ph-arrow-right" });

        inputButton.addEventListener("click", () => {
            if (inputText.value.trim() === '') {
                popMsg("Please enter your name.", "error")
              } else{
                dbAppSettings.userName = sentenceCase(inputText.value);

                // Update db
                updateDb()

                // Remove screenSignup
                signup.remove();

                // Render screenApp
                screenApp();
              }
        })

        appendHTML(inputButtonIcon, inputButton)
        appendHTML([inputText, inputButton], inputWrapper)

        appendHTML(inputWrapper, wrapper)
        return wrapper
    }

    appendHTML(stepEnterName(), signup)
    return appendHTML(signup, appContainer)
}