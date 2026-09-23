"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Check, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTranslation, type Translations } from "@/providers/translations";
import type { HighestRebateBroker } from "@/types";
import type { SetupFormOptions } from "./setupFormData";
import { setupSchema, type SetupFormValues } from "./setupFormSchema";
import { submitBrokerRebate } from "./submitBrokerRebate";

type SetupStep = 1 | 2 | 3;
type Props = { broker: HighestRebateBroker; options: SetupFormOptions };

const selectTriggerClassName =
  "w-full border-[#0c110f]/25 bg-transparent px-4 text-base text-[#0c110f] shadow-none data-[size=default]:h-12 data-[placeholder]:text-[#0c110f]/60 dark:border-white/25 dark:bg-transparent dark:text-white dark:data-[placeholder]:text-white/60 dark:hover:bg-transparent";

const selectContentClassName =
  "border-[#0c110f]/15 bg-white text-[#0c110f] dark:border-white/25 dark:bg-[#202221] dark:text-white";

const inputClassName =
  "h-12 border-[#0c110f]/25 bg-transparent px-4 text-base text-[#0c110f] placeholder:text-[#0c110f]/60 dark:border-white/25 dark:bg-transparent dark:text-white dark:placeholder:text-white/60";

const STEP_LABELS: Record<SetupStep, { key: string; fallback: string }> = {
  1: { key: "setup_step_new_account", fallback: "New Account" },
  2: { key: "setup_step_account_type", fallback: "Account Type" },
  3: { key: "setup_step_details", fallback: "Account Details" },
};

function t(translations: Translations, key: string, fallback: string): string {
  const value = translations[key];
  return typeof value === "string" && value.length > 0 ? value : fallback;
}

