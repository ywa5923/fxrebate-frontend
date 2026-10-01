import { useTranslation } from "@/providers/translations";

type Props = { notes: string[]; className?: string };

export default function BrokerRebateNotes({ notes, className }: Props) {
  const { t } = useTranslation();
  if (notes.length === 0) return null;

  return (
    <div className={className}>
      <h2 className="mb-4 text-base font-semibold leading-tight">
        {t("setup_notes_title")}
      </h2>
      <ol role="list" className="flex list-none flex-col gap-3">
        {notes.map((note, index) => (
          <li key={index} className="flex min-w-0 items-start gap-3">
            <span
              aria-hidden="true"
              className="flex size-7 shrink-0 items-center justify-center rounded-full bg-[#ffd369] px-1 text-xs font-bold text-[#0c110f]"
            >
              {index + 1}
            </span>
            <span className="min-w-0 whitespace-pre-line pt-0.5 [overflow-wrap:anywhere]">
              {note}
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}
