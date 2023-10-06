const clockYearElem = document.querySelector("#clock_year"),
    clockMonthElem = document.querySelector("#clock_month"),
    clockDayElem = document.querySelector("#clock_day");

const clockHourElem = document.querySelector("#clock_hour"),
    clockMinuteElem = document.querySelector("#clock_minute"),
    clockSecondElem = document.querySelector("#clock_second");

initClock();

function initClock(){
    setInterval(refreshClock, 500);
    
    const customTextChangeFrames = {
        fontSize: ["", "130px"],
        filter: ["blur(0px)", "blur(8px)"],
        transform: ["", ""],
    };

    function refreshClock(){
        const nowDate = new Date();
        
        let year = nowDate.getFullYear(),
            month = nowDate.getMonth() + 1,
            day = nowDate.getDate();
        
        month = fixed(month);
        day = fixed(day);
        
        animations.textChange(clockYearElem, () => clockYearElem.textContent == year, () => {
            clockYearElem.textContent = year;
        }, {
            duration: 400,
        }, customTextChangeFrames);
        
        animations.textChange(clockMonthElem, () => clockMonthElem.textContent == month, () => {
            clockMonthElem.textContent = month;
        }, {
            duration: 400,
        }, customTextChangeFrames);
        
        animations.textChange(clockDayElem, () => clockDayElem.textContent == day, () => {
            clockDayElem.textContent = day;
        }, {
            duration: 400,
        }, customTextChangeFrames);
        
        let hour = nowDate.getHours(),
            minute = nowDate.getMinutes(),
            second = nowDate.getSeconds();
        
        hour = fixed(hour);
        minute = fixed(minute);
        second = fixed(second);
        
        animations.textChange(clockHourElem, () => clockHourElem.textContent == hour, () => {
            clockHourElem.textContent = hour;
        }, {
            duration: 400,
        }, customTextChangeFrames);
        
        animations.textChange(clockMinuteElem, () => clockMinuteElem.textContent == minute, () => {
            clockMinuteElem.textContent = minute;
        }, {
            duration: 300,
        }, customTextChangeFrames);
        
        animations.textChange(clockSecondElem, () => clockSecondElem.textContent == second, () => {
            clockSecondElem.textContent = second;
        }, {
            duration: 200,
        }, customTextChangeFrames);
        
        function fixed(num){
            return ("" + num).padStart(2, "0");
        }
    }
}