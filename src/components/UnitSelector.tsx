import React from 'react';
import { UnitData, UserProfile } from '../types';
import { BookOpen, CheckCircle2, ChevronRight } from 'lucide-react';

interface UnitSelectorProps {
  units: UnitData[];
  selectedUnitId: number;
  onSelectUnit: (unitId: number) => void;
  user: UserProfile;
}

export const UnitSelector: React.FC<UnitSelectorProps> = ({
  units,
  selectedUnitId,
  onSelectUnit,
  user,
}) => {
  return (
    <div className="bg-white rounded-3xl p-4 shadow-sm border border-blue-100">
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-blue-700" />
          <h2 className="font-extrabold text-slate-800 text-sm md:text-base font-['Fredoka',sans-serif]">
            Giáo trình Family and Friends 1
          </h2>
        </div>
        <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">
          {units.length} Đơn vị bài học
        </span>
      </div>

      {/* Horizontal Scroll Bar for Units */}
      <div className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-blue-200">
        {units.map((unit) => {
          const isSelected = unit.id === selectedUnitId;
          const isCompleted = user.completedActivities[`unit_${unit.id}_completed`];

          return (
            <button
              key={unit.id}
              onClick={() => onSelectUnit(unit.id)}
              className={`flex-shrink-0 flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl border-2 transition text-left ${
                isSelected
                  ? 'border-blue-600 bg-blue-700 text-white shadow-md'
                  : 'border-blue-100 bg-blue-50/50 hover:bg-blue-100/60 text-slate-700'
              }`}
            >
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg shadow-xs ${
                  isSelected ? 'bg-white/20 text-white' : 'bg-white text-blue-700'
                }`}
              >
                {unit.icon}
              </div>

              <div>
                <div className="flex items-center gap-1.5">
                  <span
                    className={`text-xs font-bold truncate max-w-[130px] ${
                      isSelected ? 'text-white' : 'text-blue-950'
                    }`}
                  >
                    {unit.id === 0 ? 'Starter' : `Unit ${unit.id}`}
                  </span>
                  {isCompleted && (
                    <CheckCircle2
                      className={`w-3.5 h-3.5 ${
                        isSelected ? 'text-amber-300' : 'text-emerald-500'
                      }`}
                    />
                  )}
                </div>
                <div
                  className={`text-[11px] truncate max-w-[140px] ${
                    isSelected ? 'text-blue-200' : 'text-slate-500'
                  }`}
                >
                  {unit.title.replace(/^Unit \d+: /, '')}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
