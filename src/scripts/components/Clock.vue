<script setup lang="ts">
import { onMounted, onUnmounted, ref } from "vue";
import * as animations from "../utils/animations"
import { TimeInterval, getSchoolDate } from "../utils/dateUtils";

const clockYear = ref<HTMLElement>(), clockMonth = ref<HTMLElement>(), clockDay = ref<HTMLElement>();
const clockHour = ref<HTMLElement>(), clockMinute = ref<HTMLElement>(), clockSecond = ref<HTMLElement>();

const customTextChangeFrames = {
    filter: ["", "blur(10px)"],
    transform: ["", ""],
};

var dateInterval = new TimeInterval(refreshDate, 60 * 1000, false);
var dayInterval = new TimeInterval(refreshDay, 1000, false);

onMounted(() => {
    dateInterval.enable();
    dayInterval.enable();
});

onUnmounted(() => {
    dateInterval.disable();
    dateInterval.disable();
});

function refreshDate() {
    const nowDate = getSchoolDate();

    let year = "" + nowDate.getFullYear(),
        month = fixed(nowDate.getMonth() + 1),
        day = fixed(nowDate.getDate());

    if (clockYear.value) change(clockYear.value, year, 400);

    if (clockMonth.value) change(clockMonth.value, month, 400);

    if (clockDay.value) change(clockDay.value, day, 400);
}

function refreshDay() {
    const nowDate = getSchoolDate();

    let hour = fixed(nowDate.getHours()),
        minute = fixed(nowDate.getMinutes()),
        second = fixed(nowDate.getSeconds());

    if (clockHour.value) change(clockHour.value, hour, 500);

    if (clockMinute.value) change(clockMinute.value, minute, 500);

    if (clockSecond.value) change(clockSecond.value, second, 150);
}

function change(element: HTMLElement, time: string, duration: number) {
    if (!element) {
        return;
    }

    animations.textInnerHtmlChange({
        element: element,
        innerHTML: time,
        frames: customTextChangeFrames,
        options: {
            duration: duration,
        }
    });
}

function fixed(num: number): string {
    return ("" + num).padStart(2, "0");
}
</script>

<template>
    <div class="container date_block">
        <h1 id="clock_year" ref="clockYear"></h1>
        <h2>年</h2>
        <h1 id="clock_month" ref="clockMonth"></h1>
        <h2>月</h2>
        <h1 id="clock_day" ref="clockDay"></h1>
        <h2>日</h2>
    </div>
    <div class="container time_clock">
        <div class="time_clock_block">
            <div class="time" id="clock_hour" ref="clockHour"></div>
            <div class="unit">时</div>
        </div>
        <div class="splitter"></div>
        <div class="time_clock_block">
            <div class="time" id="clock_minute" ref="clockMinute"></div>
            <div class="unit">分</div>
        </div>
        <div class="splitter"></div>
        <div class="time_clock_block">
            <div class="time" id="clock_second" ref="clockSecond"></div>
            <div class="unit">秒</div>
        </div>
    </div>
</template>

<style scoped>
.date_block {
    align-items: end;
    margin: 10px;
    color: white;
    font-size: 80px;
}

.date_block h1 {
    display: inline-block;

    font-size: 1em;
    font-weight: normal;
    text-shadow:
        1px 1px 3px #729ece,
        3px 3px 3px #729ece,
        6px 6px 3px #729ece,
        9px 9px 3px #729ece;
}

.date_block h2 {
    display: inline-block;

    font-size: 0.8em;
    font-weight: normal;
    text-shadow:
        1px 1px 3px #729ece,
        3px 3px 3px #729ece,
        6px 6px 3px #729ece,
        9px 9px 3px #729ece;
}

.time_clock {
    width: 800px;
    aspect-ratio: 10/3;
}

.time_clock .time_clock_block {
    position: relative;
    flex: 1;

    margin: 8px;

    background: radial-gradient(circle at center, #dcdcff80 50%, #729ececc);
    backdrop-filter: blur(8px);
    border-radius: 60px;

    border-radius: 10%;
    box-shadow:
        2px 2px 4px rgba(0, 0, 0, 0.4),
        4px 4px 4px rgba(0, 0, 0, 0.2),
        -2px -2px 4px rgba(255, 255, 255, 0.5),
        -4px -4px 4px rgba(255, 255, 255, 0.7);
    overflow: hidden;
}

.time_clock .splitter {
    position: relative;
    width: 64px;
    --dot-size: 30px;
}

.time_clock .splitter::before {
    content: " ";
    position: absolute;
    left: 50%;
    top: 30%;
    transform: translate(-50%, -50%);

    width: var(--dot-size);
    height: var(--dot-size);
    border-radius: 50%;
    box-shadow:
        -5px -5px 5px rgba(0, 0, 0, 0.2) inset,
        5px 5px 5px rgba(255, 255, 255, 0.5) inset;
    background: radial-gradient(circle at center, #aaa, #729ece);
}

.time_clock .splitter::after {
    content: " ";
    position: absolute;
    left: 50%;
    top: 70%;
    transform: translate(-50%, -50%);

    width: var(--dot-size);
    height: var(--dot-size);
    border-radius: 50%;
    box-shadow:
        -5px -5px 5px rgba(0, 0, 0, 0.2) inset,
        5px 5px 5px rgba(255, 255, 255, 0.5) inset;
    background: radial-gradient(circle at center, #aaa, #729ece);
}

.time_clock_block .time {
    position: absolute;
    left: 50%;
    top: 40%;
    transform: translate(-50%, -50%);
    transform-origin: center;

    color: white;
    font-size: 130px;
    text-shadow:
        1px 1px 3px #2a2a2a,
        3px 3px 3px #2a2a2a,
        6px 6px 3px #2a2a2a,
        9px 9px 3px #2a2a2a;
}

.time_clock_block .unit {
    position: absolute;
    left: 50%;
    bottom: 0;
    transform: translate(-50%, 0);

    width: 100%;
    background: rgba(0, 0, 0, 0.2);
    backdrop-filter: blur(8px);

    color: white;
    font-size: 60px;
    text-align: center;
    text-shadow:
        1px 1px 3px #2a2a2a,
        3px 3px 3px #2a2a2a,
        6px 6px 3px #2a2a2a,
        9px 9px 3px #2a2a2a;
}
</style>