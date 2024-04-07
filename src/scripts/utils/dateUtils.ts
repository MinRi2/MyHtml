import { ref } from "vue";
import { Disable } from "./typeUtils";

const dateOffset = ref(0); // 学校时间偏移 ms
const weekStartDate = ref(new Date()); // 开学第一周的时间

type ValidDate = Date | string;
type ValidTimeSchedule = string | TimeSchedule;

interface WithinTaskData<ScheduleType> {
    schedule: ScheduleType;
    interval: number;
    enable?: boolean;
    waitCons?: () => void;
    withinCons?: () => void;
    overCons?: () => void;
}

interface WithinTasksData extends WithinTaskData<ValidTimeSchedule[]> {
    onFinished?: () => void;
}

interface DateToStringData {
    year?: boolean,
    month?: boolean,
    day?: boolean,
    hour?: boolean,
    minute?: boolean,
    dateSpliter?: string,
    dateTimeSpliter?: string,
    timeSpliter?: string,
}

class TimeSchedule {

    constructor(
        public startTime: ValidDate,
        public endTime: ValidDate
    ) {
        this.setTime(startTime, endTime);
    }

    setTime(newStartTime: ValidDate, newEndTime: ValidDate) {
        this.startTime = newStartTime;
        this.endTime = newEndTime;
    }

    withinDate(date: ValidDate) {
        return this.startTime == null ? true : withinTime(this.startTime, this.endTime, date);
    }

    getStartDate() {
        return toDate(this.startTime);
    }

    getEndDate() {
        return toDate(this.endTime);
    }

    public compareTo(other: TimeSchedule) {
        return +this.getStartDate() - +other.getStartDate();
    }

    static timeArrayToTimeScheduleArray(array: ValidTimeSchedule[], timeSplit: string = "-") {
        const result: TimeSchedule[] = [];

        if (array.length == 0) {
            return result;
        }

        if (array[0] instanceof TimeSchedule) {
            return array as TimeSchedule[];
        }

        const stringTimeArray = array as string[];

        stringTimeArray.forEach((time: string) => {
            const schedule = TimeSchedule.toTimeSchedule(time, timeSplit);

            result.push(schedule);
        });

        return result;
    }

    /**
     * 将字符串形式的 timeSchedule (Date timeSplit Date) 转为 timeSchedule 
     * @param {String, TimeSchedule} time 
     * @param {String} timeSplit (*-)
     * @returns 
     */
    static toTimeSchedule(time: ValidTimeSchedule, timeSplit: string = "-") {
        if (time instanceof TimeSchedule) {
            return time;
        }

        const splitArray = time.split(timeSplit);
        const startTime = splitArray[0],
            endTime = splitArray[1];

        return new TimeSchedule(startTime, endTime);
    }

}

enum WithinStatus {
    WAITING = 'wait',
    WITHIN = 'within',
    OVER = 'over',
}

class TimeWihtinTask extends Disable {
    public status: WithinStatus;
    public schedule: TimeSchedule;

    private timeInterval: TimeInterval;

    private interval: number;

    private waitCons?: () => void;
    private withinCons?: () => void;
    private overCons?: () => void;

    constructor({
        schedule,
        interval,
        enable = true,
        waitCons = () => { },
        withinCons = () => { },
        overCons = () => { },
    }: WithinTaskData<ValidTimeSchedule>) {
        super();

        this.waitCons = waitCons;
        this.withinCons = withinCons;
        this.overCons = overCons;

        this.schedule = TimeSchedule.toTimeSchedule(schedule);
        this.timeInterval = new TimeInterval(() => {
            this.checkStatus();
        }, interval);

        if (enable) {
            this.enable();
        }
    }

    public setInterval(interval: number) {
        this.interval = interval;
        this.timeInterval.setInterval(interval);

        if (this.enabled) {
            this.disable();
            this.enable();
        }
    }

