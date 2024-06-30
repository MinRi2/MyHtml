<script setup lang="ts">
import { TimeInterval, dayStringMap, getSchoolDate } from "../utils/dateUtils";
import * as animations from "../utils/animations";
import * as chroma from "chroma-js"
import { inject, onMounted, onUnmounted, ref, watch } from "vue";
import { BarSchedule } from "../types/timeBar";
import { TimeBarOptions } from "../paperOptions";
import { coursesData } from "../types/courses";
import { stringObj } from "../utils/typeUtils";

const { daySchedules } = coursesData;

const defaultBarSchedule = new BarSchedule("", "", "", "white");

const barSchedules: BarSchedule[] = [];

var lastColor = chroma.random().hex();
var currentSchedule = ref<BarSchedule | null>(defaultBarSchedule);

var fract = ref(0);
var shadowColor = ref("");
var gradientColor = ref("");

const barNameElem = ref(null), barScheduleElem = ref(null);
const customTextChangeFrames = {
    filter: ["", "blur(8px) contrast(300%)"],
    transform: ["", ""],
};

const refreshBarInterval = new TimeInterval(() => refreshBar(), 3 * 1000, false);

const { options } = defineProps<{
    options: TimeBarOptions
}>();

onMounted(() => {
    refreshBarInterval.enable();

    watch(() => [options.extraBar, options.defaultBar, daySchedules], () => {
        readOptions();
        refreshBar();
    }, { deep: true });
});

onUnmounted(() => {
    refreshBarInterval.disable();
});

function readOptions() {
    const { extraBar, defaultBar } = options;

    const today = getSchoolDate().getDay();

    barSchedules.splice(0, barSchedules.length);

    const handleBarSchedules: BarSchedule[] = [];
    currentSchedule.value = null;

    if (extraBar) {
        const todayName = dayStringMap[today];
        const todayBar = extraBar[todayName];

        if (todayBar) {
            const extraBarSchedules = BarSchedule.toBarSchedule(todayBar);
            handleBarSchedules.push(...extraBarSchedules);
        }
    }

    if (defaultBar) {
        const defaultBarSchedules = BarSchedule.toBarSchedule(defaultBar);
        handleBarSchedules.push(...defaultBarSchedules);
    }


    daySchedules[today].courseArray.forEach(course => {
        const { headName, courseName, schedule } = course;

        if (!courseName || courseName == "") return;

        let barHeadName = coursesData.getHeadFullName(headName);
        let barCourseName = coursesData.getCourseFullName(courseName);
        let barColor = coursesData.getCourseColor(courseName);

        const bar = new BarSchedule(`${barHeadName}: ${barCourseName}`, schedule.startTime, schedule.endTime, barColor);

        handleBarSchedules.push(bar);
    });

    addBarSchedules(handleBarSchedules);
}

function refreshBar() {
    const nowDate = getSchoolDate();

    if (barSchedules.length == 0) {
        currentSchedule.value = null;

        setStyle(defaultBarSchedule);
        return;
    }

    if (currentSchedule.value == null) {
        currentSchedule.value = barSchedules[0];

        setStyle(currentSchedule.value);
    } else {
        updateCutbox();

        const endDate = currentSchedule.value.getEndDate();

        if (endDate < nowDate) {
            barSchedules.splice(0, 1);
            lastColor = currentSchedule.value.color;
            currentSchedule.value = null;
        }
    }

    function updateCutbox() {
        if (!currentSchedule.value) {
            return;
        }

        const startDate = currentSchedule.value.getStartDate(),
            endDate = currentSchedule.value.getEndDate();

        if (nowDate > startDate) {
            fract.value = (+nowDate - +startDate) / (+endDate - +startDate);
        }

        if (nowDate < startDate || endDate < nowDate) {
            fract.value = 0;
        }
    }

    function setStyle(newSchedule: BarSchedule) {
        const { name, startTime, endTime, color } = newSchedule;

        shadowColor.value = color;
        gradientColor.value = chroma.scale([lastColor, color]).mode("lab").colors(8).join(",");

        const scheduleText = `${startTime}-${endTime}`;

        const nameElem = barNameElem.value,
            scheduleElem = barScheduleElem.value;

        if (nameElem) animations.textInnerHtmlChange({
            element: nameElem,
            innerHTML: name,
            frames: customTextChangeFrames,
            options: {
                duration: 1000,
            }
        });

        if (scheduleElem) animations.textInnerHtmlChange({
            element: scheduleElem,
            innerHTML: scheduleText,
            frames: customTextChangeFrames,
            options: {
                duration: 1000,
            }
        });
    }
}

/**
 * 添加BarSchedule
 * @param {Array<BarSchedule>} barScheduleArray
 */
function addBarSchedules(barScheduleArray: BarSchedule[]) {
    const nowDate = getSchoolDate();

    barScheduleArray = barScheduleArray.filter(b => b.getEndDate() >= nowDate);

    barSchedules.push(...barScheduleArray);
    barSchedules.sort((b1, b2) => {
        const d1 = b1.getStartDate(),
            d2 = b2.getStartDate();
        return +d1 - +d2;
    });
}
</script>

<template>
    <div class="bar">
        <div class="bar_cutbox" :style="{
            width: fract * 2 * 100 + '%',
            backgroundImage: `linear-gradient(to right, ${gradientColor})`,
        }"></div>

        <h1 id="bar_name" ref="barNameElem" :style="{
            '--text-shadow-color': shadowColor,
        }"></h1>
        <h2 id="time" ref="barScheduleElem"></h2>
    </div>
</template>

<style scoped>
.bar_cutbox {
    position: absolute;
    top: 50%;
    left: 0%;
    transform: translate(-50%, -50%);

    width: 0px;
    aspect-ratio: 1/1;
    border-radius: 50%;

    /* background-image: linear-gradient(to right, red, orange); */
    transition: all 2s linear;
}

.bar {
    padding: 16px;
    width: 15em;
}

.bar h1 {
    font-weight: normal;
    font-size: 1.5em;
    text-shadow:
        1px 1px 3px var(--text-shadow-color),
        4px 4px 3px var(--text-shadow-color);
}

.bar h2 {
    font-weight: normal;
    font-size: 1em;
    text-shadow:
        1px 1px 3px var(--text-shadow-color),
        4px 4px 3px var(--text-shadow-color);
}
</style>