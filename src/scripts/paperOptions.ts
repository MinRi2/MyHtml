import { BarScheduleData } from "./types/timeBar";
import { CourseShowOn } from "./types/courses";
import { DayName, ValidTimeSchedule } from "./utils/dateUtils";
import { TimerEventData } from "./types/event-timer";
import { stringObj } from "./utils/typeUtils";
import { WeatherTypeName } from "./types/wether-forcast-board";
import { Topics } from "./types/picturePaper";
import { ValidHotboardSource } from "./types/hotboard";

//#region 壁纸
interface PicturePaperOptions {
    unsplashKey: string;
    enableUnsplash: boolean;
    topics?: Topics[];

    images?: string[];

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
    acceptCoursesOnly?: string[];
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
    updateCardPerMinute: number;
    disableTime?: ValidTimeSchedule[];
    source: Record<ValidHotboardSource, {
        disable?: boolean,
        round: number,
    }>
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

//#region 
interface StyleOptions {
    courses?: string;
    timer?: string;
    timeBar?: string;
    clock?: string;
    hotboard: {
        width?: string;
        fontSize?: string;
    };
    weatherBoard?: string;
}

export default interface PaperOptions {
    style: StyleOptions;
    dateOffsetSeconds?: number;
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