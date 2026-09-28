"use client";

import { useState } from "react";
import { Form } from "@/components/ui/form";
import { cn } from "@/lib/utils";
import BrokerRebateNotes from "./BrokerRebateNotes";
import { BrokerRebateAccountFields, BrokerRebateAccountDetails } from "./BrokerRebateFormFields";
import BrokerRebateFormActions from "./BrokerRebateFormActions";
import BrokerRebateSteps from "./BrokerRebateSteps";
import BrokerRebateSuccess from "./BrokerRebateSuccess";
import { useBrokerRebateForm, type BrokerRebateFormProps } from "./useBrokerRebateForm";
import { t } from "./translations";

type TransferStep = 1 | 2;
const STEP_LABELS = ["setup_step_account_type", "setup_step_details"] as const;

export default function BrokerRebateTransferForm(props: BrokerRebateFormProps) {
  const { data, brokerName } = props;
  const [step, setStep] = useState<TransferStep>(1);
  const { form, translations, validateAccount, submit, isSubmitting, submitted } =
    useBrokerRebateForm(props, "transfer");

  async function handleContinue() {
    if (isSubmitting || submitted) return;
    if (step === 1) {
      if (await validateAccount()) setStep(2);
    } else {
      await submit();
    }
  }

  if (submitted) {
    return <BrokerRebateSuccess />;
  }

  return (
    <Form {...form}>
      <BrokerRebateNotes notes={data.transfer_account_notes} className="rounded-[11px] bg-[#f3f3f3] px-6 py-6 text-sm leading-normal text-[#0c110f] dark:bg-[#171f1c] dark:text-white sm:px-8 sm:text-base" />
      <div className="flex flex-col gap-8 overflow-hidden rounded-[11px] bg-[#f3f3f3] px-6 py-8 text-[#0c110f] transition-colors dark:bg-[#171f1c] dark:text-white sm:p-8">
        <div className="-mx-6 border-b-4 border-white px-6 pb-8 sm:-mx-8 sm:px-8">
          <BrokerRebateSteps
            labels={STEP_LABELS.map((key) => t(translations, key))}
            currentStep={step}
            ariaLabel={t(translations, "setup_transfer_steps")}
          />
        </div>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            void handleContinue();
          }}
          aria-busy={isSubmitting}
          className={cn(
            "flex flex-col",
            step === 1 ? "gap-[50px] dark:gap-8 sm:dark:gap-[50px]" : "gap-16 sm:gap-[50px]",
          )}
        >
          <fieldset disabled={isSubmitting || submitted} className="flex min-w-0 flex-col gap-6 sm:gap-[50px]">
            <h2 className="text-[28px] font-bold leading-[1.11] sm:text-[32px]">
              {t(translations, step === 1 ? "setup_transfer_account_type_title" : "setup_step_details")}
            </h2>
            {step === 1 ? (
              <BrokerRebateAccountFields accountTypes={data.account_types} />
            ) : (
              <BrokerRebateAccountDetails brokerName={brokerName} transfer />
            )}
          </fieldset>
          <BrokerRebateFormActions
            firstStep={step === 1}
            finalStep={step === 2}
            onBack={() => {
              setStep(1);
            }}
            isSubmitting={isSubmitting}
            submitted={submitted}
            nextDisabled={step === 1 && data.account_types.length === 0}
          />
        </form>
      </div>
    </Form>
  );
}
