/*
 * engine: what every background scene shares, so a scene file is mostly placement and colour.
 * A scene is a list of layers drawn back to front over a grid of cells. Each layer is an object with any of:
 *   build(ctx)  once: precompute its fields; solid layers (land) mark their cells in ctx.solid
 *   frame(f)    every frame, before any layer draws: work out shared state (cloud cover, the wave), paint actors
 *   draw(f)     every frame: shade its cells into f.R, f.G, f.B (and f.floor, f.fade, f.cut)
 * Cells fall into three regions, set once all layers are built: SKY (above the horizon, not solid), SOLID, and
 * WATER (below the horizon). Actors (surfers, kites, birds) paint into an overlay that goes on top of everything.
 * Then each cell's colour becomes a dot (" ·•●", ordered-dithered by brightness) and the nearest palette colour,
 * scaled up to make up for a small dot (from ascii.rest's "night coast": MIT, (c) 2026 bas3line, LICENSE-ascii.rest).
 * Layers place themselves in grid cells; landforms place their features in their own 0..1 width, so moving or
 * stretching a landform carries its features (and what hangs off them, like the tablecloth) along.
 */
const levels = [0, 0.2, 0.4, 0.6, 0.8, 1];
export const PALETTE = [];
for (const r of levels) for (const g of levels) for (const b of levels)
    PALETTE.push("#" + [r, g, b].map((v) => Math.round(v * 255).toString(16).padStart(2, "0")).join(""));

const DOTS = " ·•●";
const COVER = [0, 0.3, 0.6, 1];
const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5].map((v) => v / 16 - 0.47);
export const SKY = 0, SOLID = 1, WATER = 2;

// --- maths ------------------------------------------------------------------------------------------------------------
export function hash(x, y) {
    let h = Math.imul(x | 0, 374761393) + Math.imul(y | 0, 668265263);
    h = Math.imul(h ^ (h >>> 13), 1274126177);
    return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}
export function noise(x, y, period) {
    const xi = Math.floor(x), yi = Math.floor(y);
    const fx = x - xi, fy = y - yi;
    const u = fx * fx * (3 - 2 * fx), v = fy * fy * (3 - 2 * fy);
    let x0 = xi, x1 = xi + 1;
    if (period) {
        x0 = ((xi % period) + period) % period;
        x1 = (x0 + 1) % period;
    }
    const a = hash(x0, yi), b = hash(x1, yi), c = hash(x0, yi + 1), d = hash(x1, yi + 1);
    return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
}
export function fbm(x, y, octaves, period) {
    let s = 0, n = 0, amp = 0.5, f = 1;
    for (let i = 0; i < octaves; i++) {
        s += amp * noise(x * f, y * f, period * f);
        n += amp;
        amp *= 0.5;
        f *= 2;
    }
    return s / n;
}
export const clamp = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);
export const smooth = (a, b, v) => {
    const k = clamp((v - a) / (b - a));
    return k * k * (3 - 2 * k);
};
export const mix = (a, b, k) => a + (b - a) * k;
export const hex = (s) => [1, 3, 5].map((i) => parseInt(s.slice(i, i + 2), 16) / 255);

// --- the light and the day's story, as keyframes by hour ------------------------------------------------------------
// K turns "#rrggbb" values into [r, g, b]; a light keyframe's numbers (bandAmt, lights, star...) pass through
export const K = (o) => Object.fromEntries(Object.entries(o).map(([k, v]) => [k, typeof v === "string" ? hex(v) : v]));
export const blend = (a, b, k) => {
    const o = {};
    for (const key in a) o[key] = Array.isArray(a[key]) ? a[key].map((v, i) => mix(v, b[key][i], k)) : mix(a[key], b[key], k);
    return o;
};
// keys: [[hour, value], ...] in order, the value a number or a light keyframe; eased between keys
export const at = (keys, h) => {
    for (let i = 1; i < keys.length; i++) {
        const [h1, s1] = keys[i], [h0, s0] = keys[i - 1];
        if (h <= h1) return typeof s0 === "number" ? mix(s0, s1, smooth(0, 1, (h - h0) / (h1 - h0))) : blend(s0, s1, smooth(0, 1, (h - h0) / (h1 - h0)));
    }
    return keys[keys.length - 1][1];
};

/*
 * scene(meta, build): an ascii.rest piece. build(day) returns the scene for that day (day picks moods and shapes):
 *   horizon  the row where sky meets water
 *   light    [[hour, light keyframe], ...]: the colours of the hour (f.L)
 *   curves   { name: [[hour, amount], ...] }: amounts by hour, each as f[name]; the layers read wind (chop, racing
 *            cloud, kites), cloth (the tablecloth), surf (surfers) and fire (the sunset: clouds lit from below, rays)
 *   bodies   { sun, moon: { hours: [rise, set], x: [from, to], height } }: arcs over the horizon (f.sun, f.moon)
 *   layers   back to front
 * Options: hour (0..24, the visitor's local time when null), rate (hours per animation second), seed (the day number
 * when null).
 */
