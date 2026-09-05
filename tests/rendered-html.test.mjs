import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { before, after } from "node:test";
import { spawn } from "node:child_process";
import { setTimeout } from "node:timers/promises";

let server;
const origin = "http://127.0.0.1:3187";
before(async () => {
  server = spawn(process.execPath, ["node_modules/next/dist/bin/next", "start", "--hostname", "127.0.0.1", "--port", "3187"], { stdio: "pipe" });
  let logs = "";
  server.stdout.on("data", chunk => { logs += chunk; });
  server.stderr.on("data", chunk => { logs += chunk; });
  for (let attempt = 0; attempt < 100; attempt++) {
    if (server.exitCode !== null) throw new Error(logs);
    if (logs.includes("Ready in")) return;
    await setTimeout(100);
  }
  throw new Error(`Production server did not start: ${logs}`);
});
after(async () => {
  if (server && server.exitCode === null) {
    const exited = new Promise(resolve => server.once("exit", resolve));
    server.kill("SIGTERM");
    await exited;
  }
});

async function render(pathname = "/") {
  return fetch(`${origin}${pathname}`);
}

test("renders the public transparency dashboard shell", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);
  const html = await response.text();
  assert.match(html, /<title>JOHNSON UNTUK KALIMANTAN/);
  assert.match(html, /Menyiapkan/);
  assert.match(html, /class="leaf-atmosphere" aria-hidden="true"/);
  assert.doesNotMatch(html, /leaf-motion-toggle|Jeda efek|Lanjutkan efek|is-paused/);
  assert.doesNotMatch(html, /codex-preview|react-loading-skeleton|Starter Project/);
});

test("serves the repository campaign data", async () => {
  const response = await render("/api/campaign");
  assert.equal(response.status, 200);
  const payload = await response.json();
  const source = JSON.parse(await readFile(new URL("../data/campaign.json", import.meta.url), "utf8"));
  assert.deepEqual(payload, source);
  assert.equal(payload.campaign.name, "JOHNSON UNTUK KALIMANTAN");
  assert.equal(payload.campaign.donationRate, 0.1);
  assert.equal(payload.campaign.distribution.platform, "Kitabisa.com");
  assert.equal(payload.campaign.distribution.campaignUrl, "https://kitabisa.com/campaign/patunganjohnsonuntukhutan");
  assert.match(payload.campaign.distribution.roundingNote, /dibulatkan ke atas/);
});

test("publishes the confirmed September 1–4 sales and orders by channel", async () => {
  const payload = await (await render("/api/campaign")).json();
  const report = payload.daily.find(row => row.periodStart === "2026-09-01" && row.date === "2026-09-04");
  assert.ok(report);
  assert.equal(report.sales, 27698700);
  assert.deepEqual(report.channels, { website: 20248700, whatsapp: 7450000 });
  assert.equal(report.channels.website + report.channels.whatsapp, report.sales);
  assert.equal(report.sales * payload.campaign.donationRate, 2769870);
  assert.equal(report.orders, 86);
  assert.deepEqual(report.orderChannels, { website: 60, whatsapp: 26 });
  assert.equal(report.orderChannels.website + report.orderChannels.whatsapp, report.orders);
});

test("publishes the supplied Kitabisa proof and reconciles the allocation", async () => {
  const payload = await (await render("/api/campaign")).json();
  const proof = payload.disbursements[0];
  assert.equal(proof.amount, 2770000);
  assert.equal(proof.date, null);
  const allocation = payload.daily.find(row => row.date === "2026-09-04").sales * payload.campaign.donationRate;
  assert.equal(proof.amount - allocation, 130);
  assert.equal(Math.max(allocation - proof.amount, 0), 0);
  const response = await render(proof.proofUrl);
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type"), /image\/jpeg/);
  const original = await readFile(new URL("../public/proofs/kitabisa-johnson-2770000.jpg", import.meta.url));
  assert.deepEqual(Buffer.from(await response.arrayBuffer()), original);
});

test("adds September 5 with ten percent per channel without duplicating prior totals", async () => {
  const payload = await (await render("/api/campaign")).json();
  const rows = payload.daily.filter(row => row.date === "2026-09-05");
  assert.equal(rows.length, 1);
  const report = rows[0];
  assert.deepEqual(report.channels, { website: 1937000, whatsapp: 900000 });
  assert.deepEqual(report.orderChannels, { website: 7, whatsapp: 2 });
  assert.equal(report.sales, 2837000);
  assert.equal(report.orders, 9);
  assert.equal(report.channels.website * payload.campaign.donationRate, 193700);
  assert.equal(report.channels.whatsapp * payload.campaign.donationRate, 90000);
  const sales = payload.daily.reduce((sum, row) => sum + row.sales, 0);
  assert.equal(sales, 30535700);
  assert.equal(payload.daily.reduce((sum, row) => sum + row.orders, 0), 95);
  assert.equal(sales * payload.campaign.donationRate, 3053570);
  assert.equal(sales * payload.campaign.donationRate - payload.disbursements.reduce((sum, row) => sum + row.amount, 0), 283570);
});
