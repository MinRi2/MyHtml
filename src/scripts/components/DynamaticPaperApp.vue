<script setup lang="ts">
import { onMounted, provide, reactive, ref, watch, watchEffect } from "vue";
import Clock from './Clock.vue';
import TimeBar from './TimeBar.vue';
import Courses from './courses/Courses.vue';
import PicturePaper from './PicturePaper.vue';
import EventTimer from "./EventTimer.vue";
import Hotboard from "./Hotboard.vue";
import WeatherForcast from './WeatherForcast.vue';
import PaperOptions from "../paperOptions";
import { clone, mergeObjFrom } from "../utils/objectUtils";
import { dateOffset, TimeInterval, toDate, weekStartDate } from "../utils/dateUtils";
import { ElementGroup, GroupedElement } from "../types/elementGroup";
import { coursesData } from "../types/courses";

const defaultOptions: PaperOptions = {
    dateOffsetSeconds: 0,
    weekStartDate: "",

    picturePaper: {
        unsplashKey: "",
        enableUnsplash: true,
        fetchCount: 60,
        fetchInterval: 5,
        nextPageInterval: 5,
    },
    courses: {
        nextDayTime: "",
        defaultHeads: [],
        defaultSchedules: [],
        daySpecials: {},
        specialCourses: [],
        headsOrder: {},
    },
    timeBar: {
        defaultBar: []
    },
    eventTimer: {
        events: [],
    },
    weather: {
        hefengKey: "",
        chartMoveSeconds: 10,
        showWithin: [],
        show7dWithin: [],
    },
    hotboard: {
        groupSize: 4,
        maxRound: 5,
        updateCardPerMinute: 5,
        wenYanWen: {
            enable: false,
            replaceIndex: 20,
            startWeek: 2,
            startPage: 75,
            setpPage: 2,
            text: [],
        }
    },
    courseColorMap: {},
    courseFullNameMap: {},
    headFullNameMap: {}
}

var options = reactive<PaperOptions>(clone(defaultOptions));

coursesData.headFullNameMap = options.headFullNameMap;
coursesData.courseFullNameMap = options.courseFullNameMap;
coursesData.courseColorMap = options.courseColorMap;

watchEffect(() => {
    dateOffset.value = (options.dateOffsetSeconds ?? 0) * 100;
});

watchEffect(() => {
    const date = options.weekStartDate;
    weekStartDate.value = toDate(date);
});

const connectInterval = new TimeInterval(() => {
    const socket = new WebSocket("ws://localhost:3000/config");

    socket.onmessage = (event: MessageEvent<any>) => {
        const serverOptions: PaperOptions = JSON.parse(event.data);

        mergeObjFrom(options, serverOptions, defaultOptions);
    }

    socket.onclose = () => {
        connectInterval.enable();
    }

    connectInterval.disable();
}, 3 * 1000);

const hotboardContainer = ref<HTMLElement>(),
    weatherBoardContainer = ref<HTMLElement>();

var leftBottomGroup: ElementGroup;
var hotboardElement = ref<GroupedElement>(),
    weatherElement = ref<GroupedElement>();

onMounted(() => {
    hotboardElement.value = new GroupedElement(hotboardContainer.value?.animate({
        offset: [0, 1.0],
        transform: ['', 'translate(-110%, 0)']
    }, {
        duration: 1000,
        fill: 'both',
        easing: 'ease-in-out',
    }));

    weatherElement.value = new GroupedElement(weatherBoardContainer.value?.animate({
        offset: [0, 1.0],
        transform: ['', 'translate(0, 110%)']
    }, {
        duration: 1000,
        fill: 'both',
        easing: 'ease-in-out',
    }));

    leftBottomGroup = new ElementGroup(
        hotboardElement.value,
        [weatherElement.value]
    )
});
</script>

