import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-initialized GenAI Client
let aiClient: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error("GEMINI_API_KEY is not defined in environment variables");
    }
    aiClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// AI Analysis Endpoint
app.post("/api/ai/analyze", async (req, res) => {
  try {
    const { records, docs, userName, userRole } = req.body;
    
    // Safety check for empty data
    if (!records || records.length === 0) {
      return res.status(400).json({ 
        error: "Data nilai akademik belum cukup untuk dianalisis. Tambahkan beberapa nilai terlebih dahulu." 
      });
    }

    const ai = getGenAI();

    const formattedRecords = records.map((r: any) => 
      `- ${r.subject} (${r.semester}): Nilai ${r.grade}. Catatan: ${r.note || "Tidak ada"}`
    ).join("\n");

    const formattedDocs = docs && docs.length > 0 
      ? docs.map((d: any) => `- ${d.title} (Jenis: ${d.type}, ${d.sem})`).join("\n")
      : "Tidak ada prestasi khusus atau dokumen terunggah.";

    const prompt = `
Anda adalah konselor akademik cerdas, psikolog pendidikan, dan penasihat kurikulum untuk siswa sekolah dasar dan menengah di Indonesia.
Silakan analisis rekam jejak akademik berikut untuk siswa bernama "${userName}" dengan peran login "${userRole}".

### DATA NILAI AKADEMIK:
${formattedRecords}

### PRESTASI & DOKUMEN LAINNYA:
${formattedDocs}

Berikan analisis komprehensif, kritis, konstruktif, dan penuh motivasi dalam Bahasa Indonesia yang santun dan profesional.
Patuhi format skema JSON yang diminta secara ketat.
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "Anda adalah Omni Learn AI, asisten pembelajaran adaptif cerdas yang menganalisis performa akademis longitudinal dan merancang rekomendasi belajar personal terbaik bagi siswa di Indonesia.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { 
              type: Type.STRING, 
              description: "Ringkasan tingkat tinggi mengenai performa akademis, perkembangan longitudinal, dan motivasi umum untuk siswa." 
            },
            strengths: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING },
              description: "Daftar kekuatan utama siswa dalam mata pelajaran tertentu atau aspek soft skills."
            },
            weaknesses: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Area yang perlu fokus lebih tinggi atau strategi mitigasi kelemahan."
            },
            recommendations: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  subject: { type: Type.STRING, description: "Nama mata pelajaran atau bidang keterampilan" },
                  actionPlan: { type: Type.STRING, description: "Langkah-langkah taktis belajar mandiri secara personal dan adaptif" },
                  difficulty: { type: Type.STRING, description: "Tingkat prioritas/rekomendasi: Sangat Tinggi, Tinggi, Sedang, atau Cukup" }
                },
                required: ["subject", "actionPlan", "difficulty"]
              },
              description: "Rencana aksi rekomendasi belajar personal."
            },
            futureCareers: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Saran penjurusan sekolah lanjutan atau opsi karir masa depan yang cocok berdasarkan performa dan minat bakat."
            }
          },
          required: ["summary", "strengths", "weaknesses", "recommendations", "futureCareers"]
        }
      }
    });

    const outputText = response.text;
    if (!outputText) {
      throw new Error("Failed to generate content from AI model.");
    }

    const resultJson = JSON.parse(outputText.trim());
    res.json(resultJson);

  } catch (err: any) {
    console.error("AI Analysis Error:", err);
    res.status(500).json({ error: err.message || "Terjadi kesalahan pada server AI." });
  }
});

// Vite middleware for development vs static asset serving for production
async function setupServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Omni Learn Server] Running on http://0.0.0.0:${PORT}`);
  });
}

setupServer();
