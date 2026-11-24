import React, { useState } from 'react';
import { BUDGET_MAX, BUDGET_MIN, RENT_STEP, formatSingleAmount } from '../../utils/budget';

/**
 * Single fixed monthly rent slider + synced numeric input for Offer-a-Room listings.
 */
export const RentSliderInput = ({
  value,
  onChange,
  minLimit = BUDGET_MIN,
  maxLimit = BUDGET_MAX,
  step = RENT_STEP,
  label = 'Monthly Rent',
  disabled = false,
}) => {
  const numVal = Number(value);
  const clampedSliderVal = Number.isFinite(numVal) && numVal > 0
    ? Math.max(minLimit, Math.min(maxLimit, numVal))
    : minLimit;

  const [editState, setEditState] = useState({ active: false, text: '' });

  const inputVal = editState.active
    ? editState.text
    : (value === '' || value == null ? String(clampedSliderVal) : String(value));

  const handleSlider = (e) => {
    const next = Number(e.target.value);
    setEditState({ active: false, text: '' });
    onChange?.(next);
  };

  const handleInputChange = (e) => {
    const rawStr = e.target.value;
    setEditState({ active: true, text: rawStr });
    if (rawStr === '') return;
    const val = Number(rawStr);
    if (Number.isFinite(val)) {
      onChange?.(val);
    }
  };

  const commitBlur = () => {
    const parsed = Number(editState.text);
    const next = Number.isFinite(parsed) && parsed > 0
      ? Math.max(minLimit, Math.min(maxLimit, parsed))
      : clampedSliderVal;
    setEditState({ active: false, text: '' });
    onChange?.(next);
  };

  const displayRent = formatSingleAmount(numVal > 0 ? numVal : clampedSliderVal);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <label className="text-sm font-medium text-slate-700">{label}</label>
        <span className="text-sm font-bold text-[#081A35]">{displayRent}</span>
      </div>

      <input
        type="range"
        aria-label="Monthly rent slider"
        min={minLimit}
        max={maxLimit}
        step={step}
        value={clampedSliderVal}
        disabled={disabled}
        onChange={handleSlider}
        className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#081A35]"
      />

      <div className="flex justify-between text-xs text-slate-400">
        <span>₹{minLimit.toLocaleString('en-IN')}</span>
        <span>₹{maxLimit.toLocaleString('en-IN')}</span>
      </div>

      <div>
        <label className="block text-xs font-medium text-slate-700 mb-1.5">
          Exact Monthly Rent (₹)
        </label>
        <input
          type="number"
          min={minLimit}
          max={maxLimit}
          step={step}
          value={inputVal}
          disabled={disabled}
          onFocus={() => setEditState({ active: true, text: inputVal })}
          onChange={handleInputChange}
          onBlur={commitBlur}
          placeholder="e.g. 18000"
          className="rumi-form-field"
        />
      </div>
    </div>
  );
};
