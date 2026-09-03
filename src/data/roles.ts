import { PersonaRole, ModelOption } from '../types';

export const DEFAULT_ROLES: PersonaRole[] = [
  {
    id: 'direct-assistant',
    title: 'Seedha & To-the-Point Assistant',
    description: 'Bina kisi tamheed ya salam ke seedha maqsad ka jawab, bullet points aur asaan Roman Urdu me.',
    systemInstruction: `Aap ka kirdar aik nihayat tezi se kaam karne wale direct assistant ka hai.
- Kabhi salam, hal-ahwal, ya unnecessary intro mat likhein.
- Pehle lafz se seedha jawab shuru karein.
- Bullet points aur aasan zabaan use karein.`,
    iconName: 'Zap',
  },
  {
    id: 'code-specialist',
    title: 'Code & Tech Specialist',
    description: 'Programming, bug fixing, aur software architecture ke masail ka direct hal.',
    systemInstruction: `Aap aik senior software engineer aur tech specialist hain.
- Code snippets aur explanations direct Roman Urdu / Urdu me dein.
- Code me clean best practices follow karein.
- Tamheed chor kar masle ka technical hal aur syntax points batayein.`,
    iconName: 'Code',
  },
  {
    id: 'education-guide',
    title: 'Taleemi Rehnuma (Conceptual Tutor)',
    description: 'Mushkil science, math, ya general concepts ko asaan misalon se samjhane wala guide.',
    systemInstruction: `Aap aik experienced teacher aur conceptual guide hain.
- Har complex concept ko aasan Roman Urdu me step-by-step points me wazeh karein.
- Real-life misalein dein aur direct topic par aaein.`,
    iconName: 'GraduationCap',
  },
  {
    id: 'business-writer',
    title: 'Business & Office Pro',
    description: 'Professional emails, applications, summaries aur business drafts foran tayyar karein.',
    systemInstruction: `Aap aik professional business consultant aur corporate communicator hain.
- Formal emails, reports, aur meeting summaries direct ready-to-use format me dein.
- Points clear aur actionable hon.`,
    iconName: 'Briefcase',
  },
];

export const AVAILABLE_MODELS: ModelOption[] = [
  {
    id: 'gemini-3.5-flash',
    name: 'Gemini 3.5 Flash',
    badge: 'General Tasks',
    description: 'Tez aur behtareen multi-turn chat ke liye ideal choice.',
    speed: 'High Speed',
  },
  {
    id: 'gemini-3.1-flash-lite',
    name: 'Gemini 3.1 Flash Lite',
    badge: 'Ultra Fast',
    description: 'Foran jawab (minimal latency) chahiay to ye model chunein.',
    speed: 'Ultra Fast',
  },
  {
    id: 'gemini-3.8-flash',
    name: 'Gemini 3.8 Flash',
    badge: 'Basic & Efficient',
    description: 'Q&A aur direct summaries ke liye quick response.',
    speed: 'Fast',
  },
  {
    id: 'gemini-3.1-pro-preview',
    name: 'Gemini 3.1 Pro Preview',
    badge: 'Complex Reasoning',
    description: 'Mushkil coding, deep logic, aur detailed analysis ke liye.',
    speed: 'Deep Reasoning',
  },
];

export const SUGGESTED_PROMPTS = [
  {
    title: 'Python List Comprehension',
    prompt: 'Python me list comprehension kaise kaam karta hai? 3 aasan misalein dein.',
    category: 'Coding',
  },
  {
    title: 'Leave Request Email',
    prompt: 'Aik formal email draft karein jisme office manager se 2 din ki leave darkhwast ki gayi ho.',
    category: 'Office',
  },
  {
    title: 'Cloud vs On-Premise',
    prompt: 'Cloud Computing aur On-Premise servers ke darmiyan bunyadi farq bullet points me batayein.',
    category: 'Tech',
  },
  {
    title: 'Time Management Tips',
    prompt: 'Daily work routine behtar karne ke 5 practical aur to-the-point tareeqay batayein.',
    category: 'Productivity',
  },
];
