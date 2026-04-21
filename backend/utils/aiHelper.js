import 'dotenv/config';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize the Gemini SDK
// We use a getter to ensure process.env is fully loaded before initialization
let _genAI = null;
const getClient = () => {
  if (!_genAI) {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is missing from .env file');
    }
    _genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  }
  return _genAI;
};

/**
 * 1. Generate Final Feedback (April 2026 Stable Version)
 * Uses Gemini 2.5 Flash for the best speed/accuracy balance.
 */
export async function generateFinalFeedback(session) {
  try {
    const genAI = getClient();
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    // Prepare a more detailed summary for the AI to analyze
    const summary = session.answers?.map((a, i) => ({
      questionNumber: i + 1,
      questionText: a.questionText,
      score: a.overallScore || 0,
      sentiment: a.emotionSummary?.dominant || 'neutral',
      nlpFeedback: a.aiFeedback || 'No specific feedback'
    })) || [];

    const prompt = `You are an elite technical interview coach. Analyze this data:
    Tech Stack: ${session.techStack?.join(', ')}
    Overall Score: ${session.overallPerformanceScore}%
    Questions & Performance: ${JSON.stringify(summary)}

    Task:
    1. Write a 2-sentence overall summary of their performance.
    2. For EACH question, provide one specific technical tip to improve the answer. 
    
    Example Format:
    Overall, you demonstrated strong logic but need more technical depth. For Q1, explain the Virtual DOM lifecycle. For Q2, mention Big O complexity. For Q3, use more specific examples of middleware.
    
    Constraints:
    - Return plain text only.
    - No markdown, bolding, or bullet points.
    - Keep the total length under 150 words so it fits the UI card.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text().trim();

    return text || "Evaluation complete. Review your per-question scores for details.";

  } catch (err) {
    console.error('[Gemini AI Error]:', err.message);
    
    // Improved fallback that mentions the specific tech stack
    const score = session.overallPerformanceScore || 0;
    const stack = session.techStack?.[0] || "technical";
    
    return `You achieved a score of ${score}%. To improve, revisit your ${stack} fundamentals and practice articulating the "why" behind your code choices for each question asked today.`;
  }
}