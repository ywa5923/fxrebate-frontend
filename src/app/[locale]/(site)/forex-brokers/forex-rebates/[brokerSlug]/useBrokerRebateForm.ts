"use client";

import { useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useTranslation } from "@/providers/translations";
import type { SetupFormData } from "./setupFormData";
import { createSetupSchema, type SetupFormValues } from "./setupFormSchema";
import { submitBrokerRebate, type RebateRequestType } from "./submitBrokerRebate";
import { tSubmitError } from "./translations";

export type BrokerRebateFormProps = {
  brokerId: number;
  brokerName: string;
  brokerSlug: string;
  locale: string;
  data: SetupFormData;
};

export function useBrokerRebateForm(
  { brokerId, brokerSlug, locale, data }: BrokerRebateFormProps,
  requestType: RebateRequestType,
) {
  const { t } = useTranslation();
  const schema = useMemo(
    () => createSetupSchema(data.account_types, t),
    [data.account_types, t],
  );
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
  const [submitted, setSubmitted] = useState(false);
  const submitting = useRef(false);

  async function submit() {
    // Lock before asynchronous validation so repeated clicks cannot send twice.
    if (submitting.current || submitted) return;
    submitting.current = true;
    try {
      await form.handleSubmit(async (values) => {
        const result = await submitBrokerRebate({
          brokerId,
          brokerSlug,
          locale,
          values,
          requestType,
          tabName: t(requestType === "new_account" ? "setup_path_new" : "setup_path_transfer"),
        });
        if (result.success) {
          setSubmitted(true);
          toast.success(t("setup_submit_success"));
        } else {
          toast.error(tSubmitError(t, result));
        }
      })();
    } catch {
      toast.error(t("setup_submit_error"));
    } finally {
      submitting.current = false;
    }
  }

  return {
    form,
    t,
    submit,
    isSubmitting: form.formState.isSubmitting,
    submitted,
    validateAccount: () => form.trigger(
      ["accountType", "platform", "jurisdiction"],
      { shouldFocus: true },
    ),
  };
}