export function scene(meta, build) {
    return function ({ hour = null, rate = 1 / 3600, seed = null } = {}) {
        const now = new Date();
        const hour0 = hour ?? now.getHours() + now.getMinutes() / 60;
        const day = seed ?? Math.floor(now.getTime() / 864e5 - now.getTimezoneOffset() / 1440);
        const s = build(day);
        const W = meta.cols, H = meta.rows, N = W * H, horizon = s.horizon;

        const solid = new Uint8Array(N);
        const ctx = { W, H, N, horizon, day, solid };
        for (const l of s.layers) l.build?.(ctx);
        const region = new Uint8Array(N);
        for (let k = 0; k < N; k++) region[k] = solid[k] ? SOLID : k < horizon * W ? SKY : WATER;

        const P = meta.palette.map(hex);
        const out = new Array(N);
        const lut = new Uint8Array(32768).fill(255);
        const nearest = (r, g, b) => {
            const k = (Math.min(31, (r * 31.99) | 0) << 10) | (Math.min(31, (g * 31.99) | 0) << 5) | Math.min(31, (b * 31.99) | 0);
            if (lut[k] !== 255) return lut[k];
            let best = 0, bd = 1e9;
            for (let i = 0; i < P.length; i++) {
                const dr = P[i][0] - r, dg = P[i][1] - g, db = P[i][2] - b;
                const d = 0.3 * dr * dr + 0.5 * dg * dg + 0.2 * db * db;
                if (d < bd) (bd = d), (best = i);
            }
            return (lut[k] = best);
        };

        // the overlay the actors paint into: colour and how much it covers
        const oR = new Float32Array(N), oG = new Float32Array(N), oB = new Float32Array(N), oA = new Float32Array(N);
        const paint = (x, y, c, a = 1) => {
            x = Math.round(x); y = Math.round(y);
            if (x < 0 || x >= W || y < 0 || y >= H) return;
            const k = y * W + x;
            if (a < oA[k]) return;
            oR[k] = c[0]; oG[k] = c[1]; oB[k] = c[2]; oA[k] = a;
        };
        // a body's arc: rising at x[0], setting at x[1], peaking height rows above the horizon
        const arc = ({ hours: [rise, set], x: [x0, x1], height }, h) => {
            const p = (((h - rise) % 24) + 24) % 24 / (set - rise);
            if (p <= 0 || p >= 1) return null;
            return [x0 + (x1 - x0) * p, horizon + 4 - Math.sin(Math.PI * p) * height];
        };

        const f = {
            ...ctx, region, paint,
            R: new Float64Array(N), G: new Float64Array(N), B: new Float64Array(N),
            floor: new Float64Array(N), fade: new Float64Array(N), cut: new Float64Array(N),
        };
        const draw = (t, { color } = {}) => {
            const h = (((hour0 + t * rate) % 24) + 24) % 24;
            f.t = t, f.h = h, f.L = at(s.light, h);
            for (const name in s.curves) f[name] = at(s.curves[name], h);
            f.sun = s.bodies.sun ? arc(s.bodies.sun, h) : null;
            f.moon = s.bodies.moon ? arc(s.bodies.moon, h) : null;
            f.disc = f.sun || f.moon || [-99, -99];
            f.lunar = !f.sun && !!f.moon;
            f.discUp = smooth(horizon + 4, horizon - 8, f.disc[1]);
            f.night = smooth(0.5, 0.95, f.L.star);
            f.floor.fill(0.3), f.fade.fill(1), f.cut.fill(0), oA.fill(0);
            for (const l of s.layers) l.frame?.(f);
            for (const l of s.layers) l.draw?.(f);

            const { R, G, B, floor, fade, cut } = f;
            for (let r = 0; r < H; r++) {
                for (let x = 0; x < W; x++) {
                    const k = r * W + x;
                    let cr = R[k], cg = G[k], cbl = B[k], fl = floor[k];
                    if (oA[k] > 0) {
                        const a = oA[k];
                        cr = mix(cr, oR[k], a), cg = mix(cg, oG[k], a), cbl = mix(cbl, oB[k], a);
                        if (oR[k] + oG[k] + oB[k] < 0.5) fl = 0; // a dark figure: a small dot against the bright
                    }
                    const peak = Math.max(cr, cg, cbl, 1e-4);
                    let level = clamp(fl + (1 - fl) * Math.pow(peak, 0.85) * 0.95) * fade[k];
                    // at night the empty sky stays black: only cells brighter than a threshold get a dot
                    if (cut[k] > 0) level = clamp((level - cut[k]) / (1 - cut[k]));
                    const step = Math.max(0, Math.min(3, Math.round(level * 3 + BAYER[(r & 3) * 4 + (x & 3)])));
                    out[k] = DOTS[step];
                    if (color) {
                        const want = step ? Math.min(1, (level + 0.06) / COVER[step]) : 0;
                        const sc = (0.3 + 0.7 * want) / peak;
                        color[k] = nearest(clamp(cr * sc), clamp(cg * sc), clamp(cbl * sc));
                    }
                }
            }
            const lines = [];
            for (let r = 0; r < H; r++) lines.push(out.slice(r * W, (r + 1) * W).join(""));
            return lines.join("\n");
        };
        // On a slow device (a frame costing more than ~14 ms), work out a fresh frame only every other tick and repeat the
        // last one in between: ascii.rest only redraws cells that changed, so a repeat is nearly free.
        let last = "", cost = 0, tick = 0;
        return (t, env) => {
            if (cost > 14 && tick++ % 2 && last) return last;
            const t0 = performance.now();
            last = draw(t, env);
            cost = cost * 0.9 + (performance.now() - t0) * 0.1;
            return last;
        };
    };
}

// --- sky layers ---------------------------------------------------------------------------------------------------------
// the sky: zenith to horizon (through L.mid, by L.midAmt, if the light has one), a glow band low down (strongest
// toward the sun, else at bandX), a halo round the disc
export function sky({ bandX }) {
    let haze;
    return {
        build({ W, N, horizon }) {
            haze = new Float32Array(N);
            for (let k = 0; k < horizon * W; k++) haze[k] = fbm((k % W) * 0.05, Math.floor(k / W) * 0.08, 3, 0);
        },
        draw(f) {
            const { W, horizon, region, L, disc, discUp, sun, R, G, B } = f;
            f.halo ??= new Float64Array(f.N);
            const cut = f.night > 0 ? 0.17 * f.night : 0;
            for (let r = 0; r < horizon; r++) {
                for (let x = 0; x < W; x++) {
                    const k = r * W + x;
                    if (region[k] !== SKY) continue;
                    const y = r + 0.5, dmx = x + 0.5 - disc[0], dmy = y - disc[1], dm = Math.sqrt(dmx * dmx + dmy * dmy);
                    const v = y / horizon, g = Math.pow(v, 2.4);
                    const veil = 0.85 + 0.3 * haze[k];
                    const halo = (f.halo[k] = (Math.exp(-dm / 24) * 0.35 + Math.exp(-dm / 9) * 0.45) * discUp);
                    const band = L.bandAmt * Math.exp(-(horizon - y) / 6) * (0.35 + 0.65 * Math.exp(-Math.abs(x - (sun ? sun[0] : bandX)) / 60));
                    R[k] = mix(L.zen[0], L.hor[0], g) * veil + L.halo[0] * halo + L.band[0] * band;
                    G[k] = mix(L.zen[1], L.hor[1], g) * veil + L.halo[1] * halo + L.band[1] * band;
                    B[k] = mix(L.zen[2], L.hor[2], g) * veil + L.halo[2] * halo + L.band[2] * band;
                    if (L.midAmt > 0) { // a band of colour two thirds of the way down (magenta at sunset)
                        const m = L.midAmt * Math.exp(-(((v - 0.66) / 0.2) ** 2)) * veil;
                        R[k] = mix(R[k], L.mid[0], m), G[k] = mix(G[k], L.mid[1], m), B[k] = mix(B[k], L.mid[2], m);
                    }
                    f.floor[k] = L.skyFloor;
                    f.cut[k] = cut;
                }
            }
        },
    };
}

