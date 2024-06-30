<script setup lang="ts">
import { Topics } from '../types/picturePaper';
import defaultImage from '../../images/default.jpg';
import { createApi } from 'unsplash-js';
import { computed, onMounted, ref, watch, watchEffect } from 'vue';
import { Random } from 'unsplash-js/dist/methods/photos/types';
import { RandomParams } from 'unsplash-js/dist/methods/photos';
import { TimeInterval } from '../utils/dateUtils';
import { PicturePaperOptions } from '../paperOptions';

const { options } = defineProps<{
    options: PicturePaperOptions,
}>();

var unsplashApp = computed(() => {
    if (!options.enableUnsplash) {
        return null;
    }

    return createApi({
        accessKey: options.unsplashKey,
    });
});

var fetchCount = 60;

const randomParams: RandomParams = {
    count: 5,
    topicIds: [Topics.nature],
}

const imageParams = new URLSearchParams({
    fit: "min",
    fill: "blur",
    w: "" + screen.width,
    h: "" + screen.height,
});

const loadedImages: HTMLImageElement[] = [];

var imageUrl = ref(defaultImage);
var index = 0;

const fetchIntveral = new TimeInterval(() => {
    if (loadedImages.length >= fetchCount) {
        fetchIntveral.disable();
    } else {
        fetchImages();
    }
}, 5 * 60 * 1000, false);

const nextPageInterval = new TimeInterval(() => {
    index++;

    index = index < 0 ? (loadedImages.length - 1) : index >= loadedImages.length ? 0 : index;

    imageUrl.value = loadedImages[index].src;
}, 5 * 60 * 1000, false);

watch(() => options.unsplashKey, () => {
    loadedImages.splice(1, loadedImages.length);
    fetchImages();
});

watchEffect(() => {
    fetchCount = options.fetchCount;

    fetchIntveral.enable();

    fetchIntveral.setInterval(options.fetchInterval * 60 * 1000);
    nextPageInterval.setInterval(options.nextPageInterval * 60 * 1000);

});

onMounted(() => {
    preloadImage(defaultImage);

    nextPageInterval.enable();
    fetchIntveral.enable();
});

function fetchImages() {
    const app = unsplashApp.value;

    if (app == null) {
        return;
    }

    app.photos.getRandom(randomParams).then(apiResponse => {
        const randomResponse = apiResponse.response;

        if (!randomResponse) {
            return;
        }

        if (Array.isArray(randomResponse)) {
            loadImages(randomResponse);
        } else {
            loadImages([randomResponse]);
        }
    })

    function loadImages(randomImages: Random[]) {
        randomImages.forEach(randomImage => {
            const url = randomImage.urls.raw + "&" + imageParams;

            preloadImage(url);
        });
    }
}

function preloadImage(url: string) {
    const image = new Image();
    image.onload = function () {
        loadedImages.push(image);
    }
    image.src = url;

}
</script>

<template>
    <div class="background" :style="{
        background: `url(${imageUrl})`,
        backgroundSize: '100%',
        backgroundRepeat: 'no-repeat',
    }"></div>
</template>