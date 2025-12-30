
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const geminiService = {
  async generateDescription(title: string, author: string): Promise<string> {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Scrivi una breve descrizione accattivante (max 300 caratteri) in italiano per il libro intitolato "${title}" scritto da "${author}".`,
        config: {
          temperature: 0.7,
        }
      });
      return response.text || "Nessuna descrizione disponibile.";
    } catch (error) {
      console.error("Errore Gemini:", error);
      return "Impossibile generare una descrizione al momento.";
    }
  },

  async suggestBook(interests: string): Promise<string> {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Basandoti su questi interessi: "${interests}", suggerisci un libro famoso con titolo e autore. Rispondi solo con "Titolo - Autore".`,
      });
      return response.text || "Il Piccolo Principe - Antoine de Saint-Exupéry";
    } catch (error) {
      return "1984 - George Orwell";
    }
  }
};
