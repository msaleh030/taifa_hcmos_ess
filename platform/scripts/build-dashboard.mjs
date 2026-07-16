#!/usr/bin/env node
/**
 * Generates docs/build-progress.html from docs/build-status.json — the live,
 * version-controlled build-progress dashboard. Re-run after each module lands,
 * then (re)publish the HTML as an Artifact for a shareable real-time preview.
 *
 *   node scripts/build-dashboard.mjs
 *
 * Env (optional): GIT_SHA, GENERATED_AT — stamped into the footer.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const status = JSON.parse(readFileSync(join(root, "docs", "build-status.json"), "utf8"));

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const LAYERS = ["db", "api", "web", "tests"];
const LAYER_LABEL = { db: "DB", api: "API", web: "Web", tests: "Tests" };

const all = status.domains.flatMap((d) => d.modules);
const count = (s) => all.filter((m) => m.status === s).length;
const done = count("done");
const inProgress = count("in_progress");
const planned = count("planned");
const total = all.length;
const weighted = done + inProgress * 0.5;
const pct = Math.round((weighted / total) * 100);

const layerCells = all.length * LAYERS.length;
const layerDone = all.reduce((n, m) => n + LAYERS.filter((l) => m[l]).length, 0);
const layerPct = Math.round((layerDone / layerCells) * 100);

const domainPct = (d) => {
  const w = d.modules.reduce((n, m) => n + (m.status === "done" ? 1 : m.status === "in_progress" ? 0.5 : 0), 0);
  return Math.round((w / d.modules.length) * 100);
};

const statusPill = (s) =>
  s === "done"
    ? '<span class="pill pill-done">Done</span>'
    : s === "in_progress"
      ? '<span class="pill pill-prog">In progress</span>'
      : '<span class="pill pill-plan">Planned</span>';

const layerDots = (m) =>
  LAYERS.map(
    (l) => `<span class="dot ${m[l] ? "on" : ""}" title="${LAYER_LABEL[l]}: ${m[l] ? "implemented" : "pending"}">${LAYER_LABEL[l]}</span>`,
  ).join("");

const moduleRow = (m) => `
    <div class="mod">
      <div class="mod-main">
        <div class="mod-name">${esc(m.name)}</div>
        <div class="mod-note">${esc(m.note || "")}</div>
      </div>
      <div class="mod-layers">${layerDots(m)}</div>
      <div class="mod-status">${statusPill(m.status)}</div>
    </div>`;

const domainSection = (d) => `
  <section class="domain">
    <header class="domain-h">
      <h2>${esc(d.name)}</h2>
      <div class="domain-bar"><span style="width:${domainPct(d)}%"></span></div>
      <span class="domain-pct num">${domainPct(d)}%</span>
    </header>
    <div class="mods">${d.modules.map(moduleRow).join("")}</div>
  </section>`;

const seamRow = (s) => `
    <li>
      <span class="seam-name">${esc(s.name)}</span>
      <span class="seam-owner">${esc(s.owner)}</span>
      <span class="seam-status">${esc(s.status)}</span>
    </li>`;

const gitSha = process.env.GIT_SHA || "local";
const generatedAt = process.env.GENERATED_AT || new Date().toISOString();

const html = `<style>
  :root {
    --green:#1FA24A; --green-d:#178A3E; --blue:#0094D4; --yellow:#FBC02D; --red:#E5484D;
    --bg:#EEF1F3; --surface:#FFFFFF; --surface-2:#F6F8F9; --text:#15191D; --muted:#5C6770;
    --faint:#8A949C; --border:#E2E7EA; --border-2:#EDF0F2;
    --font:system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;
    --mono:ui-monospace,"SFMono-Regular",Menlo,monospace;
  }
  @media (prefers-color-scheme: dark) {
    :root {
      --bg:#0C1115; --surface:#141B20; --surface-2:#1A2228; --text:#E7EDF1; --muted:#94A2AC;
      --faint:#697680; --border:#26313A; --border-2:#1E272E;
    }
  }
  :root[data-theme="light"] {
    --bg:#EEF1F3; --surface:#FFFFFF; --surface-2:#F6F8F9; --text:#15191D; --muted:#5C6770;
    --faint:#8A949C; --border:#E2E7EA; --border-2:#EDF0F2;
  }
  :root[data-theme="dark"] {
    --bg:#0C1115; --surface:#141B20; --surface-2:#1A2228; --text:#E7EDF1; --muted:#94A2AC;
    --faint:#697680; --border:#26313A; --border-2:#1E272E;
  }
  * { box-sizing:border-box; }
  body { margin:0; background:var(--bg); color:var(--text); font-family:var(--font); line-height:1.45; }
  .num { font-family:var(--mono); font-variant-numeric:tabular-nums; letter-spacing:-.02em; }
  .wrap { max-width:1040px; margin:0 auto; padding:32px 20px 64px; }
  .band { height:4px; border-radius:4px; background:linear-gradient(90deg,#1FA24A 0 34%,#FBC02D 34% 67%,#0094D4 67% 100%); }
  .eyebrow { text-transform:uppercase; letter-spacing:.11em; font-size:11px; font-weight:700; color:var(--faint); }
  h1 { font-size:26px; font-weight:750; letter-spacing:-.02em; margin:10px 0 4px; text-wrap:balance; }
  .sub { color:var(--muted); font-size:14px; max-width:60ch; }
  .tiles { display:grid; grid-template-columns:repeat(auto-fit,minmax(150px,1fr)); gap:14px; margin:26px 0; }
  .tile { background:var(--surface); border:1px solid var(--border); border-radius:12px; padding:16px 18px; }
  .tile .k { font-size:11px; text-transform:uppercase; letter-spacing:.08em; color:var(--faint); font-weight:600; }
  .tile .v { font-size:30px; font-weight:750; margin-top:6px; }
  .tile .v small { font-size:14px; color:var(--muted); font-weight:600; }
  .tile.accent .v { color:var(--green-d); }
  .big { background:var(--surface); border:1px solid var(--border); border-radius:12px; padding:20px; margin-bottom:26px; }
  .big-top { display:flex; align-items:baseline; justify-content:space-between; gap:12px; }
  .big-top .v { font-size:34px; font-weight:800; }
  .track { height:12px; border-radius:8px; background:var(--surface-2); border:1px solid var(--border-2); overflow:hidden; margin-top:12px; display:flex; }
  .track .seg-done { background:var(--green); }
  .track .seg-prog { background:var(--blue); }
  .track-legend { display:flex; gap:16px; margin-top:10px; font-size:12px; color:var(--muted); flex-wrap:wrap; }
  .swatch { display:inline-block; width:10px; height:10px; border-radius:3px; margin-right:6px; vertical-align:-1px; }
  .domain { margin-bottom:22px; }
  .domain-h { display:flex; align-items:center; gap:14px; margin:0 0 10px; }
  .domain-h h2 { font-size:15px; font-weight:700; margin:0; white-space:nowrap; }
  .domain-bar { flex:1; height:6px; border-radius:6px; background:var(--surface-2); border:1px solid var(--border-2); overflow:hidden; }
  .domain-bar span { display:block; height:100%; background:var(--green); }
  .domain-pct { font-size:12px; color:var(--muted); min-width:34px; text-align:right; }
  .mods { display:flex; flex-direction:column; gap:8px; }
  .mod { display:grid; grid-template-columns:1fr auto auto; align-items:center; gap:16px;
         background:var(--surface); border:1px solid var(--border); border-radius:10px; padding:12px 16px; }
  .mod-name { font-weight:650; font-size:14px; }
  .mod-note { color:var(--muted); font-size:12.5px; margin-top:2px; }
  .mod-layers { display:flex; gap:5px; }
  .dot { font-size:9.5px; font-weight:700; letter-spacing:.02em; color:var(--faint);
         border:1px solid var(--border); border-radius:5px; padding:3px 6px; background:var(--surface-2); }
  .dot.on { color:#fff; background:var(--green); border-color:var(--green); }
  .pill { font-size:11px; font-weight:700; padding:4px 11px; border-radius:20px; white-space:nowrap; }
  .pill-done { background:rgba(31,162,74,.14); color:var(--green-d); }
  .pill-prog { background:rgba(0,148,212,.14); color:var(--blue); }
  .pill-plan { background:var(--surface-2); color:var(--faint); border:1px solid var(--border); }
  .seams { background:var(--surface); border:1px solid var(--border); border-radius:12px; padding:20px; margin:28px 0; }
  .seams h2 { font-size:15px; margin:0 0 4px; }
  .seams p { color:var(--muted); font-size:13px; margin:0 0 12px; }
  .seams ul { list-style:none; padding:0; margin:0; display:flex; flex-direction:column; gap:8px; }
  .seams li { display:grid; grid-template-columns:1fr auto; gap:6px 16px; padding:10px 0; border-top:1px solid var(--border-2); align-items:center; }
  .seam-name { font-weight:650; font-size:13.5px; }
  .seam-owner { color:var(--muted); font-size:12.5px; }
  .seam-status { grid-column:2; color:var(--blue); font-size:12px; font-weight:600; text-align:right; }
  footer { color:var(--faint); font-size:12px; margin-top:30px; display:flex; justify-content:space-between; gap:12px; flex-wrap:wrap; border-top:1px solid var(--border-2); padding-top:14px; }
  @media (max-width:640px) {
    .mod { grid-template-columns:1fr; align-items:start; }
    .seams li { grid-template-columns:1fr; }
    .seam-status { grid-column:1; text-align:left; }
  }
</style>

<div class="wrap">
  <div class="band"></div>
  <div class="eyebrow" style="margin-top:16px;">HCMOS · Build progress</div>
  <h1>${esc(status.product)}</h1>
  <p class="sub">${esc(status.goal)}</p>

  <div class="tiles">
    <div class="tile accent"><div class="k">Modules done</div><div class="v num">${done}<small> / ${total}</small></div></div>
    <div class="tile"><div class="k">In progress</div><div class="v num">${inProgress}</div></div>
    <div class="tile"><div class="k">Planned</div><div class="v num">${planned}</div></div>
    <div class="tile"><div class="k">Layer coverage</div><div class="v num">${layerPct}<small>%</small></div></div>
  </div>

  <div class="big">
    <div class="big-top">
      <div>
        <div class="eyebrow">Overall completion</div>
        <div class="v num">${pct}%</div>
      </div>
      <div class="sub" style="text-align:right;">Weighted by module status<br/>(done = 1, in progress = ½)</div>
    </div>
    <div class="track">
      <div class="seg-done" style="width:${Math.round((done / total) * 100)}%"></div>
      <div class="seg-prog" style="width:${Math.round((inProgress / total) * 50)}%"></div>
    </div>
    <div class="track-legend">
      <span><span class="swatch" style="background:var(--green)"></span>Done</span>
      <span><span class="swatch" style="background:var(--blue)"></span>In progress (½)</span>
      <span><span class="swatch" style="background:var(--surface-2);border:1px solid var(--border)"></span>Planned</span>
      <span style="margin-left:auto;">Each module shows its <strong>DB · API · Web · Tests</strong> coverage</span>
    </div>
  </div>

  ${status.domains.map(domainSection).join("")}

  <div class="seams">
    <h2>External seams — cannot be produced by code alone</h2>
    <p>These require an action or sign-off outside the repository. Each is built to drop in the moment it arrives.</p>
    <ul>${status.externalSeams.map(seamRow).join("")}</ul>
  </div>

  <footer>
    <span>Generated from <span class="num">docs/build-status.json</span> · commit <span class="num">${esc(gitSha)}</span></span>
    <span class="num">${esc(generatedAt)}</span>
  </footer>
</div>`;

writeFileSync(join(root, "docs", "build-progress.html"), html);
console.log(`Wrote docs/build-progress.html — ${pct}% overall, ${done}/${total} modules done.`);
