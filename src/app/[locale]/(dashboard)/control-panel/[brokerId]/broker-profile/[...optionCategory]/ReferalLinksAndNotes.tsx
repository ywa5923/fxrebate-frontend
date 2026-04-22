"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Link as LinkIcon,
  LayoutGrid,
  Pencil,
  Plus,
  Trash,
  StickyNote,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type {
  Option,
  OptionValue,
  AccountWithPlatformLinks,
  AffiliateLink, AffiliateLinkTabType
} from "@/types";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiClient } from "@/lib/api-client";
import { DynamicOption } from "@/types/DynamicOption";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { DynamicForm } from "@/components/DynamicForm";
import { ReferralLinksTabHeader } from "./ReferralLinksTabHeader";
import { ReferralLinksTabContent } from "./ReferralLinksTabContent";

import Multiselect from "react-select";


const referralLinkFormSchema = z.object({
  accountTypeId: z.string().min(1, "Please select an account type"),
  platformUrls: z.array(
    z.object({
      value: z.number(),
      label: z.string(),
    }),
  ),
  currency: z.string().min(1, "Please select a currency"),
  urlType: z.string().min(1, "Please select a URL type"),
  isMasterLink: z.boolean(),
  name: z.string().trim().min(1, "Name is required"),
  url: z.string().trim().url("Please enter a valid URL"),
});

type ReferralLinkFormValues = z.infer<typeof referralLinkFormSchema>;

