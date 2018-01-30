export function makeUniqueId() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
        return v.toString(16);
    });
}

function getDiff(newData, data) {
    const diff = {}
    let changed = false;
    for (let key in newData) {
        if (data[key] !== undefined 
            && data[key] !== newData[key]) {
            changed = true;
            diff[key] = newData[key];
        }
    }
    return { diff, changed }
}

export function mergeProps(component, name) {
    const props = component.get(name);
    if (!props) return;
    const { diff, changed } = getDiff(props, component.get());
    if (changed) {
        component.set(diff);
    }
}