"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Loader2, UserPlus } from "lucide-react"
import { updateBrokerTeamUser, deleteBrokerTeamUser } from "./actions"
import { Checkbox } from "@/components/ui/checkbox"

const editMemberSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  permissionAction: z.enum(["manage", "edit", "view"], {
    required_error: "Please select a permission level",
  }),
  isActive: z.boolean(),
})

type EditMemberFormValues = z.infer<typeof editMemberSchema>

interface EditMemberDialogProps {
  userId: number
  initialData: {
    name: string
    email: string
    permissionAction: string
    isActive: boolean
  }
  isOpen: boolean
  onClose: () => void
}

export function EditMemberDialog({ userId, initialData, isOpen, onClose }: EditMemberDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [deleteMode, setDeleteMode] = useState(false)

  const form = useForm<EditMemberFormValues>({
    resolver: zodResolver(editMemberSchema),
    defaultValues: {
      name: initialData.name,
      email: initialData.email,
      permissionAction: initialData.permissionAction as "manage" | "edit" | "view",
      isActive: initialData.isActive,
    },
  })

  async function onSubmit(data: EditMemberFormValues) {
    setIsLoading(true)
    try {
      const result = await updateBrokerTeamUser(userId, {
        name: data.name,
        email: data.email,
        permission_action: data.permissionAction,
        is_active: data.isActive,
      })

      if (result.success) {
        form.reset()
        onClose()
        window.location.reload()
      } else {
        form.setError('root', { message: result.message })
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to update user"
      form.setError('root', { message: errorMessage })
    } finally {
      setIsLoading(false)
    }
  }

  async function handleDelete() {
    if (!confirm("Are you sure you want to delete this team member?")) {
      return
    }

    setIsLoading(true)
    try {
      const result = await deleteBrokerTeamUser(userId)
      
      if (result.success) {
        onClose()
        window.location.reload()
      } else {
        alert(result.message || "Failed to delete user")
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to delete user"
      alert(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        {!deleteMode ? (
          <>
            <DialogHeader>
              <DialogTitle>Edit Team Member</DialogTitle>
              <DialogDescription>
                Update the team member's information and permissions.
              </DialogDescription>
            </DialogHeader>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input placeholder="John Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="john@example.com" {...field} />
                      </FormControl>
                      <FormDescription>
                        Update the email address for this team member
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="permissionAction"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Permission Level</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select permission level" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="view">View Only</SelectItem>
                          <SelectItem value="edit">Edit</SelectItem>
                          <SelectItem value="manage">Manage</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Manage: Full access, Edit: Can modify data, View: Read-only access
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Active Status</FormLabel>
                        <FormDescription>
                          Inactive users won't be able to access the system
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />

                {form.formState.errors.root && (
                  <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md p-3">
                    {form.formState.errors.root.message}
                  </div>
                )}

                <DialogFooter className="gap-2">
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={() => setDeleteMode(true)}
                    disabled={isLoading}
                  >
                    Delete Member
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onClose}
                    disabled={isLoading}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isLoading} className="bg-gray-700 hover:bg-gray-800 text-white">
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      <>
                        <UserPlus className="mr-2 h-4 w-4" />
                        Update Member
                      </>
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Delete Team Member</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this team member? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setDeleteMode(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="destructive"
                onClick={handleDelete}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  "Delete"
                )}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}