// the sun or moon's disc (the moon a crescent), and scattered stars where the sky is clear, from row starsFrom down.
// The sun flattens and reddens as it sinks into the sea; on some days its last sliver flashes green.
export function celestial({ radius = 6, starsFrom }) {
    const RED = [1, 0.42, 0.2], GREEN = [0.45, 1, 0.55];
    return {
        draw(f) {
            const { W, horizon, region, L, lunar, t, R, G, B, halo, cover } = f;
            const low = lunar ? 0 : smooth(horizon - 8, horizon + 3, f.disc[1]) * smooth(0, 0.5, f.fire ?? 0); // 0 high up, 1 sinking into the sea
            const disc = [f.disc[0], f.disc[1]], squash = 1 + 0.7 * low; // rows count for more: an oval
            const flash = !lunar && f.disc[1] > horizon + 3.3 && hash(f.day, 21) > 0.5;
            const dc = flash ? GREEN : L.disc.map((v, i) => mix(v, RED[i], low));
            for (let r = 0; r < horizon; r++) {
                for (let x = 0; x < W; x++) {
                    const k = r * W + x;
                    if (region[k] !== SKY) continue;
                    const y = r + 0.5, dmx = x + 0.5 - disc[0], dmy = (y - disc[1]) * squash, dm = Math.sqrt(dmx * dmx + dmy * dmy);
                    const c = cover ? cover[k] : 0;
                    const shadowed = lunar && Math.hypot(dmx + 2.4, dmy + 0.9) < 5.5; // the crescent
                    if (dm < radius && !shadowed) {
                        const face = 0.86 + 0.14 * fbm(x * 0.5, y * 0.5, 2, 0);
                        const a = (1 - c * 0.8) * smooth(radius, radius - 1, dm);
                        R[k] = mix(R[k], dc[0] * face, a), G[k] = mix(G[k], dc[1] * face, a), B[k] = mix(B[k], dc[2] * face, a);
                    }
                    else if (L.star > 0 && c < 0.05 && hash(x, r * 3 + 11) > 0.985) {
                        const tw = 0.6 + 0.4 * Math.sin(t * (1.5 + hash(x, r) * 3) + hash(r, x) * 6.28);
                        const s = (0.5 + 0.5 * tw) * (1 - halo[k]) * smooth(horizon, starsFrom, y) * L.star * 0.8;
                        R[k] = Math.max(R[k], s * 0.92), G[k] = Math.max(G[k], s * 0.94), B[k] = Math.max(B[k], s);
                    }
                }
            }
        },
    };
}

// clouds: heaps of noise that wrap (period wide), so they drift forever, faster in the wind. cover: the noise level
// above which there is cloud; shift: where in the noise to start; top: the row where the open sky begins.
// Their cover (f.cover) is worked out before anything draws, so the stars and the disc can show through thin cloud.
// At sunset (f.fire) they gather, the light comes from below (the sun under them, lighting their bellies), and the
// higher ones stay lit longest.
export function clouds({ cover: cloudiness, shift, top, period = 640 }) {
    const CW = period;
    let cover, lit, under;
    return {
        build({ W, N, horizon }) {
            cover = new Float32Array(CW * horizon);
            lit = new Float32Array(CW * horizon), under = new Float32Array(CW * horizon);
            const density = (x, y) => {
                const q = fbm(x * 0.008, (y + shift) * 0.02, 3, CW * 0.008);
                const d = fbm(x * 0.018 + q * 2.4, (y + shift) * 0.036 + q * 1.1, 5, CW * 0.018);
                return d + 0.05 * smooth(6 + top, 16 + top, y) - 0.04 * smooth(8 + top, top, y) - 0.2 * smooth(horizon - 16, horizon - 3, y);
            };
            for (let r = 0; r < horizon; r++) {
                for (let x = 0; x < CW; x++) {
                    const y = r + 0.5, d = density(x, y);
                    cover[r * CW + x] = smooth(cloudiness, cloudiness + 0.11, d);
                    lit[r * CW + x] = clamp(0.5 + (d - density(x + 2.5, y - 3)) * 11 - (d - 0.6) * 1.2);
                    under[r * CW + x] = clamp(0.55 + (d - density(x + 2, y + 2.5)) * 13 - (d - 0.6) * 0.8);
                }
            }
        },
        frame(f) {
            const { W, N, horizon, region, disc, t } = f;
            const wind = f.wind ?? 0, fire = f.fire ?? 0;
            f.cover ??= new Float64Array(N);
            f.cloudLit ??= new Float64Array(N);
            const drift = t * (1.4 + wind * 7); // the clouds race in the wind
            for (let r = 0; r < horizon; r++) {
                for (let x = 0; x < W; x++) {
                    const k = r * W + x;
                    if (region[k] !== SKY) continue;
                    const y = r + 0.5, dmx = x + 0.5 - disc[0], dmy = y - disc[1], dm = Math.sqrt(dmx * dmx + dmy * dmy);
                    const sx = x + drift, ix = Math.floor(sx), fxx = sx - ix;
                    const i0 = r * CW + (ix % CW), i1 = r * CW + ((ix + 1) % CW);
                    f.cover[k] = (cover[i0] + (cover[i1] - cover[i0]) * fxx) * (0.15 + 0.85 * smooth(7, 24, dm)) * (0.75 + 0.35 * wind + 0.3 * fire);
                    f.cloudLit[k] = lit[i0] + (lit[i1] - lit[i0]) * fxx;
                    if (fire > 0) f.cloudLit[k] = mix(f.cloudLit[k], under[i0] + (under[i1] - under[i0]) * fxx, fire);
                }
            }
        },
        draw(f) {
            const { W, horizon, region, L, disc, discUp, R, G, B } = f;
            const fire = f.fire ?? 0;
            for (let r = 0; r < horizon; r++) {
                for (let x = 0; x < W; x++) {
                    const k = r * W + x, c = f.cover[k];
                    if (region[k] !== SKY || c <= 0.01) continue;
                    const y = r + 0.5, dmx = x + 0.5 - disc[0], dmy = y - disc[1], dm = Math.sqrt(dmx * dmx + dmy * dmy);
                    const near = Math.exp(-dm / 30) * discUp;
                    let b = clamp(f.cloudLit[k] * (0.5 + 0.6 * near) + 0.25 * smooth(horizon - 34, horizon, y));
                    if (fire > 0) b = clamp(b + fire * (0.25 * near + 0.2 * smooth(horizon - 16, top + 6, y)));
                    const lo = b < 0.5, kk = lo ? b * 2 : (b - 0.5) * 2;
                    const A = lo ? L.cloudDark : L.cloudMid, Bc = lo ? L.cloudMid : L.cloudLit;
                    const a = Math.min(1, c * 1.1);
                    R[k] = mix(R[k], mix(A[0], Bc[0], kk), a), G[k] = mix(G[k], mix(A[1], Bc[1], kk), a), B[k] = mix(B[k], mix(A[2], Bc[2], kk), a);
                }
            }
        },
    };
}

