import DynamaticPaperAppVue from "./DynamaticPaperApp.vue"
import { createApp } from "vue"
import "../css/style.css"
import background from "../images/default.png"


window.addEventListener("load", initDynamicPaper);
window.addEventListener("resize", resizeBody);

function initDynamicPaper() {
    const app = createApp(DynamaticPaperAppVue);


    resizeBody();

    app.mount("#app");

    document.body.style.background = `url(${background})`;
}

function resizeBody() {
    const app = document.querySelector("#app")! as HTMLElement;
    const { clientWidth, clientHeight } = document.body;

    const scaleX = clientWidth / 1920, scaleY = clientHeight / 1080;

    app.style.transform = `scale(${scaleX}, ${scaleY})`;
    app.style.transformOrigin = 'top left';
    app.style.width = '1920px';
    app.style.height = '1080px';
}