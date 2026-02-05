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

type FormValues = { category?: string; step?: string; amount?: string };

const formSchema = z.object({
  category: z.string().optional(),
  step: z.string().optional(),
  amount: z.string().optional(),
});

type ItemOption = { id: number; name: string };

interface ChallengeTabFormProps {
  tabType: string;
  selectedCategory?: ChallengeType;
  categories: ChallengeType[];
  defaultCategories: ChallengeType[];
  addApiUrl: string;
  onSuccess?: () => void;
}

export default function ChallengeTabForm({
  tabType,
  selectedCategory,
  categories,
  defaultCategories,
  addApiUrl,
  onSuccess,
}: ChallengeTabFormProps) {
  const isStepType = tabType === "step";
  const isAmountType = tabType === "amount";
  const isCategoryType = tabType === "category";

  //====0. For tabType=category==================================
  //-the categories received in props are the are the broker categories list
  //-so we need to filter the defaultCategories received in props to get the categories that are not in the broker categories list 
  //-the user see in the form select box only the default categories that are not in the broker categories list
  //sent to backend api the id of a selected default category which is cloned and saved in the broker categories table
  //====1. For tabType=step and amount=========
  //-the categories received in props are the categories that are in the broker categories list
  //-defaultcategories are the categories that are not defined bu superadmin to be available for all brokers
  //the user see in the form select box only the defaultsteps and amounts that are not in the broker steps and amounts list
  //sent to backend api the id of a selected defaultstep or amount which is cloned and saved in the broker step and amount tables
  //====2. Seelcted Category==================================
  //- the selected category recived in props is the category selected by broker, so it's the broker's category not default category
  


  const categoriesList = useMemo(
    () =>
      categories?.map((c) => ({ id: c.id, slug: c.slug, name: c.name })) ?? [],
    [categories],
  );

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { category: "", step: "", amount: "" },
  });

  //const selectedCategoryId = form.watch("category");
  const selectedCategoryId = selectedCategory?.id.toString() ?? "";

  const stepsNotInBrokerList = useMemo((): ItemOption[] => {

    if (!isStepType || !selectedCategoryId) return [];
    // const brokerSelectedCategory = categories?.find(
    //   (c) => c.id === Number(selectedCategoryId),
    // );
    const brokerSelectedCategory = selectedCategory;
    if (!brokerSelectedCategory) return [];

    const selectedCategorySlug = brokerSelectedCategory.slug;
    const defaultCategorySteps = defaultCategories?.find((c) => c.slug === selectedCategorySlug)?.steps ?? [];
     
    //const brokerSteps = categories?.find((c) => c.slug === selectedCategorySlug)?.steps ?? [];
    const brokerSteps = brokerSelectedCategory?.steps ?? [];

    //filter the default steps to get the steps that are not in the broker steps list
    const filtered = defaultCategorySteps.filter(
      (s) => !brokerSteps.some((bs) => bs.slug === s.slug),
    );

    return filtered.map((s) => ({ id: s.id, name: s.name }));

  }, [isStepType, selectedCategoryId, categories, defaultCategories]);

  const amountsNotInBrokerList = useMemo((): ItemOption[] => {
    if (!isAmountType || !selectedCategoryId) return [];
      // const brokerSelectedCategory = categories?.find(
      //   (c) => c.id === Number(selectedCategoryId),
      // );
      const brokerSelectedCategory = selectedCategory;
    if (!brokerSelectedCategory) return [];
    const selectedCategorySlug = brokerSelectedCategory.slug;

    const defaultCategoryAmounts = defaultCategories?.find((c) => c.slug === selectedCategorySlug)?.amounts ?? [];
      
    //const brokerAmounts = categories?.find((c) => c.slug === selectedCategorySlug)?.amounts ?? [];
    const brokerAmounts = brokerSelectedCategory?.amounts ?? [];

    //filter the default amounts to get the amounts that are not in the broker amounts list
    const filtered = defaultCategoryAmounts.filter(
      (a) =>!brokerAmounts.some(
        (ba) => ba.amount === a.amount && ba.currency === a.currency,
      ),
        
    );
    return filtered.map((a) => ({
      id: a.id,
      name: `${a.amount} ${a.currency}`,
    }));
  }, [isAmountType, selectedCategoryId, categories, defaultCategories]);

  async function onSubmit(values: FormValues) {

    let searchParams = new URLSearchParams();
    if(isStepType && values.step && selectedCategory){
        searchParams.set("default_tab_id_to_clone", values.step);
        searchParams.set("broker_challenge_category_id", selectedCategory.id.toString());
    }else if(isAmountType && values.amount && selectedCategory){
        searchParams.set("default_tab_id_to_clone", values.amount);
        searchParams.set("broker_challenge_category_id", selectedCategory.id.toString());
    }else if(isCategoryType && values.category ){
        searchParams.set("default_tab_id_to_clone", values.category);
    }
    console.log("formValues values", values,selectedCategory);

    const response = await apiClient<unknown>(
      addApiUrl+"?"+searchParams.toString(),
      UseTokenAuth.Yes,
      { method: "POST", body: JSON.stringify({ category_id: "categoryId" }) },
      ErrorMode.Return,
    );

    if (response.success) {
      toast.success(`${tabType.toUpperCase()} added successfully`);
      form.reset({ category: "", step: "", amount: "" });
      onSuccess?.();
    } else {
      toast.error(response.message ?? "Failed to add");
    }
  }

  const submitDisabled = (() => {
    if (categoriesList.length === 0 && isCategoryType) return true;
    if (
      isStepType &&
      (stepsNotInBrokerList.length === 0 || !form.watch("step"))
    )
      return true;
    if (
      isAmountType &&
      (amountsNotInBrokerList.length === 0 || !form.watch("amount"))
    )
      return true;
    return false;
  })();

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
                //value={field.value}
               value={selectedCategory?.id.toString() ?? field.value}
                //disabled={categoriesList.length === 0}
                disabled={isStepType || isAmountType}
               
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
                <Select
                  onValueChange={field.onChange}
                  value={field.value}
                  disabled={stepsNotInBrokerList.length === 0}
                >
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
        {isStepType && stepsNotInBrokerList.length == 0 && (
          <FormItem>
            <FormLabel>Step</FormLabel>
            <p className="text-sm text-muted-foreground">
              No more steps to add
            </p>
          </FormItem>
        )}

        <br />
        {isAmountType && amountsNotInBrokerList.length > 0 && (
          <FormField
            control={form.control}
            name="amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Amount</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  value={field.value}
                  disabled={amountsNotInBrokerList.length === 0}
                >
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
        {isAmountType && amountsNotInBrokerList.length == 0 && (
          <FormItem>
            <FormLabel>Amount</FormLabel>
            <p className="text-sm text-muted-foreground">
              No more amounts to add
            </p>
          </FormItem>
        )}

        <Button
          type="submit"
          disabled={submitDisabled}
          className="bg-green-800 hover:bg-green-900 text-white disabled:opacity-50"
        >
          Add {tabType}
        </Button>
      </form>
    </Form>
  );
}
