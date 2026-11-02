import { Check } from 'lucide-react';
import { COLORS } from '../constants';

// Row of colour swatches; the selected one shows a tick
export default function ColorPicker({ value, onChange }) {
  return (
    <div className="color-picker" role="radiogroup" aria-label="Color">
      {COLORS.map((color) => {
        const selected = value === color.value;
        return (
          <button
            key={color.value}
            type="button"
            className={`color-swatch${selected ? ' selected' : ''}`}
            style={{ background: color.value }}
            title={color.name}
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(color.value)}
          >
            {selected && <Check size={14} strokeWidth={3} />}
          </button>
        );
      })}
    </div>
  );
}
