<script setup lang="ts">
import { Topics } from '../types/picturePaper';
import { createApi } from 'unsplash-js';
import { computed, onMounted, ref, watch, watchEffect } from 'vue';
import { Random } from 'unsplash-js/dist/methods/photos/types';
import { RandomParams } from 'unsplash-js/dist/methods/photos';
import { TimeInterval } from '../utils/dateUtils';
import { PicturePaperOptions } from '../paperOptions';
import { localUrl } from '../vars';

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

const imageLoaded: HTMLImageElement[] = [];
const urlLoaded: string[] = [];

var imageUrl = ref<string>("");
var index = 0;

const baseImageUrl = `${localUrl}/static/images`;

const fetchIntveral = new TimeInterval(() => {
    if (imageLoaded.length >= fetchCount) {
        fetchIntveral.disable();
    } else {
        fetchImages();
    }
}, 5 * 60 * 1000, false);

const nextPageInterval = new TimeInterval(() => {
    if (imageLoaded.length == 0) {
        return;
    }

    index++;

    index = index < 0 ? (imageLoaded.length - 1) : index >= imageLoaded.length ? 0 : index;

    imageUrl.value = imageLoaded[index].src;
}, 5 * 60 * 1000, false);

watch(() => options.images, images => {
    if (!images) return;

    images.forEach((url: string) => {
        preloadImage(`${baseImageUrl}/${url}`);
    });
}, { deep: true });

watchEffect(() => {
    fetchCount = options.fetchCount;

    fetchIntveral.enable();

    fetchIntveral.setInterval(options.fetchInterval * 60 * 1000);
    nextPageInterval.setInterval(options.nextPageInterval * 60 * 1000);
});

watch(() => options.topics, value => {
    randomParams.topicIds = value ?? [Topics.nature];
})

onMounted(() => {
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
            const url = `${randomImage.urls.raw}&${imageParams}`;

            preloadImage(url);
        });
    }
}

function preloadImage(url: string) {
    if (urlLoaded.includes(url)) {
        return;
    }

    const image = new Image();
    image.onload = () => {
        imageLoaded.push(image);
    }
    image.src = url;

    urlLoaded.push(url);
}
</script>

<template>
    <div class="background" :style="{
        background: `url(${imageUrl})`,
        backgroundSize: '100%',
        backgroundRepeat: 'no-repeat',
    }"></div>
</template>