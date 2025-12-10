import { Badge } from "@/components/ui/badge"
import { ExternalLink, Shield, Clock, CheckCircle, XCircle, AlertCircle } from "lucide-react"

interface PostMetaProps {
  imprintStatus: "none" | "pending" | "submitted" | "confirmed" | "failed" | "duplicate"
  onChainProof?: {
    txId?: string
    topicId?: string
    seq?: number
  } | null
  onExplorerClick?: (url: string) => void
}

export function PostMeta({ imprintStatus, onChainProof, onExplorerClick }: PostMetaProps) {
  const getStatusConfig = () => {
    switch (imprintStatus) {
      case "pending":
        return {
          icon: Clock,
          text: "Proof: Pending",
          variant: "secondary" as const,
          className: "text-yellow-700 bg-yellow-50 border-yellow-200"
        }
      case "submitted":
        return {
          icon: AlertCircle,
          text: "Proof: Submitted",
          variant: "secondary" as const,
          className: "text-blue-700 bg-blue-50 border-blue-200"
        }
      case "confirmed":
        return {
          icon: CheckCircle,
          text: "Verified on Hedera",
          variant: "secondary" as const,
          className: "text-green-700 bg-green-50 border-green-200"
        }
      case "failed":
        return {
          icon: XCircle,
          text: "Proof: Failed",
          variant: "destructive" as const,
          className: "text-red-700 bg-red-50 border-red-200"
        }
      case "duplicate":
        return {
          icon: Shield,
          text: "Duplicate Content",
          variant: "secondary" as const,
          className: "text-gray-700 bg-gray-50 border-gray-200"
        }
      default:
        return null
    }
  }

  const statusConfig = getStatusConfig()
  
  if (!statusConfig) return null

  const Icon = statusConfig.icon
  const explorerUrl = onChainProof?.txId 
    ? `https://hashscan.io/testnet/transaction/${onChainProof.txId}`
    : null

  return (
    <div className="flex items-center gap-2 text-xs">
      <Badge variant={statusConfig.variant} className={statusConfig.className}>
        <Icon className="h-3 w-3 mr-1" />
        {statusConfig.text}
      </Badge>
      
      {explorerUrl && (
        <a
          href={explorerUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center h-6 px-2 text-xs text-blue-600 hover:text-blue-700 hover:underline"
          onClick={(e) => {
            e.stopPropagation()
            if (onExplorerClick) {
              e.preventDefault()
              onExplorerClick(explorerUrl)
            }
          }}
        >
          <ExternalLink className="h-3 w-3 mr-1" />
          Explorer
        </a>
      )}
    </div>
  )
}