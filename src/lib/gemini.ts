import { GoogleGenerativeAI } from '@google/generative-ai';
import { ALLIANCE_BROCHURE_TEXT } from './brochure';

// Instantiate GoogleGenerativeAI lazily within functions to prevent top-level import crashes when process.env is not yet loaded
function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY || '';
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is missing in environment variables.");
  }
  return new GoogleGenerativeAI(apiKey);
}

// Smart rule-based Offline Fallback Engine in case Gemini API is suspended or fails
export function generateOfflineReply(messageText: string) {
  const text = messageText.toLowerCase().trim();
  
  // 1. Simple Greetings
  if (
    text === 'hi' || 
    text === 'hii' || 
    text === 'hey' || 
    text === 'hello' || 
    text === 'greetings' || 
    text === 'good morning' || 
    text === 'good afternoon'
  ) {
    return {
      replyText: "Welcome to *Alliance College of Management & Hotel Management, Visakhapatnam*! 🎓👋\n\nWe offer premium undergraduate courses to kickstart your career in hospitality and business administration. How can we help you today? Please choose an option below to get started!",
      category: "Course Queries",
      course: "Undecided",
      status: "New Lead",
      suggestedButtons: ["Explore Courses", "Placements Info", "Scholarships"]
    };
  }

  // 2. Course queries
  if (text.includes('course') || text.includes('degree') || text.includes('program') || text.includes('bba') || text.includes('bhmct') || text.includes('dhm') || text.includes('eligibility')) {
    if (text.includes('bba')) {
      return {
        replyText: "Our *BBA (Bachelor of Business Administration)* is a premium 3-year full-time program. 💼\n\n• *Eligibility*: 10+2 with min 50% marks in any stream.\n• *Overview*: Focuses on business principles, marketing, financial accounting, human resources, and entrepreneurship.\n• *Careers*: Business Analyst, Marketing Executive, HR Associate.\n\nWould you like to speak to an admissions counselor about BBA admissions?",
        category: "Course Queries",
        course: "BBA",
        status: "Interested",
        suggestedButtons: ["BBA Admissions", "Placements Info", "Talk to Counselor"]
      };
    } else if (text.includes('bhmct')) {
      return {
        replyText: "Our *BHMCT (Bachelor of Hospitality Management & Catering Technology)* is a top-tier 4-year full-time program. 🏨🍳\n\n• *Eligibility*: 10+2 in any stream with min 45% marks.\n• *Overview*: Deep dive into culinary arts, food & beverage service, front office, housekeeping, and tourism management. Includes a 6-month industrial internship in 5-star hotels.\n• *Careers*: Professional Chef, Hotel Manager, Cruise Cabin Crew.\n\nWould you like details on how to register?",
        category: "Course Queries",
        course: "BHMCT",
        status: "Interested",
        suggestedButtons: ["BHMCT Admissions", "Industrial Internship", "Talk to Counselor"]
      };
    } else if (text.includes('dhm') || text.includes('diploma')) {
      return {
        replyText: "Our *DHM (Diploma in Hospitality Management)* is an intensive 1.5-year practical program. 🍽️✨\n\n• *Eligibility*: 10th standard pass with min 40% marks.\n• *Overview*: A fast-track practical diploma focusing heavily on food production, culinary arts, and housekeeping skills. Perfect for quick entry into the hospitality workforce.",
        category: "Course Queries",
        course: "DHM",
        status: "Interested",
        suggestedButtons: ["DHM Admissions", "Hostel Info", "Talk to Counselor"]
      };
    } else {
      return {
        replyText: "Alliance College offers three world-class full-time programs in Visakhapatnam: 🎓\n\n1. *BHMCT* (4 Years) - Hospitality & Catering\n2. *BBA* (3 Years) - Business Management\n3. *DHM* (1.5 Years) - Practical Hospitality Diploma\n\nWhich program would you like to explore?",
        category: "Course Queries",
        course: "Undecided",
        status: "Interested",
        suggestedButtons: ["BBA Details", "BHMCT Details", "DHM Details"]
      };
    }
  }

  // 3. Placements
  if (text.includes('placement') || text.includes('job') || text.includes('recruit') || text.includes('company') || text.includes('salary') || text.includes('package') || text.includes('internship')) {
    return {
      replyText: "Alliance College has a dedicated Training & Placement Cell providing *100% placement assistance*! 💼✈️\n\n• *Core Recrutiers*: Taj Hotels, Hyatt, Marriott, Radisson, Oberoi Group, ITC Hotels, Emirates Airlines, Hilton.\n• *Average Package*: 4.5 LPA\n• *Highest Package*: 12 LPA (International placement!)\n• Includes 6-month hands-on industrial internship in luxury 5-star hotels.",
      category: "Placement Queries",
      course: "Undecided",
      status: "Interested",
      suggestedButtons: ["Placement Partners", "Explore Courses", "Talk to Counselor"]
    };
  }

  // 4. Scholarships and Fees
  if (text.includes('scholarship') || text.includes('fee') || text.includes('discount') || text.includes('free') || text.includes('cost') || text.includes('price')) {
    return {
      replyText: "Alliance College offers fantastic *merit-based scholarships* to deserving students! 🌟\n\n• Mark-based tuition fee waivers are available (up to 50% waiver depending on Intermediate/10+2 scores).\n• Special sports and merit concessions are also offered during physical counseling sessions.\n\nWould you like to schedule a quick call with a counselor to check your eligibility?",
      category: "Scholarship Queries",
      course: "Undecided",
      status: "Interested",
      suggestedButtons: ["Scholarship criteria", "Explore Courses", "Talk to Counselor"]
    };
  }

  // 5. Hostels / Accommodation
  if (text.includes('hostel') || text.includes('accommodation') || text.includes('mess') || text.includes('stay') || text.includes('room') || text.includes('food')) {
    return {
      replyText: "Yes! Alliance College offers safe, separate *hostel facilities* for both boys and girls close to the campus. 🏠🛌\n\n• *Features*: 24/7 high-speed Wi-Fi, laundry service, study halls, hot water, power backup.\n• *Mess Food*: Healthy, hygienic vegetarian and non-vegetarian meals served daily.\n\nWould you like to schedule a campus and hostel visit?",
      category: "Course Queries",
      course: "Undecided",
      status: "Interested",
      suggestedButtons: ["Schedule Visit", "Explore Courses", "Talk to Counselor"]
    };
  }

  // 6. Admissions process
  if (text.includes('admission') || text.includes('apply') || text.includes('register') || text.includes('process') || text.includes('join')) {
    return {
      replyText: "Admissions are currently OPEN for the new academic batch! 📝✨\n\nHere is our simple 3-step admissions process:\n1️⃣ Schedule a quick counseling session (WhatsApp or campus visit).\n2️⃣ Fill out the application form and submit documents (10th/12th marksheets, ID proof).\n3️⃣ Pay registration fee to secure your seat.\n\nWould you like to start your application now?",
      category: "Course Queries",
      course: "Undecided",
      status: "Interested",
      suggestedButtons: ["Apply Now", "Scholarships", "Talk to Counselor"]
    };
  }

  // Default Fallback
  return {
    replyText: "Thanks for reaching out to *Alliance College of Management & Hotel Management*! 🎓👋\n\nI am your AI admissions assistant. I can answer questions about our BBA, BHMCT, and DHM courses, placements, scholarship criteria, or hostel facilities.\n\nWhat would you like to know?",
    category: "Course Queries",
    course: "Undecided",
    status: "New Lead",
    suggestedButtons: ["Explore Courses", "Placements Info", "Scholarships"]
  };
}

