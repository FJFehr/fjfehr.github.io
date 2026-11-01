/*
 * capetown: Table Mountain from Big Bay, following the visitor's clock. An ascii.rest piece (https://ascii.rest),
 * built on its "night coast" scene: MIT, (c) 2026 bas3line, licence in LICENSE-ascii.rest next to this file.
 * Loaded by js/main.js (HERO BACKGROUND); drawn by engine.js, so this file only places things and picks colours.
 * The day's story:
 *   morning    still: glassy water, the mountain lit pink at first light, surfers in the lineup riding a peeling wave
 *   afternoon  the south-easter: the tablecloth pours over the flat top, chop and whitecaps, racing cloud, green kites
 *   evening    the wind drops: the sky on fire, clouds lit from below, rays fanning up from the sun, the silhouette
 *              against the orange band, cormorants flying home, the evening star, city lights coming on
 *   night      the crescent moon rising on the right with its road on the water, the Milky Way, the Southern Cross
 *              and its Pointers, Orion, faint lines joining their stars
 * Options: hour (0..24, the visitor's local time when null), rate (hours per animation second), seed (the day number
 * when null: picks the sunset mood and the cloud shapes).
 */
import {
    PALETTE, K, hash, scene, sky, celestial, rays, streaks, clouds, nightSky, landform, tablecloth, water,
    surfers, kites, gulls, flock, plane, eveningStar, shootingStar,
} from "./engine.js";

export const meta = {
    name: "cape town",
    category: "scenes",
    note: "Table Mountain from Big Bay, through the visitor's day",
    cols: 240,
    rows: 120,
    cell: 1,
    fps: 24,
    ground: "#1a1a1a",
    palette: PALETTE,
    options: { hour: null, rate: 1 / 3600, seed: null },
};
const PAD = 40; // columns of coast and sea added left of the original 200, so the hero can zoom out with the Table centred
const SKY = 20; // rows of open sky above the original 100-row scene: everything placed in the sky moves down by it
const HORIZON = 44 + SKY;

// The skyline, shaped on the reference photos (refs/ct4.jpg, ct7.jpg) and Fabio's notes: a wide, flat Table between
// Devil's Peak (left) and Lion's Head (right) at similar heights, and Signal Hill as a low hump in front, right.
// u runs 0..1 across the mountain; heights are 0 at the waterline, 1 at the Table's top.
// The skyline: traced edge-for-edge from refs/ct11.png (midday) and refs/ct4.jpg (sunset), each warped onto the same
// landmarks (Devil's Peak, the Table's corners, the saddle, Lion's Head, the end of Signal Hill) and averaged.
// 121 heights across the mountain, 0 = waterline, 1 = the Table's top. Both photos agree: Devil's Peak 1.03 just left of
// the Table, the saddle 0.25, Lion's Head 0.65. Widths are the photos'; heights are exaggerated about 2x (RIDGE_H).
const SKYLINE = [
    0.03, 0.05, 0.07, 0.08, 0.09, 0.077, 0.105, 0.154, 0.154, 0.128, 0.128, 0.115, 0.103, 0.125, 0.104, 0.114,
    0.124, 0.114, 0.124, 0.114, 0.137, 0.137, 0.147, 0.157, 0.203, 0.225, 0.252, 0.281, 0.314, 0.357, 0.399, 0.434,
    0.529, 0.638, 0.686, 0.696, 0.727, 0.775, 0.82, 0.843, 0.907, 1.033, 1.033, 1.023, 1.0, 0.962, 0.911, 0.863,
    0.853, 0.916, 1.0, 1.0, 1.0, 1.01, 1.01, 1.01, 1.0, 1.0, 1.0, 1.0, 1.01, 1.01, 1.01, 1.01,
    1.01, 1.0, 1.0, 1.001, 1.01, 1.01, 0.987, 0.987, 0.997, 0.997, 1.01, 1.01, 1.01, 1.01, 1.01, 1.005,
    0.87, 0.853, 0.834, 0.803, 0.775, 0.706, 0.572, 0.572, 0.514, 0.448, 0.448, 0.458, 0.448, 0.425, 0.415, 0.4,
    0.379, 0.332, 0.262, 0.245, 0.255, 0.297, 0.336, 0.387, 0.459, 0.553, 0.618, 0.651, 0.571, 0.473, 0.427, 0.389,
    0.354, 0.312, 0.266, 0.232, 0.187, 0.139, 0.107, 0.088, 0];
