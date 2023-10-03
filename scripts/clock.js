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