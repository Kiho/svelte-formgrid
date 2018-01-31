export function makeUniqueId() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
        return v.toString(16);
    });
}

export function mergeProps(component, name) {
    const s = component.get(name);
    if (s) {
        const t = component.get(), n = {};   
        for (let k in s) {
            if (t[k] !== undefined) {
                n[k] = s[k];
            }
        }                            
        component.set(n);
    }
}