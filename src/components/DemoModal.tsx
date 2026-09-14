import React from 'react';
import { CheckCircle, Loader2, ArrowRight, Truck, MapPin, ShieldCheck, FileText } from 'lucide-react';

interface DemoModalProps {
  currentStep: number;
  isOpen: boolean;
}

const STEPS = [
  { label: 'Geocoding freight locations (Richmond, VA & Newark, NJ)', icon: MapPin },
  { label: 'Calculating actual highway route & mileage via OSRM', icon: Truck },
  { label: 'Simulating FMCSA 11h driving & 14h duty window limits', icon: ShieldCheck },
  { label: 'Inserting mandatory cargo pickup, fuel, & 30m rest stops', icon: CheckCircle },
  { label: 'Generating FMCSA § 395.8 ELD / RODS daily log sheets', icon: FileText },
];

export const DemoModal: React.FC<DemoModalProps> = ({ currentStep, isOpen }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-inner">
            <Truck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-base">
              Executing Compliance Pipeline
            </h3>
            <p className="text-xs text-slate-500">
              Simulating commercial dispatch & HOS validation
            </p>
          </div>
        </div>

        <div className="space-y-3 my-4">
          {STEPS.map((s, idx) => {
            const isCompleted = idx < currentStep;
            const isCurrent = idx === currentStep;
            const Icon = s.icon;

            return (
              <div
                key={`step-${idx}`}
                className={`flex items-center gap-3 p-2.5 rounded-lg text-xs transition-all ${
                  isCurrent
                    ? 'bg-blue-50 border border-blue-200 text-blue-900 font-semibold'
                    : isCompleted
                    ? 'text-emerald-800 bg-emerald-50/50'
                    : 'text-slate-400'
                }`}
              >
                <div className="shrink-0">
                  {isCompleted ? (
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                  ) : isCurrent ? (
                    <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border border-slate-300 flex items-center justify-center text-[9px] font-mono">
                      {idx + 1}
                    </div>
                  )}
                </div>
                <span className="leading-snug">{s.label}</span>
              </div>
            );
          })}
        </div>

        <div className="text-center pt-2 text-[11px] text-slate-400">
          Deterministic event simulation • Zero LLM dependency
        </div>
      </div>
    </div>
  );
};
