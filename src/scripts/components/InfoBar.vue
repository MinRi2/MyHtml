<script setup lang="ts">
import { onMounted, ref, watch, watchEffect } from 'vue';
import { InfoBarData } from '../types/info-bar';
import * as animations from '../utils/animations';
import { color } from 'echarts';

const properies = defineProps<{
    data: InfoBarData,
}>();

const contentElement = ref<HTMLElement>();

onMounted(() => {
    watchEffect(() => {
        const e = contentElement.value!;

        const name = properies.data.name;
        const color = properies.data.color ?? "white";

        animations.change({
            element: e,
            shouldChange: () => true,
            changeConsumer: () => {
                e.textContent = name;
                e.style.setProperty("--color", color);
            },
            frames: {
                offset: [0, 1],
                transform: ["translate(0%, -50%)", "translate(-120%, -50%)"],
                filter: ["", "blur(4px)"],
            },
            options: {
                duration: 2000,
                easing: "cubic-bezier(0.42, 0, 0.58, 1)",
            }
        })
    })
})

</script>

<template>
    <div class="bar">
        <div class="content" ref="contentElement"></div>

        <div class="color_block" :style="{
            width: `${((properies.data.progress + 1) / 2) * 100}%`,
            backgroundImage: properies.data.lineaner
        }"></div>
    </div>
</template>

<style scoped>
.bar {
    width: 100%;
    height: 100%;

    border-radius: 5px;

    background-color: rgba(255, 255, 255, 0.2);
    transform: translateY(-50%);

    overflow: hidden;

}

.color_block {
    height: 100%;

    filter: opacity(35%) blur(2px);
    box-shadow: 4px 8px #121212;

    transition: all ease-in-out 3s;
    transform: skewX(-15deg);
}

.content {
    --color: white;

    position: absolute;

    top: 50%;
    left: 0;

    padding: 8px;
    transform: translateY(-50%);

    text-shadow: 1px 1px 1px var(--color);
    lighting-color: var(--color);

    z-index: 1;
}
</style>