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

interface AnimationData {
    element: HTMLElement,
    frames?: Keyframe[] | PropertyIndexedKeyframes;
    options?: KeyframeAnimationOptions;
}

interface ChangeAnimationData extends AnimationData {
    shouldChange: () => boolean;
    changeConsumer: () => void;
}

interface TextContentChangeData extends AnimationData {
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
function change({
    element,
    frames = {},
    options = changeOpts,
    shouldChange,
    changeConsumer
}: ChangeAnimationData) {
    if (!shouldChange()) {
        return;
    }

    const animation = element.animate({
        ...frames,
    }, {
        ...changeOpts,
        ...options,
    });

    animation.play();

    animation.finished.then(() => {
        animation.reverse();
        animation.play();

        changeConsumer();
    });
}

function textChange(data: ChangeAnimationData) {
    data.frames = {
        ...textChangeFrames,
        ...data.frames,
    }

    change(data);
}

function textInnerHtmlChange(data: TextContentChangeData) {
    const { element, innerHTML, shouldChange, changeConsumer } = data;

    textChange({
        ...data,

        shouldChange: () => {
            return element.innerHTML != innerHTML && (!shouldChange || shouldChange());
        },
        changeConsumer: () => {
            !changeConsumer || changeConsumer();
            element.innerHTML = innerHTML;
        },
    });
}

export { change, textChange, textInnerHtmlChange }