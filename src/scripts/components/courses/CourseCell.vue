<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch, watchEffect } from 'vue';
import { Course, coursesData } from '../../types/courses';
import * as animations from "../../utils/animations";
import { TimeInterval, getSchoolDate } from '../../utils/dateUtils';

const props = defineProps<{
    course: Course,
    offsetDay: number,
}>();

const headColor = ref("white");
const courseColor = ref("white");

const course = computed(() => props.course);
const courseName = computed(() => {
    if (!course.value || !course.value.courseName) {
        return "";
    }

    const courseName = course.value.courseName;

    if (courseName.charAt(0) == "*") {
        courseColor.value = "#aaa";
        return courseName.slice(1);
    }

    courseColor.value = "white";

    return courseName;
});
const shadowColor = computed(() => coursesData.getCourseColor(courseName.value));

const headElem = ref<HTMLElement>(),
    courseElem = ref<HTMLElement>();

const checkOverInterval = new TimeInterval(() => {
    const nowDate = getSchoolDate();

    headColor.value =
        props.offsetDay < 0 ? "#aaa" :
            props.offsetDay > 0 ? "white" :
                nowDate > course.value.schedule.getEndDate() ? "#aaa" :
                    nowDate > course.value.schedule.getStartDate() ? "#f7dC6f" : "white";
}, 3 * 1000, false);

onMounted(() => {
    watchEffect(() => {
        const courseElement = courseElem.value;

        if (courseElement) animations.textInnerHtmlChange({
            element: courseElement,
            innerHTML: courseName.value,
            options: {
                duration: 500,
            }
        });

        const headElement = headElem.value;
        if (headElement) animations.textInnerHtmlChange({
            element: headElement,
            innerHTML: course.value.headName,
            options: {
                duration: 500,
            }
        });
    });

    checkOverInterval.enable();
});

onUnmounted(() => {
    checkOverInterval.disable();
})
</script>

<template>
    <div class="cell">
        <h1 class="head" ref="headElem" :style="{
            color: headColor,
        }"></h1>
        <h2 class="course" ref="courseElem" :style="{
            color: courseColor,
            textShadow: `${shadowColor} 0px 0px 10px, ${shadowColor} 3px 3px 3px`,
        }"></h2>
    </div>
</template>

<style scoped>
.cell {
    display: flex;
    flex-flow: column;
    justify-content: center;
    align-items: stretch;

    font-size: 75px;
    padding: 0px 4px;
}

.head,
.course {
    display: block;

    min-height: 1em;

    font-size: 1em;
    color: white;
    padding: 0px 8px;
    background-color: #566573aa;
    box-shadow: 0px 0px 8px 3px #729eceaa inset;
    white-space: nowrap;
    transition: all 1s ease-out;
}

.head {
    border-top-left-radius: 0.3em;
    border-top-right-radius: 0.3em;

    text-shadow: 3px 3px 3px #000;
}

.course {
    border-bottom-left-radius: 0.3em;
    border-bottom-right-radius: 0.3em;
}
</style>