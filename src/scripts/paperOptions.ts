import { BarScheduleData } from "./types/timeBar";
import { CourseShowOn } from "./types/courses";
import { DayName, ValidDate, ValidTimeSchedule } from "./utils/dateUtils";
import { TimerEventData } from "./types/event-timer";
import { stringObj } from "./utils/typeUtils";
import { WeatherTypeName } from "./types/wether-forcast-board";

//#region 壁纸
interface PicturePaperOptions {
    unsplashKey: string;
    enableUnsplash: boolean;

    fetchCount: number;

    /**
     * 单位: min
     */
    fetchInterval: number;
    /**
     * 单位: min
     */
    nextPageInterval: number;
}
//#endregion

//#region 课条
interface TimeBarOptions {
    extraBar?: {
        [K in DayName]: BarScheduleData[]
    };
    defaultBar: BarScheduleData[];
}
//#endregion

//#region 课程
type DaySpecialsOptions = Partial<{
    [K in DayName]: DayScheduleOption;
}>;

interface CoursesOptions {
    nextDayTime: string;
    showDay?: DayName;
    defaultHeads: string[];
    defaultSchedules: string[];
    daySpecials: DaySpecialsOptions;
    specialCourses?: SpecialCourseOption[];
    headsOrder?: {
        [key: string]: number;
    };
}

interface DayScheduleOption {
    acceptDefault?: boolean;
    deleteHeads?: string[];
    defaultCourses?: string[];
    extraCourses?: ExtraCourseOption[];
    acceptDay?: DayName;
    specialSchedules?: {
        [key: string]: string;
    };
}

interface ExtraCourseOption {
    headName: string;
    courseName: string;
    schedule: string;
}

interface SpecialCourseOption {
    head?: string;
    course?: string;
    showOn: CourseShowOn;
}
//#endregion

//#region 倒计时
interface EventTimerOptions {
    events: TimerEventOptions[];
}

interface TimerEventOptions extends TimerEventData {
    showOn?: DayName[];
    scheduleHead?: string;
}
//#endregion

//#region 热搜榜
interface HotboardOptions {
    groupSize: number;
    maxRound: number;
    updateCardPerMinute: number;
    wenYanWen?: WenYanWenOptions;
}

interface WenYanWenOptions {
    enable: boolean;
    replaceIndex: number; // 替换的卡片排行
    startWeek: number;
    startPage: number;
    setpPage: number;
    text: string[];
}
//#endregion

//#region 天气预报
interface WeatherForcastOptions {
    hefengKey: string;

    /**
     * 天气预报气温图移动时间间隔 每秒
     */
    chartMoveSeconds: number;

    /**
     * 显示的类型
     */
    showType?: WeatherTypeName;

    showWithin: string[];
    show7dWithin: string[];
}

export default interface PaperOptions {
    dateOffset?: number;
    weekStartDate: string;

    picturePaper: PicturePaperOptions;
    courses: CoursesOptions;
    timeBar: TimeBarOptions;
    eventTimer: EventTimerOptions;
    hotboard: HotboardOptions;
    weather: WeatherForcastOptions;

    courseColorMap: stringObj;
    courseFullNameMap: stringObj;
    headFullNameMap: stringObj;
}

export {
    PicturePaperOptions,
    CoursesOptions,
    ExtraCourseOption,
    TimeBarOptions,
    EventTimerOptions,
    TimerEventOptions,
    HotboardOptions,
    WeatherForcastOptions
}