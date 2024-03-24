import { ref, Ref, watch } from "vue";

class ElementGroup {
    public showing: GroupedElement | undefined;

    constructor(
        private defaultElement: GroupedElement,
        private children: GroupedElement[],
    ) {
        defaultElement.show();

        children.forEach(child => {
            child.hide();
        });

        watch(() => children.map(child => child.visible), () => {
            this.updateChildren();
        });
    }

    private updateChildren() {
        this.showing = this.children.find(child => child.visible);

        if (!this.showing) {
            this.defaultElement.show();
            return;
        }

        this.defaultElement.hide();

        this.children.forEach(child => {
            if (this.showing != child) {
                child.hide();
            }
        });
    }
}

class GroupedElement {
    private shown: boolean;
    hideAnimation?: Animation;

    constructor(
        hideAnimation?: Animation,
    ) {
        this.setAnimation(hideAnimation);
    }

    protected setAnimation(hideAnimation?: Animation) {
        this.hideAnimation = hideAnimation;

        if (this.hideAnimation) {
            this.hideAnimation.pause();
        }
    }

    public hide() {
        this.visible = false;
    }

    public show() {
        this.visible = true;
    }

    protected onHidden() {
        if (this.hideAnimation != null) {
            this.hideAnimation.playbackRate = 1;
            this.hideAnimation.play();
        }
    }

    protected onShown() {
        if (this.hideAnimation != null) {
            this.hideAnimation.playbackRate = -1;
            this.hideAnimation.play();
        }
    }

    public toggle() {
        if (this.visible) {
            this.hide();
        } else {
            this.show();
        }
    }

    public set visible(shown: boolean) {
        if (this.shown === shown) {
            return;
        }

        this.shown = shown;

        if (shown) {
            this.onShown();
        } else {
            this.onHidden();
        }
    }

    public get visible() {
        return this.shown;
    }
}

export { GroupedElement, ElementGroup }