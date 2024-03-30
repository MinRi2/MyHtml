import { stringObj } from "./typeUtils";

function mergeObjFrom(target: stringObj, source: stringObj, defaultObj?: stringObj) {
    const sourceKeys = Object.keys(source);

    sourceKeys.forEach(key => {
        mergeObjProp(target, source, key, defaultObj);
    });

    // 删除非默认配置的缺省值
    const targetKeys = Object.keys(target);
    targetKeys.forEach(key => {
        if (source[key] !== undefined) {
            return;
        }

        if (defaultObj && defaultObj[key]) {
            mergeObjProp(target, defaultObj, key, defaultObj);
            return;
        }

        target[key] = undefined;
    });

    return target;

    function mergeObjProp(target: stringObj, source: stringObj, key: string, defaultObj?: stringObj) {
        const targetData = target[key];
        const sourceData = source[key];

        if (!targetData) {
            target[key] = clone(sourceData);
            return;
        }

        if (typeof targetData !== typeof sourceData || targetData === sourceData) {
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
            target[key] = sourceData;
        }
    }
}

function mergeArrayFrom(target: any[], source: any[], defaultArray?: any[]) {
    const targetLen = target.length;
    const sourceLen = source.length;

    if (sourceLen < targetLen) {
        target.splice(sourceLen, targetLen - sourceLen);
    }

    for (let i = 0; i < sourceLen; i++) {
        const sourceElem = source[i];

        if (i >= targetLen) {
            target.push(clone(sourceElem));
        } else {
            if (Array.isArray(sourceElem) || typeof sourceElem == "object") {
                const defaultElem = defaultArray ? defaultArray[i] : undefined;

                mergeObjFrom(target[i], sourceElem, defaultElem);
            } else if (target[i] !== sourceElem) {
                target[i] = clone(sourceElem);
            }
        }
    }

    return target;
}

function clone(target: any) {
    if (Array.isArray(target)) {
        return mergeArrayFrom([], target);
    } else if (typeof target === "object") {
        return mergeObjFrom({}, target);
    }

    return target;
}

export { mergeObjFrom, mergeArrayFrom, clone };