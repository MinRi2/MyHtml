class TimerEvent {
    secondStart = 60;
    minuteStart = 60;
    hourStart = 24;
    dayStart = 10;

    /**
     * 
     * @param {Number} order 事件顺序 越小越优先
     * @param {String} name 事件名称
     * @param {String, Date} startDate 开始日期
     * @param {String, Date} endDate 结束日期
     * @param {String} discription 事件描述
     * @param {String} shadowColor 事件名称阴影颜色
     */
    constructor(order, name, startDate, endDate, discription = "", shadowColor = "#444") {
        this.order = order;
        this.name = name;
        this.discription = discription;
        this.shadowColor = shadowColor;

        this.startDate = null;
        this.endDate = toDate(endDate);

        if (startDate != null) {
            this.startDate = toDate(startDate);

            const last = this.endDate - this.startDate;
            let secondStart = last / 1000,
                minuteStart = secondStart / 60,
                hourStart = minuteStart / 60,
                dayStart = hourStart / 24;

            this.secondStart = Math.min(this.secondStart, secondStart);
            this.minuteStart = Math.min(this.minuteStart, minuteStart);
            this.hourStart = Math.min(this.hourStart, hourStart);
            this.dayStart = Math.min(this.dayStart, dayStart);
        }
    }

    shouldTiming(date) {
        return (this.startDate == null || date - this.startDate >= 0) && date - this.endDate <= 0;
    }
}

const timerEvents = [];

function addEvents(...events) {
    events.forEach(e => timerEvents.push(e));

    timerEvents.sort((e1, e2) => e1.order - e2.order);
}

function initTimer() {
    const emptyEvent = new TimerEvent(Infinity, "", null, "00:00");

    const eventElem = document.getElementById("event_name"),
        dayBox = document.getElementById("day_block"),
        hourBox = document.getElementById("hour_block"),
        minuteBox = document.getElementById("minute_block"),
        secondBox = document.getElementById("second_block");

    const style = getComputedStyle(dayBox);
    const boxSize = parseInt(style.height.replace("px", ""));

    const eventEndTimeElem = document.getElementById("event_end_time"),
        eventDiscriptionElem = document.getElementById("event_discription");

    const timerDay = document.getElementById("timer_day"),
        timerHour = document.getElementById("timer_hour"),
        timerMinute = document.getElementById("timer_minute"),
        timerSecond = document.getElementById("timer_second");

    const dayCutBox = document.getElementById("cutbox_day"),
        hourCutBox = document.getElementById("cutbox_hour"),
        minuteCutBox = document.getElementById("cutbox_minute"),
        secondCutBox = document.getElementById("cutbox_second");

    var currentEvent = emptyEvent;
    var lastEvent = null;

    const minCutFract = 0.05;

    var lastDayFract = -1,
        lastHourFract = -1,
        lastMinuteFract = -1,
        lastSecondFract = -1;

    setInterval(refreshTimer, 500);

    function getEvent(date) {
        return timerEvents.find(e => e.shouldTiming(date));
    }

    function refreshTimer() {
        const nowDate = getSchoolDate();

        currentEvent = getEvent(nowDate);
        if (lastEvent !== currentEvent) {
            if (!currentEvent) {
                setInfo("The End", "", "", "");
            } else {
                setInfo(currentEvent.name,
                    "End: " + dateToString(currentEvent.endDate),
                    currentEvent.discription, currentEvent.shadowColor);
            }

            lastEvent = currentEvent;
        }

        if (!currentEvent) {
            setTime(0, 0, 0, 0, emptyEvent);
            return;
        }

        const leftMiniSeconds = currentEvent.endDate - nowDate;

        let seconds = leftMiniSeconds / 1000,
            minutes = seconds / 60,
            hours = minutes / 60,
            days = hours / 24;

        seconds %= 60;
        minutes %= 60;
        hours %= 24;

        setTime(days, hours, minutes, seconds, currentEvent);

        function setInfo(name, endTimeText, discription, shadowColor) {
            const customFrames = {
                fontSize: ["", "0px"],
                transform: ["", ""],
            }

            eventElem.style.setProperty("--text-shadow-color", shadowColor);

            animations.textChange(eventElem,
                () => eventElem.textContent == name,
                () => eventElem.textContent = name, customFrames, {
                duration: 1500,
            });

            animations.textChange(eventEndTimeElem,
                () => eventEndTimeElem.textContent == endTimeText,
                () => eventEndTimeElem.textContent = endTimeText, customFrames, {
                duration: 500,
                delay: 2000,
            });

            animations.textChange(eventDiscriptionElem,
                () => eventDiscriptionElem.textContent == discription,
                () => eventDiscriptionElem.textContent = discription, customFrames, {
                duration: 1000,
                delay: 3000,
            });
        }

        function setTime(days, hours, minutes, seconds, event) {
            const displayDays = Math.floor(days),
                displayHours = Math.floor(hours),
                displayMinutes = Math.floor(minutes),
                displaySeconds = Math.ceil(seconds);

            timerDay.textContent = displayDays;
            timerHour.textContent = displayHours;
            timerMinute.textContent = displayMinutes;
            timerSecond.textContent = displaySeconds;

            const removeDay = displayDays == 0,
                removeHour = removeDay && displayHours == 0,
                removeMinute = removeHour && displayMinutes == 0,
                removeSecond = removeMinute && displaySeconds == 0;

            let dayFract = Math.min(1, days / event.dayStart),
                hourFract = hours / event.hourStart,
                minuteFract = minutes / event.minuteStart,
                secondFract = seconds / event.secondStart;
            const shouldCutDay = Math.abs(dayFract - lastDayFract) > minCutFract,
                shouldCutHour = Math.abs(hourFract - lastHourFract) > minCutFract,
                shouldCutMinute = Math.abs(minuteFract - lastMinuteFract) > minCutFract,
                shouldCutSecond = Math.abs(secondFract - lastSecondFract) > minCutFract;

            cutbox(dayBox, dayCutBox, dayFract, removeDay, shouldCutDay);
            cutbox(hourBox, hourCutBox, hourFract, removeHour, shouldCutHour);
            cutbox(minuteBox, minuteCutBox, minuteFract, removeMinute, shouldCutMinute);
            cutbox(secondBox, secondCutBox, secondFract, removeSecond, shouldCutSecond);

            if (shouldCutDay) lastDayFract = dayFract;
            if (shouldCutHour) lastHourFract = hourFract;
            if (shouldCutMinute) lastMinuteFract = minuteFract;
            if (shouldCutSecond) lastSecondFract = secondFract;

            function cutbox(block, cutbox, fract, removeBlock, shouldCut) {
                if (removeBlock) {
                    block.style.width = "0px";
                } else {
                    block.style.width = boxSize + "px";

                    if (shouldCut) {
                        cutbox.style.top = Math.floor(boxSize * (1 - fract) * 100) / 100 + "px";
                    }
                }
            }
        }
    }
}