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
import { Settings, Edit } from "lucide-react"
import { EditMemberDialog } from "./EditMemberDialog"

interface UserActionsProps {
  brokerId: number
  user: TeamUser
}

export function UserActions({ brokerId, user }: UserActionsProps) {
  const [isEditOpen, setIsEditOpen] = useState(false)
  
  // Get permission action from resource_permissions
  const permissionAction = user.resource_permissions?.[0]?.action || "edit"

  return (
    <>
      <div className="flex-shrink-0">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
              aria-label="Member settings"
            >
              <Settings className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
            <DropdownMenuItem onClick={() => setIsEditOpen(true)} className="dark:focus:bg-gray-800">
              <Edit className="h-4 w-4 mr-2" />
              Edit Member
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <EditMemberDialog
        brokerId={brokerId}
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

