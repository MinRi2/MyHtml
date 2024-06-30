<script setup lang="ts">
import { computed, onMounted, onUnmounted, Ref, ref, watch, watchEffect } from 'vue';
import { dateToString, getSchoolDate, getSchoolWeek, TimeInterval, TimeWithinAll } from '../utils/dateUtils';
import { BaiduHotboardData, CardData } from '../types/hotboard';
import { GroupedElement } from '../types/elementGroup';
import { HotboardOptions } from '../paperOptions';
import * as animations from '../utils/animations';
import { format } from '../utils/stringUtils';

const props = defineProps<{
    options: HotboardOptions,
    hotboardElement: GroupedElement | undefined,
}>();

const { options } = props;
const hotboardElement = computed(() => props.hotboardElement);

const baiduHotboardApi = "http://localhost:3000/hotboard";
const emptyData: CardData = {
    hotScore: 0,
    img: '',
    index: 0,
    word: ''
}

const cardElements = ref<HTMLElement[]>([]);

const datas: Ref<CardData[]> = ref([]);
const showMark = ref(false);

var round = 0;
const groupSize = computed(() => options.groupSize);
const maxRound = computed(() => {
    const dataLength = datas.value.length;

    const maxDataRound = Math.ceil(dataLength / groupSize.value)

    return Math.min(options.maxRound, maxDataRound);
});

const lastUpdateDate = ref(getSchoolDate());

const updateCardInterval = new TimeInterval(() => updateCard(), 5 * 60 * 1000, false);
var disableInterval: TimeWithinAll;

onMounted(() => {
    updateCardInterval.enable();
    updateCardInterval.run();

    watch(() => options.updateCardPerMinute, updateInterval => {
        updateCardInterval.setInterval(updateInterval * 60 * 1000);
    });

    watch(() => hotboardElement.value?.visible, visible => {
        updateCardInterval.enabled = visible ?? false;
    });

    watchEffect(() => {
        if (disableInterval) disableInterval.disable();

        if (!options.disableTime) {
            return;
        }

        console.log(options.disableTime);


        disableInterval = new TimeWithinAll({
            schedule: options.disableTime,
            interval: 60 * 1000,
            waitCons: () => showMark.value = false,
            withinCons: () => showMark.value = true,
            overCons: () => showMark.value = false,
        })
    });
});

onUnmounted(() => {
    updateCardInterval.disable();
});

