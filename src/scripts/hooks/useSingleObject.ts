import { computed, reactive, ref, watch } from "vue";

export function useSingleArray<T>(datas: T[], defaultIndex = 0) {
    const array = reactive<T[]>(datas);
    const currentIndex = ref<number>(defaultIndex);
    const currentData = computed(() => array[currentIndex.value] as T);

    function nextData() {
        const index = currentIndex.value + 1;

        currentIndex.value = index >= array.length ? 0 : index;
    }

    return {
        currentIndex,
        currentData,
        array,
        nextData
    }
}

// useSingleObject 函数定义
export function useSingleObject<T>(defaultKey: keyof T, dataObject: T) {
    const currentKey = ref<keyof T>(defaultKey);

    const currentData = computed(() => {
        return dataObject[currentKey.value as keyof T];
    });

    return {
        currentKey,
        currentData
    };
}
