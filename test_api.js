const apiKey = "AQ.Ab8RN6Ic0INoBlMsWRpXtnC0ENYqTOvby6XCRCjW6VJ1TYn0dQ";
const GEMINI_MODEL = "gemini-3.5-flash";
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`;

async function test() {
    const requestBody = {
      contents: [{ role: "user", parts: [{text: "Hello"}] }],
    };
    try {
        const response = await fetch(GEMINI_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(requestBody),
        });
        const data = await response.json();
        console.log("Status:", response.status);
        console.log("Response:", JSON.stringify(data, null, 2));
    } catch (e) {
        console.error(e);
    }
}
test();