    protected override onEnabled() {
        // 检测初始状态
        const nowDate = getSchoolDate();
        const startDate = this.schedule.getStartDate(),
            endDate = this.schedule.getEndDate();

        const status: WithinStatus = WithinStatus.OVER;

        if (nowDate < startDate) {
            this.changeStatus(WithinStatus.WAITING);
        } else if (nowDate > endDate) {
            this.changeStatus(WithinStatus.OVER);
        } else {
            this.changeStatus(WithinStatus.WITHIN);
        }

        if (status == WithinStatus.OVER) {
            return;
        }

        this.timeInterval.enable();
    }

    protected override onDisabled() {
        this.timeInterval.disable();
    }

    private checkStatus() {
        var newStatus: WithinStatus = this.status;

        const nowDate = getSchoolDate();
        const startDate = this.schedule.getStartDate(),
            endDate = this.schedule.getEndDate();

        switch (this.status) {
            case WithinStatus.WAITING:
                if (nowDate > startDate) {
                    newStatus = WithinStatus.WITHIN;
                }
            case WithinStatus.WITHIN:
                if (nowDate > endDate) {
                    newStatus = WithinStatus.OVER;
                }
                break;
            case WithinStatus.OVER:
                this.disable();
                return;
        }

        this.changeStatus(newStatus);
    }

    private changeStatus(newStatus: WithinStatus) {
        if (this.status == newStatus) {
            return;
        }

        this.status = newStatus;

        switch (this.status) {
            case WithinStatus.WAITING:
                this.waitCons();
                break;
            case WithinStatus.WITHIN:
                this.withinCons();
                break;
            case WithinStatus.OVER:
                this.overCons();
                break;
        }
    }
}

class TimeWithinTasks extends Disable {
    public finished = false;

    private index: number = 0;

    private interval: number;
    private tasks: TimeSchedule[];
    private currentTask: TimeWihtinTask;

    private waitCons: () => void;
    private withinCons: () => void;
    private overCons: () => void;
    private onFinished: () => void;

    constructor({
        schedule: scheduleArray,
        interval,
        enable = true,
        waitCons = () => { },
        withinCons = () => { },
        overCons = () => { },
        onFinished = () => { },
    }: WithinTasksData) {
        super();

        this.tasks = TimeSchedule.timeArrayToTimeScheduleArray(scheduleArray);
        this.interval = interval;

        this.waitCons = waitCons;
        this.withinCons = withinCons;
        this.overCons = overCons;
        this.onFinished = onFinished;

        this.tasks.sort((t1, t2) => t1.compareTo(t2));

        this.next();

        if (this.currentTask) {
            this.currentTask.enabled = enable;
        }
    }

    protected override onEnabled() {
        this.currentTask.enable();
    }

    protected override onDisabled() {
        this.currentTask.disable();
    }

    private next() {
        if (this.index >= this.tasks.length) {
            this.finished = true;
            this.onFinished();
            return;
        }

        const schedule = this.tasks[this.index++];

        this.currentTask = new TimeWihtinTask({
            schedule: schedule,
            interval: this.interval,
            waitCons: this.waitCons,
            withinCons: this.withinCons,
            overCons: () => {
                this.overCons();
                this.next();
            }
        });
    }

}

class TimeInterval extends Disable {
    private intervalId: any;

    constructor(
        public fn: () => void,
        private interval: number,
        enable: boolean = true,
        run: boolean = false,
    ) {
        super();

        if (enable) {
            this.enable();
        }

        if (run) {
            fn();
        }
    }

    public run() {
        this.fn();
    }

    public setInterval(interval: number) {
        this.interval = interval;

        if (this.enabled) {
            this.disable();
            this.enable();
        }
    }

    protected override onEnabled(): void {
        this.intervalId = setInterval(this.fn, this.interval);
    }

    protected override onDisabled(): void {
        clearInterval(this.intervalId);
    }
}

type DayName = '周日' | '周一' | '周二' | '周三' | '周四' | '周五' | '周六';
const dayStringMap: DayName[] = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];

function toDate(arg: ValidDate): Date {
    if (arg instanceof Date) {
        return arg;
    }

    if (typeof arg == "string") {
        return stringToDate(arg);
    }

    throw new Error(`${arg} cannot be casted to Date`);
}

