const COMMENTS = /\/\*([^*]|\*(?!\/))+\*\//g;

// TODO: This isn't reliable and can break on default values and other silly things
export function getParameters(func: Function) {
    const regex = /(?<=\()(\w+,?)*/g;
    return regex
        .exec(func.toString().replace(COMMENTS, "").replace(/(async|\s+)/g, ""))[0]
        .split(",")
        .filter(String);
}
