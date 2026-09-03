import { useState } from 'react';
import { ShieldCheck, ChevronDown, ChevronUp, CheckCircle2 } from 'lucide-react';

export const RulesBanner = () => {
  const [expanded, setExpanded] = useState(false);

  const rules = [
    {
      num: 1,
      title: 'Direct & To-The-Point',
      desc: 'Koi faltu tamheed, greeting ya setup nahi.',
    },
    {
      num: 2,
      title: 'Aasan Urdu / Roman Urdu',
      desc: 'Sada aur foran samajh anay wali zabaan.',
    },
    {
      num: 3,
      title: 'Bulleted & Structured',
      desc: 'Lambi baton ke bajaye bullet points aur clear format.',
    },
    {
      num: 4,
      title: 'First-Sentence Solution',
      desc: 'Bina waqt zaya kiye pehli hi line se direct solution.',
    },
  ];

  return (
    <div className="border-b border-zinc-200/80 bg-zinc-50/70 px-4 py-2 text-xs">
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2 text-zinc-700">
          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
            <ShieldCheck className="h-3.5 w-3.5" />
          </div>
          <span className="font-semibold text-zinc-800">Assigned Response Rules Active:</span>
          <span className="hidden sm:inline text-zinc-500">
            To-the-point • Roman Urdu • Bullet Points • Direct Answer
          </span>
        </div>

        <button
          id="toggle-rules-banner"
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1 font-medium text-zinc-600 hover:text-zinc-900 bg-white hover:bg-zinc-100 border border-zinc-200 rounded-md px-2 py-1 transition-colors"
        >
          <span>{expanded ? 'Chupayein' : 'Qawaneen Dekhein'}</span>
          {expanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
        </button>
      </div>

      {expanded && (
        <div className="max-w-4xl mx-auto mt-2.5 pt-2.5 border-t border-zinc-200/80 grid grid-cols-1 sm:grid-cols-2 gap-2 text-zinc-600">
          {rules.map((rule) => (
            <div key={rule.num} className="flex items-start gap-2 bg-white p-2 rounded-lg border border-zinc-200/70 shadow-2xs">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-medium text-zinc-800 mr-1.5">{rule.num}. {rule.title}:</span>
                <span className="text-zinc-600">{rule.desc}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
