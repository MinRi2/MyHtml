<script setup lang="ts">
import { onMounted, ref } from 'vue';

const props = defineProps<{
    delaySeconds: string
}>();

const initSuccess = ref(false);

onMounted(() => {
    setTimeout(() => initSuccess.value = true, parseInt(props.delaySeconds) * 1000);
});
</script>

<template>
    <span>
        <slot v-if="initSuccess"></slot>
    </span>
</template>