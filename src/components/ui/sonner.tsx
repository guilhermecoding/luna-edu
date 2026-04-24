"use client";

import { IconAlertCircleFilled, IconAlertOctagonFilled, IconCircleCheckFilled, IconInfoCircleFilled, IconLoader2 } from "@tabler/icons-react";
import { useTheme } from "next-themes";
import { Toaster as Sonner, type ToasterProps } from "sonner";



const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      icons={{
        success: (
          <IconCircleCheckFilled
            className="size-4"
          />
        ),
        info: (
          <IconInfoCircleFilled
            className="size-4"
          />
        ),
        warning: (
          <IconAlertCircleFilled
            className="size-4"
          />
        ),
        error: (
          <IconAlertOctagonFilled
            className="size-4"
          />
        ),
        loading: (
          <IconLoader2
            className="size-4 animate-spin"
          />
        ),
      }}
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          "--border-radius": "var(--radius)",
          "--success-bg": "oklch(0.96 0.05 143)",
          "--success-border": "oklch(0.9 0.1 143)",
          "--success-text": "oklch(0.3 0.12 143)",
          "--error-bg": "oklch(0.96 0.05 25)",
          "--error-border": "oklch(0.9 0.1 25)",
          "--error-text": "oklch(0.3 0.12 25)",
        } as React.CSSProperties
      }
      toastOptions={{
        classNames: {
          toast: "cn-toast",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