// The mountain's box: the Table (u 0.4134..0.6609) sits behind the hero's photo; the land ends around column 85+PAD.
// Heights are about twice the photo's, so Devil's Peak and the steps read. Devil's Peak is drawn again on top of the
// trace as a nearer triangle, so it stands out in front of the Table's corner.
const mountainBox = {
    profile: SKYLINE, x: -12 + PAD, width: 97, height: 16,
    flat: [0.423, 0.651],
    features: { table: [0.4134, 0.6609] },
    front: { at: 0.3416, height: 1.02, left: 0.09, right: 0.072 },
    city: 0.95, // the city and its lights stop under Signal Hill
};

// --- the light, as keyframes (colours sampled from the reference photos) --------------------------------------------
// band: the glow low on the horizon (amount bandAmt); rim: the light along the ridge's edge (amount rimAmt);
// lights: city and ship lights 0..1; star: 0..1.
const NIGHT = K({
    zen: "#03050c", hor: "#0e1428", band: "#2a3050", bandAmt: 0.1, halo: "#4c5a6b", disc: "#f5f7ff",
    cloudDark: "#080b16", cloudMid: "#262e4a", cloudLit: "#b8c0dc",
    mtn: "#04060c", mtnLit: "#0c1224", rim: "#7080b0", rimAmt: 0.45,
    sea: "#0d1733", seaLight: "#1d2c55", road: "#f2f2f2", roadBase: "#1f2640", foam: "#8090b0",
    lights: 1, star: 1, bird: 0, skyFloor: 0, // no minimum dot: a dark sky, lit only by the Milky Way and stars
});
const SUNRISE = K({ // ct10: a pastel sky, the mountain's face catching pink light
    zen: "#a8e3f8", hor: "#fcf2d0", band: "#ffd9b0", bandAmt: 0.35, halo: "#a08060", disc: "#fff0c0",
    cloudDark: "#9a8098", cloudMid: "#e6c0c0", cloudLit: "#fff0e6",
    mtn: "#8a5e4a", mtnLit: "#f0b890", rim: "#ffd8b8", rimAmt: 0.3,
    sea: "#214b68", seaLight: "#e4aca9", road: "#ffd0c0", roadBase: "#40303a", foam: "#f0e0e6",
    lights: 0.25, star: 0, bird: 0.6, skyFloor: 0.15,
});
const DAY = K({ // ct2, ct3, ct7
    zen: "#4a99e0", hor: "#87c5fb", band: "#bfe3ff", bandAmt: 0.15, halo: "#706850", disc: "#fffbe0",
    cloudDark: "#8c9cb4", cloudMid: "#c8d2e0", cloudLit: "#ffffff",
    mtn: "#6e6648", mtnLit: "#d0a678", rim: "#e8dcc0", rimAmt: 0.2,
    sea: "#086474", seaLight: "#2f9cad", road: "#fffbe6", roadBase: "#0c1818", foam: "#e6f0f6",
    lights: 0, star: 0, bird: 1, skyFloor: 0.15,
});
// the afternoon: the same light, the bay turning sea green in the south-easter
const AFTERNOON = { ...DAY, ...K({ sea: "#08666e", seaLight: "#32a4aa", foam: "#e8f2f2" }) }; // teal: between the morning blue and sea green
const GOLDEN = K({ // ct8
    zen: "#5e96c3", hor: "#e9d391", band: "#f0d890", bandAmt: 0.5, halo: "#a08040", disc: "#fff0b0",
    cloudDark: "#8c8070", cloudMid: "#e0c898", cloudLit: "#fff0c8",
    mtn: "#4a3a2c", mtnLit: "#b07850", rim: "#ffd890", rimAmt: 0.35,
    sea: "#214d53", seaLight: "#77a2a8", road: "#ffe6a0", roadBase: "#302818", foam: "#e8e0c8",
    lights: 0, star: 0, bird: 0.8, skyFloor: 0.15,
});
// the sunset in four moods, picked by date (ct4, ct9, the photo pasted into chat): a deep zenith, a magenta band
// two thirds of the way down (mid), and a burning horizon
const SUNSETS = [
    { zen: "#2c2f6a", mid: "#c0507a", hor: "#f59a40", band: "#ff7a10", cloudMid: "#d0607a", cloudLit: "#ffa060", road: "#ffa040" }, // orange
    { zen: "#2e2660", mid: "#b8407a", hor: "#f08068", band: "#ff5030", cloudMid: "#e06088", cloudLit: "#ff9a90", road: "#ff8060" }, // rose
    { zen: "#3a4a86", mid: "#c07890", hor: "#f6b450", band: "#ffd070", cloudMid: "#c08890", cloudLit: "#ffd890", road: "#ffd070" }, // gold
    { zen: "#24205a", mid: "#a83070", hor: "#ff7030", band: "#ff3c10", cloudMid: "#e04060", cloudLit: "#ff9040", road: "#ff7030" }, // fire
].map(K);
const SUNSET_BASE = K({
    halo: "#a05020", disc: "#ffc060", bandAmt: 1, cloudDark: "#3a2850", midAmt: 0.6,
    mtn: "#0b1a40", mtnLit: "#1c2f5c", rim: "#ff9a40", rimAmt: 0.7,
    sea: "#2c3a5c", seaLight: "#8693c2", roadBase: "#4a3a40", foam: "#c8b8c0",
    lights: 0.7, star: 0.15, bird: 0.3, skyFloor: 0.15,
});
// the afterglow, just after the sun is down: the clouds' bellies still red, the sky going violet over the city lights
const AFTERGLOW = K({
    zen: "#141a44", mid: "#7a3a8a", midAmt: 0.7, hor: "#e0603a", band: "#d04020", bandAmt: 0.8, halo: "#603040", disc: "#ffe0c0",
    cloudDark: "#2a1838", cloudMid: "#a03860", cloudLit: "#ff7a6a",
    mtn: "#060a20", mtnLit: "#101a3a", rim: "#ff6a40", rimAmt: 0.5,
    sea: "#1a2244", seaLight: "#6a5a90", road: "#ff9070", roadBase: "#3a2a3a", foam: "#a090a8",
    lights: 0.9, star: 0.3, bird: 0.15, skyFloor: 0.12,
});
// every key needs every colour to blend: a light without a middle band has its horizon colour there, unused
const withMid = (L) => ({ mid: L.hor, midAmt: 0, ...L });
const timeline = (sunset) => {
    const dusk = { ...SUNSET_BASE, ...sunset };
    return [[0, NIGHT], [5.2, NIGHT], [6.4, SUNRISE], [8.2, DAY], [11.5, DAY], [13.5, AFTERNOON], [16.2, AFTERNOON], [17.7, GOLDEN], [19.2, dusk], [19.95, AFTERGLOW], [20.8, NIGHT], [24, NIGHT]]
        .map(([h, L]) => [h, withMid(L)]);
};
// the day's story, as amounts by hour
const WIND = [[0, 0], [11, 0], [13.5, 1], [17.5, 1], [19.5, 0.15], [21, 0], [24, 0]]; // the south-easter
const CLOTH = [[0, 0], [12.5, 0], [14.5, 1], [16.8, 1], [18, 0], [24, 0]]; // the tablecloth, gone before sunset
const SURF = [[0, 0], [5.8, 0], [6.8, 1], [11, 1], [12.5, 0], [24, 0]]; // surfers in the lineup
const FIRE = [[0, 0], [18.3, 0], [19.3, 0.7], [19.8, 1], [20.3, 0.85], [20.9, 0], [24, 0]]; // the sunset, peaking as the sun goes
// the sun rises just right of Signal Hill and sets over the sea on the right; the moon rises on the right too and
// peaks at 22:00 (shows once the sun is down)
const SUN = { hours: [5.9, 19.8], x: [126 + PAD, 148 + PAD], height: 38 };
const MOON = { hours: [17.4, 26.6], x: [128 + PAD, 150 + PAD], height: 34 };

