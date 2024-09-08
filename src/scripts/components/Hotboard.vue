<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch, watchEffect } from 'vue';
import { IntervalTask, WithinTasks } from '../utils/dateUtils';
import { CardData, emptyData, HotboardData, HotboardSource } from '../types/hotboard';
import { GroupedElement } from '../types/elementGroup';
import { HotboardOptions } from '../paperOptions';
import animations from '../utils/animations';
import InfoBar from './InfoBar.vue';
import { ProgressData } from '../types/progress';
import { useSingleArray } from '../hooks/useSingleObject';
import { localUrl } from '../vars';
import useColoredText from '../hooks/useColoredText';

const props = defineProps<{
    options: HotboardOptions,
    hotboardElement: GroupedElement,
}>();

const { currentData: currentSource, nextData: nextSource, array: sourceDataArray } = useSingleArray<ProgressData & HotboardSource & {
    color?: string
}>([
    {
        name: "百度热搜",
        color: "#1fab89",
        linear: "linear-gradient(-225deg, #4596FB 0%, #57F2CC 48%, #D4FFEC 100%)",
        progress: 0,

        url: `${localUrl}/hotboard/baidu`,
        round: 4,
    },
    {
        name: "央视国际新闻",
        color: "#f6f7d7",
        linear: "linear-gradient(to right, #e65c00 , #f9d423)",
        progress: 0,

        url: `${localUrl}/hotboard/cctv/world`,
        round: 4,
    },
    {
        name: "央视军事新闻",
        color: "#e84545",
        linear: "linear-gradient(to right, #ff9569 0%, #e92758 100%)",
        progress: 0,

        url: `${localUrl}/hotboard/cctv/military`,
        round: 4,
    }
]);

const { options } = props;

const cardElements = ref<HTMLElement[]>([]);
const barTextElem = ref<HTMLElement>();

const barTextData = useColoredText({
    options: {
        duration: 2000,
        easing: "cubic-bezier(0.42, 0, 0.58, 1)",
    }
});

const datas = ref<CardData[]>([]);
const showMark = ref(false);
const isNextRounding = ref(false);

var round = 0;
const groupSize = computed(() => options.groupSize);
const maxRound = computed(() => {
    if (datas.value == null) {
        return Infinity;
    }

    const dataLength = datas.value.length;

    const maxDataRound = Math.ceil(dataLength / groupSize.value);

    return Math.min(currentSource.value.round, maxDataRound);
});

const nextRoundTask = new IntervalTask(() => nextRound(), 5 * 60 * 1000, false, false, true);
const updateProgressTask = new IntervalTask(() => updateProgress(), 10 * 1000, false);
var disableCheckTask: WithinTasks;

onMounted(() => {
    nextRoundTask.enable();
    updateProgressTask.enable();
    nextRoundTask.run();
    updateProgressTask.run();

    watch(() => options.updateCardPerMinute, updateInterval => {
        nextRoundTask.setInterval(updateInterval * 60 * 1000);
    });

    watch(() => props.hotboardElement.visible, visible => {
        nextRoundTask.enabled = visible ?? false;
    });

    watch(() => options.source, sourceData => {
        sourceDataArray.forEach(data => {
            const { disable, round } = sourceData[data.name];

            data.disable = disable;
            data.round = round;

            if (currentSource.value == data && disable) {
                nextRound();
            }
        });
    }, { deep: true });

    watchEffect(() => {
        if (disableCheckTask) disableCheckTask.disable();

        if (!options.disableTime) {
            return;
        }

        disableCheckTask = new WithinTasks({
            schedule: options.disableTime,
            interval: 60 * 1000,
            waitCons: () => showMark.value = false,
            withinCons: () => showMark.value = true,
            overCons: () => showMark.value = false,
        })
    });

    watchEffect(() => {
        barTextData.element = barTextElem.value;
        barTextData.text = currentSource.value.name;
        barTextData.color = currentSource.value.color;
    });
});

onUnmounted(() => {
    nextRoundTask.disable();
});