// crepuscular rays at sunset (by f.fire): beams of light and shadow fanning up from the sun, still there for a while
// after it has set (sun: the scene's sun, to follow it below the horizon). Drawn before the clouds, which hide them.
export function rays({ sun }) {
    const set = sun.hours[1];
    return {
        draw(f) {
            const fire = f.fire ?? 0;
            if (fire <= 0.01) return;
            const { W, horizon, region, L, t, h, R, G, B } = f;
            const o = f.sun || (h > set && h < set + 1.5 ? [sun.x[1], horizon + 4 + (h - set) * 16] : null);
            if (!o) return;
            for (let r = 0; r < horizon; r++) {
                for (let x = 0; x < W; x++) {
                    const k = r * W + x;
                    if (region[k] !== SKY) continue;
                    const dx = x + 0.5 - o[0], dy = r + 0.5 - o[1];
                    if (dy > -2) continue;
                    const beam = smooth(0.3, 0.7, noise(Math.atan2(dx, -dy) * 9 + 40, t * 0.02, 0));
                    const s = fire * 0.9 * Math.exp(-Math.hypot(dx, dy) / 110) * smooth(-2, -12, dy) * (beam - 0.4);
                    R[k] += L.band[0] * s, G[k] += L.band[1] * s, B[k] += L.band[2] * s;
                }
            }
        },
    };
}

// thin high streaks of cirrus, only at sunset (by f.fire), lit pink and gold: brightest toward the sun. Between rows
// from and to, wrapping (period wide) and drifting slowly.
export function streaks({ from, to, period = 640 }) {
    let field;
    return {
        build({ W }) {
            field = new Float32Array(period * to);
            for (let r = from; r < to; r++) {
                for (let x = 0; x < period; x++) {
                    const y = r + 0.5, n = fbm(x * 0.014, y * 0.32 + 7, 4, period * 0.014);
                    field[r * period + x] = smooth(0.56, 0.72, n) * smooth(from, from + 5, y) * smooth(to, to - 6, y);
                }
            }
        },
        draw(f) {
            const fire = f.fire ?? 0;
            if (fire <= 0.01) return;
            const { W, region, L, t, disc, R, G, B } = f;
            const drift = t * 0.6;
            for (let r = from; r < to; r++) {
                for (let x = 0; x < W; x++) {
                    const k = r * W + x;
                    if (region[k] !== SKY) continue;
                    const sx = x + drift, ix = Math.floor(sx), fx = sx - ix;
                    const i0 = r * period + (ix % period), i1 = r * period + ((ix + 1) % period);
                    const a = (field[i0] + (field[i1] - field[i0]) * fx) * fire * 0.85;
                    if (a <= 0.01) continue;
                    const toward = Math.exp(-Math.abs(x - disc[0]) / 70);
                    const c = L.mid ? L.mid.map((v, i) => mix(v, L.cloudLit[i], 0.3 + 0.6 * toward)) : L.cloudLit;
                    R[k] = mix(R[k], c[0], a), G[k] = mix(G[k], c[1], a), B[k] = mix(B[k], c[2], a);
                }
            }
        },
    };
}

/*
 * The night sky: the Milky Way and constellations. Two layers: glow (the Milky Way's light, behind the clouds) and
 * stars (the constellations, the faint lines joining them and the Milky Way's crowd of stars, over thin cloud).
 * milkyWay: { x, y, dx, dy }, a point on its spine and its direction; stars: { name: [[x, y, magnitude, tint], ...] };
 * lines: { name: [[star index, star index], ...] }. All in grid cells.
 */
export function nightSky({ milkyWay: MW, stars: STARS, lines: LINES }) {
    let milky, milkyStar, cStar, cLine, cTint;
    const glow = {
        build({ W, N, horizon }) {
            milky = new Float32Array(N), milkyStar = new Float32Array(N);
            // distance from its spine, clumped glow, a dark rift down the middle, and a crowd of faint stars
            const len = Math.hypot(MW.dx, MW.dy), nx = -MW.dy / len, ny = MW.dx / len;
            for (let r = 0; r < horizon; r++) {
                for (let x = 0; x < W; x++) {
                    const k = r * W + x, d = (x - MW.x) * nx + (r - MW.y) * ny;
                    const along = (x - MW.x) * (MW.dx / len) + (r - MW.y) * (MW.dy / len);
                    const band = Math.exp(-((d / (11 + 4 * fbm(along * 0.05, 1, 2, 0))) ** 2));
                    const rift = 1 - 0.75 * Math.exp(-(((d - 1.2 * Math.sin(along * 0.08)) / 1.8) ** 2)) * smooth(-60, -20, along);
                    milky[k] = band * (0.45 + 0.9 * fbm(x * 0.12, r * 0.2, 4, 0)) * rift;
                    milkyStar[k] = hash(x * 11 + 5, r * 13 + 7) > 1 - 0.2 * band * rift ? 0.5 + 0.5 * hash(x, r * 5) : 0;
                }
            }
            // the constellations and their lines, as per-cell light (they twinkle per frame)
            cStar = new Float32Array(N), cLine = new Float32Array(N), cTint = new Array(N);
            for (const [name, stars] of Object.entries(STARS)) {
                for (const [sx, sy, mag, tint] of stars) {
                    // a bright centre with a small cross of glow, so the figure reads among the Milky Way's crowd
                    for (const [dx, dy, f] of [[0, 0, 1], [1, 0, 0.4], [-1, 0, 0.4], [0, 1, 0.4], [0, -1, 0.4]]) {
                        const k = (Math.round(sy) + dy) * W + Math.round(sx) + dx;
                        if (mag * f > cStar[k]) (cStar[k] = mag * f), (cTint[k] = hex(tint));
                    }
                }
                for (const [a, b] of LINES[name] || []) {
                    const [x0, y0] = stars[a], [x1, y1] = stars[b];
                    const n = Math.ceil(Math.hypot(x1 - x0, y1 - y0));
                    for (let s = 2; s < n - 1; s += 2) { // every other cell, clear of the stars themselves
                        const k = Math.round(y0 + ((y1 - y0) * s) / n) * W + Math.round(x0 + ((x1 - x0) * s) / n);
                        if (!cStar[k]) cLine[k] = 1;
                    }
                }
            }
        },
        draw(f) {
            const { W, horizon, region, night, halo, R, G, B } = f;
            if (night <= 0.01) return;
            for (let r = 0; r < horizon; r++) {
                for (let x = 0; x < W; x++) {
                    const k = r * W + x;
                    if (region[k] !== SKY) continue;
                    const mwv = milky[k] * night * (1 - halo[k]) * smooth(horizon, horizon - 14, r + 0.5);
                    R[k] += 0.5 * mwv, G[k] += 0.52 * mwv, B[k] += 0.66 * mwv;
                }
            }
        },
    };
    const stars = {
        draw(f) {
            const { W, horizon, region, night, t, cover, R, G, B } = f;
            if (night <= 0.01) return;
            for (let r = 0; r < horizon; r++) {
                for (let x = 0; x < W; x++) {
                    const k = r * W + x;
                    if (region[k] !== SKY) continue;
                    const clear = 1 - Math.min(1, (cover ? cover[k] : 0) * 1.3);
                    if (cStar[k]) {
                        const s = Math.min(1, cStar[k] * night * clear * (0.85 + 0.15 * Math.sin(t * (1.5 + hash(x, r) * 2) + x)));
                        const tn = cTint[k];
                        R[k] = Math.max(R[k], s * tn[0]), G[k] = Math.max(G[k], s * tn[1]), B[k] = Math.max(B[k], s * tn[2]);
                        f.floor[k] = 0;
                    }
                    else if (cLine[k]) {
                        const s = 0.3 * smooth(0.75, 1, night) * clear;
                        R[k] = Math.max(R[k], s * 0.8), G[k] = Math.max(G[k], s * 0.85), B[k] = Math.max(B[k], s);
                    }
                    else if (milkyStar[k]) {
                        const s = milkyStar[k] * night * clear * (0.6 + 0.4 * Math.sin(t * 2 + k)) * 0.55;
                        R[k] = Math.max(R[k], s * 0.9), G[k] = Math.max(G[k], s * 0.92), B[k] = Math.max(B[k], s);
                    }
                }
            }
        },
    };
    return { glow, stars };
}

