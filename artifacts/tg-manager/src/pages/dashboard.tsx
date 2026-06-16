import { useState, useMemo } from "react";
import { Link } from "wouter";
import { Plus, Search, Shield, ShieldAlert, Phone, User, Activity } from "lucide-react";
import { useListAccounts } from "@workspace/api-client-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

export default function Dashboard() {
  const { data: accounts, isLoading } = useListAccounts();
  const [search, setSearch] = useState("");

  const filteredAccounts = useMemo(() => {
    if (!accounts) return [];
    if (!search) return accounts;
    const lower = search.toLowerCase();
    return accounts.filter(
      (a) =>
        a.phone.toLowerCase().includes(lower) ||
        (a.username && a.username.toLowerCase().includes(lower)) ||
        (a.firstName && a.firstName.toLowerCase().includes(lower)) ||
        (a.lastName && a.lastName.toLowerCase().includes(lower))
    );
  }, [accounts, search]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500" data-testid="page-dashboard">
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Accounts Console</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage connected Telegram instances.</p>
        </div>
        <Link href="/login">
          <Button className="gap-2" data-testid="button-add-account">
            <Plus className="h-4 w-4" />
            INITIALIZE NEW ACCOUNT
          </Button>
        </Link>
      </div>

      <div className="flex items-center gap-2 max-w-md">
        <div className="relative w-full">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Query by phone or username..."
            className="pl-9 font-mono bg-card"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            data-testid="input-search"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="overflow-hidden border-border/50 bg-card/50">
              <CardContent className="p-6 space-y-4">
                <Skeleton className="h-5 w-1/2" />
                <Skeleton className="h-4 w-3/4" />
                <div className="pt-4 flex gap-2">
                  <Skeleton className="h-8 w-full" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredAccounts.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 text-center border border-dashed border-border rounded-lg bg-card/30">
          <Activity className="h-10 w-10 text-muted-foreground mb-4 opacity-50" />
          <h3 className="text-lg font-medium">No active accounts</h3>
          <p className="text-sm text-muted-foreground mt-1 max-w-sm">
            {search ? "No accounts match your query." : "Initialize a new session to begin managing accounts."}
          </p>
          {search && (
            <Button variant="link" onClick={() => setSearch("")} className="mt-2 text-primary">
              Clear filters
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAccounts.map((account) => (
            <Card key={account.phone} className="overflow-hidden group hover:border-primary/50 transition-colors bg-card" data-testid={`card-account-${account.phone}`}>
              <CardContent className="p-5 flex flex-col h-full">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="font-mono font-medium text-lg tracking-tight">{account.phone}</span>
                  </div>
                  {account.has2fa ? (
                    <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 gap-1.5 px-2">
                      <Shield className="h-3 w-3" />
                      2FA SECURED
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20 gap-1.5 px-2">
                      <ShieldAlert className="h-3 w-3" />
                      UNSECURED
                    </Badge>
                  )}
                </div>

                <div className="space-y-2 mb-6 flex-1">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <User className="h-3.5 w-3.5" />
                    <span className="truncate">
                      {account.firstName} {account.lastName || ""}
                    </span>
                  </div>
                  {account.username && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span className="font-mono text-xs px-1.5 py-0.5 rounded bg-muted">@</span>
                      <span className="truncate font-mono text-xs">{account.username}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span className="font-mono text-xs px-1.5 py-0.5 rounded bg-muted">ID</span>
                    <span className="truncate font-mono text-xs">{account.id}</span>
                  </div>
                </div>

                <Link href={`/account/${account.phone}`} className="w-full mt-auto">
                  <Button variant="secondary" className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                    ACCESS TERMINAL
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