export async function classifyMessageAndRespond(
  messageText: string,
  history: { role: 'user' | 'model'; parts: string[] }[] = []
) {
  try {
    const genAI = getGeminiClient();

    // 1. Classification Step
    const classificationModel = genAI.getGenerativeModel({
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
   - If the student is sending a greeting (e.g. "Hi", "Hello", "Hii", "Hey") or asking about eligibility, courses, or syllabus, set to "Course Queries". Greetings MUST be categorized as "Course Queries" to welcome them!
   - If asking about companies, packages, placements, set to "Placement Queries".
   - If asking about discounts, scholarships, free admission, set to "Scholarship Queries".
   - If the student is angry, explicitly asking for a real person/counselor, or has complex off-topic requests, set to "Human Followups".
2. "course": One of "BHMCT", "BBA", "DHM", or "Undecided". (Identify the course mentioned, default to "Undecided" if none).
3. "status": One of "New Lead", "Interested", "Follow-up", "Applied", "Converted". (Defaults to "Interested" unless it is a simple greeting which is "New Lead").

Return JSON format:
{
  "category": "Course Queries",
  "course": "BHMCT",
  "status": "Interested"
}
`;

    console.log("Classifying message...");
    const classificationResult = await classificationModel.generateContent(classificationPrompt);
    const resultText = classificationResult.response.text();
    let classification = { category: 'Course Queries', course: 'Undecided', status: 'New Lead' };
    
    try {
      classification = JSON.parse(resultText);
    } catch (e) {
      console.error("Failed to parse classification JSON, using defaults:", resultText);
    }

    // 2. Reply Generation Step with structured JSON return type
    console.log("Generating AI reply using Gemini...");
    const chatModel = genAI.getGenerativeModel({ 
      model: 'gemini-1.5-flash',
      generationConfig: {
        responseMimeType: 'application/json',
      }
    });

    const systemPrompt = `
You are an expert Admissions Counselor at Alliance College of Management and Hotel Management, Visakhapatnam.
Your goal is to assist prospective students who contact us on WhatsApp.

Here is the official Brochure context:
${ALLIANCE_BROCHURE_TEXT}

Instructions:
1. Answer ONLY based on the provided brochure context. If you don't know, ask the student to schedule a campus visit or talk to a senior counselor.
2. Keep the answer extremely brief, engaging, and friendly (max 2-3 short paragraphs).
3. Use emojis naturally to match a warm WhatsApp communication style.
4. Format key details like course duration or eligibility criteria clearly with bullet points.
5. Provide up to 3 suggested interactive quick-reply buttons under 20 characters each. Example: ["BBA Info", "Scholarships", "Talk to Us"].

You MUST return a JSON object in this exact format:
{
  "replyText": "Brief, warm, emoji-rich response based strictly on brochure...",
  "suggestedButtons": ["Explore Courses", "Placements Info", "Talk to Us"]
}
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
    const replyJSONText = responseResult.response.text();
    
    let responseObj = { replyText: '', suggestedButtons: [] as string[] };
    try {
      responseObj = JSON.parse(replyJSONText);
    } catch (e) {
      console.error("Failed to parse reply JSON, falling back to text:", replyJSONText);
      responseObj = {
        replyText: replyJSONText,
        suggestedButtons: ["Explore Courses", "Scholarships", "Talk to Us"]
      };
    }

    return {
      replyText: responseObj.replyText,
      suggestedButtons: responseObj.suggestedButtons || [],
      category: classification.category,
      course: classification.course,
      status: classification.status
    };

  } catch (error: any) {
    console.error("Gemini API failed, falling back to Offline Fallback Engine:", error.message);
    const offlineResult = generateOfflineReply(messageText);
    return offlineResult;
  }
}
