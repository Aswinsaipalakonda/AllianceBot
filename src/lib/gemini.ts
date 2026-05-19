import { GoogleGenerativeAI } from '@google/generative-ai';
import { ALLIANCE_BROCHURE_TEXT } from './brochure';

const apiKey = process.env.GEMINI_API_KEY || '';

// We use the official @google/generative-ai library which has standard Web support
const genAI = new GoogleGenerativeAI(apiKey);

export async function classifyMessageAndRespond(
  messageText: string,
  history: { role: 'user' | 'model'; parts: string[] }[] = []
) {
  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      generationConfig: {
        responseMimeType: 'application/json',
      },
    });

    const classificationPrompt = `
You are an advanced classification engine for the Alliance College Admissions CRM.
Analyze the student's incoming message and categorize it accurately.

Incoming Message: "${messageText}"

You must return a JSON object with the following fields:
1. "category": One of "Course Queries", "Placement Queries", "Scholarship Queries", or "Human Followups".
   - If the student is asking about eligibility, courses, or syllabus, set to "Course Queries".
   - If asking about companies, packages, placements, set to "Placement Queries".
   - If asking about discounts, scholarships, free admission, set to "Scholarship Queries".
   - If the student is angry, asking for a real person/counselor, or has complex off-topic requests, set to "Human Followups".
2. "course": One of "BHMCT", "BBA", "DHM", or "Undecided".
3. "status": One of "New Lead", "Interested", "Follow-up", "Applied", "Converted". (Defaults to "Interested" unless they mention they already applied or took admission).

Return JSON format:
{
  "category": "Course Queries",
  "course": "BHMCT",
  "status": "Interested"
}
`;

    console.log("Classifying message...");
    const classificationResult = await model.generateContent(classificationPrompt);
    const resultText = classificationResult.response.text();
    let classification = { category: 'Course Queries', course: 'Undecided', status: 'New Lead' };
    
    try {
      classification = JSON.parse(resultText);
    } catch (e) {
      console.error("Failed to parse classification JSON:", resultText);
    }

    console.log("Generating AI reply using Gemini...");
    const chatModel = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const systemPrompt = `
You are an expert Admissions Counselor at Alliance College of Management and Hotel Management.
Your goal is to assist prospective students who contact us on WhatsApp.

Here is the official Brochure context:
${ALLIANCE_BROCHURE_TEXT}

Instructions:
1. Answer ONLY based on the provided brochure context. If you don't know, ask the student to schedule a campus visit or talk to a senior counselor.
2. Keep the answer extremely brief, engaging, and friendly (max 2-3 short paragraphs).
3. Use emojis naturally to match a warm WhatsApp communication style.
4. Always guide the student towards booking a counseling session or applying.
5. Format key details like course duration or eligibility criteria clearly with bullet points.
`;

    // Reconstruct history formatting for Gemini
    const geminiHistory = history.map(h => ({
      role: h.role,
      parts: [{ text: h.parts.join('\n') }]
    }));

    const chat = chatModel.startChat({
      history: geminiHistory,
      systemInstruction: systemPrompt
    });

    const responseResult = await chat.sendMessage(messageText);
    const replyText = responseResult.response.text();

    return {
      replyText,
      category: classification.category,
      course: classification.course,
      status: classification.status
    };

  } catch (error: any) {
    console.error("Gemini processing error:", error.message);
    return {
      replyText: "Thanks for reaching out to Alliance College! 👋 An admissions counselor will get back to you shortly.",
      category: "Human Followups",
      course: "Undecided",
      status: "New Lead"
    };
  }
}
