import { LABEL_CLASS } from '@/app/components/ui/formStyles';

interface OptionCardsProps<T extends string> {
  label: string;
  value: T;
  onChange: (value: T) => void;
  options: Array<{ value: T; label: string; desc: string; disabled?: boolean }>;
}

export default function OptionCards<T extends string>({
  label,
  value,
  onChange,
  options,
}: OptionCardsProps<T>) {
  return (
    <div className="flex flex-col gap-2">
      <span className={LABEL_CLASS}>{label}</span>
      <div className="grid grid-cols-2 gap-2">
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            disabled={option.disabled}
            onClick={() => onChange(option.value)}
            className={`flex flex-col gap-0.5 border px-4 py-3 text-left transition-colors duration-150 ${
              option.disabled
                ? 'cursor-not-allowed border-(--green-deep)/10 opacity-40'
                : 'cursor-pointer'
            } ${
              value === option.value
                ? 'border-(--green-deep) bg-(--green-deep)/5'
                : 'border-(--green-deep)/20 hover:border-(--green-deep)/40'
            }`}
          >
            <span className="text-[13px] font-semibold text-(--green-deep)">{option.label}</span>
            <span className="text-[11px] text-(--green-deep) opacity-50">{option.desc}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
