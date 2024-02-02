export function makeZeroPadding(num: number, length: number) {
    return (Array(length).join('0') + num).slice(-length);
}

export function getUserMentionLiteral(userId: string) {
    return "<@" + userId + ">";
}

export function getFileLog(fileName: string, maxLength = 4000) {
    const input = require("fs").readFileSync("./fileName", "utf8");
    const result = input.slice(Math.max(0, input.length - maxLength), input.length - 1);
    return result
}

export function sleep(time: number): Promise<void> {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve()
        }, time)
    })
}

export function sleepSeconds(time: number): Promise<void> {
    return sleep(time * 1000);
}

export function randomInt(integer: number) {
    return (Math.random() * integer) | 0;
}

export function connectLines(lines: string[]) {
    let result: string = "";
    for (let i = 0; i < lines.length; ++i) {
        result += lines[i];
        if (i < lines.length - 1) result += "\n";
    }
    return result;
}

export function getDateString(date: Date) {
    return (date.getFullYear() + "/" +
        ("0" + (date.getMonth() + 1)).slice(-2) + "/" +
        ("0" + date.getDate()).slice(-2));
}
