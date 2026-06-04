import { PREFECTURES } from "@/lib/prefectures";

const DEFAULT_CLASS =
  "w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm bg-white";

type Props = {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  disabled?: boolean;
  id?: string;
};

export function PrefectureSelect({
  value,
  onChange,
  className = DEFAULT_CLASS,
  disabled = false,
  id,
}: Props) {
  return (
    <select
      id={id}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      className={className}
    >
      <option value="">選択してください</option>
      {PREFECTURES.map((pref) => (
        <option key={pref} value={pref}>
          {pref}
        </option>
      ))}
    </select>
  );
}