export default function BrokerRebateSetupForm({ broker, options }: Props) {
  const translations = useTranslation() as Translations;
  const [step, setStep] = useState<SetupStep>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const form = useForm<SetupFormValues>({
    resolver: zodResolver(setupSchema),
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

  function handleBack() {
    setSubmitError(null);
    if (step > 1) setStep((current) => (current - 1) as SetupStep);
  }

  async function handleContinue() {
    if (isSubmitting || submitted) return;
    if (step === 1) {
      setStep(2);
    } else if (step === 2) {
      const valid = await form.trigger(
        ["accountType", "platform", "jurisdiction"],
        { shouldFocus: true },
      );
      if (valid) setStep(3);
    } else {
      const valid = await form.trigger(undefined, { shouldFocus: true });
      if (!valid) return;

      setSubmitError(null);
      setIsSubmitting(true);
      try {
        const result = await submitBrokerRebate(broker.broker_id, form.getValues());
        if (result.success) {
          setSubmitted(true);
        } else {
          setSubmitError(result.message || t(translations, "setup_submit_error", "Could not submit the rebate request."));
        }
      } catch {
        setSubmitError(t(translations, "setup_submit_error", "Could not submit the rebate request."));
      } finally {
        setIsSubmitting(false);
      }
    }
  }

  return (
    <Form {...form}>
      <div className={cn(
        "rounded-[11px] bg-[#f3f3f3] px-6 py-6 text-sm leading-normal text-[#0c110f] dark:bg-[#171f1c] dark:text-white sm:px-8 sm:text-base",
        step !== 1 && "sm:hidden",
      )}>
        {t(translations, "setup_note", "Note: Continue the sign up process once you got the details from the broker.")}
      </div>
      <div className="relative flex flex-col gap-16 overflow-hidden rounded-[11px] bg-[#f3f3f3] px-6 py-8 text-[#0c110f] transition-colors dark:bg-[#171f1c] dark:text-white sm:p-8">
      <ol className="hidden w-full max-w-[600px] items-center justify-center gap-[13px] overflow-visible pb-1 sm:mx-auto sm:flex">
        {([1, 2, 3] as SetupStep[]).map((stepNumber, index) => {
          const active = step === stepNumber;
          const completed = step > stepNumber;
          const label = STEP_LABELS[stepNumber];
          return (
            <li key={stepNumber} className="flex shrink-0 items-center gap-3">
              <div className="flex shrink-0 items-center gap-3">
                <span className={cn(
                  "relative flex size-6 items-center justify-center rounded-full border-[1.5px]",
                  active
                    ? "border-[#ffd369]"
                    : completed
                      ? "border-[#1d885b] bg-[#1d885b] text-white"
                      : "border-black/25 text-transparent dark:border-white/35",
                )}>
                  {active && <span className="size-4 rounded-full bg-[#ffd369]" />}
                  {completed && <Check className="size-4" />}
                </span>
                <span className={cn(
                  "whitespace-nowrap text-base font-medium",
                  active || completed
                    ? "text-[#0c110f] dark:text-white"
                    : stepNumber === 2
                      ? "text-[#0c110f] dark:text-white/60"
                      : "text-[#0c110f]/60 dark:text-white/60",
                )}>
                  {step === 3 && stepNumber === 1
                    ? t(translations, "setup_step_account_setup", "Account Step up")
                    : t(translations, label.key, label.fallback)}
                </span>
              </div>
              {index < 2 && <span className="h-px w-[82px] shrink-0 bg-black/35 dark:bg-white/45" aria-hidden />}
            </li>
          );
        })}
      </ol>
      <ol className="flex flex-col gap-[13px] sm:hidden">
        {([1, 2, 3] as SetupStep[]).map((stepNumber, index) => {
          const active = step === stepNumber;
          const completed = step > stepNumber;
          const label = STEP_LABELS[stepNumber];
          return (
            <li key={stepNumber} className="flex flex-col gap-0">
              <div className="flex items-center gap-3">
                <span className={cn(
                  "relative flex size-6 shrink-0 items-center justify-center rounded-full border-[1.5px]",
                  active
                    ? "border-[#ffd369]"
                    : completed
                      ? "border-[#1d885b] bg-[#1d885b] text-white"
                      : "border-black/25 dark:border-white/35",
                )}>
                  {active && <span className="size-4 rounded-full bg-[#ffd369]" />}
                  {completed && <Check className="size-4" />}
                </span>
                <span className={cn(
                  "whitespace-nowrap text-sm font-medium",
                  active
                    ? "text-[#0c110f] dark:text-white"
                    : "text-[#0c110f]/60 dark:text-white/60",
                )}>
                  {t(translations, label.key, label.fallback)}
                </span>
              </div>
              {index < 2 && <span className="ml-[11px] mt-[13px] h-[42px] w-px bg-black/25 dark:bg-white/35" aria-hidden />}
            </li>
          );
        })}
      </ol>

      <form
        onSubmit={(event) => {
          event.preventDefault();
          void handleContinue();
        }}
        className="flex flex-col gap-[50px]"
      >
        {step === 1 && (
          <div className="flex flex-col gap-10">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between lg:gap-8">
              <h2 className="text-[28px] font-bold leading-[1.1] sm:text-[32px]">
                {t(translations, "setup_open_account_title", "Open a " + broker.trading_name + " account")}
              </h2>
              <Button type="button" onClick={() => void handleContinue()} className="flex h-12 w-full shrink-0 items-center justify-between rounded-lg border border-[#1d885b] bg-gradient-to-r from-[rgba(0,106,61,0.8)] to-[rgba(0,66,23,0.8)] pl-6 pr-2 text-left text-base font-medium text-white hover:brightness-110 sm:w-[255px]">
                {t(translations, "setup_open_account", "Open an account")}
                <span className="flex size-8 items-center justify-center rounded-[5px] bg-[#1d885b]"><ChevronRight className="size-5" /></span>
              </Button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="flex flex-col gap-6 sm:gap-[50px]">
            <h2 className="text-[28px] font-bold leading-[1.1] sm:text-[32px]">
              <span className="sm:hidden">
                {t(translations, "setup_step_account_type_mobile", "Account Type & Plateform")}
              </span>
              <span className="hidden sm:inline">
                {t(translations, "setup_step_account_type", "Account Type")}
              </span>
            </h2>
            <div className="flex flex-col gap-6">
              <FormField
                control={form.control}
                name="accountType"
                render={({ field }) => (
                  <FormItem className="grid gap-3 md:grid-cols-[minmax(0,1fr)_minmax(0,656px)] md:items-start md:gap-4">
                    <FormLabel className="text-base font-medium text-[#0c110f]/80 dark:text-white/80 md:pt-4">
                      {t(translations, "setup_field_account_type", "Account type")}
                    </FormLabel>
                    <div className="flex min-w-0 flex-col gap-3">
                      <Select name={field.name} value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger ref={field.ref} onBlur={field.onBlur} className={selectTriggerClassName}>
                            <SelectValue placeholder={t(translations, "setup_select_account_type", "Select account type")} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className={selectContentClassName}>
                          {options.accountTypes.map((option) => (
                            <SelectItem key={option} value={option}>{option}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <div className="hidden text-sm leading-normal text-[#0c110f]/80 dark:text-white/80 md:block">
                        <p className="text-[#ff6062]">
                          {t(translations, "setup_existing_referrer_warning", "Existing accounts linked to a different referrer cannot be transferred.")}
                        </p>
                        <p>
                          {t(translations, "setup_open_new_email_hint", "Instead please open a new account using a different email.")}
                        </p>
                      </div>
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="platform"
                render={({ field }) => (
                  <FormItem className="grid gap-3 md:grid-cols-[minmax(0,1fr)_minmax(0,656px)] md:items-center md:gap-4">
                    <FormLabel className="text-base font-medium text-[#0c110f]/80 dark:text-white/80">
                      {t(translations, "setup_field_platform", "Trading platform")}
                    </FormLabel>
                    <div className="min-w-0">
                      <Select name={field.name} value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger ref={field.ref} onBlur={field.onBlur} className={selectTriggerClassName}>
                            <SelectValue placeholder={t(translations, "setup_select_platform", "Select")} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className={selectContentClassName}>
                          {options.platforms.map((option) => (
                            <SelectItem key={option} value={option}>{option}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage className="mt-2" />
                    </div>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="jurisdiction"
                render={({ field }) => (
                  <FormItem className="grid gap-3 md:grid-cols-[minmax(0,1fr)_minmax(0,656px)] md:items-center md:gap-4">
                    <FormLabel className="text-base font-medium text-[#0c110f]/80 dark:text-white/80">
                      {t(translations, "setup_field_jurisdiction", "Jurisdiction")}
                    </FormLabel>
                    <div className="min-w-0">
                      <Select name={field.name} value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger ref={field.ref} onBlur={field.onBlur} className={selectTriggerClassName}>
                            <SelectValue placeholder={t(translations, "setup_select_jurisdiction", "Select")} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className={selectContentClassName}>
                          {options.jurisdictions.map((option) => (
                            <SelectItem key={option} value={option}>{option}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage className="mt-2" />
                    </div>
                  </FormItem>
                )}
              />
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="flex flex-col gap-6 sm:gap-[50px]">
            <h2 className="text-[28px] font-bold leading-[1.1] sm:text-[32px]">
              {t(translations, "setup_step_details", "Account Details")}
            </h2>
            <div className="flex flex-col gap-6">
              <FormField
                control={form.control}
                name="accountName"
                render={({ field }) => (
                  <FormItem className="grid gap-3 md:grid-cols-[minmax(0,1fr)_minmax(0,656px)] md:items-center md:gap-4">
                    <FormLabel className="text-base font-medium text-[#0c110f]/80 dark:text-white/80">
                      {t(translations, "setup_field_account_name", "Account Name")}
                    </FormLabel>
                    <div className="min-w-0">
                      <FormControl>
                        <Input {...field} placeholder={t(translations, "setup_placeholder_account_name", "Enter account name")} className={inputClassName} />
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
                      {t(translations, "setup_field_account_number", "Account Number")}
                    </FormLabel>
                    <div className="flex min-w-0 flex-col gap-6 md:gap-8">
                      <div>
                        <FormControl>
                          <Input {...field} placeholder={t(translations, "setup_placeholder_account_number", "Enter account number")} className={inputClassName} />
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
                                  className="mt-0.5 rounded-[3px] border-[#0c110f]/80 bg-transparent data-[state=checked]:border-[#0c110f] data-[state=checked]:bg-[#0c110f] data-[state=checked]:text-white dark:border-white/80 dark:bg-transparent dark:data-[state=checked]:border-white dark:data-[state=checked]:bg-white dark:data-[state=checked]:text-[#0c110f]"
                                />
                              </FormControl>
                              <FormLabel className="text-sm leading-normal font-medium text-[#0c110f]/80 dark:text-white/80">
                                {t(translations, "setup_authorize_label", "I authorise FXRebate to contact " + broker.trading_name + " on my behalf, if needed to set FXRebate as my referrer (IB).")}
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
          <div className="flex flex-row items-center justify-end gap-4 sm:gap-6">
            <Button type="button" variant="outline" onClick={handleBack} disabled={step === 1 || isSubmitting || submitted} className="h-11 w-full flex-1 rounded-[4px] border-[#0c110f] bg-transparent px-3 py-2 text-[#0c110f] opacity-50 shadow-[0px_3px_8.1px_rgba(0,0,0,0.22)] hover:bg-black/5 hover:text-[#0c110f] dark:border-white dark:text-white dark:hover:bg-white/10 dark:hover:text-white sm:w-[170px] sm:flex-none">
              {t(translations, "setup_back", "Back")}
            </Button>
            <Button type="submit" disabled={isSubmitting || submitted} className="h-11 w-full flex-1 rounded-[4px] bg-[#0c110f] px-3 py-2 text-white shadow-[0px_3px_4px_rgba(0,0,0,0.22)] hover:bg-[#0c110f]/90 dark:bg-white dark:text-[#00150c] dark:hover:bg-white/90 sm:w-[170px] sm:flex-none">
              {step === 3
                ? isSubmitting
                  ? t(translations, "setup_submitting", "Sending...")
                  : t(translations, "setup_submit", "Get Rebate")
                : t(translations, "setup_continue", "Next")}
            </Button>
          </div>
          {submitError && <p role="alert" className="text-sm text-[#c93639] dark:text-[#ff6062]">{submitError}</p>}
          {submitted && <p role="status" className="text-sm text-[#1d885b] dark:text-[#8de0b5]">{t(translations, "setup_submit_success", "Rebate request sent.")}</p>}
        </div>
      </form>
      <div className="pointer-events-none absolute inset-x-0 top-[264px] h-px bg-black/20 dark:bg-black/80 sm:top-[88px]" aria-hidden />
      </div>
    </Form>
  );
}
