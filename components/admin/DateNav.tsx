import DatePicker from "@/components/admin/DatePicker";

export default function DateNav({
  paramName,
  selectedDate,
  todayStr,
}: {
  paramName: string;
  selectedDate: string;
  todayStr: string;
}) {
  return (
    <form method="GET">
      <DatePicker name={paramName} defaultValue={selectedDate} max={todayStr} />
    </form>
  );
}
