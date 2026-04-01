import { Monitor, TrendingUp, Lightbulb, Rocket } from "lucide-react";
import { type FounderRole } from "@/types/database";

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  Technical: Monitor,
  Sales: TrendingUp,
  Idea: Lightbulb,
};

export function RoleIcon({
  role,
  className = "h-6 w-6",
}: {
  role: string;
  className?: string;
}) {
  const Icon = ICONS[role] ?? Rocket;
  return <Icon className={className} />;
}
