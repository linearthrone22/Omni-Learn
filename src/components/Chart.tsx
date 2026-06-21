import { AcademicRecord } from '../types';

export function Chart({ records }: { records: AcademicRecord[] }) {
  // average per semester
  const bySem: Record<string, AcademicRecord[]> = {};
  records.forEach((r) => {
    (bySem[r.semester] = bySem[r.semester] || []).push(r);
  });
  
  const sems = Object.keys(bySem).sort();
  const pts = sems.map((s) => {
    const a = bySem[s];
    return {
      sem: s,
      avg: a.reduce((x, r) => x + r.grade, 0) / a.length,
      onchain: a.every((r) => r.onchain),
    };
  });

  if (pts.length < 2) {
    return (
      <svg className="chart" viewBox="0 0 600 200" preserveAspectRatio="none">
        <text x="300" y="100" textAnchor="middle" fill="#8694A8" fontSize="13" fontFamily="Inter">
          Butuh ≥2 semester untuk menampilkan tren
        </text>
      </svg>
    );
  }

  const W = 600, H = 200, pad = 28;
  const xs = (i: number) => pad + i * ((W - pad * 2) / (pts.length - 1));
  const ys = (v: number) => H - pad - ((v - 60) / 40) * (H - pad * 2); // scale 60..100

  // Draw grid
  const gridLines = [];
  for (let g = 60; g <= 100; g += 10) {
    const y = ys(g);
    gridLines.push(
      <g key={g}>
        <line x1={pad} y1={y} x2={W - pad} y2={y} stroke="#EEF2F8" />
        <text x={pad - 6} y={y + 3} textAnchor="end" fill="#B6C2D4" fontSize="9" fontFamily="JetBrains Mono">{g}</text>
      </g>
    );
  }

  const linePath = pts.map((p, i) => `${i ? 'L' : 'M'}${xs(i)},${ys(p.avg)}`).join(' ');
  const areaPath = `M${xs(0)},${H - pad} ` + pts.map((p, i) => `L${xs(i)},${ys(p.avg)}`).join(' ') + ` L${xs(pts.length - 1)},${H - pad} Z`;

  return (
    <svg className="chart" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none">
      <defs>
        <linearGradient id="ag" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#2D5BFF" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#2D5BFF" stopOpacity="0" />
        </linearGradient>
      </defs>
      {gridLines}
      <path d={areaPath} fill="url(#ag)" />
      <path d={linePath} fill="none" stroke="#2D5BFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      {pts.map((p, i) => (
        <g key={i}>
          <circle cx={xs(i)} cy={ys(p.avg)} r="5" fill={p.onchain ? '#0E9F6E' : '#2D5BFF'} stroke="#fff" strokeWidth="2" />
          <text x={xs(i)} y={ys(p.avg) - 12} textAnchor="middle" fill="#0B1F3A" fontSize="10" fontWeight="600" fontFamily="Space Grotesk">
            {p.avg.toFixed(0)}
          </text>
          <text x={xs(i)} y={H - 8} textAnchor="middle" fill="#8694A8" fontSize="9" fontFamily="Inter">
            S{i + 1}
          </text>
        </g>
      ))}
    </svg>
  );
}
