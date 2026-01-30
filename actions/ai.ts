"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
    console.warn("GEMINI_API_KEY is not set in environment variables");
}

// Remove top-level init to prevent startup crashes
// const genAI = new GoogleGenerativeAI(apiKey || "");
// const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

export async function parseIntentWithGemini(input: string, context?: any) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        console.error("Gemini API key is missing");
        return null; // Fail gracefully instead of crashing
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
        model: "gemini-2.0-flash", // Use the verified working model
    });

    try {
        const prompt = `
            You are an AI assistant for a project management tool. 
            Your goal is to extract structured data from a user's natural language input.
            
            User Input: "${input}"
            
            Instructions:
            1. Analyze the input to determine if the user wants to create a PROJECT or a TASK.
            2. **Smart Extraction**: Extract the *core name* of the entity. 
               - Remove command verbs like "creating", "create a", "make new". 
               - **CRITICAL**: If the user uses quotes (e.g., create project "Hirely"), the title MUST be exactly what is inside the quotes ("Hirely").
               - If no quotes, infer the most logical concise name (e.g., "Build a mobile app" -> Title: "Mobile App").
            3. If "project" is mentioned or implied, intent_type is "create_project".
            4. If "task", "bug", "issue" is mentioned, intent_type is "create_task".
            5. Suggest a short, uppercase 3-4 letter project_key (e.g. "HIRE") if creating a project.
            
            Return ONLY a raw JSON object (no markdown, no backticks) with this structure:
            {
              "title": "The extracted name (e.g. 'Hirely', 'Marketing Campaign')",
              "priority": "Low" | "Medium" | "High",
              "task_type": "story" | "bug" | "task",
              "description": "Any extra details found in the input",
              "intent_type": "create_task" | "create_project",
              "project_key": "KEY"
            }
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        // Check if candidate exists to avoid safety rating errors
        if (!response.candidates || response.candidates.length === 0) {
            console.error("Gemini blocked the response or returned no candidates.");
            return null;
        }
        const text = response.text();
        console.log("Gemini Raw Response:", text); // Debugging

        // improved cleanup
        const cleanText = text.replace(/```json/g, "").replace(/```/g, "").trim();
        console.log("Cleaned Text for Parsing:", cleanText);

        try {
            const parsedData = JSON.parse(cleanText);
            console.log("Parsed Data:", parsedData); // Debugging
            return parsedData;
        } catch (parseError) {
            console.error("Failed to parse Gemini response:", text, parseError);
            return null;
        }
    } catch (error) {
        console.error("Error calling Gemini API:", error);
        return null;
    }
}
