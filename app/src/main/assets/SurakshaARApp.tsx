import React, { useState, useEffect } from 'react';
import {
  Flame,
  Gauge,
  HardHat,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  QrCode,
  Download,
  Languages,
  LogOut,
  User,
  ShieldCheck,
  ChevronRight,
  RefreshCw,
  WifiOff,
  Sparkles,
  ArrowLeft,
  Award,
  Database,
  Camera,
  Crosshair
} from 'lucide-react';
import { ARFireResponseAssistant } from './ARFireResponseAssistant';

// ==========================================
// 1. DATA MODELS & TYPES
// ==========================================

export type Language = 'en' | 'hi' | 'sat';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  trade: string;
  isOffline: boolean;
  avatarUrl?: string;
}

export interface SafetyModule {
  id: string;
  title: Record<Language, string>;
  subtitle: Record<Language, string>;
  category: 'FIRE' | 'GAS' | 'PPE';
  icon: React.ComponentType<{ className?: string }>;
  accentColor: string;
  badge: string;
  questions: AssessmentQuestion[];
}

export interface AssessmentQuestion {
  id: number;
  question: Record<Language, string>;
  options: Record<Language, string>[];
  correctIndex: number;
  explanation: Record<Language, string>;
}

export interface CertificateData {
  certId: string;
  traineeName: string;
  workerId: string;
  courseName: string;
  score: number;
  percentage: number;
  issueDate: string;
  verificationUrl: string;
}

// ==========================================
// 2. LOCAL OFFLINE STORAGE (MOCK SQLITE)
// ==========================================

const OFFLINE_DB_KEYS = {
  USERS: 'suraksha_offline_users_seed',
  ASSESSMENTS: 'suraksha_offline_assessments',
  CURRENT_USER: 'suraksha_current_user'
};

