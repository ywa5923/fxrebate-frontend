import { Button } from "@/components/ui/button";
import { useTranslation } from "@/providers/translations";

type Props = {
  onBack: () => void;
  firstStep: boolean;
  finalStep: boolean;
  isSubmitting: boolean;
  submitted: boolean;
  nextDisabled?: boolean;
};

export default function BrokerRebateFormActions({
  onBack, firstStep, finalStep, isSubmitting, submitted, nextDisabled,
}: Props) {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-end gap-4 sm:gap-6">
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          disabled={firstStep || isSubmitting || submitted}
          className="h-11 w-full flex-1 rounded-[4px] border-[#0c110f] bg-transparent px-3 py-2 text-[#0c110f] opacity-50 shadow-[0px_3px_8.1px_rgba(0,0,0,0.22)] hover:bg-black/5 hover:text-[#0c110f] dark:border-white dark:text-white dark:hover:bg-white/10 dark:hover:text-white sm:w-[170px] sm:flex-none"
        >
          {t("setup_back")}
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting || submitted || nextDisabled}
          className="h-11 w-full flex-1 rounded-[4px] bg-[#0c110f] px-3 py-2 text-white shadow-[0px_3px_4px_rgba(0,0,0,0.22)] hover:bg-[#0c110f]/90 dark:bg-white dark:text-[#00150c] dark:hover:bg-white/90 sm:w-[170px] sm:flex-none"
        >
          {t(finalStep ? isSubmitting ? "setup_submitting" : "setup_submit" : "setup_continue")}
        </Button>
      </div>
    </div>
  );
}