// --- land -----------------------------------------------------------------------------------------------------------------
/*
 * A landform standing on the horizon: a skyline traced as heights (0 = waterline, 1 = its main height) across its
 * width, placed in a box: x (its left column), width (columns), height (rows per 1.0 of the profile).
 *   flat     [u, u]: where the profile is a flat top (less texture on the edge)
 *   features { name: [u, u] }: stretches named in the landform's own 0..1 width, as columns in .features once made
 *   front    { at, height, left, right }: a nearer peak drawn over the trace (a triangle at u = at, its slopes reaching
 *            left and right), sunlit on its left flank, shadowed on its right, with a dark seam against the trace
 *   city     u: a strip of city along the waterline from the left edge of the grid to this point, its lights coming on
 *            at dusk (f.L.lights) and glowing behind the land at night (the .glow layer, drawn into the sky)
 * Exposes .top (the skyline's row per column, once built), .features, .cityEnd and .glow.
 */
export function landform({ profile, x: X, width: RW, height: RH, flat = [0, 0], features = {}, front = null, city = null }) {
    const MOUNT = 1, CITY = 2;
    const ridge = (u) => {
        const f = clamp(u) * (profile.length - 1), i = Math.min(profile.length - 2, Math.floor(f));
        return mix(profile[i], profile[i + 1], f - i);
    };
    const peak = (u) => front ? front.height * Math.max(0, 1 - Math.abs(u - front.at) / (u < front.at ? front.left : front.right)) : 0;
    const cityEnd = city == null ? -1 : X + Math.round(city * RW);
    let kind, shade, speck, near, edge, vegN, top, frontTop;
    const self = {
        features: Object.fromEntries(Object.entries(features).map(([k, [a, b]]) => [k, [X + Math.round(a * RW), X + Math.round(b * RW)]])),
        cityEnd,
        build({ W, H, N, horizon, solid }) {
            top = self.top = new Float32Array(W).fill(horizon), frontTop = new Float32Array(W).fill(horizon);
            for (let x = 0; x < W; x++) {
                const u = (x - X) / RW;
                if (u < -0.03 || u > 1.03) continue;
                const isFlat = u > flat[0] && u < flat[1];
                top[x] = horizon - ridge(clamp(u)) * RH - (fbm(x * 0.35, 5, 3, 0) - 0.5) * (isFlat ? 0.2 : 0.4); // the trace has its own texture
                frontTop[x] = Math.max(top[x], horizon - peak(u) * RH); // inside the outline: the outline stays the trace
            }
            kind = new Uint8Array(N), shade = new Float32Array(N), speck = new Float32Array(N);
            near = new Uint8Array(N), edge = new Uint8Array(N), vegN = new Float32Array(N);
            for (let r = 0; r < H; r++) {
                for (let x = 0; x < W; x++) {
                    const k = r * W + x, y = r + 0.5, tp = top[x];
                    if (x <= cityEnd && y >= horizon - 1.6 && y < horizon) {
                        kind[k] = CITY; // the city along the waterline
                        speck[k] = hash(x * 3 + 1, r * 7);
                    }
                    else if (y >= frontTop[x] && y < horizon) {
                        kind[k] = MOUNT;
                        // the front peak: a sunlit left flank, a shadowed right flank, and a dark seam where it overlaps the trace
                        const left = (x - X) / RW < front.at;
                        const seam = !left && frontTop[Math.min(W - 1, x + 1)] > y; // the next column right is the trace behind
                        edge[k] = seam ? 1 : 0;
                        shade[k] = seam ? 0.1 : clamp((left ? 0.8 : 0.3) + 0.2 * (fbm(x * 0.4, y * 0.3, 3, 0) - 0.5) + 0.2 * smooth(frontTop[x] + 2, frontTop[x], y));
                        near[k] = 1;
                    }
                    else if (y >= tp && y < horizon) {
                        kind[k] = MOUNT;
                        // gullies down the front, lit faces sloping right, pale cliffs under a flat top, darker scrub low down
                        const slope = top[Math.min(W - 1, x + 1)] - top[Math.max(0, x - 1)];
                        const gully = fbm(x * 0.55, y * 0.06, 3, 0);
                        const t = self.features.table;
                        const cliff = t && x >= t[0] - 2 && x <= t[1] + 2 ? smooth(tp + 7, tp + 1, y) * 0.3 : 0;
                        shade[k] = clamp(0.35 + 0.55 * (gully - 0.5) * 2 * 0.5 + clamp(slope * 0.12) + cliff - 0.3 * smooth(tp + 10, horizon, y));
                    }
                    if (kind[k]) {
                        solid[k] = 1;
                        vegN[k] = fbm(x * 0.3, r * 0.45, 3, 0); // patches of scrub and rock
                    }
                }
            }
        },
        draw(f) {
            const { W, H, L, t, R, G, B } = f;
            for (let r = 0; r < H; r++) {
                for (let x = 0; x < W; x++) {
                    const k = r * W + x, y = r + 0.5;
                    if (!kind[k]) continue;
                    const s = shade[k], tp = near[k] ? frontTop[x] : top[x];
                    let cr = mix(L.mtn[0], L.mtnLit[0], s), cg = mix(L.mtn[1], L.mtnLit[1], s), cbl = mix(L.mtn[2], L.mtnLit[2], s);
                    // the light along the ridge's edge (pale by day, orange at sunset, silver at night); the front
                    // peak's seam lit the same, so it reads over the trace at every time of day
                    const rim = edge[k] ? 0.75 : L.rimAmt * smooth(tp + 2.5, tp, y);
                    cr = mix(cr, L.rim[0], rim), cg = mix(cg, L.rim[1], rim), cbl = mix(cbl, L.rim[2], rim);
                    // by daylight the rock shows its colours: green scrub on the lower slopes, orange-brown sandstone
                    // in the cliffs under the top (faded out at dusk, so the sunset silhouette stays dark)
                    const day = clamp(1 - L.lights * 1.3 - L.star);
                    if (day > 0) {
                        const veg = smooth(tp + 3, tp + 9, y) * smooth(0.35, 0.6, vegN[k]) * day * 0.55;
                        const sand = smooth(tp + 6, tp + 1, y) * smooth(0.4, 0.7, vegN[k] + 0.25 * s) * day * 0.45;
                        const lum = 0.7 + 0.5 * s;
                        cr = mix(cr, 0.32 * lum, veg), cg = mix(cg, 0.4 * lum, veg), cbl = mix(cbl, 0.18 * lum, veg);
                        cr = mix(cr, 0.8 * lum, sand), cg = mix(cg, 0.5 * lum, sand), cbl = mix(cbl, 0.28 * lum, sand);
                    }
                    // a little air between us and the land (less by day, and in front of the nearer peak)
                    const air = (near[k] ? 0.04 : 0.12) * (1 - 0.6 * day);
                    cr = mix(cr, L.hor[0], air), cg = mix(cg, L.hor[1], air), cbl = mix(cbl, L.hor[2], air);
                    f.floor[k] = 0.1 * (1 - L.star); // at night no minimum dot: a dark shape against the sky
                    if (kind[k] === CITY) {
                        // pale buildings by day, warm lights coming on at dusk
                        const sp = speck[k];
                        if (sp > 0.55) {
                            const on = L.lights * smooth(0.55, 0.75, sp) * (0.8 + 0.2 * Math.sin(t * 2 + k));
                            const a = Math.max(on, 0.5 * (1 - L.lights));
                            cr = mix(cr, mix(0.72, 1, on), a), cg = mix(cg, mix(0.78, 0.82, on), a), cbl = mix(cbl, mix(0.86, 0.5, on), a);
                        }
                    }
                    R[k] = cr, G[k] = cg, B[k] = cbl;
                }
            }
        },
        // the city's warm glow in the sky behind the land at night, which is what shows its silhouette
        glow: {
            draw(f) {
                if (cityEnd < 0) return;
                const { W, horizon, region, L, R, G, B } = f;
                for (let r = 0; r < horizon; r++) {
                    for (let x = 0; x < W; x++) {
                        const k = r * W + x;
                        if (region[k] !== SKY) continue;
                        const g = L.lights * 0.3 * Math.exp(-(horizon - r - 0.5) / 9) * smooth(cityEnd + 6, cityEnd - 20, x);
                        R[k] += g, G[k] += g * 0.62, B[k] += g * 0.4;
                    }
                }
            },
        },
    };
    return self;
}