<template>
    <!-- 背景 -->
    <PicturePaper :options="options.picturePaper"></PicturePaper>

    <!-- 课表 -->
    <div class="container container_courses">
        <Courses :options="options.courses"></Courses>
    </div>

    <!-- 倒计时 -->
    <div class="container container_timer">
        <EventTimer :options="options.eventTimer"></EventTimer>
    </div>

    <!-- 课条 -->
    <div class="container container_courses_bar">
        <TimeBar :options="options.timeBar"></TimeBar>
    </div>

    <!-- 时钟 日期 -->
    <div class="container container_clock">
        <Clock></Clock>
    </div>

    <!-- 今日热搜 -->
    <div class="container container_hot_board" ref="hotboardContainer">
        <Hotboard :options="options.hotboard" :hotboardElement="hotboardElement"></Hotboard>
    </div>

    <!-- 天气预报 -->
    <div class="container container_weather_board" ref="weatherBoardContainer">
        <WeatherForcast :options="options.weather" :weatherElement="weatherElement"></WeatherForcast>
    </div>
</template>

<style scoped>
.container_courses {
    position: absolute;
    left: 50%;
    transform: translate(-50%, 0);

    padding: 8px;
    width: fit-content;

    align-items: center;

    background-image: linear-gradient(to right bottom, #dcdcffaa, #729eceaa);
    backdrop-filter: blur(8px);
    border-radius: 45px;
    box-shadow: inset 0 0 8px rgba(255, 255, 255, 0.5);

    font-size: 75px;
    text-align: center;
}

.container_timer {
    flex-flow: column;
    align-items: center;

    position: absolute;
    bottom: 0;
    right: 0%;

    width: fit-content;
    margin: 0 auto;
    background-image: linear-gradient(to right bottom, #dcdcff66, #729eceaa);
    backdrop-filter: blur(6px);
    border-top-left-radius: 60px;
    border-top-right-radius: 60px;
    box-shadow: 2px 2px 4px rgba(0, 0, 0, 0.4),
        4px 4px 4px rgba(0, 0, 0, 0.2),
        -2px -2px 4px rgba(255, 255, 255, 0.5),
        -4px -4px 4px rgba(255, 255, 255, 0.7);
}

.container_courses_bar {
    justify-content: space-between;

    position: absolute;
    top: 35%;
    right: 0%;
    transform: translate(0%, -100%);

    background-image: linear-gradient(to right bottom, #dcdcffaa, #729eceaa);
    backdrop-filter: blur(8px);
    border-top-left-radius: 45px;
    border-bottom-left-radius: 45px;

    box-shadow: inset 0 0 8px rgba(255, 255, 255, 0.5);

    --text-shadow-color: black;
    font-size: 30px;
    color: white;
    overflow: hidden;
}

.container_clock {
    position: absolute;
    top: 50%;
    right: 0%;
    transform: translate(0%, -50%);

    flex-flow: column;
    align-items: end;
}

.container_hot_board {
    flex-flow: column;
    justify-content: start;
    align-items: center;

    position: absolute;
    bottom: 0;

    background:
        linear-gradient(to right, #729eceaa, #dcdcff66),
        radial-gradient(at center, #DCBFFF66, rgba(255, 255, 255, 0.1));
    backdrop-filter: blur(6px);
    border-top-right-radius: 30px;

    box-shadow: 2px 2px 4px rgba(0, 0, 0, 0.4),
        4px 4px 4px rgba(0, 0, 0, 0.2),
        -2px -2px 4px rgba(255, 255, 255, 0.5),
        -4px -4px 4px rgba(255, 255, 255, 0.7);

    width: 800px;
}

.container_weather_board {
    flex-flow: column;
    justify-content: start;
    align-items: stretch;

    position: absolute;
    bottom: 0;

    width: 900px;
    aspect-ratio: 4/3;

    background: linear-gradient(to right, #6190e8aa, #a7bfe8aa);
    background-size: 100% 100%;
    border-top-right-radius: 30px;

    box-shadow: 2px 2px 4px rgba(0, 0, 0, 0.4),
        4px 4px 4px rgba(0, 0, 0, 0.2),
        -2px -2px 4px rgba(255, 255, 255, 0.5),
        -4px -4px 4px rgba(255, 255, 255, 0.7);
}
</style>