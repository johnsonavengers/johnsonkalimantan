import { readFile } from "node:fs/promises";

const path = new URL("../data/campaign.json", import.meta.url);
const data = JSON.parse(await readFile(path, "utf8"));
const { campaign, daily, disbursements } = data;
const failures = [];

if (!campaign || campaign.name !== "JOHNSON UNTUK KALIMANTAN") failures.push("Nama campaign tidak valid.");
if (typeof campaign?.donationRate !== "number" || campaign.donationRate <= 0 || campaign.donationRate > 1) failures.push("Donation rate harus lebih dari 0 dan maksimal 1.");
if (!Array.isArray(daily)) failures.push("Daily harus berupa daftar.");
if (!Array.isArray(disbursements)) failures.push("Disbursements harus berupa daftar.");

const seen = new Set();
const periods = [];
for (const [index, row] of (daily ?? []).entries()) {
  const start = row.periodStart ?? row.date;
  const validDate = (value) => typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value) && Number.isFinite(Date.parse(value)) && new Date(value).toISOString().slice(0, 10) === value;
  if (!validDate(start) || !validDate(row.date) || start > row.date) failures.push(`Periode tidak valid pada baris ${index + 1}.`);
  if (periods.some((period) => start <= period.end && row.date >= period.start)) failures.push(`Periode tumpang tindih pada ${row.date}.`);
  periods.push({ start, end: row.date });
  if (seen.has(row.date)) failures.push(`Tanggal duplikat: ${row.date}.`);
  seen.add(row.date);
  if (start < campaign.startDate || row.date > campaign.endDate) failures.push(`Tanggal di luar periode campaign pada baris ${index + 1}.`);
  if (!Number.isFinite(row.sales) || row.sales <= 0) failures.push(`Sales harus lebih dari nol pada ${row.date}.`);
  if (row.orders !== null && (!Number.isInteger(row.orders) || row.orders < 0)) failures.push(`Orders tidak valid pada ${row.date}.`);
}

for (const [index, row] of (disbursements ?? []).entries()) {
  if (!Number.isFinite(row.amount) || row.amount <= 0) failures.push(`Nominal penyaluran tidak valid pada baris ${index + 1}.`);
  if (!row.recipient || !row.description || (row.date !== null && !/^\d{4}-\d{2}-\d{2}$/.test(row.date ?? ""))) failures.push(`Data penyaluran belum lengkap pada baris ${index + 1}.`);
  if (row.date === null && !row.proofUrl) failures.push(`Penyaluran tanpa tanggal harus menyertakan bukti pada baris ${index + 1}.`);
}

if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}

const totalSales = daily.reduce((sum, row) => sum + row.sales, 0);
const totalDonation = totalSales * campaign.donationRate;
console.log(`Data campaign valid: ${daily.length} catatan, total sales ${totalSales}, total alokasi ${totalDonation}.`);
