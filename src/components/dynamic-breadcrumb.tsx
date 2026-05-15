"use client";

import { usePathname } from "next/navigation";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbEllipsis,
} from "@/components/ui/breadcrumb";
import React from "react";

export function DynamicBreadcrumb() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  if (segments.length === 0) {
    return null;
  }

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {segments.length > 4 ? (
          <>
            {/* Primeiro item */}
            <BreadcrumbItem className="capitalize">
              <BreadcrumbLink href={"/" + segments[0]}>
                {segments[0].replace(/-/g, " ")}
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />

            {/* Ellipsis no meio */}
            <BreadcrumbItem>
              <BreadcrumbEllipsis />
            </BreadcrumbItem>
            <BreadcrumbSeparator />

            {/* Últimos dois itens */}
            {segments.slice(-2).map((segment, idx) => {
              const originalIndex = segments.length - 2 + idx;
              const isLast = originalIndex === segments.length - 1;
              const href = "/" + segments.slice(0, originalIndex + 1).join("/");
              const title = segment.replace(/-/g, " ");

              return (
                <React.Fragment key={href}>
                  <BreadcrumbItem className="capitalize">
                    {isLast ? (
                      <BreadcrumbPage>{title}</BreadcrumbPage>
                    ) : (
                      <BreadcrumbLink href={href}>{title}</BreadcrumbLink>
                    )}
                  </BreadcrumbItem>
                  {!isLast && <BreadcrumbSeparator />}
                </React.Fragment>
              );
            })}
          </>
        ) : (
          segments.map((segment, index) => {
            const isLast = index === segments.length - 1;
            const href = "/" + segments.slice(0, index + 1).join("/");
            const title = segment.replace(/-/g, " ");

            return (
              <React.Fragment key={href}>
                <BreadcrumbItem className="capitalize">
                  {isLast ? (
                    <BreadcrumbPage>{title}</BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink href={href}>{title}</BreadcrumbLink>
                  )}
                </BreadcrumbItem>
                {!isLast && <BreadcrumbSeparator />}
              </React.Fragment>
            );
          })
        )}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
