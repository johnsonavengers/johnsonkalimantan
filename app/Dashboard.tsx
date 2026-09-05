"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import johnsonLogo from "../logo/logo.jpg";

function BrandLogo() {
  return <Image className="brand-logo" src={johnsonLogo} alt="Logo Johnson" width={52} height={52} sizes="52px" />;
}

type DailyRecord = { date: string; periodStart?: string; sales: number; orders: number | null; channels?: { website: number; whatsapp: number }; orderChannels?: { website: number; whatsapp: number } };
type Disbursement = {
  date: string | null;
  amount: number;
  recipient: string;
  description: string;
  proofUrl?: string;
  proofImage?: { width: number; height: number; alt: string };
  documentationUrl?: string;
};
type CampaignData = {
  campaign: {
    name: string;
    status: string;
    donationRate: number;
    startDate: string;
    endDate: string;
    donationTarget: number | null;
    currency: string;
    shopUrl: string;
    distribution?: { platform: string; campaignUrl: string; roundingNote?: string };
    lastUpdated: string | null;
  };
  daily: DailyRecord[];
  disbursements: Disbursement[];
};

const rupiah = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});
const integer = new Intl.NumberFormat("id-ID");
const longDate = new Intl.DateTimeFormat("id-ID", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "Asia/Jakarta",
});
const shortDate = new Intl.DateTimeFormat("id-ID", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "Asia/Jakarta",
});

const toJakartaDate = (date: string) => new Date(`${date}T00:00:00+07:00`);
const recordDate = (row: DailyRecord) => row.periodStart && row.periodStart !== row.date
  ? `${shortDate.format(toJakartaDate(row.periodStart))} – ${shortDate.format(toJakartaDate(row.date))}`
  : shortDate.format(toJakartaDate(row.date));
const inclusiveDays = (from: string, to: string) =>
  Math.max(Math.round((toJakartaDate(to).getTime() - toJakartaDate(from).getTime()) / 86400000) + 1, 1);

function displayUpdate(value: string | null) {
  if (!value) return "Belum dipublikasikan";
  const date = new Date(value);
  const dateText = longDate.format(date);
  const timeText = new Intl.DateTimeFormat("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Asia/Jakarta",
  }).format(date);
  return `${dateText}, ${timeText} WIB`;
}

function LoadingState() {
  return (
    <main className="state-page" aria-live="polite">
      <div className="state-card">
        <BrandLogo />
        <p className="eyebrow"><span>PUBLIC</span> TRANSPARENCY DASHBOARD</p>
        <h1 className="state-title">Menyiapkan<br />catatan publik.</h1>
        <div className="loading-line" />
      </div>
    </main>
  );
}

function ErrorState() {
  return (
    <main className="state-page" role="alert">
      <div className="state-card error-card">
        <BrandLogo />
        <p className="eyebrow"><span>STATUS</span> DATA</p>
        <h1 className="state-title">Data campaign sedang tidak tersedia.</h1>
        <p>Silakan kembali beberapa saat lagi.</p>
      </div>
    </main>
  );
}

