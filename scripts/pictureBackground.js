const background = document.getElementById("background_image");

const unsplashApi = "https://api.unsplash.com/";
const photoApi = unsplashApi + "photos/random/";
const key = "cCZHwgz7UVeRccvLqdB2ZshMqqCblxv71nhASlz9V1k";

const defaultImage = "./images/default.jpg";
const refreshImageTime = 5 * 60 * 1000;
const fetchImagesTime = 5 * 60 * 1000;

const fetchCount = 5;
const maxFetchCount = 60;

/** topic与id的对照表:
* bo8jQKTaE0Y=wallpapers
* CDwuwXJAbEw=3d-renders
* 6sMVjTLSkeQ=nature
* iUIsnVtjB0Y=textures-patterns
* M8jVbLbTRws=architecture-interior
* hmenvQhUmxM=film
* xHxYTMHLgOc=street-photography
* qPYsDzvJOYc=experimental
* Jpg6Kidl-Hk=animals
*/
const randomUrl = photoApi + "?" + new URLSearchParams({
    client_id: key,
    topics: "bo8jQKTaE0Y,Jpg6Kidl-Hk",
    count: fetchCount
});

const loadedImages = [];

setImage(defaultImage);

initImgaes();

function initImgaes(){
    initRandomImages();
    fetchImages();

    let fetchIntervalId;
    fetchIntervalId = setInterval(() => {
        if(loadedImages.length >= maxFetchCount){
            clearInterval(fetchIntervalId);
        }else{
            fetchImages();
        }
    }, fetchImagesTime);
}

function fetchImages(){
    fetch(randomUrl)
        .then(response => response.json())
        .then(loadImages);
}

function loadImages(imagesUrls){
    imagesUrls.forEach(imageData => {
        let url = imageData.urls.raw + "&fit=min&fill=blur&w=1920&h=1280";
        
        // 预加载图片
        preloadImage(url);
    });

    function preloadImage(url){
        let image = new Image();
        image.onload = function(){
            loadedImages.push(image);
        }
        image.src = url;
    }
}

function initRandomImages(){
    const currentPageText = document.getElementById("currentPage"),
        lastPageButton = document.getElementById("lastPage"),
        nextPageButton = document.getElementById("nextPage");
        
    let index = -1;

    currentPageText.addEventListener("click", () => {
        let url = index == -1 ? defaultImage : loadedImages[index].src;
        copy(url);
    });
    
    setInterval(() => {
        refreshPage();
        refreshImage();
    }, 500);

    setInterval(() => {
        shiftIndex(1);
    }, refreshImageTime);
    
    lastPageButton.addEventListener("click", () => {
        shiftIndex(-1);
    });
    
    nextPageButton.addEventListener("click", () => {
        shiftIndex(1);
    });
    
    function shiftIndex(n){
        index += n;
        index = index < -1 ? (loadedImages.length - 1) : index >= loadedImages.length ? -1 : index;

        refreshPage();
        refreshImage();
    }
    
    function refreshPage(){
        currentPageText.innerText = (index + 1) + "/" + loadedImages.length;
    }
    
    function refreshImage(){
        let url = index == -1 ? defaultImage : loadedImages[index].src;
        setImage(url);
    }
}

function setImage(url) {
    background.style.backgroundImage = "url('" + url + "')";
}

function copy(str){
    let transfer = document.createElement('input');

    document.body.appendChild(transfer);

    transfer.value = str;  // 这里表示想要复制的内容
    transfer.focus();
    transfer.select();

    if(document.execCommand("copy")){
        document.execCommand("copy");
    }

    transfer.blur();

    document.body.removeChild(transfer);
}