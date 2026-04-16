"use client";

import { useEffect, useMemo, useState } from "react";
import { Link as LinkIcon, LayoutGrid, Pencil, Plus, Trash, StickyNote } from "lucide-react";

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
import type { Option, OptionValue, AccountWithPlatformLinks, Url } from "@/types";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiClient } from "@/lib/api-client";
import { DynamicOption } from "@/types/DynamicOption";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { DynamicForm } from "@/components/DynamicForm";
import {ReferralLinksTabHeader} from "./ReferralLinksTabHeader";
import {ReferralLinksTabContent} from "./ReferralLinksTabContent";

type ReferralLinkRow = Pick<
  Url,
  | "id"
  | "name"
  | "url"
  | "previous_name"
  | "public_name"
  | "previous_url"
  | "public_url"
  | "is_updated_entry"
  | "url_type"
  | "is_master_link"
> & {
  // Derived from wrapper object.
  account_name: string; // from `account_type_name`
  account_type_id: number | null;
};

// function extactAccountTypes(referralLinks: AccountWithAffiliateLinks[]): Array<{value: number, label: string}> {
//   const accountTypes: Array<{value: number, label: string}> = [];
//   for (const acc of referralLinks ?? []) {
//     accountTypes.push({
//       value: acc?.account_type_id ?? 0,
//       label: acc?.account_type_name ?? "Account",
//     });
//   }
//   return accountTypes;
// }


 type TabType = "ib_links" | "sub_ib_links" | "notes";

const referralLinkFormSchema = z.object({
  accountTypeId: z.string().min(1, "Please select an account type"),
  urlType: z.string().min(1, "Please select a URL type"),
  isMasterLink: z.boolean(),
  name: z.string().trim().min(1, "Name is required"),
  url: z.string().trim().url("Please enter a valid URL"),
});

type ReferralLinkFormValues = z.infer<typeof referralLinkFormSchema>;

// function flattenAffiliateLinks(referralLinks: AccountWithAffiliateLinks[]): ReferralLinkRow[] {
//   const rows: ReferralLinkRow[] = [];

//   for (const acc of referralLinks ?? []) {
//     const accountName = acc?.account_type_name ?? "Account";
//     const affiliateUrls: Url[] = acc?.affiliate_urls ?? [];

//     for (const u of affiliateUrls) {
//       const id = Number(u?.id);
//       if (!Number.isFinite(id)) continue;

//       rows.push({
//         id,
//         name: u?.name ?? "Untitled",
//         url: u?.url ?? "",
//         previous_name: u?.previous_name ?? null,
//         public_name: u?.public_name ?? null,
//         previous_url: u?.previous_url ?? null,
//         public_url: u?.public_url ?? null,
//         is_updated_entry: u?.is_updated_entry ?? 0,
//         is_master_link: u?.is_master_link ?? false,
//         account_name: accountName,
//         url_type: u?.url_type ?? "unknown",
//         account_type_id: u?.is_master_link ? null : (acc?.account_type_id ?? 0),
//       });
//     }
//   }

