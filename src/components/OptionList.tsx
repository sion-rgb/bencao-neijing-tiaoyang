type Option = { id: string; label: string };

export function OptionList({
  legend,
  options,
  selected,
  multiple,
  onChange,
  describedBy
}: {
  legend: string;
  options: Option[];
  selected: string[];
  multiple?: boolean;
  onChange: (value: string[]) => void;
  describedBy?: string;
}) {
  const toggle = (id: string) => {
    if (!multiple) return onChange([id]);
    const isNone = id.endsWith("_none") || id.endsWith("_unsure");
    if (isNone) return onChange(selected.includes(id) ? [] : [id]);
    const next = selected.filter((item) => !item.endsWith("_none") && !item.endsWith("_unsure"));
    onChange(next.includes(id) ? next.filter((item) => item !== id) : [...next, id]);
  };

  return (
    <fieldset className="option-fieldset" aria-describedby={describedBy}>
      <legend className="sr-only">{legend}</legend>
      {options.map((option) => {
        const checked = selected.includes(option.id);
        return (
          <label key={option.id} className={`option-card ${checked ? "selected" : ""}`}>
            <input type={multiple ? "checkbox" : "radio"} name={legend} value={option.id} checked={checked} onChange={() => toggle(option.id)} />
            <span className="option-indicator" aria-hidden="true" />
            <span>{option.label}</span>
          </label>
        );
      })}
    </fieldset>
  );
}
