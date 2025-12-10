"use client"

import { useState } from "react"
import { AlertTriangle, Trash2, LogOut, Ban } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { LoadingSpinner } from "@/components/ui/loading-spinner"

interface ConfirmationModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => Promise<void> | void
  title: string
  description: string
  confirmText?: string
  cancelText?: string
  variant?: "default" | "destructive" | "warning"
  icon?: "warning" | "delete" | "logout" | "ban"
}

const iconMap = {
  warning: AlertTriangle,
  delete: Trash2,
  logout: LogOut,
  ban: Ban,
}

const variantStyles = {
  default: {
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
    confirmButton: "bg-blue-600 hover:bg-blue-700",
  },
  destructive: {
    iconBg: "bg-red-100",
    iconColor: "text-red-600",
    confirmButton: "bg-red-600 hover:bg-red-700",
  },
  warning: {
    iconBg: "bg-yellow-100",
    iconColor: "text-yellow-600",
    confirmButton: "bg-yellow-600 hover:bg-yellow-700",
  },
}

export function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "default",
  icon = "warning",
}: ConfirmationModalProps) {
  const [isLoading, setIsLoading] = useState(false)

  const IconComponent = iconMap[icon]
  const styles = variantStyles[variant]

  const handleConfirm = async () => {
    try {
      setIsLoading(true)
      await onConfirm()
      onClose()
    } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Operation failed';
    console.error("Confirmation action failed:", errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center space-x-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${styles.iconBg}`}>
              <IconComponent className={`w-5 h-5 ${styles.iconColor}`} />
            </div>
            <div>
              <DialogTitle>{title}</DialogTitle>
            </div>
          </div>
          <DialogDescription className="mt-3">{description}</DialogDescription>
        </DialogHeader>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={onClose} disabled={isLoading} className="w-full sm:w-auto bg-transparent">
            {cancelText}
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isLoading}
            className={`w-full sm:w-auto text-white ${styles.confirmButton}`}
          >
            {isLoading ? (
              <>
                <LoadingSpinner size="sm" className="mr-2" />
                Processing...
              </>
            ) : (
              confirmText
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// Hook for easier usage
export function useConfirmation() {
  const [isOpen, setIsOpen] = useState(false)
  const [config, setConfig] = useState<Omit<ConfirmationModalProps, "isOpen" | "onClose">>({
    onConfirm: () => {},
    title: "",
    description: "",
  })

  const confirm = (newConfig: Omit<ConfirmationModalProps, "isOpen" | "onClose">) => {
    setConfig(newConfig)
    setIsOpen(true)

    return new Promise<boolean>((resolve) => {
      const originalOnConfirm = newConfig.onConfirm

      setConfig((prev) => ({
        ...prev,
        onConfirm: async () => {
          try {
            await originalOnConfirm()
            resolve(true)
          } catch (error) {
            resolve(false)
            throw error
          }
        },
      }))
    })
  }

  const ConfirmationComponent = () => <ConfirmationModal {...config} isOpen={isOpen} onClose={() => setIsOpen(false)} />

  return { confirm, ConfirmationComponent }
}
