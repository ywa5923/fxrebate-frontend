"use client";

import { useMemo, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check } from "lucide-react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useTranslation, type Translations } from "@/providers/translations";
import type { HighestRebateBroker } from "@/types";
import type { SetupFormOptions } from "./setupFormData";
import { createSetupSchema, type SetupFormValues } from "./setupFormSchema";
import { submitBrokerRebate } from "./submitBrokerRebate";
import { t, tBroker, tSubmitError } from "./translations";

type Props = { broker: HighestRebateBroker; options: SetupFormOptions };
type TransferStep = 1 | 2;

const selectFields = [
  {
    name: "accountType",
    optionsKey: "accountTypes",
    labelKey: "setup_field_account_type",
    placeholderKey: "setup_select_account_type",
  },
  {
    name: "platform",
    optionsKey: "platforms",
    labelKey: "setup_field_platform",
    placeholderKey: "setup_select_platform",
  },
  {
    name: "jurisdiction",
    optionsKey: "jurisdictions",
    labelKey: "setup_field_jurisdiction",
    placeholderKey: "setup_select_jurisdiction",
  },
] as const;

const selectTriggerClassName =
  "w-full border-[#0c110f]/25 bg-transparent px-4 text-base text-[#0c110f] shadow-none data-[size=default]:h-12 data-[placeholder]:text-[#0c110f]/60 dark:border-white/25 dark:bg-transparent dark:text-white dark:data-[placeholder]:text-white/60 dark:data-[state=open]:bg-[#0c110f] dark:hover:bg-transparent";

const selectContentClassName =
  "border-[#0c110f]/15 bg-[#fff] text-[#0c110f] dark:border-white/25 dark:bg-[#202221] dark:text-white";

const inputClassName =
  "h-12 border-[#0c110f]/25 bg-transparent px-4 text-base text-[#0c110f] placeholder:text-[#0c110f]/60 dark:border-white/25 dark:bg-transparent dark:text-white dark:placeholder:text-white/60";

