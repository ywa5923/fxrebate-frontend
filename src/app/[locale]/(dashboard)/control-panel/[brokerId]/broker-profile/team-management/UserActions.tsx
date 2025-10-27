"use client"

import { useState } from "react"
import { TeamUser } from "@/types"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreVertical, Edit, Trash2 } from "lucide-react"
import { EditMemberDialog } from "./EditMemberDialog"

interface UserActionsProps {
  user: TeamUser
}

export function UserActions({ user }: UserActionsProps) {
  const [isEditOpen, setIsEditOpen] = useState(false)
  
  // Get permission action from resource_permissions
  const permissionAction = user.resource_permissions?.[0]?.action || "edit"

  return (
    <>
      <div className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setIsEditOpen(true)}>
              <Edit className="h-4 w-4 mr-2" />
              Edit Member
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <EditMemberDialog
        userId={user.id}
        initialData={{
          name: user.name,
          email: user.email,
          permissionAction: permissionAction,
          isActive: user.is_active,
        }}
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
      />
    </>
  )
}

