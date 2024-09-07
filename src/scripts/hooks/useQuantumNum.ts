import { customRef } from "vue";

function useQuantumNum(number: number, min: number, step: number) {
    return customRef((track, trigger) => {
        return {
            get() {
                track()
                return number;
            },
            set(newValue) {
                number = min + Math.round((newValue - min) / step) * step;
                trigger();
            }
        }
    });
}

export default useQuantumNum;