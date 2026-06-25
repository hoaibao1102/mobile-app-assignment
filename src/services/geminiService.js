const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY;

const FALLBACK_RESPONSES = [
  "I am Aura, your personal luxury fashion consultant. I'm here to help you select a handbag or coordinate it with your outfit. Let me know if you would like to explore our collection!",
  "As the boutique's styling assistant, I'd love to help you find the perfect bag from our inventory. What category or brand are you looking for today?",
  "I'm currently having a brief connection issue, but I'm always ready to give handbag advice. Feel free to browse our products or locate our nearest store in District 1, Hoan Kiem, or Da Nang!"
];

export function classifyIntent(message) {
  if (!message) return 'fashion_related';
  const msg = message.toLowerCase().trim();

  // Handbags, stores, and general boutique features
  const fashionKeywords = [
    'bag', 'túi', 'handbag', 'balo', 'wallet', 'bóp', 'ví', 'card', 'holder',
    'price', 'giá', 'cost', 'đắt', 'rẻ', 'cheap', 'expensive', 'money', 'dollar', 'vnd',
    'brand', 'nhãn hiệu', 'hiệu', 'hãng', 'bvlgari', 'michael kors', 'burberry', 'ferragamo', 'fendi',
    'material', 'chất liệu', 'da', 'leather', 'canvas', 'serpenti', 'monogram', 'tote',
    'rating', 'đánh giá', 'sao', 'review', 'comment', 'feedback',
    'store', 'cửa hàng', 'địa chỉ', 'address', 'bản đồ', 'map', 'locator', 'vị trí', 'location',
    'style', 'phối', 'mặc', 'outfit', 'quần áo', 'đầm', 'váy', 'suit', 'giày', 'color', 'màu',
    'tiệc', 'party', 'wedding', 'cưới', 'work', 'đi làm', 'chơi', 'travel', 'du lịch', 'sport',
    'quà', 'gift', 'tặng', 'present'
  ];

  // Specific people or personas
  const personKeywords = [
    'messi', 'ronaldo', 'taylor', 'swift', 'mẹ', 'mom', 'girlfriend', 'bạn gái', 'bạn trai', 'boyfriend', 'chồng', 'vợ', 'sếp', 'boss', 'ai', 'who', 'người', 'husband', 'wife'
  ];

  const containsKeyword = (keywords) => keywords.some(kw => msg.includes(kw));

  if (containsKeyword(personKeywords)) {
    return 'person_styling';
  }
  if (containsKeyword(fashionKeywords)) {
    return 'fashion_related';
  }
  return 'unrelated';
}

export async function askGemini(message, imageBase64, productsList = []) {
  const intent = classifyIntent(message);

  // If the user question is completely unrelated, we can construct a tailored redirecting query for Gemini,
  // or return an offline fallback if the API is down.
  if (!GEMINI_API_KEY) {
    console.warn("Gemini API key is not configured. Please set EXPO_PUBLIC_GEMINI_API_KEY in your .env file.");
    if (intent === 'unrelated') {
      return "I'm Aura, your boutique AI stylist. I can only assist with styling advice and handbags. Let's find you a perfect luxury bag!";
    }
    return FALLBACK_RESPONSES[0];
  }

  // Inject inventory database into system prompt
  const inventoryText = productsList.length > 0
    ? productsList.map(p => `- [ID: ${p.id}] ${p.brand} ${p.handbagName} (${p.category}) - Color: ${p.color?.join(', ')}, Price: $${p.cost}`).join('\n')
    : "Currently no inventory list is available.";

  const systemInstructions = `You are "Aura", the Elite AI Fashion Stylist and Product Consultant for our Luxury Handbag Boutique.
Your goals are to:
- Guide the user in selecting the perfect handbag based on their questions, style preferences, outfit descriptions, or outfit photos.
- Provide detailed comparisons between different handbags in our boutique (comparing details like prices, styles, colors, and suitability) when the user asks or is undecided between options.

INTENT DIRECTIVES:
1. BOUTIQUE INVENTORY & SERVICE: For inquiries about handbag brands, materials, prices, ratings, or boutique locations, consult the inventory list below.
2. INDIRECT STYLE REQUESTS (e.g. Messi, Ronaldo, Taylor Swift): If asked what handbag matches a celebrity or specific person, analyze their public style (e.g. Messi is an athletic, casual yet highly elegant figure who prefers comfort, clean lines, and premium leather). Suggest matching unisex or minimalist bags/holders from our inventory (such as Fendi Peekaboo Mini, Bvlgari Card Holder, or Burberry Shield).
3. UNRELATED QUERIES: If the user asks about general knowledge, programming, math, science, history, weather, etc., that is NOT related to handbags, fashion, outfits, or our stores, you MUST politely decline to answer, state that you are Aura (the AI stylist), and redirect them back to handbags, styling, or finding our nearest store. Do not answer their unrelated questions directly.

RULES:
1. Be extremely polite, professional, and knowledgeable about fashion and luxury handbags.
2. If the user uploads a photo of an outfit, analyze its style, colors, and formality, then suggest matching handbags.
3. You MUST recommend real handbags from our boutique inventory listed below. Use their brand, name, color, and price.
4. Do NOT invent product names that are not in our list.
5. Keep your styling recommendations concise and fashionable, limiting recommendations to 2 or 3 bags maximum. Refer to bags by name and brand.
6. When comparing bags, present the comparison in a clean, structured bullet-point format, highlighting prices, styles, colors, and suitability. Only compare bags that exist in the inventory below.
7. Ensure the chatbot never crashes. If inventory is empty or unavailable, still assist user gracefully using general style advice.

OUR BOUTIQUE INVENTORY:
${inventoryText}`;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;

  const parts = [];
  
  // Text message
  parts.push({ text: message || "Analyze my outfit and suggest matching handbags from the inventory." });

  // Outfit Image if attached
  if (imageBase64) {
    parts.push({
      inlineData: {
        mimeType: "image/jpeg",
        data: imageBase64
      }
    });
  }

  const requestBody = {
    contents: [
      {
        parts: parts
      }
    ],
    systemInstruction: {
      parts: [
        { text: systemInstructions }
      ]
    }
  };

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errData = await response.json();
      console.log("Gemini API Error details:", errData);
      throw new Error(errData?.error?.message || "HTTP generative request failed");
    }

    const data = await response.json();
    const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    return reply || FALLBACK_RESPONSES[0];
  } catch (error) {
    console.error("askGemini error:", error);
    if (intent === 'unrelated') {
      return "I'm Aura, your boutique AI stylist. I can only assist with styling advice and handbags. Let's find you a perfect luxury bag!";
    }
    return FALLBACK_RESPONSES[Math.floor(Math.random() * FALLBACK_RESPONSES.length)];
  }
}