function setCardData(card: HTMLElement, cardIndex: number, data: CardData) {
    const { index, img, word, hotScore } = data;

    const indexElem = card.querySelector(".index")! as HTMLElement;
    const imgElem = card.querySelector("img")! as HTMLElement;
    const titleElem = card.querySelector(".title")! as HTMLElement;
    const hotElem = card.querySelector(".hot")! as HTMLElement;

    const imgUrl = `${img}?x-bce-process=image/resize,m_fill,w_150,h_130`;

    animations.change({
        element: card,
        shouldChange: () => true,
        changeConsumer: () => {
            indexElem.textContent = "" + (index + 1);
            imgElem.setAttribute("src", imgUrl);
            titleElem.textContent = word;
            hotElem.textContent = "热度" + hotScore;
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
    })
}

async function updateCard() {
    if (!datas.value || round >= maxRound.value) {
        await refreshData();

        if (!datas.value) {
            return;
        }
    }

    if (round >= maxRound.value) {
        round = 0;
    }

    const roundIndex = round * groupSize.value;

    cardElements.value.forEach((card, index) => {
        const cardDataIndex = roundIndex + index;

        if (cardDataIndex >= datas.value.length) {
            setCardData(card, index, emptyData);
            return;
        }

        const data = datas.value[cardDataIndex];
        setCardData(card, index, data);
    });

    wenYanWenCard();

    round++;
}

async function refreshData() {
    const response = await fetch(baiduHotboardApi);
    const hotboardData: BaiduHotboardData = await response.json();

    const { content, updateTime } = hotboardData.data.cards[0];

    lastUpdateDate.value = new Date(parseInt(updateTime) * 1000);

    datas.value = content;
}

function wenYanWenCard() {
    if (!options.wenYanWen) {
        return;
    }

    const { enable,
        replaceIndex,
        startWeek,
        startPage,
        setpPage,
        text,
    } = options.wenYanWen;

    if (!enable) {
        return;
    }

    const size = groupSize.value;

    const roundIndex = round * size + 1;

    if (replaceIndex < roundIndex || replaceIndex > roundIndex + size) {
        return;
    }

    const cardIndex = (replaceIndex - 1) % size;
    const card = cardElements.value[cardIndex];

    const thisWeekStartPage = startPage + (getSchoolWeek() - startWeek) * setpPage,
        thisWeekEndPage = thisWeekStartPage + setpPage - 1;

    const wenYanWenText = format(text[Math.floor(Math.random()) * text.length], thisWeekStartPage, thisWeekEndPage);

    setCardData(card, cardIndex, {
        hotScore: 0,
        img: 'https://fyb-1.cdn.bcebos.com/fyb/de6163834f53ca92c1273fff98ac9078.jpeg',
        index: roundIndex + cardIndex - 1,
        word: wenYanWenText
    });
}

</script>

<template>
    <div class="container board_title">
        <img src="../../images/hot.png">
        <h1 @click="updateCardInterval.restart()">今日热搜</h1>

        <div class="container info_wrapper">
            <h2>数据来源：百度热搜</h2>
            <h2>数据更新时间{{ dateToString(lastUpdateDate) }}</h2>
            <h2>更新间隔{{ options.updateCardPerMinute }}min</h2>
        </div>
    </div>

    <div class="container board_body">
        <div class="mark" :style="{
            opacity: showMark ? 1 : 0
        }">
            考试期间
            <br>
            热搜榜暂闭
        </div>

        <div class="container card" v-for="data in groupSize" ref="cardElements">
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
    width: 100%;
    margin: 20px 0px 20px;

    color: #ff4d4d;
    text-align: center;
    justify-content: start;
}

.board_title img {
    width: 1em;
    aspect-ratio: 1/1;
}

.board_title h1,
.board_title h2 {
    font-size: 1em;
}

.board_title h2 {
    font-size: 0.5em;
    color: #121212;
}

.board_title .info_wrapper {
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

    width: 100%;
}

.board_body .mark {
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

.board_body .card {
    flex: 1;

    justify-content: start;
    align-items: start;

    margin: 8px;
    padding: 8px;
    border-radius: 30px;
    background-color: rgba(255, 255, 255, 0.1);
    box-shadow: 2px 2px 4px rgba(0, 0, 0, 0.4),
        4px 4px 4px rgba(0, 0, 0, 0.2),
        -2px -2px 4px rgba(255, 255, 255, 0.5),
        -4px -4px 4px rgba(255, 255, 255, 0.7);
    backdrop-filter: blur(4px);

    transition: all 3s ease-in-out;
}

.board_body .card .image_wrapper {
    position: relative;

    width: 3.5em;
    aspect-ratio: 150/130;

    border-radius: 30px;
    box-shadow: 2px 2px 4px rgba(0, 0, 0, 0.4),
        4px 4px 4px rgba(0, 0, 0, 0.2);

    overflow: hidden;
    z-index: 1;
}

.board_body .card img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.board_body .card .index {
    position: absolute;
    top: 0;

    width: 1.5em;
    aspect-ratio: 3/2;

    background: #f60;
    border-bottom-right-radius: 20px;

    color: white;
    text-align: center;
    font-size: 0.75em;
}

.board_body .card .title {
    flex: 1;
    margin: 0px 8px;
    color: black;
    font-size: 1em;
    text-shadow:
        -1px -1px 1px #F3EEEA,
        1px 1px 1px #776B5D;
    z-index: 1;
}

.board_body .card .hot {
    position: absolute;
    top: 75%;
    right: 0;
    transform: translate(0, -50%);

    filter: blur(1.5px);

    color: #f60;
    font-size: 0.5em;
    z-index: 0;
}
</style>