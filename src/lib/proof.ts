import { ChainTransaction, PortfolioSnapshot } from '../types';

export function encodeProof(tx: ChainTransaction): string {
  const json = JSON.stringify(tx);
  return btoa(unescape(encodeURIComponent(json)));
}

export function decodeProof(value: string | null): ChainTransaction | null {
  if (!value) return null;
  try {
    const json = decodeURIComponent(escape(atob(value)));
    return JSON.parse(json) as ChainTransaction;
  } catch (error) {
    return null;
  }
}

export function buildProofUrl(tx: ChainTransaction): string {
  const base = `${window.location.origin}${window.location.pathname}`;
  const params = new URLSearchParams({
    verify: tx.id,
    proof: encodeProof(tx),
  });
  return `${base}?${params.toString()}`;
}

export function buildPortfolioHtml(snapshot: PortfolioSnapshot): string {
  const verifiedRecords = snapshot.records.filter((item) => item.onchain).length;
  const verifiedDocs = snapshot.docs.filter((item) => item.onchain).length;
  const rows = snapshot.records.map((record) => `
    <tr>
      <td>${escapeHtml(record.subject)}</td>
      <td>${escapeHtml(record.semester)}</td>
      <td>${record.grade}</td>
      <td>${record.onchain ? 'Verified' : 'Pending'}</td>
      <td>${escapeHtml(record.hash)}</td>
    </tr>
  `).join('');
  const docs = snapshot.docs.map((doc) => `
    <tr>
      <td>${escapeHtml(doc.title)}</td>
      <td>${escapeHtml(doc.type)}</td>
      <td>${escapeHtml(doc.sem)}</td>
      <td>${doc.onchain ? 'Verified' : 'Pending'}</td>
      <td>${escapeHtml(doc.hash)}</td>
    </tr>
  `).join('');

  return `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Omni Learn Portfolio - ${escapeHtml(snapshot.owner.name)}</title>
  <style>
    body { font-family: Inter, Arial, sans-serif; color: #0b1f3a; margin: 36px; }
    h1 { margin: 0 0 6px; font-size: 28px; }
    h2 { margin-top: 28px; font-size: 18px; }
    .muted { color: #5c6b82; }
    .stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin: 24px 0; }
    .stat { border: 1px solid #dbe4f1; border-radius: 10px; padding: 14px; }
    .stat b { display: block; font-size: 22px; }
    table { width: 100%; border-collapse: collapse; margin-top: 12px; font-size: 12px; }
    th, td { border-bottom: 1px solid #e3e9f2; padding: 9px; text-align: left; vertical-align: top; }
    th { color: #5c6b82; text-transform: uppercase; font-size: 10px; letter-spacing: .08em; }
    .hash { font-family: "JetBrains Mono", Consolas, monospace; word-break: break-all; }
    @media print { body { margin: 20mm; } button { display: none; } }
  </style>
</head>
<body>
  <button onclick="window.print()">Cetak / Simpan PDF</button>
  <h1>Omni Learn Academic Portfolio</h1>
  <div class="muted">${escapeHtml(snapshot.owner.name)} - ${escapeHtml(snapshot.owner.email)} - ${escapeHtml(snapshot.owner.role)}</div>
  <div class="muted">Generated ${new Date(snapshot.generatedAt).toLocaleString('id-ID')}</div>
  <div class="stats">
    <div class="stat"><b>${snapshot.records.length}</b>Catatan nilai</div>
    <div class="stat"><b>${verifiedRecords}</b>Nilai terverifikasi</div>
    <div class="stat"><b>${verifiedDocs}/${snapshot.docs.length}</b>Dokumen terverifikasi</div>
  </div>
  <h2>Rekam Nilai</h2>
  <table>
    <thead><tr><th>Pelajaran</th><th>Semester</th><th>Nilai</th><th>Status</th><th>Hash</th></tr></thead>
    <tbody>${rows}</tbody>
  </table>
  <h2>Prestasi & Dokumen</h2>
  <table>
    <thead><tr><th>Judul</th><th>Jenis</th><th>Semester</th><th>Status</th><th>Hash</th></tr></thead>
    <tbody>${docs}</tbody>
  </table>
</body>
</html>`;
}

function escapeHtml(value: string | number): string {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}