export default function Dashboard() {
  const [data, setData] = useState<CampaignData | null>(null);
  const [error, setError] = useState(false);
  const [purchase, setPurchase] = useState(500000);

  useEffect(() => {
    fetch("/api/campaign", { cache: "no-store" })
      .then((response) => {
        if (!response.ok) throw new Error(`Campaign API returned ${response.status}`);
        return response.json();
      })
      .then((payload: CampaignData) => setData(payload))
      .catch((reason) => {
        console.error("Campaign data failed to load", reason);
        setError(true);
      });
  }, []);

  const metrics = useMemo(() => {
    if (!data) return null;
    const daily = [...data.daily].sort((a, b) => a.date.localeCompare(b.date));
    const totalSales = daily.reduce((sum, row) => sum + row.sales, 0);
    const totalDonation = totalSales * data.campaign.donationRate;
    const totalOrders = daily.some((row) => row.orders === null)
      ? null : daily.reduce((sum, row) => sum + (row.orders ?? 0), 0);
    const latest = daily.at(-1) ?? null;
    const totalDays = inclusiveDays(data.campaign.startDate, data.campaign.endDate);
    const campaignDay = latest ? Math.min(inclusiveDays(data.campaign.startDate, latest.date), totalDays) : null;
    const totalDisbursed = data.disbursements.reduce((sum, row) => sum + row.amount, 0);
    const waiting = Math.max(totalDonation - totalDisbursed, 0);
    let runningDonation = 0;
    const cumulative = daily.map((row) => {
      const donation = row.sales * data.campaign.donationRate;
      runningDonation += donation;
      return { ...row, donation, cumulative: runningDonation };
    });
    const progress = data.campaign.donationTarget
      ? (totalDonation / data.campaign.donationTarget) * 100
      : null;

    return { daily, totalSales, totalDonation, totalOrders, latest, totalDays, campaignDay, totalDisbursed, waiting, cumulative, progress };
  }, [data]);

  if (error) return <ErrorState />;
  if (!data || !metrics) return <LoadingState />;

  const donationPercentage = data.campaign.donationRate * 100;
  const chartMax = Math.max(...metrics.cumulative.map((row) => row.cumulative), 1);
  const chartPoints = metrics.cumulative.map((row, index) => {
    const x = metrics.cumulative.length === 1 ? 50 : 4 + (index / (metrics.cumulative.length - 1)) * 92;
    const y = 88 - (row.cumulative / chartMax) * 72;
    return `${x},${y}`;
  }).join(" ");
  const inputDisplay = integer.format(purchase);

  return (
    <main id="top">
      <header className="site-header">
        <nav className="nav-shell" aria-label="Navigasi utama">
          <a className="brand" href="#top" aria-label="JOHNSON UNTUK KALIMANTAN — kembali ke atas">
            <BrandLogo />
            <span>JOHNSON <b>UNTUK KALIMANTAN</b></span>
          </a>
          <div className="nav-links">
            <a href="#transparansi">Transparansi</a>
            <a href="#alur-dana">Alur Dana</a>
            <a href="#bukti">Bukti</a>
          </div>
          <span className="update-pill"><i /> UPDATED DAILY</span>
        </nav>
      </header>

      <section className="hero section-shell">
        <div className="hero-grid">
          <div className="hero-copy">
            <p className="eyebrow"><span>PUBLIC</span> TRANSPARENCY DASHBOARD</p>
            <h1>JOHNSON<br />UNTUK<br /><em>KALIMANTAN</em></h1>
            <p className="hero-message">
              {donationPercentage}% dari penjualan campaign Johnson melalui website dan WhatsApp dialokasikan untuk Kalimantan.
            </p>
            {metrics.latest?.channels ? (
              <div className="sales-channels">
                <p>Penjualan {recordDate(metrics.latest)}</p>
                <dl>
                  <div><dt>Website</dt><dd>{rupiah.format(metrics.latest.channels.website)}{metrics.latest.orderChannels ? <small>{integer.format(metrics.latest.orderChannels.website)} order</small> : null}<small>Donasi {donationPercentage}%: {rupiah.format(metrics.latest.channels.website * data.campaign.donationRate)}</small></dd></div>
                  <div><dt>WhatsApp</dt><dd>{rupiah.format(metrics.latest.channels.whatsapp)}{metrics.latest.orderChannels ? <small>{integer.format(metrics.latest.orderChannels.whatsapp)} order</small> : null}<small>Donasi {donationPercentage}%: {rupiah.format(metrics.latest.channels.whatsapp * data.campaign.donationRate)}</small></dd></div>
                </dl>
              </div>
            ) : null}
          </div>

          <div className="total-card" aria-label={`Total donasi terkumpul ${rupiah.format(metrics.totalDonation)}`}>
            <div className="total-card-top">
              <span>Total donasi terkumpul</span>
              <span className="issue-number">ISSUE 01 — 2026</span>
            </div>
            <strong>{rupiah.format(metrics.totalDonation)}</strong>
            <div className="growing"><span>AND GROWING.</span><span className="arrow">↗</span></div>
            <div className="campaign-map"><Image src="/indonesia-map.svg" alt="Peta Indonesia dengan wilayah Kalimantan disorot oranye" width={780} height={300} unoptimized /><span>KALIMANTAN, INDONESIA</span></div>
            <div className="total-meta">
              <span><b>{metrics.totalOrders === null ? "Belum tersedia" : integer.format(metrics.totalOrders)}</b> order berkontribusi</span>
              <span><b>{metrics.campaignDay ? `${String(metrics.campaignDay).padStart(2, "0")} / ${metrics.totalDays}` : "—"}</b> campaign day</span>
            </div>
          </div>
        </div>

        <div className="hero-note">
          <span>01</span>
          <p>Setiap pembelian yang memenuhi ketentuan campaign ikut berkontribusi. Pelanggan tidak dikenakan biaya donasi tambahan.</p>
          <span className="ten-percent">{donationPercentage}%</span>
        </div>
      </section>

      <section className="ticker" aria-label="Ringkasan campaign">
        <div className="ticker-inner section-shell">
          <div><span>Alokasi rekap terbaru</span><b>{metrics.latest ? `+${rupiah.format(metrics.latest.sales * data.campaign.donationRate)}` : "Belum ada data"}</b></div>
          <div><span>Campaign sales</span><b>{rupiah.format(metrics.totalSales)}</b></div>
          <div><span>Allocation</span><b className="orange-text">{donationPercentage}%</b></div>
          <div><span>Status</span><b className="status-text"><i /> {data.campaign.status === "active" ? "Aktif" : data.campaign.status}</b></div>
        </div>
      </section>

      <section className="numbers section-shell section-pad" id="transparansi">
        <div className="section-heading">
          <div><span className="section-index">02 / ANGKA UTAMA</span><h2>Angkanya bisa dilihat.<br /><em>Setiap hari.</em></h2></div>
          <p>Seluruh angka di bawah dihitung otomatis dari catatan penjualan campaign yang dipublikasikan.</p>
        </div>

        <div className="stats-grid">
          <article><span>Total campaign sales</span><strong>{rupiah.format(metrics.totalSales)}</strong><small>Akumulasi catatan penjualan</small></article>
          <article className="featured-stat"><span>Donation allocated</span><strong>{rupiah.format(metrics.totalDonation)}</strong><small>{donationPercentage}% dari penjualan campaign</small></article>
          <article><span>Contributing orders</span><strong>{metrics.totalOrders === null ? "—" : integer.format(metrics.totalOrders)}</strong><small>{metrics.totalOrders === null ? "Jumlah order belum tersedia" : "Order memenuhi ketentuan"}</small></article>
          <article><span>Campaign day</span><strong>{metrics.campaignDay ? `${String(metrics.campaignDay).padStart(2, "0")} / ${metrics.totalDays}` : `— / ${metrics.totalDays}`}</strong><small>Berdasarkan data terakhir</small></article>
        </div>

        {data.campaign.donationTarget && metrics.progress !== null ? (
          <div className="target-card">
            <div><span>Donation target</span><strong>{rupiah.format(data.campaign.donationTarget)}</strong></div>
            <div className="target-progress">
              <b>{metrics.progress.toFixed(2)}%</b>
              <div className="progress-track" role="progressbar" aria-label="Progres target donasi" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.min(metrics.progress, 100)}>
                <i style={{ width: `${Math.min(metrics.progress, 100)}%` }} />
              </div>
            </div>
          </div>
        ) : null}
      </section>

      <section className="insight-section">
        <div className="section-shell insight-grid">
          <article className="chart-card">
            <div className="card-heading">
              <div><span className="section-index">03 / PERTUMBUHAN</span><h3>Pertumbuhan donasi</h3></div>
              <span className="chart-legend"><i /> Donasi kumulatif</span>
            </div>
            {metrics.cumulative.length ? (
              <div className="chart-wrap">
                <div className="chart-value"><span>Saat ini</span><strong>{rupiah.format(metrics.totalDonation)}</strong></div>
                <svg className="growth-chart" viewBox="0 0 100 100" role="img" aria-labelledby="chart-title chart-desc" preserveAspectRatio="none">
                  <title id="chart-title">Grafik pertumbuhan donasi kumulatif</title>
                  <desc id="chart-desc">Donasi kumulatif sampai {metrics.latest ? shortDate.format(toJakartaDate(metrics.latest.date)) : "data terbaru"}</desc>
                  <line x1="4" y1="88" x2="96" y2="88" className="chart-axis" />
                  <line x1="4" y1="52" x2="96" y2="52" className="chart-grid" />
                  <line x1="4" y1="16" x2="96" y2="16" className="chart-grid" />
                  <polyline points={chartPoints} className="chart-line-shadow" />
                  <polyline points={chartPoints} className="chart-line" />
                  {metrics.cumulative.map((row, index) => {
                    const [x, y] = chartPoints.split(" ")[index].split(",");
                    return <circle key={row.date} cx={x} cy={y} r="1.5" className={index === metrics.cumulative.length - 1 ? "chart-dot latest" : "chart-dot"} />;
                  })}
                </svg>
                <div className="chart-labels"><span>{shortDate.format(toJakartaDate(metrics.cumulative[0].periodStart ?? metrics.cumulative[0].date))}</span><span>{shortDate.format(toJakartaDate(metrics.cumulative.at(-1)!.date))}</span></div>
                {metrics.daily.some((row) => row.periodStart && row.periodStart !== row.date) ? <p className="chart-period-note">Rekap gabungan ditampilkan sebagai satu titik. Rincian per hari belum tersedia.</p> : null}
              </div>
            ) : (
              <div className="empty-chart"><div className="empty-chart-line" /><p>Grafik akan terbentuk setelah data penjualan harian pertama dipublikasikan.</p></div>
            )}
          </article>

          <article className="calculator-card">
            <span className="section-index light-index">04 / KALKULATOR</span>
            <h3>Kamu ada di dalam<br />angka ini.</h3>
            <p>Lihat besaran yang Johnson alokasikan dari transaksi campaign—tanpa biaya tambahan.</p>
            <label htmlFor="purchase">Jika pembelian kamu</label>
            <div className="currency-input"><span>Rp</span><input id="purchase" inputMode="numeric" value={inputDisplay} onChange={(event) => setPurchase(Math.max(Number(event.target.value.replace(/\D/g, "")) || 0, 0))} aria-describedby="allocation-result" /></div>
            <div className="allocation-result" id="allocation-result"><span>Maka Johnson mengalokasikan</span><strong>{rupiah.format(purchase * data.campaign.donationRate)}</strong><small>{donationPercentage}% dari nilai pembelian</small></div>
          </article>
        </div>
      </section>

      <section className="flow-section section-shell section-pad" id="alur-dana">
        <div className="section-heading flow-heading">
          <div><span className="section-index">05 / MEKANISME</span><h2>Begini cara<br /><em>dana bergerak.</em></h2></div>
          <p>Alurnya sederhana dan dapat diikuti dari transaksi sampai bukti penyaluran.</p>
        </div>
        <ol className="flow-grid">
          {[
            ["01", "Customer membeli", "Produk Johnson yang memenuhi ketentuan campaign."],
            ["02", "Transaksi tercatat", "Nilainya masuk ke campaign sales."],
            ["03", `${donationPercentage}% dihitung`, "Alokasi dihitung otomatis dari penjualan."],
            ["04", "Dana terkumpul", "Masuk ke total komitmen campaign."],
            ["05", "Dana disalurkan", data.campaign.distribution ? `Penyaluran dana melalui ${data.campaign.distribution.platform}.` : "Disalurkan kepada penerima yang dicatat."],
            ["06", "Bukti diterbitkan", "Dokumen penyaluran tampil secara terbuka."],
          ].map(([number, title, body], index) => (
            <li key={number}>
              <div className="flow-number">{number}</div>
              <h3>{title}</h3>
              <p>{body}</p>
              {index < 5 ? <span className="flow-arrow" aria-hidden="true">→</span> : null}
            </li>
          ))}
        </ol>
      </section>

      <section className="log-section section-pad" id="data-harian">
        <div className="section-shell">
          <div className="section-heading compact-heading">
            <div><span className="section-index light-index">06 / CATATAN PENJUALAN</span><h2>Catatan transparansi</h2></div>
            <p>Terakhir diperbarui<br /><b>{displayUpdate(data.campaign.lastUpdated)}</b></p>
          </div>
          <div className="table-wrap">
            <table>
              <thead><tr><th>Tanggal / Periode</th><th>Penjualan Campaign</th><th>Alokasi Donasi</th><th>Total Donasi</th><th>Jumlah Order</th></tr></thead>
              <tbody>
                {metrics.cumulative.length ? [...metrics.cumulative].reverse().map((row, index) => (
                  <tr key={row.date} className={index === 0 ? "latest-row" : undefined}>
                    <td><span className="mobile-label">Periode</span>{recordDate(row)}{index === 0 ? <small>TERBARU</small> : null}</td>
                    <td><span className="mobile-label">Penjualan</span>{rupiah.format(row.sales)}</td>
                    <td><span className="mobile-label">Alokasi</span>{rupiah.format(row.donation)}</td>
                    <td><span className="mobile-label">Total donasi</span>{rupiah.format(row.cumulative)}</td>
                    <td><span className="mobile-label">Order</span>{row.orders === null ? "Belum tersedia" : integer.format(row.orders)}</td>
                  </tr>
                )) : (
                  <tr className="empty-row"><td colSpan={5}>Belum ada data penjualan harian yang dipublikasikan.</td></tr>
                )}
              </tbody>
            </table>
          </div>
          <p className="table-note"><i /> Data diperbarui dari laporan penjualan campaign. Rekap gabungan tidak dibagi menjadi angka harian; jumlah order yang belum dilaporkan ditandai belum tersedia.</p>
        </div>
      </section>

      <section className="proof-section section-shell section-pad" id="bukti">
        <div className="section-heading">
          <div><span className="section-index">07 / STATUS DONASI</span><h2>Dari komitmen<br /><em>menjadi bukti.</em></h2></div>
          <p>Catatan penyaluran dan bukti yang dipublikasikan oleh tim Johnson dapat dilihat di sini.</p>
        </div>
        <div className="fund-grid">
          <article><span>Total committed</span><strong>{rupiah.format(metrics.totalDonation)}</strong><small>Akumulasi alokasi</small></article>
          <article><span>Total disbursed</span><strong>{rupiah.format(metrics.totalDisbursed)}</strong><small>Sudah disalurkan</small></article>
          <article className="waiting-card"><span>Waiting to be disbursed</span><strong>{rupiah.format(metrics.waiting)}</strong><small>{metrics.totalDonation > 0 && metrics.waiting === 0 ? "Seluruh alokasi tercatat telah disalurkan" : "Menunggu penyaluran"}</small></article>
        </div>
        {metrics.totalDisbursed > metrics.totalDonation ? <p className="reconciliation-note">{data.campaign.distribution?.roundingNote ? `${data.campaign.distribution.roundingNote} ` : ""}Nominal penyaluran {rupiah.format(metrics.totalDisbursed)} melebihi alokasi 10% sebesar {rupiah.format(metrics.totalDisbursed - metrics.totalDonation)}. Total alokasi tetap {rupiah.format(metrics.totalDonation)} sesuai catatan penjualan; selisih tidak menambah angka penjualan.</p> : null}
        {data.campaign.distribution ? (
          <aside className="distribution-card" aria-label="Jalur penyaluran donasi">
            <div>
              <span className="section-index">JALUR PENYALURAN</span>
              <h3>Melalui {data.campaign.distribution.platform}</h3>
              <p>{data.disbursements.length ? `Dana telah disalurkan melalui penggalangan dana di ${data.campaign.distribution.platform}, berdasarkan konfirmasi tim Johnson. Bukti yang diberikan ditampilkan di bawah.` : `Dana donasi campaign Johnson akan disalurkan melalui penggalangan dana di ${data.campaign.distribution.platform}. Bukti akan dipublikasikan setelah dana disalurkan.`}</p>
            </div>
            <a href={data.campaign.distribution.campaignUrl} target="_blank" rel="noopener noreferrer">Lihat campaign di Kitabisa <span aria-hidden="true">↗</span><span className="sr-only"> (dibuka di tab baru)</span></a>
          </aside>
        ) : null}
        <div className="proof-box">
          <div className="proof-title"><span>Proof of disbursement</span><b>{String(data.disbursements.length).padStart(2, "0")} DOKUMEN</b></div>
          {data.disbursements.length ? (
            <div className="proof-list">
              {data.disbursements.map((item) => (
                <article key={`${item.date}-${item.amount}`}>
                  <div><span>{item.date ? shortDate.format(toJakartaDate(item.date)) : "Tanggal transaksi belum dicantumkan"}</span><strong>{rupiah.format(item.amount)}</strong></div>
                  <div><span>Tujuan penyaluran</span><strong>{item.recipient}</strong></div>
                  <p>{item.description}</p>
                  {item.proofUrl && item.proofImage ? <a className="proof-image" href={item.proofUrl} target="_blank" rel="noopener noreferrer" aria-label="Buka gambar bukti penyaluran di tab baru"><Image src={item.proofUrl} alt={item.proofImage.alt} width={item.proofImage.width} height={item.proofImage.height} unoptimized /></a> : null}
                  <div className="proof-links">
                    {item.proofUrl ? <a href={item.proofUrl}>Lihat bukti ↗</a> : null}
                    {item.documentationUrl ? <a href={item.documentationUrl}>Dokumentasi ↗</a> : null}
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="empty-proof"><span className="proof-stamp">PENDING</span><div><h3>Belum ada dana yang disalurkan.</h3><p>Bukti penyaluran akan ditampilkan di sini setelah dana disalurkan.</p></div></div>
          )}
        </div>
      </section>

      <section className="story-section">
        <div className="section-shell story-grid">
          <div><span className="section-index light-index">08 / MENGAPA KALIMANTAN</span><h2>Kebakaran hutan tidak berhenti ketika berita berhenti membicarakannya.</h2></div>
          <div><p>Dampaknya dapat menyentuh hutan, udara, satwa, dan masyarakat di sekitarnya.</p><p><b>JOHNSON UNTUK KALIMANTAN</b> adalah upaya untuk mengubah sebagian aktivitas bisnis sehari-hari menjadi kontribusi yang dapat dilihat dan dipertanggungjawabkan.</p></div>
        </div>
      </section>

      <section className="timeline-section section-shell section-pad">
        <div className="section-heading compact-heading">
          <div><span className="section-index">09 / TIMELINE</span><h2>Jejak campaign</h2></div>
          <p>Setiap tahap memiliki waktu dan status yang jelas.</p>
        </div>
        <ol className="timeline">
          <li className="done"><span>01</span><div><b>Campaign start</b><strong>{longDate.format(toJakartaDate(data.campaign.startDate))}</strong></div></li>
          <li className="active"><span>02</span><div><b>Updated daily</b><strong>Pembaruan data campaign</strong></div></li>
          <li><span>03</span><div><b>Campaign close</b><strong>{longDate.format(toJakartaDate(data.campaign.endDate))}</strong></div></li>
          <li className={data.disbursements.length ? "done" : undefined}><span>04</span><div><b>Donation disbursement</b><strong>{data.disbursements.length ? "Penyaluran telah dimulai melalui Kitabisa" : "Setelah campaign berakhir"}</strong></div></li>
          <li><span>05</span><div><b>Final report</b><strong>Setelah penyaluran selesai</strong></div></li>
        </ol>
      </section>

      <section className="manifesto-section">
        <div className="section-shell manifesto-grid">
          <div className="manifesto-main">
            <span className="section-index light-index">10 / MANIFESTO</span>
            <h2>THE NUMBER<br />NEVER HIDES.</h2>
            <p>Kami percaya sebuah campaign tidak cukup hanya mengatakan: “kami akan berdonasi.”</p>
          </div>
          <div className="manifesto-right">
            <p>Kamu berhak mengetahui:</p>
            <ul><li>berapa yang terkumpul,</li><li>berapa yang dialokasikan,</li><li>kapan disalurkan,</li><li>dan ke mana dana tersebut pergi.</li></ul>
            <strong>{donationPercentage}%</strong>
            <p className="manifesto-close">Dari penjualan campaign Johnson.<br />Untuk Kalimantan.<br /><b>Transparan setiap hari.</b></p>
            <div className="cta-row">
              {data.campaign.shopUrl ? <a className="primary-cta" href={data.campaign.shopUrl}>BELANJA JOHNSON ↗</a> : null}
              <a className="secondary-cta" href="#data-harian">LIHAT DATA ↓</a>
            </div>
          </div>
        </div>
      </section>

      <footer>
        <div className="section-shell footer-inner">
          <a className="brand footer-brand" href="#top"><BrandLogo /><span>JOHNSON <b>UNTUK KALIMANTAN</b></span></a>
          <p>10% dari penjualan campaign Johnson.<br />Untuk Kalimantan.</p>
          <div><span>Last updated</span><b>{displayUpdate(data.campaign.lastUpdated)}</b></div>
          <a href="#top" aria-label="Kembali ke atas">Kembali ke atas ↑</a>
        </div>
      </footer>
    </main>
  );
}