type componentProps = {
  is_admin: boolean;
  brokerId: number;
  accountTypes: AccountWithPlatformLinks[];
  currencyList: {label: string; value: string}[];
  IBLinks: AffiliateLink[];
  SubIBLinks: AffiliateLink[];
  notesOptions: Option[];
  notesOptionsValues: OptionValue[];
};
export default function ReferalLinksAndNotes({
  is_admin,
  brokerId,
  accountTypes,
  currencyList,
  IBLinks,
  SubIBLinks,
  notesOptions,
  notesOptionsValues,
}: componentProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<AffiliateLinkTabType>(
    "sign-up-ib-affiliate-link",
  );
  const [ibLinks, setIBLinks] = useState<AffiliateLink[]>(IBLinks);
  const [subIBLinks, setSubIBLinks] = useState<AffiliateLink[]>(SubIBLinks);

  // Keep local CRUD state in sync when server data changes.
  useEffect(() => {
    setIBLinks(IBLinks);
    setSubIBLinks(SubIBLinks);
  }, [IBLinks, SubIBLinks]);

  // Create/Edit dialog (local state only for now).
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"create" | "edit">("create");
  const [editingId, setEditingId] = useState<number | null>(null);

  const form = useForm<ReferralLinkFormValues>({
    resolver: zodResolver(referralLinkFormSchema),
    defaultValues: {
      accountTypeId: String(accountTypes[0]?.account_type_id ?? 0),
      // platformUrls: (accountTypes[0]?.platform_urls ?? []).map((p) => ({
      //   value: Number(p.id),
      //   label: String(p.name ?? ""),
      // })),
        platformUrls: [],
      currency: "",
      urlType: "",
      isMasterLink: false,
      name: "",
      url: "",
    },
  });

  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);

  const watchedAccountTypeId = form.watch("accountTypeId");
  const watchedIsMasterLink = form.watch("isMasterLink");

  const platformUrlMultiselectOptions = useMemo(() => {
    const acc = accountTypes.find(
      (a) => String(a.account_type_id) === String(watchedAccountTypeId),
    );
    return (acc?.platform_urls ?? []).map((p) => ({
      value: Number(p.id),
      label: String(p.name ?? ""),
    }));
  }, [accountTypes, watchedAccountTypeId]);

  function openCreate() {
    setDialogMode("create");
    setEditingId(null);
    const defaultAccountTypeId = String(accountTypes[0]?.account_type_id ?? 0);
    form.reset({
      accountTypeId: defaultAccountTypeId,
      // platformUrls: (accountTypes[0]?.platform_urls ?? []).map((p) => ({
      //   value: Number(p.id),
      //   label: String(p.name ?? ""),
      // })),
      platformUrls: [],
      currency: "",
      urlType: activeTab,
      isMasterLink: false,
      name: "",
      url: "",
    });
    setDialogOpen(true);
  }

  function openEdit(row: AffiliateLink) {
    setDialogMode("edit");
    setEditingId(row.id);

    form.reset({
      accountTypeId: String(
        row.account_type_id ?? accountTypes[0]?.account_type_id ?? 0,
      ),
      platformUrls: (row.platform_urls ?? []).map((p) => ({
        value: Number(p.id),
        label: String(p.name ?? ""),
      })),
      currency: row.currency ?? "",
      urlType: row.url_type ?? "custom",
      isMasterLink: !!row.is_master_link,
      name: is_admin ? row.public_name ?? "" : row.name ?? "",
      url: is_admin ? row.public_url ?? "" : row.url ?? "",
    });

    setDialogOpen(true);
  }

  async function handleDialogSubmit(values: ReferralLinkFormValues) {
    

    const bodyPayload = {
      broker_id: brokerId,
      account_type_id: values.isMasterLink
        ? null
        : Number(values.accountTypeId),
      currency: values.currency?.trim() || null,
      url_type: values.urlType,
      is_master_link: values.isMasterLink,
      name: values.name.trim(),
      url: values.url.trim(),

      //  IMPORTANT
      platform_urls: values.platformUrls.map((o) => ({
        id: o.value,
        name: o.label,
      })),
    };
  

    const serverUrl = editingId
      ? `/urls/broker/${brokerId}/affiliate-link/${editingId}`
      : `/urls/broker/${brokerId}/affiliate-link`;
    try {
      const response = await apiClient<DynamicOption>(serverUrl, true, {
        method: editingId ? "PUT" : "POST",
        body: JSON.stringify(bodyPayload),
      });

      if (response.success) {
        toast.success(
          editingId
            ? "Referral link updated successfully"
            : "Referral link created successfully",
        );
        setDialogOpen(false);
      } else {
        toast.error(response.message ?? "Failed to save referral link");
      }
    } catch (error) {
      console.log("SAVE REFERRAL LINK ERROR", error);
      toast.error("Failed to save referral link");
    }
  }

  async function handleDeleteReferralLink(urlId: number) {
    const deleteUrl = `/urls/broker/${brokerId}/affiliate-link/${urlId}`;
    try {
      const response = await apiClient<boolean>(deleteUrl, false, {
        method: "DELETE",
      });
      if (response.success) {
        toast.success("Referral link deleted successfully");
        setConfirmDeleteId(null);
        router.refresh();
      } else {
        toast.error(response.message ?? "Failed to delete referral link");
      }
    } catch (error) {
      console.log("DELETE REFERRAL LINK ERROR", error);
      toast.error("Failed to delete referral link");
    }
  }

  return (
    <div className="container mx-auto px-2 sm:px-6 pt-6 pb-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-11 h-11 flex items-center justify-center">
          <LayoutGrid className="w-6 h-6 text-green-600 dark:text-green-400" />
        </div>
        <div className="min-w-0">
          <h1 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100">
            Referral links & notes
          </h1>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
            Referral links from server. Notes is placeholder.
          </p>
        </div>
      </div>

      <ReferralLinksTabHeader
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {activeTab === "sign-up-ib-affiliate-link" ? (
        <ReferralLinksTabContent
          variant="ib"
          title="Sign-up IB/ Affiliate Link"
          description="Each row shows account_name and url_type."
          links={ibLinks}
          is_admin={is_admin}
          onAddClick={openCreate}
          onEditRow={openEdit}
          onRequestDelete={handleDeleteReferralLink}
        />
      ) : activeTab === "sign-up-sub-ib-affiliate-link" ? (
        <ReferralLinksTabContent
          variant="sub_ib"
          title="Sign-up SUB-IB/ Sub-Affiliate Link"
          description="Each row shows account_name and url_type."
          links={subIBLinks}
          is_admin={is_admin}
          onAddClick={openCreate}
          onEditRow={openEdit}
          onRequestDelete={handleDeleteReferralLink}
        />
      ) : (
        <Card className="border border-dashed border-gray-200 dark:border-gray-800 bg-[#fdfdfd] dark:bg-gray-800/40">
          <CardHeader>
            <div className="flex items-center gap-2">
              <StickyNote className="w-4 h-4 text-green-600 dark:text-green-400" />
              <div>
                <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  Notes
                </div>
                <div className="px-5 sm:px-6 pt-5 sm:pt-6 pb-5 sm:pb-6">
                  <DynamicForm
                    broker_id={brokerId}
                    options={notesOptions}
                    optionsValues={notesOptionsValues}
                    is_admin={is_admin}
                    entity_id={brokerId}
                    entity_type={"broker"}
                    action={() => Promise.resolve()}
                  />
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-gray-600 dark:text-gray-300">
              Notes are not implemented yet. This is temporary UI.
            </div>
          </CardContent>
        </Card>
      )}

      {/* Create/Edit dialog */}
      <Dialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
        }}
      >
        <DialogContent
          className="overflow-x-hidden"
          onInteractOutside={(event) => {
            const target = event.target as HTMLElement | null;
            if (
              target?.closest(".react-select__menu") ||
              target?.closest(".react-select__menu-portal")
            ) {
              event.preventDefault();
            }
          }}
          onPointerDownOutside={(event) => {
            const target = event.target as HTMLElement | null;
            if (
              target?.closest(".react-select__menu") ||
              target?.closest(".react-select__menu-portal")
            ) {
              event.preventDefault();
            }
          }}
        >
          <DialogHeader>
            <DialogTitle>
              {dialogMode === "edit"
                ? "Edit referral link"
                : "New referral link"}
            </DialogTitle>
          </DialogHeader>

          <form
            className="space-y-3"
            onSubmit={form.handleSubmit(handleDialogSubmit)}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div className="space-y-1 min-w-0">
                <div className="text-sm font-medium text-gray-700 dark:text-gray-200">
                  Account name
                </div>
                <Controller
                  name="accountTypeId"
                  control={form.control}
                  render={({ field }) => (
                    watchedIsMasterLink ? (
                      <div className="flex min-h-10 w-full items-center rounded-md border border-input bg-muted px-3 py-2 text-sm text-muted-foreground">
                        All Accounts
                      </div>
                    ) : (
                      <Select
                        value={field.value ?? "0"}
                        onValueChange={(v) => {
                          field.onChange(v);
                          form.setValue("platformUrls", [], {
                            shouldValidate: true,
                          });
                        }}
                      >
                        <SelectTrigger className="w-full min-w-0 max-w-full">
                          <SelectValue
                            className="truncate"
                            placeholder="Select account type"
                          />
                        </SelectTrigger>
                        <SelectContent>
                          {accountTypes.map((item) => (
                            <SelectItem
                              key={item.account_type_id}
                              value={String(item.account_type_id)}
                            >
                              {item.account_type_name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )
                  )}
                />
                {form.formState.errors.accountTypeId ? (
                  <p className="text-xs text-red-600 dark:text-red-400">
                    {form.formState.errors.accountTypeId.message}
                  </p>
                ) : null}
              </div>
              <div className="space-y-1 min-w-0">
                <div className="text-sm font-medium text-gray-700 dark:text-gray-200">
                  Platform URLs
                </div>
                <Controller
                  name="platformUrls"
                  control={form.control}
                  render={({ field }) => (
                    watchedIsMasterLink ? (
                      <div className="flex min-h-10 w-full items-center rounded-md border border-input bg-muted px-3 py-2 text-sm text-muted-foreground">
                        All Platforms
                      </div>
                    ) : (
                      <Multiselect
                        instanceId="referral-link-platform-urls"
                        isMulti
                        classNamePrefix="react-select"
                        options={platformUrlMultiselectOptions}
                        value={field.value}
                        onChange={(selected) => {
                          field.onChange(selected ?? []);
                        }}
                        getOptionValue={(o) => String(o.value)}
                        getOptionLabel={(o) => o.label}
                        placeholder="Select platform URLs…"
                        isClearable
                        styles={{
                          control: (base, state) => ({
                            ...base,
                            minHeight: 40,
                            borderRadius: 8,
                            borderColor: state.isFocused ? "#22c55e" : "#e5e7eb",
                            boxShadow: state.isFocused
                              ? "0 0 0 2px rgba(34,197,94,0.2)"
                              : "none",
                            "&:hover": {
                              borderColor: "#22c55e",
                            },
                          }),
                          valueContainer: (base) => ({
                            ...base,
                            padding: "4px 6px",
                            gap: "4px",
                          }),
                          multiValue: (base) => ({
                            ...base,
                            backgroundColor: "#f0fdf4",
                            border: "1px solid #bbf7d0",
                            borderRadius: 6,
                            padding: "2px 4px",
                          }),
                          multiValueLabel: (base) => ({
                            ...base,
                            color: "#166534",
                            fontSize: "12px",
                            fontWeight: 500,
                            padding: "0 4px",
                          }),
                          multiValueRemove: (base) => ({
                            ...base,
                            color: "#166534",
                            borderRadius: 4,
                            ":hover": {
                              backgroundColor: "#dcfce7",
                              color: "#14532d",
                            },
                          }),
                          option: (base, state) => ({
                            ...base,
                            backgroundColor: state.isSelected
                              ? "#22c55e"
                              : state.isFocused
                                ? "#f0fdf4"
                                : "white",
                            color: state.isSelected ? "white" : "#111827",
                            cursor: "pointer",
                            ":active": {
                              backgroundColor: "#16a34a",
                            },
                          }),
                          menu: (base) => ({
                            ...base,
                            borderRadius: 8,
                            overflow: "hidden",
                          }),
                          menuList: (base) => ({
                            ...base,
                            padding: 4,
                          }),
                        }}
                      />
                    )
                  )}
                />
                {form.formState.errors.platformUrls ? (
                  <p className="text-xs text-red-600 dark:text-red-400">
                    {form.formState.errors.platformUrls.message}
                  </p>
                ) : null}
              </div>
              <div className="space-y-1 min-w-0">
                <div className="text-sm font-medium text-gray-700 dark:text-gray-200">
                  URL type
                </div>
                <Controller
                  name="urlType"
                  control={form.control}
                  render={({ field }) => (
                    <div className="flex min-h-10 w-full items-center rounded-md border border-input bg-muted px-3 py-2 text-sm text-muted-foreground">
                      {field.value || "-"}
                    </div>
                  )}
                />
              </div>
              <div className="space-y-1 min-w-0">
                <div className="text-sm font-medium text-gray-700 dark:text-gray-200">
                  Currency
                </div>
                <Controller
                  name="currency"
                  control={form.control}
                  render={({ field }) => (
                    <Select
                      value={field.value || "__none__"}
                      onValueChange={(value) => {
                        field.onChange(value === "__none__" ? "" : value);
                      }}
                    >
                      <SelectTrigger className="w-full min-w-0 max-w-full">
                        <SelectValue placeholder="Select currency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__none__">No currency</SelectItem>
                        {currencyList.map((item) => (
                          <SelectItem key={item.value} value={item.value}>
                            {item.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Controller
                name="isMasterLink"
                control={form.control}
                render={({ field }) => (
                  <Checkbox
                    checked={!!field.value}
                    onCheckedChange={(checked) =>
                      field.onChange(checked === true)
                    }
                  />
                )}
              />
              <span className="text-sm text-gray-700 dark:text-gray-200">
                is_master_link
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div className="space-y-1">
                <div className="text-sm font-medium text-gray-700 dark:text-gray-200">
                  Name
                </div>
                <Controller
                  name="name"
                  control={form.control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      value={field.value ?? ""}
                      placeholder="e.g. Summer campaign"
                    />
                  )}
                />
                {form.formState.errors.name ? (
                  <p className="text-xs text-red-600 dark:text-red-400">
                    {form.formState.errors.name.message}
                  </p>
                ) : null}
              </div>
              <div className="space-y-1">
                <div className="text-sm font-medium text-gray-700 dark:text-gray-200">
                  Referral URL
                </div>
                <Controller
                  name="url"
                  control={form.control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      value={field.value ?? ""}
                      placeholder="https://example.com/ref/..."
                    />
                  )}
                />
                {form.formState.errors.url ? (
                  <p className="text-xs text-red-600 dark:text-red-400">
                    {form.formState.errors.url.message}
                  </p>
                ) : null}
              </div>
            </div>

            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Save</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete confirm */}
      <Dialog
        open={confirmDeleteId != null}
        onOpenChange={(open) => {
          if (!open) setConfirmDeleteId(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete this referral link?</DialogTitle>
          </DialogHeader>

          <div className="py-2 text-sm text-gray-600 dark:text-gray-300">
            This action cannot be undone.
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setConfirmDeleteId(null)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={() => {
                if (confirmDeleteId == null) return;
                void handleDeleteReferralLink(confirmDeleteId);
              }}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
