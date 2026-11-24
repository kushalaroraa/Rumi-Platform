import React, { useState } from 'react';
import { BUDGET_MAX, BUDGET_MIN, BUDGET_STEP, formatBudgetLabel } from '../../utils/budget';

/**
 * Dual-thumb monthly budget range selector with synced Minimum & Maximum inputs.
 */
export const BudgetRangeInput = ({
  minValue,
  maxValue,
  onChange,
  minLimit = BUDGET_MIN,
  maxLimit = BUDGET_MAX,
  step = BUDGET_STEP,
  label = 'Monthly Budget',
  disabled = false,
}) => {
  const numericMin = Number(minValue);
  const numericMax = Number(maxValue);

  const safeSliderMin = Number.isFinite(numericMin) && numericMin > 0
    ? Math.max(minLimit, Math.min(maxLimit, numericMin))
    : minLimit;
  const safeSliderMax = Number.isFinite(numericMax) && numericMax > 0
    ? Math.max(safeSliderMin, Math.min(maxLimit, numericMax))
    : Math.max(safeSliderMin, minLimit);

  const [minEdit, setMinEdit] = useState({ active: false, text: '' });
  const [maxEdit, setMaxEdit] = useState({ active: false, text: '' });

  const minInputVal = minEdit.active
    ? minEdit.text
    : (minValue === '' || minValue == null ? String(safeSliderMin) : String(minValue));
  const maxInputVal = maxEdit.active
    ? maxEdit.text
    : (maxValue === '' || maxValue == null ? String(safeSliderMax) : String(maxValue));

  const span = Math.max(1, maxLimit - minLimit);
  const minPct = ((safeSliderMin - minLimit) / span) * 100;
  const maxPct = ((safeSliderMax - minLimit) / span) * 100;
  const putMinOnTop = safeSliderMin >= maxLimit - step * 2;

  const displayLabel = formatBudgetLabel({ min: safeSliderMin, max: safeSliderMax });

  const handleSliderMin = (e) => {
    const raw = Number(e.target.value);
    const nextMin = Math.min(raw, safeSliderMax);
    setMinEdit({ active: false, text: '' });
    onChange?.({ min: nextMin, max: safeSliderMax });
  };

  const handleSliderMax = (e) => {
    const raw = Number(e.target.value);
    const nextMax = Math.max(raw, safeSliderMin);
    setMaxEdit({ active: false, text: '' });
    onChange?.({ min: safeSliderMin, max: nextMax });
  };

  const handleMinInputChange = (e) => {
    const rawStr = e.target.value;
    setMinEdit({ active: true, text: rawStr });
    if (rawStr === '') return;
    const val = Number(rawStr);
    if (!Number.isFinite(val)) return;
    if (val >= minLimit && val <= safeSliderMax) {
      onChange?.({ min: val, max: safeSliderMax });
    }
  };

  const handleMaxInputChange = (e) => {
    const rawStr = e.target.value;
    setMaxEdit({ active: true, text: rawStr });
    if (rawStr === '') return;
    const val = Number(rawStr);
    if (!Number.isFinite(val)) return;
    if (val >= safeSliderMin && val <= maxLimit) {
      onChange?.({ min: safeSliderMin, max: val });
    }
  };

  const commitMinBlur = () => {
    const parsed = Number(minEdit.text);
    const nextMin = Number.isFinite(parsed)
      ? Math.max(minLimit, Math.min(safeSliderMax, parsed))
      : safeSliderMin;
    setMinEdit({ active: false, text: '' });
    onChange?.({ min: nextMin, max: safeSliderMax });
  };

  const commitMaxBlur = () => {
    const parsed = Number(maxEdit.text);
    const nextMax = Number.isFinite(parsed)
      ? Math.max(safeSliderMin, Math.min(maxLimit, parsed))
      : safeSliderMax;
    setMaxEdit({ active: false, text: '' });
    onChange?.({ min: safeSliderMin, max: nextMax });
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <label className="text-sm font-medium text-slate-700">{label}</label>
        <span className="text-sm font-bold text-[#081A35]">{displayLabel}</span>
      </div>

      {/* Dual-Thumb Range Track */}
      <div className="rumi-dual-range-wrap">
        <div className="rumi-dual-range-track" />
        <div
          className="rumi-dual-range-fill"
          style={{
            left: `${minPct}%`,
            width: `${Math.max(0, maxPct - minPct)}%`,
          }}
        />
        <input
          type="range"
          aria-label="Minimum monthly budget slider"
          min={minLimit}
          max={maxLimit}
          step={step}
          value={safeSliderMin}
          disabled={disabled}
          onChange={handleSliderMin}
          className="rumi-dual-range-input"
          style={{ zIndex: putMinOnTop ? 5 : 3 }}
        />
        <input
          type="range"
          aria-label="Maximum monthly budget slider"
          min={minLimit}
          max={maxLimit}
          step={step}
          value={safeSliderMax}
          disabled={disabled}
          onChange={handleSliderMax}
          className="rumi-dual-range-input"
          style={{ zIndex: 4 }}
        />
      </div>

      <div className="flex justify-between text-xs text-slate-400">
        <span>₹{minLimit.toLocaleString('en-IN')}</span>
        <span>₹{maxLimit.toLocaleString('en-IN')}</span>
      </div>

      {/* Synced Min & Max Inputs */}
      <div className="grid grid-cols-2 gap-4 pt-1">
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1.5">
            Minimum Budget (₹)
          </label>
          <input
            type="number"
            min={minLimit}
            max={safeSliderMax}
            step={500}
            value={minInputVal}
            disabled={disabled}
            onFocus={() => setMinEdit({ active: true, text: minInputVal })}
            onChange={handleMinInputChange}
            onBlur={commitMinBlur}
            className="rumi-form-field"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1.5">
            Maximum Budget (₹)
          </label>
          <input
            type="number"
            min={safeSliderMin}
            max={maxLimit}
            step={500}
            value={maxInputVal}
            disabled={disabled}
            onFocus={() => setMaxEdit({ active: true, text: maxInputVal })}
            onChange={handleMaxInputChange}
            onBlur={commitMaxBlur}
            className="rumi-form-field"
          />
        </div>
      </div>
    </div>
  );
};
