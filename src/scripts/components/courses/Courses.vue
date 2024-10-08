<script setup lang="ts">
import { computed, onMounted, ref, watch, watchEffect } from 'vue';
import { CoursesOptions, ExtraCourseOption } from '../../paperOptions';
import CourseCell from './CourseCell.vue'
import { Course, coursesData } from '../../types/courses';
import animations from '../../utils/animations';
import { IntervalTask, getSchoolDate, toDate, dayStringMap, getSchoolWeek, DayName } from '../../utils/dateUtils';
import useColoredText from '../../hooks/useColoredText';

const { options } = defineProps<{
    options: CoursesOptions
}>();
const { daySchedules } = coursesData;

const dayElem = ref<HTMLElement>(), weekElem = ref<HTMLElement>();
const dayTexData = useColoredText({}), weekTextData = useColoredText({});

const showDay = ref(0);
const offsetDay = computed(() => {
    const today = getSchoolDate().getDay();

    let offsetDay = (showDay.value == 0 ? daySchedules.length + 1 : showDay.value) - today;
    return offsetDay = offsetDay > 7 ? 0 : offsetDay;
});

const todaySchedule = computed(() => daySchedules[showDay.value]);
const courseArray = computed(() => todaySchedule.value.courseArray);

onMounted(() => {
    dayTexData.element = dayElem.value;
    weekTextData.element = weekElem.value;

    var today = getSchoolDate().getDay();
    var nextDayTime = computed(() => {
        nextDayCheckTask.enable();
        return toDate(options.nextDayTime)
    });

    const nextDayCheckTask = new IntervalTask(() => {
        if (getSchoolDate() > nextDayTime.value) {
            showDay.value = (today + 1) % 7;
            nextDayCheckTask.disable();
        }
    }, 1000 * 5);

    showDay.value = today;

    watch(options, () => {
        readOptions();
    })

    watch(() => options.showDay, customShowDay => {
        if (!customShowDay) {
            showDay.value = today;
            return;
        }

        const index = dayStringMap.lastIndexOf(customShowDay);

        if (index == -1) {
            showDay.value = today;
            return;
        }

        showDay.value = index;
    });

    watchEffect(() => {
        dayTexData.text = dayStringMap[showDay.value];
    });

    watchEffect(() => {
        weekTextData.text = "" + getSchoolWeek(offsetDay.value);
    });
});


function readOptions() {
    const { defaultHeads, defaultSchedules, daySpecials, headsOrder } = options;

    const defaultCourses: {
        [K in DayName]?: Course[]
    } = {};

    dayStringMap.forEach((dayName: DayName) => {
        const daySpecial = daySpecials[dayName];

        if (!daySpecial) {
            defaultCourses[dayName] = Course.toCourses({
                headArray: defaultHeads,
                scheduleArray: defaultSchedules,
                courseArray: [],
            })

            return;
        }

        const { extraCourses, deleteHeads, specialSchedules, defaultCourses: courseNames, acceptCoursesOnly } = daySpecial;

        const headArray: string[] = [],
            scheduleArray: string[] = [],
            courseArray: string[] = [];

        // 处理默认课程安排
        defaultHeads.forEach((headName: string, index: number) => {
            if (deleteHeads && deleteHeads.includes(headName)) {
                return;
            }

            if (acceptCoursesOnly && !acceptCoursesOnly.includes(headName)) {
                return;
            }

            headArray.push(headName);
            scheduleArray.push(defaultSchedules[index]);

            if (courseNames) {
                courseArray.push(courseNames[index]);
            }
        });

        // 处理额外课程安排
        if (extraCourses) extraCourses.forEach((extraOption: ExtraCourseOption) => {
            const { headName, schedule, courseName } = extraOption;
            if (deleteHeads && deleteHeads.lastIndexOf(headName) != -1) {
                return;
            }

            if (acceptCoursesOnly && !acceptCoursesOnly.includes(headName)) {
                return;
            }

            headArray.push(headName);
            scheduleArray.push(schedule);
            courseArray.push(courseName);
        });

        // 处理特殊课头安排
        if (specialSchedules) for (const headName in specialSchedules) {
            const schedule = specialSchedules[headName];
            if (!schedule) continue;

            const index = headArray.lastIndexOf(headName);

            if (index == -1) {
                continue;
            }

            scheduleArray[index] = schedule;
        }

        const courses = defaultCourses[dayName] = Course.toCourses({
            headArray: headArray,
            scheduleArray: scheduleArray,
            courseArray: courseArray,
        });

        // 处理课头顺序
        if (headsOrder) for (const headName in headsOrder) {
            const order = headsOrder[headName];

            if (!order) return;

            const course = courses.find(course => course.headName === headName);
            if (course) {
                course.order = order;
            }
        }
    });

    daySchedules.forEach((schedule) => {
        const dayName = schedule.dayName;

        // 添加默认课程
        const courses = defaultCourses[dayName];
        schedule.setCourses(courses!);

        const daySpecial = daySpecials[dayName];
        if (!daySpecial) {
            return;
        }

        // 处理换课
        const acceptDay: DayName | undefined = daySpecial.acceptDay;
        if (acceptDay) {
            const acceptCourses = defaultCourses[acceptDay];
            if (acceptCourses) {
                schedule.setCourses(acceptCourses);
            }
        }
    });
}
</script>

<template>
    <div class="day" ref="dayElem"></div>
    <CourseCell v-for="course in courseArray" :course="course" :offsetDay="offsetDay">
    </CourseCell>
    <div class="week">
        第<br><span ref="weekElem"></span><br>周
    </div>
</template>

<style scoped>
.week,
.day {
    color: white;
    width: 1em;
    font-size: 0.8em;
    transition: all 1s ease-out;
}

.day {
    font-size: 1em;
}

.week span {
    text-shadow:
        3px 3px 3px #566573,
        6px 6px 3px #CCCCFF;
}
</style>