//   return rows;
// }

 type componentProps={
  is_admin: boolean;
  brokerId: number;
  accountTypes: AccountWithPlatformLinks[];
  IBLinks: Url[];
  SubIBLinks: Url[];
  notesOptions: Option[];
  notesOptionsValues: OptionValue[];
}
export default function ReferalLinksAndNotes({
  is_admin,
  brokerId,
  accountTypes,
  IBLinks,
  SubIBLinks,
  notesOptions,
  notesOptionsValues,
}: componentProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>("ib_links");
  const [ibLinks, setIBLinks] = useState<Url[]>(IBLinks);
  const [subIBLinks, setSubIBLinks] = useState<Url[]>(SubIBLinks);

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
      urlType: "",
      isMasterLink: false,
      name: "",
      url: "",
    },
  });

  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);

  function openCreate() {
    setDialogMode("create");
    setEditingId(null);
    const defaultAccountTypeId = String(accountTypes[0]?.account_type_id ?? 0);
    form.reset({
      accountTypeId: defaultAccountTypeId,
      urlType: "",
      isMasterLink: false,
      name: "",
      url: "",
    });
    setDialogOpen(true);
  }

  function openEdit(row: ReferralLinkRow) {
    setDialogMode("edit");
    setEditingId(row.id);
    form.reset({
      accountTypeId: String(row.account_type_id ?? accountTypes[0]?.account_type_id ?? 0),
      urlType: row.url_type ?? "custom",
      isMasterLink: !!row.is_master_link,
      // In admin mode, edit defaults come from public fields.
      name: is_admin ? (row.public_name ?? "") : (row.name ?? ""),
      url: is_admin ? (row.public_url ?? "") : (row.url ?? ""),
    });
    setDialogOpen(true);
  }

  async function handleDialogSubmit(values: ReferralLinkFormValues) {
    const url = values.url.trim();
    const name = values.name.trim();
    const urlType = values.urlType.trim() || "custom";
    const isMasterLink = values.isMasterLink;
    const selectedAccountType = accountTypes.find(
      (a) => a.account_type_id === Number(values.accountTypeId),
    );
    const accountTypeId = isMasterLink ? null : (selectedAccountType?.account_type_id ?? 0);
    const accountName = isMasterLink
      ? "Master Link"
      : (selectedAccountType?.account_type_name ?? "Account");

    let bodyPayload={
      broker_id: brokerId,
      account_type_id: accountTypeId,
     // urlable_type: "account-type",
      url_type: urlType,
      is_master_link: isMasterLink,
      name: name,
      url: url,
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

      <ReferralLinksTabHeader activeTab={activeTab} onTabChange={setActiveTab} />

      {activeTab === "ib_links" ?
       <ReferralLinksTabContent variant="ib" title="Sign-up IB/ Affiliate Link" description="Each row shows account_name and url_type." links={ibLinks} is_admin={is_admin} onAddClick={openCreate} onEditRow={openEdit} onRequestDelete={handleDeleteReferralLink} />
        : activeTab === "sub_ib_links" ? 
        <ReferralLinksTabContent variant="sub_ib" title="Sign-up SUB-IB/ Sub-Affiliate Link" description="Each row shows account_name and url_type." links={subIBLinks} is_admin={is_admin} onAddClick={openCreate} onEditRow={openEdit} onRequestDelete={handleDeleteReferralLink} />
         : (
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
              entity_type={'broker'}
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
        <DialogContent className="overflow-x-hidden">
          <DialogHeader>
            <DialogTitle>
              {dialogMode === "edit" ? "Edit referral link" : "New referral link"}
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
                    <Select
                      value={field.value ?? "0"}
                      onValueChange={field.onChange}
                      disabled={form.watch("isMasterLink")}
                    >
                      <SelectTrigger className="w-full min-w-0 max-w-full">
                        <SelectValue
                          className="truncate"
                          placeholder="Select account type"
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {accountTypes.map((item) => (
                          <SelectItem key={item.value} value={String(item.value)}>
                            {item.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
                  URL type
                </div>
                <Controller
                  name="urlType"
                  control={form.control}
                  render={({ field }) => (
                    <Select
                      value={field.value ?? "custom"}
                      onValueChange={field.onChange}
                    >
                      <SelectTrigger className="w-full min-w-0 max-w-full">
                        <SelectValue
                          className="truncate"
                          placeholder="Select URL type"
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {urlTypes.map((item) => (
                          <SelectItem key={item.value} value={item.value}>
                            {item.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {form.formState.errors.urlType ? (
                  <p className="text-xs text-red-600 dark:text-red-400">
                    {form.formState.errors.urlType.message}
                  </p>
                ) : null}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Controller
                name="isMasterLink"
                control={form.control}
                render={({ field }) => (
                  <Checkbox
                    checked={!!field.value}
                    onCheckedChange={(checked) => field.onChange(checked === true)}
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
            <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">
              Save
            </Button>
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
            <Button type="button" variant="outline" onClick={() => setConfirmDeleteId(null)}>
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

