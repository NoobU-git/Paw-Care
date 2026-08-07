/* ==========================================================================
   NETLIFY SERVERLESS FUNCTION — GEMINI VISION PROXY
   ==========================================================================
   Fungsi ini jalan di server (Netlify), BUKAN di browser. Jadi API key
   Gemini kamu aman, ndak keliatan sama pengunjung website.

   Cara kerja:
   1. Terima teks gejala + array foto (base64 dataUrl) dari app.js
   2. Kirim ke Gemini API (model gemini-2.5-flash, support vision)
   3. Balikin hasil analisis teks ke frontend

   SETUP WAJIB:
   - Di Netlify Dashboard -> Site settings -> Environment variables
   - Tambahkan: GEMINI_API_KEY = <API key dari Google AI Studio>
   ========================================================================== */

const GEMINI_MODEL = "gemini-3.5-flash-lite";
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

// Batas jumlah foto yang dikirim ke Gemini per request (jaga payload & kuota)
const MAX_PHOTOS_PER_REQUEST = 4;

exports.handler = async function (event) {
  // Cuma terima method POST
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ success: false, error: "Method not allowed" }),
    };
  }

  let apiKey;
  try {
    const rawKeys = process.env.GEMINI_API_KEY;
    if (!rawKeys) {
      console.error("GEMINI_API_KEY belum di-set di environment variables Netlify.");
      return {
        statusCode: 500,
        body: JSON.stringify({
          success: false,
          error: "Server belum dikonfigurasi (GEMINI_API_KEY kosong). Cek Netlify env vars.",
        }),
      };
    }
    
    // API Key Rotation (Load Balancing)
    const apiKeys = rawKeys.split(',').map(k => k.trim()).filter(k => k.length > 0);
    apiKey = apiKeys[Math.floor(Math.random() * apiKeys.length)];
    console.log(`Menggunakan API Key ke-${apiKeys.indexOf(apiKey) + 1} dari ${apiKeys.length} kunci yang tersedia.`);

    const payload = JSON.parse(event.body || "{}");
    const mode = payload.mode || "analyze";

    // ========================================================================
    // MODE 2: AKINATOR
    // ========================================================================
    if (mode === "akinator") {
      const petType = typeof payload.petType === "string" ? payload.petType : "hewan peliharaan";
      const input = typeof payload.input === "string" ? payload.input : "";
      const photos = Array.isArray(payload.photos) ? payload.photos : [];
      const history = Array.isArray(payload.history) ? payload.history : [];

      const systemPrompt = `Kamu adalah dokter hewan berpengalaman yang sedang melakukan diagnosis interaktif seperti permainan Akinator. Tugasmu adalah mengajukan pertanyaan klinis satu per satu untuk mempersempit kemungkinan diagnosis anabul (Kucing / Anjing).

Jenis hewan yang dipilih user: ${petType}
Keluhan pemilik: "${input}"

ATURAN WAJIB & SANGAT PENTING:
1. DETEKSI SPESIES OTOMATIS: Amati foto atau teks gejala. Apakah ini Kucing, Anjing, atau Hewan Lain / Objek acak?
   - Kembalikan field 'detectedSpecies': "kucing" | "anjing" | "lainnya".
   - Jika foto jelas-jelas Anjing padahal user pilih Kucing (atau sebaliknya), gunakan spesies yang ada di FOTO untuk diagnosis dan set detectedSpecies sesuai foto.
   - Jika terdeteksi bukan kucing/anjing (misal kelinci, burung, reptil, benda acak), kembalikan type: "unsupported" dengan pesan ramah bahwa PawCare fokus pada Kucing & Anjing.
2. ATURAN PENULISAN PERTANYAAN KLINIS (SANGAT KETAT):
   - Tombol jawaban user HANYA ADA TIGA: [Ya], [Tidak], dan [Tidak Yakin].
   - DILARANG KERAS membuat pertanyaan dengan kata "atau" / pilihan ganda / membingungkan (Contoh DILARANG: "Apakah muntah sekali atau berulang kali?", "Apakah muntah makanan atau cairan empedu?", "Apakah diare atau sembelit?").
   - Pertanyaan WAJIB berupa SATU PERNYATAAN KONDISI TUNGGAL yang pasti dan hanya bisa dijawab "Ya" atau "Tidak".
   - CONTOH PERTANYAAN YANG BENAR (Ya / Tidak):
     * "Apakah anabul muntah berulang kali (lebih dari 1 kali) dalam 24 jam terakhir?" (Ya = berulang, Tidak = hanya 1 kali)
     * "Apakah cairan muntahan berwarna kuning atau kehijauan (cairan empedu)?" (Ya = empedu, Tidak = makanan/bening)
     * "Apakah anabul terlihat sangat lemas dan menolak makan sama sekali?" (Ya / Tidak)
     * "Apakah ada luka terbuka, darah, atau keropeng tebal pada area kulit tersebut?" (Ya / Tidak)
     * "Apakah anabul sering menggaruk atau menggigit area yang bermasalah tersebut?" (Ya / Tidak)
3. Evaluasi semua jawaban sebelumnya secara logis untuk mempersempit kemungkinan penyakit.
4. Berikan confidence score (0-100) seberapa yakin kamu sudah bisa mendiagnosis.
5. Jika confidence >= 90% atau sudah mencapai 3-4 pertanyaan, langsung berikan diagnosis akhir alih-alih bertanya terus.

BALAS DALAM FORMAT JSON SAJA (tanpa markdown code block), dengan salah satu struktur berikut:

Jika masih butuh pertanyaan:
{"type":"question","detectedSpecies":"kucing","confidence":45,"question":"Apakah ada kerontokan bulu melingkar (kebotakan) pada area kulit tersebut?","possibleConditions":["Ringworm (Jamur)","Mange (Kudis)","Alergi Dermatitis"]}

Jika sudah yakin (confidence >= 90%):
{"type":"diagnosis","detectedSpecies":"anjing","confidence":95,"diseases":[{"name":"Oral Papillomatosis","severity":"sedang","description":"Kutil virus pada mukosa mulut yang umum terjadi pada anjing muda","treatments":["Bilas rongga mulut dengan larutan Chlorhexidine 0.12% khusus hewan","Berikan makanan bertekstur lunak (wet food) agar tidak mengiritasi kutil","Monitor perkembangan dalam 2-4 minggu, segera ke dokter hewan jika bertambah besar"],"urgency":"kuning","citation":"Merck Veterinary Manual 2024: Canine Oral Papillomatosis"}]}

Jika foto bukan kucing/anjing:
{"type":"unsupported","detectedSpecies":"lainnya","message":"PawCare saat ini dioptimalkan khusus untuk Kucing & Anjing. Silakan unggah foto anabulmu untuk hasil triase yang presisi."}`;

      const contents = [];

      // Pesan pertama (system prompt + foto)
      const firstParts = [{ text: systemPrompt }];
      const photosToSend = photos.slice(0, MAX_PHOTOS_PER_REQUEST);
      for (const photo of photosToSend) {
        const dataUrl = typeof photo === "string" ? photo : photo && photo.dataUrl;
        if (!dataUrl || typeof dataUrl !== "string") continue;

        const match = dataUrl.match(/^data:(image\/[a-zA-Z0-9+.-]+);base64,(.+)$/);
        if (!match) {
          console.warn("Format dataUrl foto tidak dikenali, dilewati.");
          continue;
        }

        const mimeType = match[1];
        const base64Data = match[2];

        firstParts.push({
          inline_data: {
            mime_type: mimeType,
            data: base64Data,
          },
        });
      }
      contents.push({ role: "user", parts: firstParts });

      // Riwayat pertanyaan (history)
      for (const h of history) {
        if (h.question) {
          contents.push({ role: "model", parts: [{ text: h.question }] });
        }
        if (h.answer) {
          contents.push({ role: "user", parts: [{ text: h.answer }] });
        }
      }

      // Pesan terakhir agar melanjutkan diagnosis (hanya jika ada history, untuk mencegah double user role)
      if (history.length > 0) {
        const lastIdx = contents.length - 1;
        if (contents[lastIdx].role === "user") {
          contents[lastIdx].parts[0].text += "\n\nBerdasarkan semua jawaban di atas, berikan pertanyaan spesifik berikutnya atau diagnosis akhir.";
        } else {
          contents.push({ role: "user", parts: [{ text: "Berdasarkan semua jawaban di atas, berikan pertanyaan spesifik berikutnya atau diagnosis akhir." }] });
        }
      }

      const requestBody = {
        contents,
        generationConfig: {
          temperature: 0.4,
          maxOutputTokens: 2048,
        },
      };

      let result = null;
      let lastError = null;

      // Smart Load Balancer (Akinator Mode)
      for (let i = 0; i < apiKeys.length; i++) {
          const currentKey = apiKeys[i];
          const fetchUrl = `${GEMINI_URL}?key=${currentKey}`;
          
          try {
              const response = await fetch(fetchUrl, {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify(requestBody),
              });

              const data = await response.json();

              if (!response.ok) {
                  lastError = JSON.stringify(data);
                  console.warn(`[Akinator Balancer] Key ke-${i + 1} Gagal (429/503). Coba key selanjutnya...`);
                  continue; // Coba key berikutnya
              }
              
              result = data;
              break; // Sukses! Keluar dari loop

          } catch (e) {
              console.error(`[Akinator Balancer] Network Error Key ke-${i + 1}`, e);
              continue;
          }
      }

      if (!result) {
          console.error("Gemini API Error (Semua Kunci Gagal):", lastError);
          return {
            statusCode: 429,
            body: JSON.stringify({ success: false, error: "Semua server AI sibuk. Detail: " + lastError }),
          };
      }
      
      const data = result;

      const candidate = data && data.candidates && data.candidates[0];
      let aiText = candidate && candidate.content && candidate.content.parts && candidate.content.parts[0] && candidate.content.parts[0].text;

      if (!aiText) {
        return {
          statusCode: 502,
          body: JSON.stringify({ success: false, error: "Gemini tidak mengembalikan teks." }),
        };
      }

      try {
        // Hapus markdown code block json (jika ada) sebelum parsing
        aiText = aiText.replace(/```json/g, "").replace(/```/g, "").trim();
        const parsedJSON = JSON.parse(aiText);
        return {
          statusCode: 200,
          body: JSON.stringify({ success: true, data: parsedJSON }),
        };
      } catch (err) {
        console.error("Gagal parse JSON Gemini (akinator):", aiText);
        return {
          statusCode: 200, // Return 200 agar frontend bisa handle response gagal parsing
          body: JSON.stringify({ success: false, error: "Format respons AI tidak valid" }),
        };
      }

    } 
    // ========================================================================
    // MODE 1: ANALYZE (Existing)
    // ========================================================================
    else {
      const input = typeof payload.input === "string" ? payload.input : "";
      const petType = typeof payload.petType === "string" ? payload.petType : "hewan peliharaan";
      const photos = Array.isArray(payload.photos) ? payload.photos : [];

      if (!input.trim() && photos.length === 0) {
        return {
          statusCode: 400,
          body: JSON.stringify({ success: false, error: "Tidak ada teks maupun foto yang dikirim." }),
        };
      }

      // Susun prompt teks
      const promptText = [
        `Kamu adalah asisten dokter hewan yang membantu screening awal kondisi ${petType}.`,
        `Catatan gejala dari pemilik: "${input.trim() || "(tidak ada catatan teks, hanya foto)"}"`,
        "",
        "Tolong amati foto yang diberikan (jika ada) dan jelaskan dalam Bahasa Indonesia, singkat (maksimal 4 kalimat):",
        "1. Apa yang terlihat pada foto secara faktual (area tubuh, warna, tekstur, kondisi kulit/mulut/dsb)",
        "2. Kemungkinan kategori masalah: kulit (jamur/ringworm/mange/luka), mulut (benjolan/papiloma/gusi), atau pencernaan (muntah/makanan)",
        "3. Seberapa mendesak kondisi ini terlihat",
        "",
        "Jika tidak ada foto, fokus analisis pada teks gejala saja. Jangan mengarang detail yang tidak terlihat/tersebutkan.",
      ].join("\n");

      const parts = [{ text: promptText }];

      // Tambahkan foto (base64) sebagai inline_data
      const photosToSend = photos.slice(0, MAX_PHOTOS_PER_REQUEST);
      for (const photo of photosToSend) {
        const dataUrl = typeof photo === "string" ? photo : photo && photo.dataUrl;
        if (!dataUrl || typeof dataUrl !== "string") continue;

        const match = dataUrl.match(/^data:(image\/[a-zA-Z0-9+.-]+);base64,(.+)$/);
        if (!match) {
          console.warn("Format dataUrl foto tidak dikenali, dilewati.");
          continue;
        }

        const mimeType = match[1];
        const base64Data = match[2];

        parts.push({
          inline_data: {
            mime_type: mimeType,
            data: base64Data,
          },
        });
      }

      const geminiPayload = {
        contents: [{ role: "user", parts }],
        generationConfig: {
          temperature: 0.4,
          maxOutputTokens: 400,
        },
      };

      let result = null;
      let lastError = null;
      
      // Smart Load Balancer: Coba semua kunci API secara berurutan kalau gagal
      for (let i = 0; i < apiKeys.length; i++) {
          const currentKey = apiKeys[i];
          console.log(`[Load Balancer] Mencoba API Key ke-${i + 1}/${apiKeys.length}...`);
          
          const fetchUrl = `${GEMINI_URL}?key=${currentKey}`;
          
          try {
              const response = await fetch(fetchUrl, {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify(geminiPayload),
              });

              if (!response.ok) {
                  const errorText = await response.text();
                  console.warn(`[Load Balancer] API Key ke-${i + 1} gagal (Status: ${response.status}). Pindah ke kunci berikutnya...`);
                  lastError = errorText;
                  continue; // Lanjut ke API key berikutnya di array
              }

              // Jika sukses, keluar dari loop
              result = await response.json();
              console.log(`[Load Balancer] API Key ke-${i + 1} BERHASIL!`);
              break; 
              
          } catch (error) {
              console.error(`[Load Balancer] Error jaringan di API Key ke-${i + 1}:`, error);
              continue;
          }
      }

      // Kalau semua kunci dicoba tapi gagal semua
      if (!result) {
          console.error("Semua API Key kehabisan limit atau error!", lastError);
          return {
              statusCode: 429,
              body: JSON.stringify({
                  success: false,
                  error: "Semua server AI sibuk atau kehabisan kuota (429/503). Tunggu 1 menit lalu coba lagi.",
              }),
          };
      }

      const candidate = result && result.candidates && result.candidates[0];
      const aiText =
        candidate &&
        candidate.content &&
        candidate.content.parts &&
        candidate.content.parts[0] &&
        candidate.content.parts[0].text;

      if (!aiText) {
        // Cek kalau kena safety block dsb
        const finishReason = candidate && candidate.finishReason;
        console.warn("Gemini tidak mengembalikan teks. finishReason:", finishReason);
        return {
          statusCode: 502,
          body: JSON.stringify({
            success: false,
            error: `Gemini tidak mengembalikan hasil analisis (finishReason: ${finishReason || "unknown"}).`,
          }),
        };
      }

      return {
        statusCode: 200,
        body: JSON.stringify({ success: true, aiText: aiText.trim() }),
      };
    }
  } catch (err) {
    console.error("Function Error:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ success: false, error: err.message || "Internal server error" }),
    };
  }
};
