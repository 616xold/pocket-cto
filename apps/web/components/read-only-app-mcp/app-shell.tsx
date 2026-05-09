import React, { type ReactNode } from "react";
import { bodyStyle, labelStyle, shellStyle, stackStyle } from "./styles";

type AppShellProps = {
  children: ReactNode;
  subtitle: string;
  title: string;
};

export function AppShell({ children, subtitle, title }: AppShellProps) {
  return (
    <main aria-labelledby="read-only-app-mcp-title" style={shellStyle}>
      <header style={stackStyle}>
        <p style={labelStyle}>Local read-only app/MCP component foundation</p>
        <h1
          id="read-only-app-mcp-title"
          style={{
            fontSize: 28,
            lineHeight: 1.12,
            margin: 0,
          }}
        >
          {title}
        </h1>
        <p style={{ ...bodyStyle, maxWidth: 760 }}>{subtitle}</p>
      </header>
      {children}
    </main>
  );
}
