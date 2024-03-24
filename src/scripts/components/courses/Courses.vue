<script setup lang="ts">
import { computed, inject, onMounted, reactive, ref, watch, watchEffect } from 'vue';
import { CoursesOptions, ExtraCourseOption } from '../../paperOptions';
import CourseCell from './CourseCell.vue'
import { daySchedules } from '../../types/courses';
import * as animations from '../../utils/animations';
import * as chroma from 'chroma-js';
import { TimeInterval, getSchoolDate, toDate, dayStringMap, getSchoolWeek } from '../../utils/dateUtils';
import { stringObj } from '../../utils/typeUtils';

const { options } = defineProps<{
    options: CoursesOptions
}>();

const courseColorMap = inject<stringObj>("courseColorMap");

const dayElem = ref<HTMLElement>(), weekElem = ref<HTMLElement>();

const showDay = ref(0);
const offsetDay = computed(() => {
    const today = getSchoolDate().getDay();

    let offsetDay = (showDay.value == 0 ? daySchedulesReact.length + 1 : showDay.value) - today;
    return offsetDay = offsetDay > 7 ? 0 : offsetDay;
});
const daySchedulesReact = reactive(daySchedules);
const todaySchedule = computed(() => daySchedulesReact[showDay.value]);
const courseArray = computed(() => todaySchedule.value.courseArray);

onMounted(() => {
    var today = getSchoolDate().getDay();
    var nextDate = computed(() => {
        return toDate(options.nextDayTime);
    });

    const nextDayInterval = new TimeInterval(() => {
        if (getSchoolDate() > nextDate.value) {
            showDay.value = (today + 1) % 7;
            nextDayInterval.disable();
        }
    }, 1000 * 5);

    showDay.value = today;

    watch(() => options.nextDayTime, () => {
        nextDayInterval.enable();
    });

    watch(() => options.showDay, customShowDay => {
        if (!customShowDay) {
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
        const element = dayElem.value;
        if (!element) {
            return;
        }

        const dayText = dayStringMap[showDay.value];

        animations.textInnerHtmlChange({
            element: element,
            innerHTML: dayText,
            options: {
                duration: 200,
            }
        });
    });

    watchEffect(() => {
        const element = weekElem.value;
        if (!element) {
            return;
        }

        let weekText = `第<br><span>${getSchoolWeek(offsetDay.value)}</span><br>周`;

        animations.textInnerHtmlChange({
            element: element,
            innerHTML: weekText,
            options: {
                duration: 200,
            },
        });


    });
});

daySchedulesReact.forEach((schedule) => {
    const dayName = schedule.dayName;

    watch(options, () => {
        const { defaultHeads, defaultSchedules, specialCourses, headsOrder } = options;
        const daySpecial = options.daySpecials[dayName];

        if (!daySpecial) {
            schedule.setSchedule({
                headArray: defaultHeads,
                scheduleArray: defaultSchedules,
                courseArray: [],
            });

            return;
        }

        const { extraCourses, deleteHeads, specialSchedules, courseNames, acceptDefault } = daySpecial;

        const headArray: string[] = [],
            scheduleArray: string[] = [],
            courseArray: string[] = [];

        if (acceptDefault === undefined || acceptDefault) defaultHeads.forEach((headName: string, index: number) => {
            if (deleteHeads && deleteHeads.lastIndexOf(headName) != -1) {
                return;
            }

            headArray.push(headName);
            scheduleArray.push(defaultSchedules[index]);

            if (courseNames) {
                courseArray.push(courseNames[index]);
            }
        });

        if (extraCourses) extraCourses.forEach((extraOption: ExtraCourseOption) => {
            const { headName, schedule, courseName } = extraOption;
            if (deleteHeads && deleteHeads.lastIndexOf(headName) != -1) {
                return;
            }

            headArray.push(headName);
            scheduleArray.push(schedule);
            courseArray.push(courseName);
        });

        if (specialSchedules) for (const headName in specialSchedules) {
            const schedule = specialSchedules[headName];
            if (!schedule) continue;

            const index = headArray.lastIndexOf(headName);

            if (index == -1) {
                continue;
            }

            scheduleArray[index] = schedule;
        }

        schedule.setSchedule({
            headArray: headArray,
            scheduleArray: scheduleArray,
            courseArray: courseArray,
        });

        if (headsOrder) for (const headName in headsOrder) {
            if (!Object.prototype.hasOwnProperty.call(headsOrder, headName)) {
                continue;
            }

            const order = headsOrder[headName];
            schedule.setOrder(headName, order);
        }

    }, { deep: true });
});

function getCourseShadowColor(courseName: string) {
    if (!courseName || !courseColorMap) {
        return "";
    }

    const firstChar = courseName[0];
    return courseColorMap[firstChar] ?? courseColorMap[courseName] ?? chroma.random().hex();
}
</script>

<template>
    <div class="day" ref="dayElem"></div>
    <CourseCell v-for="course in courseArray" :course="course" :offsetDay="offsetDay"
        :getCourseShadowColor="getCourseShadowColor">
    </CourseCell>
    <div class="week" ref="weekElem"></div>
</template>

<style>
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