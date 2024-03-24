import { DayName, TimeSchedule, ValidTimeSchedule, checkIntervalOrOver, dayStringMap, getSchoolDate, getSchoolWeek, toDate } from "../utils/dateUtils";

enum CourseShowOn {
    odd = "odd",
    even = "even",
}

interface DayScheduleData {
    headArray: string[],
    courseArray: string[],
    scheduleArray: string[],
}

class DaySchedule {
    public courseArray: Course[] = [];

    /**
     * @param {string} dayName
     */
    constructor(public dayName: DayName) {
    }

    /**
     * 设置课程名称
     * @param {String} headName 课头名称
     * @param {String} newCourseName 新课程名称
     */
    setCourseName(headName: string, newCourseName: string) {
        const course = this.getCourse(headName);

        if (course == null) {
            return;
        }

        course.courseName = newCourseName;
    }

    /**
     * 设置课程优先级
     * @param {String} headName 课头名称 
     * @param {Number} order 顺序 越小优先级越大
     */
    setOrder(headName: string, order: number) {
        const course = this.getCourse(headName);

        if (course == null) {
            return;
        }

        course.order = order;
        this.sortArray();
    }

    /**
     * 根据课头获取课程的名称
     * @param {String} headName 课头名称
     * @returns {String}
     */
    getCourseName(headName: string) {
        return this.getCourse(headName)?.courseName;
    }

    /**
     * 根据课头直接获取课程时间安排
     * @param {String} headName 课头名称
     * @returns {TimeSchedule}
     */
    getSchedule(headName: string) {
        return this.getCourse(headName)?.schedule;
    }

    /**
     * 根据课头获取课程
     * @param {String} headName 课头名称
     * @returns {Course}
     */
    getCourse(headName: string) {
        const course = this.courseArray.find(c => c.headName == headName);

        if (course == null) {
            console.warn(`${this.dayName} don't have a course whose headName is: ${headName}`);
            return null;
        }

        return course;
    }

    /**
     * 添加课程
     * @param {String} headName 课头名称
     * @param {String} courseName 课程名称
     * @param {String, TimeSchedule} schedule 时间安排 
     */
    addCourse(headName: string, courseName: string, schedule: ValidTimeSchedule) {
        const course = new Course(headName, courseName, schedule);

        this.courseArray.push(course);
        this.sortArray();
    }

    /**
     * 根据课头删除课程
     * @param  {...String} headNameArray 课头名称数组
     */
    deleteCourses(...headNameArray: string[]) {
        for (let i = 0, len = headNameArray.length; i < len; i++) {
            const headName = headNameArray[i];

            const index = this.courseArray.findIndex(c => c.headName == headName);
            if (index != -1) {
                this.courseArray.splice(index, 1);
            }
        }
    }

    /**
     * 排序
     */
    private sortArray() {
        this.courseArray.sort((c1, c2) => {
            if (c1.order === c2.order) {
                const d1 = c1.schedule.getStartDate(),
                    d2 = c2.schedule.getStartDate();
                return +d1 - +d2;
            } else {
                return c1.order - c2.order;
            }
        });
    }

    setSchedule(data: DayScheduleData) {
        const courses = Course.toCourses(data);

        this.courseArray.splice(0, this.courseArray.length);
        this.courseArray.push(...courses);

        this.sortArray();
    }
}

class Course {
    public order = 0;
    public schedule: TimeSchedule;

    /**
     * 
     * @param {String} headName 课头名称 
     * @param {String} courseName 课程名称
     * @param {String, TimeSchedule} schedule 时间安排
     */
    constructor(
        public headName: string,
        public courseName: string,
        schedule: ValidTimeSchedule
    ) {
        this.headName = headName;
        this.courseName = courseName;
        this.schedule = TimeSchedule.toTimeSchedule(schedule);
    }

    public static toCourses({
        headArray,
        courseArray,
        scheduleArray,
    }: DayScheduleData): Course[] {
        const length = headArray.length;

        if (length > courseArray.length || length > scheduleArray.length) {
            throw new Error(`
                The length of headArray is not enough! Check your array's length. More infomation: 
                    headArray's length: ${headArray.length}
                    courseArray's length: ${courseArray.length}
                    scheduleArray's length:${scheduleArray.length}
                `);
        }

        const result: Course[] = [];

        for (let i = 0; i < length; i++) {
            const headName = headArray[i],
                courseName = courseArray[i],
                schedule = scheduleArray[i];

            const course = new Course(headName, courseName, schedule);

            result.push(course);
        }

        return result;
    }
}

const daySchedules = dayStringMap.map(dayName => new DaySchedule(dayName));

export { DaySchedule, Course }
export { CourseShowOn, daySchedules }