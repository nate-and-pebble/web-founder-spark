"use client";

import { User } from "lucide-react";

export function Avatar({
  url,
  name,
  size = "md",
}: {
  url?: string | null;
  name?: string;
  size?: "sm" | "md" | "lg";
}) {
  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-12 w-12",
    lg: "h-20 w-20",
  };
  const iconSizes = {
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-10 w-10",
  };

  if (url) {
    return (
      <img
        src={url}
        alt={name ?? "Avatar"}
        className={`${sizeClasses[size]} rounded-full object-cover bg-orange-100 dark:bg-orange-900/30`}
      />
    );
  }

  return (
    <div
      className={`${sizeClasses[size]} flex items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400`}
    >
      <User className={iconSizes[size]} />
    </div>
  );
}
