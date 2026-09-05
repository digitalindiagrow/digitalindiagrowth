/* ===================================================================
   Grow AI — Digital India Grow chatbot configuration
   (drives the real Smart AI Bot widget: ai-chat-widget.js)

   👉 TO MAKE THE AI ANSWER: paste your FREE Groq API key below in
      apiKey (get one at https://console.groq.com/keys). Without a key
      the chat UI still shows, but the AI won't reply.
   =================================================================== */
window.AIChatConfig = {
  businessName: "Digital India Grow",
  industry: "AI-powered websites, chatbots and digital marketing — SEO, Google & Meta Ads, and graphic design",
  whatsapp: "919871031423",
  phone: "+91 9871031423",
  email: "hello@digitalindiagrow.com",
  address: "Burari, New Delhi, Delhi",
  hours: "Mon–Sat, 10:00 AM – 7:00 PM",

  greeting: "Hi! 👋 I'm Digital India Grow's assistant. Ask me anything — about our websites, AI chatbots, SEO, ads or graphic design.",
  quickReplies: ["Our services", "SEO", "Google & Meta Ads", "Pricing"],
  launcherLabel: "Chat with us",

  icon: "robot",
  brandColor: "#5c20e7",
  brandColor2: "#ff5d19",   // violet → orange gradient (matches the site theme)

  language: "auto",          // replies in English, Hindi or Hinglish to match the visitor
  strictness: "hybrid",      // answers from this site's content + general help
  leadCapture: true,
  leadAfter: 3,

  voice: true,               // 🎤 mic button — opens on phone (needs HTTPS) + Groq key to transcribe speech
  voiceOnly: false,          // set true for phones = one big mic, no typing box

  // 👇 Paste your free Google Gemini key here to switch the AI on
  //    Get one free at https://aistudio.google.com/apikey  (starts with "AIza…")
  provider: "gemini",
  model: "gemini-flash-lite-latest",   // fast (~1s) + won't get retired (alias). Was gemini-3.6-flash (thinking model, ~38s)
  apiKey: "AQ.Ab8RN6Lukjk-u5mrNu2v76WLhM10nH33KYJaBdxMHIyAAEWr1g"
};
