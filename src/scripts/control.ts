import DynamaticPaperAppVue from "./components/DynamaticPaperApp.vue"
import { createApp } from "vue"
import "../css/style.css"

window.addEventListener("load", initDynamicPaper);
window.addEventListener("resize", resizeBody);

function initDynamicPaper() {
    const app = createApp(DynamaticPaperAppVue);

    setTimeout(() => {
        app.mount("#app");
    }, 60 * 1000);

    resizeBody();
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