function dateToString(pdate: ValidDate, {
    year = true,
    month = true,
    day = true,
    hour = true,
    minute = true,
    dateSpliter = "/",
    dateTimeSpliter = " ",
    timeSpliter = ":",
}: DateToStringData = {}) {
    const date = toDate(pdate);

    let result = "";

    if (year) {
        result += date.getFullYear();

        if (month) result += dateSpliter;
    }

    if (month) {
        result += fixed(date.getMonth() + 1);

        if (day) result += dateSpliter;
    }

    if (day) {
        result += fixed(date.getDate());

        if (hour || minute) result += dateTimeSpliter;
    }

    if (hour) {
        result += fixed(date.getHours());

        if (minute) result += timeSpliter;
    }

    if (minute) {
        result += fixed(date.getMinutes())
    }

    return result;

    function fixed(num: number) {
        return ("" + num).padStart(2, "0");
    }
}

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
function stringToDate(str: string, dateTimeSplit: string = " ", dateSplit: string = "/", timeSplit: string = ":") {
    const date = new Date();

    const arr = str.split(dateTimeSplit);

    let stringDate = "", stringTime = "";

    if (arr.length == 1) {
        if (str.includes(timeSplit)) {
            stringTime = str;
        } else if (str.includes(dateSplit)) {
            stringDate = str;
            stringTime = "0";
        } else if (str == "") {
            return date;
        } else {
            throw new Error(`${str} cannot be casted to Date`);
        }
    } else if (arr.length == 2) {
        stringDate = arr[0];
        stringTime = arr[1];
    } else {
        throw new Error(`${str} cannot be casted to Date`);
    }

    if (stringDate != "") {
        parseDate(date, stringDate, dateSplit);
    }

    if (stringTime != "") {
        parseTime(date, stringTime, timeSplit);
    }

    return date;

    function parseDate(date: Date, dateString: string, dateSpliter: string) {
        let year = date.getFullYear(),
            month = date.getMonth(),
            day = date.getDate();

        const arr = dateString.split(dateSpliter);
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

    function parseTime(date: Date, string: string, timeSplit: string) {
        let hour = 0, minute = 0, seconds = 0;

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

/**
 * 获取经偏移校准的时间
 * @param {Number} offset 偏移时间(ms) 默认 vars.js ${dateOffset}
 * @returns {Date}
 */
function getSchoolDate(offset = dateOffset.value) {
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
    const day = (+nowDate - +weekStartDate.value) / 1000 / 60 / 60 / 24;

    offset += weekStartDate.value.getDay() == 0 ? 7 : weekStartDate.value.getDay() - 1;
    return Math.floor((day + offset) / 7) + 1;
}

/**
 * 返回一个时间是否在某一时间区间内
 * @param {*} startDate 起始时间
 * @param {*} endDate 结束时间
 * @param {*} date 默认当前时间
 * @returns {Boolean}
 */
function withinTime(startDate: ValidDate, endDate: ValidDate, date: ValidDate = getSchoolDate()) {
    startDate = toDate(startDate);
    endDate = toDate(endDate);
    date = toDate(date);

    return startDate < date && date < endDate;
}

function checkIntervalOrOver(date: ValidDate, func: Function, overFunc: Function, timeInterval: number = 1000) {
    const checkDate = toDate(date);

    const interval = new TimeInterval(() => {
        const nowDate = new Date();
        const left: number = +checkDate - +nowDate;

        if (left > 0) {
            setTimeout(func, left);
        } else {
            overFunc();
            interval.disable();
        }
    }, timeInterval);

    return interval;
}

export { DayName }
export { TimeSchedule, ValidDate, ValidTimeSchedule, TimeWihtinTask as TimeWihtin, TimeWithinTasks as TimeWithinAll, TimeInterval }
export { WithinStatus, dayStringMap, dateOffset, weekStartDate }
export { withinTime, checkIntervalOrOver, toDate, dateToString, getSchoolDate, getSchoolWeek }