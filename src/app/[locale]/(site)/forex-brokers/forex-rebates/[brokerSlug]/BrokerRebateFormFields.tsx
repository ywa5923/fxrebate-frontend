"use client";

import { useFormContext, useWatch } from "react-hook-form";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/providers/translations";
import type { SetupAccountType } from "./setupFormData";
import type { SetupFormValues } from "./setupFormSchema";
import { t } from "./translations";

const selectFields = [
  { name: "accountType", label: "setup_field_account_type", placeholder: "setup_select_account_type" },
  { name: "platform", label: "setup_field_platform", placeholder: "setup_select_platform" },
  { name: "jurisdiction", label: "setup_field_jurisdiction", placeholder: "setup_select_jurisdiction" },
] as const;

export function BrokerRebateAccountFields({ accountTypes }: { accountTypes: SetupAccountType[] }) {
  const translations = useTranslation();
  const form = useFormContext<SetupFormValues>();
  const accountName = useWatch({ control: form.control, name: "accountType" });
  const selectedAccount = accountTypes.find((account) => account.account_type_name === accountName);
  const options = {
    accountType: accountTypes.map((account) => ({ value: account.account_type_name, label: account.account_type_name })),
    platform: selectedAccount?.platform_urls ?? [],
    jurisdiction: selectedAccount?.jurisdictions ?? [],
  };

  return (
    <div className="flex flex-col gap-6">
      {accountTypes.length === 0 && (
        <p role="status" className="text-sm">{t(translations, "setup_service_unavailable")}</p>
      )}
      {selectFields.map((config) => (
        <FormField
          key={config.name}
          control={form.control}
          name={config.name}
          render={({ field }) => (
            <FormItem className="grid gap-3 md:grid-cols-[minmax(0,1fr)_minmax(0,656px)] md:items-start md:gap-4">
              <FormLabel className="text-base font-medium text-[#0c110f]/80 dark:text-white/80 md:pt-4">
                {t(translations, config.label)}
              </FormLabel>
              <div className="flex min-w-0 flex-col gap-3">
                <Select
                  name={field.name}
                  value={field.value}
                  disabled={options[config.name].length === 0}
                  onValueChange={(value) => {
                    field.onChange(value);
                    if (config.name === "accountType") {
                      form.resetField("platform");
                      form.resetField("jurisdiction");
                    }
                  }}
                >
                  <FormControl>
                    <SelectTrigger
                      ref={field.ref}
                      onBlur={field.onBlur}
                      className="w-full min-w-0 border-[#0c110f]/25 bg-transparent px-4 text-base text-[#0c110f] shadow-none data-[size=default]:h-12 data-[placeholder]:text-[#0c110f]/60 dark:border-white/25 dark:bg-transparent dark:text-white dark:data-[placeholder]:text-white/60 dark:hover:bg-transparent [&_[data-slot=select-value]]:min-w-0"
                    >
                      <SelectValue placeholder={t(translations, config.placeholder)} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="w-[var(--radix-select-trigger-width)] border-[#0c110f]/15 bg-white text-[#0c110f] dark:border-white/25 dark:bg-[#202221] dark:text-white">
                    {options[config.name].map((option) => (
                      <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </div>
            </FormItem>
          )}
        />
      ))}
    </div>
  );
}

const detailFields = [
  { name: "accountName", label: "setup_field_account_name", placeholder: "setup_placeholder_account_name" },
  { name: "accountNumber", label: "setup_field_account_number", placeholder: "setup_placeholder_account_number" },
] as const;

export function BrokerRebateAccountDetails({ brokerName, transfer = false }: { brokerName: string; transfer?: boolean }) {
  const translations = useTranslation();
  const { control } = useFormContext<SetupFormValues>();

  return (
    <div className="flex flex-col gap-6">
      {detailFields.map((config) => (
        <FormField
          key={config.name}
          control={control}
          name={config.name}
          render={({ field }) => (
            <FormItem className="grid gap-3 md:grid-cols-[minmax(0,1fr)_minmax(0,656px)] md:items-start md:gap-4">
              <FormLabel className="text-base font-medium text-[#0c110f]/80 dark:text-white/80 md:pt-4">
                {t(translations, config.label)}
              </FormLabel>
              <div className={cn("flex min-w-0 flex-col gap-6", transfer ? "md:gap-3" : "md:gap-8")}>
                <div>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder={t(translations, config.placeholder)}
                      className="h-12 border-[#0c110f]/25 bg-transparent px-4 text-base text-[#0c110f] placeholder:text-[#0c110f]/60 dark:border-white/25 dark:bg-transparent dark:text-white dark:placeholder:text-white/60"
                    />
                  </FormControl>
                  <FormMessage className="mt-2" />
                </div>
                {config.name === "accountNumber" && (
                  <FormField
                    control={control}
                    name="authorized"
                    render={({ field: authorization }) => (
                      <FormItem className="gap-2">
                        <div className="flex items-start gap-2">
                          <FormControl>
                            <Checkbox
                              ref={authorization.ref}
                              name={authorization.name}
                              onBlur={authorization.onBlur}
                              checked={authorization.value}
                              onCheckedChange={(checked) => authorization.onChange(checked === true)}
                              className="mt-0.5 rounded-[3px] border-[#0c110f]/80 bg-transparent data-[state=checked]:border-[#0c110f] data-[state=checked]:bg-[#0c110f] data-[state=checked]:text-white dark:border-white/80 dark:bg-transparent dark:data-[state=checked]:border-white dark:data-[state=checked]:bg-white dark:data-[state=checked]:text-[#0c110f]"
                            />
                          </FormControl>
                          <FormLabel className="text-sm leading-normal font-medium text-[#0c110f]/80 dark:text-white/80">
                            {t(translations, "setup_authorize_label").replaceAll("{broker}", brokerName)}
                          </FormLabel>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>
            </FormItem>
          )}
        />
      ))}
    </div>
  );
}
