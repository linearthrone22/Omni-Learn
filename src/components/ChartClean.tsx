import { AcademicRecord } from '../types';

export function ChartClean({ records }: { records: AcademicRecord[] }) {
  const bySem: Record<string, AcademicRecord[]> = {};
  records.forEach((record) => {
    (bySem[record.semester] = bySem[record.semester] || []).push(record);
  });

  const sems = Object.keys(bySem).sort((a, b) => semNumber(a) - semNumber(b));
  const pts = sems.map((semester) => {
    const items = bySem[semester];
    return {
      sem: semester,
      avg: items.reduce((sum, record) => sum + record.grade, 0) / items.length,
      onchain: items.every((record) => record.onchain),
    };
  });

  if (pts.length < 2) {
    return (
      <svg className="chart" viewBox="0 0 600 200" preserveAspectRatio="none">
        <text x="300" y="100" textAnchor="middle" fill="#8694A8" fontSize="13" fontFamily="Inter">
          Butuh minimal 2 semester untuk menampilkan tren
        </text>
      </svg>
    );
  }

  const width = 600;
  const height = 200;
  const pad = 28;
  const x = (index: number) => pad + index * ((width - pad * 2) / (pts.length - 1));
  const y = (value: number) => height - pad - ((value - 60) / 40) * (height - pad * 2);
  const linePath = pts.map((point, index) => `${index ? 'L' : 'M'}${x(index)},${y(point.avg)}`).join(' ');
  const areaPath = `M${x(0)},${height - pad} ${pts.map((point, index) => `L${x(index)},${y(point.avg)}`).join(' ')} L${x(pts.length - 1)},${height - pad} Z`;

  return (
    <svg className="chart" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
      <defs>
        <linearGradient id="grade-area" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#2D5BFF" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#2D5BFF" stopOpacity="0" />
        </linearGradient>
      </defs>
      {[60, 70, 80, 90, 100].map((grade) => (
        <g key={grade}>
          <line x1={pad} y1={y(grade)} x2={width - pad} y2={y(grade)} stroke="#EEF2F8" />
          <text x={pad - 6} y={y(grade) + 3} textAnchor="end" fill="#B6C2D4" fontSize="9" fontFamily="JetBrains Mono">{grade}</text>
        </g>
      ))}
      <path d={areaPath} fill="url(#grade-area)" />
      <path d={linePath} fill="none" stroke="#2D5BFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      {pts.map((point, index) => (
        <g key={point.sem}>
          <circle cx={x(index)} cy={y(point.avg)} r="5" fill={point.onchain ? '#0E9F6E' : '#2D5BFF'} stroke="#fff" strokeWidth="2" />
          <text x={x(index)} y={y(point.avg) - 12} textAnchor="middle" fill="#0B1F3A" fontSize="10" fontWeight="600" fontFamily="Space Grotesk">
            {point.avg.toFixed(0)}
          </text>
          <text x={x(index)} y={height - 8} textAnchor="middle" fill="#8694A8" fontSize="9" fontFamily="Inter">
            S{semNumber(point.sem) || index + 1}
          </text>
        </g>
      ))}
    </svg>
  );
}

function semNumber(label: string) {
  const match = label.match(/\d+/);
  return match ? Number(match[0]) : 0;
}
