class TimeSchedule {
    /**
     * 
     * @param {String, Date} startTime 
     * @param {String, Date} endTime 
     */
    constructor(startTime, endTime) {
        this.setTime(startTime, endTime);
    }

    setTime(newStartTime, newEndTime) {
        this.startTime = newStartTime;
        this.endTime = newEndTime;
    }

    withinDate(date) {
        return withinTime(this.startTime, this.endTime, date);
    }

    getStartDate() {
        if (this.startTime == null) {
            return null;
        }

        return toDate(this.startTime);
    }

    getEndDate() {
        if (this.endTime == null) {
            return null;
        }

        return toDate(this.endTime);
    }

    /**
     * 
     * @param {Array<String>} array 
     * @param {String} timeSplit 
     * @returns {Array}
     */
    static timeArrayToTimeScheduleArray(array, timeSplit = "-") {
        const result = [];

        for (let i = 0; i < array.length; i++) {
            const time = array[i];
            const schedule = TimeSchedule.toTimeSchedule(time, timeSplit);

            result.push(schedule);
        }

        return result;
    }

    /**
     * 将字符串形式的 timeSchedule (Date timeSplit Date) 转为 timeSchedule 
     * @param {String, TimeSchedule} time 
     * @param {String} timeSplit (*-)
     * @returns 
     */
    static toTimeSchedule(time, timeSplit = "-") {
        if (time instanceof TimeSchedule) {
            return time;
        }

        const splitArray = time.split(timeSplit);
        const startTime = splitArray[0],
            endTime = splitArray[1];

        return new TimeSchedule(startTime, endTime);
    }

}

function toDate(arg) {
    if (arg instanceof Date) {
        return arg;
    }

    if (typeof arg == "string") {
        return stringToDate(arg);
    }

    throw new Error(`${arg} cannot be casted to Date`);

    /** 将字符串转换成日期
     * @description: 字符串可分成日期和时间两部分
     * 如果只有日期则默认时间00:00
     * 如果只有时间则默认日期为现在的日期
     * 日期可按 年 月 日 省略
     * 时间可按 秒 分 时 省略
     * 可自定义日期分隔符 默认/
     * 可自定义时间分隔符 默认:
     * @param {string} str 需要转换的字符串
     * @param {string} dateTimeSplit 日期与时间的分隔符 默认空格
     * @param {string} dateSplit 日期分隔符 默认/
     * @param {string} timeSplit 时间分隔符 默认:
     * @return {Date} 转换结果 
     */
    function stringToDate(str, dateTimeSplit = " ", dateSplit = "/", timeSplit = ":") {
        const date = new Date();

        const arr = str.split(dateTimeSplit);

        let stringDate = stringTime = "";

        if (arr.length == 1) {
            if (str.includes(timeSplit)) {
                stringTime = str;
            } else if (str.includes(dateSplit)) {
                stringDate = str;
                stringTime = "0";
            } else {
                return null;
            }
        } else if (arr.length == 2) {
            stringDate = arr[0];
            stringTime = arr[1];
        } else {
            return null;
        }

        if (stringDate != "") {
            parseDate(date, stringDate, dateSplit);
        }

        if (stringTime != "") {
            parseTime(date, stringTime, timeSplit);
        }

        return date;

        function parseDate(date, string, dateSplit) {
            let year = date.getFullYear(),
                month = date.getMonth(),
                day = date.getDate();

            const arr = string.split(dateSplit);
            switch (arr.length) {
                case 3:
                    year = parseInt(arr[0]);
                case 2:
                    month = parseInt(arr[arr.length - 2]) - 1;
                case 1:
                    day = parseInt(arr[arr.length - 1]);
                    break;
            }

            date.setDate(day);
            date.setMonth(month);
            date.setFullYear(year);
        }

        function parseTime(date, string, timeSplit) {
            let hour = minute = seconds = 0;

            const arr = string.split(timeSplit);
            switch (arr.length) {
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
}

/**
 * 返回一个时间是否在某一时间区间内
 * @param {*} startDate 起始时间
 * @param {*} endDate 结束时间
 * @param {*} date 默认当前时间
 * @returns {Boolean}
 */
function withinTime(startDate, endDate, date = new Date()) {
    startDate = toDate(startDate);
    endDate = toDate(endDate);

    return startDate < date && date < endDate;
}

function checkIntervalOrOver(date, func, overFunc, timeInterval = 1000) {
    date = toDate(date);

    let intervalId;
    intervalId = setInterval(() => {
        const nowDate = new Date();
        const left = date - nowDate;

        if (left > 0) {
            setTimeout(func, left);
        } else {
            overFunc();
            clearInterval(intervalId);
        }
    }, timeInterval);
}


function dateToString(date, options = {}) {
    const defaultOpt = {
        year: true, month: true, day: true, hour: true, minute: true,
    };

    const { year, month, day, hour, minute } = Object.assign(defaultOpt, options);

    let result = "";

    if (year) {
        result += date.getFullYear();

        if (month) result += "/";
    }

    if (month) {
        result += fixed(date.getMonth() + 1);

        if (day) result += "/";
    }

    if (day) {
        result += fixed(date.getDate());

        if (hour | minute) result += " ";
    }

    if (hour) {
        result += fixed(date.getHours());

        if (minute) result += ":";
    }

    if (minute) {
        result += fixed(date.getMinutes())
    }

    return result;

    function fixed(num) {
        return ("" + num).padStart(2, "0");
    }
}

/**
 * 获取经偏移校准的时间
 * @param {Number} offset 偏移时间(ms) 默认 vars.js ${dateOffset}
 * @returns {Date}
 */
function getSchoolDate(offset = dateOffset) {
    const nowDate = new Date();
    return new Date(+nowDate + offset);
}

/**
 * 获取当前的周数 起始时间在 vars.js ${weekStartDate} 设置
 * @param {Number} offset 偏移时间(day) 默认0
 * @returns {Number}
 */
function getSchoolWeek(offset = 0) {
    const nowDate = getSchoolDate();
    const day = (nowDate - weekStartDate) / 1000 / 60 / 60 / 24;
    return Math.floor((day + offset) / 7) + 1;
}