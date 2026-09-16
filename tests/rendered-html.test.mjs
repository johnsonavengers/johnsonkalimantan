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
  const throughSeptember5 = payload.daily.filter(row => row.date <= "2026-09-05");
  const sales = throughSeptember5.reduce((sum, row) => sum + row.sales, 0);
  assert.equal(sales, 30535700);
  assert.equal(throughSeptember5.reduce((sum, row) => sum + row.orders, 0), 95);
  assert.equal(sales * payload.campaign.donationRate, 3053570);
  assert.equal(sales * payload.campaign.donationRate - payload.disbursements[0].amount, 283570);
});

test("adds September 6 sales and orders with the correct donation totals", async () => {
  const payload = await (await render("/api/campaign")).json();
  const rows = payload.daily.filter(row => row.date === "2026-09-06");
  assert.equal(rows.length, 1);
  const report = rows[0];
  assert.deepEqual(report.channels, { website: 7643000, whatsapp: 1300000 });
  assert.deepEqual(report.orderChannels, { website: 30, whatsapp: 4 });
  assert.equal(report.sales, 8943000);
  assert.equal(report.orders, 34);
  assert.equal(report.channels.website * payload.campaign.donationRate, 764300);
  assert.equal(report.channels.whatsapp * payload.campaign.donationRate, 130000);
  assert.equal(report.sales * payload.campaign.donationRate, 894300);
  const throughSeptember6 = payload.daily.filter(row => row.date <= "2026-09-06");
  const sales = throughSeptember6.reduce((sum, row) => sum + row.sales, 0);
  assert.equal(sales, 39478700);
  assert.equal(throughSeptember6.reduce((sum, row) => sum + row.orders, 0), 129);
  assert.equal(sales * payload.campaign.donationRate, 3947870);
  assert.equal(payload.disbursements[0].amount, 2770000);
  assert.equal(sales * payload.campaign.donationRate - 2770000, 1177870);
});

test("adds September 7 with correct channel and cumulative totals", async () => {
  const payload = await (await render("/api/campaign")).json();
  const reports = payload.daily.filter(row => row.date === "2026-09-07");
  assert.equal(reports.length, 1);
  const report = reports[0];
  assert.deepEqual(report.channels, { website: 2383000, whatsapp: 125000 });
  assert.deepEqual(report.orderChannels, { website: 7, whatsapp: 1 });
  assert.equal(report.sales, 2508000);
  assert.equal(report.orders, 8);
  assert.equal(report.channels.website * payload.campaign.donationRate, 238300);
  assert.equal(report.channels.whatsapp * payload.campaign.donationRate, 12500);
  assert.equal(report.sales * payload.campaign.donationRate, 250800);
  const records = payload.daily.filter(row => row.date <= "2026-09-07");
  const sales = records.reduce((sum, row) => sum + row.sales, 0);
  assert.equal(sales, 41986700);
  assert.equal(records.reduce((sum, row) => sum + row.orders, 0), 137);
  assert.equal(sales * payload.campaign.donationRate, 4198670);
  assert.equal(payload.disbursements[0].amount, 2770000);
  assert.equal(sales * payload.campaign.donationRate - 2770000, 1428670);
});

test("adds September 8 with correct channel and cumulative totals", async () => {
  const payload = await (await render("/api/campaign")).json();
  const reports = payload.daily.filter(row => row.date === "2026-09-08");
  assert.equal(reports.length, 1);
  const report = reports[0];
  assert.deepEqual(report.channels, { website: 2245000, whatsapp: 1200000 });
  assert.deepEqual(report.orderChannels, { website: 6, whatsapp: 3 });
  assert.equal(report.sales, 3445000);
  assert.equal(report.orders, 9);
  assert.equal(report.channels.website * payload.campaign.donationRate, 224500);
  assert.equal(report.channels.whatsapp * payload.campaign.donationRate, 120000);
  assert.equal(report.sales * payload.campaign.donationRate, 344500);
  const records = payload.daily.filter(row => row.date <= "2026-09-08");
  const sales = records.reduce((sum, row) => sum + row.sales, 0);
  assert.equal(sales, 45431700);
  assert.equal(records.reduce((sum, row) => sum + row.orders, 0), 146);
  assert.equal(sales * payload.campaign.donationRate, 4543170);
  assert.equal(payload.disbursements[0].amount, 2770000);
  assert.equal(sales * payload.campaign.donationRate - 2770000, 1773170);
});

