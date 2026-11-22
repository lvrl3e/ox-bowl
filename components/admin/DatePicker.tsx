"use client";

interface DatePickerProps {
  name: string;
  defaultValue: string;
  max: string;
}

export default function DatePicker({ name, defaultValue, max }: DatePickerProps) {
  return (
    <input
      type="date"
      name={name}
      defaultValue={defaultValue}
      max={max}
      onChange={(e) => e.currentTarget.form?.requestSubmit()}
      className="bg-bg2 border border-line rounded-btn px-2 py-1 text-cream text-[11px] font-body w-[128px]"
    />
  );
}