// cloud capping a landform's flat top (feature `table`) and pouring down its front, streaming downward (by f.cloth)
export function tablecloth({ on }) {
    return {
        draw(f) {
            const cloth = f.cloth ?? 0;
            if (cloth <= 0.01) return;
            const { W, horizon, L, t, R, G, B } = f;
            const [t0, t1] = on.features.table, ridgeTop = on.top;
            for (let r = 0; r < horizon; r++) {
                for (let x = Math.max(0, t0 - 7); x < Math.min(W, t1 + 10); x++) {
                    const k = r * W + x, y = r + 0.5;
                    const top = ridgeTop[x];
                    const edge = smooth(t0 - 8, t0 + 2, x) * smooth(t1 + 10, t1 - 1, x);
                    const pour = cloth * (5 + 8 * fbm(x * 0.12, 3, 2, 0)) * edge;
                    const cap = top - (1 + 2.5 * cloth) * edge;
                    if (y > cap - 1 && y < top + pour) {
                        const d = fbm(x * 0.22 + t * 0.05, (y - t * 1.1) * 0.25, 3, 0);
                        const below = y < top ? 0 : (y - top) / Math.max(0.1, pour); // 0 at the top, 1 where it evaporates
                        const a = cloth * edge * smooth(cap - 1, cap + 0.8, y) * smooth(0.42 + 0.25 * below, 0.55 + 0.25 * below, d + 0.12) * (1 - below * 0.6);
                        if (a > 0) {
                            const cc = L.cloudLit;
                            R[k] = mix(R[k], cc[0], a), G[k] = mix(G[k], cc[1], a), B[k] = mix(B[k], cc[2], a);
                            f.floor[k] = mix(f.floor[k], 0.2, a);
                        }
                    }
                }
            }
        },
    };
}

// --- water ----------------------------------------------------------------------------------------------------------------
/*
 * The sea below the horizon: calm and glassy with lines of swell, choppy with whitecaps in the wind (f.wind), the road
 * of light under the sun or moon, and city lights reflected (columns left of lightsEnd).
 * A wave breaks every ~11 s on calm days (or a lull), peeling left or right from somewhere between breaks[0] and
 * breaks[1], lineup rows below the horizon; its state is f.wave, for surfers to ride.
 */
