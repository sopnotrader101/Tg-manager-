import { useState } from "react";
import { useRoute, useLocation, Link } from "wouter";
import { 
  ArrowLeft, Shield, ShieldOff, Key, Laptop, Globe, Clock, ServerOff, Mail, KeyRound, Loader2, UserMinus
} from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { 
  useGetAccount, getGetAccountQueryKey,
  useDisable2fa,
  useGetLoginCode, getGetLoginCodeQueryKey,
  useGetSessions, getGetSessionsQueryKey,
  useTerminateSession,
  useTerminateAllSessions,
  useChangeEmail,
  useVerifyEmail,
  useRemoveAccount,
  getListAccountsQueryKey
} from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";

export default function AccountDetail() {
  const [, params] = useRoute("/account/:phone");
  const [, navigate] = useLocation();
  const phone = params?.phone || "";
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: account, isLoading: isAccountLoading } = useGetAccount(phone, { query: { enabled: !!phone } });

  // Panel 1: Disable 2FA
  const disable2fa = useDisable2fa();
  const handleDisable2fa = () => {
    disable2fa.mutate(
      { phone, data: { password: "4735908767" } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetAccountQueryKey(phone) });
          toast({ title: "Operation successful", description: "2FA has been disabled." });
        },
        onError: (err: any) => {
          toast({ variant: "destructive", title: "Operation failed", description: err?.message || "Could not disable 2FA." });
        }
      }
    );
  };

  // Panel 2: Get Login Code
  const { data: loginCode, refetch: fetchLoginCode, isFetching: isFetchingLoginCode } = useGetLoginCode(phone, { query: { enabled: false } });

  // Panel 3: Sessions
  const { data: sessions, isLoading: isSessionsLoading } = useGetSessions(phone, { query: { enabled: !!phone } });
  const terminateSession = useTerminateSession();
  const terminateAllSessions = useTerminateAllSessions();

  const handleTerminateSession = (hash: string) => {
    terminateSession.mutate(
      { phone, data: { hash } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetSessionsQueryKey(phone) });
          toast({ title: "Session Terminated", description: "The session was successfully disconnected." });
        },
        onError: (err: any) => {
          toast({ variant: "destructive", title: "Failed", description: err?.message || "Could not terminate session." });
        }
      }
    );
  };

  const handleTerminateAll = () => {
    terminateAllSessions.mutate(
      { phone },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetSessionsQueryKey(phone) });
          toast({ title: "All Sessions Terminated", description: "Other active sessions have been purged." });
        },
        onError: (err: any) => {
          toast({ variant: "destructive", title: "Failed", description: err?.message || "Could not terminate sessions." });
        }
      }
    );
  };

  // Panel 4: Change Email
  const changeEmail = useChangeEmail();
  const verifyEmail = useVerifyEmail();
  const [emailState, setEmailState] = useState<"input" | "verify">("input");
  const [emailInput, setEmailInput] = useState("");
  const [emailCode, setEmailCode] = useState("");

  const handleSendEmailCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput) return;
    changeEmail.mutate(
      { phone, data: { email: emailInput } },
      {
        onSuccess: () => {
          setEmailState("verify");
          toast({ title: "Verification code sent", description: `Code dispatched to ${emailInput}` });
        },
        onError: (err: any) => {
          toast({ variant: "destructive", title: "Transmission failed", description: err?.message || "Could not send verification email." });
        }
      }
    );
  };

  const handleVerifyEmailCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailCode || !emailInput) return;
    verifyEmail.mutate(
      { phone, data: { email: emailInput, code: emailCode } },
      {
        onSuccess: () => {
          setEmailState("input");
          setEmailInput("");
          setEmailCode("");
          toast({ title: "Email Updated", description: "The security email has been updated." });
        },
        onError: (err: any) => {
          toast({ variant: "destructive", title: "Verification failed", description: err?.message || "Invalid code." });
        }
      }
    );
  };

  // Logout / Remove Account
  const removeAccount = useRemoveAccount();
  const handleRemoveAccount = () => {
    removeAccount.mutate(
      { phone },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListAccountsQueryKey() });
          toast({ title: "Account Removed", description: "The account has been disconnected from the manager." });
          navigate("/");
        },
        onError: (err: any) => {
          toast({ variant: "destructive", title: "Removal failed", description: err?.message || "Could not remove account." });
        }
      }
    );
  };


  if (isAccountLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  if (!account) {
    return (
      <div className="p-8 text-center bg-card border border-border rounded-lg">
        <h2 className="text-xl font-bold">Account Record Not Found</h2>
        <p className="text-muted-foreground mt-2 font-mono">{phone}</p>
        <Button className="mt-4" onClick={() => navigate("/")}>Return to Dashboard</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-12" data-testid="page-account-detail">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-border pb-6">
        <div className="flex items-center gap-4">
          <Link href="/">
            <Button variant="outline" size="icon" className="h-10 w-10 shrink-0">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight font-mono">{account.phone}</h1>
              {account.has2fa ? (
                <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 gap-1 rounded-sm">
                  <Shield className="h-3 w-3" /> SECURED
                </Badge>
              ) : (
                <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20 gap-1 rounded-sm">
                  <ShieldOff className="h-3 w-3" /> UNSECURED
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground mt-1 flex items-center gap-2">
              <span className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded">ID: {account.id}</span>
              {account.username && <span className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded">@{account.username}</span>}
              <span>{account.firstName} {account.lastName}</span>
            </p>
          </div>
        </div>
        <Button variant="outline" className="border-destructive/50 text-destructive hover:bg-destructive hover:text-destructive-foreground gap-2" onClick={handleRemoveAccount} disabled={removeAccount.isPending}>
          {removeAccount.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserMinus className="h-4 w-4" />}
          DISCONNECT ACCOUNT
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Panel 1: Disable 2FA */}
        <Card className="border-border bg-card shadow-sm">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2 text-primary">
              <Shield className="h-5 w-5" />
              <CardTitle className="text-lg">Security Protocol</CardTitle>
            </div>
            <CardDescription className="text-xs font-mono">Manage Two-Factor Authentication</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-4 bg-muted/30 rounded-md border border-border/50">
              <div>
                <p className="font-medium text-sm">2FA Status</p>
                <p className="text-xs text-muted-foreground mt-1 font-mono">
                  {account.has2fa ? "ACTIVE_PROTECTION" : "DISABLED"}
                </p>
              </div>
              <Button 
                variant={account.has2fa ? "destructive" : "secondary"} 
                disabled={!account.has2fa || disable2fa.isPending}
                onClick={handleDisable2fa}
                data-testid="button-disable-2fa"
              >
                {disable2fa.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "OVERRIDE & DISABLE"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Panel 2: Get Login Code */}
        <Card className="border-border bg-card shadow-sm">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2 text-primary">
              <Key className="h-5 w-5" />
              <CardTitle className="text-lg">Authentication Intercept</CardTitle>
            </div>
            <CardDescription className="text-xs font-mono">Retrieve latest Telegram service login code</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              className="w-full gap-2 font-bold" 
              onClick={() => fetchLoginCode()} 
              disabled={isFetchingLoginCode}
              data-testid="button-fetch-code"
            >
              {isFetchingLoginCode ? <Loader2 className="h-4 w-4 animate-spin" /> : <KeyRound className="h-4 w-4" />}
              PULL LATEST LOGIN CODE
            </Button>
            
            {loginCode && (
              <div className="p-4 bg-background border border-border/50 rounded-md space-y-3">
                {loginCode.found ? (
                  <>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-muted-foreground font-mono">PAYLOAD</span>
                      <Badge variant="outline" className="text-primary border-primary/20 bg-primary/10 tracking-widest text-lg font-mono px-3">
                        {loginCode.code}
                      </Badge>
                    </div>
                    <Separator className="bg-border/50" />
                    <div className="flex justify-between items-center text-xs text-muted-foreground font-mono">
                      <span>FROM: {loginCode.from}</span>
                      <span>TIME: {loginCode.date}</span>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-2 text-sm text-muted-foreground font-mono">
                    NO_RECENT_CODES_DETECTED
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Panel 3: Sessions */}
        <Card className="border-border bg-card shadow-sm lg:col-span-2">
          <CardHeader className="pb-4 flex flex-row items-start justify-between">
            <div>
              <div className="flex items-center gap-2 text-primary">
                <Laptop className="h-5 w-5" />
                <CardTitle className="text-lg">Active Sessions</CardTitle>
              </div>
              <CardDescription className="text-xs font-mono mt-1">Manage connected devices and API endpoints</CardDescription>
            </div>
            <Button 
              variant="destructive" 
              size="sm" 
              onClick={handleTerminateAll} 
              disabled={terminateAllSessions.isPending}
              data-testid="button-terminate-all"
              className="gap-2"
            >
              {terminateAllSessions.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <ServerOff className="h-4 w-4" />}
              PURGE ALL OTHERS
            </Button>
          </CardHeader>
          <CardContent>
            {isSessionsLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
              </div>
            ) : sessions?.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground font-mono text-sm bg-muted/20 border border-dashed border-border rounded">
                NO_ACTIVE_SESSIONS_FOUND
              </div>
            ) : (
              <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {sessions?.map((session) => (
                  <div key={session.hash} className={`flex flex-col sm:flex-row gap-4 p-4 border rounded-md transition-colors ${session.current ? 'border-primary/40 bg-primary/5' : 'border-border/50 bg-background hover:border-border'}`}>
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">{session.appName}</span>
                        <span className="text-xs text-muted-foreground font-mono">v{session.deviceModel}</span>
                        {session.current && <Badge className="bg-primary text-primary-foreground h-5 text-[10px] ml-2">CURRENT_NODE</Badge>}
                      </div>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground font-mono">
                        <span className="flex items-center gap-1"><Globe className="h-3 w-3" /> {session.ip} ({session.country})</span>
                        <span className="flex items-center gap-1"><Laptop className="h-3 w-3" /> {session.platform}</span>
                        <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {session.dateActive}</span>
                      </div>
                    </div>
                    {!session.current && (
                      <div className="flex items-center shrink-0">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="border-destructive/30 text-destructive hover:bg-destructive hover:text-destructive-foreground text-xs font-mono"
                          onClick={() => handleTerminateSession(session.hash)}
                          disabled={terminateSession.isPending}
                        >
                          {terminateSession.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : "TERMINATE"}
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Panel 4: Change Email */}
        <Card className="border-border bg-card shadow-sm lg:col-span-2">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2 text-primary">
              <Mail className="h-5 w-5" />
              <CardTitle className="text-lg">Recovery Email Configuration</CardTitle>
            </div>
            <CardDescription className="text-xs font-mono">Modify the email address used for 2FA recovery</CardDescription>
          </CardHeader>
          <CardContent>
            {emailState === "input" ? (
              <form onSubmit={handleSendEmailCode} className="flex flex-col sm:flex-row gap-3 max-w-xl animate-in fade-in slide-in-from-right-2">
                <div className="flex-1 space-y-2">
                  <Label htmlFor="email" className="sr-only">New Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="operator@system.local"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    className="font-mono bg-background"
                    disabled={changeEmail.isPending}
                  />
                </div>
                <Button type="submit" disabled={!emailInput || changeEmail.isPending} className="sm:w-auto font-bold gap-2">
                  {changeEmail.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
                  INITIATE CHANGE
                </Button>
              </form>
            ) : (
              <form onSubmit={handleVerifyEmailCode} className="flex flex-col sm:flex-row gap-3 max-w-xl animate-in fade-in slide-in-from-right-2">
                <div className="flex-1 space-y-2">
                  <Label htmlFor="code" className="sr-only">Verification Code</Label>
                  <Input
                    id="code"
                    type="text"
                    placeholder="Verification code"
                    value={emailCode}
                    onChange={(e) => setEmailCode(e.target.value)}
                    className="font-mono tracking-widest text-center bg-background"
                    disabled={verifyEmail.isPending}
                    autoFocus
                  />
                  <p className="text-xs text-muted-foreground font-mono">Code dispatched to: {emailInput}</p>
                </div>
                <div className="flex gap-2 shrink-0 items-start">
                  <Button type="submit" disabled={!emailCode || verifyEmail.isPending} className="font-bold">
                    {verifyEmail.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "VERIFY & APPLY"}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setEmailState("input")} disabled={verifyEmail.isPending}>
                    CANCEL
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
