<script setup lang="ts">
import { TimerEvent } from '../types/event-timer';
import { getSchoolDate, dateToString, IntervalTask, dayStringMap } from '../utils/dateUtils';
import animations from "../utils/animations";
import { computed, onMounted, onUnmounted, reactive, ref, watch } from 'vue';
import { EventTimerOptions, TimerEventOptions } from '../paperOptions';
import { coursesData } from '../types/courses';
import { format } from '../utils/stringUtils';
import useQuantumNum from '../hooks/useQuantumNum';

const { options } = defineProps<{
    options: EventTimerOptions,
}>();

//#region vars
const { daySchedules } = coursesData;

const timerEvents: TimerEvent[] = [];
const emptyEvent = new TimerEvent("", null, "00:00", Infinity);

const eventNameElem = ref<HTMLElement>(),
    eventEndTimeElem = ref<HTMLElement>(),
    eventDiscElem = ref<HTMLElement>();

const shadowColor = ref("white");

const timerDay = ref<HTMLElement>(),
    timerHour = ref<HTMLElement>(),
    timerMinute = ref<HTMLElement>(),
    timerSecond = ref<HTMLElement>();

const cutboxDay = ref<HTMLElement>(),
    cutboxHour = ref<HTMLElement>(),
    cutboxMinute = ref<HTMLElement>(),
    cutboxSecond = ref<HTMLElement>();

const displayDay = ref(0),
    displayHour = ref(0),
    displayMinute = ref(0),
    displaySecond = ref(0);

const dayPercent = useQuantumNum(0, 0, 10),
    hourPercent = useQuantumNum(0, 0, 10),
    minutePercent = useQuantumNum(0, 0, 10),
    secondPercent = useQuantumNum(0, 0, 10);

const showDay = computed(() => displayDay.value != 0),
    showHour = computed(() => showDay.value || displayHour.value != 0),
    showMinute = computed(() => showHour.value || displayMinute.value != 0),
    showSecond = computed(() => showMinute.value || displaySecond.value != 0);
//#endregion


var currentEvent: TimerEvent | undefined = undefined;
var lastEvent: TimerEvent | undefined = emptyEvent;

const customFrames = {
    fontSize: ["", "0px"],
    transform: ["", ""],
}

const refreshInterval = new IntervalTask(refreshTimer, 800, false);

onMounted(() => {
    refreshInterval.enable();

    watch(options.events, () => {
        readOptions();
    }, { immediate: true });
});

onUnmounted(() => {
    refreshInterval.disable();
});

function refreshTimer() {
    const nowDate = getSchoolDate();

    currentEvent = timerEvents.find((e: TimerEvent) => e.shouldTiming(nowDate));

    if (lastEvent !== currentEvent) {
        if (!currentEvent) {
            setInfo("The End", "", "", "");
        } else {
            const { name, endDate, discription, color } = currentEvent;
            setInfo(name, `End: ${dateToString(endDate)}`, discription, color);
        }

        lastEvent = currentEvent;
    }

    if (!currentEvent) {
        setTime(0, 0, 0, 0, emptyEvent);
        return;
    }

    const leftMiniSeconds = +currentEvent.endDate - +nowDate;

    let seconds = leftMiniSeconds / 1000,
        minutes = seconds / 60,
        hours = minutes / 60,
        days = hours / 24;

    seconds %= 60;
    minutes %= 60;
    hours %= 24;

    setTime(days, hours, minutes, seconds, currentEvent);

    function setInfo(name: string, endTimeText: string, discription: string, color: string) {
        shadowColor.value = color;

        if (eventNameElem.value) animations.textInnerHtmlChange({
            element: eventNameElem.value,
            innerHTML: name,
            frames: customFrames,
            options: {
                duration: 1500,
            }
        });

        if (eventEndTimeElem.value) animations.textInnerHtmlChange({
            element: eventEndTimeElem.value,
            innerHTML: endTimeText,
            frames: customFrames,
            options: {
                duration: 500,
                delay: 2000,
            }
        });

        if (eventDiscElem.value) animations.textInnerHtmlChange({
            element: eventDiscElem.value,
            innerHTML: discription,
            frames: customFrames,
            options: {
                duration: 1000,
                delay: 3000,
            }
        });
    }

    function setTime(days: number, hours: number, minutes: number, seconds: number, event: TimerEvent) {
        displayDay.value = Math.floor(days);
        displayHour.value = Math.floor(hours);
        displayMinute.value = Math.floor(minutes);
        displaySecond.value = Math.ceil(seconds);

        const { dayStart, hourStart, minuteStart, secondStart } = event;

        dayPercent.value = Math.min(1, days / dayStart);
        hourPercent.value = 100 - Math.floor(hours / hourStart * 100);
        minutePercent.value = 100 - Math.floor(minutes / minuteStart * 100);
        secondPercent.value = 100 - Math.floor(seconds / secondStart * 100);
    }
}

