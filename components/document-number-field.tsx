type DocumentNumberFieldProps = {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
};

export function DocumentNumberField({
  id,
  label,
  value,
  onChange,
  placeholder,
}: DocumentNumberFieldProps) {
  return (
    <div className="space-y-2 w-full max-w-[50%] min-w-[10rem]">
      <label htmlFor={id} className="text-sm font-medium text-gray-700">
        {label}
      </label>
      <input
        id={id}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-white font-mono text-sm"
      />
    </div>
  );
}
