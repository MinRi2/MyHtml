const changeOpts: KeyframeAnimationOptions = {
    duration: 1000,
    fill: "both",
    easing: 'ease-in-out',
};

const textChangeFrames = {
    offset: [0, 1.0],
    opacity: [1, 0.5],
    filter: ["blur(0px)", "blur(20px)"],
    transform: ["", "scale(0.5)"]
};

type AnimateKeyframes = Parameters<Animatable['animate']>[0];

interface AnimationData {
    frames?: AnimateKeyframes;
    options?: KeyframeAnimationOptions | null;
}

interface ChangeAnimationData extends AnimationData {
    element: HTMLElement;
    shouldChange: () => boolean;
    changeConsumer: () => void;
}

interface HTMLChangeData extends AnimationData {
    element: HTMLElement;
    innerHTML: string;
    shouldChange?: () => boolean;
    changeConsumer?: () => void;
}

/**
 * 改变过度动画
 * @param {Element} elem 改变的元素 
 * @param {Function} isSame 前后是否相同
 * @param {Function} changeCons 执行改变的函数
 * @param {Object} customFames 动画帧
 * @param {Object} customOpts 动画配置
 * @returns 
 */
async function change({
    element,
    frames,
    options = {},
    shouldChange,
    changeConsumer
}: ChangeAnimationData) {
    if (!shouldChange()) {
        return;
    }

    const animation = element.animate(frames, {
        ...changeOpts,
        ...options,
    });

    animation.play();

    await animation.finished;

    animation.reverse();
    animation.play();

    changeConsumer();

    await animation.finished;

    animation.cancel();
}

async function textChange(data: ChangeAnimationData, mergeDefault = false) {
    if (!data.frames) {
        data.frames = textChangeFrames;
    } else if (mergeDefault) {
        data.frames = {
            ...textChangeFrames,
            ...data.frames,
        }
    }

    await change(data);
}

async function textInnerHtmlChange(data: HTMLChangeData) {
    const { element, innerHTML, shouldChange, changeConsumer } = data;

    await textChange({
        ...data,

        shouldChange: () => {
            return element.innerHTML != innerHTML && (shouldChange && shouldChange());
        },

        changeConsumer: () => {
            changeConsumer && changeConsumer();
            element.innerHTML = innerHTML;
        },
    });
}

export default { change, textChange, textInnerHtmlChange }
export {
    AnimateKeyframes, AnimationData, ChangeAnimationData, HTMLChangeData
}