// --- the night sky: Milky Way and constellations (sky cells, rows from the top) ----------------------------------------
// The Milky Way rises from behind the mountain through the Southern Cross, which sits over Devil's Peak (looking south
// from Big Bay the Cross really is over the mountain). Orion, drawn southern-hemisphere way up (feet on top), is over
// Lion's Head. Everything stays below row ~10: the hero fades the top rows out under the top bar.
const MW = { x: 24, y: 18, dx: 1, dy: -0.3 }; // a point on its spine and its direction
const STARS = {
    crux: [[24, 11, 1, "#ffd8b0"], [25, 22, 1.2, "#d8e4ff"], [19, 15.5, 1, "#d8e4ff"], [30, 15, 0.85, "#e8eeff"], [28, 19, 0.55, "#ffe8d0"]],
    pointers: [[8, 24, 1.2, "#fff0d8"], [13, 21.5, 1.05, "#d8e4ff"]],
    orion: [[93, 25, 1.15, "#ffb070"], [106, 24, 0.95, "#d8e4ff"], [96, 18.5, 0.9, "#e0e8ff"], [99.5, 17.8, 0.9, "#e0e8ff"],
        [103, 17.1, 0.9, "#e0e8ff"], [94, 11, 0.85, "#e0e8ff"], [107, 10.5, 1.15, "#c8d8ff"], [99.5, 13.5, 0.5, "#e0e8ff"]],
};
// pairs of star indices joined by faint lines
const LINES = {
    crux: [[0, 1], [2, 3]],
    pointers: [[0, 1]],
    orion: [[0, 2], [1, 4], [2, 3], [3, 4], [2, 5], [4, 6], [0, 1]],
};
const shift = (o) => Object.fromEntries(Object.entries(o).map(([k, v]) => [k, v.map(([x, y, ...r]) => [x + PAD, y + SKY, ...r])]));

