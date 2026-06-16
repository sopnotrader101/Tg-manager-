import { ReactNode } from "react";
import { Link } from "wouter";
import { Shield, Activity, TerminalSquare } from "lucide-react";
import { useHealthCheck } from "@workspace/api-client-react";

export function Layout({ children }: { children: ReactNode }) {
  const { data: health, isLoading } = useHealthCheck();

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground dark">
      {/* Top Navbar */}
      <header className="sticky top-0 z-50 w-full border-b border-border bg-card/80 backdrop-blur">
        <div className="container flex h-14 max-w-7xl items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="bg-primary/10 p-1.5 rounded border border-primary/20 group-hover:border-primary/50 transition-colors">
                <TerminalSquare className="h-4 w-4 text-primary" />
              </div>
              <span className="font-bold tracking-tight text-sm uppercase">
                TG_MANAGER <span className="text-primary">v1.0</span>
              </span>
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-xs font-mono">
              <span className="text-muted-foreground">SYSTEM_STATUS:</span>
              {isLoading ? (
                <span className="flex items-center gap-1.5 text-muted-foreground">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-muted-foreground opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-muted-foreground"></span>
                  </span>
                  CHECKING
                </span>
              ) : health ? (
                <span className="flex items-center gap-1.5 text-primary">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                  </span>
                  ONLINE
                </span>
              ) : (
                <span className="flex items-center gap-1.5 text-destructive">
                  <span className="relative flex h-2 w-2">
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-destructive"></span>
                  </span>
                  OFFLINE
                </span>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col p-4 md:p-6 lg:p-8 max-w-7xl mx-auto w-full">
        {children}
      </main>
    </div>
  );
}
