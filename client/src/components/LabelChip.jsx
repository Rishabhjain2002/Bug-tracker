// Coloured tag for a ticket label; the 8-digit hex adds transparency to the background
export default function LabelChip({ label }) {
  return (
    <span className="label-chip" style={{ color: label.color, background: `${label.color}1f` }}>
      {label.name}
    </span>
  );
}
