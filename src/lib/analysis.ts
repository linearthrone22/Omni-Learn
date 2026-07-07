import { AcademicRecord } from '../types';

export interface LearningInsight {
  average: number;
  trend: 'up' | 'flat' | 'down';
  trendLabel: string;
  strongestSubject: string;
  focusSubject: string;
  summary: string;
  recommendations: string[];
  weeklyPlan: { day: string; task: string }[];
}

function avg(values: number[]) {
  return values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0;
}

function semesterNumber(label: string) {
  const match = label.match(/\d+/);
  return match ? Number(match[0]) : 0;
}

export function analyzeLearning(records: AcademicRecord[]): LearningInsight {
  if (!records.length) {
    return {
      average: 0,
      trend: 'flat',
      trendLabel: 'Belum ada tren',
      strongestSubject: '-',
      focusSubject: '-',
      summary: 'Tambahkan nilai pertama agar AI Assistant dapat membaca pola belajar.',
      recommendations: [
        'Mulai dari input nilai per semester untuk membangun ledger akademik.',
        'Tambahkan catatan guru agar rekomendasi belajar lebih kontekstual.',
        'Verifikasi catatan penting agar siap dibagikan sebagai portofolio.',
      ],
      weeklyPlan: [
        { day: 'Senin', task: 'Input nilai dan rapikan dokumen akademik.' },
        { day: 'Rabu', task: 'Tambahkan catatan perkembangan dari guru.' },
        { day: 'Jumat', task: 'Pilih dokumen prioritas untuk diverifikasi.' },
      ],
    };
  }

  const subjectMap = new Map<string, AcademicRecord[]>();
  records.forEach((record) => {
    subjectMap.set(record.subject, [...(subjectMap.get(record.subject) || []), record]);
  });

  const subjectAverages = [...subjectMap.entries()].map(([subject, items]) => ({
    subject,
    average: avg(items.map((item) => item.grade)),
    latest: [...items].sort((a, b) => semesterNumber(b.semester) - semesterNumber(a.semester))[0]?.grade || 0,
  }));

  subjectAverages.sort((a, b) => b.average - a.average);
  const strongestSubject = subjectAverages[0]?.subject || '-';
  const focusSubject = [...subjectAverages].sort((a, b) => a.average - b.average)[0]?.subject || '-';

  const semesterAverages = new Map<string, number[]>();
  records.forEach((record) => {
    semesterAverages.set(record.semester, [...(semesterAverages.get(record.semester) || []), record.grade]);
  });
  const timeline = [...semesterAverages.entries()]
    .map(([semester, grades]) => ({ semester, average: avg(grades) }))
    .sort((a, b) => semesterNumber(a.semester) - semesterNumber(b.semester));

  const first = timeline[0]?.average || 0;
  const last = timeline[timeline.length - 1]?.average || first;
  const delta = last - first;
  const trend = delta > 2 ? 'up' : delta < -2 ? 'down' : 'flat';
  const trendLabel =
    trend === 'up' ? `Naik ${delta.toFixed(1)} poin sejak semester awal` :
    trend === 'down' ? `Turun ${Math.abs(delta).toFixed(1)} poin sejak semester awal` :
    'Stabil dalam rentang aman';

  const overallAverage = avg(records.map((record) => record.grade));
  const focusAverage = subjectAverages.find((item) => item.subject === focusSubject)?.average || 0;
  const strongestAverage = subjectAverages.find((item) => item.subject === strongestSubject)?.average || 0;

  return {
    average: overallAverage,
    trend,
    trendLabel,
    strongestSubject,
    focusSubject,
    summary: `${strongestSubject} menjadi kekuatan utama dengan rata-rata ${strongestAverage.toFixed(1)}. ${focusSubject} perlu perhatian paling dekat karena rata-ratanya ${focusAverage.toFixed(1)}.`,
    recommendations: [
      `Pertahankan pola belajar ${strongestSubject} sebagai contoh strategi untuk mata pelajaran lain.`,
      `Alokasikan sesi latihan tambahan untuk ${focusSubject} minimal 3 kali seminggu.`,
      trend === 'down'
        ? 'Buat evaluasi mingguan karena tren terbaru menurun dari semester awal.'
        : 'Gunakan target bertahap 2-3 poin per bulan agar peningkatan tetap realistis.',
      'Verifikasi nilai dan dokumen penting agar portofolio siap dibagikan ke pihak luar.',
    ],
    weeklyPlan: [
      { day: 'Senin', task: `Review materi ${focusSubject} selama 30 menit dan catat topik tersulit.` },
      { day: 'Selasa', task: `Latihan soal ${focusSubject} dengan target akurasi 80%.` },
      { day: 'Rabu', task: `Gunakan metode belajar dari ${strongestSubject} untuk sesi remedial mandiri.` },
      { day: 'Kamis', task: 'Diskusi dengan guru/orang tua tentang progres minggu ini.' },
      { day: 'Jumat', task: 'Unggah bukti belajar atau sertifikat baru ke portofolio.' },
    ],
  };
}
