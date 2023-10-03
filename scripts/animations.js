const animations = {
    textChange: (() => {    
        const animateKeyFrames = {
            offset: [0, 1.0],
            opacity: [1, 0.5],
            filter: ["blur(0px)", "blur(20px)"],
            transform: ["", "scale(0.5)"]
        };
        
        const animateOpts = {
            fill: "both",
            easing: 'ease-in-out',
        };
        
        function animate(elem, isSame, changeCons, customOpts = {
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
                
                changeCons();
            });
        }
        
        return animate;
    })(),
};