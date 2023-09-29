// 2023/09/24 12:00:00 -> Date
function stringToDate(str, dateTimeSplit = " ", dateSplit = "/", timeSplit = ":"){
    let date = new Date();

    let arr = str.split(dateTimeSplit);

    let stringDate = stringTime = "";

    if(arr.length == 1){
        if(str.includes(timeSplit)){
            stringTime = str;
        }else if(str.includes(dateSplit)){
            stringDate = str;
        }else{
            return null;
        }
    }else if(arr.length == 2){
        stringDate = arr[0];
        stringTime = arr[1];
    }else{
        return null;
    }

    if(stringDate != ""){
        parseDate(date, stringDate, dateSplit);
    }

    if(stringTime != ""){
        parseTime(date, stringTime, timeSplit);
    }

    return date;

    function parseDate(date, string, dateSplit){
        let year = date.getFullYear(),
            month = date.getMonth(),
            day = date.getDate();
        
        let arr = string.split(dateSplit);
        switch(arr.length){
            case 3:
                year = parseInt(arr[0]);
            case 2:
                month = parseInt(arr[arr.length - 2]) - 1;
            case 1:
                day = parseInt(arr[arr.length - 1]);
                break;
        }

        date.setFullYear(year);
        date.setMonth(month);
        date.setDate(day);
    }

    function parseTime(date, string, timeSplit){
        let hour = minute = seconds = 0;

        let arr = string.split(timeSplit);
        switch(arr.length){
            case 3:
                seconds = parseInt(arr[2]);
            case 2:
                minute = parseInt(arr[1]);
            case 1:
                hour = parseInt(arr[0]);
                break;
        }
    
        date.setHours(hour);
        date.setMinutes(minute);
        date.setSeconds(seconds);
    }
}

function checkIntervalOrOver(date, func, overFunc, timeInterval = 1000){
    let intervalId;

    intervalId = setInterval(() => {
        let nowDate = new Date();
        let left = date - nowDate;

        if(left > 0){
            setTimeout(func, left);
        }else{
            overFunc();
            clearInterval(intervalId);
        }
    }, timeInterval);
}


function dateToString(date){
    return date.getFullYear() + "/" + fixed(date.getMonth() + 1) + "/" + fixed(date.getDate()) + " " + 
        fixed(date.getHours()) + ":" + fixed(date.getMinutes());

    function fixed(num){
        return ("" + num).padStart(2, "0");
    }
}