test("adds September 9 with correct channel and cumulative totals", async () => {
  const payload = await (await render("/api/campaign")).json();
  const reports = payload.daily.filter(row => row.date === "2026-09-09");
  assert.equal(reports.length, 1);
  const report = reports[0];
  assert.deepEqual(report.channels, { website: 1616000, whatsapp: 900000 });
  assert.deepEqual(report.orderChannels, { website: 6, whatsapp: 2 });
  assert.equal(report.sales, 2516000);
  assert.equal(report.orders, 8);
  assert.equal(report.channels.website * payload.campaign.donationRate, 161600);
  assert.equal(report.channels.whatsapp * payload.campaign.donationRate, 90000);
  assert.equal(report.sales * payload.campaign.donationRate, 251600);
  const records = payload.daily.filter(row => row.date <= "2026-09-09");
  const sales = records.reduce((sum, row) => sum + row.sales, 0);
  assert.equal(sales, 47947700);
  assert.equal(records.reduce((sum, row) => sum + row.orders, 0), 154);
  assert.equal(sales * payload.campaign.donationRate, 4794770);
  assert.equal(payload.disbursements[0].amount, 2770000);
  assert.equal(sales * payload.campaign.donationRate - 2770000, 2024770);
});

test("adds September 10 with correct channel and cumulative totals", async () => {
  const payload = await (await render("/api/campaign")).json();
  const reports = payload.daily.filter(row => row.date === "2026-09-10");
  assert.equal(reports.length, 1);
  const report = reports[0];
  assert.deepEqual(report.channels, { website: 2693000, whatsapp: 600000 });
  assert.deepEqual(report.orderChannels, { website: 7, whatsapp: 2 });
  assert.equal(report.sales, 3293000);
  assert.equal(report.orders, 9);
  assert.equal(report.channels.website * payload.campaign.donationRate, 269300);
  assert.equal(report.channels.whatsapp * payload.campaign.donationRate, 60000);
  assert.equal(report.sales * payload.campaign.donationRate, 329300);
  const records = payload.daily.filter(row => row.date <= "2026-09-10");
  const sales = records.reduce((sum, row) => sum + row.sales, 0);
  assert.equal(sales, 51240700);
  assert.equal(records.reduce((sum, row) => sum + row.orders, 0), 163);
  assert.equal(sales * payload.campaign.donationRate, 5124070);
  assert.equal(payload.disbursements[0].amount, 2770000);
  assert.equal(sales * payload.campaign.donationRate - 2770000, 2354070);
});

test("adds September 11 with correct channel and cumulative totals", async () => {
  const payload = await (await render("/api/campaign")).json();
  const reports = payload.daily.filter(row => row.date === "2026-09-11");
  assert.equal(reports.length, 1);
  const report = reports[0];
  assert.deepEqual(report.channels, { website: 903000, whatsapp: 300000 });
  assert.deepEqual(report.orderChannels, { website: 4, whatsapp: 1 });
  assert.equal(report.sales, 1203000);
  assert.equal(report.orders, 5);
  assert.equal(report.channels.website * payload.campaign.donationRate, 90300);
  assert.equal(report.channels.whatsapp * payload.campaign.donationRate, 30000);
  assert.equal(report.sales * payload.campaign.donationRate, 120300);
  const records = payload.daily.filter(row => row.date <= "2026-09-11");
  const sales = records.reduce((sum, row) => sum + row.sales, 0);
  assert.equal(sales, 52443700);
  assert.equal(records.reduce((sum, row) => sum + row.orders, 0), 168);
  assert.equal(sales * payload.campaign.donationRate, 5244370);
  assert.equal(payload.disbursements[0].amount, 2770000);
  assert.equal(sales * payload.campaign.donationRate - 2770000, 2474370);
});

test("adds September 12 with correct channel and cumulative totals", async () => {
  const payload = await (await render("/api/campaign")).json();
  const reports = payload.daily.filter(row => row.date === "2026-09-12");
  assert.equal(reports.length, 1);
  const report = reports[0];
  assert.deepEqual(report.channels, { website: 2746000, whatsapp: 3094000 });
  assert.deepEqual(report.orderChannels, { website: 9, whatsapp: 5 });
  assert.equal(report.sales, 5840000);
  assert.equal(report.orders, 14);
  assert.equal(report.channels.website * payload.campaign.donationRate, 274600);
  assert.equal(report.channels.whatsapp * payload.campaign.donationRate, 309400);
  assert.equal(report.sales * payload.campaign.donationRate, 584000);
  const records = payload.daily.filter(row => row.date <= "2026-09-12");
  const sales = records.reduce((sum, row) => sum + row.sales, 0);
  assert.equal(sales, 58283700);
  assert.equal(records.reduce((sum, row) => sum + row.orders, 0), 182);
  assert.equal(sales * payload.campaign.donationRate, 5828370);
  assert.equal(payload.disbursements[0].amount, 2770000);
  assert.equal(sales * payload.campaign.donationRate - 2770000, 3058370);
});

