import { reactive, watch } from 'vue';
import animations, { AnimationData } from '../utils/animations';

function useColoredText(
    animationOpt?: AnimationData,
    mergeDefault = false,
) {
    const data: {
        element?: HTMLElement,
        text?: string,
        color?: string,
    } = reactive({})

    watch(data, () => {
        const { element, color = "white", text = "" } = data;

        if (!element) {
            return;
        }

        if (!animationOpt) {
            element.textContent = text;
            element.style.setProperty("--color", color);
            return;
        }

        const { frames, options } = animationOpt;

        animations.textChange({
            element: element,
            shouldChange: () => true,
            changeConsumer: () => {
                element.textContent = text;
                element.style.setProperty("--color", color);
            },
            frames: frames,
            options: options
        }, mergeDefault);
    }, { deep: true });

    return data;
}

export default useColoredText;