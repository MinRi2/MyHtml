type stringObj = { [key: string]: any };

class Disable {
    private _enabled: boolean = false;

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

    public restart() {
        this.disable();
        this.enable();
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

        this._enabled = enabled;
    }

    public get enabled(): boolean {
        return this._enabled;
    }
}

export { Disable }
export { stringObj }