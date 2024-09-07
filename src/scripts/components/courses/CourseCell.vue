<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watchEffect } from 'vue';
import { Course, coursesData } from '../../types/courses';
import { IntervalTask, getSchoolDate } from '../../utils/dateUtils';
import useColoredText from '../../hooks/useColoredText';

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

const headData = useColoredText({
    options: { duration: 500 }
}),
    courseData = useColoredText({
        options: { duration: 500 }
    });

const checkOverInterval = new IntervalTask(() => {
    const nowDate = getSchoolDate();

    headColor.value =
        props.offsetDay < 0 ? "#aaa" :
            props.offsetDay > 0 ? "white" :
                nowDate > course.value.schedule.getEndDate() ? "#aaa" :
                    nowDate > course.value.schedule.getStartDate() ? "#f7dC6f" : "white";
}, 3 * 1000, false);

onMounted(() => {
    headData.element = headElem.value;
    courseData.element = courseElem.value;

    watchEffect(() => {
        headData.text = course.value.headName;
        courseData.text = courseName.value;

        headData.color = headColor.value;
        courseData.color = courseColor.value;
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