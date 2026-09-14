import React from 'react';
import { RouteStep } from '../types.ts';
import { Navigation, CornerDownRight, ArrowUpRight, ArrowRight, CornerUpRight, Compass } from 'lucide-react';

interface TurnByTurnStepsProps {
  steps: RouteStep[];
  originName: string;
  destName: string;
}

export const TurnByTurnSteps: React.FC<TurnByTurnStepsProps> = ({
  steps,
  originName,
  destName,
}) => {
  if (!steps || steps.length === 0) {
    return (
      <div className="p-8 text-center text-slate-500 bg-white rounded-xl border border-slate-200">
        <Compass className="w-10 h-10 mx-auto mb-2 text-slate-400 opacity-60" />
        <p className="font-medium">No turn-by-turn routing steps available.</p>
      </div>
    );
  }

  const getStepIcon = (type?: string, modifier?: string) => {
    if (modifier?.includes('right')) return <ArrowUpRight className="w-4 h-4 text-blue-600" />;
    if (modifier?.includes('left')) return <CornerUpRight className="w-4 h-4 text-indigo-600 rotate-270" />;
    if (type?.includes('turn')) return <CornerDownRight className="w-4 h-4 text-slate-600" />;
    return <Navigation className="w-4 h-4 text-slate-500" />;
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div>
          <h3 className="font-bold text-slate-900 text-sm sm:text-base">
            Commercial Route Turn-by-Turn Navigation
          </h3>
          <p className="text-xs text-slate-500">
            {originName} &rarr; {destName} ({steps.length} maneuvers)
          </p>
        </div>
      </div>

      <div className="divide-y divide-slate-100 max-h-[580px] overflow-y-auto pr-1">
        {steps.map((step, idx) => (
          <div key={`step-${idx}`} className="py-2.5 flex items-start justify-between gap-3 text-xs hover:bg-slate-50 px-2 rounded transition">
            <div className="flex items-start gap-2.5">
              <div className="w-6 h-6 rounded-md bg-slate-100 flex items-center justify-center shrink-0 mt-0.5">
                {getStepIcon(step.type, step.modifier)}
              </div>
              <div>
                <p className="font-semibold text-slate-900 leading-snug">{step.instruction}</p>
                {step.name && step.name !== 'highway' && (
                  <span className="text-[11px] text-slate-500">{step.name}</span>
                )}
              </div>
            </div>

            <div className="text-right shrink-0">
              <span className="font-bold text-slate-800 text-xs block">{step.distance_miles.toFixed(1)} mi</span>
              <span className="text-[10px] text-slate-400">{step.duration_minutes.toFixed(0)} min</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