export function water({ lineup = 10, breaks = [-10, 165], lightsEnd = -1 }) {
    return {
        frame(f) {
            const { t, day, horizon } = f;
            const wind = f.wind ?? 0;
            const period = 11, n = Math.floor(t / period), ph = (t % period) / period;
            const calm = 1 - smooth(0.05, 0.4, wind);
            const dir = hash(n, 11) > 0.5 ? 1 : -1;
            const len = 40 + hash(n, 13) * 100; // how far it peels before it fades
            const start = dir > 0 ? hash(n, 14) * 90 + breaks[0] : breaks[1] - hash(n, 14) * 90;
            const row = horizon + lineup;
            f.wave = {
                dir, start, row,
                front: start + dir * ph * len,
                on: calm * (hash(n, day + 5) > 0.2 ? 1 : 0) * smooth(0, 0.1, ph) * smooth(1, 0.7, ph),
                y: row + Math.round((hash(n, 12) - 0.5) * 4),
            };
        },
        draw(f) {
            const { W, H, horizon, region, L, t, disc, lunar, discUp, R, G, B } = f;
            const wind = f.wind ?? 0;
            const { on: wOn, front, dir: wDir, start: wStart, y: wY } = f.wave;
            for (let r = horizon; r < H; r++) {
                for (let x = 0; x < W; x++) {
                    const k = r * W + x;
                    if (region[k] !== WATER) continue;
                    const y = r + 0.5, v = (y - horizon) / (H - horizon);
                    const w = 0.6 * noise(x * 0.07 + t * 0.12, y * 0.45 - t * 0.6, 0) + 0.4 * noise(x * 0.2 - t * 0.25, y * 0.9 - t * 1.1, 0);
                    const chop = wind * (noise(x * 0.5 - t * 1.5, y * 1.6 - t * 2.2, 0) - 0.5);
                    // before the wind: clean lines of swell rolling in toward the beach, crests catching the light
                    const calm = 1 - smooth(0, 0.5, wind);
                    const lineY = (y - horizon) * (0.9 + 0.012 * (y - horizon) ** 1.5); // closer together far away
                    const lines = calm * (Math.pow(0.5 + 0.5 * Math.sin(lineY * 0.9 - t * 1.4 + 1.5 * noise(x * 0.04, y * 0.15, 0)), 3) - 0.3);
                    const swell = clamp(0.5 + (0.35 + 0.5 * wind) * (w - 0.5) * 2 + chop * 0.8 + 0.55 * lines);
                    let cr = mix(L.sea[0], L.seaLight[0], swell) * (1 - 0.35 * v);
                    let cg = mix(L.sea[1], L.seaLight[1], swell) * (1 - 0.35 * v);
                    let cbl = mix(L.sea[2], L.seaLight[2], swell) * (1 - 0.3 * v);
                    // the road of light under the sun or moon; under the moon it is wider and catches more glints
                    const roadW = (3 + (y - horizon) * 0.55) * (lunar ? 1.5 : 1);
                    const road = Math.exp(-(((x + 0.5 - disc[0]) / roadW) ** 2)) * discUp;
                    const glint = (lunar ? smooth(0.4, 0.72, w) : smooth(0.5, 0.8, w)) * road;
                    cr += L.road[0] * glint + L.roadBase[0] * road;
                    cg += L.road[1] * glint + L.roadBase[1] * road;
                    cbl += L.road[2] * glint + L.roadBase[2] * road;
                    // the sky's glow band, mirrored just under the horizon
                    const mb = L.bandAmt * Math.exp(-(y - horizon) / 3) * 0.5;
                    cr += L.band[0] * mb, cg += L.band[1] * mb, cbl += L.band[2] * mb;
                    // city lights reflected under the land at night
                    if (x < lightsEnd && y < horizon + 4 && L.lights > 0.3 && hash(x, 77) > 0.6) {
                        const q = L.lights * 0.35 * smooth(0.5, 0.8, w) * smooth(horizon + 4, horizon, y);
                        cr += q, cg += q * 0.8, cbl += q * 0.45;
                    }
                    // whitecaps in the wind
                    const cap = wind * smooth(0.82, 0.95, noise(x * 0.35 - t * 1.2, y * 1.2 - t * 1.6, 0)) * smooth(horizon, horizon + 6, y);
                    // the breaking wave
                    let foam = cap;
                    const dy = y - wY;
                    if (wOn > 0 && Math.abs(dy) < 4) {
                        const ahead = (x - front) * wDir; // >0: not yet broken
                        const since = (x - wStart) * wDir; // >0: where it has already peeled
                        const face = wOn * smooth(40, 10, ahead) * smooth(-1, 2, ahead) * smooth(3.5, 0.5, Math.abs(dy + 1)) * (dy < 1 ? 1 : 0);
                        if (face > 0) { // the turquoise face, lighter toward its crest
                            const tq = [0.02, 0.5, 0.52], crest = [0.5, 0.85, 0.92];
                            const kk = smooth(0, -2.5, dy) * face;
                            cr = mix(cr, mix(tq[0], crest[0], kk), face), cg = mix(cg, mix(tq[1], crest[1], kk), face), cbl = mix(cbl, mix(tq[2], crest[2], kk), face);
                        }
                        const spray = wOn * smooth(4, 0, Math.abs(ahead)) * smooth(-4.5, -1, dy) * smooth(2, 0, dy);
                        const white = wOn * smooth(-60, -8, ahead) * smooth(3, -0.5, ahead) * smooth(-2, 4, since)
                            * smooth(3.5, 0.5, Math.abs(dy - 0.5)) * (0.5 + 0.5 * noise(x * 0.6, y * 2 + t, 0));
                        foam = Math.max(foam, spray, white * 0.85);
                    }
                    R[k] = mix(cr, L.foam[0], foam), G[k] = mix(cg, L.foam[1], foam), B[k] = mix(cbl, L.foam[2], foam);
                    f.floor[k] = 0.18;
                    f.fade[k] = smooth(H, H - 26, y);
                }
            }
        },
    };
}

// --- actors: small figures painted over everything ------------------------------------------------------------------------
const BODY = [0.05, 0.05, 0.07], BOARD = [0.95, 0.95, 0.9], SPRAY = [0.92, 0.96, 1];

// surfers sitting in the lineup at columns at (shown by f.surf); one rides the breaking wave as it peels past
export function surfers({ at: spots }) {
    return {
        frame(f) {
            const surf = f.surf ?? 0;
            if (surf <= 0.05) return;
            const { t, paint, wave } = f;
            spots.forEach((sx, i) => {
                if (hash(i, 3) > surf + 0.2) return;
                const bob = Math.sin(t * 1.3 + i * 2) * 0.4;
                paint(sx, wave.row + 1.6 + bob, BODY);
                paint(sx + 1, wave.row + 2.2 + bob, BOARD, 0.9);
            });
            if (wave.on > 0.5) { // riding the face, just ahead of where it breaks
                const rx = wave.front + 5 * wave.dir;
                paint(rx, wave.y - 2, BODY);
                paint(rx, wave.y - 1, BOARD, 0.9);
                paint(rx - wave.dir, wave.y - 0.8, BOARD, 0.9);
            }
        },
    };
}