export default function BrokerRebateTransferForm({ broker, options }: Props) {
  const translations = useTranslation() as Translations;
  const [step, setStep] = useState<TransferStep>(1);
  const [showTransferHint, setShowTransferHint] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const schema = useMemo(() => createSetupSchema(translations), [translations]);
  const form = useForm<SetupFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      accountType: "",
      platform: "",
      jurisdiction: "",
      accountName: "",
      accountNumber: "",
      authorized: false,
    },
    mode: "onTouched",
  });

  async function handleContinue() {
    if (isSubmitting || submitted) return;
    if (step === 1) {
      const valid = await form.trigger(
        ["accountType", "platform", "jurisdiction"],
        { shouldFocus: true },
      );
      if (valid) setStep(2);
      return;
    }

    const valid = await form.trigger(undefined, { shouldFocus: true });
    if (!valid) return;

    setSubmitError(null);
    setIsSubmitting(true);
    try {
      const result = await submitBrokerRebate(
        broker.broker_id,
        form.getValues(),
        "transfer",
      );
      if (result.success) {
        setSubmitted(true);
      } else {
        setSubmitError(tSubmitError(translations, result));
      }
    } catch {
      setSubmitError(t(translations, "setup_submit_error"));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <div className="relative flex flex-col gap-16 overflow-hidden rounded-[11px] bg-[#f3f3f3] px-6 py-8 text-[#0c110f] transition-colors dark:bg-[#171f1c] dark:text-white sm:p-8">
        <ol className="flex w-full items-center justify-center gap-[13px]" aria-label={t(translations, "setup_transfer_steps")}>
          {([1, 2] as TransferStep[]).map((stepNumber) => {
            const active = step === stepNumber;
            const completed = step > stepNumber;
            return (
              <li key={stepNumber} className="flex min-w-0 items-center gap-[13px]">
                <div className="flex min-w-0 items-center gap-3">
                  <span className={cn(
                    "flex size-6 shrink-0 items-center justify-center rounded-full border-[1.5px]",
                    active
                      ? "border-[#ffd369]"
                      : completed
                        ? "border-[#1d885b] bg-[#1d885b] text-white"
                        : "border-[#0c110f]/25 dark:border-white/35",
                  )}>
                    {active && <span className="size-4 rounded-full bg-[#ffd369]" />}
                    {completed && <Check className="size-4" />}
                  </span>
                  <span className={cn(
                    "min-w-0 text-sm leading-[1.11] font-medium sm:text-base",
                    active || completed
                      ? "text-[#0c110f] dark:text-white"
                      : "text-[#0c110f]/60 dark:text-white/60",
                  )}>
                    {stepNumber === 1
                      ? t(translations, "setup_step_account_type")
                      : t(translations, "setup_step_details")}
                  </span>
                </div>
                {stepNumber === 1 && (
                  <span className="h-px w-[42px] shrink-0 bg-[#0c110f]/35 dark:bg-white/45 max-[359px]:w-5 sm:w-[82px]" aria-hidden />
                )}
              </li>
            );
          })}
        </ol>

        <form
          onSubmit={(event) => {
            event.preventDefault();
            void handleContinue();
          }}
          className={cn(
            "flex flex-col",
            step === 1
              ? "gap-[50px] dark:gap-8 sm:dark:gap-[50px]"
              : "gap-16 sm:gap-[50px]",
          )}
        >
          {step === 1 ? (
            <div className="flex flex-col gap-6 sm:gap-[50px]">
              <h2 className="text-[28px] leading-[1.11] font-bold sm:text-[32px]">
                {t(translations, "setup_transfer_account_type_title")}
              </h2>
              <div className="flex flex-col gap-6">
                {selectFields.map((config) => (
                  <FormField
                    key={config.name}
                    control={form.control}
                    name={config.name}
                    render={({ field }) => (
                      <FormItem className="grid gap-3 md:grid-cols-[minmax(0,1fr)_minmax(0,656px)] md:items-start md:gap-4">
                        <FormLabel className="text-base font-medium text-[#0c110f]/80 dark:text-white/80 md:pt-4">
                          {t(translations, config.labelKey)}
                        </FormLabel>
                        <div className="flex min-w-0 flex-col gap-3">
                          <Select
                            name={field.name}
                            value={field.value}
                            onValueChange={field.onChange}
                            onOpenChange={config.name === "accountType" ? (open) => {
                              if (open) setShowTransferHint(true);
                            } : undefined}
                          >
                            <FormControl>
                              <SelectTrigger ref={field.ref} onBlur={field.onBlur} className={selectTriggerClassName}>
                                <SelectValue placeholder={t(translations, config.placeholderKey)} />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className={selectContentClassName}>
                              {options[config.optionsKey].map((option) => (
                                <SelectItem key={option} value={option}>{option}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {config.name === "accountType" && showTransferHint && (
                            <div className="text-sm leading-normal text-[#0c110f]/80 dark:text-white/80">
                              <p className="text-[#ff6062]">
                                {t(translations, "setup_existing_referrer_warning")}
                              </p>
                              <p>{t(translations, "setup_open_new_email_hint")}</p>
                            </div>
                          )}
                          <FormMessage />
                        </div>
                      </FormItem>
                    )}
                  />
                ))}
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-6 sm:gap-[50px]">
              <h2 className="text-[28px] leading-[1.11] font-bold sm:text-[32px]">
                {t(translations, "setup_step_details")}
              </h2>
              <div className="flex flex-col gap-6">
                <FormField
                  control={form.control}
                  name="accountName"
                  render={({ field }) => (
                    <FormItem className="grid gap-3 md:grid-cols-[minmax(0,1fr)_minmax(0,656px)] md:items-center md:gap-4">
                      <FormLabel className="text-base font-medium text-[#0c110f]/80 dark:text-white/80">
                        {t(translations, "setup_field_account_name")}
                      </FormLabel>
                      <div className="min-w-0">
                        <FormControl>
                          <Input {...field} placeholder={t(translations, "setup_placeholder_account_name")} className={inputClassName} />
                        </FormControl>
                        <FormMessage className="mt-2" />
                      </div>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="accountNumber"
                  render={({ field }) => (
                    <FormItem className="grid gap-3 md:grid-cols-[minmax(0,1fr)_minmax(0,656px)] md:items-start md:gap-4">
                      <FormLabel className="text-base font-medium text-[#0c110f]/80 dark:text-white/80 md:pt-4">
                        {t(translations, "setup_field_account_number")}
                      </FormLabel>
                      <div className="flex min-w-0 flex-col gap-6 md:gap-3">
                        <div>
                          <FormControl>
                            <Input {...field} placeholder={t(translations, "setup_placeholder_account_number")} className={inputClassName} />
                          </FormControl>
                          <FormMessage className="mt-2" />
                        </div>
                        <FormField
                          control={form.control}
                          name="authorized"
                          render={({ field: authorizationField }) => (
                            <FormItem className="gap-2">
                              <div className="flex items-start gap-2">
                                <FormControl>
                                  <Checkbox
                                    checked={authorizationField.value}
                                    onCheckedChange={(checked) => authorizationField.onChange(checked === true)}
                                    className="mt-0.5 rounded-[3px] border-[#0c110f]/80 bg-transparent data-[state=checked]:border-[#0c110f] data-[state=checked]:bg-[#0c110f] data-[state=checked]:text-white dark:border-white/80 dark:bg-transparent dark:data-[state=checked]:border-white dark:data-[state=checked]:bg-[#fff] dark:data-[state=checked]:text-[#0c110f]"
                                  />
                                </FormControl>
                                <FormLabel className="text-sm leading-normal font-medium text-[#0c110f]/80 dark:text-white/80">
                                  {tBroker(translations, "setup_authorize_label", broker.trading_name)}
                                </FormLabel>
                              </div>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </FormItem>
                  )}
                />
              </div>
            </div>
          )}

          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-end gap-4 sm:gap-6">
              <Button
                type="button"
                variant="outline"
                disabled={step === 1 || isSubmitting || submitted}
                onClick={() => {
                  setSubmitError(null);
                  setStep(1);
                }}
                className="h-11 w-full flex-1 rounded-[4px] border-[#0c110f] bg-transparent px-3 py-2 text-[#0c110f] opacity-50 shadow-[0px_3px_8.1px_rgba(0,0,0,0.22)] hover:bg-black/5 hover:text-[#0c110f] dark:border-white dark:text-white dark:hover:bg-white/10 dark:hover:text-white sm:w-[170px] sm:flex-none"
              >
                {t(translations, "setup_back")}
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || submitted}
                className="h-11 w-full flex-1 rounded-[4px] bg-[#0c110f] px-3 py-2 text-white shadow-[0px_3px_4px_rgba(0,0,0,0.22)] hover:bg-[#0c110f]/90 dark:bg-[#fff] dark:text-[#00150c] dark:hover:bg-[#fff]/90 sm:w-[170px] sm:flex-none"
              >
                {step === 1
                  ? t(translations, "setup_continue")
                  : isSubmitting
                    ? t(translations, "setup_submitting")
                    : t(translations, "setup_submit")}
              </Button>
            </div>
            {submitError && <p role="alert" className="text-sm text-[#c93639] dark:text-[#ff6062]">{submitError}</p>}
            {submitted && <p role="status" className="text-sm text-[#1d885b] dark:text-[#8de0b5]">{t(translations, "setup_submit_success")}</p>}
          </div>
        </form>
        <div className="pointer-events-none absolute inset-x-0 top-[88px] h-px bg-black/20 dark:bg-black/80" aria-hidden />
      </div>
    </Form>
  );
}
