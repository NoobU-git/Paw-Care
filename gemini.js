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

const GEMINI_MODEL = "gemini-2.5-flash";
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
    apiKey = process.env.GEMINI_API_KEY;
    console.log("Using API Key starting with:", apiKey ? apiKey.substring(0, 10) : "null");
    if (!apiKey) {
      console.error("GEMINI_API_KEY belum di-set di environment variables Netlify.");
      return {
        statusCode: 500,
        body: JSON.stringify({
          success: false,
          error: "Server belum dikonfigurasi (GEMINI_API_KEY kosong). Cek Netlify env vars.",
        }),
      };
    }

    const payload = JSON.parse(event.body || "{}");
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

    const requestBody = {
      contents: [{ role: "user", parts }],
      generationConfig: {
        temperature: 0.4,
        maxOutputTokens: 400,
      },
    };

    const finalUrl = `${GEMINI_URL}?key=${apiKey}`;

    const response = await fetch(finalUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Gemini API Error:", JSON.stringify(data));
      const errMsg = (data && data.error && data.error.message) || `Gemini API error (status ${response.status})`;
      return {
        statusCode: response.status,
        body: JSON.stringify({ success: false, error: errMsg }),
      };
    }

    const candidate = data && data.candidates && data.candidates[0];
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
  } catch (err) {
    console.error("Function Error:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ success: false, error: err.message || "Internal server error" }),
    };
  }
};
