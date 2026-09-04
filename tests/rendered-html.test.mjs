import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function render(pathname = "/") {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);
  return worker.fetch(
    new Request(`http://localhost${pathname}`, {
      headers: { accept: pathname.startsWith("/api") ? "application/json" : "text/html" },
    }),
    { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} },
  );
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
});
