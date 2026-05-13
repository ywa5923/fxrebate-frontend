"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Copy, CircleHelp } from "lucide-react";

import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { Url, UrlPayload } from "@/types/Url";
import { LinksGroupedByType } from "@/types/AccountTypeLinks";
import {
  saveAccountTypeLink,
  deleteAccountTypeLink,
} from "@/lib/accountType-request";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { BrokerPreviousValue } from "@/components/BrokerPreviousValue";
import { checkFieldsPublicValue } from "@/lib/checkFieldsPublicValue";

type CopyField = "name" | "url";

const createLinkSchema = (isAdmin: boolean) => {
  if (isAdmin) {
    return z.object({
      url: z.string().optional(),
      public_url: z
        .string()
        .min(1, { message: "URL is required" })
        .url({ message: "Please enter a valid URL" }),
      name: z.string().optional(),
      public_name: z.string().min(1, { message: "Name is required" }),
      type: z.string().min(1, { message: "Type is required" }),
      is_master: z.boolean().optional(),
      is_updated_entry: z.boolean().optional(),
      previous_url: z.string().optional(),
      previous_name: z.string().optional(),
    });
  }
  return z.object({
    url: z
      .string()
      .min(1, { message: "URL is required" })
      .url({ message: "Please enter a valid URL" }),
    public_url: z.string().optional(),
    name: z.string().min(1, { message: "Name is required" }),
    public_name: z.string().optional(),
    type: z.string().min(1, { message: "Type is required" }),
    is_master: z.boolean().optional(),
    is_updated_entry: z.boolean().optional(),
    previous_url: z.string().optional(),
    previous_name: z.string().optional(),
  });
};

type LinkFormValues = {
  url?: string;
  public_url?: string;
  name?: string;
  public_name?: string;
  type: string;
  is_master?: boolean;
  is_updated_entry?: boolean;
  previous_url?: string;
  previous_name?: string;
};

