export const HSV = {
    hueShift: (h, s) => {
        let hh = h;
        hh += s;
        while (hh >= 360.0) hh -= 360.0;
        while (hh < 0.0) hh += 360.0;
        return hh;
    },
    min: (a, b, c) => a < b ? (a < c ? a : c) : b < c ? b : c,
    max: (a, b, c) => a > b ? (a > c ? a : c) : b > c ? b : c,
}