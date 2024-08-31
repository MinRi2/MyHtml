import { computed, reactive, Ref, ref, watch } from "vue";

export function useSingleArray<T>(datas: T[], defaultIndex = 0) {
    const array = reactive<T[]>(datas);
    const currentIndex = ref<number>(defaultIndex);
    const currentData = computed(() => array[currentIndex.value] as T);

    function nextData(boolf: (data: T) => boolean = null, voidCons: () => any = null) {
        const nextIndex = currentIndex.value + 1;

        if (boolf == null) {
            currentIndex.value = nextIndex >= array.length ? 0 : nextIndex;
            return;
        }

        for (let i = 0; i < array.length; i++) {
            let index = (nextIndex + i) % array.length;

            if (boolf(array[index] as T)) {
                currentIndex.value = index;
                return;
            }
        }

        if (voidCons) voidCons();
    }

    return {
        currentIndex,
        currentData,
        array,
        nextData
    }
}

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
