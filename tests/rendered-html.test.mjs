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
  assert.deepEqual(payload.campaign.distribution, {
    platform: "Kitabisa.com",
    campaignUrl: "https://kitabisa.com/campaign/patunganjohnsonuntukhutan",
  });
});

test("publishes the confirmed September 1–4 aggregate without invented orders", async () => {
  const payload = await (await render("/api/campaign")).json();
  const report = payload.daily.find(row => row.periodStart === "2026-09-01" && row.date === "2026-09-04");
  assert.ok(report);
  assert.equal(report.sales, 27698700);
  assert.equal(report.sales * payload.campaign.donationRate, 2769870);
  assert.equal(report.orders, null);
});
