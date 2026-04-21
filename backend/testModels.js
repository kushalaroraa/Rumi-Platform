const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function listModels() {
    try {
        const models = await genAI.listModels();

        for (const m of models) {
            console.log(m.name, m.supportedGenerationMethods);
        }
    } catch (err) {
        console.error("Error listing models:", err);
    }
}

listModels();