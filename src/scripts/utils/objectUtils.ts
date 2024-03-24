import { stringObj } from "./typeUtils";

function mergeObjFrom(target: stringObj, source: stringObj, defaultObj: stringObj | undefined = undefined) {
    const sourceKeys = Object.keys(source);

    sourceKeys.forEach(key => {
        const targetData = target[key];
        const sourceData = source[key];

        if (!targetData) {
            target[key] = clone(sourceData);
            return;
        }

        if (typeof targetData != typeof sourceData) {
            return;
        }

        if (targetData === sourceData) {
            return;
        }

        if (Array.isArray(targetData) && Array.isArray(sourceData)) {
            const defaultArray = defaultObj ? defaultObj[key] : undefined;
            mergeArrayFrom(targetData, sourceData, defaultArray);
            return;
        }

        if (typeof targetData == "object") {
            const defaultData = defaultObj ? defaultObj[key] : undefined;
            mergeObjFrom(targetData, sourceData, defaultData);
        } else {
            target[key] = clone(sourceData);
        }
    });

    if (!defaultObj) {
        return target;
    }

    const targetKeys = Object.keys(target);
    targetKeys.forEach(key => {
        if (source[key] !== undefined) {
            return;
        }

        const defaultData = defaultObj[key];
        if (defaultData !== undefined) {
            target[key] = clone(defaultData);
            return;
        }

        target[key] = undefined;
    });

    return target;
}

function mergeArrayFrom(target: any[], source: any[], defaultArray: any[]) {
    const length = target.length;

    source.forEach((element, index) => {
        if (index >= length) {
            target.push(element);
        } else {
            if (typeof element == "object") {
                const defaultElem = defaultArray ? defaultArray[index] : undefined;

                mergeObjFrom(target[index], element, defaultElem);
            } else if (target[index] !== element) {
                target[index] = element;
            }
        }
    });
}

function clone(target: any) {
    if (Array.isArray(target)) {
        return cloneArray(target);
    } else if (typeof target === "object") {
        return cloneObject(target);
    }

    return target;
}

function cloneObject(target: stringObj) {
    const result: stringObj = {};

    const keys = Object.keys(target);
    keys.forEach(key => {
        const element = target[key];

        if (Array.isArray(element)) {
            result[key] = cloneArray(element);
        } else if (typeof element === "object") {
            result[key] = cloneObject(element);
        } else {
            result[key] = element
        }
    });

    return result;
}

function cloneArray(target: any[]) {
    const result: any[] = [];

    for (let i = 0, len = target.length; i < len; i++) {
        const element = target[i];

        if (Array.isArray(element)) {
            result[i] = cloneArray(element);
        } else if (typeof element === "object") {
            result[i] = cloneObject(element);
        } else {
            result[i] = element;
        }
    }

    return result;
}

export { mergeObjFrom, mergeArrayFrom, clone, cloneObject, cloneArray };