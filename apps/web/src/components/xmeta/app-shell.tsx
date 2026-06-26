import type { ComponentPropsWithoutRef, ReactNode } from "react";

import { cn } from "@/lib/utils";
import {
  xmetaLayoutClassNames,
  xmetaSurfaceClassNames,
} from "@/lib/design-system";

import { AppTopBar } from "./app-top-bar";

type AppShellProps = {
  children: ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  return (
    <div
      data-xmeta-app-shell="true"
      className={cn(xmetaSurfaceClassNames.app, xmetaLayoutClassNames.appShell)}
    >
      <AppTopBar />
      <main className={xmetaLayoutClassNames.appMain}>{children}</main>
    </div>
  );
}

type PageContainerProps = ComponentPropsWithoutRef<"div"> & {
  width?: "wide" | "readable" | "readableWide";
};

export function PageContainer({
  children,
  className,
  width = "wide",
  ...props
}: PageContainerProps) {
  return (
    <div
      data-xmeta-page-container={width}
      className={cn(
        width === "wide" && xmetaLayoutClassNames.pageWide,
        width === "readable" && xmetaLayoutClassNames.pageReadable,
        width === "readableWide" && xmetaLayoutClassNames.pageReadableWide,
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

type PageSectionProps = ComponentPropsWithoutRef<"section"> & {
  constrained?: boolean;
};

export function PageSection({
  children,
  className,
  constrained = true,
  ...props
}: PageSectionProps) {
  return (
    <section className={className} data-xmeta-page-section="true" {...props}>
      {constrained ? (
        <div className={xmetaLayoutClassNames.pageSection}>{children}</div>
      ) : (
        children
      )}
    </section>
  );
}