test("adds September 13 with correct channel and cumulative totals", async () => {
  const payload = await (await render("/api/campaign")).json();
  const reports = payload.daily.filter(row => row.date === "2026-09-13");
  assert.equal(reports.length, 1);
  const report = reports[0];
  assert.deepEqual(report.channels, { website: 910000, whatsapp: 2400000 });
  assert.deepEqual(report.orderChannels, { website: 3, whatsapp: 5 });
  assert.equal(report.sales, 3310000);
  assert.equal(report.orders, 8);
  assert.equal(report.channels.website * payload.campaign.donationRate, 91000);
  assert.equal(report.channels.whatsapp * payload.campaign.donationRate, 240000);
  assert.equal(report.sales * payload.campaign.donationRate, 331000);
  const records = payload.daily.filter(row => row.date <= "2026-09-13");
  const sales = records.reduce((sum, row) => sum + row.sales, 0);
  assert.equal(sales, 61593700);
  assert.equal(records.reduce((sum, row) => sum + row.orders, 0), 190);
  assert.equal(sales * payload.campaign.donationRate, 6159370);
  assert.equal(payload.disbursements[0].amount, 2770000);
  assert.equal(sales * payload.campaign.donationRate - 2770000, 3389370);
});

test("publishes the second Kitabisa proof and reconciles both disbursements", async () => {
  const payload = await (await render("/api/campaign")).json();
  const proof = payload.disbursements.find(row => row.proofUrl === "/proofs/kitabisa-johnson-3390000.jpg");
  assert.ok(proof);
  assert.equal(proof.amount, 3390000);
  assert.equal(proof.date, null);
  const periodAllocation = payload.daily.filter(row => row.date >= "2026-09-05" && row.date <= "2026-09-13").reduce((sum, row) => sum + row.sales, 0) * payload.campaign.donationRate;
  assert.equal(periodAllocation, 3389500);
  assert.equal(proof.amount - periodAllocation, 500);
  const total = payload.disbursements.reduce((sum, row) => sum + row.amount, 0);
  const allocation = payload.daily.filter(row => row.date <= "2026-09-13").reduce((sum, row) => sum + row.sales, 0) * payload.campaign.donationRate;
  assert.equal(total, 6160000);
  assert.equal(total - allocation, 630);
  assert.equal(Math.max(allocation - total, 0), 0);
  const response = await render(proof.proofUrl);
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type"), /image\/jpeg/);
  const original = await readFile(new URL("../public/proofs/kitabisa-johnson-3390000.jpg", import.meta.url));
  assert.deepEqual(Buffer.from(await response.arrayBuffer()), original);
});

test("adds September 14 with correct channel and cumulative totals", async () => {
  const payload = await (await render("/api/campaign")).json();
  const reports = payload.daily.filter(row => row.date === "2026-09-14");
  assert.equal(reports.length, 1);
  const report = reports[0];
  assert.deepEqual(report.channels, { website: 2640000, whatsapp: 800000 });
  assert.deepEqual(report.orderChannels, { website: 7, whatsapp: 2 });
  assert.equal(report.sales, 3440000);
  assert.equal(report.orders, 9);
  assert.equal(report.channels.website * payload.campaign.donationRate, 264000);
  assert.equal(report.channels.whatsapp * payload.campaign.donationRate, 80000);
  assert.equal(report.sales * payload.campaign.donationRate, 344000);
  const records = payload.daily.filter(row => row.date <= "2026-09-14");
  const sales = records.reduce((sum, row) => sum + row.sales, 0);
  assert.equal(sales, 65033700);
  assert.equal(records.reduce((sum, row) => sum + row.orders, 0), 199);
  assert.equal(sales * payload.campaign.donationRate, 6503370);
  const disbursed = payload.disbursements.reduce((sum, row) => sum + row.amount, 0);
  assert.equal(disbursed, 6160000);
  assert.equal(sales * payload.campaign.donationRate - disbursed, 343370);
});

for (const expected of [
  { date: "2026-09-15", website: 533000, whatsapp: 300000, webOrders: 3, waOrders: 1, sales: 833000, donation: 83300, cumulativeSales: 65866700, cumulativeOrders: 203 },
  { date: "2026-09-16", website: 1138000, whatsapp: 0, webOrders: 5, waOrders: 0, sales: 1138000, donation: 113800, cumulativeSales: 67004700, cumulativeOrders: 208 },
]) {
  test(`publishes ${expected.date} with correct channel and cumulative totals`, async () => {
    const payload = await (await render("/api/campaign")).json();
    const reports = payload.daily.filter(row => row.date === expected.date);
    assert.equal(reports.length, 1);
    const report = reports[0];
    assert.deepEqual(report.channels, { website: expected.website, whatsapp: expected.whatsapp });
    assert.deepEqual(report.orderChannels, { website: expected.webOrders, whatsapp: expected.waOrders });
    assert.equal(report.sales, expected.sales);
    assert.equal(report.orders, expected.webOrders + expected.waOrders);
    assert.equal(report.sales * payload.campaign.donationRate, expected.donation);
    const records = payload.daily.filter(row => row.date <= expected.date);
    const sales = records.reduce((sum, row) => sum + row.sales, 0);
    assert.equal(sales, expected.cumulativeSales);
    assert.equal(records.reduce((sum, row) => sum + row.orders, 0), expected.cumulativeOrders);
    const disbursed = payload.disbursements.reduce((sum, row) => sum + row.amount, 0);
    assert.equal(disbursed, 6160000);
    assert.equal(sales * payload.campaign.donationRate - disbursed, expected.date === "2026-09-15" ? 426670 : 540470);
  });
}
