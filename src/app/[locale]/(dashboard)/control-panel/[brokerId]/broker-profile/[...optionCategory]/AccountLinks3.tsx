import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { Url} from "@/types/Url";
import { LinksGroupedByType } from "@/types/AccountTypeLinks";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { apiClient } from "@/lib/api-client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

import { BrokerPreviousValue } from "@/components/BrokerPreviousValue";
import { Copy, Plus, Pencil, Trash } from "lucide-react";
import { checkFieldsPublicValue } from "@/lib/checkFieldsPublicValue";
import { UseTokenAuth } from "@/lib/enums";



const LinkFormSchema = z.object({
  url: z
    .string()
    .trim()
    .min(1, { message: "URL is required" })
    .url({ message: "Please enter a valid URL" }),
  name: z.string().trim().min(1, { message: "Name is required" }),
  type: z.string().min(1, { message: "Type is required" }),
  is_master: z.boolean().optional(),
});

type CopyField="name"|"url"

export default function AccountLinks({
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
  // Handle accordion state change - close form when accordion closes
  const handleAccordionChange = (value: string[]) => {
    setOpenAccordion(value);

    // If the accordion for the current adding/editing type is closed, cancel the form
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

  // Form for add/edit - use dynamic schema based on is_admin
  const form = useForm<z.infer<typeof LinkFormSchema>>({
    resolver: zodResolver(LinkFormSchema as any),
    defaultValues: {
      url: "",
      name: "",
      type: "",
      is_master: false,
    },
  });
  const router = useRouter();

  function openEdit(link: Url) {

    setEditingLink(link);
    //if admin=true,checks what rows has empty public value and broker value is not empty
    //mark the fields that has empty public values with green color of the copy field buttons
    //this is done in renderCopyBtn function
    const shouldBeUpdated = checkFieldsPublicValue(link, ["url", "name"]);
    setClickedCopyBtns(new Set(shouldBeUpdated));
    const url = is_admin ? link.public_url ?? link.url : link.url;
    const name = is_admin ? link.public_name ?? link.name : link.name;
    const isMaster = link.urlable_id === null;

    form.reset({
      url: url,
      name: name,
      type: link.url_type,
      is_master: isMaster,
    });
  }

   //this function is used in the edit form to show the updated fields in red
   const getLabelClassName = (updatedFieldKey: string) =>
    cn(
      "text-sm font-medium",
      editingLink?.metadata?.updated_fields?.includes(updatedFieldKey) && is_admin
        ? "text-red-600 dark:text-red-400"
        : "text-gray-700 dark:text-gray-200",
    );

  // Simulated server action
  async function onSubmit(data: z.infer<typeof LinkFormSchema>) {
    console.log("Form submitted with data:", data);
    console.log("Is admin:", is_admin);
    
    try {
      // If editing, include the id
      const payload = {
        ...(editingLink ? { id: editingLink.id } : { id: null }),
        broker_id,
        account_type_id: data.is_master ? null : account_type_id,
        url_type: data.type,
        name: data.name,
        url: data.url,
       
      };

      console.log("Payload being sent:", payload);
      
     // const response = await saveAccountTypeLink(payload);

     const serverUrl = editingLink
      ? `/account-type/broker/${broker_id}/url/${editingLink.id}`
      : `/account-type/broker/${broker_id}/url`;
  
      const response = await apiClient<Url>(serverUrl, UseTokenAuth.Yes, {
        method: editingLink ? "PUT" : "POST",
        body: JSON.stringify(payload),
      });
      if (response.success) {
        router.refresh();
        toast.success(
          editingLink ? "Link updated successfully!" : "Link added successfully!"
        );
      } else {
        toast.error(response.message ?? "Failed to save link");
      }
      
    } catch (error) {
      toast.error("Failed to save link");
    }
    setEditingLink(null);
    setAddingType(null);  
  }

  // Handle add button click
  function handleAddClick(type: string) {
    setAddingType(type);
    form.reset({
      url: "",
      name: "",
      type,
      is_master: false,
    });
    // Ensure the accordion is open for this type
    if (!openAccordion.includes(type)) {
      setOpenAccordion([...openAccordion, type]);
    }
  }

  async function handleDeleteClick(
    link_id: number,
    account_type_id: number | null,
    broker_id: number
  ) {
    try {
     
      const serverUrl = `/account-type/broker/${broker_id}/url/${link_id}`;
      const response = await apiClient<Url>(serverUrl, UseTokenAuth.Yes, {
        method: "DELETE",
      });
      if (response.success) {
        router.refresh();
        toast.success("Link deleted successfully!");
      } else {
        toast.error(response.message ?? "Failed to delete link");
      }
     
    } catch (error) {
      toast.error("Failed to delete link");
      console.log("DELETE link error", JSON.stringify(error, null, 2));
    }
  }

  // Count updated links by type
  function countUpdatedLinks(type: string): number {
    const accountLinks = (links as LinksGroupedByType)[type] || [];
    const masterLinksForType = (master_links as LinksGroupedByType)[type] || [];
    return [...accountLinks, ...masterLinksForType].filter(
      (link) => link.is_updated_entry === 1
    ).length;
  }

  // Render links for a group
  function renderLinks(
    type: string,
    accountLinks: Url[] = [],
    masterLinks: Url[] = []
  ) {
    const allLinks = [...accountLinks, ...masterLinks];

    if (allLinks.length === 0) {
      return <div className="text-muted-foreground text-xs">No links</div>;
    }

    return (
      <div>
        {allLinks.map((link, index) => {
         
          const displayName = is_admin ? link.public_name ?? link.name : link.name;
          const displayUrl = is_admin ? link.public_url ?? link.url : link.url;
          const isMaster = link.urlable_id === null;
          const isUpdatedEntry = link.is_updated_entry === 1;
          return (
            <div key={link.id} className="flex items-center gap-2 mb-2">
              <div className="flex items-center gap-3 flex-1">
                <div className="w-6 h-6 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center text-xs font-medium text-gray-600 dark:text-gray-400">
                  <span
                    className={cn("", {
                      "text-red-500 dark:text-red-400 font-bold": is_admin && isUpdatedEntry,
                    })}
                  >
                    {index + 1}
                  </span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <a
                      href={displayUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium underline"
                    >
                      {displayName}
                    </a>
                   
                    {isMaster && (
                      <span className="text-xs bg-blue-100 text-blue-800 px-1 rounded">
                        Master
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {displayUrl}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 border border-green-200 dark:border-green-800 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-950/30"
                  onClick={() => {
                    openEdit(link);
                  }}
                  title="Edit"
                  aria-label="Edit link"
                >
                  <Pencil className="w-4 h-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 border border-red-200 dark:border-red-800 text-red-400 dark:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 hover:border-red-300 dark:hover:border-red-700 transition-colors"
                  onClick={() =>
                    setConfirmDelete({ id: link.id, account_type_id, broker_id })
                  }
                  title="Delete"
                  aria-label="Delete link"
                >
                  <Trash className="w-4 h-4" />
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    );
  }
  type CopyField = "name" | "url";
  function copyBrokerValueToPublicValue(field: CopyField) {
    const brokerValue = editingLink?.[field];
    if (brokerValue == null || brokerValue === "") return;
    form.setValue(field, String(brokerValue));

  }

  function renderCopyBtn(field: CopyField) {
    if (!is_admin || !editingLink) return null;

    const publicKey = `public_${field}` as keyof Url;
    // const showRedCopyHint =
    //   editingLink.is_updated_entry === 1 &&
    //   editingLink[field] != editingLink[publicKey];

    const showRedCopyHint = editingLink.metadata?.updated_fields?.includes(field);

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

  // Render add/edit form with fade effects
  function renderForm(type: string) {
    const isVisible =
      addingType === type || (editingLink && editingLink.url_type === type);

    return (
      <div
        className={`transition-all duration-1000 ease-in-out overflow-hidden ${
          isVisible
            ? "opacity-100 max-h-[500px] translate-y-0"
            : "opacity-0 max-h-0 translate-y-[-10px]"
        }`}
      >
        <Card className="max-w-2xl mx-auto">
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={(e) => {
                  console.log("Form submit event triggered");
                  console.log("Form errors:", form.formState.errors);
                  form.handleSubmit(onSubmit)(e);
                }}
                className="space-y-3"
              >
                <FormField
                  control={form.control}
                  name= "url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className={getLabelClassName("url")}>URL</FormLabel>
                      <div className="flex items-center gap-2">
                        <FormControl>
                          <Input {...field} className="flex-1" />
                        </FormControl>
                        {/* Copy button for admins with updated entries */}
                        
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 {is_admin && editingLink && (
                  <div className="mt-1 flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <BrokerPreviousValue
                        brokerValue={editingLink?.url}
                        previousValue={editingLink?.previous_url}
                      />
                    </div>
                    {renderCopyBtn("url")}
                  </div>
                )} 

                <FormField
                  control={form.control}
                  name= "name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className={getLabelClassName("name")}>Name</FormLabel>
                      <div className="flex items-center gap-2">
                        <FormControl>
                          <Input {...field} className="flex-1" />
                        </FormControl>
                        {/* Copy button for admins with updated entries */}
                        
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {is_admin && editingLink && (
                  <div className="mt-1 flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <BrokerPreviousValue
                        brokerValue={editingLink?.url}
                        previousValue={editingLink?.previous_url}
                      />
                    </div>
                    {renderCopyBtn("url")}
                  </div>
                )} 
               
                {/* Show "Is Master Link" only for admins when adding new link (not editing) */}
              
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
                        <FormLabel className={getLabelClassName("urlable_id")}>Is Master Link</FormLabel>
                      </FormItem>
                    )}
                  />
                   {is_admin && editingLink && (
                  <div className="mt-1 flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <BrokerPreviousValue
                        show="previous"
                        previousValue={editingLink?.metadata?.previous_relations_values?.previous_account_type}
                      />
                    </div>
                   
                  </div>
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
      {/* Header Section */}
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
              <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {links_groups.length} categories
              </span>
            </div>
          </div>
        </div>

        <div className="h-px bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-600 to-transparent"></div>
      </div>

      {/* Links Accordion */}
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
                type="button"
                size="icon"
                variant="outline"
                title="Add link"
                className={cn(
                  "mr-4 h-7 w-7 shrink-0 rounded border transition-all duration-150",
                  "border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400",
                  "hover:border-gray-400 dark:hover:border-gray-500 hover:text-gray-600 dark:hover:text-gray-300",
                )}
                onClick={() => handleAddClick(type)}
              >
                <Plus className="h-3.5 w-3.5" />
              </Button>
            </div>
            <AccordionContent>
              <div className="space-y-4">
                {/* Add/Edit Form with fade effects */}
                {renderForm(type)}
                {/* All Links (Account + Master) */}
                {renderLinks(
                  type,
                  (links as LinksGroupedByType)[type] || [],
                  (master_links as LinksGroupedByType)[type] || []
                )}
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>




      {/* Confirmation Dialog for Delete */}
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
                    confirmDelete.broker_id
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
