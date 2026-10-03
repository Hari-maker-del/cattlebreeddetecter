import type { CopilotResult } from "./livestock-copilot";

export type RegionalLanguage =
  | "en-IN" | "hi-IN" | "ta-IN" | "ta-Tanglish" | "te-IN" | "kn-IN" | "ml-IN" | "mr-IN"
  | "bn-IN" | "gu-IN" | "pa-IN" | "or-IN" | "as-IN" | "ur-IN" | "bho-IN" | "mai-IN"
  | "kok-IN" | "ks-IN" | "ne-IN" | "sd-IN" | "sa-IN" | "sat-IN" | "doi-IN" | "mni-IN";

const labels: Record<RegionalLanguage, Record<string, string>> = {
  "en-IN": { animals: "Your animals", milk: "Milk production", health: "Health observations", feed: "Recent feed records", breeding: "Breeding records", saved: "Your saved animals", copilot: "Livestock Copilot", no: "No records found." },
  "hi-IN": { animals: "आपके पशु", milk: "दूध उत्पादन", health: "स्वास्थ्य रिकॉर्ड", feed: "हाल के चारा रिकॉर्ड", breeding: "प्रजनन रिकॉर्ड", saved: "आपके सेव किए गए पशु", copilot: "पशुधन सहायक", no: "कोई रिकॉर्ड नहीं मिला।" },
  "ta-IN": { animals: "உங்கள் கால்நடைகள்", milk: "பால் உற்பத்தி", health: "உடல்நிலை பதிவுகள்", feed: "சமீபத்திய தீவன பதிவுகள்", breeding: "இனப்பெருக்க பதிவுகள்", saved: "சேமித்த கால்நடைகள்", copilot: "கால்நடை Copilot", no: "எந்த பதிவும் கிடைக்கவில்லை." },
  "ta-Tanglish": { animals: "Unga kaalnadaigal", milk: "Paal urpathi", health: "Udalnilai records", feed: "Recent theevana records", breeding: "Inapperukka records", saved: "Save pannina animals", copilot: "Livestock Copilot", no: "Endha record-um kidaikkala." },
  "te-IN": { animals: "మీ పశువులు", milk: "పాల ఉత్పత్తి", health: "ఆరోగ్య రికార్డులు", feed: "ఇటీవలి మేత రికార్డులు", breeding: "సంతానోత్పత్తి రికార్డులు", saved: "మీ సేవ్ చేసిన పశువులు", copilot: "పశుసంవర్ధక Copilot", no: "రికార్డులు కనుగొనబడలేదు." },
  "kn-IN": { animals: "ನಿಮ್ಮ ಜಾನುವಾರುಗಳು", milk: "ಹಾಲಿನ ಉತ್ಪಾದನೆ", health: "ಆರೋಗ್ಯ ದಾಖಲೆಗಳು", feed: "ಇತ್ತೀಚಿನ ಮೇವು ದಾಖಲೆಗಳು", breeding: "ಸಂತಾನೋತ್ಪತ್ತಿ ದಾಖಲೆಗಳು", saved: "ಉಳಿಸಿದ ಜಾನುವಾರುಗಳು", copilot: "ಜಾನುವಾರು Copilot", no: "ಯಾವುದೇ ದಾಖಲೆಗಳು ಕಂಡುಬಂದಿಲ್ಲ." },
  "ml-IN": { animals: "നിങ്ങളുടെ കന്നുകാലികൾ", milk: "പാൽ ഉൽപ്പാദനം", health: "ആരോഗ്യ രേഖകൾ", feed: "സമീപകാല തീറ്റ രേഖകൾ", breeding: "പ്രജനന രേഖകൾ", saved: "സംരക്ഷിച്ച കന്നുകാലികൾ", copilot: "കന്നുകാലി Copilot", no: "രേഖകളൊന്നും കണ്ടെത്തിയില്ല." },
  "mr-IN": { animals: "तुमची जनावरे", milk: "दूध उत्पादन", health: "आरोग्य नोंदी", feed: "अलीकडील चारा नोंदी", breeding: "प्रजनन नोंदी", saved: "सेव्ह केलेली जनावरे", copilot: "पशुधन Copilot", no: "कोणत्याही नोंदी सापडल्या नाहीत." },
  "bn-IN": { animals: "আপনার পশু", milk: "দুধ উৎপাদন", health: "স্বাস্থ্য রেকর্ড", feed: "সাম্প্রতিক খাদ্য রেকর্ড", breeding: "প্রজনন রেকর্ড", saved: "সংরক্ষিত পশু", copilot: "পশু Copilot", no: "কোনো রেকর্ড পাওয়া যায়নি।" },
  "gu-IN": { animals: "તમારા પશુઓ", milk: "દૂધ ઉત્પાદન", health: "આરોગ્ય રેકોર્ડ", feed: "તાજેતરના ચારા રેકોર્ડ", breeding: "પ્રજનન રેકોર્ડ", saved: "સેવ કરેલા પશુઓ", copilot: "પશુ Copilot", no: "કોઈ રેકોર્ડ મળ્યો નથી." },
  "pa-IN": { animals: "ਤੁਹਾਡੇ ਪਸ਼ੂ", milk: "ਦੁੱਧ ਉਤਪਾਦਨ", health: "ਸਿਹਤ ਰਿਕਾਰਡ", feed: "ਹਾਲੀਆ ਚਾਰੇ ਦੇ ਰਿਕਾਰਡ", breeding: "ਪ੍ਰਜਨਨ ਰਿਕਾਰਡ", saved: "ਸੇਵ ਕੀਤੇ ਪਸ਼ੂ", copilot: "ਪਸ਼ੂ Copilot", no: "ਕੋਈ ਰਿਕਾਰਡ ਨਹੀਂ ਮਿਲਿਆ।" },
  "or-IN": { animals: "ଆପଣଙ୍କ ପଶୁ", milk: "କ୍ଷୀର ଉତ୍ପାଦନ", health: "ସ୍ୱାସ୍ଥ୍ୟ ରେକର୍ଡ", feed: "ସାମ୍ପ୍ରତିକ ଚାରା ରେକର୍ଡ", breeding: "ପ୍ରଜନନ ରେକର୍ଡ", saved: "ସେଭ୍ ହୋଇଥିବା ପଶୁ", copilot: "ପଶୁ Copilot", no: "କୌଣସି ରେକର୍ଡ ମିଳିଲା ନାହିଁ।" },
  "as-IN": { animals: "আপোনাৰ পশু", milk: "গাখীৰ উৎপাদন", health: "স্বাস্থ্য ৰেকৰ্ড", feed: "শেহতীয়া খাদ্যৰ ৰেকৰ্ড", breeding: "প্ৰজনন ৰেকৰ্ড", saved: "সংৰক্ষিত পশু", copilot: "পশু Copilot", no: "কোনো ৰেকৰ্ড পোৱা নগ'ল।" },
  "ur-IN": { animals: "آپ کے مویشی", milk: "دودھ کی پیداوار", health: "صحت کے ریکارڈ", feed: "حالیہ چارے کے ریکارڈ", breeding: "افزائش کے ریکارڈ", saved: "محفوظ مویشی", copilot: "مویشی Copilot", no: "کوئی ریکارڈ نہیں ملا۔" },
  "bho-IN": { animals: "रउरा के पशु", milk: "दूध के उत्पादन", health: "पशु के स्वास्थ्य रिकॉर्ड", feed: "हाल के चारा रिकॉर्ड", breeding: "प्रजनन के रिकॉर्ड", saved: "सहेजल पशु", copilot: "पशुधन सहायक", no: "कवनो रिकॉर्ड ना मिलल।" },
  "mai-IN": { animals: "अहाँक पशु", milk: "दूध उत्पादन", health: "स्वास्थ्य रिकॉर्ड", feed: "हालक चारा रिकॉर्ड", breeding: "प्रजनन रिकॉर्ड", saved: "सहेजल पशु", copilot: "पशुधन सहायक", no: "कोनो रिकॉर्ड नहि भेटल।" },
  "kok-IN": { animals: "तुमचे जनावरां", milk: "दूध उत्पादन", health: "आरोग्य नोंदी", feed: "अलीकडचे चारेचे नोंदी", breeding: "प्रजनन नोंदी", saved: "जतन केल्ले जनावरां", copilot: "पशुधन सहाय्यक", no: "नोंद मेळ्ळी ना." },
  "ks-IN": { animals: "تُہند مال", milk: "دۄدھ پیداوار", health: "صحت ریکارڈ", feed: "حالیہ چارہ ریکارڈ", breeding: "نسل افزائش ریکارڈ", saved: "محفوظ مال", copilot: "مویشی معاون", no: "کانٛہہ ریکارڈ نہٕ مٮ۪ل۔" },
  "ne-IN": { animals: "तपाईंका पशु", milk: "दूध उत्पादन", health: "स्वास्थ्य विवरण", feed: "हालका दाना विवरण", breeding: "प्रजनन विवरण", saved: "सुरक्षित पशु", copilot: "पशुधन सहायक", no: "कुनै विवरण भेटिएन।" },
  "sd-IN": { animals: "توهان جا مال", milk: "کير جي پيداوار", health: "صحت جا رڪارڊ", feed: "تازا چاري جا رڪارڊ", breeding: "نسل وڌائڻ جا رڪارڊ", saved: "محفوظ مال", copilot: "مالوند مددگار", no: "ڪو رڪارڊ نه مليو." },
  "sa-IN": { animals: "भवतः पशवः", milk: "दुग्धोत्पादनम्", health: "स्वास्थ्यलेखाः", feed: "नूतनाः पश्वाहारलेखाः", breeding: "प्रजननलेखाः", saved: "सुरक्षितपशवः", copilot: "पशुधनसहायकः", no: "कश्चित् लेखः न प्राप्तः।" },
  "sat-IN": { animals: "आमाक् जा़नवर", milk: "दा़क् ओजोग", health: "जा़नवर रेयाक् सुस्थता", feed: "नावा जोम रेकॉर्ड", breeding: "बंश बढ़ाव रेकॉर्ड", saved: "जतन जा़नवर", copilot: "जा़नवर मददगार", no: "जाहान रेकॉर्ड बाय मेनाः।" },
  "doi-IN": { animals: "तुंदे पशु", milk: "दुद्ध दी पैदावार", health: "सेहत दे रिकार्ड", feed: "हाल दे चारे दे रिकार्ड", breeding: "प्रजनन दे रिकार्ड", saved: "सांभरे दे पशु", copilot: "पशुधन सहायक", no: "कोई रिकार्ड नेईं मिलेआ।" },
  "mni-IN": { animals: "নখোইগী পশু", milk: "চাগী উৎপাদন", health: "অরোগ্য রেকর্ড", feed: "নুংশি ফুড রেকর্ড", breeding: "প্রজনন রেকর্ড", saved: "সেভ তৌবা পশু", copilot: "পশু সহায়ক", no: "রেকর্ড অমত্তা ফংদে।" },
};

export function localizeRegionalResult(result: CopilotResult, language: RegionalLanguage): CopilotResult {
  const c = labels[language] ?? labels["en-IN"];
  const titleMap: Record<string, keyof typeof c> = {
    "Your animals": "animals", "Milk production": "milk", "Lower milk records": "milk", "Health observations": "health",
    "Recent feed records": "feed", "Breeding records": "breeding", "Your saved animals": "saved", "Livestock Copilot": "copilot",
  };
  let text = result.text;
  text = text.replace(/No milk records for that period yet\./g, c.no).replace(/No health observations yet\./g, c.no).replace(/No feed records yet\./g, c.no).replace(/No breeding records yet\./g, c.no).replace(/No animals are saved yet\. Analyze an animal to add your first one\./g, c.no);
  return { ...result, title: c[titleMap[result.title] ?? "copilot"], text };
}
