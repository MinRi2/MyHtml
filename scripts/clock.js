const clockYearElem = document.querySelector("#clock_year"),
    clockMonthElem = document.querySelector("#clock_month"),
    clockDayElem = document.querySelector("#clock_day");

const clockHourElem = document.querySelector("#clock_hour"),
    clockMinuteElem = document.querySelector("#clock_minute"),
    clockSecondElem = document.querySelector("#clock_second");

initClock();

function initClock() {
    setInterval(refreshClock, 500);

    const customTextChangeFrames = {
        filter: ["", "blur(10px)"],
        transform: ["", ""],
    };

    function refreshClock() {
        const nowDate = getSchoolDate();

        let year = nowDate.getFullYear(),
            month = nowDate.getMonth() + 1,
            day = nowDate.getDate();

        month = fixed(month);
        day = fixed(day);

        animations.textChange(clockYearElem, () => clockYearElem.textContent == year, () => {
            clockYearElem.textContent = year;
        }, customTextChangeFrames, {
            duration: 400,
        });

        animations.textChange(clockMonthElem, () => clockMonthElem.textContent == month, () => {
            clockMonthElem.textContent = month;
        }, customTextChangeFrames, {
            duration: 400,
        });

        animations.textChange(clockDayElem, () => clockDayElem.textContent == day, () => {
            clockDayElem.textContent = day;
        }, customTextChangeFrames, {
            duration: 400,
        });

        let hour = nowDate.getHours(),
            minute = nowDate.getMinutes(),
            second = nowDate.getSeconds();

        hour = fixed(hour);
        minute = fixed(minute);
        second = fixed(second);

        animations.textChange(clockHourElem, () => clockHourElem.textContent == hour, () => {
            clockHourElem.textContent = hour;
        }, customTextChangeFrames, {
            duration: 300,
        });

        animations.textChange(clockMinuteElem, () => clockMinuteElem.textContent == minute, () => {
            clockMinuteElem.textContent = minute;
        }, customTextChangeFrames, {
            duration: 300,
        });

        animations.textChange(clockSecondElem, () => clockSecondElem.textContent == second, () => {
            clockSecondElem.textContent = second;
        }, customTextChangeFrames, {
            duration: 200,
        });

        function fixed(num) {
            return ("" + num).padStart(2, "0");
        }
    }
}