import * as chroma from "chroma-js";
import { TimeSchedule, ValidDate, ValidTimeSchedule } from "../utils/dateUtils";

interface BarScheduleData {
    name: string,
    schedule: ValidTimeSchedule,
    color?: string,
}

class BarSchedule extends TimeSchedule {
    /**
     * 
     * @param {String} name 课条名称
     * @param {ValidDate} startTime 起始时间 
     * @param {ValidDate} endTime 结束时间
     * @param {String} color 颜色 留白会随机生成
     */
    constructor(
        public name: string,
        startTime: ValidDate, endTime: ValidDate,
        public color: string = undefined,
    ) {
        super(startTime, endTime);

        if (!color || color == '') {
            this.color = chroma.random().hex()
        }
    }

    /**
     * 将Array转为BarSchedule
     * Array: [name, timeSchedule(String), color(*"white")]
     * @param {Array} array 
     * @returns {BarSchedule}
     */
    static toBarSchedule(array: BarScheduleData[]): BarSchedule[] {
        const result: BarSchedule[] = [];
        array.forEach(data => {
            const { name, schedule, color } = data;

            const timeSchedule = TimeSchedule.toTimeSchedule(schedule);

            if (timeSchedule.startTime == null) {
                throw new Error("BarScheule's startTime cannot be null");
            }

            result.push(new BarSchedule(name, timeSchedule.startTime, timeSchedule.endTime, color));
        })

        return result;
    }
}

export { BarScheduleData, BarSchedule }