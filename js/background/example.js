/*
 * example: a starter scene for the template. Rolling hills over a bay, through the day: copy this file, rename it,
 * set "scene" in background.json to the new name, and change the skyline, the light and the actors.
 * Drawn by engine.js (see its header for how a scene is built); preview with preview.html?scene=example.
 * ascii.rest's "night coast" underneath: MIT, (c) 2026 bas3line, licence in LICENSE-ascii.rest next to this file.
 */
import { PALETTE, K, scene, sky, celestial, clouds, nightSky, landform, water, gulls, eveningStar } from "./engine.js";

export const meta = {
    name: "example",
    category: "scenes",
    note: "Hills over a bay, through the visitor's day",
    cols: 200,
    rows: 100,
    cell: 1,
    fps: 24,
    ground: "#1a1a1a",
    palette: PALETTE,
    options: { hour: null, rate: 1 / 3600, seed: null },
};
const HORIZON = 60;

// the skyline: heights across the land (0 = waterline, 1 = its top), drawn left to right
const HILLS = [0.1, 0.3, 0.55, 0.8, 1, 0.9, 0.7, 0.6, 0.65, 0.8, 0.75, 0.5, 0.35, 0.3, 0.2, 0.1, 0];

// the light, as keyframes: every key needs every colour, so blends between them work
const NIGHT = K({
    zen: "#03050c", hor: "#0e1428", mid: "#0e1428", midAmt: 0, band: "#2a3050", bandAmt: 0.1, halo: "#4c5a6b", disc: "#f5f7ff",
    cloudDark: "#080b16", cloudMid: "#262e4a", cloudLit: "#b8c0dc",
    mtn: "#04060c", mtnLit: "#0c1224", rim: "#7080b0", rimAmt: 0.45,
    sea: "#0d1733", seaLight: "#1d2c55", road: "#f2f2f2", roadBase: "#1f2640", foam: "#8090b0",
    lights: 1, star: 1, bird: 0, skyFloor: 0,
});
const DAY = K({
    zen: "#4a99e0", hor: "#87c5fb", mid: "#87c5fb", midAmt: 0, band: "#bfe3ff", bandAmt: 0.15, halo: "#706850", disc: "#fffbe0",
    cloudDark: "#8c9cb4", cloudMid: "#c8d2e0", cloudLit: "#ffffff",
    mtn: "#4e6a3a", mtnLit: "#9cc070", rim: "#e8dcc0", rimAmt: 0.2,
    sea: "#086474", seaLight: "#2f9cad", road: "#fffbe6", roadBase: "#0c1818", foam: "#e6f0f6",
    lights: 0, star: 0, bird: 1, skyFloor: 0.15,
});
const SUNSET = K({
    zen: "#2c2f6a", hor: "#f59a40", mid: "#c0507a", midAmt: 0.6, band: "#ff7a10", bandAmt: 1, halo: "#a05020", disc: "#ffc060",
    cloudDark: "#3a2850", cloudMid: "#d0607a", cloudLit: "#ffa060",
    mtn: "#0b1a40", mtnLit: "#1c2f5c", rim: "#ff9a40", rimAmt: 0.7,
    sea: "#2c3a5c", seaLight: "#8693c2", road: "#ffa040", roadBase: "#4a3a40", foam: "#c8b8c0",
    lights: 0.7, star: 0.15, bird: 0.3, skyFloor: 0.15,
});
const LIGHT = [[0, NIGHT], [5, NIGHT], [7, DAY], [17, DAY], [19, SUNSET], [20.5, NIGHT], [24, NIGHT]];

export default scene(meta, () => {
    const land = landform({ profile: HILLS, x: 10, width: 110, height: 14, city: 0.9 });
    const night = nightSky({ milkyWay: { x: 60, y: 30, dx: 1, dy: -0.3 }, stars: {}, lines: {} });
    return { // layers back to front: sky, then land and sea, then the actors painted over everything
        horizon: HORIZON,
        light: LIGHT,
        // amounts by hour that the layers read (see engine.js): no wind, tablecloth or surfers here; the sunset glow
        curves: { wind: [[0, 0], [24, 0]], cloth: [[0, 0], [24, 0]], surf: [[0, 0], [24, 0]], fire: [[0, 0], [18.5, 0], [19.5, 1], [20.5, 0], [24, 0]] },
        bodies: {
            sun: { hours: [6, 19.8], x: [130, 180], height: 40 },
            moon: { hours: [18, 30], x: [140, 185], height: 34 },
        },
        layers: [
            sky({ bandX: 160 }),
            land.glow,
            night.glow,
            celestial({ starsFrom: 10 }),
            clouds({ cover: 0.6, shift: 0, top: 10 }),
            night.stars,
            land,
            water({ lightsEnd: land.cityEnd }),
            gulls({ row: 20 }),
            eveningStar({ x: 165, y: HORIZON - 20, hours: [19.6, 21.3] }),
        ],
    };
});
