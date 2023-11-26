initHotBoard();

function initHotBoard() {
    const hotBoardApi = "https://api.vvhan.com/api/hotlist?type=baiduRD";
    // const hotBoardApi = "https://top.baidu.com/api/board?platform=wise&tab=realtime";

    const imgArgs = "x-bce-process=image/resize,m_fill,w_150,h_130";
    const refreshTime = 10 * 60 * 1000; // 10min

    const cardBoard = document.querySelector(".board_body");
    const lastTimeElem = document.querySelector(".board_title #last_time");

    const groupSize = cardBoard.querySelectorAll(".card").length;
    const maxGroupIndex = 3;

    const checkDisableInterval = 10 * 1000; // 10s
    const disableBoardDates = TimeSchedule.timeArrayToTimeScheduleArray([
        "11/9 7:40-11/9 10:30",
        "11/9 10:35-11/9 12:00",
        "11/9 14:35-11/9 17:00",

        "11/10 9:05-11/10 10:30",
        "11/10 10:35-11/10 12:00",
        "11/10 14:35-11/10 17:00",
    ]);

    const boardMark = document.querySelector(".board_body .mark");

    var data = null;
    var groupIndex = 0;
    var lastUpdateTime = "";

    refreshCardBoard();
    setInterval(refreshCardBoard, refreshTime);
    setInterval(checkDisable, checkDisableInterval);

    async function refreshCardBoard() {
        let tryTimes = 0;
        while (++tryTimes < 10 && !data) {
            await refreshData();
        }

        if (!data) {
            return;
        }

        const children = cardBoard.querySelectorAll(".card");
        const maxSize = Math.min(groupSize, data.length - groupIndex * groupSize);
        for (let i = 0; i < maxSize; i++) {
            const dataIndex = groupIndex * groupSize + i;

            const card = children[i];
            const { index, pic, title, hot } = data[dataIndex];

            const indexElem = card.querySelector(".index");
            const imgElem = card.querySelector("img");
            const titleElem = card.querySelector(".title");
            const hotElem = card.querySelector(".hot");

            const imgUrl = pic + "?" + imgArgs;

            animations.change(card, () => false, () => {
                indexElem.textContent = index;
                imgElem.setAttribute("src", imgUrl);
                titleElem.textContent = title;
                hotElem.textContent = "热度" + hot;
            }, {
                offset: [0, 1],
                transform: ["", "translate(-120%, 0)"],
                filter: ["", "blur(4px)"],
            }, {
                duration: 2000,
                delay: i * 600,
                eaing: "cubic-bezier(0.42, 0, 0.58, 1)",
            });
        }

        if (++groupIndex > maxGroupIndex) {
            groupIndex = 0;
            refreshData();
        }
    }

    async function refreshData() {
        try {
            const response = await fetch(hotBoardApi);
            const json = await response.json();

            data = json.data;
            lastUpdateTime = json.update_time;
        } catch (e) {
            return;
        }

        animations.textChange(lastTimeElem,
            () => lastTimeElem.textContent == lastUpdateTime,
            () => lastTimeElem.textContent = lastUpdateTime);
    }

    function checkDisable() {
        const nowDate = getSchoolDate();

        let shouldDisable = false;
        for (let i = 0, len = disableBoardDates.length; i < len; i++) {
            const schedule = disableBoardDates[i];
            if (shouldDisable = schedule.withinDate(nowDate)) {
                break;
            }
        }

        const children = cardBoard.querySelectorAll(".card");
        let filter;

        if (shouldDisable) {
            boardMark.style.opacity = 1.0;
            filter = "blur(10px)";
        } else {
            boardMark.style.opacity = 0;
            filter = "blur(0px)";
        }

        children.forEach(c => {
            c.style.filter = filter;
        });
    }
}