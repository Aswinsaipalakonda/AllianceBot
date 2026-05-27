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
      replyText: "Welcome to *Alliance College of Hotel Management*, Visakhapatnam (affiliated to Andhra University)! 🎓👋\n\nSo glad you reached out! I'm here to help you explore all of our courses, campus life, and global placements. Whether you are planning your career or ready to apply, how can I guide you today? 😊 Feel free to select from the options below to get started!",
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
      replyText: "Hey there! I would be absolutely delighted to connect you directly with our friendly admissions panel. 📞✨\n\nPlease feel free to call us directly during working hours (9:00 AM - 5:00 PM) or drop us an email. Would you like to review our courses or start your application process?",
      category: "Human Followups",
      course: "Undecided",
      status: "Follow-up",
      suggestedButtons: ["+91 88850 66502", "Email Admissions"]
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
      replyText: "Ready to launch your global career? 🚀 Admissions are open for the new batch at *Alliance College of Hotel Management* (affiliated to Andhra University)!\n\nHere is our simple 2-step admissions process:\n1️⃣ Click the link to fill the online application form:\n📝 *Apply Now*: https://forms.gle/FxpcHjSCLLrkhZkPA\n\n2️⃣ Upload your documents (10th/12th marksheets, ID proof) inside the form and click Submit to secure your admission! *(No registration fee required!)*\n\nWould you like to explore our scholarships or speak to a counselor?",
      category: "Course Queries",
      course: "Undecided",
      status: "Interested",
      suggestedButtons: ["Explore Courses", "Scholarships", "Talk to Counselor"]
    };
  }

  // 3.5 Career Opportunities / Careers
  if (
    text.includes('career') || 
    text.includes('job') || 
    text.includes('opportunity') || 
    text.includes('opportunities') || 
    text.includes('path')
  ) {
    return {
      replyText: "Here are the fantastic career opportunities awaiting you at *Alliance College of Hotel Management* (affiliated to Andhra University) for both our Business Administration (BBA) and Hotel/Hospitality Management programs! 💼✨",
      category: "Placement Queries",
      course: "Undecided",
      status: "Interested",
      suggestedButtons: ["Explore Courses", "Apply Now", "Talk to Counselor"],
      sendCareersImages: true
    };
  }

  // 4. Course Details & Eligibility Queries
  const isBba = (text.includes('bba') && !text.includes('pgd')) || text.includes('business administration');
  const isBhmct = text.includes('bhmct') || text.includes('hotel management & catering technology') || text.includes('catering technology') || text.includes('bachelors in hotel');
  const isDhm = (text.includes('dhm') && !text.includes('pgd')) || text.includes('diploma in hotel') || text.includes('diploma in hospitality');
  const isPgdhm = text.includes('pgdhm') || text.includes('pgdttm') || text.includes('tourism') || text.includes('travel') || text.includes('post graduate diploma in hotel');
  const isPgdbm = text.includes('pgdbm') || text.includes('post graduate diploma in business');
  const isIntermediate = text.includes('intermediate') && (text.includes('hotel') || text.includes('catering') || text.includes('ihmt'));
  const isMoreCourses = text === 'more courses' || text === 'other courses' || text.includes('more courses');

  if (text.includes('course') || text.includes('degree') || text.includes('program') || text.includes('eligibility') || text.includes('duration') || isBba || isBhmct || isDhm || isPgdhm || isPgdbm || isIntermediate || isMoreCourses) {
    if (isMoreCourses) {
      return {
        replyText: "Certainly! Here are our other highly popular intermediate, diploma, and postgraduate management programs at *Alliance College of Hotel Management* (affiliated to Andhra University): 🎓✨\n\n1. *Intermediate in Hotel Management and Catering Technology* - 2 Years\n3. *Diploma in Hotel Management (DHM)* - 1 Year\n4. *Post Graduate Diploma in Hotel Management (PGDHM) / Tourism & Travel Management (PGDTTM)* - 1 Year\n5. *Post Graduate Diploma in Business Management (PGDBM)* - 2 Years\n\nWhich program would you like to explore? Select a button below or tell me your interests!",
        category: "Course Queries",
        course: "Undecided",
        status: "Interested",
        suggestedButtons: ["DHM Details", "PGDHM Details", "PGDBM Details"]
      };
    } else if (isIntermediate) {
      return {
        replyText: "Our *Intermediate in Hotel Management and Catering Technology* is a foundational 2-year full-time program at *Alliance College of Hotel Management* (affiliated to Andhra University). 🏨✨\n\n• *Duration*: 2 Years (Full-Time)\n• *Eligibility*: Pass in 10th Class.\n• *Overview*: Foundational grounding in hospitality basics, catering science, and culinary fundamentals.\n\nWould you like to start your application now or speak with a counselor?",
        category: "Course Queries",
        course: "Undecided",
        status: "Interested",
        suggestedButtons: ["Apply Now", "Placements Info", "Talk to Counselor"],
        sendCourseImage: "hotel"
      };
    } else if (isPgdhm) {
      return {
        replyText: "Our *Post Graduate Diploma in Hotel Management (PGDHM) / Post Graduate Diploma in Tourism & Travel Management (PGDTTM)* is an advanced 1-year professional course at *Alliance College of Hotel Management* (affiliated to Andhra University). 🏢🎓\n\n• *Duration*: 1 Year (Full-Time)\n• *Eligibility*: Pass in Degree (Graduation) from any recognized university.\n• *Overview*: Advanced professional leadership training in hospitality administration, global tourism, and travel management for graduates.\n\nWould you like to start your application or speak with a counselor?",
        category: "Course Queries",
        course: "PGDHM",
        status: "Interested",
        suggestedButtons: ["Apply Now", "Placements Info", "Talk to Counselor"],
        sendCourseImage: "hotel"
      };
    } else if (isPgdbm) {
      return {
        replyText: "Our *Post Graduate Diploma in Business Management (PGDBM)* is a premium 2-year post-graduate course at *Alliance College of Hotel Management* (affiliated to Andhra University). 📈✨\n\n• *Duration*: 2 Years (Full-Time)\n• *Eligibility*: Graduation (Degree pass) from any recognized university.\n• *Specializations*: Finance, Marketing, HR, I.T., Operations Management, Retail Management, Foreign Trade.\n\nWould you like to start your application or speak with a counselor?",
        category: "Course Queries",
        course: "PGDBM",
        status: "Interested",
        suggestedButtons: ["Apply Now", "Placements Info", "Talk to Counselor"],
        sendCourseImage: "bba"
      };
    } else if (isBhmct) {
      return {
        replyText: "Our *Bachelor of Hotel Management & Catering Technology (BHMCT)* is a professional 3-year full-time degree at *Alliance College of Hotel Management* (affiliated to Andhra University). 🏨🍳\n\n• *Duration*: 3 Years (Full-Time)\n• *Eligibility*: Pass in 10+2 (Intermediate) with any stream/discipline.\n• *Overview*: Comprehensive professional training in Food Production, Front Office, Housekeeping, Food & Beverage service, and Bakery. Includes a premium 6-month industrial internship in multinational corporate companies. \n\nWould you like to check out placement partners or start your application?",
        category: "Course Queries",
        course: "BHMCT",
        status: "Interested",
        suggestedButtons: ["Apply Now", "Placements Info", "Talk to Counselor"],
        sendCourseImage: "hotel"
      };
    } else if (isBba) {
      return {
        replyText: "Our *Bachelor of Business Administration (BBA)* is a premium 3-year full-time undergraduate program at *Alliance College of Hotel Management* (affiliated to Andhra University). 💼\n\n• *Duration*: 3 Years (Full-Time)\n• *Eligibility*: Pass in 10+2 (Intermediate) with any stream/discipline.\n• *Overview*: Focuses on business principles, marketing, finance, accounting, and human resource management.\n\nWould you like to start your application now or speak with a counselor?",
        category: "Course Queries",
        course: "BBA",
        status: "Interested",
        suggestedButtons: ["Apply Now", "Placements Info", "Talk to Counselor"],
        sendCourseImage: "bba"
      };
    } else if (isDhm) {
      return {
        replyText: "Our *Diploma in Hotel Management (DHM)* is a practical-oriented 1-year course at *Alliance College of Hotel Management* (affiliated to Andhra University). 🍽️✨\n\n• *Duration*: 1 Year (Full-Time)\n• *Eligibility*: Pass in 10th standard.\n• *Overview*: Fast-track practical curriculum focusing on culinary arts, food production, housekeeping, and front office operations. Perfect for a quick, robust entry into the global hotel workforce.\n\nWould you like to apply now or speak with a counselor?",
        category: "Course Queries",
        course: "DHM",
        status: "Interested",
        suggestedButtons: ["Apply Now", "Placements Info", "Talk to Counselor"],
        sendCourseImage: "hotel"
      };
    } else {
      return {
        replyText: "We have some fantastic, industry-ready programs at *Alliance College of Hotel Management* (affiliated to Andhra University) to kickstart your global career! 🎓✨\n\n1. *Intermediate in Hotel Management and Catering Technology* - 2 Years\n2. *Bachelor of Hotel Management & Catering Technology (BHMCT)* - 3 Years\n3. *Bachelor of Business Administration (BBA)* - 3 Years\n4. *Diploma in Hotel Management (DHM)* - 1 Year\n5. *Post Graduate Diploma in Hotel Management (PGDHM) / Tourism & Travel Management (PGDTTM)* - 1 Year\n6. *Post Graduate Diploma in Business Management (PGDBM)* - 2 Years\n\nWhich program sounds interesting to you? Let me know your interests or choose a quick option below! 😊",
        category: "Course Queries",
        course: "Undecided",
        status: "Interested",
        suggestedButtons: ["BHMCT Details", "BBA Details", "More Courses"]
      };
    }
  }

  // 5. Placements & Internships
  if (text.includes('placement') || text.includes('job') || text.includes('recruit') || text.includes('company') || text.includes('salary') || text.includes('package') || text.includes('internship')) {
    return {
      replyText: "*Alliance College of Hotel Management* (affiliated to Andhra University) has a dedicated Training & Placement Cell offering *100% placement assistance*! 💼✈️\n\n• *Core Recruiters*: Taj Hotels, Hyatt, Marriott, Radisson, Oberoi Group, ITC Hotels, Emirates Airlines, Hilton.\n• *Salary Packages*: Average 4.5 LPA, highest international package up to 12 LPA.\n• Hands-on premium 6-month internships in multinational corporate companies.\n\nWould you like to see our courses or speak to a counselor?",
      category: "Placement Queries",
      course: "Undecided",
      status: "Interested",
      suggestedButtons: ["Explore Courses", "Apply Now", "Talk to Counselor"]
    };
  }

  // 6. Scholarships and Fees
  if (text.includes('scholarship') || text.includes('fee') || text.includes('discount') || text.includes('free') || text.includes('cost') || text.includes('price')) {
    return {
      replyText: "*Alliance College of Hotel Management* (affiliated to Andhra University) offers fantastic *merit-based scholarships* and tuition fee concessions to deserving students! 🌟\n\n• *Government Concessions*: Fee reimbursement and special A.P. state scholarships/reimbursements are available ONLY for eligible BHMCT and BBA undergraduate candidates. No other course scholarships or spot concessions are offered.\n\nWould you like to apply online now or talk to our admissions counselor to check your eligibility?",
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
    replyText: "Welcome to *Alliance College of Hotel Management* (affiliated to Andhra University)! 🎓👋\n\nSo glad you reached out! I'm here to help you with anything you need—from course durations and placements to scholarships and hostel facilities. 😊\n\nWhat would you like to explore first?",
    category: "Course Queries",
    course: "Undecided",
    status: "New Lead",
    suggestedButtons: ["Explore Courses", "Placements Info", "Scholarships"]
  };
}

