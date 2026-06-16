import { useState } from "react";
import { useLocation } from "wouter";
import { ArrowLeft, Loader2, TerminalSquare } from "lucide-react";
import { useSendCode, useSignIn, getListAccountsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

export default function Login() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  
  // Store intermediate auth state
  const [phoneCodeHash, setPhoneCodeHash] = useState("");
  const [sessionId, setSessionId] = useState("");

  const sendCode = useSendCode();
  const signIn = useSignIn();

  const handleSendCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone) return;
    
    sendCode.mutate(
      { data: { phone } },
      {
        onSuccess: (res) => {
          setPhoneCodeHash(res.phoneCodeHash);
          setSessionId(res.sessionId);
          setStep(2);
          toast({
            title: "Transmission successful",
            description: "Authentication code sent to device.",
          });
        },
        onError: (err: any) => {
          toast({
            variant: "destructive",
            title: "Transmission failed",
            description: err?.message || "Failed to send code.",
          });
        },
      }
    );
  };

  const handleVerifyCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code) return;

    signIn.mutate(
      { data: { phone, code, phoneCodeHash, sessionId } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListAccountsQueryKey() });
          toast({
            title: "Authentication successful",
            description: "Session established.",
          });
          navigate("/");
        },
        onError: (err: any) => {
          const errMsg = String(err?.message || err || "");
          if (errMsg.includes("2FA_REQUIRED") || errMsg.includes("SESSION_PASSWORD_NEEDED")) {
            setStep(3);
            toast({
              title: "2FA Intercept",
              description: "Two-factor authentication required. Please provide password.",
            });
          } else {
            toast({
              variant: "destructive",
              title: "Verification failed",
              description: errMsg,
            });
          }
        },
      }
    );
  };

  const handlePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) return;

    signIn.mutate(
      { data: { phone, code, phoneCodeHash, sessionId, password } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListAccountsQueryKey() });
          toast({
            title: "Authentication successful",
            description: "2FA bypassed. Session established.",
          });
          navigate("/");
        },
        onError: (err: any) => {
          toast({
            variant: "destructive",
            title: "Verification failed",
            description: err?.message || "Invalid password.",
          });
        },
      }
    );
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4" data-testid="page-login">
      <div className="w-full max-w-md space-y-4">
        <Button variant="ghost" className="pl-0 gap-2 mb-4 hover:bg-transparent hover:text-primary" onClick={() => navigate("/")}>
          <ArrowLeft className="h-4 w-4" /> ABORT SEQUENCE
        </Button>

        <Card className="border-border shadow-2xl bg-card">
          <CardHeader className="space-y-1 pb-6 border-b border-border/50">
            <div className="flex items-center gap-2 mb-2">
              <TerminalSquare className="h-5 w-5 text-primary" />
              <CardTitle className="text-xl font-bold tracking-tight uppercase">Initialization</CardTitle>
            </div>
            <CardDescription className="font-mono text-xs">
              Establish a new Telegram session token.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            {step === 1 && (
              <form onSubmit={handleSendCode} className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="space-y-2">
                  <Label htmlFor="phone" className="font-mono text-xs text-muted-foreground uppercase">Target Phone Number</Label>
                  <Input
                    id="phone"
                    placeholder="+1234567890"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="font-mono text-lg bg-background border-border focus-visible:ring-primary"
                    disabled={sendCode.isPending}
                    data-testid="input-phone"
                  />
                </div>
                <Button type="submit" className="w-full font-bold" disabled={sendCode.isPending || !phone} data-testid="button-send-code">
                  {sendCode.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "TRANSMIT CODE"}
                </Button>
              </form>
            )}

            {step === 2 && (
              <form onSubmit={handleVerifyCode} className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="space-y-2">
                  <Label htmlFor="code" className="font-mono text-xs text-muted-foreground uppercase">Verification Code</Label>
                  <Input
                    id="code"
                    placeholder="00000"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="font-mono text-lg bg-background border-border focus-visible:ring-primary tracking-widest text-center"
                    disabled={signIn.isPending}
                    autoFocus
                    data-testid="input-code"
                  />
                  <p className="text-xs text-muted-foreground font-mono">Sent to {phone}</p>
                </div>
                <Button type="submit" className="w-full font-bold" disabled={signIn.isPending || !code} data-testid="button-verify-code">
                  {signIn.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "VERIFY PAYLOAD"}
                </Button>
              </form>
            )}

            {step === 3 && (
              <form onSubmit={handlePassword} className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="space-y-2">
                  <Label htmlFor="password" className="font-mono text-xs text-muted-foreground uppercase">2FA Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter password..."
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="font-mono bg-background border-border focus-visible:ring-primary"
                    disabled={signIn.isPending}
                    autoFocus
                    data-testid="input-password"
                  />
                </div>
                <Button type="submit" className="w-full font-bold" disabled={signIn.isPending || !password} data-testid="button-submit-password">
                  {signIn.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "DECRYPT & AUTHENTICATE"}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