// kitesurfers in the wind (up to count, by f.wind): arched kites looping above, lines down to riders skimming the
// chop just under the horizon. colours: the kites' colours; dusk: [from, to] hours when only duskColour flies.
export function kites({ count = 4, colours, dusk = [99, 99], duskColour }) {
    const LINE = [0.6, 0.62, 0.66];
    return {
        frame(f) {
            const { t, h, day, W, horizon, paint } = f;
            const n = Math.round((f.wind ?? 0) * count);
            for (let i = 0; i < n; i++) {
                const dir = i % 2 ? -1 : 1;
                const rx = ((((60 + i * 47 + t * (5 + i * 1.5) * dir) % (W + 30)) + W + 30) % (W + 30)) - 15;
                // when the kite swings up to the top of its loop it pauses there, and lifts its rider off the water in a jump
                const loop = Math.sin(t * 0.9 + i * 2.3);
                const up = Math.pow(smooth(0.55, 1, -loop), 1.5);
                // about one loop in three is a big one: the kite soars well above the land and hauls its rider high
                const big = hash(Math.floor((t * 0.9 + i * 2.3 + Math.PI / 2) / (2 * Math.PI)), i + 31) > 0.66 ? 1 : 0;
                const jump = (5 + 7 * big) * up;
                const ry = horizon + 3 + (i % 2) * 3 + Math.sin(t * 0.9 + i) * 0.4 - jump;
                const kx = rx + 9 * dir + 10 * Math.sin(t * 0.45 + i * 1.7);
                const ky = horizon - 11 + (i % 2) * 2 + 3 * loop - jump * 0.5 - 12 * big * up;
                const pool = h > dusk[0] && h < dusk[1] ? [duskColour] : colours;
                const kc = pool[(i + Math.floor(hash(day, 9) * pool.length)) % pool.length];
                for (let dx = -4; dx <= 4; dx++) paint(kx + dx, ky + (dx * dx) / 7, Math.abs(dx) === 4 ? kc.map((v) => v * 0.6) : kc);
                for (const ex of [-4, 4]) { // two lines from the kite's tips to the rider
                    const x0 = kx + ex, y0 = ky + 16 / 7, m = Math.ceil(Math.hypot(rx - x0, ry - y0));
                    for (let s = 1; s < m; s += 3) paint(x0 + ((rx - x0) * s) / m, y0 + ((ry - 1 - y0) * s) / m, LINE, 0.35);
                }
                // the rider: a small dark figure
                paint(rx, ry - 1, BODY);
                paint(rx, ry, BODY);
                // a white wake behind; in the air, just a little spray left on the water below
                const wake = 1 - smooth(0.5, 2, jump);
                for (let w = 1; w <= 7; w++) paint(rx - w * dir, ry + jump + 0.3 + (w > 3 ? 0.4 : 0), SPRAY, 0.95 * (1 - w / 8) * Math.max(wake, w < 3 ? 0.6 : 0));
            }
        },
    };
}

// gulls drifting across around row (up to 5, by f.L.bird), hanging in the wind
export function gulls({ row }) {
    const GULL = [0.12, 0.12, 0.16];
    return {
        frame(f) {
            const { t, day, W, paint } = f;
            const wind = f.wind ?? 0, n = Math.round(f.L.bird * 5);
            for (let i = 0; i < n; i++) {
                const gx = W + 10 - ((t * (6 - wind * 4) + i * 13 + hash(day, i) * 40) % (W + 40));
                const gy = row + (i % 3) * 3 + Math.sin(t * 0.7 + i) * 2;
                const tip = Math.sin(t * 8 + i * 1.7) > 0 ? -1 : 1;
                for (const [ox, oy] of [[-2, tip], [-1, 0], [0, 0], [1, 0], [2, tip]]) paint(gx + ox, gy + oy, GULL, 0.95);
            }
        },
    };
}

// a shooting star now and then in a dark sky, starting within the box x: [left, width], y: [top, height]
export function shootingStar({ x: [x0, xw], y: [y0, yh] }) {
    return {
        frame(f) {
            if (f.night <= 0.6) return;
            const { t, day, paint } = f;
            const n = Math.floor(t / 9), p = (t % 9) / 0.8;
            if (p < 1 && hash(n, day) > 0.4) {
                const sx = x0 + hash(n, 7) * xw, sy = y0 + hash(n, 8) * yh;
                for (let s = 0; s < 10; s++) paint(sx + p * 50 - s * 1.6, sy + (p * 50 - s * 1.6) * 0.35, [1, 0.98, 0.92], (1 - s / 10) * (1 - p * 0.5));
            }
        },
    };
}

// a long wavering line of seabirds flying home low over the sea at dusk (between hours), right to left, now and then
export function flock({ hours: [h0, h1], row, count = 18, period = 40 }) {
    const BIRD = [0.06, 0.04, 0.08];
    return {
        frame(f) {
            const { t, h, day, W, paint } = f;
            if (h < h0 || h > h1) return;
            const n = Math.floor(t / period), p = (t % period) / period;
            if (hash(n, day + 3) < 0.25) return; // a lull
            const birds = Math.round(count * (0.5 + 0.5 * hash(n, 5)) * smooth(h0, h0 + 0.3, h) * smooth(h1, h1 - 0.3, h));
            const head = W + 10 - p * (W + birds * 5 + 30);
            const y0 = row + (hash(n, 6) - 0.5) * 6;
            for (let i = 0; i < birds; i++) {
                const x = head + i * 4.6 + Math.sin(i * 1.7) * 1.3;
                const y = y0 + i * 0.25 + Math.sin(x * 0.05 + t * 0.6) * 1.6;
                const up = Math.sin(t * 7 + i * 1.3) > 0 ? -1 : 0; // wings up or level
                paint(x - 1, y + up, BIRD, 0.95);
                paint(x, y, BIRD, 0.95);
                paint(x + 1, y + up, BIRD, 0.95);
            }
        },
    };
}

// a plane now and then (between hours) crossing high up left to right, its contrail catching the light of the hour
export function plane({ hours: [h0, h1], row, period = 75 }) {
    return {
        frame(f) {
            const { t, h, day, W, L, paint } = f;
            if (h < h0 || h > h1) return;
            const n = Math.floor(t / period), p = (t % period) / (period * 0.7);
            if (p > 1 || hash(n, day + 8) < 0.4) return;
            const x = -10 + p * (W + 80), y = row + (hash(n, 4) - 0.5) * 8 - p * 5;
            const fade = smooth(h0, h0 + 0.2, h) * smooth(h1, h1 - 0.2, h);
            for (let s = 2; s < 70; s++) paint(x - s, y + s * (5 / (W + 80)), L.cloudLit, 0.7 * fade * (1 - s / 70) * smooth(2, 6, s));
            paint(x, y, [1, 1, 0.92], fade);
        },
    };
}

// the evening star, the first light in the dusk (between hours), at cell x, y
export function eveningStar({ x, y, hours: [h0, h1] }) {
    return {
        frame(f) {
            const a = smooth(h0, h0 + 0.4, f.h) * smooth(h1, h1 - 0.3, f.h);
            if (a <= 0.01) return;
            f.paint(x, y, [1, 0.98, 0.9], a);
            for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) f.paint(x + dx, y + dy, [1, 0.95, 0.85], 0.3 * a);
        },
    };
}