export function stripGoogleFormsSetup(text: string): string {
  if (!text) return text;
  
  // Replace the specific Google Forms Setup block including any bullet points
  let cleaned = text.replace(/💡\s*Suggested\s*Google\s*Forms\s*Setup:[\s\S]*?(?=(Would you like|Explore our|Select from|How may I|What would you|$))/gi, '');
  
  // Also replace any standalone Form Name / Form Description bullet points just in case
  cleaned = cleaned.replace(/[•*]\s*Form\s*Name:[\s\S]*?(?=(Would you like|Explore our|Select from|How may I|What would you|$))/gi, '');
  cleaned = cleaned.replace(/[•*]\s*Form\s*Description:[\s\S]*?(?=(Would you like|Explore our|Select from|How may I|What would you|$))/gi, '');
  
  // Clean up duplicate newlines
  cleaned = cleaned.replace(/\n{3,}/g, '\n\n').trim();
  
  return cleaned;
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
    if (lowerMsg === 'talk to counselor' || lowerMsg === 'talk to us' || lowerMsg === 'counselor') {
      return {
        replyText: "Hey there! I would be absolutely delighted to connect you directly with our friendly admissions panel. 📞✨\n\nPlease feel free to call us directly during working hours (9:00 AM - 5:00 PM) or write to us. Would you like to review our courses or start your application process?",
        suggestedButtons: ["+91 88850 66502", "Email Admissions"],
        category: "Human Followups",
        course: "Undecided",
        status: "Follow-up"
      };
    }

    if (lowerMsg === '+91 88850 66502' || lowerMsg.includes('88850') || lowerMsg.includes('helpline')) {
      return {
        replyText: "You can call us directly on our helpline at *+91 88850 66502* during working hours (9:00 AM - 5:00 PM). We are happy to help! Would you like to review our courses or start your application process?",
        suggestedButtons: ["Explore Courses", "Apply Now", "Scholarships"],
        category: "Human Followups",
        course: "Undecided",
        status: "Follow-up"
      };
    }

    if (lowerMsg === 'email admissions' || lowerMsg === 'email support' || lowerMsg.includes('alliancesince2003')) {
      return {
        replyText: "You can write to us anytime at *alliancesince2003@gmail.com*. Our admissions team will get back to you promptly. Would you like to review our courses or start your application process?",
        suggestedButtons: ["Explore Courses", "Apply Now", "Scholarships"],
        category: "Human Followups",
        course: "Undecided",
        status: "Follow-up"
      };
    }
    
    if (lowerMsg === 'apply now' || lowerMsg === 'apply') {
      return {
        replyText: "Ready to launch your global career? 🚀 Admissions are open for the new batch at *Alliance College of Hotel Management* (affiliated to Andhra University)!\n\nHere is our simple 2-step admissions process:\n1️⃣ Click the link to fill the online application form:\n📝 *Apply Now*: https://forms.gle/FxpcHjSCLLrkhZkPA\n\n2️⃣ Upload your documents (10th/12th marksheets, ID proof) inside the form and click Submit to secure your admission! *(No registration fee required!)*\n\nWould you like to explore our scholarships or speak to a counselor?",
        suggestedButtons: ["Explore Courses", "Scholarships", "Talk to Counselor"],
        category: "Course Queries",
        course: "Undecided",
        status: "Interested"
      };
    }

    if (lowerMsg === 'career opportunities' || lowerMsg === 'careers' || lowerMsg === 'career' || lowerMsg === 'jobs') {
      return {
        replyText: "Here are the fantastic career opportunities awaiting you at *Alliance College of Hotel Management* (affiliated to Andhra University) for both our Business Administration (BBA) and Hotel/Hospitality Management programs! 💼✨",
        suggestedButtons: ["Explore Courses", "Apply Now", "Talk to Counselor"],
        category: "Placement Queries",
        course: "Undecided",
        status: "Interested",
        sendCareersImages: true
      };
    }

    if (lowerMsg === 'scholarships' || lowerMsg === 'scholarship') {
      return {
        replyText: "*Alliance College of Hotel Management* (affiliated to Andhra University) offers fantastic *merit-based scholarships* and tuition fee concessions to deserving students! 🌟\n\n• *Government Concessions*: Fee reimbursement and special A.P. state scholarships/reimbursements are available ONLY for eligible BHMCT and BBA undergraduate candidates. No other course scholarships or spot concessions are offered.\n\nWould you like to apply online now or talk to our admissions counselor to check your eligibility?",
        suggestedButtons: ["Apply Now", "Explore Courses", "Talk to Counselor"],
        category: "Scholarship Queries",
        course: "Undecided",
        status: "Interested"
      };
    }

    if (lowerMsg === 'explore courses' || lowerMsg === 'courses') {
      return {
        replyText: "As the Senior Admissions Officer, I am proud to showcase our career-oriented academic programs at *Alliance College of Hotel Management* (affiliated to Andhra University): 🎓✨\n\n1. *Intermediate in Hotel Management and Catering Technology* (Duration: 2 Years)\n2. *Bachelor of Hotel Management & Catering Technology (BHMCT)* (Duration: 3 Years)\n3. *Bachelor of Business Administration (BBA)* (Duration: 3 Years)\n4. *Diploma in Hotel Management (DHM)* (Duration: 1 Year)\n5. *Post Graduate Diploma in Hotel Management (PGDHM) / Tourism & Travel Management (PGDTTM)* (Duration: 1 Year)\n6. *Post Graduate Diploma in Business Management (PGDBM)* (Duration: 2 Years)\n\nWhich program would you like to discuss in detail? Select a course or talk to us directly!",
        suggestedButtons: ["BHMCT Details", "BBA Details", "More Courses"],
        category: "Course Queries",
        course: "Undecided",
        status: "Interested"
      };
    }

    if (lowerMsg === 'intermediate details' || lowerMsg === 'intermediate course' || lowerMsg.includes('intermediate in hotel') || lowerMsg === 'ihmt details') {
      return {
        replyText: "Our *Intermediate in Hotel Management and Catering Technology* is a foundational 2-year full-time program at *Alliance College of Hotel Management* (affiliated to Andhra University). 🏨✨\n\n• *Duration*: 2 Years (Full-Time)\n• *Eligibility*: Pass in 10th Class.\n• *Overview*: Foundational grounding in hospitality basics, catering science, and culinary fundamentals.\n\nWould you like to start your application now or speak with a counselor?",
        suggestedButtons: ["Apply Now", "Placements Info", "Talk to Counselor"],
        category: "Course Queries",
        course: "Undecided",
        status: "Interested",
        sendCourseImage: "hotel"
      };
    }

    if (lowerMsg === 'more courses' || lowerMsg === 'other courses' || lowerMsg.includes('more courses')) {
      return {
        replyText: "Certainly! Here are our other highly popular intermediate, diploma, and postgraduate management programs at *Alliance College of Hotel Management* (affiliated to Andhra University): 🎓✨\n\n1. *Intermediate in Hotel Management and Catering Technology* - 2 Years\n3. *Diploma in Hotel Management (DHM)* - 1 Year\n4. *Post Graduate Diploma in Hotel Management (PGDHM) / Tourism & Travel Management (PGDTTM)* - 1 Year\n5. *Post Graduate Diploma in Business Management (PGDBM)* - 2 Years\n\nWhich program would you like to explore? Select a button below or tell me your interests!",
        suggestedButtons: ["DHM Details", "PGDHM Details", "PGDBM Details"],
        category: "Course Queries",
        course: "Undecided",
        status: "Interested"
      };
    }

    if (lowerMsg === 'bhmct details' || lowerMsg === 'bhmct admissions' || lowerMsg.includes('bhmct details') || lowerMsg.includes('bhmct course')) {
      return {
        replyText: "Our *Bachelor of Hotel Management & Catering Technology (BHMCT)* is a professional 3-year full-time degree at *Alliance College of Hotel Management* (affiliated to Andhra University). 🏨🍳\n\n• *Duration*: 3 Years\n• *Eligibility*: Pass in 10+2 (Intermediate) with any stream/discipline.\n• *Overview*: Comprehensive professional training in Food Production, Front Office, Housekeeping, Food & Beverage service, and Bakery. Includes a premium 6-month industrial internship in multinational corporate companies.\n\nWould you like to check out placement partners or start your application?",
        suggestedButtons: ["Apply Now", "Placements Info", "Talk to Counselor"],
        category: "Course Queries",
        course: "BHMCT",
        status: "Interested",
        sendCourseImage: "hotel"
      };
    }
    
    if (lowerMsg === 'bba details' || lowerMsg === 'bba admissions' || lowerMsg.includes('bba details') || lowerMsg.includes('bba course')) {
      return {
        replyText: "Our *Bachelor of Business Administration (BBA)* is a premium 3-year full-time undergraduate program at *Alliance College of Hotel Management* (affiliated to Andhra University). 💼\n\n• *Duration*: 3 Years (Full-Time)\n• *Eligibility*: Pass in 10+2 (Intermediate) with any stream/discipline.\n• *Overview*: Focuses on business principles, marketing, finance, accounting, and human resource management.\n\nWould you like to start your application now or speak with a counselor?",
        suggestedButtons: ["Apply Now", "Placements Info", "Talk to Counselor"],
        category: "Course Queries",
        course: "BBA",
        status: "Interested",
        sendCourseImage: "bba"
      };
    }

    if (lowerMsg === 'pgdhm details' || lowerMsg === 'pgdhm admissions' || lowerMsg.includes('pgdhm details') || lowerMsg.includes('pgdhm course') || lowerMsg.includes('pgdttm') || lowerMsg.includes('tourism')) {
      return {
        replyText: "Our *Post Graduate Diploma in Hotel Management (PGDHM) / Post Graduate Diploma in Tourism & Travel Management (PGDTTM)* is an advanced 1-year professional course at *Alliance College of Hotel Management* (affiliated to Andhra University). 🏢🎓\n\n• *Duration*: 1 Year (Full-Time)\n• *Eligibility*: Pass in Degree (Graduation) from any recognized university.\n• *Overview*: Advanced professional leadership training in hospitality administration, global tourism, and travel management for graduates.\n\nWould you like to start your application or speak with a counselor?",
        suggestedButtons: ["Apply Now", "Placements Info", "Talk to Counselor"],
        category: "Course Queries",
        course: "PGDHM",
        status: "Interested",
        sendCourseImage: "hotel"
      };
    }

    if (lowerMsg === 'dhm details' || lowerMsg === 'dhm admissions' || ((lowerMsg.includes('dhm details') || lowerMsg.includes('dhm course')) && !lowerMsg.includes('pgd'))) {
      return {
        replyText: "Our *Diploma in Hotel Management (DHM)* is a practical-oriented 1-year course at *Alliance College of Hotel Management* (affiliated to Andhra University). 🍽️✨\n\n• *Duration*: 1 Year (Full-Time)\n• *Eligibility*: Pass in 10th standard.\n• *Overview*: Fast-track practical curriculum focusing on culinary arts, food production, housekeeping, and front office operations. Perfect for a quick, robust entry into the global hotel workforce.\n\nWould you like to apply now or speak with a counselor?",
        suggestedButtons: ["Apply Now", "Placements Info", "Talk to Counselor"],
        category: "Course Queries",
        course: "DHM",
        status: "Interested",
        sendCourseImage: "hotel"
      };
    }

    if (lowerMsg === 'pgdbm details' || lowerMsg === 'pgdbm admissions' || lowerMsg.includes('pgdbm details') || lowerMsg.includes('pgdbm course')) {
      return {
        replyText: "Our *Post Graduate Diploma in Business Management (PGDBM)* is a premium 2-year post-graduate course at *Alliance College of Hotel Management* (affiliated to Andhra University). 📈✨\n\n• *Duration*: 2 Years (Full-Time)\n• *Eligibility*: Graduation (Degree pass) from any recognized university.\n• *Specializations*: Finance, Marketing, HR, I.T., Operations Management, Retail Management, Foreign Trade.\n\nWould you like to start your application or speak with a counselor?",
        suggestedButtons: ["Apply Now", "Placements Info", "Talk to Counselor"],
        category: "Course Queries",
        course: "PGDBM",
        status: "Interested",
        sendCourseImage: "bba"
      };
    }

    // ==========================================
    // 1. Unified Classification & Response Generation via Gemini
    // ==========================================
    console.log("Generating AI classification and reply using Gemini...");
    const genAI = getGeminiClient();
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-1.5-flash',
      generationConfig: {
        responseMimeType: 'application/json',
      }
    });

    const systemPrompt = `
You are a warm, friendly, highly helpful Admissions Coordinator at Alliance College of Hotel Management, Visakhapatnam.
Your goal is to assist prospective students who contact us on WhatsApp with human warmth, personal empathy, and absolute clarity.
Avoid dry, rigid, bot-like phrasing (do NOT write statements like "I am the Senior Admissions Officer here" or "I am an AI assistant"). Speak naturally and conversationally, as a helpful student counselor or guide would, to make the student feel completely welcomed!
Also, classify the incoming message and the student's status for our CRM.

Here is the official Brochure context:
${ALLIANCE_BROCHURE_TEXT}

Strict Guidelines to Follow for CRM Classification:
1. "category": One of "Course Queries", "Placement Queries", "Scholarship Queries", or "Human Followups".
   - If the student is sending a greeting (e.g. "Hi", "Hello", "Hii", "Hey") or asking about eligibility, courses, or syllabus, set to "Course Queries". Greetings MUST be categorized as "Course Queries" to welcome them!
   - If asking about companies, packages, placements, set to "Placement Queries".
   - If asking about discounts, scholarships, free admission, set to "Scholarship Queries".
   - If the student is angry, explicitly asking for a real person/counselor, or has complex off-topic requests, set to "Human Followups".
2. "course": One of "BHMCT", "BBA", "DHM", "PGDHM", "PGDBM", or "Undecided". (Identify the course mentioned, default to "Undecided" if none).
3. "status": One of "New Lead", "Interested", "Follow-up", "Applied", "Converted". (Defaults to "Interested" unless it is a simple greeting which is "New Lead". Note: "Applied" should NOT be returned when a student only requests the application form or says they want to apply; instead, use "Interested").

Strict Guidelines to Follow for WhatsApp Reply:
1. Speak in a warm, natural, human-like voice: Be highly supportive, friendly, concise, and helpful. Always welcome the student with warm greetings (e.g., "Welcome to *Alliance College of Hotel Management* (affiliated to Andhra University)! 🎓👋 So glad you reached out!" or "Hey there! 😊"), and NEVER start with dry robot expressions.
2. Highlighting College Name: When writing the college name in highlights, write it exactly as: *Alliance College of Hotel Management* (affiliated to Andhra University).
3. Full Course Names: When mentioning courses, always show the full course name first followed by the abbreviation in brackets. For example:
   - "Intermediate in Hotel Management and Catering Technology" (Duration is 2 Years, Eligibility is Pass in 10th Class)
   - "Bachelor of Hotel Management & Catering Technology (BHMCT)" (Duration is 3 Years, Eligibility is Pass in 10+2 with any stream/discipline)
   - "Bachelor of Business Administration (BBA)" (Duration is 3 Years, Eligibility is Pass in 10+2 with any stream/discipline)
   - "Diploma in Hotel Management (DHM)" (Duration is 1 Year, Eligibility is Pass in 10th Class)
   - "Post Graduate Diploma in Hotel Management (PGDHM) / Post Graduate Diploma in Tourism & Travel Management (PGDTTM)" (Duration is 1 Year, Eligibility is Pass in Degree/Graduation)
   - "Post Graduate Diploma in Business Management (PGDBM)" (Duration is 2 Years, Eligibility is Pass in Degree/Graduation)
4. Intercept "Talk to Counselor": If the student clicks "Talk to Counselor" or asks to speak with a human/counselor/call/phone, you MUST output this exact message:
   "Hey there! I would be absolutely delighted to connect you directly with our admissions panel. 📞✨

Please feel free to call us directly during working hours (9:00 AM - 5:00 PM) or write to us. Would you like to review our courses or start your application process?"
5. Intercept "Apply Now": If the student clicks "Apply Now" or asks to apply/register, you MUST provide:
   - Application Form Link: https://forms.gle/FxpcHjSCLLrkhZkPA
   - Explain the 2-step process (fill form, upload certificates, submit) and explicitly mention that there is NO fee to pay.
   - DO NOT suggest or include any Google Forms Setup/Form Name/Form Description instructions in the message as these are only for admins, not the student.
   - Keep your entire reply under 600 characters to ensure it successfully transmits through the Meta WhatsApp API.
6. Avoid Redundant Suggested Buttons:
   - If you are answering a query about Scholarships, do NOT include "Scholarships" in the suggested buttons.
   - If you are answering a query about Counselor/Helpline, do NOT include "Talk to Counselor" in the suggested buttons.
   - If you are answering a query about Application/Applying, do NOT include "Apply Now" in the suggested buttons.
7. Provide up to 3 suggested interactive quick-reply buttons. Each button MUST be strictly 20 characters or less.
    - If the student is asking about BBA or PGDBM, suggest ["BBA Details", "Placements Info", "Apply Now"].
    - If the student is asking about BHMCT, DHM, PGDHM, PGDTTM, or Intermediate, suggest ["BHMCT Details", "Placements Info", "Apply Now"].
    - If they ask about courses generally, suggest ["BHMCT Details", "BBA Details", "More Courses"].

You MUST return a JSON object in this exact format:
{
  "category": "Course Queries",
  "course": "BBA",
  "status": "Interested",
  "replyText": "Warm, natural, conversational response that is helpful and friendly...",
  "suggestedButtons": ["Explore Courses", "Placements Info", "Talk to Counselor"],
  "sendCourseImage": "bba" // String: Set strictly to "bba" if answering or providing details about BBA or PGDBM. Set strictly to "hotel" if answering or providing details about BHMCT, DHM, or PGDHM. Set to null otherwise.
}
`;

    // Reconstruct history formatting for Gemini
    const geminiHistory = history.map(h => ({
      role: h.role,
      parts: [{ text: h.parts.join('\n') }]
    }));

    const chat = model.startChat({
      history: geminiHistory,
      systemInstruction: systemPrompt
    });

    const responseResult = await chat.sendMessage(messageText);
    const replyJSONText = responseResult.response.text();
    
    let responseObj = { 
      replyText: '', 
      suggestedButtons: [] as string[],
      category: 'Course Queries',
      course: 'Undecided',
      status: 'Interested',
      sendCourseImage: null as string | null
    };
    try {
      responseObj = JSON.parse(replyJSONText);
    } catch (e) {
      console.error("Failed to parse reply JSON, falling back to text:", replyJSONText);
      responseObj = {
        replyText: replyJSONText,
        suggestedButtons: ["Explore Courses", "Scholarships", "Talk to Counselor"],
        category: 'Course Queries',
        course: 'Undecided',
        status: 'Interested',
        sendCourseImage: null
      };
    }

    // ==========================================
    // 2. Programmatic Button Redundancy Pruner
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
      const candidates = ["Explore Courses", "Apply Now", "Placements Info", "Talk to Counselor"];
      
      for (const cand of candidates) {
        if (uniqueButtons.size >= 3) break;
        
        const lowerCand = cand.toLowerCase();
        // Check if candidate would be redundant in this context
        if ((lowerQuery.includes('placement') || lowerReply.includes('placement')) && lowerCand.includes('placement')) continue;
        if ((lowerQuery.includes('counselor') || lowerQuery.includes('contact') || lowerQuery.includes('talk to') || lowerReply.includes('helpline')) && (lowerCand.includes('counselor') || lowerCand.includes('talk to'))) continue;
        if ((lowerQuery.includes('apply') || lowerQuery.includes('form') || lowerReply.includes('forms.gle') || lowerReply.includes('forms.gle/')) && lowerCand.includes('apply')) continue;
        
        uniqueButtons.add(cand);
      }
      
      responseObj.suggestedButtons = Array.from(uniqueButtons).slice(0, 3);
    }

    return {
      replyText: stripGoogleFormsSetup(responseObj.replyText),
      suggestedButtons: responseObj.suggestedButtons || [],
      category: responseObj.category || 'Course Queries',
      course: responseObj.course || 'Undecided',
      status: responseObj.status || 'Interested',
      sendCourseImage: responseObj.sendCourseImage || null
    };

  } catch (error: any) {
    console.error("Gemini API failed, falling back to Offline Fallback Engine:", error.message);
    const offlineResult = generateOfflineReply(messageText);
    return offlineResult;
  }
}
