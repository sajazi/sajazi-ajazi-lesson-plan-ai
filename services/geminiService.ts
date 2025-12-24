
import { GoogleGenAI } from "@google/genai";
import { LessonRequest } from "../types";
import mammoth from 'mammoth';

type Part = 
  | { text: string }
  | { inlineData: { data: string; mimeType: string } };

const fileToGenerativePart = async (file: File): Promise<Part> => {
  const ext = file.name.split('.').pop()?.toLowerCase();

  if (ext === 'docx') {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.convertToHtml({ arrayBuffer });
      
      if (!result.value) {
        throw new Error("Could not extract content from this Word document.");
      }

      return {
        text: `[TEMPLATE STRUCTURE (HTML)]\n${result.value}\n[TEMPLATE STRUCTURE END]\n\n(Note to AI: The text above is the HTML structure of the user's template. Use this to understand the tables and sections.)`
      };
    } catch (e) {
      console.error("DOCX Parsing Error:", e);
      throw new Error("Failed to read the Word document. Please try converting it to PDF.");
    }
  }

  if (ext === 'txt' || ext === 'html' || ext === 'htm') {
    const text = await file.text();
    return { text: `[TEMPLATE CONTENT (${ext?.toUpperCase()})]\n${text}` };
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      const base64Data = base64String.split(',')[1];
      
      let mimeType = file.type;
      if (!mimeType) {
        if (ext === 'pdf') mimeType = 'application/pdf';
        else if (['jpg', 'jpeg'].includes(ext || '')) mimeType = 'image/jpeg';
        else if (ext === 'png') mimeType = 'image/png';
      }

      resolve({
        inlineData: {
          data: base64Data,
          mimeType: mimeType || 'application/pdf',
        },
      });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export const generateLessonPlan = async (
  templateFile: File,
  request: LessonRequest
): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const filePart = await fileToGenerativePart(templateFile);

  const prompt = `
    You are an expert curriculum developer and teacher.
    
    TASK:
    Create a comprehensive lesson plan by filling out the provided Lesson Plan Template.
    
    DETAILS:
    - Subject: ${request.subject}
    - Unit/Module: ${request.unit || "N/A"}
    - Lesson Topic: ${request.topic}
    - Grade Level: ${request.gradeLevel}
    - Resources to Use: ${request.resources}
    - Additional Instructions: ${request.additionalInstructions || "None"}

    INSTRUCTIONS:
    1. ANALYZE the structure of the provided template (tables, headers, sections).
    2. RECREATE that exact structure in your output. If the template uses a table, you MUST use an HTML <table>.
    3. FILL IN every section with high-quality, pedagogical content based on the Topic/Resources.
    4. OUTPUT FORMAT: **HTML**. 
       - Do not use Markdown. 
       - Use <h2>, <h3> for headers.
       - Use <table border="1" cellspacing="0" cellpadding="5"> for tables.
       - Use <ul>/<ol> for lists.
       - Do not include <html>, <head>, or <body> tags, just the content.
       - Style the table with standard HTML attributes (border="1") so it pastes well into Google Docs/Word.
    5. Do not include introductory filler text. Start directly with the lesson plan content.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
            filePart, 
            { text: prompt }
        ]
      },
      config: {
        tools: [{ googleSearch: {} }]
      }
    });

    if (response.text) {
      return response.text;
    } else {
      throw new Error("No content generated.");
    }
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};
