class TimerEvent {
    secondStart = 60;
    minuteStart = 60;
    hourStart = 24;
    dayStart = 10;

    constructor(order, name, startDate, endDate, discription = "") {
        this.order = order;
        this.name = name;
        this.discription = discription;

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

    timerEvents.sort(e => e.order);
}

function initTimer() {
    const boxSize = 250, marigin = "10px";

    const emptyEvent = new TimerEvent(9999999999, "", null, "00:00");

    const eventElem = document.getElementById("event_name"),
        dayBox = document.getElementById("day_block"),
        hourBox = document.getElementById("hour_block"),
        minuteBox = document.getElementById("minute_block"),
        secondBox = document.getElementById("second_block");

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

    let currentEvent = null;

    setInterval(refreshTimer, 500);

    function getEvent(date) {
        return timerEvents.find(e => e.shouldTiming(date));
    }

    function refreshTimer() {
        const nowDate = new Date();

        if (currentEvent == null || !currentEvent.shouldTiming(nowDate)) {
            const lastEvent = currentEvent;
            currentEvent = getEvent(nowDate);
            
            if(lastEvent != currentEvent){
                if(currentEvent == null){
                    setInfo("The End", "", "");
        
                    setTime(0, 0, 0, 0, emptyEvent);
                    return;
                }else{
                    setInfo(currentEvent.name, 
                        "End: " + dateToString(currentEvent.endDate), 
                        currentEvent.discription);
                }
            }
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
        
        function setInfo(name, endTimeText, discription){
            animations.textChange(eventElem, 
                () => eventElem.textContent == name, 
                () => eventElem.textContent = name, {
                duration: 1500,
            });
            
            animations.textChange(eventEndTimeElem, 
                () => eventEndTimeElem.textContent == endTimeText, 
                () => eventEndTimeElem.textContent = endTimeText, {
                duration: 500,
                delay: 2000,
            });
            
            animations.textChange(eventDiscriptionElem, 
                () => eventDiscriptionElem.textContent == discription, 
                () => eventDiscriptionElem.textContent = discription, {
                duration: 500,
                delay: 2000,
            });
        }

        function setTime(days, hours, minutes, seconds, event) {
            const displayDays = Math.ceil(days),
                displayHours = Math.ceil(hours),
                displayMinutes = Math.ceil(minutes),
                displaySeconds = Math.ceil(seconds);

            timerDay.textContent = displayDays;
            timerHour.textContent = displayHours;
            timerMinute.textContent = displayMinutes;
            timerSecond.textContent = displaySeconds;

            const removeDay = displayDays == 0,
                removeHour = removeDay && displayHours == 0,
                removeMinute = removeHour && displayMinutes == 0,
                removeSecond = removeMinute && displaySeconds == 0;

            cutbox(dayBox, dayCutBox, days / event.dayStart, removeDay);
            cutbox(hourBox, hourCutBox, hours / event.hourStart, removeHour);
            cutbox(minuteBox, minuteCutBox, minutes / event.minuteStart, removeMinute);
            cutbox(secondBox, secondCutBox, seconds / event.secondStart, removeSecond);
            
            function cutbox(block, cutbox, fract, removeBlock) {
                if (removeBlock) {
                    block.style.width = block.style.height = "0px";
                    block.style.margin = "0px";
                } else {
                    block.style.width = block.style.height = boxSize + "px";
                    block.style.margin = marigin;
                    cutbox.style.top = boxSize * (1 - fract) + "px";
                }
            }
        }
    }
}