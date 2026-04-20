import { GoogleGenerativeAI } from "@google/generative-ai";
import Question from "../models/Question.js";

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
// Using 1.5 Flash for speed/cost, or 1.5 Pro for complex reasoning
const model = genAI.getGenerativeModel({ 
  model: "gemini-1.5-pro-latest",
  generationConfig: { responseMimeType: "application/json" } // Force JSON output
});

export async function generateFinalFeedback(session) {
  try {
    const summary = session.answers.map((a, i) => ({
      q: i + 1,
      score: a.overallScore,
      emotion: a.emotionSummary?.dominant,
      nlp: a.nlpScore,
    }));

    const prompt = `You are an expert interview coach. Given this candidate's interview data:
Tech stack: ${session.techStack.join(", ")}
Answer scores: ${JSON.stringify(summary)}
Overall confidence: ${session.overallConfidenceScore}%
Overall performance: ${session.overallPerformanceScore}%

Write a 3-4 sentence constructive feedback paragraph covering:
1. Overall performance assessment
2. Key strengths observed
3. Areas to improve
4. One specific actionable tip`;

    // No need for JSON config here since we want prose
    const proseModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await proseModel.generateContent(prompt);
    const response = await result.response;

    return response.text() || "Feedback unavailable.";
  } catch (err) {
    console.error("Feedback generation failed:", err.message);
    return `You completed the interview with an overall score of ${session.overallPerformanceScore}%. Keep practicing and improve clarity.`;
  }
}

/**
 * Fallback questions if AI fails
 */
function getFallbackQuestions(techStack, count) {
  // ... (Keep your existing fallback logic here)
  const fallback = {
    frontend: [
      {
        text: "What is the difference between var, let, and const in JavaScript?",
        category: "frontend",
        difficulty: "easy",
        expectedKeywords: ["scope", "hoisting", "block"],
        sampleAnswer: "var is function-scoped, let/const are block-scoped.",
        isAIGenerated: false,
      }
    ],
    behavioral: [
      {
        text: "Tell me about a challenging project.",
        category: "behavioral",
        difficulty: "medium",
        expectedKeywords: ["challenge", "solution"],
        sampleAnswer: "Use STAR method.",
        isAIGenerated: false,
      }
    ]
  };

  const questions = [];
  for (const stack of techStack) {
    const pool = fallback[stack] || fallback.behavioral;
    questions.push(...pool);
  }

  return questions.slice(0, count);
}