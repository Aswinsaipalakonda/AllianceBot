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
      replyText: "Welcome to *Alliance College of Hotel Management*, Visakhapatnam (affiliated to Andhra University)! 🎓👋\n\nI am the Senior Admissions Officer here. We offer premium business and hotel management programs to launch your global career. How may I assist you today? Please select from the options below to get started!",
      category: "Course Queries",
      course: "Undecided",
      status: "New Lead",
      suggestedButtons: ["Explore Courses", "Placements Info", "Scholarships"]
    };
  }

  // 2. Direct Counselor / Contact / Human Query
  if (
    text.includes('counselor') || 
    text.includes('talk to') || 
    text.includes('contact') || 
    text.includes('phone') || 
    text.includes('number') || 
    text.includes('staff') || 
    text.includes('call') || 
    text.includes('helpline') || 
    text.includes('representative')
  ) {
    return {
      replyText: "Warm greetings! As the Senior Admissions Officer here at *Alliance College of Hotel Management* (affiliated to Andhra University), I am delighted to connect you with our admissions panel. 📞✨\n\nYou can reach our college staff and counseling desk directly at:\n\n• *Main Admissions Helpline*: +91 88850 66502\n• *Director Academics (Kartikeswar Panda)*: +91 88850 66502\n• *Principal (Boddeti Srinivas Rao)*: +91 88850 66502\n• *Email Support*: alliancesince2003@gmail.com\n\nWe are here to support your career journey. Would you like to review our courses or start your application?",
      category: "Human Followups",
      course: "Undecided",
      status: "Follow-up",
      suggestedButtons: ["Explore Courses", "Apply Now", "Scholarships"]
    };
  }

  // 3. Apply Now / Admissions Process Query
  if (
    text === 'apply now' || 
    text === 'apply' || 
    text.includes('form') || 
    text.includes('how to join') || 
    text.includes('how to register') || 
    text.includes('registration')
  ) {
    return {
      replyText: "Ready to launch your global career? 🚀 Admissions are officially open for the new academic batch at *Alliance College of Hotel Management* (affiliated to Andhra University)!\n\nHere is our simple 2-step admissions process:\n1️⃣ Click the link below and fill out the online application form.\n2️⃣ Upload your documents (10th/12th marksheets, ID proof) directly inside the form and click Submit to secure your admission!\n*(Please note: There is no registration fee required to apply!)*\n\n📝 *Admissions Application Link*: https://forms.gle/FxpcHjSCLLrkhZkPA\n\n💡 *Suggested Google Forms Setup (Copy-Paste Details)*:\n• *Form Name*: Alliance College - Admission Application Form 2026-27\n• *Form Description*: Official application form for admissions into Alliance College of Hotel Management, Visakhapatnam. Established in 2003, affiliated to Andhra University. Please fill in your personal details, select your preferred course, and upload your certificates to secure your seat. For assistance, contact +91 88850 66502.\n\nWould you like to explore our scholarships or speak to a counselor?",
      category: "Course Queries",
      course: "Undecided",
      status: "Applied",
      suggestedButtons: ["Explore Courses", "Scholarships", "Talk to Counselor"]
    };
  }

  // 4. Course Details & Eligibility Queries
  const isBba = text.includes('bba') || text.includes('business administration');
  const isBhmct = text.includes('bhmct') || text.includes('hospitality management') || text.includes('catering');
  const isDhm = text.includes('dhm') || text.includes('diploma in hotel') || text.includes('diploma in hospitality');
  const isPgdhm = text.includes('pgdhm') || text.includes('post graduate diploma in hotel');
  const isPgdbm = text.includes('pgdbm') || text.includes('post graduate diploma in business');

  if (text.includes('course') || text.includes('degree') || text.includes('program') || text.includes('eligibility') || text.includes('duration') || isBba || isBhmct || isDhm || isPgdhm || isPgdbm) {
    if (isBba) {
      return {
        replyText: "Our *Bachelor of Business Administration (BBA)* is a premium 3-year full-time undergraduate program at *Alliance College of Hotel Management* (affiliated to Andhra University). 💼\n\n• *Duration*: 3 Years (Full-Time)\n• *Eligibility*: Pass in 10+2 (Intermediate) from any recognized board in any stream.\n• *Overview*: Focuses on business principles, marketing, finance, accounting, and human resource management.\n\nWould you like to start your application now or speak with a counselor?",
        category: "Course Queries",
        course: "BBA",
        status: "Interested",
        suggestedButtons: ["Apply Now", "Scholarships", "Talk to Counselor"]
      };
    } else if (isBhmct) {
      return {
        replyText: "Our *Bachelor of Hospitality Management & Catering Technology (BHMCT)* is a professional 3-year full-time degree at *Alliance College of Hotel Management* (affiliated to Andhra University). 🏨🍳\n\n• *Duration*: 3 Years (Full-Time)\n• *Eligibility*: Pass in 10+2 (Intermediate) in any stream.\n• *Overview*: Comprehensive training in Food Production, Front Office, Housekeeping, Food & Beverage service, and Bakery. Includes a premium 6-month industrial internship in luxury 5-star hotels.\n\nWould you like to check out placement partners or start your application?",
        category: "Course Queries",
        course: "BHMCT",
        status: "Interested",
        suggestedButtons: ["Apply Now", "Placements Info", "Talk to Counselor"]
      };
    } else if (isDhm) {
      return {
        replyText: "Our *Diploma in Hotel Management (DHM)* is a practical-oriented 1-year course at *Alliance College of Hotel Management* (affiliated to Andhra University). 🍽️✨\n\n• *Duration*: 1 Year (Full-Time)\n• *Eligibility*: Pass in 10th standard.\n• *Overview*: Fast-track practical curriculum focusing on culinary arts, food production, housekeeping, and front office operations. Perfect for a quick, robust entry into the global hotel workforce.\n\nWould you like to apply now or speak with a counselor?",
        category: "Course Queries",
        course: "DHM",
        status: "Interested",
        suggestedButtons: ["Apply Now", "Scholarships", "Talk to Counselor"]
      };
    } else if (isPgdhm) {
      return {
        replyText: "Our *Post Graduate Diploma in Hotel Management (PGDHM)* is an advanced 1-year professional course at *Alliance College of Hotel Management* (affiliated to Andhra University). 🏢🎓\n\n• *Duration*: 1 Year (Full-Time)\n• *Eligibility*: Graduation (Degree pass) from any recognized university in any stream.\n• *Overview*: Designed for graduates seeking leadership and specialized administration roles in global luxury hotels and catering industries.\n\nWould you like to start your application or speak with a counselor?",
        category: "Course Queries",
        course: "PGDHM",
        status: "Interested",
        suggestedButtons: ["Apply Now", "Scholarships", "Talk to Counselor"]
      };
    } else if (isPgdbm) {
      return {
        replyText: "Our *Post Graduate Diploma in Business Management (PGDBM)* is a premium 2-year post-graduate course at *Alliance College of Hotel Management* (affiliated to Andhra University). 📈✨\n\n• *Duration*: 2 Years (Full-Time)\n• *Eligibility*: Graduation (Degree pass) from any discipline.\n• *Specializations*: Finance, Marketing, HR, I.T., Operations Management, Retail Management, Foreign Trade.\n\nWould you like to start your application or speak with a counselor?",
        category: "Course Queries",
        course: "PGDBM",
        status: "Interested",
        suggestedButtons: ["Apply Now", "Scholarships", "Talk to Counselor"]
      };
    } else {
      return {
        replyText: "As the Senior Admissions Officer, I am proud to showcase our career-oriented academic programs at *Alliance College of Hotel Management* (affiliated to Andhra University): 🎓✨\n\n1. *Bachelor of Hospitality Management & Catering Technology (BHMCT)* - 3 Years\n2. *Bachelor of Business Administration (BBA)* - 3 Years\n3. *Diploma in Hotel Management (DHM)* - 1 Year\n4. *Post Graduate Diploma in Hotel Management (PGDHM)* - 1 Year\n5. *Post Graduate Diploma in Business Management (PGDBM)* - 2 Years\n\nWhich program would you like to explore? Select a button below or let me know your interests!",
        category: "Course Queries",
        course: "Undecided",
        status: "Interested",
        suggestedButtons: ["BHMCT Details", "BBA Details", "Apply Now"]
      };
    }
  }

  // 5. Placements & Internships
  if (text.includes('placement') || text.includes('job') || text.includes('recruit') || text.includes('company') || text.includes('salary') || text.includes('package') || text.includes('internship')) {
    return {
      replyText: "*Alliance College of Hotel Management* (affiliated to Andhra University) has a dedicated Training & Placement Cell offering *100% placement assistance*! 💼✈️\n\n• *Core Recruiters*: Taj Hotels, Hyatt, Marriott, Radisson, Oberoi Group, ITC Hotels, Emirates Airlines, Hilton.\n• *Salary Packages*: Average 4.5 LPA, highest international package up to 12 LPA.\n• Hands-on premium 6-month internships in luxury 5-star hotels are integrated into the courses.\n\nWould you like to see our courses or speak to a counselor?",
      category: "Placement Queries",
      course: "Undecided",
      status: "Interested",
      suggestedButtons: ["Explore Courses", "Apply Now", "Talk to Counselor"]
    };
  }

  // 6. Scholarships and Fees
  if (text.includes('scholarship') || text.includes('fee') || text.includes('discount') || text.includes('free') || text.includes('cost') || text.includes('price')) {
    return {
      replyText: "*Alliance College of Hotel Management* (affiliated to Andhra University) offers fantastic *merit-based scholarships* and tuition fee concessions to deserving students! 🌟\n\n• *Mark-based fee waivers*: Up to 50% tuition fee waiver depending on your Intermediate/10+2 scores.\n• *Government Concessions*: Fee reimbursement and special A.P. state scholarships are available for eligible undergraduate candidates.\n• *Special Concessions*: Sports and special category concessions are offered during physical spot counseling sessions.\n\nWould you like to apply online now or talk to our admissions counselor to check your eligibility?",
      category: "Scholarship Queries",
      course: "Undecided",
      status: "Interested",
      suggestedButtons: ["Apply Now", "Explore Courses", "Talk to Counselor"]
    };
  }

  // 7. Hostels / Accommodation
  if (text.includes('hostel') || text.includes('accommodation') || text.includes('mess') || text.includes('stay') || text.includes('room') || text.includes('food')) {
    return {
      replyText: "Yes! *Alliance College of Hotel Management* (affiliated to Andhra University) offers safe, separate *hostel facilities* for both boys and girls close to the campus. 🏠🛌\n\n• *Features*: 24/7 high-speed Wi-Fi, laundry service, study halls, hot water, power backup.\n• *Mess Food*: Healthy, hygienic vegetarian and non-vegetarian meals served daily.\n\nWould you like to apply now or speak with a counselor?",
      category: "Course Queries",
      course: "Undecided",
      status: "Interested",
      suggestedButtons: ["Apply Now", "Explore Courses", "Talk to Counselor"]
    };
  }

  // Default Fallback
  return {
    replyText: "Thanks for reaching out to *Alliance College of Hotel Management* (affiliated to Andhra University)! 🎓👋\n\nI am the Senior Admissions Officer. I can answer questions about our BBA, BHMCT, DHM, PGDHM, and PGDBM courses, placements, scholarship criteria, or hostel facilities.\n\nWhat would you like to know?",
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
    const lowerMsg = messageText.toLowerCase().trim();

    // ==========================================
    // 0. Programmatic Conversational Overrides
    // ==========================================
    if (lowerMsg === 'talk to counselor' || lowerMsg === 'talk to us') {
      return {
        replyText: "Warm greetings! As the Senior Admissions Officer here at *Alliance College of Hotel Management* (affiliated to Andhra University), I am delighted to connect you with our admissions panel. 📞✨\n\nYou can reach our college staff and counseling desk directly at:\n\n• *Main Admissions Helpline*: +91 88850 66502\n• *Director Academics (Kartikeswar Panda)*: +91 88850 66502\n• *Principal (Boddeti Srinivas Rao)*: +91 88850 66502\n• *Office Email*: alliancesince2003@gmail.com\n• *Campus Address*: Near SBI, Maddilipalem, Visakhapatnam - 530022\n\nPlease feel free to call us directly during working hours (9:00 AM - 5:00 PM) or write to us. Would you like to review our courses or start your application process?",
        suggestedButtons: ["Explore Courses", "Apply Now", "Scholarships"],
        category: "Human Followups",
        course: "Undecided",
        status: "Follow-up"
      };
    }
    
    if (lowerMsg === 'apply now' || lowerMsg === 'apply') {
      return {
        replyText: "Ready to launch your global career? 🚀 Admissions are officially open for the new academic batch at *Alliance College of Hotel Management* (affiliated to Andhra University)!\n\nHere is our simple 2-step admissions process:\n1️⃣ Click the link below and fill out the online application form.\n2️⃣ Upload your documents (10th/12th marksheets, ID proof) directly inside the form and click Submit to secure your admission!\n*(Please note: There is no registration fee required to apply!)*\n\n📝 *Admissions Application Link*: https://forms.gle/FxpcHjSCLLrkhZkPA\n\n💡 *Suggested Google Forms Setup (Copy-Paste Details)*:\n• *Form Name*: Alliance College - Admission Application Form 2026-27\n• *Form Description*: Official application form for admissions into Alliance College of Hotel Management, Visakhapatnam. Established in 2003, affiliated to Andhra University. Please fill in your personal details, select your preferred course, and upload your certificates to secure your seat. For assistance, contact +91 88850 66502.\n\nWould you like to explore our scholarships or speak to a counselor?",
        suggestedButtons: ["Explore Courses", "Scholarships", "Talk to Counselor"],
        category: "Course Queries",
        course: "Undecided",
        status: "Applied"
      };
    }

    if (lowerMsg === 'scholarships' || lowerMsg === 'scholarship') {
      return {
        replyText: "*Alliance College of Hotel Management* (affiliated to Andhra University) offers fantastic *merit-based scholarships* and tuition fee concessions to deserving students! 🌟\n\n• *Mark-based fee waivers*: Up to 50% tuition fee waiver depending on your Intermediate/10+2 scores.\n• *Government Concessions*: Fee reimbursement and special A.P. state scholarships are available for eligible undergraduate candidates.\n• *Special Concessions*: Sports and special category concessions are offered during physical spot counseling sessions.\n\nWould you like to apply online now or talk to our admissions counselor to check your eligibility?",
        suggestedButtons: ["Apply Now", "Explore Courses", "Talk to Counselor"],
        category: "Scholarship Queries",
        course: "Undecided",
        status: "Interested"
      };
    }

    if (lowerMsg === 'explore courses' || lowerMsg === 'courses') {
      return {
        replyText: "As the Senior Admissions Officer, I am proud to showcase our career-oriented academic programs at *Alliance College of Hotel Management* (affiliated to Andhra University): 🎓✨\n\n1. *Bachelor of Hospitality Management & Catering Technology (BHMCT)*\n• *Duration*: 3 Years\n• *Eligibility*: Pass in 10+2 (Intermediate)\n\n2. *Bachelor of Business Administration (BBA)*\n• *Duration*: 3 Years\n• *Eligibility*: Pass in 10+2 (Intermediate)\n\n3. *Diploma in Hotel Management (DHM)*\n• *Duration*: 1 Year\n• *Eligibility*: Pass in 10th Class\n\n4. *Post Graduate Diploma in Hotel Management (PGDHM)*\n• *Duration*: 1 Year\n• *Eligibility*: Graduation (Any Degree)\n\n5. *Post Graduate Diploma in Business Management (PGDBM)*\n• *Duration*: 2 Years\n• *Eligibility*: Graduation (Any Degree)\n\nWhich program would you like to discuss in detail? Select a course or talk to us directly!",
        suggestedButtons: ["BHMCT Details", "BBA Details", "Apply Now"],
        category: "Course Queries",
        course: "Undecided",
        status: "Interested"
      };
    }

    if (lowerMsg === 'bhmct details' || lowerMsg === 'bhmct admissions') {
      return {
        replyText: "Our *Bachelor of Hospitality Management & Catering Technology (BHMCT)* is a professional 3-year full-time degree at *Alliance College of Hotel Management* (affiliated to Andhra University). 🏨🍳\n\n• *Duration*: 3 Years\n• *Eligibility*: Pass in 10+2 (Intermediate) in any stream.\n• *Overview*: Comprehensive training in Food Production, Front Office, Housekeeping, Food & Beverage service, and Bakery. Includes a premium 6-month industrial internship in luxury 5-star hotels.\n\nWould you like to check out placement partners or start your application?",
        suggestedButtons: ["Apply Now", "Placements Info", "Talk to Counselor"],
        category: "Course Queries",
        course: "BHMCT",
        status: "Interested"
      };
    }
    
    if (lowerMsg === 'bba details' || lowerMsg === 'bba admissions') {
      return {
        replyText: "Our *Bachelor of Business Administration (BBA)* is a premium 3-year full-time undergraduate program at *Alliance College of Hotel Management* (affiliated to Andhra University). 💼\n\n• *Duration*: 3 Years (Full-Time)\n• *Eligibility*: Pass in 10+2 (Intermediate) from any recognized board in any stream.\n• *Overview*: Focuses on business principles, marketing, finance, accounting, and human resource management.\n\nWould you like to start your application now or speak with a counselor?",
        suggestedButtons: ["Apply Now", "Scholarships", "Talk to Counselor"],
        category: "Course Queries",
        course: "BBA",
        status: "Interested"
      };
    }

    // ==========================================
    // 1. Classification Step via Gemini
    // ==========================================
    const genAI = getGeminiClient();
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
2. "course": One of "BHMCT", "BBA", "DHM", "PGDHM", "PGDBM", or "Undecided". (Identify the course mentioned, default to "Undecided" if none).
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

    // ==========================================
    // 2. Reply Generation Step via Gemini
    // ==========================================
    console.log("Generating AI reply using Gemini...");
    const chatModel = genAI.getGenerativeModel({ 
      model: 'gemini-1.5-flash',
      generationConfig: {
        responseMimeType: 'application/json',
      }
    });

    const systemPrompt = `
You are the Senior Admissions Officer at Alliance College of Hotel Management, Visakhapatnam.
Your goal is to assist prospective students who contact us on WhatsApp with absolute authority, professional warmth, and clarity. Keep interactions simple and easy to understand.

Here is the official Brochure context:
${ALLIANCE_BROCHURE_TEXT}

Strict Guidelines to Follow:
1. Speak as the Senior Admissions Officer: Be helpful, warm, concise, and highly professional. Avoid repetitive answers.
2. Highlighting College Name: When writing the college name in highlights, write it exactly as: *Alliance College of Hotel Management* (affiliated to Andhra University).
3. Full Course Names: When mentioning courses, always show the full course name first followed by the abbreviation in brackets. For example:
   - "Bachelor of Hospitality Management & Catering Technology (BHMCT)" (Duration is 3 Years)
   - "Bachelor of Business Administration (BBA)" (Duration is 3 Years)
   - "Diploma in Hotel Management (DHM)" (Duration is 1 Year)
   - "Post Graduate Diploma in Hotel Management (PGDHM)" (Duration is 1 Year)
   - "Post Graduate Diploma in Business Management (PGDBM)" (Duration is 2 Years)
4. Intercept "Talk to Counselor": If the student clicks "Talk to Counselor" or asks to speak with a human/counselor/call/phone, you MUST output the actual administration/helpline contacts:
   - Main Helpline: +91 88850 66502
   - Principal (Boddeti Srinivas Rao), Director Academics (Kartikeswar Panda) Helpline: +91 88850 66502
   - Office Email: alliancesince2003@gmail.com
5. Intercept "Apply Now": If the student clicks "Apply Now" or asks to apply/register, you MUST provide:
   - Application Form Link: https://forms.gle/FxpcHjSCLLrkhZkPA
   - Explain the 2-step process (fill form, upload certificates, submit) and explicitly mention that there is NO fee to pay.
   - Suggest setup details to copy into Google Forms:
     * Form Name: "Alliance College - Admission Application Form 2026-27"
     * Form Description: "Official application form for admissions into Alliance College of Hotel Management, Visakhapatnam. Established in 2003, affiliated to Andhra University. Please fill in your personal details, select your preferred course, and upload your certificates to secure your seat. For assistance, contact +91 88850 66502."
6. Avoid Redundant Suggested Buttons:
   - If you are answering a query about Scholarships, do NOT include "Scholarships" in the suggested buttons.
   - If you are answering a query about Counselor/Helpline, do NOT include "Talk to Counselor" in the suggested buttons.
   - If you are answering a query about Application/Applying, do NOT include "Apply Now" in the suggested buttons.
7. Provide up to 3 suggested interactive quick-reply buttons. Each button MUST be strictly 20 characters or less. Example buttons: ["Apply Now", "Explore Courses", "Scholarships", "Talk to Counselor"].

You MUST return a JSON object in this exact format:
{
  "replyText": "Professional, warm response from Senior Admissions Officer based on context...",
  "suggestedButtons": ["Explore Courses", "Scholarships", "Talk to Counselor"]
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
        suggestedButtons: ["Explore Courses", "Scholarships", "Talk to Counselor"]
      };
    }

    // ==========================================
    // 3. Programmatic Button Redundancy Pruner
    // ==========================================
    if (responseObj.suggestedButtons && Array.isArray(responseObj.suggestedButtons)) {
      const lowerReply = responseObj.replyText.toLowerCase();
      const lowerQuery = messageText.toLowerCase();
      
      responseObj.suggestedButtons = responseObj.suggestedButtons.filter(btn => {
        const lowerBtn = btn.toLowerCase();
        
        // If query or reply is about Scholarships, prune the Scholarships button
        if ((lowerQuery.includes('scholarship') || lowerReply.includes('scholarship')) && lowerBtn.includes('scholarship')) {
          return false;
        }
        
        // If query or reply is about human counselor/contacts, prune Counselor buttons
        if ((lowerQuery.includes('counselor') || lowerQuery.includes('contact') || lowerQuery.includes('talk to') || lowerReply.includes('helpline') || lowerReply.includes('contact number')) && (lowerBtn.includes('counselor') || lowerBtn.includes('talk to') || lowerBtn.includes('contact'))) {
          return false;
        }
        
        // If query or reply is about applying/forms, prune Apply Now button
        if ((lowerQuery.includes('apply') || lowerQuery.includes('form') || lowerReply.includes('forms.gle') || lowerReply.includes('forms.gle/')) && lowerBtn.includes('apply')) {
          return false;
        }
        
        return true;
      });

      // Ensure we always have at least 2 and at most 3 fallback/diverse buttons if they got pruned
      const uniqueButtons = new Set(responseObj.suggestedButtons);
      const candidates = ["Explore Courses", "Apply Now", "Scholarships", "Talk to Counselor"];
      
      for (const cand of candidates) {
        if (uniqueButtons.size >= 3) break;
        
        const lowerCand = cand.toLowerCase();
        // Check if candidate would be redundant in this context
        if ((lowerQuery.includes('scholarship') || lowerReply.includes('scholarship')) && lowerCand.includes('scholarship')) continue;
        if ((lowerQuery.includes('counselor') || lowerQuery.includes('contact') || lowerQuery.includes('talk to') || lowerReply.includes('helpline')) && (lowerCand.includes('counselor') || lowerCand.includes('talk to'))) continue;
        if ((lowerQuery.includes('apply') || lowerQuery.includes('form') || lowerReply.includes('forms.gle') || lowerReply.includes('forms.gle/')) && lowerCand.includes('apply')) continue;
        
        uniqueButtons.add(cand);
      }
      
      responseObj.suggestedButtons = Array.from(uniqueButtons).slice(0, 3);
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
