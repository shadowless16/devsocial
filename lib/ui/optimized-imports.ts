// lib/optimized-imports.ts
// Optimized imports to reduce bundle size

// ✅ Framer Motion - Use smaller 'm' instead of 'motion'
export { m as motion } from 'framer-motion';

// ✅ Recharts - Import specific components only
export {
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

// ✅ Radix UI - Re-export commonly used components
export {
  Root as DialogRoot,
  Trigger as DialogTrigger,
  Content as DialogContent,
  Close as DialogClose,
  Portal as DialogPortal,
  Overlay as DialogOverlay
} from '@radix-ui/react-dialog';

export {
  Root as TabsRoot,
  List as TabsList,
  Trigger as TabsTrigger,
  Content as TabsContent
} from '@radix-ui/react-tabs';

// ✅ Lucide React - Import specific icons only
export {
  Menu,
  X,
  Home,
  User,
  Settings,
  Bell,
  Search,
  Plus,
  Heart,
  MessageCircle,
  Share,
  MoreHorizontal,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Check,
  AlertCircle,
  Info,
  Star,
  Bookmark,
  Send,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Calendar,
  Clock,
  MapPin,
  Link,
  Image,
  Video,
  File,
  Download,
  Upload,
  Copy,
  ExternalLink,
  Zap,
  Trophy,
  Target,
  TrendingUp,
  BarChart3,
  PieChart as PieChartIcon,
  Activity,
  Users,
  MessageSquare,
  ThumbsUp,
  Filter,
  SortAsc,
  SortDesc,
  Grid,
  List,
  Maximize2,
  Minimize2,
  RefreshCw,
  Play,
  Pause,
  Square,
  Volume2,
  VolumeX,
  Wifi,
  WifiOff,
  Battery,
  BatteryLow,
  Signal,
  SignalHigh,
  SignalLow,
  SignalMedium,
  SignalZero
} from 'lucide-react';

// ✅ Date utilities - Use native instead of date-fns where possible
export const formatDate = (date: Date | string) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

export const formatTime = (date: Date | string) => {
  return new Date(date).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const formatRelativeTime = (date: Date | string) => {
  const now = new Date();
  const then = new Date(date);
  const diffMs = now.getTime() - then.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  
  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return formatDate(date);
};