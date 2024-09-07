<script setup lang="ts">
import { onMounted, ref, watchEffect } from 'vue';
import { InfoBarData } from '../types/info-bar';

const properies = defineProps<{
    data: InfoBarData,
}>();
</script>

<template>
    <div class="bar">
        <div class="background"></div>

        <div class="content">
            <slot></slot>
        </div>

        <div class="color_block" :style="{
            right: `${(1 - properies.data.progress) * 100}%`,
            backgroundImage: properies.data.lineaner
        }"></div>
    </div>

</template>

<style scoped>
.bar {
    position: relative;

    width: 100%;
    height: 100%;

    border-radius: 5px;

    transform: translateY(-50%);

    overflow: hidden;
}

.background {
    background-color: rgba(255, 255, 255, 0.2);
    transform: skewX(-15deg);
}

.color_block {
    position: absolute;
    top: 0;
    right: 100%;

    width: 100%;
    height: 100%;

    filter: opacity(35%) blur(2px);
    box-shadow: 4px 8px #121212;

    transition: all ease-in-out 3s;
    transform: skewX(-15deg);
}

.content {
    position: absolute;

    top: 50%;
    left: 0;

    padding: 8px;
    transform: translateY(-50%);

    z-index: 1;
}
</style>