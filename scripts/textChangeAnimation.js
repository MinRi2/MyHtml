var textChangeAnimation = (() => {    
    const animateKeyFrames = {
        offset: [0, 1.0],
        opacity: [1, 0.5],
        filter: ["blur(0px)", "blur(20px)"],
    };
    
    const animateOpts = {
        fill: "both",
        easing: 'ease-in-out',
    };
    
    function change(elem, isSame, changeCons, customOpts = {
        duration: 1000
    }){
        if(isSame()){
            return;
        }
        
        const animation = elem.animate(animateKeyFrames, {
            ...animateOpts,
            ...customOpts,
        });
        
        animation.play();
        
        animation.finished.then(() => {
            animation.reverse();
            animation.play();
            
            // 等待动画开始
            requestAnimationFrame(changeCons);
            
            animation.finished.then(() => animation.remove());
        });
    }
    
    return {
        change: change,
    }
})();