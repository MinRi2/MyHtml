<script setup lang="ts">
import { IntervalTask, dayStringMap, getSchoolDate, withinTime } from "../utils/dateUtils";
import animations from "../utils/animations";
import * as chroma from "chroma-js"
import { computed, onMounted, onUnmounted, reactive, ref, watch, watchEffect } from "vue";
import { BarSchedule } from "../types/timeBar";
import { TimeBarOptions } from "../paperOptions";
import { coursesData } from "../types/courses";
import InfoBar from "./InfoBar.vue";
import { InfoBarData } from "../types/info-bar";
import useColoredText from "../hooks/useColoredText";
import { useSingleArray } from "../hooks/useSingleObject";

const { daySchedules } = coursesData;

const {
    currentData: currentSchedule,
    popData: popSchedule,
    array: barSchedules
} = useSingleArray<BarSchedule>([]);

var lastColor = chroma.random().hex();
var shadowColor = ref("");

const customTextChangeFrames = {
    filter: ["", "blur(8px) contrast(300%)"],
    transform: ["", ""],
};

const barNameElem = ref<HTMLElement>(), barScheduleElem = ref<HTMLElement>();
const barNameData = useColoredText({
    frames: customTextChangeFrames,
}), barScheduleData = useColoredText({
    frames: customTextChangeFrames,
});

const barData: InfoBarData = reactive({
    linear: "",
    progress: 0,
});

const refreshBarInterval = new IntervalTask(() => refreshBar(), 3 * 1000, false);

const { options } = defineProps<{
    options: TimeBarOptions
}>();

onMounted(() => {
    barNameData.element = barNameElem.value;
    barScheduleData.element = barScheduleElem.value;

    refreshBarInterval.enable();

    watch(() => [options.extraBar, options.defaultBar, daySchedules], () => {
        readOptions();
        refreshBar();
    }, { deep: true, immediate: true });

    watch(currentSchedule, barSchedule => {
        if (!barSchedule) {
            barNameData.text = "-";
            barNameData.color = "white";
            barScheduleData.text = "";
            barData.linear = "";
            return;
        }

        const { name, startTime, endTime, color } = barSchedule;

        shadowColor.value = color;
        const gradientColor = chroma.scale([lastColor, color]).mode("lab").colors(8).join(",");

        barNameData.text = name;
        barNameData.color = color;
        barScheduleData.text = `${startTime}-${endTime}`;
        barData.linear = `linear-gradient(to right, ${gradientColor})`;
    }, { immediate: true });
});

onUnmounted(() => {
    refreshBarInterval.disable();
});

function readOptions() {
    const { extraBar, defaultBar } = options;

    const today = getSchoolDate().getDay();

    barSchedules.splice(0, barSchedules.length);

    const handleBarSchedules: BarSchedule[] = [];

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
    const schedule = currentSchedule.value;

    if (!schedule) {
        return;
    }

    const nowDate = getSchoolDate();
    const startDate = schedule.getStartDate(), endDate = schedule.getEndDate();

    if (withinTime(startDate, endDate, nowDate)) {
        barData.progress = (+nowDate - +startDate) / (+endDate - +startDate);
    } else {
        barData.progress = 0;

        if (nowDate > endDate) {
            lastColor = schedule.color;
            popSchedule(false);
        }
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
    <InfoBar :data="barData">
        <h1 id="bar_name" ref="barNameElem" :style="{
            '--text-shadow-color': shadowColor,
        }"></h1>
        <h2 id="time" ref="barScheduleElem"></h2>
    </InfoBar>

    <!-- <div class="bar_cutbox" :style="{
            width: fract * 2 * 100 + '%',
            backgroundImage: `linear-gradient(to right, ${gradientColor})`,
        }"></div> -->
</template>

<style scoped>
.bar {
    border-radius: 0px;
}

:deep(.content) {
    padding: 16px;
}

.bar h1 {
    font-weight: normal;
    font-size: 1em;
    text-shadow:
        1px 1px 3px var(--text-shadow-color),
        4px 4px 3px var(--text-shadow-color);
}

.bar h2 {
    font-weight: normal;
    font-size: 0.75em;
    text-shadow:
        1px 1px 3px var(--text-shadow-color),
        4px 4px 3px var(--text-shadow-color);
}
</style>