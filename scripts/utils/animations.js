const animations = {
    change: (() => {
        const animateOpts = {
            duration: 1000,
            fill: "both",
            easing: 'ease-in-out',
        };

        /**
         * 改变过度动画
         * @param {Element} elem 改变的元素 
         * @param {Function} isSame 前后是否相同
         * @param {Function} changeCons 执行改变的函数
         * @param {Object} customFames 动画帧
         * @param {Object} customOpts 动画配置
         * @returns 
         */
        function animate(elem, isSame, changeCons, customFames, customOpts = {}) {
            if (isSame()) {
                return;
            }

            const animation = elem.animate({
                ...customFames,
            }, {
                ...animateOpts,
                ...customOpts,
            });

            animation.play();

            animation.finished.then(() => {
                animation.reverse();
                animation.play();

                changeCons();
            });
        }

        return animate;
    })(),

    textChange: (elem, isSame, changeCons, customFames = {}, customOpts = {}) => {
        const animateFrames = {
            offset: [0, 1.0],
            opacity: [1, 0.5],
            filter: ["blur(0px)", "blur(20px)"],
            transform: ["", "scale(0.5)"]
        };

        animations.change(elem, isSame, changeCons, {
            ...animateFrames,
            ...customFames
        }, customOpts);
    },
};