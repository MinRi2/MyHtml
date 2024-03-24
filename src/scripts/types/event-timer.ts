import { ValidDate, toDate } from "../utils/dateUtils";
import * as chroma from "chroma-js";

interface TimerEventData {
    order: number,
    name: string,
    startDate: ValidDate | null | undefined,
    endDate: ValidDate,
    discription?: string,
    color?: string,
}

class TimerEvent implements TimerEventData {
    secondStart = 60;
    minuteStart = 60;
    hourStart = 24;
    dayStart = 10;

    startDate: Date | null;
    endDate: Date;

    /**
     * 
     * @param {Number} order 事件顺序 越小越优先
     * @param {String} name 事件名称
     * @param {String, Date} startDate 开始日期
     * @param {String, Date} endDate 结束日期
     * @param {String} discription 事件描述
     * @param {String} color 事件名称阴影颜色
     */
    constructor(
        public order: number,
        public name: string,
        startDate: ValidDate | null | undefined,
        endDate: ValidDate,
        public discription: string = "",
        public color: string = "",
    ) {
        this.endDate = toDate(endDate);

        if (startDate) {
            this.startDate = toDate(startDate);

            const last = +this.endDate - +this.startDate;
            let secondStart = last / 1000,
                minuteStart = secondStart / 60,
                hourStart = minuteStart / 60,
                dayStart = hourStart / 24;

            this.secondStart = Math.min(this.secondStart, secondStart);
            this.minuteStart = Math.min(this.minuteStart, minuteStart);
            this.hourStart = Math.min(this.hourStart, hourStart);
            this.dayStart = Math.min(this.dayStart, dayStart);
        }

        if (!color || color == "") {
            this.color = chroma.random().hex();
        }
    }

    shouldTiming(date: Date): boolean {
        return (!this.startDate || date >= this.startDate) && date <= this.endDate;
    }
}

export { TimerEvent, TimerEventData }