async function nextRound() {
    isNextRounding.value = true;

    if (round >= maxRound.value || currentSource.value.disable) {
        round = 0;
        nextSource(data => !data.disable);

        const result = await fetchData();

        if (result == null) {
            return;
        }

        datas.value = result;
    }

    const roundIndex = round * groupSize.value;
    round++;

    await Promise.all(cardElements.value.map((card, index) => (async () => {
        const cardDataIndex = roundIndex + index;

        if (cardDataIndex >= datas.value.length) {
            await setCardData(card, cardDataIndex, emptyData);
            return;
        }

        const data = datas.value[cardDataIndex];
        await setCardData(card, cardDataIndex, data);
    })()));

    updateProgress();

    isNextRounding.value = false;

    async function fetchData() {
        try {
            const response = await fetch(currentSource.value.url);
            const hotboardData: HotboardData = await response.json();

            const { result } = hotboardData;
            return result;
        } catch (e) {
            return null;
        }
    }

    async function setCardData(card: HTMLElement, cardIndex: number, data: CardData) {
        const { image, title } = data;

        const indexElem = card.querySelector(".index")! as HTMLElement;
        const imgElem = card.querySelector("img")! as HTMLElement;
        const titleElem = card.querySelector(".title")! as HTMLElement;

        await animations.change({
            element: card,
            shouldChange: () => true,
            changeConsumer: () => {
                indexElem.textContent = "" + (cardIndex + 1);
                imgElem.setAttribute("src", image);
                titleElem.textContent = title;
            },
            frames: {
                offset: [0, 1],
                transform: ["", "translate(-120%, 0)"],
                filter: ["", "blur(4px)"],
            },
            options: {
                duration: 2000,
                delay: cardIndex * 600,
                easing: "cubic-bezier(0.42, 0, 0.58, 1)",
            }
        });
    }
}

function updateProgress() {
    currentSource.value.progress = nextRoundTask.progress;
}
</script>

<template>
    <div class="container board_title" @click="!isNextRounding && nextRoundTask.run()">
        <InfoBar :data="currentSource">
            <span ref="barTextElem" class="source_name"></span>
        </InfoBar>
    </div>

    <div class="container board_body">
        <div class="mark" :style="{
            opacity: showMark ? 1 : 0
        }">
            考试期间
            <br>
            热搜榜暂闭
        </div>

        <div class="container card" v-for="_data in groupSize" ref="cardElements">
            <div class="image_wrapper">
                <div class="index"></div>
                <img src="">
            </div>
            <div class="title"></div>
            <div class="hot"></div>
        </div>
    </div>
</template>

<style scoped>
.board_title {
    position: relative;
    width: 100%;
    height: 2em;

    padding: 8px;

    text-align: center;
    justify-content: space-around;
}

.board_title :deep(.bar) {
    width: 90%;
    height: 75%;

    border-radius: 30px;
}

.source_name {
    color: white;

    font-size: 1.25em;

    text-shadow: 1px 1px 1px var(--color);
    lighting-color: var(--color);
}

.info_wrapper {
    flex-flow: column;
    justify-content: start;

    position: absolute;
    right: 0;

    margin: 0 10px 0 0;

    text-align: right;
}

.board_body {
    position: relative;

    flex-flow: column;
    justify-content: start;
    align-items: stretch;

    backdrop-filter: blur(4px);

    width: 100%;
}

.card {
    flex: 1;

    justify-content: start;
    align-items: start;

    margin: 0px 8px 0px 0px;
    padding: 8px;
    border-bottom: 4px solid #c6cfff;

    transition: all 3s ease-in-out;
}

.card .image_wrapper {
    position: relative;

    width: 5em;
    aspect-ratio: 6/5;

    border-radius: 10%;

    overflow: hidden;
    z-index: 1;
}

.card img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.card .index {
    position: absolute;
    top: 0;

    width: 1.5em;
    aspect-ratio: 4/3;

    background: #f60;
    border-bottom-right-radius: 20px;

    color: white;
    text-align: center;
    font-size: 0.75em;
}

.card .title {
    flex: 1;
    margin: 0px 8px;
    color: #121212;
    font-size: 1em;
    text-shadow:
        -1px -1px 1px #F3EEEA,
        1px 1px 1px #776B5D;
}

.mark {
    display: flex;
    justify-content: center;
    align-items: center;

    position: absolute;
    top: 0;
    left: 0;

    width: 100%;
    height: 100%;
    opacity: 0;
    background-color: rgba(255, 255, 255, 0.3);
    backdrop-filter: blur(8px);

    color: #ff4d4d;
    text-align: center;
    font-size: 2em;
    z-index: 100;

    transition: all 3s ease-in-out;
}
</style>