const OfflineStorageService = {
  saveOfflineUser: (user: UserProfile): void => {
    try {
      const existing = JSON.parse(localStorage.getItem(OFFLINE_DB_KEYS.USERS) || '[]');
      existing.push({ ...user, savedAt: new Date().toISOString() });
      localStorage.setItem(OFFLINE_DB_KEYS.USERS, JSON.stringify(existing));
    } catch {
      // Fallback in memory
    }
  },
  getCurrentUser: (): UserProfile | null => {
    try {
      const data = localStorage.getItem(OFFLINE_DB_KEYS.CURRENT_USER);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },
  setCurrentUser: (user: UserProfile | null): void => {
    try {
      if (user) {
        localStorage.setItem(OFFLINE_DB_KEYS.CURRENT_USER, JSON.stringify(user));
      } else {
        localStorage.removeItem(OFFLINE_DB_KEYS.CURRENT_USER);
      }
    } catch {
      // Storage unavailable
    }
  }
};

// ==========================================
// 3. MOCK VERIFICATION ENDPOINT
// ==========================================

export async function verifyCertificateApi(certId: string): Promise<{
  status: 'VALID' | 'REVOKED';
  trainee: string;
  course: string;
  score: string;
  issuedAt: string;
}> {
  // Simulate network latency
  await new Promise(resolve => setTimeout(resolve, 600));
  return {
    status: 'VALID',
    trainee: 'Rajesh Gope',
    course: 'Mine Fire, Gas Detector & PPE Drill (DGMS Reg 139)',
    score: '100%',
    issuedAt: new Date().toLocaleDateString()
  };
}

// ==========================================
// 4. CURATED SAFETY MODULES & DRILLS
// ==========================================

const SAFETY_MODULES: SafetyModule[] = [
  {
    id: 'module_fire',
    category: 'FIRE',
    icon: Flame,
    accentColor: 'amber',
    badge: 'DGMS Reg 139 & OSHA 1910.157',
    title: {
      en: 'Fire Safety & Evacuation',
      hi: 'अग्नि सुरक्षा एवं निकास ड्रिल',
      sat: 'ᱥᱮᱸᱜᱮᱞ ᱨᱩᱠᱷᱤᱭᱟᱹ ᱟᱨ ᱵᱟᱦᱨᱮ ᱩᱰᱩᱠ'
    },
    subtitle: {
      en: 'Electrical fire, fuel spill, and fire extinguisher P.A.S.S. protocol.',
      hi: 'विद्युत आग, ईंधन रिसाव, तथा अग्निशामक P.A.S.S. विधि।',
      sat: 'ᱵᱤᱡᱞᱤ ᱥᱮᱸᱜᱮᱞ ᱟᱨ P.A.S.S. ᱦᱚᱨᱟ᱾'
    },
    questions: [
      {
        id: 1,
        question: {
          en: 'What does the first "P" stand for in the P.A.S.S. fire protocol?',
          hi: 'P.A.S.S. अग्नि प्रोटोकॉल में पहले "P" का क्या अर्थ है?',
          sat: 'P.A.S.S. ᱨᱮ ᱯᱩᱭᱞᱩ "P" ᱨᱮᱭᱟᱜ ᱢᱮᱱᱮᱛ ᱪᱮᱫ?'
        },
        options: [
          { en: 'Press the lever', hi: 'लीवर दबाएं', sat: 'ᱞᱤᱵᱷᱟᱨ ᱫᱟᱵᱟᱣ' },
          { en: 'Pull the pin', hi: 'पिन खींचें (Pull the Pin)', sat: 'ᱯᱤᱱ ᱚᱨ ᱢᱮ' },
          { en: 'Point at flame top', hi: 'ज्वाला के शीर्ष पर इंगित करें', sat: 'ᱪᱮᱛᱟᱱ ᱨᱮ ᱫᱮᱠᱷᱟᱣ' },
          { en: 'Pass to buddy', hi: 'साथी को सौंपें', sat: 'ᱜᱟᱛᱮ ᱮᱢᱟᱭ' }
        ],
        correctIndex: 1,
        explanation: {
          en: 'Pull the pin unlocks the operating lever so the extinguishing agent can discharge.',
          hi: 'पिन खींचने से ऑपरेटिंग लीवर अनलॉक हो जाता है ताकि अग्निशामक गैस निकल सके।',
          sat: 'ᱯᱤᱱ ᱚᱨ ᱞᱮᱠᱷᱟᱱ ᱞᱤᱵᱷᱟᱨ ᱠᱷᱩᱞᱟᱹᱜᱼᱟ᱾'
        }
      },
      {
        id: 2,
        question: {
          en: 'Which fire extinguisher must NEVER be used on live electrical panels?',
          hi: 'जीवित विद्युत पैनल पर कौन सा अग्निशामक कभी उपयोग नहीं करना चाहिए?',
          sat: 'ᱵᱤᱡᱞᱤ ᱨᱮ ᱚᱠᱟ ᱥᱮᱸᱜᱮᱞ ᱤᱬᱤᱡ ᱵᱟᱝ ᱞᱟᱜᱟᱣ ᱞᱟᱹᱠᱛᱤᱭᱟ?'
        },
        options: [
          { en: 'CO2 Extinguisher', hi: 'CO2 अग्निशामक', sat: 'CO2 ᱜᱮᱥ' },
          { en: 'Dry Powder (ABC)', hi: 'ड्राई केमिकल पाउडर (ABC)', sat: 'ᱨᱚᱦᱚᱲ ᱜᱩᱸᱰᱟᱹ' },
          { en: 'Pressurized Water Type', hi: 'पानी/जल आधारित अग्निशामक', sat: 'ᱫᱟᱜ ᱟᱜ' },
          { en: 'Clean Agent Gas', hi: 'क्लीन एजेंट', sat: 'ᱠᱞᱤᱱ ᱮᱡᱮᱱᱴ' }
        ],
        correctIndex: 2,
        explanation: {
          en: 'Water conducts electricity, posing severe electrocution risk to the operator.',
          hi: 'पानी बिजली का सुचालक है, जिससे जानलेवा करंट लग सकता है।',
          sat: 'ᱫᱟᱜ ᱫᱚ ᱵᱤᱡᱞᱤ ᱪᱟᱞᱟᱣᱟᱭ, ᱠᱟᱨᱮᱱᱴ ᱵᱟᱡᱟᱣ ᱫᱟᱲᱮᱭᱟᱜᱼᱟ᱾'
        }
      },
      {
        id: 3,
        question: {
          en: 'If Exit A is engulfed in smoke (>380 ppm CO), what is the correct action?',
          hi: 'यदि निकास A धुएं से अवरुद्ध है (CO >380 ppm), तो सही कदम क्या है?',
          sat: 'ᱡᱩᱫᱤ Exit A ᱫᱷᱩᱶᱟᱹ ᱛᱮ ᱯᱮᱨᱮᱡ ᱟᱠᱟᱱᱟ, ᱮᱱᱠᱷᱟᱱ ᱪᱮᱫ ᱦᱚᱨᱟ?'
        },
        options: [
          { en: 'Rush through Exit A quickly', hi: 'निकास A से तेजी से दौड़ें', sat: 'Exit A ᱥᱮᱫ ᱫᱟᱹᱲ' },
          { en: 'Turn back and follow Lifeline to Exit B', hi: 'वापस मुड़ें और लाइफ़लाइन से निकास B जाएं', sat: 'ᱞᱟᱭᱤᱯᱷᱞᱟᱭᱤᱱ ᱯᱟᱸᱡᱟ ᱠᱟᱛᱮ Exit B ᱪᱟᱞᱟᱜ' },
          { en: 'Hide behind electrical panel', hi: 'पैनल के पीछे छिप जाएं', sat: 'ᱯᱮᱱᱮᱞ ᱛᱟᱭᱚᱢ ᱩᱠᱩ' },
          { en: 'Wait for shift end', hi: 'शिफ्ट खत्म होने का इंतजार करें', sat: 'ᱥᱤᱯᱷᱴ ᱪᱟᱵᱟ ᱛᱟᱺᱜᱤ' }
        ],
        correctIndex: 1,
        explanation: {
          en: 'Never enter blocked smoke-filled escapeways. Follow the illuminated intake lifeline to safe Exit B.',
          hi: 'धुएं से भरे ब्लॉक मार्ग में कभी प्रवेश न करें। सुरक्षित निकास B की ओर लाइफ़लाइन का पालन करें।',
          sat: 'ᱵᱚᱸᱫᱽ ᱰᱟᱦᱟᱨ ᱨᱮ ᱟᱞᱚᱢ ᱵᱚᱞᱚᱱᱟ, Exit B ᱥᱮᱫ ᱪᱟᱞᱟᱜ ᱢᱮ᱾'
        }
      },
      {
        id: 4,
        question: {
          en: 'What is the "A" in P.A.S.S.?',
          hi: 'P.A.S.S. में "A" का अर्थ क्या है?',
          sat: 'P.A.S.S. ᱨᱮ "A" ᱪᱮᱫ ᱠᱟᱱᱟ?'
        },
        options: [
          { en: 'Aim at the base of the fire', hi: 'आग की जड़ (आधार) पर निशाना साधें', sat: 'ᱥᱮᱸᱜᱮᱞ ᱵᱩᱰᱟᱹ ᱨᱮ ᱱᱤᱥᱟᱱᱟ' },
          { en: 'Ask for supervisor permission', hi: 'सुपरवाइज़र से पूछें', sat: 'ᱥᱟᱨ ᱠᱩᱞᱤ' },
          { en: 'Always run away', hi: 'हमेशा दूर भागें', sat: 'ᱥᱟᱺᱜᱤᱧ ᱫᱟᱹᱲ' },
          { en: 'Air ventilation check', hi: 'हवा की जांच', sat: 'ᱦᱚᱭ ᱧᱮᱞ' }
        ],
        correctIndex: 0,
        explanation: {
          en: 'Aim low at the fuel source base, not at the upper flames.',
          hi: 'लपटों पर नहीं, हमेशा आग के निचले आधार पर निशाना साधें।',
          sat: 'ᱞᱟᱛᱟᱨ ᱵᱩᱰᱟᱹ ᱨᱮ ᱱᱤᱥᱟᱱᱟ ᱞᱟᱹᱠᱛᱤᱭᱟ᱾'
        }
      },
      {
        id: 5,
        question: {
          en: 'What is the immediate first step upon discovering an underground fire?',
          hi: 'भूमिगत खदान में आग दिखने पर तत्काल पहला कदम क्या है?',
          sat: 'ᱠᱷᱟᱫᱟᱱ ᱨᱮ ᱥᱮᱸᱜᱮᱞ ᱧᱮᱞ ᱠᱟᱛᱮ ᱯᱩᱭᱞᱩ ᱪᱮᱫ ᱠᱟᱹᱢᱤ?'
        },
        options: [
          { en: 'Pack personal belongings', hi: 'अपना सामान पैक करें', sat: 'ᱡᱤᱱᱤᱥ ᱥᱟᱢᱵᱽᱲᱟᱣ' },
          { en: 'Raise the break-glass fire alarm', hi: 'फायर अलार्म बजाएं और सबको सतर्क करें', sat: 'ᱥᱟᱭᱨᱮᱱ ᱟᱨ ᱮᱞᱟᱨᱢ ᱵᱟᱡᱟᱣ' },
          { en: 'Take photos for social media', hi: 'फोटो खींचें', sat: 'ᱯᱷᱚᱴᱚ ᱛᱩᱞᱟᱹᱣ' },
          { en: 'Turn off mine lighting', hi: 'बत्ती बुझाएं', sat: 'ᱵᱟᱹᱛᱤ ᱤᱬᱤᱡ' }
        ],
        correctIndex: 1,
        explanation: {
          en: 'Raising the audible alarm triggers evacuation sirens and alerts the surface rescue station.',
          hi: 'अलार्म बजाने से सभी कामगारों और रेस्क्यू स्टेशन को तुरंत सूचना मिलती है।',
          sat: 'ᱮᱞᱟᱨᱢ ᱵᱟᱡᱟᱣ ᱞᱮᱠᱷᱟᱱ ᱥᱟᱱᱟᱢ ᱠᱚ ᱠᱷᱚᱵᱚᱨ ᱠᱚ ᱧᱟᱢᱟ᱾'
        }
      }
    ]
  },
  {
    id: 'module_gas',
    category: 'GAS',
    icon: Gauge,
    accentColor: 'emerald',
    badge: 'OSHA 1910.146 Confined Space',
    title: {
      en: 'Gas Safety & Atmospheric Sniffer',
      hi: 'गैस सुरक्षा एवं 4-गैस डिटेक्टर सिमुलेशन',
      sat: 'ᱜᱮᱥ ᱨᱩᱠᱷᱤᱭᱟᱹ ᱟᱨ ᱔-ᱜᱮᱥ ᱰᱤᱴᱮᱠᱴᱟᱨ'
    },
    subtitle: {
      en: 'Simulated multi-gas detector: O2, CH4, CO, H2S threshold alarms.',
      hi: 'O2, CH4, CO, H2S की खतरनाक सीमाओं की पहचान और अलार्म।',
      sat: 'O2, CH4, CO, H2S ᱜᱮᱥ ᱡᱚᱠᱷᱟ ᱟᱨ ᱦᱩᱥᱤᱭᱟᱹᱨ᱾'
    },
    questions: [
      {
        id: 1,
        question: {
          en: 'What is the safe atmospheric Oxygen (O2) percentage for entering a sump?',
          hi: 'सम्प/हौज में प्रवेश के लिए सुरक्षित ऑक्सीजन (O2) प्रतिशत क्या है?',
          sat: 'ᱥᱟᱢᱯ ᱨᱮ ᱵᱚᱞᱚᱱ ᱞᱟᱹᱜᱤᱫ ᱴᱷᱤᱠ Oxygen % ᱛᱤᱱᱟᱹᱜ?'
        },
        options: [
          { en: 'Below 16%', hi: '16% से कम', sat: '16% ᱠᱷᱚᱱ ᱠᱚᱢ' },
          { en: '19.5% to 23.5%', hi: '19.5% से 23.5% के बीच', sat: '19.5% ᱠᱷᱚᱱ 23.5%' },
          { en: 'Exactly 10%', hi: 'ठीक 10%', sat: '10%' },
          { en: 'Above 35%', hi: '35% से अधिक', sat: '35% ᱠᱷᱚᱱ ᱡᱟᱹᱥᱛᱤ' }
        ],
        correctIndex: 1,
        explanation: {
          en: 'OSHA & DGMS define safe entry atmosphere between 19.5% and 23.5% Oxygen.',
          hi: '19.5% से कम ऑक्सीजन जानलेवा दमघोंटू स्थिति पैदा करता है।',
          sat: '19.5% ᱠᱷᱚᱱ 23.5% O2 ᱫᱚ ᱥᱟᱹᱦᱤᱫ ᱛᱟᱦᱮᱸᱱᱟ᱾'
        }
      },
      {
        id: 2,
        question: {
          en: 'What is the explosive range (LEL - UEL) of Methane (CH4) gas in air?',
          hi: 'हवा में मीथेन (CH4) गैस की विस्फोटक सीमा क्या है?',
          sat: 'ᱦᱚᱭ ᱨᱮ ᱢᱤᱛᱷᱮᱱ (CH4) ᱨᱮᱭᱟᱜ ᱵᱚᱢᱵᱽ ᱦᱩᱭᱩᱜ ᱥᱤᱢᱟᱹ?'
        },
        options: [
          { en: '5% to 15%', hi: '5% से 15%', sat: '5% ᱠᱷᱚᱱ 15%' },
          { en: '0.1% to 1%', hi: '0.1% से 1%', sat: '0.1% ᱠᱷᱚᱱ 1%' },
          { en: '50% to 80%', hi: '50% से 80%', sat: '50% ᱠᱷᱚᱱ 80%' },
          { en: 'Non-flammable', hi: 'अज्वलनशील', sat: 'ᱵᱟᱝ ᱡᱩᱞᱩᱜᱼᱟ' }
        ],
        correctIndex: 0,
        explanation: {
          en: 'Methane forms an explosive firedamp mixture between 5% and 15% concentration.',
          hi: 'मीथेन 5% से 15% के बीच हवा में संपर्क में आने पर भयानक विस्फोट करता है।',
          sat: '5% ᱠᱷᱚᱱ 15% CH4 ᱫᱚ ᱟᱹᱰᱤ ᱵᱚᱛᱚᱨ ᱵᱚᱢᱵᱽ ᱠᱟᱱᱟ᱾'
        }
      },
      {
        id: 3,
        question: {
          en: 'Why must 4-gas testing be performed at top, middle, and bottom levels?',
          hi: 'गैस परीक्षण ऊपर, मध्य और तली तीनों स्तरों पर क्यों करना चाहिए?',
          sat: 'ᱜᱮᱥ ᱴᱮᱥᱴ ᱪᱮᱛᱟᱱ, ᱛᱟᱞᱟ, ᱞᱟᱛᱟᱨ ᱪᱮᱫᱟᱜ ᱦᱩᱭᱩᱜᱼᱟ?'
        },
        options: [
          { en: 'Only for device battery check', hi: 'सिर्फ बैटरी जांचने के लिए', sat: 'ᱵᱮᱴᱨᱤ ᱧᱮᱞ' },
          { en: 'Gases have different densities (CH4 is light, H2S is heavy)', hi: 'गैसों का घनत्व अलग होता है (CH4 हल्की, H2S भारी)', sat: 'ᱜᱮᱥ ᱨᱮᱭᱟᱜ ᱦᱟᱢᱟᱞ ᱵᱷᱮᱜᱟᱨ (CH4 ᱨᱟᱣᱟᱞ, H2S ᱦᱟᱢᱟᱞ)' },
          { en: 'To test temperature', hi: 'तापमान नापने हेतु', sat: 'ᱞᱚᱞᱚ ᱧᱮᱞ' },
          { en: 'It is optional', hi: 'यह अनिवार्य नहीं है', sat: 'ᱡᱟᱹᱨᱩᱨ ᱵᱟᱹᱱᱩᱜᱼᱟ' }
        ],
        correctIndex: 1,
        explanation: {
          en: 'Methane rises to the roof, while deadly Hydrogen Sulfide sinks to the bottom floor.',
          hi: 'मीथेन ऊपर उठती है जबकि जहरीली H2S गैस भारी होने के कारण तली में जमा होती है।',
          sat: 'CH4 ᱪᱮᱛᱟᱱ ᱨᱮ ᱨᱟᱠᱟᱵᱼᱟ, H2S ᱞᱟᱛᱟᱨ ᱨᱮ ᱛᱟᱦᱮᱸᱱᱟ᱾'
        }
      },
      {
        id: 4,
        question: {
          en: 'If H2S exceeds 10 ppm, what is the mandatory decision?',
          hi: 'यदि H2S गैस 10 ppm से अधिक पाई जाए, तो अनिवार्य निर्णय क्या है?',
          sat: 'ᱡᱩᱫᱤ H2S 10 ppm ᱠᱷᱚᱱ ᱵᱟᱹᱲᱛᱤ ᱛᱟᱦᱮᱸᱱᱟ, ᱮᱱᱠᱷᱟᱱ?'
        },
        options: [
          { en: 'Enter quickly without harness', hi: 'जल्दी से अंदर जाएं', sat: 'ᱞᱚᱜᱚᱱ ᱵᱚᱞᱚᱱ' },
          { en: 'DO NOT ENTER / ESCALATE to Shift Sirdar', hi: 'प्रवेश न करें (DO NOT ENTER) और तुरंत सूचना दें', sat: 'ᱟᱞᱚᱢ ᱵᱚᱞᱚᱱᱟ (DO NOT ENTER)' },
          { en: 'Take a deep breath and jump', hi: 'सांस रोककर कूदें', sat: 'ᱥᱟᱦᱮᱫ ᱴᱮᱠᱟᱣ' },
          { en: 'Ignore the detector beep', hi: 'डिटेक्टर की बीप नजरअंदाज करें', sat: 'ᱰᱤᱴᱮᱠᱴᱟᱨ ᱟᱞᱚᱢ ᱟᱸᱡᱚᱢ' }
        ],
        correctIndex: 1,
        explanation: {
          en: 'H2S causes olfactory paralysis and rapid asphyxiation. Safe lockout and escalation is mandatory.',
          hi: 'H2S सूंघने की क्षमता खत्म कर देती है। प्रवेश वर्जित कर सीनियर को तुरंत सूचना दें।',
          sat: 'H2S ᱟᱹᱰᱤ ᱵᱤᱥ ᱜᱮᱥ ᱠᱟᱱᱟ, ᱵᱚᱞᱚᱱ ᱢᱟᱱᱟ ᱜᱮᱭᱟ᱾'
        }
      },
      {
        id: 5,
        question: {
          en: 'Carbon Monoxide (CO) is dangerous because it is:',
          hi: 'कार्बन मोनोऑक्साइड (CO) जानलेवा है क्योंकि यह:',
          sat: 'Carbon Monoxide (CO) ᱵᱚᱛᱚᱨ ᱜᱮᱭᱟ ᱪᱮᱫᱟᱜ ᱥᱮ:'
        },
        options: [
          { en: 'Colorless, odorless, binds to blood hemoglobin', hi: 'रंगहीन, गंधहीन है और खून में तेजी से घुलती है', sat: 'ᱨᱚᱝ-ᱥᱚ ᱵᱟᱹᱱᱩᱜᱼᱟ, ᱢᱟᱭᱟᱢ ᱨᱮ ᱢᱮᱥᱟᱜᱼᱟ' },
          { en: 'Bright neon green with sweet smell', hi: 'चमकीली हरी होती है', sat: 'ᱦᱟᱹᱨᱤᱭᱟᱹᱲ ᱜᱮᱭᱟ' },
          { en: 'Easily detected by tongue taste', hi: 'स्वाद से पहचानी जा सकती है', sat: 'ᱪᱟᱠᱷᱟ ᱛᱮ ᱵᱟᱰᱟᱭᱚᱜᱼᱟ' },
          { en: 'Completely harmless to humans', hi: 'पूरी तरह हानिरहित है', sat: 'ᱪᱮᱫ ᱦᱚᱸ ᱵᱟᱝ ᱦᱩᱭᱩᱜᱼᱟ' }
        ],
        correctIndex: 0,
        explanation: {
          en: 'Silent killer: CO deprives organs of oxygen without any warning smell or color.',
          hi: 'CO एक खामोश कातिल है जिसकी कोई गंध या रंग नहीं होता।',
          sat: 'CO ᱫᱚ ᱢᱤᱫ ᱩᱠᱩ ᱠᱷᱩᱱᱤ ᱠᱟᱱᱟ, ᱥᱚ ᱵᱟᱹᱱᱩᱜᱼᱟ᱾'
        }
      }
    ]
  },
  {
    id: 'module_ppe',
    category: 'PPE',
    icon: HardHat,
    accentColor: 'amber',
    badge: 'DGMS Standard Schedule II',
    title: {
      en: 'PPE & Underground Readiness',
      hi: 'सुरक्षा उपकरण (PPE) एवं खदान तैयारी',
      sat: 'PPE ᱟᱨ ᱠᱷᱟᱫᱟᱱ ᱥᱟᱯᱲᱟᱣ'
    },
    subtitle: {
      en: 'Step-by-step mining boiler suit, cap-lamp helmet, and steel-toe boots.',
      hi: 'माइनिंग सूट, कैप-लैंप हेलमेट, सेफ्टी बूट्स और हार्नेस का सही क्रम।',
      sat: 'ᱦᱮᱞᱢᱮᱴ, ᱵᱩᱴ, ᱥᱩᱴ ᱟᱨ ᱦᱟᱨᱱᱮᱥ ᱦᱚᱨᱚᱜ ᱦᱚᱨᱟ᱾'
    },
    questions: [
      {
        id: 1,
        question: {
          en: 'Why is chin strap mandatory on underground mining safety helmets?',
          hi: 'भूमिगत खदान में हेलमेट का चिन-स्ट्रैप (ठोड़ी का पट्टा) क्यों अनिवार्य है?',
          sat: 'ᱠᱷᱟᱫᱟᱱ ᱨᱮ ᱦᱮᱞᱢᱮᱴ ᱪᱤᱱ-ᱥᱴᱨᱮᱯ ᱪᱮᱫᱟᱜ ᱡᱟᱹᱨᱩᱨᱟ?'
        },
        options: [
          { en: 'Prevents helmet from falling off during slip or falling rock impact', hi: 'गिरने या पत्थर की टक्कर के दौरान हेलमेट सिर से न हटे', sat: 'ᱫᱷᱤᱨᱤ ᱧᱩᱨ ᱚᱠᱛᱚ ᱦᱮᱞᱢᱮᱴ ᱵᱟᱝ ᱧᱩᱨᱩᱜ ᱞᱟᱹᱜᱤᱫ' },
          { en: 'Only for military appearance', hi: 'दिखावे के लिए', sat: 'ᱧᱮᱞᱚᱜ ᱞᱟᱹᱜᱤᱫ' },
          { en: 'To hang the helmet on a tree', hi: 'हेलमेट लटकाने के लिए', sat: 'ᱟᱠᱟ ᱞᱟᱹᱜᱤᱫ' },
          { en: 'It is totally optional', hi: 'यह वैकल्पिक है', sat: 'ᱱᱚᱣᱟ ᱫᱚ ᱟᱯᱱᱟᱨ ᱠᱩᱥᱤ' }
        ],
        correctIndex: 0,
        explanation: {
          en: 'An unstrapped helmet flies off upon impact, exposing the skull to fatal rockfalls.',
          hi: 'स्ट्रैप न होने पर पत्थर गिरते ही हेलमेट सिर से उड़ जाता है जिससे सिर फट सकता है।',
          sat: 'ᱥᱴᱨᱮᱯ ᱵᱟᱝ ᱛᱟᱦᱮᱸᱱ ᱠᱷᱟᱱ ᱫᱷᱤᱨᱤ ᱧᱩᱨ ᱛᱮ ᱦᱮᱞᱢᱮᱴ ᱪᱷᱟᱰᱟᱣ ᱜᱚᱫᱚᱜᱼᱟ᱾'
        }
      },
      {
        id: 2,
        question: {
          en: 'What feature must mining boots possess according to DGMS regulations?',
          hi: 'DGMS नियमों के अनुसार माइनिंग बूट्स में कौन सी विशेषता अनिवार्य है?',
          sat: 'DGMS ᱞᱮᱠᱟᱛᱮ ᱠᱷᱟᱫᱟᱱ ᱵᱩᱴ ᱨᱮ ᱪᱮᱫ ᱛᱟᱦᱮᱸᱱ ᱞᱟᱹᱠᱛᱤᱭᱟ?'
        },
        options: [
          { en: 'Steel toe cap and puncture-resistant anti-skid sole', hi: 'स्टील टो कैप और नुकीले पत्थरों से सुरक्षा हेतु मजबूत तला', sat: 'ᱢᱮᱬᱦᱮᱫ ᱴᱚᱯᱤ (Steel toe) ᱟᱨ ᱠᱮᱴᱮᱡ ᱛᱟᱞᱟ' },
          { en: 'Soft running cloth mesh', hi: 'हल्का कपड़ा', sat: 'ᱞᱩᱜᱽᱲᱤ ᱵᱩᱴ' },
          { en: 'High heel fashion design', hi: 'ऊंची एड़ी', sat: 'ᱩᱥᱩᱞ ᱮᱲᱤ' },
          { en: 'Leather sandals', hi: 'चप्पल/सैंडल', sat: 'ᱪᱚᱯᱚᱞ' }
        ],
        correctIndex: 0,
        explanation: {
          en: 'Steel toe guards protect feet against heavy crushing ores and mine rail wagons.',
          hi: 'स्टील टो कैप भारी पत्थरों या पहियों से उंगलियों को कुचलने से बचाता है।',
          sat: 'ᱢᱮᱬᱦᱮᱫ ᱴᱚᱯᱤ ᱫᱚ ᱫᱷᱤᱨᱤ ᱧᱩᱨ ᱠᱷᱚᱱ ᱡᱟᱸᱜᱟ ᱮ ᱵᱟᱧᱪᱟᱣᱟ᱾'
        }
      },
      {
        id: 3,
        question: {
          en: 'What is the minimum safe harness for entering confined sumps/manholes?',
          hi: 'गहरे सम्प/मैनहोल में उतरने के लिए न्यूनतम सुरक्षित हार्नेस कौन सी है?',
          sat: 'ᱥᱟᱢᱯ ᱨᱮ ᱵᱚᱞᱚᱱ ᱞᱟᱹᱜᱤᱫ ᱚᱠᱟ ᱦᱟᱨᱱᱮᱥ ᱫᱚᱨᱠᱟᱨ?'
        },
        options: [
          { en: 'Single rope tied around waist', hi: 'कमर में बांधी गई साधारण रस्सी', sat: 'ᱰᱟᱸᱰᱟ ᱨᱮ ᱵᱟᱸᱫᱷᱟᱣ ᱵᱟᱵᱮᱨ' },
          { en: 'Full-body safety harness with dorsal D-ring & rescue winch', hi: 'फुल-बॉडी हार्नेस तथा रेस्क्यू विंच ट्राइपॉड कनेक्शन', sat: 'Full-body ᱦᱟᱨᱱᱮᱥ ᱟᱨ ᱣᱤᱱᱪ ᱵᱟᱵᱮᱨ' },
          { en: 'Leather belt', hi: 'चमड़े का बेल्ट', sat: 'ᱵᱮᱞᱴ' },
          { en: 'No harness needed if holding ladder', hi: 'सीढ़ी पकड़ने पर किसी हार्नेस की जरूरत नहीं', sat: 'ᱪᱮᱫ ᱦᱚᱸ ᱵᱟᱝ' }
        ],
        correctIndex: 1,
        explanation: {
          en: 'A waist-only rope breaks the spine in a fall. A certified full-body harness distributes load evenly.',
          hi: 'कमर की रस्सी रीढ़ तोड़ सकती है; केवल फुल-बॉडी हार्नेस ही बेहोशी में सुरक्षित ऊपर खींच सकता है।',
          sat: 'Full-body ᱦᱟᱨᱱᱮᱥ ᱜᱮ ᱵᱮᱦᱚᱸᱥ ᱚᱠᱛᱚ ᱦᱚᱲ ᱮ ᱨᱟᱠᱟᱵ ᱫᱟᱲᱮᱭᱟᱭᱟ᱾'
        }
      },
      {
        id: 4,
        question: {
          en: 'What purpose does reflective high-visibility striping on boiler suits serve?',
          hi: 'बॉयलर सूट पर लगी चमकदार रिफ्लेक्टिव पट्टियों का क्या उपयोग है?',
          sat: 'ᱥᱩᱴ ᱨᱮ ᱪᱤᱠᱢᱤᱠ ᱯᱟᱹᱴᱤ ᱪᱮᱫᱟᱜ ᱛᱟᱦᱮᱸᱱᱟ?'
        },
        options: [
          { en: 'Alerts vehicle/LHD operators in pitch-black mine galleries', hi: 'अंधेरी खदान में गाड़ी चालकों को दूर से कामगार की स्थिति दिखाना', sat: 'ᱜᱟᱹᱰᱤ ᱪᱟᱞᱟᱣᱤᱡ ᱧᱮᱞ ᱧᱟᱢ ᱞᱟᱹᱜᱤᱫ' },
          { en: 'Stores extra water', hi: 'पानी जमा करना', sat: 'ᱫᱟᱜ ᱫᱚᱦᱚ' },
          { en: 'Charges cell phone battery', hi: 'फोन चार्ज करना', sat: 'ᱪᱟᱨᱡᱽ' },
          { en: 'Acts as blanket', hi: 'कंबल का काम करना', sat: 'ᱠᱚᱢᱵᱚᱞ' }
        ],
        correctIndex: 0,
        explanation: {
          en: 'Heavy dumper and haulage accidents are prevented when reflective strips catch vehicle headlights.',
          hi: 'डम्पर और गाड़ियों की लाइट पड़ने पर पट्टियां चमकती हैं, जिससे कुचलने की दुर्घटनाएं रुकती हैं।',
          sat: 'ᱞᱟᱭᱤᱴ ᱧᱩᱨ ᱞᱮᱠᱷᱟᱱ ᱡᱩᱞᱩᱜᱼᱟ, ᱜᱟᱹᱰᱤ ᱵᱟᱝ ᱠᱷᱤᱞᱟᱹᱣ ᱵᱟᱡᱟᱣᱟ᱾'
        }
      },
      {
        id: 5,
        question: {
          en: 'When should a damaged helmet with deep cracks or chemical burns be replaced?',
          hi: 'गहरी दरार या रासायनिक क्षति वाले हेलमेट को कब बदला जाना चाहिए?',
          sat: 'ᱨᱟᱹᱯᱩᱫ ᱦᱮᱞᱢᱮᱴ ᱛᱤᱥ ᱵᱚᱫᱚᱞ ᱞᱟᱹᱠᱛᱤᱭᱟ?'
        },
        options: [
          { en: 'Immediately before entering the next underground shift', hi: 'अगली शिफ्ट में जाने से पहले तत्काल बदला जाना चाहिए', sat: 'ချက်ချင်း ᱵᱚᱫᱚᱞ ᱞᱟᱹᱠᱛᱤᱭᱟ' },
          { en: 'Only after 10 years of use', hi: '10 साल बाद', sat: '10 ᱥᱮᱨᱢᱟ ᱛᱟᱭᱚᱢ' },
          { en: 'Repair it with cellotape', hi: 'सेलोटेप से चिपका लें', sat: 'ᱴᱮᱯ ᱛᱮ ᱡᱚᱲᱟᱣ' },
          { en: 'Wear it backwards', hi: 'उल्टा पहनें', sat: 'ᱩᱞᱴᱟᱹ ᱦᱚᱨᱚᱜ' }
        ],
        correctIndex: 0,
        explanation: {
          en: 'A cracked shell has lost structural impact resistance and will shatter under falling rock.',
          hi: 'दरार वाला हेलमेट पत्थर गिरते ही बिखर जाएगा; इसे तुरंत नए DGMS प्रमाणित हेलमेट से बदलें।',
          sat: 'ᱨᱟᱹᱯᱩᱫ ᱦᱮᱞᱢᱮᱴ ᱫᱷᱤᱨᱤ ᱵᱟᱭ ᱴᱮᱠᱟᱣ ᱫᱟᱲᱮᱭᱟᱜᱼᱟ, ᱞᱚᱜᱚᱱ ᱵᱚᱫᱚᱞ ᱢᱮ᱾'
        }
      }
    ]
  }
];

// ==========================================
// 5. MAIN COMPONENT ARCHITECTURE
// ==========================================

export const SurakshaARApp: React.FC = () => {
  // Navigation & Screen States
  const [currentScreen, setCurrentScreen] = useState<'auth' | 'home' | 'drill' | 'result' | 'ar_fire_drill'>('home');
  const [selectedLanguage, setSelectedLanguage] = useState<Language>('en');
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);

  // Drill State
  const [activeModule, setActiveModule] = useState<SafetyModule>(SAFETY_MODULES[0]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [score, setScore] = useState<number>(0);

  // Certificate Modal State
  const [certificateModalOpen, setCertificateModalOpen] = useState<boolean>(false);
  const [currentCertificate, setCurrentCertificate] = useState<CertificateData | null>(null);

  // Authentication Form States
  const [authEmail, setAuthEmail] = useState<string>('rajesh.gope@mining.sih26');
  const [authPassword, setAuthPassword] = useState<string>('••••••••');
  const [isOfflineSeedMode, setIsOfflineSeedMode] = useState<boolean>(false);

  // Initialize offline session
  useEffect(() => {
    const existing = OfflineStorageService.getCurrentUser();
    if (existing) {
      setCurrentUser(existing);
      setCurrentScreen('home');
    } else {
      // Default initial mock worker profile
      const defaultWorker: UserProfile = {
        id: 'WKR-4491',
        name: 'Rajesh Gope',
        email: 'rajesh.gope@mining.sih26',
        trade: 'Haulage Attendant (Shaft 2)',
        isOffline: false
      };
      setCurrentUser(defaultWorker);
      OfflineStorageService.setCurrentUser(defaultWorker);
    }
  }, []);

  // Handlers
  const handleLogin = (isOfflineSeed: boolean = false) => {
    const worker: UserProfile = {
      id: isOfflineSeed ? 'OFFLINE-' + Math.floor(1000 + Math.random() * 9000) : 'WKR-4491',
      name: isOfflineSeed ? 'Offline Miner Seed' : 'Rajesh Gope',
      email: authEmail || 'worker@mining.sih26',
      trade: 'Haulage Attendant (Underground)',
      isOffline: isOfflineSeed
    };

    if (isOfflineSeed) {
      OfflineStorageService.saveOfflineUser(worker);
    }
    OfflineStorageService.setCurrentUser(worker);
    setCurrentUser(worker);
    setCurrentScreen('home');
  };

  const handleStartDrill = (module: SafetyModule) => {
    setActiveModule(module);
    setCurrentQuestionIndex(0);
    setSelectedAnswers({});
    setScore(0);
    setCurrentScreen('drill');
  };

  const handleSelectOption = (optionIndex: number) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [currentQuestionIndex]: optionIndex
    }));
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < activeModule.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      // Calculate final score
      let correctCount = 0;
      activeModule.questions.forEach((q, idx) => {
        if (selectedAnswers[idx] === q.correctIndex) {
          correctCount++;
        }
      });
      setScore(correctCount);
      setCurrentScreen('result');
    }
  };

  const handleGenerateCertificate = () => {
    const cert: CertificateData = {
      certId: `CERT-SURAKSHA-${Math.floor(100000 + Math.random() * 900000)}`,
      traineeName: currentUser?.name || 'Rajesh Gope',
      workerId: currentUser?.id || 'WKR-4491',
      courseName: activeModule.title[selectedLanguage],
      score: score,
      percentage: Math.round((score / activeModule.questions.length) * 100),
      issueDate: new Date().toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      }),
      verificationUrl: `https://suraksha.gov.in/verify?cert_id=CERT-${Math.floor(100000 + Math.random() * 900000)}`
    };
    setCurrentCertificate(cert);
    setCertificateModalOpen(true);
  };

  // Translations helper
  const t = (key: 'title' | 'offline_seed' | 'sign_in' | 'google_sign_in' | 'logout') => {
    const dict: Record<string, Record<Language, string>> = {
      title: {
        en: 'SurakshaAR',
        hi: 'सुरक्षा ए.आर.',
        sat: 'ᱥᱩᱨᱚᱠᱷᱭᱟ AR'
      },
      offline_seed: {
        en: 'Offline Sign Up (Local Storage)',
        hi: 'ऑफ़लाइन साइन अप (स्थानीय मेमोरी)',
        sat: 'ᱚᱯᱷᱞᱟᱭᱤᱱ ᱨᱮᱡᱤᱥᱴᱟᱨ'
      },
      sign_in: {
        en: 'Sign In to Mining Portal',
        hi: 'माइनिंग पोर्टल में प्रवेश करें',
        sat: 'ᱠᱷᱟᱫᱟᱱ ᱯᱚᱨᱴᱟᱞ ᱨᱮ ᱵᱚᱞᱚᱱ'
      },
      google_sign_in: {
        en: 'Sign in with Google',
        hi: 'Google से साइन इन करें',
        sat: 'Google ᱛᱮ ᱵᱚᱞᱚᱱ'
      },
      logout: {
        en: 'Sign Out',
        hi: 'साइन आउट',
        sat: 'ᱵᱟᱦᱨᱮ ᱩᱰᱩᱠ'
      }
    };
    return dict[key]?.[selectedLanguage] || dict[key]?.['en'];
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] font-sans antialiased flex flex-col justify-between max-w-md mx-auto shadow-2xl relative border-x border-[#E2E8F0]">

      {/* ==========================================
          TOP STATUS & LANGUAGE DRAWER HEADER
          ========================================== */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-[#E2E8F0] px-4 py-3 flex items-center justify-between shadow-2xs">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-amber-500 flex items-center justify-center text-slate-950 font-black shadow-xs">
            <ShieldCheck className="w-5 h-5 text-slate-950" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-base font-black tracking-tight text-slate-900">SurakshaAR</span>
              <span className="text-[10px] bg-amber-100 text-amber-900 font-bold px-1.5 py-0.5 rounded border border-amber-300">
                KHANSUAR
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium leading-none">
              Industrial AR Safety & Certification
            </p>
          </div>
        </div>

        {/* Language selector toggle */}
        <div className="flex items-center gap-1.5">
          <div className="relative inline-flex items-center bg-slate-100 rounded-lg p-0.5 border border-slate-200">
            {(['en', 'hi', 'sat'] as Language[]).map(lang => (
              <button
                key={lang}
                onClick={() => setSelectedLanguage(lang)}
                className={`px-2 py-1 text-[11px] font-bold rounded-md transition-all ${
                  selectedLanguage === lang
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {lang === 'en' ? 'EN' : lang === 'hi' ? 'हिंदी' : 'ᱥᱟᱱ'}
              </button>
            ))}
          </div>

          {currentUser && currentScreen !== 'auth' && (
            <button
              onClick={() => {
                OfflineStorageService.setCurrentUser(null);
                setCurrentUser(null);
                setCurrentScreen('auth');
              }}
              className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-slate-100 transition"
              title={t('logout')}
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </header>

      {/* OFFLINE STATUS PILL (Visible when user registered offline) */}
      {currentUser?.isOffline && (
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-1.5 flex items-center justify-between text-xs font-semibold text-amber-900">
          <div className="flex items-center gap-1.5">
            <WifiOff className="w-3.5 h-3.5 text-amber-700" />
            <span>Zero-Connectivity Offline Storage Active</span>
          </div>
          <span className="text-[10px] bg-amber-200 px-1.5 py-0.5 rounded text-amber-950 font-mono">SQLite Mock</span>
        </div>
      )}

      {/* ==========================================
          MAIN SCREEN ROUTER
          ========================================== */}
      <main className="flex-1 px-4 py-4 overflow-y-auto space-y-4">

        {/* --------------------------------------
            SCREEN 1: AUTHENTICATION & OFFLINE SEED
            -------------------------------------- */}
        {currentScreen === 'auth' && (
          <div className="space-y-4 py-2">
            <div className="text-center space-y-1">
              <h2 className="text-xl font-black text-slate-900">Trainee Access Portal</h2>
              <p className="text-xs text-slate-500">
                Log in to sync mining credentials, or register locally when in zero-connectivity pits.
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Worker Email / Mine ID</label>
                <input
                  type="text"
                  value={authEmail}
                  onChange={e => setAuthEmail(e.target.value)}
                  placeholder="rajesh.gope@mining.sih26"
                  className="w-full h-11 px-3 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Passcode</label>
                <input
                  type="password"
                  value={authPassword}
                  onChange={e => setAuthPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full h-11 px-3 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
                />
              </div>

              {/* Primary Email Sign In */}
              <button
                onClick={() => handleLogin(false)}
                className="w-full h-12 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 shadow-sm transition"
              >
                <span>{t('sign_in')}</span>
              </button>

              {/* Sign in with Google */}
              <button
                onClick={() => handleLogin(false)}
                className="w-full h-11 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 font-bold text-xs flex items-center justify-center gap-2 shadow-2xs transition"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.15z"/>
                  <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.24v3.15C3.26 21.36 7.33 24 12 24z"/>
                  <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.24C.45 8.16 0 9.98 0 12s.45 3.84 1.24 5.42l4.04-3.15z"/>
                  <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.24 6.58l4.04 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
                </svg>
                <span>{t('google_sign_in')}</span>
              </button>

              <div className="relative flex py-1 items-center">
                <div className="flex-grow border-t border-slate-200"></div>
                <span className="flex-shrink mx-2 text-[10px] uppercase font-bold text-slate-400">or offline mode</span>
                <div className="flex-grow border-t border-slate-200"></div>
              </div>

              {/* Offline Sign Up Button */}
              <button
                onClick={() => handleLogin(true)}
                className="w-full h-11 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 font-bold text-xs flex items-center justify-center gap-2 transition"
              >
                <Database className="w-4 h-4 text-slate-600" />
                <span>{t('offline_seed')}</span>
              </button>
            </div>
          </div>
        )}

        {/* --------------------------------------
            SCREEN 2: HOME & 3 CORE MODULE CARDS
            -------------------------------------- */}
        {currentScreen === 'home' && (
          <div className="space-y-4">
            {/* Trainee Profile Bar */}
            <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-700">
                  <User className="w-6 h-6 text-slate-500" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">{currentUser?.name}</h3>
                  <p className="text-xs text-slate-500 font-mono">ID: {currentUser?.id} • {currentUser?.trade}</p>
                </div>
              </div>
              <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-200">
                Active Trainee
              </span>
            </div>

            <div className="flex items-center justify-between px-1">
              <h2 className="text-xs font-black tracking-wider uppercase text-slate-500">
                Core Safety Training Modules
              </h2>
              <span className="text-[11px] font-semibold text-amber-700">DGMS Certified</span>
            </div>

            {/* Live AR Camera Fire Response Assistant Hero Banner */}
            <div className="bg-gradient-to-r from-amber-500 via-amber-600 to-orange-600 rounded-2xl p-4 text-slate-950 shadow-md flex items-center justify-between gap-3">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1 bg-black/20 text-white px-2 py-0.5 rounded-full text-[10px] font-bold">
                  <Camera className="w-3 h-3 text-yellow-300" />
                  <span>Real-Time AR Camera Mode</span>
                </div>
                <h3 className="text-sm font-black text-slate-950 leading-tight">
                  Live Fire Response Assistant
                </h3>
                <p className="text-[11px] text-slate-900 font-medium">
                  Scan environment, isolate 440V power, pull pin, and spray CO2.
                </p>
              </div>

              <button
                onClick={() => setCurrentScreen('ar_fire_drill')}
                className="shrink-0 px-3.5 py-2.5 rounded-xl bg-slate-950 hover:bg-slate-900 text-amber-400 font-bold text-xs flex items-center gap-1.5 shadow-lg active:scale-95 transition"
              >
                <span>Launch AR</span>
                <ChevronRight className="w-4 h-4 text-amber-400" />
              </button>
            </div>

            {/* 3 Core Cards */}
            <div className="space-y-3">
              {SAFETY_MODULES.map(module => {
                const IconComponent = module.icon;
                return (
                  <div
                    key={module.id}
                    className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm hover:border-amber-400 transition-all flex flex-col justify-between space-y-3"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center shrink-0">
                        <IconComponent className="w-6 h-6 text-amber-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap mb-0.5">
                          <h3 className="text-sm font-black text-slate-900 leading-tight">
                            {module.title[selectedLanguage]}
                          </h3>
                        </div>
                        <span className="inline-block text-[10px] bg-slate-100 text-slate-700 font-mono font-semibold px-1.5 py-0.5 rounded border border-slate-200 mb-1">
                          {module.badge}
                        </span>
                        <p className="text-xs text-slate-600 leading-relaxed font-medium">
                          {module.subtitle[selectedLanguage]}
                        </p>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                      <span className="text-xs text-slate-400 font-medium">5 Scenarios</span>
                      <div className="flex items-center gap-2">
                        {module.id === 'module_fire' && (
                          <button
                            onClick={() => setCurrentScreen('ar_fire_drill')}
                            className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center gap-1 transition"
                            title="Open Camera AR Drill"
                          >
                            <Camera className="w-3.5 h-3.5 text-amber-600" />
                            <span>Live AR</span>
                          </button>
                        )}
                        <button
                          onClick={() => handleStartDrill(module)}
                          className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 active:scale-95 text-slate-950 font-bold text-xs flex items-center gap-1 shadow-2xs transition"
                        >
                          <span>Drill</span>
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* --------------------------------------
            SCREEN 3: 5-QUESTION DECISION DRILL
            -------------------------------------- */}
        {currentScreen === 'drill' && (
          <div className="space-y-4">
            {/* Top Navigation */}
            <div className="flex items-center justify-between">
              <button
                onClick={() => setCurrentScreen('home')}
                className="inline-flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-slate-800"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Exit Drill</span>
              </button>
              <div className="text-xs font-mono font-bold text-slate-500">
                Question {currentQuestionIndex + 1} of {activeModule.questions.length}
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
              <div
                className="bg-amber-500 h-full transition-all duration-300 rounded-full"
                style={{
                  width: `${((currentQuestionIndex + 1) / activeModule.questions.length) * 100}%`
                }}
              />
            </div>

            {/* Question Card */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
              <span className="inline-block text-[11px] font-black uppercase tracking-wider text-amber-700 bg-amber-100 px-2 py-0.5 rounded border border-amber-200">
                Decision Scenario #{currentQuestionIndex + 1}
              </span>
              <h3 className="text-sm font-black text-slate-900 leading-snug">
                {activeModule.questions[currentQuestionIndex].question[selectedLanguage]}
              </h3>

              {/* Multi-choice Options */}
              <div className="space-y-2.5 pt-1">
                {activeModule.questions[currentQuestionIndex].options.map((option, idx) => {
                  const isSelected = selectedAnswers[currentQuestionIndex] === idx;
                  return (
                    <button
                      key={idx}
                      onClick={() => handleSelectOption(idx)}
                      className={`w-full p-3.5 rounded-xl border text-left text-xs font-semibold flex items-center justify-between transition-all ${
                        isSelected
                          ? 'border-amber-500 bg-amber-50 text-slate-900 shadow-2xs'
                          : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                      }`}
                    >
                      <span className="flex-1 pr-2">{option[selectedLanguage]}</span>
                      <div
                        className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                          isSelected ? 'border-amber-600 bg-amber-600 text-white' : 'border-slate-300'
                        }`}
                      >
                        {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Next / Submit Button */}
            <button
              onClick={handleNextQuestion}
              disabled={selectedAnswers[currentQuestionIndex] === undefined}
              className={`w-full h-12 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition ${
                selectedAnswers[currentQuestionIndex] !== undefined
                  ? 'bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-md cursor-pointer'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              <span>
                {currentQuestionIndex === activeModule.questions.length - 1
                  ? 'Submit Assessment & Evaluate'
                  : 'Confirm Action & Next Question'}
              </span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* --------------------------------------
            SCREEN 4: RESULT EVALUATION CARD
            -------------------------------------- */}
        {currentScreen === 'result' && (
          <div className="space-y-4">
            {/* Banner Result */}
            {score >= 4 ? (
              <div className="bg-emerald-50 border border-emerald-300 rounded-2xl p-5 text-center space-y-2 shadow-sm">
                <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto text-emerald-700">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <h3 className="text-lg font-black text-emerald-950">COMPETENCY PASSED</h3>
                <p className="text-xs text-emerald-800 font-medium">
                  Candidate meets DGMS CMR 2017 & OSHA statutory benchmarks.
                </p>
              </div>
            ) : (
              <div className="bg-red-50 border border-red-300 rounded-2xl p-5 text-center space-y-2 shadow-sm">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto text-red-700">
                  <XCircle className="w-7 h-7" />
                </div>
                <h3 className="text-lg font-black text-red-950">RE-DRILL REQUIRED (FAILED)</h3>
                <p className="text-xs text-red-800 font-medium">
                  Score below 80% threshold. Immediate tactical retraining mandatory.
                </p>
              </div>
            )}

            {/* Scorecard Metrics */}
            <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm grid grid-cols-2 gap-3 text-center">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Score</span>
                <div className="text-2xl font-black font-mono text-slate-900 mt-0.5">
                  {score} <span className="text-xs text-slate-400 font-sans">/ 5</span>
                </div>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Percentage</span>
                <div
                  className={`text-2xl font-black font-mono mt-0.5 ${
                    score >= 4 ? 'text-emerald-600' : 'text-red-600'
                  }`}
                >
                  {Math.round((score / 5) * 100)}%
                </div>
              </div>
            </div>

            {/* Primary Action Button */}
            {score >= 4 ? (
              <button
                onClick={handleGenerateCertificate}
                className="w-full h-12 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md transition"
              >
                <Award className="w-4 h-4" />
                <span>View Verifiable Certificate</span>
              </button>
            ) : (
              <button
                onClick={() => handleStartDrill(activeModule)}
                className="w-full h-12 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 shadow-md transition"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Retake Practical Drill</span>
              </button>
            )}

            <button
              onClick={() => setCurrentScreen('home')}
              className="w-full h-11 rounded-xl bg-white border border-slate-300 text-slate-700 font-bold text-xs flex items-center justify-center gap-2 transition hover:bg-slate-50"
            >
              <span>Return to Safety Modules</span>
            </button>
          </div>
        )}

        {/* --------------------------------------
            SCREEN 5: REAL-TIME AR FIRE RESPONSE ASSISTANT
            -------------------------------------- */}
        {currentScreen === 'ar_fire_drill' && (
          <div className="-mx-4 -my-4 h-[calc(100vh-110px)] min-h-[580px]">
            <ARFireResponseAssistant
              language={selectedLanguage}
              onBack={() => setCurrentScreen('home')}
              onProceedToAssessment={() => {
                setActiveModule(SAFETY_MODULES[0]);
                setScore(5);
                setCurrentScreen('result');
              }}
            />
          </div>
        )}
      </main>

      {/* ==========================================
          5. VERIFIABLE CERTIFICATE MODAL
          ========================================== */}
      {certificateModalOpen && currentCertificate && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-sm w-full p-6 shadow-2xl relative space-y-4 animate-in fade-in zoom-in duration-200">
            {/* Certificate Header Banner */}
            <div className="text-center space-y-1 border-b border-slate-200 pb-3">
              <div className="inline-flex items-center gap-1.5 bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full text-[10px] font-bold border border-amber-300 mb-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>DGMS STATUTORY RECORD</span>
              </div>
              <h2 className="text-base font-black text-slate-900 leading-tight">
                Certificate of Industrial Safety
              </h2>
              <p className="text-[11px] text-slate-500">
                SurakshaAR National Safety Training Standard
              </p>
            </div>

            {/* Candidate Details */}
            <div className="space-y-2 text-xs">
              <div className="flex justify-between border-b border-slate-100 pb-1">
                <span className="text-slate-500">Trainee Name:</span>
                <span className="font-bold text-slate-900">{currentCertificate.traineeName}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-1">
                <span className="text-slate-500">Worker ID:</span>
                <span className="font-mono font-bold text-slate-800">{currentCertificate.workerId}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-1">
                <span className="text-slate-500">Module Passed:</span>
                <span className="font-bold text-slate-900 truncate max-w-[160px] text-right">
                  {currentCertificate.courseName}
                </span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-1">
                <span className="text-slate-500">Score Achieved:</span>
                <span className="font-bold text-emerald-700">{currentCertificate.percentage}% (PASS)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Issue Date:</span>
                <span className="font-medium text-slate-700">{currentCertificate.issueDate}</span>
              </div>
            </div>

            {/* Dynamic QR Code Payload Section */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col items-center justify-center space-y-2">
              {/* Responsive SVG QR Code Simulation */}
              <div className="w-32 h-32 bg-white p-2 rounded-xl border border-slate-300 shadow-2xs flex items-center justify-center">
                <svg className="w-full h-full" viewBox="0 0 100 100" fill="none">
                  {/* Outer markers */}
                  <rect x="5" y="5" width="28" height="28" rx="4" fill="#0F172A" />
                  <rect x="9" y="9" width="20" height="20" rx="2" fill="#FFFFFF" />
                  <rect x="13" y="13" width="12" height="12" rx="1" fill="#0F172A" />

                  <rect x="67" y="5" width="28" height="28" rx="4" fill="#0F172A" />
                  <rect x="71" y="9" width="20" height="20" rx="2" fill="#FFFFFF" />
                  <rect x="75" y="13" width="12" height="12" rx="1" fill="#0F172A" />

                  <rect x="5" y="67" width="28" height="28" rx="4" fill="#0F172A" />
                  <rect x="9" y="71" width="20" height="20" rx="2" fill="#FFFFFF" />
                  <rect x="13" y="75" width="12" height="12" rx="1" fill="#0F172A" />

                  {/* Dynamic payload dots */}
                  <circle cx="42" cy="19" r="4" fill="#0F172A" />
                  <circle cx="54" cy="19" r="4" fill="#0F172A" />
                  <circle cx="48" cy="48" r="6" fill="#D97706" />
                  <rect x="40" y="65" width="8" height="8" fill="#0F172A" />
                  <rect x="65" y="45" width="8" height="8" fill="#0F172A" />
                  <rect x="75" y="75" width="16" height="16" fill="#0F172A" />
                </svg>
              </div>

              <div className="text-center space-y-0.5">
                <p className="text-[10px] font-mono font-bold text-slate-700">
                  {currentCertificate.certId}
                </p>
                <p className="text-[9px] text-slate-400 font-mono truncate max-w-[220px]">
                  {currentCertificate.verificationUrl}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-2 pt-1">
              <button
                onClick={() => {
                  alert(`Downloading Official PDF Certificate: ${currentCertificate.certId}`);
                }}
                className="w-full h-11 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition"
              >
                <Download className="w-4 h-4" />
                <span>Download Certificate (PDF)</span>
              </button>

              <button
                onClick={() => setCertificateModalOpen(false)}
                className="w-full h-10 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition"
              >
                <span>Close Verification</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==========================================
          FOOTER INDUSTRIAL BAR
          ========================================== */}
      <footer className="bg-white border-t border-[#E2E8F0] px-4 py-2.5 flex items-center justify-between text-[11px] text-slate-500">
        <span className="font-semibold">DGMS CMR 2017 & OSHA Compliant</span>
        <span className="font-mono text-slate-400">Build v2.4.1 (SIH 2026)</span>
      </footer>
    </div>
  );
};

export default SurakshaARApp;