// kites in primary colours (and the template green); by sunset only bright green ones: they stand out best against the orange
const KITES = [[1, 0.18, 0.15], [0.15, 0.4, 1], [1, 0.85, 0.1], [0.35, 1, 0.3]];

export default scene(meta, (day) => {
    const mountain = landform(mountainBox);
    const night = nightSky({ milkyWay: { ...MW, x: MW.x + PAD, y: MW.y + SKY }, stars: shift(STARS), lines: LINES });
    return { // layers back to front: sky, then land and sea, then the actors painted over everything
        horizon: HORIZON,
        light: timeline(SUNSETS[Math.floor(hash(day, 1) * SUNSETS.length)]),
        curves: { wind: WIND, cloth: CLOTH, surf: SURF, fire: FIRE },
        bodies: { sun: SUN, moon: MOON },
        layers: [
            sky({ bandX: 145 + PAD }),
            mountain.glow,
            night.glow,
            celestial({ starsFrom: 12 + SKY }),
            rays({ sun: SUN }),
            streaks({ from: SKY + 2, to: HORIZON - 22 }),
            clouds({ cover: 0.55 + (hash(day, 2) - 0.5) * 0.08, shift: hash(day, 3) * 200, top: SKY }),
            night.stars,
            mountain,
            water({ lineup: 10, breaks: [-10, 165], lightsEnd: mountain.cityEnd }),
            tablecloth({ on: mountain }),
            surfers({ at: [62 + PAD, 101 + PAD, 146 + PAD] }),
            kites({ colours: KITES, dusk: [17.6, 21], duskColour: [0.3, 1, 0.25] }),
            gulls({ row: 7 + SKY }),
            flock({ hours: [19.1, 20.6], row: HORIZON - 5 }), // cormorants flying home over the bay
            plane({ hours: [18.8, 20.4], row: SKY + 6 }),
            eveningStar({ x: 132 + PAD, y: HORIZON - 26, hours: [19.6, 21.3] }), // Venus over where the sun went down
            shootingStar({ x: [20 + PAD, 100], y: [2 + SKY, 8] }),
        ],
    };
});