export default function AccountLinks2({
  broker_id,
  account_type_id,
  links,
  master_links,
  links_groups,
  is_admin,
}: {
  broker_id: number;
  account_type_id: number;
  links: LinksGroupedByType | {};
  master_links: LinksGroupedByType | {};
  links_groups: string[];
  is_admin: boolean;
}) {
  const [editingLink, setEditingLink] = useState<Url | null>(null);
  const [addingType, setAddingType] = useState<string | null>(null);
  const [openAccordion, setOpenAccordion] = useState<string[]>([]);
  const [confirmDelete, setConfirmDelete] = useState<{
    id: number;
    account_type_id: number | null;
    broker_id: number;
  } | null>(null);
  const [clickedCopyBtns, setClickedCopyBtns] = useState<Set<CopyField>>(
    () => new Set(),
  );

  const form = useForm<LinkFormValues>({
    resolver: zodResolver(createLinkSchema(is_admin) as any),
    defaultValues: {
      url: "",
      public_url: "",
      previous_url: "",
      name: "",
      previous_name: "",
      public_name: "",
      type: "",
      is_master: false,
      is_updated_entry: false,
    },
  });
  const router = useRouter();

  const handleAccordionChange = (value: string[]) => {
    setOpenAccordion(value);
    if (addingType && !value.includes(addingType)) {
      setAddingType(null);
      setEditingLink(null);
      setClickedCopyBtns(new Set());
      form.reset();
    }
    if (editingLink && !value.includes(editingLink.url_type)) {
      setAddingType(null);
      setEditingLink(null);
      setClickedCopyBtns(new Set());
      form.reset();
    }
  };

  async function onSubmit(data: LinkFormValues) {
    try {
      const payload: UrlPayload = {
        ...(editingLink ? { id: editingLink.id } : { id: null }),
        broker_id,
        urlable_id: data.is_master ? null : account_type_id,
        urlable_type: "account-type",
        url_type: data.type,
        name: is_admin ? data.public_name : data.name,
        url: is_admin ? data.public_url : data.url,
      };

      await saveAccountTypeLink(payload);
      router.refresh();
      toast.success(
        editingLink ? "Link updated successfully!" : "Link added successfully!",
      );
    } catch {
      toast.error("Failed to save link");
    }
    setEditingLink(null);
    setAddingType(null);
    setClickedCopyBtns(new Set());
  }

  function handleAddClick(type: string) {
    setAddingType(type);
    setEditingLink(null);
    setClickedCopyBtns(new Set());
    form.reset({
      url: "",
      public_url: "",
      name: "",
      public_name: "",
      type,
      is_master: false,
    });
    if (!openAccordion.includes(type)) {
      setOpenAccordion([...openAccordion, type]);
    }
  }

  async function handleDeleteClick(
    link_id: number,
    atId: number | null,
    brId: number,
  ) {
    try {
      await deleteAccountTypeLink(link_id, atId, brId);
      router.refresh();
      toast.success("Link deleted successfully!");
    } catch {
      toast.error("Failed to delete link");
    }
  }

  function countUpdatedLinks(type: string): number {
    const accountLinks = (links as LinksGroupedByType)[type] || [];
    const masterLinksForType = (master_links as LinksGroupedByType)[type] || [];
    return [...accountLinks, ...masterLinksForType].filter(
      (link) => link.is_updated_entry === 1,
    ).length;
  }

  function getLabelClassName(field: CopyField) {
    const row = editingLink;
    if (!row || !is_admin) {
      return "text-sm font-medium text-gray-700 dark:text-gray-200";
    }
    const publicKey = `public_${field}` as keyof Url;
    const mismatch =
      row.is_updated_entry === 1 && row[field] != row[publicKey];
    return cn(
      "text-sm font-medium",
      mismatch ? "text-red-600 dark:text-red-400" : "text-gray-700 dark:text-gray-200",
    );
  }

  function copyBrokerValueToPublicValue(field: CopyField) {
    const brokerValue = editingLink?.[field];
    if (brokerValue == null || brokerValue === "") return;
    if (field === "name") {
      form.setValue("public_name", String(brokerValue));
    } else {
      form.setValue("public_url", String(brokerValue));
    }
  }

  function renderCopyBtn(field: CopyField) {
    if (!is_admin || !editingLink) return null;

    const publicKey = `public_${field}` as keyof Url;
    const showRedCopyHint =
      editingLink.is_updated_entry === 1 &&
      editingLink[field] != editingLink[publicKey];
    const clicked = clickedCopyBtns.has(field);

    return (
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={(e) => {
          e.preventDefault();
          copyBrokerValueToPublicValue(field);
          setClickedCopyBtns((prev) => new Set(prev).add(field));
        }}
        className={cn(
          "p-1 h-6 w-6 flex-shrink-0",
          clicked
            ? "bg-green-100 border-green-500 text-green-700"
            : showRedCopyHint
              ? "bg-red-100 border-red-500 text-red-700 hover:bg-red-200"
              : "text-muted-foreground border-border hover:bg-muted/50",
        )}
        title="Copy broker value to public value"
      >
        <Copy className="h-3 w-3" />
      </Button>
    );
  }

  function beginEdit(link: Url) {
    const isMaster = link.urlable_id === null;
    const isUpdatedEntry = link.is_updated_entry === 1;
    setEditingLink(link);
    setAddingType(null);

    if (is_admin && isUpdatedEntry) {
      const shouldBeUpdated = checkFieldsPublicValue(link, ["name", "url"]);
      setClickedCopyBtns(new Set(shouldBeUpdated));
    } else {
      setClickedCopyBtns(new Set());
    }

    form.reset({
      ...link,
      public_url: link.public_url || "",
      public_name: link.public_name || "",
      url: link.url || "",
      name: link.name || "",
      type: link.url_type,
      is_master: isMaster,
      is_updated_entry: Boolean(isUpdatedEntry),
      previous_url: link.previous_url ?? undefined,
      previous_name: link.previous_name ?? undefined,
    });
  }

  function renderLinks(
    type: string,
    accountLinks: Url[] = [],
    masterLinks: Url[] = [],
  ) {
    const allLinks = [...accountLinks, ...masterLinks];

    if (allLinks.length === 0) {
      return <div className="text-muted-foreground text-xs">No links</div>;
    }

    return (
      <div>
        {allLinks.map((link, index) => {
          const isMaster = link.urlable_id === null;
          const isUpdatedEntry = link.is_updated_entry === 1;
          return (
            <div key={link.id} className="flex items-center gap-2 mb-2">
              <div className="flex items-center gap-3 flex-1">
                <div className="w-6 h-6 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center text-xs font-medium text-gray-600 dark:text-gray-400">
                  <span
                    className={cn("", {
                      "text-red-500 dark:text-red-400 font-bold":
                        is_admin && isUpdatedEntry,
                    })}
                  >
                    {index + 1}
                  </span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium underline"
                    >
                      {link.name}
                    </a>
                    {isMaster && (
                      <span className="text-xs bg-blue-100 text-blue-800 px-1 rounded">
                        Master
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {link.url_type}
                  </span>
                </div>
              </div>
              <Button size="sm" variant="outline" onClick={() => beginEdit(link)}>
                Edit
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() =>
                  setConfirmDelete({ id: link.id, account_type_id, broker_id })
                }
              >
                Delete
              </Button>
            </div>
          );
        })}
      </div>
    );
  }

  function renderForm(type: string) {
    const isVisible =
      addingType === type || (editingLink && editingLink.url_type === type);

    return (
      <div
        className={`transition-all duration-1000 ease-in-out overflow-hidden ${
          isVisible
            ? "opacity-100 max-h-[560px] translate-y-0"
            : "opacity-0 max-h-0 translate-y-[-10px]"
        }`}
      >
        <Card className="max-w-2xl mx-auto">
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-3"
              >
                <FormField
                  control={form.control}
                  name={is_admin ? "public_url" : "url"}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className={getLabelClassName("url")}>
                        URL
                      </FormLabel>
                      <div className="flex items-center gap-2">
                        <FormControl>
                          <Input {...field} className="flex-1" />
                        </FormControl>
                        {is_admin && editingLink ? renderCopyBtn("url") : null}
                      </div>
                      <FormMessage />
                      {is_admin && editingLink && (
                        <div className="mt-1 flex items-start justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            <BrokerPreviousValue
                              brokerValue={editingLink.url}
                              previousValue={editingLink.previous_url}
                            />
                          </div>
                        </div>
                      )}
                      {is_admin && !editingLink && (
                        <div
                          className={cn(
                            "text-sm text-gray-500 dark:text-gray-400",
                            {
                              "text-red-500 dark:text-red-400":
                                form.watch("is_updated_entry"),
                            },
                          )}
                        >
                          <div>Broker value: {form.watch("url")}</div>
                          {form.watch("previous_url") ? (
                            <div>
                              Previous value: {form.watch("previous_url")}
                            </div>
                          ) : null}
                        </div>
                      )}
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name={is_admin ? "public_name" : "name"}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className={getLabelClassName("name")}>
                        Name
                      </FormLabel>
                      <div className="flex items-center gap-2">
                        <FormControl>
                          <Input {...field} className="flex-1" />
                        </FormControl>
                        {is_admin && editingLink ? renderCopyBtn("name") : null}
                      </div>
                      <FormMessage />
                      {is_admin && editingLink && (
                        <div className="mt-1 flex items-start justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            <BrokerPreviousValue
                              brokerValue={editingLink.name}
                              previousValue={editingLink.previous_name}
                            />
                          </div>
                        </div>
                      )}
                      {is_admin && !editingLink && (
                        <div
                          className={cn(
                            "text-sm text-gray-500 dark:text-gray-400",
                            {
                              "text-red-500 dark:text-red-400":
                                form.watch("is_updated_entry"),
                            },
                          )}
                        >
                          <div>Broker value: {form.watch("name")}</div>
                          {form.watch("previous_name") ? (
                            <div>
                              Previous name: {form.watch("previous_name")}
                            </div>
                          ) : null}
                        </div>
                      )}
                    </FormItem>
                  )}
                />

                {(is_admin || addingType) && (
                  <FormField
                    control={form.control}
                    name="is_master"
                    render={({ field }) => (
                      <FormItem className="flex items-center gap-2">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <FormLabel
                          className={cn(
                            "flex items-center gap-2",
                            is_admin &&
                              editingLink?.is_updated_entry === 1 &&
                              (editingLink.urlable_id === null) !== field.value
                              ? "text-red-600 dark:text-red-400"
                              : "",
                          )}
                        >
                          Is Master Link
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button
                                type="button"
                                className="inline-flex items-center text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                                aria-label="Master link info"
                              >
                                <CircleHelp className="h-4 w-4" />
                              </button>
                            </TooltipTrigger>
                            <TooltipContent
                              side="top"
                              sideOffset={6}
                              className="text-sm px-3.5 py-2"
                            >
                              Master links apply to all account types and web
                              platforms
                            </TooltipContent>
                          </Tooltip>
                        </FormLabel>
                      </FormItem>
                    )}
                  />
                )}

                <div className="flex gap-2 pt-2">
                  <Button
                    type="submit"
                    className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-medium"
                  >
                    {editingLink ? "Save Changes" : "Add Link"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setEditingLink(null);
                      setAddingType(null);
                      setClickedCopyBtns(new Set());
                      form.reset();
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full mt-4">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <svg
            className="w-7 h-7 text-green-600 dark:text-green-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
              Account Links
            </h2>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Manage account-specific links
              </span>
              <span className="w-1 h-1 bg-gray-400 rounded-full" />
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {links_groups.length} categories
              </span>
            </div>
          </div>
        </div>

        <div className="h-px bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-600 to-transparent" />
      </div>

      <Accordion
        type="multiple"
        value={openAccordion}
        onValueChange={handleAccordionChange}
        className="w-full"
      >
        {links_groups.map((type) => (
          <AccordionItem key={type} value={type}>
            <div className="flex items-center justify-between">
              <AccordionTrigger className="flex-1">
                <div className="flex items-center gap-2">
                  <svg
                    className="w-4 h-4 text-green-600 dark:text-green-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                    />
                  </svg>
                  <span className="capitalize">{type}</span>
                  <span className="text-gray-500">Links</span>
                  <span className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs font-medium px-2 py-0.5 rounded-full">
                    {((links as LinksGroupedByType)[type]?.length || 0) +
                      ((master_links as LinksGroupedByType)[type]?.length || 0)}
                  </span>
                  {is_admin && countUpdatedLinks(type) > 0 && (
                    <span className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-xs font-medium px-2 py-0.5 rounded-full">
                      {countUpdatedLinks(type)}
                    </span>
                  )}
                </div>
              </AccordionTrigger>
              <Button
                size="sm"
                variant="outline"
                className="mr-4"
                onClick={() => handleAddClick(type)}
              >
                Add
              </Button>
            </div>
            <AccordionContent>
              <div className="space-y-4">
                {renderForm(type)}
                {renderLinks(
                  type,
                  (links as LinksGroupedByType)[type] || [],
                  (master_links as LinksGroupedByType)[type] || [],
                )}
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>

      <Dialog
        open={!!confirmDelete}
        onOpenChange={(open) => {
          if (!open) setConfirmDelete(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Are you sure you want to delete this link?
            </DialogTitle>
          </DialogHeader>
          <div className="py-2">This action cannot be undone.</div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDelete(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={async () => {
                if (confirmDelete) {
                  await handleDeleteClick(
                    confirmDelete.id,
                    confirmDelete.account_type_id,
                    confirmDelete.broker_id,
                  );
                  setConfirmDelete(null);
                }
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
