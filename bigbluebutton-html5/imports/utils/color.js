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

const RGB2HSV = (rgb) => {
    const hsv = { hue: 0, saturation: 0, value: 0 };
    const max = HSV.max(rgb.r, rgb.g, rgb.b);
    const dif = max - HSV.min(rgb.r, rgb.g, rgb.b);
    hsv.saturation = max === 0.0 ? 0 : (100 * dif) / max;
    if (hsv.saturation === 0) hsv.hue = 0;
    else if (rgb.r === max) hsv.hue = (60.0 * (rgb.g - rgb.b)) / dif;
    else if (rgb.g === max) hsv.hue = 120.0 + (60.0 * (rgb.b - rgb.r)) / dif;
    else if (rgb.b === max) hsv.hue = 120.0 + (60.0 * (rgb.r - rgb.g)) / dif;
    if (hsv.hue < 0.0) hsv.hue += 360.0;
    hsv.value = Math.round((max * 100 / 255));
    hsv.hue = Math.round(hsv.hue);
    hsv.saturation = Math.round(hsv.saturation);
    return hsv;
}