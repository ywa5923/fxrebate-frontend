"use client";

import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { apiClient } from "@/lib/api-client";
import { ErrorMode, UseTokenAuth } from "@/lib/enums";
import { toast } from "sonner";
import { ChallengeType } from "@/types";

type FormValues = { category: string; step?: string; amount?: string };

const formSchema = z.object({
  category: z.string().min(1, "Please select a category"),
  step: z.string().optional(),
  amount: z.string().optional(),
});

type ItemOption = { id: number; name: string };

interface ChallengeTabFormProps {
  tabType: string;
  categories: ChallengeType[];
  defaultCategories: ChallengeType[];
  addApiUrl: string;
  onSuccess?: () => void;
}

export default function ChallengeTabForm({
  tabType,
  categories,
  defaultCategories,
  addApiUrl,
  onSuccess,
}: ChallengeTabFormProps) {
  const isStepType = tabType === "step";
  const isAmountType = tabType === "amount";

  const categoriesList = useMemo(
    () => categories?.map((c) => ({ id: c.id, slug: c.slug, name: c.name })) ?? [],
    [categories]
  );

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { category: "", step: "", amount: "" },
  });

  const selectedCategoryId = form.watch("category");

  const stepsNotInBrokerList = useMemo((): ItemOption[] => {
    if (!isStepType || !selectedCategoryId) return [];
    const brokerSelectedCategory = categories?.find((c) => c.id === Number(selectedCategoryId));
    if (!brokerSelectedCategory) return [];
    const slug = brokerSelectedCategory.slug;
    const defaultCategorySteps = defaultCategories?.find((c) => c.slug === slug)?.steps ?? [];
    const brokerSteps = categories?.find((c) => c.slug === slug)?.steps ?? [];
    const filtered = defaultCategorySteps.filter((s) => !brokerSteps.some((bs) => bs.slug === s.slug));
    return filtered.map((s) => ({ id: s.id, name: s.name }));
  }, [isStepType, selectedCategoryId, categories, defaultCategories]);

  const amountsNotInBrokerList = useMemo((): ItemOption[] => {
    if (!isAmountType || !selectedCategoryId) return [];
    const brokerSelectedCategory = categories?.find((c) => c.id === Number(selectedCategoryId));
    if (!brokerSelectedCategory) return [];
    const slug = brokerSelectedCategory.slug;
    const defaultCategoryAmounts = defaultCategories?.find((c) => c.slug === slug)?.amounts ?? [];
    const brokerAmounts = categories?.find((c) => c.slug === slug)?.amounts ?? [];
    const filtered = defaultCategoryAmounts.filter(
      (a) => !brokerAmounts.some((ba) => ba.amount === a.amount && ba.currency === a.currency)
    );
    return filtered.map((a) => ({ id: a.id, name: `${a.amount} ${a.currency}` }));
  }, [isAmountType, selectedCategoryId, categories, defaultCategories]);

  async function onSubmit(values: FormValues) {
    const categoryId = Number(values.category);
    if (Number.isNaN(categoryId)) return;
    const requireStep = isStepType && stepsNotInBrokerList.length > 0;
    if (requireStep && (!values.step || values.step.length === 0)) {
      form.setError("step", { message: "Please select a step" });
      return;
    }
    const requireAmount = isAmountType && amountsNotInBrokerList.length > 0;
    if (requireAmount && (!values.amount || values.amount.length === 0)) {
      form.setError("amount", { message: "Please select an amount" });
      return;
    }

    const body =
      isStepType && values.step
        ? { category_id: categoryId, step_id: Number(values.step) }
        : isAmountType && values.amount
          ? { category_id: categoryId, amount_id: Number(values.amount) }
          : { category_id: categoryId };

    const response = await apiClient<unknown>(
      addApiUrl,
      UseTokenAuth.Yes,
      { method: "POST", body: JSON.stringify(body) },
      ErrorMode.Return
    );

    if (response.success) {
      toast.success(`${tabType} added successfully`);
      form.reset({ category: "", step: "", amount: "" });
      onSuccess?.();
    } else {
      toast.error(response.message ?? "Failed to add");
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 p-2">
        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
              <Select
                onValueChange={(value) => {
                  field.onChange(value);
                  if (isStepType) form.setValue("step", "");
                  if (isAmountType) form.setValue("amount", "");
                }}
                value={field.value}
                disabled={categoriesList.length === 0}
              >
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {categoriesList.map((opt) => (
                    <SelectItem key={opt.id} value={String(opt.id)}>
                      {opt.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {categoriesList.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  No categories available
                </p>
              )}
              <FormMessage />
            </FormItem>
          )}
        />
        {isStepType && stepsNotInBrokerList.length > 0 && (
          <FormField
            control={form.control}
            name="step"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Step</FormLabel>
                <Select onValueChange={field.onChange} value={field.value} disabled={stepsNotInBrokerList.length === 0}>
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select a step" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {stepsNotInBrokerList.map((opt) => (
                      <SelectItem key={opt.id} value={String(opt.id)}>
                        {opt.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
        {isAmountType && amountsNotInBrokerList.length > 0 && (
          <FormField
            control={form.control}
            name="amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Amount</FormLabel>
                <Select onValueChange={field.onChange} value={field.value} disabled={amountsNotInBrokerList.length === 0}>
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select an amount" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {amountsNotInBrokerList.map((opt) => (
                      <SelectItem key={opt.id} value={String(opt.id)}>
                        {opt.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
        <Button
          type="submit"
          disabled={
            categoriesList.length === 0 ||
            (isStepType && stepsNotInBrokerList.length > 0 && !form.watch("step")) ||
            (isAmountType && amountsNotInBrokerList.length > 0 && !form.watch("amount"))
          }
        >
          Add {tabType}
        </Button>
      </form>
    </Form>
  );
}
