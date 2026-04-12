/**
 * SAGE - Data
 * Constants and content
 */

const ASSISTANT_RESPONSES = {
    en: {
        default: "I'm here to help! Try asking me things like: 'How do I make a video call?' or 'What is UPI?'",
        'video call': "To make a video call on WhatsApp: 1) Open WhatsApp, 2) Select a contact, 3) Tap the video camera icon at the top. Make sure you allow camera and microphone access when asked.",
        'upi': "UPI is Unified Payments Interface. It lets you send money from your bank using apps like Google Pay or PhonePe. You need to link your bank account and create a UPI ID.",
        'whatsapp': "WhatsApp is a messaging app. You can send text messages, photos, and make voice or video calls. Download it from the Play Store or App Store.",
        'scam': "Be careful! Never share your OTP, PIN, or bank details with anyone. Banks never ask for these over call or message. When in doubt, contact your bank directly.",
        'password': "Never share your password with anyone. Use a strong password with letters, numbers, and symbols. Don't use the same password for all apps.",
    },
    hi: {
        default: "मैं मदद के लिए यहाँ हूँ! पूछें: 'वीडियो कॉल कैसे करें?' या 'यूपीआई क्या है?'",
        'video call': "व्हाट्सएप पर वीडियो कॉल के लिए: 1) व्हाट्सएप खोलें, 2) संपर्क चुनें, 3) ऊपर वाले वीडियो कैमरा आइकन पर टैप करें।",
        'वीडियो कॉल': "व्हाट्सएप पर वीडियो कॉल के लिए: 1) व्हाट्सएप खोलें, 2) संपर्क चुनें, 3) ऊपर वाले वीडियो कैमरा आइकन पर टैप करें।",
        वीडियो: "व्हाट्सएप पर वीडियो कॉल के लिए: 1) व्हाट्सएप खोलें, 2) संपर्क चुनें, 3) ऊपर वाले वीडियो कैमरा आइकन पर टैप करें।",
        'upi': "यूपीआई यूनिफाइड पेमेंट इंटरफेस है। Google Pay या PhonePe जैसे ऐप से पैसे भेज सकते हैं। बैंक खाता लिंक करना होगा।",
        यूपीआई: "यूपीआई यूनिफाइड पेमेंट इंटरफेस है। Google Pay या PhonePe जैसे ऐप से पैसे भेज सकते हैं। बैंक खाता लिंक करना होगा।",
        यूपी: "यूपीआई यूनिफाइड पेमेंट इंटरफेस है। Google Pay या PhonePe जैसे ऐप से पैसे भेज सकते हैं। बैंक खाता लिंक करना होगा।",
        'whatsapp': "व्हाट्सएप एक मैसेजिंग ऐप है। टेक्स्ट, फोटो भेज सकते हैं और वॉयस या वीडियो कॉल कर सकते हैं।",
        व्हाट्सएप: "व्हाट्सएप एक मैसेजिंग ऐप है। टेक्स्ट, फोटो भेज सकते हैं और वॉयस या वीडियो कॉल कर सकते हैं।",
        'scam': "सावधान! अपना OTP, PIN या बैंक विवरण किसी के साथ साझा न करें। बैंक कभी फोन पर यह नहीं मांगते।",
        स्कैम: "सावधान! अपना OTP, PIN या बैंक विवरण किसी के साथ साझा न करें। बैंक कभी फोन पर यह नहीं मांगते।",
        'password': "अपना पासवर्ड किसी के साथ साझा न करें। मजबूत पासवर्ड इस्तेमाल करें।",
        पासवर्ड: "अपना पासवर्ड किसी के साथ साझा न करें। मजबूत पासवर्ड इस्तेमाल करें।",
    }
};

const SCAM_KEYWORDS = [
    'urgent', 'verify', 'suspended', 'blocked', 'click here', 'congratulations',
    'winner', 'prize', 'free gift', 'lottery', 'claim now', 'act now', 'expires',
    'otp', 'password', 'account', 'update now', 'kyc', 'pan card', 'aadhaar',
    'bank account', 'transfer', 'refund', 'gov.in', 'income tax', 'nigerian',
    'prince', 'inheritance', 'cash reward', 'urgent action', 'verify your',
    'your account has been', 'suspended', 'unusual activity', 'confirm your identity'
];

