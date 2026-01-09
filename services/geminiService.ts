import { GoogleGenAI } from "@google/genai";

// API Key provided for the session
const API_KEY = "AIzaSyByZA0NbXeGtLRhMcbntXAjI8kD50U-EHI";

const ai = new GoogleGenAI({ apiKey: API_KEY });

export const analyzeSymptoms = async (symptoms: string): Promise<string> => {
  try {
    const model = 'gemini-3-flash-preview';
    const systemInstruction = `
      You are MediCore AI, a preliminary medical assistant.
      Your goal is to analyze the user's symptoms based on medical knowledge (ICD-10/SNOMED CT).
      
      RULES:
      1. Analyze the symptoms provided.
      2. Suggest OTC (Over-the-Counter) medications (e.g., Paracetamol, Ibuprofen, Antacids) with strict disclaimers.
      3. Recommend the specific type of doctor the patient should see (e.g., Cardiologist, Dermatologist, Pediatrician, General Practitioner).
      4. Return the response in strictly valid JSON format.
      
      JSON SCHEMA:
      {
        "analysis": "Brief explanation of potential condition (max 2 sentences).",
        "confidence": "High/Medium/Low",
        "otc_medications": ["Medication 1", "Medication 2"],
        "specialist_type": "Exact Specialist Name (e.g. Cardiologist)",
        "disclaimer": "Standard medical disclaimer."
      }
    `;

    const response = await ai.models.generateContent({
      model,
      contents: symptoms,
      config: {
        systemInstruction,
        temperature: 0.3, 
        responseMimeType: "application/json"
      }
    });

    return response.text || "{}";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return JSON.stringify({
      analysis: "Error connecting to AI service. Please check your internet connection.",
      otc_medications: [],
      specialist_type: "General Practitioner",
      disclaimer: "System error. Please consult a doctor manually."
    });
  }
};

export const analyzeMedicalImage = async (file: File, context: string): Promise<string> => {
  try {
    const base64Data = await fileToGenerativePart(file);
    
    // Using gemini-3-flash-preview for image analysis as it supports multimodal inputs efficiently
    const model = 'gemini-3-flash-preview'; 
    
    const prompt = `
      Analyze this medical image (X-Ray, MRI, or Lab Report).
      Context provided by user: ${context}
      
      Tasks:
      1. Identify any visible abnormalities (fractures, opacities, masses, text values out of range).
      2. If it's a report, summarize key findings.
      3. If it's an image, describe what is seen.
      4. Provide a disclaimer that this is AI analysis and needs radiologist/doctor confirmation.
    `;

    const response = await ai.models.generateContent({
      model,
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Data,
              mimeType: file.type
            }
          },
          { text: prompt }
        ]
      }
    });

    return response.text || "Could not analyze the image.";
  } catch (error) {
    console.error("Gemini Image Analysis Error:", error);
    return "Error analyzing medical image.";
  }
};

export const assessEmergency = async (description: string): Promise<{ severity: 'LOW' | 'MEDIUM' | 'HIGH', advice: string }> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Evaluate the medical emergency severity for: "${description}". 
      Return JSON only: { "severity": "LOW" | "MEDIUM" | "HIGH", "advice": "short immediate advice" }`,
      config: {
        responseMimeType: "application/json"
      }
    });
    
    const text = response.text;
    if (!text) throw new Error("No response");
    
    return JSON.parse(text);
  } catch (e) {
    console.error("Gemini Emergency Assessment Error:", e);
    // Fallback to HIGH risk if AI fails during an emergency
    return { severity: 'HIGH', advice: "System error. Please call emergency services immediately." };
  }
}

// Helper to convert File to Base64 string (no header)
async function fileToGenerativePart(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      // Remove data url part (e.g. "data:image/jpeg;base64,")
      const base64Data = base64String.split(',')[1];
      resolve(base64Data);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}