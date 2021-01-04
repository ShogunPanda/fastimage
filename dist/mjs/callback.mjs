export function ensurePromiseCallback(callback) {
    if (typeof callback === 'function') {
        return [callback];
    }
    let promiseResolve, promiseReject;
    const promise = new Promise((resolve, reject) => {
        promiseResolve = resolve;
        promiseReject = reject;
    });
    return [
        (err, info) => {
            if (err) {
                return promiseReject(err);
            }
            return promiseResolve(info);
        },
        promise
    ];
}
