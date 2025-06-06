export const check_string = (s: string) => {
    if (typeof s !== "string") {
        throw ["Expected a string"];
    }

    if (s.trim().length === 0) {
        throw ["String cannot be empty"];
    }

    if (s.length > 255) {
        throw ["String is too long"];
    }

    if (s.length < 3) {
        throw ["String is too short"];
    }

}