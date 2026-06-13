import { cn } from "@/lib/utils";

export type Priority = "high" | "medium" | "low";

// 優先度の表示ラベル（日本語）。
const PRIORITY_LABEL: Record<Priority, string> = {
  high: "高",
  medium: "中",
  low: "低",
};

// 優先度ごとの色: 高=赤 / 中=黄（アンバー）/ 低=緑。
const PRIORITY_CLASS: Record<Priority, string> = {
  high: "bg-red-100 text-red-700 ring-red-200",
  medium: "bg-amber-100 text-amber-800 ring-amber-300",
  low: "bg-green-100 text-green-700 ring-green-200",
};

export function PriorityBadge({ priority }: { priority: Priority }) {
  return (
    <span
      data-testid="priority-badge"
      data-priority={priority}
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset",
        PRIORITY_CLASS[priority]
      )}
    >
      優先度: {PRIORITY_LABEL[priority]}
    </span>
  );
}