const LEARNING_CONTENT = {
    smartphone: {
        en: {
            title: "Smartphone Basics",
            content: `<p>Getting started with your smartphone:</p>
                <ol>
                    <li><strong>Unlock:</strong> Swipe up or enter your PIN/pattern</li>
                    <li><strong>Home screen:</strong> Tap apps to open them</li>
                    <li><strong>Back button:</strong> Returns you to the previous screen</li>
                    <li><strong>Volume:</strong> Use the side buttons to adjust sound</li>
                    <li><strong>Charging:</strong> Connect the charger to the bottom port</li>
                </ol>
                <p>Tip: Keep your screen brightness comfortable and use the torch/flashlight from the quick settings.</p>`
        },
        hi: {
            title: "स्मार्टफोन मूल बातें",
            content: `<p>अपने स्मार्टफोन से शुरुआत:</p>
                <ol>
                    <li><strong>अनलॉक:</strong> ऊपर स्वाइप करें या PIN दर्ज करें</li>
                    <li><strong>होम स्क्रीन:</strong> ऐप खोलने के लिए टैप करें</li>
                    <li><strong>बैक बटन:</strong> पिछली स्क्रीन पर लौटें</li>
                    <li><strong>वॉल्यूम:</strong> साइड बटन से आवाज़ समायोजित करें</li>
                </ol>`
        }
    },
    whatsapp: {
        en: {
            title: "WhatsApp & Video Calls",
            content: `<p>Using WhatsApp:</p>
                <ol>
                    <li><strong>Install:</strong> Download from Play Store or App Store</li>
                    <li><strong>Register:</strong> Use your phone number and verify with OTP</li>
                    <li><strong>Chat:</strong> Tap a contact to send messages</li>
                    <li><strong>Voice call:</strong> Tap the phone icon in a chat</li>
                    <li><strong>Video call:</strong> Tap the video camera icon</li>
                </ol>
                <p>Tip: You need internet (Wi-Fi or mobile data) for WhatsApp to work.</p>`
        },
        hi: {
            title: "व्हाट्सएप और वीडियो कॉल",
            content: `<p>व्हाट्सएप का उपयोग:</p>
                <ol>
                    <li>प्ले स्टोर से डाउनलोड करें</li>
                    <li>फोन नंबर से रजिस्टर करें</li>
                    <li>संपर्क पर टैप करके चैट करें</li>
                    <li>वीडियो कॉल के लिए वीडियो आइकन टैप करें</li>
                </ol>`
        }
    },
    upi: {
        en: {
            title: "UPI Payments",
            content: `<p>Making UPI payments safely:</p>
                <ol>
                    <li><strong>Setup:</strong> Download Google Pay, PhonePe, or your bank's app</li>
                    <li><strong>Link bank:</strong> Add your bank account with debit card details</li>
                    <li><strong>Create UPI ID:</strong> Usually yourname@bankname</li>
                    <li><strong>Send money:</strong> Enter amount and recipient's UPI ID or phone</li>
                    <li><strong>Verify:</strong> Always check the recipient name before confirming</li>
                </ol>
                <p>⚠️ Never share your UPI PIN with anyone. Banks never ask for it.</p>`
        },
        hi: {
            title: "यूपीआई भुगतान",
            content: `<p>सुरक्षित यूपीआई भुगतान:</p>
                <ol>
                    <li>Google Pay या PhonePe डाउनलोड करें</li>
                    <li>बैंक खाता लिंक करें</li>
                    <li>UPI ID बनाएं</li>
                    <li>भुगतान से पहले प्राप्तकर्ता की जाँच करें</li>
                </ol>
                <p>⚠️ अपना UPI PIN कभी साझा न करें।</p>`
        }
    },
    safety: {
        en: {
            title: "Online Safety",
            content: `<p>Stay safe online:</p>
                <ol>
                    <li><strong>Never share:</strong> OTP, PIN, password, Aadhaar/PAN photos</li>
                    <li><strong>Verify calls:</strong> If someone says they're from a bank, hang up and call the number on your card</li>
                    <li><strong>Links:</strong> Don't click suspicious links in SMS or WhatsApp</li>
                    <li><strong>Too good to be true:</strong> Prizes, lottery wins, urgent refunds are often scams</li>
                    <li><strong>Report:</strong> Forward scam messages to 7726 (Cyber Crime helpline)</li>
                </ol>`
        },
        hi: {
            title: "ऑनलाइन सुरक्षा",
            content: `<p>ऑनलाइन सुरक्षित रहें:</p>
                <ol>
                    <li>OTP, PIN, पासवर्ड कभी साझा न करें</li>
                    <li>बैंक का दावा करने वाले फोन पर भरोसा न करें – कार्ड पर नंबर से वापस कॉल करें</li>
                    <li>संदिग्ध लिंक पर क्लिक न करें</li>
                    <li>स्कैम की रिपोर्ट 7726 पर फॉरवर्ड करें</li>
                </ol>`
        }
    },
    government: {
        en: {
            title: "Government Services",
            content: `<p>Accessing government services online:</p>
                <ol>
                    <li><strong>DigiLocker:</strong> Store documents like Aadhaar, PAN digitally</li>
                    <li><strong>UMANG:</strong> One app for many govt services (pension, ration, etc.)</li>
                    <li><strong>PM-Kisan:</strong> Check farmer scheme benefits</li>
                    <li><strong>PMGDISHA:</strong> Free digital literacy courses</li>
                </ol>
                <p>Official sites use .gov.in – be careful of fake .com versions.</p>`
        },
        hi: {
            title: "सरकारी सेवाएं",
            content: `<p>ऑनलाइन सरकारी सेवाएं:</p>
                <ol>
                    <li><strong>DigiLocker:</strong> आधार, पैन जैसे दस्तावेज डिजिटल रखें</li>
                    <li><strong>UMANG:</strong> कई सरकारी सेवाओं के लिए एक ऐप</li>
                    <li><strong>PMGDISHA:</strong> मुफ्त डिजिटल साक्षरता पाठ्यक्रम</li>
                </ol>
                <p>आधिकारिक साइटें .gov.in इस्तेमाल करती हैं।</p>`
        }
    }
};
