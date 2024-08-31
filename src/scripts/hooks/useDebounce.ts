function debounce(fn: () => any, delay: number = 1000): () => void {
    var intervalId: NodeJS.Timeout | null = null;
    return function () {
        if (intervalId) {
            clearTimeout(intervalId);
            intervalId = null;
        }

        intervalId = setTimeout(() => {
            fn.apply(null, arguments);
        }, delay);
    }
}

export default debounce;