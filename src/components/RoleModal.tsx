import { useState, useEffect } from 'react';
import { PersonaRole } from '../types';
import { DEFAULT_ROLES } from '../data/roles';
import { X, Check, Sliders, Zap, Code, GraduationCap, Briefcase, RotateCcw } from 'lucide-react';

interface RoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeRole: PersonaRole;
  customInstruction: string;
  onSaveRole: (role: PersonaRole, customText: string) => void;
}

export const RoleModal = ({
  isOpen,
  onClose,
  activeRole,
  customInstruction,
  onSaveRole,
}: RoleModalProps) => {
  const [selectedRole, setSelectedRole] = useState<PersonaRole>(activeRole);
  const [instructionText, setInstructionText] = useState(customInstruction);

  useEffect(() => {
    setSelectedRole(activeRole);
    setInstructionText(customInstruction);
  }, [activeRole, customInstruction, isOpen]);

  if (!isOpen) return null;

  const getRoleIcon = (iconName: string) => {
    switch (iconName) {
      case 'Code':
        return <Code className="h-4 w-4 text-blue-600" />;
      case 'GraduationCap':
        return <GraduationCap className="h-4 w-4 text-amber-600" />;
      case 'Briefcase':
        return <Briefcase className="h-4 w-4 text-purple-600" />;
      default:
        return <Zap className="h-4 w-4 text-emerald-600" />;
    }
  };

  const handleSelectPreset = (role: PersonaRole) => {
    setSelectedRole(role);
    setInstructionText(role.systemInstruction);
  };

  const handleResetToDefault = () => {
    const defaultRole = DEFAULT_ROLES[0];
    setSelectedRole(defaultRole);
    setInstructionText('');
  };

  const handleSave = () => {
    onSaveRole(selectedRole, instructionText);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="relative w-full max-w-xl rounded-2xl border border-zinc-200 bg-white p-5 sm:p-6 shadow-xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-zinc-100 text-zinc-800">
              <Sliders className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-zinc-900">Chatbot Roles & System Instructions</h2>
              <p className="text-xs text-zinc-500">AI Assistant ka role aur qawaneen tay karein</p>
            </div>
          </div>
          <button
            id="close-role-modal-btn"
            onClick={onClose}
            className="rounded-lg p-1.5 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1">
          {/* Preset Roles Selection */}
          <div>
            <label className="text-xs font-semibold text-zinc-700 block mb-2">
              Preset Roles (Muntakhib Kirdar):
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {DEFAULT_ROLES.map((role) => {
                const isSelected = selectedRole.id === role.id;
                return (
                  <button
                    key={role.id}
                    id={`role-preset-${role.id}`}
                    type="button"
                    onClick={() => handleSelectPreset(role)}
                    className={`flex items-start gap-2.5 p-3 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'border-zinc-900 bg-zinc-900/5 ring-1 ring-zinc-900 text-zinc-900'
                        : 'border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50 text-zinc-700'
                    }`}
                  >
                    <div className="mt-0.5 shrink-0">{getRoleIcon(role.iconName)}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold leading-snug">{role.title}</p>
                      <p className="text-[11px] text-zinc-500 line-clamp-2 mt-0.5">
                        {role.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* System Instruction Box */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="system-instruction-textarea" className="text-xs font-semibold text-zinc-700">
                System Instruction (Kirdar aur Qawaneen ki Hidayat):
              </label>
              <button
                type="button"
                onClick={handleResetToDefault}
                className="text-[11px] text-zinc-500 hover:text-zinc-800 flex items-center gap-1"
              >
                <RotateCcw className="h-3 w-3" />
                <span>Reset</span>
              </button>
            </div>
            <textarea
              id="system-instruction-textarea"
              rows={4}
              value={instructionText}
              onChange={(e) => setInstructionText(e.target.value)}
              placeholder="System instruction yahan likhein ya preset role chunen..."
              className="w-full rounded-xl border border-zinc-200 bg-zinc-50 p-3 text-xs text-zinc-800 placeholder:text-zinc-400 focus:bg-white focus:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 font-mono"
            />
            <p className="text-[11px] text-zinc-500 mt-1">
              Note: Bunyadi 4 Qawaneen (To-the-point, Roman Urdu, Bullet Points, First-sentence answer) hamesha shamil rahenge.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-100">
          <button
            id="cancel-role-btn"
            type="button"
            onClick={onClose}
            className="rounded-xl px-4 py-2 text-xs font-medium text-zinc-600 hover:bg-zinc-100 transition-colors"
          >
            Cancel
          </button>
          <button
            id="save-role-btn"
            type="button"
            onClick={handleSave}
            className="inline-flex items-center gap-1.5 rounded-xl bg-zinc-900 px-4 py-2 text-xs font-semibold text-white hover:bg-zinc-800 transition-colors shadow-xs"
          >
            <Check className="h-3.5 w-3.5" />
            <span>Kirdar Save Karein</span>
          </button>
        </div>
      </div>
    </div>
  );
};