function readOptions() {
    const { events } = options;

    timerEvents.splice(0, timerEvents.length);

    const today = new Date().getDay();
    const todayDayName = dayStringMap[today];
    const todaySchedule = daySchedules[today];

    events.forEach((eventData: TimerEventOptions) => {
        const { order, discription, showOn, scheduleHead } = eventData;

        if (showOn && showOn.indexOf(todayDayName) == -1) {
            return;
        }

        let name = eventData.name, startDate, endDate, color;

        if (scheduleHead) {
            const scheduleCourse = todaySchedule.getCourse(scheduleHead);

            if (scheduleCourse) {
                const { headName, courseName, schedule } = scheduleCourse;
                const courseFullName = coursesData.getCourseFullName(courseName);
                const headFullName = coursesData.getHeadFullName(headName);

                name = name ? format(name, courseFullName, headFullName) : courseFullName;
                startDate = schedule.startTime;
                endDate = schedule.endTime;
                color = coursesData.getCourseColor(courseName);
            } else {
                console.warn(`Course: '${scheduleHead}' is undefined. Ignored it.`)
                return;
            }
        }

        startDate = eventData.startDate ?? startDate;
        endDate = eventData.endDate ?? endDate;
        color = eventData.color ?? color;

        const timerEvent = new TimerEvent(name, startDate, endDate, order, discription, color);

        timerEvents.push(timerEvent);
    });

    timerEvents.sort((e1: TimerEvent, e2: TimerEvent) => e1.order - e2.order);
}

</script>

<template>
    <div class="container" id="event_block">
        <h1 id="event_name" ref="eventNameElem" :style="{
            '--text-shadow-color': shadowColor,
        }"></h1>
        <div>
            <h2 ref="eventEndTimeElem"></h2>
            <h3 ref="eventDiscElem"></h3>
        </div>
    </div>
    <div class="container">
        <div class="timer_block" v-if="showDay">
            <div class="cutbox" ref="cutboxDay" :style="{
                top: `${dayPercent}%`,
                background: `#ff82829e`,
            }"></div>
            <h1 ref="timerDay">{{ displayDay }}</h1>
            <h2>天</h2>
        </div>

        <div class="timer_block" v-if="showHour">
            <div class="cutbox" ref="cutboxHour" :style="{
                top: `${hourPercent}%`,
                background: `#93ff829e`,
            }"></div>
            <h1 ref="timerHour">{{ displayHour }}</h1>
            <h2>时</h2>
        </div>

        <div class="timer_block" v-if="showMinute">
            <div class="cutbox" ref="cutboxMinute" :style="{
                top: `${minutePercent}%`,
                background: `#82c8ff9e`,
            }"></div>
            <h1 ref="timerMinute">{{ displayMinute }}</h1>
            <h2>分</h2>
        </div>

        <div class="timer_block" v-if="showSecond">
            <div class="cutbox" ref="cutboxSecond" :style="{
                top: `${secondPercent}%`,
                background: `#00bcd49e`,
            }"></div>
            <h1 ref="timerSecond">{{ displaySecond }}</h1>
            <h2>秒</h2>
        </div>
    </div>
</template>

<style scoped>
#event_block {
    --text-shadow-color: #444;
    flex-flow: column;
    align-items: center;

    width: 100%;

    color: white;
    border-bottom: 3px #444 solid;
    transition: all 1s ease-in-out;
}

#event_block h1 {
    display: inline-block;

    padding: 16px;
    margin: 0px 50px;
    border-radius: 30px;
    box-shadow:
        5px 5px 5px rgba(0, 0, 0, 0.2) inset,
        -5px -5px 5px rgba(255, 255, 255, 0.5) inset;

    font-weight: normal;
    font-size: 1em;

    text-shadow:
        3px 3px 3px var(--text-shadow-color),
        4px 4px 3px var(--text-shadow-color),
        5px 5px 3px var(--text-shadow-color),
        6px 6px 3px var(--text-shadow-color);
}

#event_block h2 {
    flex-grow: 1;
    display: inline-block;

    margin: 5px;

    font-size: 0.55em;
    font-weight: normal;
    text-shadow:
        3px 3px 3px var(--text-shadow-color),
        4px 4px 3px var(--text-shadow-color),
        5px 5px 3px var(--text-shadow-color),
        6px 6px 3px var(--text-shadow-color);
}

#event_block h3 {
    display: inline-block;

    margin: 5px;

    font-size: 0.5em;
    font-weight: normal;
    text-shadow:
        3px 3px 3px var(--text-shadow-color),
        4px 4px 3px var(--text-shadow-color),
        5px 5px 3px var(--text-shadow-color),
        6px 6px 3px var(--text-shadow-color);
}

.cutbox {
    position: absolute;
    top: 0;

    width: 100%;
    aspect-ratio: 1/1;

    /* transition: all 0.7s ease-in-out; */

    z-index: -2;
}

.timer_block {
    position: relative;

    color: white;
    width: 2.5em;
    aspect-ratio: 1/1;
    margin: 10px;
    background-color: rgba(255, 255, 255, 0.2);
    backdrop-filter: blur(6px);
    border-radius: 50%;
    box-shadow:
        5px 5px 5px rgba(0, 0, 0, 0.2),
        -5px -5px 5px rgba(255, 255, 255, 0.5);

    overflow: hidden;
    transform-origin: center;
    transition: all 1s ease-in-out;
}

.timer_block h1 {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    backface-visibility: hidden;

    margin: 0;
    padding: 0;

    font-size: 1em;
    text-shadow:
        1px 1px 3px #2a2a2a,
        3px 3px 3px #2a2a2a,
        6px 6px 3px #2a2a2a;
}

.timer_block h2 {
    position: absolute;
    left: 50%;
    bottom: 0;
    transform: translate(-50%, 0);

    margin: 0;
    padding: 0;
    width: 100%;
    background-color: rgba(0, 0, 0, 0.15);
    backdrop-filter: blur(8px);

    font-size: 0.5em;
    text-align: center;
    text-shadow:
        1px 1px 3px #2a2a2a,
        3px 3px 3px #2a2a2a;
}

#timer_blocks {
    margin: 25px 0 0 0;
}
</style>
