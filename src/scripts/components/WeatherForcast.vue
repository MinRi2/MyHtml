<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch, watchEffect } from 'vue';
import { WeatherChart, weatherChartType, WeatherTypeName } from '../types/wether-forcast-board';
import { WeatherForcastOptions } from '../paperOptions';
import { GroupedElement } from '../types/elementGroup';
import { TimeInterval, TimeWithinAll } from '../utils/dateUtils';

const props = defineProps<{
    options: WeatherForcastOptions,
    weatherElement: GroupedElement | undefined,
}>();

const { options } = props;
const weatherElement = computed(() => props.weatherElement);

var chart: WeatherChart = new WeatherChart();

const weatherLastUpdated = ref<HTMLElement>();
const weatherShowType = ref<HTMLElement>();
const weatherChart = ref<HTMLDivElement>();

var showWithinInterval: TimeWithinAll;
var show7dWithinInterval: TimeWithinAll;

var showTypeAuto = ref<WeatherTypeName>('24h');
var showTypeName = computed(() => {
    const force = options.showType;

    if (force) return force;

    return showTypeAuto.value;
});

const chartMoveInterval = new TimeInterval(() => {
    chart.moveChart();
}, 10 * 1000, false);

onMounted(() => {
    const chartElement = weatherChart.value;

    if (!chartElement) return;

    chart.mount(chartElement);

    chartMoveInterval.enable();

    watchEffect(() => {
        chartMoveInterval.setInterval(options.chartMoveSeconds * 1000);
    });

    watchEffect(() => {
        chart.hefengKey = options.hefengKey;
    });

    watchEffect(() => {
        const visible = weatherElement.value?.visible;
        chartMoveInterval.enabled = visible ?? false;

        if (visible) {
            chart.refreshChart();
        }
    });

    watchEffect(() => {
        const groupedElement = weatherElement.value;

        if (!groupedElement) return;

        const scheduleArrary = options.showWithin;

        if (showWithinInterval) {
            showWithinInterval.disable();
        }

        if (scheduleArrary.length == 0) {
            groupedElement.hide();
            return;
        }

        showWithinInterval = new TimeWithinAll({
            schedule: scheduleArrary,
            interval: 3 * 1000,
            waitCons: () => groupedElement.hide(),
            withinCons: () => groupedElement.show(),
            overCons: () => groupedElement.hide(),
        });
    });

    watchEffect(() => {
        const scheduleArrary = options.show7dWithin;

        if (show7dWithinInterval) {
            show7dWithinInterval.disable();
        }

        if (scheduleArrary.length == 0) {
            return;
        }

        show7dWithinInterval = new TimeWithinAll({
            schedule: scheduleArrary,
            interval: 3 * 1000,
            waitCons: () => showTypeAuto.value = '24h',
            withinCons: () => showTypeAuto.value = '7d',
            overCons: () => showTypeAuto.value = '24h',
        });
    });

    watchEffect(() => {
        const name: WeatherTypeName = showTypeName.value;
        const chartType = weatherChartType[name];

        if (!chartType) return;

        chart.changeChartType(chartType);
    });
});

onUnmounted(() => {
    chartMoveInterval.disable();
});
</script>

<template>
    <div class="container board_title">
        <h1>天气预报</h1>
        <h1 id="weather_show_type" ref="weatherShowType">{{ showTypeName }}</h1>
        <div class="container info_wrapper">
            <h2>数据来源：和风天气<img src="../../images/weather/qweather.svg"></h2>
            <h2>数据更新时间：<span id="weather_last_updated" ref="weatherLastUpdated"></span></h2>
            <h2>预报时间段: {{ options.showWithin.join(" || ") }}</h2>
            <h2>7天预报时间段: {{ options.show7dWithin.join(" || ") }}</h2>
        </div>
    </div>
    <div class="weather_chart" ref="weatherChart"></div>
</template>

<style scoped>
.weather_chart {
    height: 100%;

    background: #eee7;
    backdrop-filter: blur(5px);

    margin: 10px;
    padding: 15px 45px;
    background-size: 100% auto;
    box-shadow: 0 0 10px #121212 inset;
    border-radius: 20px;
}

.board_title {
    justify-content: start;

    color: #330033;
}

.board_title h1 {
    color: #eee;

    margin: 8px;
    font-size: 1em;

    text-shadow:
        1px 1px 3px #2a2a2a,
        3px 3px 3px #2a2a2a,
        -1px -1px 3px #2a2a2a;

}

.board_title h2 {
    color: #121212;
    font-size: 0.3em;
}

.board_title img {
    width: 1em;
}

.info_wrapper {
    flex-flow: column;
    justify-content: start;

    position: absolute;
    right: 0;

    margin: 0 10px 0 0;

    text-align: right;
}
</style>