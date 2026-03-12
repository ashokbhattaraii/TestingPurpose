"use client";
import { useState } from "react";

import { useAuth } from "@/lib/auth-context";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Building2, ArrowRight, Loader2 } from "lucide-react";
import Link from "next/link";
import { users } from "@/lib/data";
import { useLogin } from "@/hooks/use-login";
import { FcGoogle } from "react-icons/fc";
import { useToast } from "@/hooks/use-toast";
import { GoogleLogin } from "@react-oauth/google";

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}





export function LoginPage() {
  const { loginWithGoogle, isGoogleLoginPending, loginWithGoogleSuccess, loginWithGoogleAsync } = useLogin();
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const demoUser = users[0];
  const { toast } = useToast();
  const otherUsers = users.slice(1);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-background via-primary/5 to-background px-4 relative">
      <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-2xl">
        {/* Header with back button */}
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-primary hover:text-primary/80 font-medium transition-colors mb-8"
          >
            <ArrowRight className="h-4 w-4 rotate-180" />
            Back to home
          </Link>
        </div>

        {/* Main Login Card */}
        <Card className="border-primary/20 shadow-2xl overflow-hidden min-h-[460px] flex flex-col">
          <CardHeader className="text-center bg-gradient-to-b from-card to-primary/5 rounded-t-lg pt-12 pb-8">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary/80 text-white shadow-xl">
              <Building2 className="h-8 w-8" />
            </div>
            <CardTitle className="text-4xl font-extrabold bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent tracking-tight">
              WorkOps
            </CardTitle>
            <CardDescription className="text-muted-foreground mt-3 text-base font-medium">
              Sign in to the Office Utility Management System
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col items-center justify-center p-8 bg-card/30">
            <div className="w-full max-w-sm flex flex-col gap-6">
              {/* Google Sign In Button - Centered at Top */}
              <div className="w-full flex justify-center relative min-h-[48px]">
                {isLoggingIn || isGoogleLoginPending ? (
                  <Button disabled variant="outline" className="w-full h-12 text-base font-medium border-2 shadow-sm rounded-xl">
                    <Loader2 className="mr-3 h-5 w-5 animate-spin text-primary" />
                    Signing in...
                  </Button>
                ) : (
                  <div className="w-full [&>div]:w-full flex justify-center items-center h-12 rounded-xl overflow-hidden hover:scale-[1.01] transition-transform">
                    <GoogleLogin
                      width="384"
                      size="large"
                      theme="outline"
                      text="signin_with"
                      shape="rectangular"
                      onSuccess={(credentialResponse) => {
                        setIsLoggingIn(true);
                        if (credentialResponse.credential) {
                          loginWithGoogleAsync(credentialResponse.credential)
                            .then((response: any) => {
                              // The API returns { token: "...", user: {...} } or { access_token: "..." }
                              const token = response.token || response.access_token;
                              if (token) {
                                // Set cookie that the axios interceptor looks for
                                document.cookie = `access_token=${token}; path=/; max-age=${7 * 24 * 60 * 60}`;
                                // Redirect to dashboard
                                window.location.href = "/dashboard";
                              } else {
                                setIsLoggingIn(false);
                                toast({
                                  title: "Login Failed",
                                  description: "Error in logging with google",
                                  variant: "destructive",
                                });
                              }
                            })
                            .catch((error: any) => {
                              setIsLoggingIn(false);
                              toast({
                                title: "Login Failed",
                                description: error.message || "Failed to login",
                                variant: "destructive",
                              });
                            });
                        } else {
                          setIsLoggingIn(false);
                        }
                      }}
                      onError={() => {
                        setIsLoggingIn(false);
                        toast({
                          title: "Login Failed",
                          description: "Failed to login with Google",
                          variant: "destructive",
                        });
                      }}
                      useOneTap
                    />
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="mt-6 text-center">
          <p className="text-xs text-muted-foreground">
            Don't have an account?{" "}
            <Link
              href="/"
              className="text-primary hover:text-primary/80 font-medium transition-colors"
            >
              Go to HomePage
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
