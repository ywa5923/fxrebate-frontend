"use client";

import { useState } from "react";
import { Form } from "@/components/ui/form";
import { cn } from "@/lib/utils";
import BrokerRebateNotes from "./BrokerRebateNotes";
import BrokerRebateRegistrationLinks from "./BrokerRebateRegistrationLinks";
import { BrokerRebateAccountFields, BrokerRebateAccountDetails } from "./BrokerRebateFormFields";
import BrokerRebateFormActions from "./BrokerRebateFormActions";
import BrokerRebateSteps from "./BrokerRebateSteps";
import BrokerRebateSuccess from "./BrokerRebateSuccess";
import { useBrokerRebateForm, type BrokerRebateFormProps } from "./useBrokerRebateForm";
import { t } from "./translations";

type SetupStep = 1 | 2 | 3;
const STEP_LABELS = ["setup_step_new_account", "setup_step_account_type", "setup_step_details"] as const;

export default function BrokerRebateSetupForm(props: BrokerRebateFormProps) {
  const { data, brokerName } = props;
  const [step, setStep] = useState<SetupStep>(1);
  const { form, translations, validateAccount, submit, isSubmitting, submitted } =
    useBrokerRebateForm(props, "new_account");

  async function handleContinue() {
    if (isSubmitting || submitted) return;
    if (step === 1) {
      setStep(2);
    } else if (step === 2) {
      if (await validateAccount()) setStep(3);
    } else {
      await submit();
    }
  }

  if (submitted) {
    return <BrokerRebateSuccess />;
  }

  return (
    <Form {...form}>
      <BrokerRebateNotes
        notes={data.general_account_setup_notes}
        className={cn(
          "rounded-[11px] bg-[#f3f3f3] px-6 py-6 text-sm leading-normal text-[#0c110f] dark:bg-[#171f1c] dark:text-white sm:px-8 sm:text-base",
          step !== 1 && "sm:hidden",
        )}
      />
      <div className="flex flex-col gap-8 overflow-hidden rounded-[11px] bg-[#f3f3f3] px-6 py-8 text-[#0c110f] transition-colors dark:bg-[#171f1c] dark:text-white sm:p-8">
        <div className="-mx-6 border-b-4 border-white px-6 pb-8 sm:-mx-8 sm:px-8">
          <BrokerRebateSteps
            labels={STEP_LABELS.map((key) => t(translations, key))}
            currentStep={step}
            ariaLabel={t(translations, "setup_new_steps")}
            verticalOnMobile
          />
        </div>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            void handleContinue();
          }}
          aria-busy={isSubmitting}
          className="flex flex-col gap-[50px]"
        >
          {step === 1 && (
            <BrokerRebateRegistrationLinks
              links={data.ib_links}
              buttonLabel={t(translations, "setup_open_account")}
              emptyLabel={t(translations, "setup_registration_unavailable")}
            />
          )}
          {step === 2 && (
            <fieldset disabled={isSubmitting || submitted} className="flex min-w-0 flex-col gap-6 sm:gap-[50px]">
              <h2 className="text-[28px] font-bold leading-[1.1] sm:text-[32px]">
                <span className="sm:hidden">{t(translations, "setup_step_account_type_mobile")}</span>
                <span className="hidden sm:inline">{t(translations, "setup_step_account_type")}</span>
              </h2>
              <BrokerRebateAccountFields accountTypes={data.account_types} />
            </fieldset>
          )}
          {step === 3 && (
            <fieldset disabled={isSubmitting || submitted} className="flex min-w-0 flex-col gap-6 sm:gap-[50px]">
              <h2 className="text-[28px] font-bold leading-[1.1] sm:text-[32px]">
                {t(translations, "setup_step_details")}
              </h2>
              <BrokerRebateAccountDetails brokerName={brokerName} />
            </fieldset>
          )}
          <BrokerRebateFormActions
            firstStep={step === 1}
            finalStep={step === 3}
            onBack={() => {
              if (step > 1) setStep((current) => (current - 1) as SetupStep);
            }}
            isSubmitting={isSubmitting}
            submitted={submitted}
            nextDisabled={step === 2 && data.account_types.length === 0}
          />
        </form>
      </div>
    </Form>
  );
}
