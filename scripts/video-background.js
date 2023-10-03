const videoFolder = "./videos/";
const videoUrls = [
    "littleCat.webm", "wheel.webm"
].map(url => videoFolder + url);

var videoIndex = 0;

const videoElem = document.getElementById("background_video"),
    currentPageText = document.getElementById("current-page"),
    lastPageButton = document.getElementById("last-page"),
    nextPageButton = document.getElementById("next-page");

refreshPage();
refreshBackground();

lastPageButton.addEventListener("click", () => {
    shiftIndex(-1);
});

nextPageButton.addEventListener("click", () => {
    shiftIndex(1);
});

function shiftIndex(n){
    videoIndex += n;
    videoIndex = videoIndex < 0 ? (videoUrls.length - 1) : (videoIndex >= videoUrls.length ? 0 : videoIndex);

    refreshPage();
    refreshBackground();
}

function refreshPage(){
    currentPageText.innerText = (videoIndex + 1) + "/" + videoUrls.length;
}

function refreshBackground(){
    videoElem.src = videoUrls[videoIndex];
}