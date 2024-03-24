type stringObj = { [key: string]: any };

class Disable {
    private isEnabled: boolean = false;

    enable() {
        if (this.enabled) {
            return;
        }

        this.enabled = true;
    }

    disable() {
        if (!this.enabled) {
            return;
        }

        this.enabled = false;
    }

    protected onEnabled() {
    }
    protected onDisabled() { }

    public set enabled(enabled: boolean) {
        if (enabled) {
            this.onEnabled();
        } else {
            this.onDisabled();
        }

        this.isEnabled = enabled;
    }

    public get enabled(): boolean {
        return this.isEnabled;
    }
}

export { Disable }
export { stringObj }