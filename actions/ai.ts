"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
    console.warn("GEMINI_API_KEY is not set in environment variables");
}

const genAI = new GoogleGenerativeAI(apiKey || "");

const model = genAI.getGenerativeModel({
    model: "gemini-flash-latest",
});

export async function parseIntentWithGemini(input: string, context?: any) {
    if (!apiKey) {
        console.error("Gemini API key is missing");
        return null;
    }

    try {
        const prompt = `
      You are an AI assistant for a project management tool. 
      Your goal is to extract structured data from a user's natural language input.
      
      User Input: "${input}"
      
      Instructions:
      1. Analyze the input to determine if the user wants to create a PROJECT or a TASK.
      2. If "project" is mentioned or implied (e.g. "marketing campaign", "new product"), intent_type is "create_project".
      3. If "task", "bug", "issue" is mentioned, intent_type is "create_task".
      4. Suggest a short, uppercase 3-4 letter project_key (e.g. "MKT") if creating a project.
      
      Return ONLY a raw JSON object (no markdown, no backticks) with this structure:
      {
        "title": "Concise summary or name (e.g. 'Hirely' for project, 'Fix Login' for task)",
        "priority": "Low" | "Medium" | "High",
        "task_type": "story" | "bug" | "task",
        "description": "Any extra details",
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
