"use client";
import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Loader2 } from "lucide-react";
import Link from "next/link";
//test
import { useLogin } from "@/hooks/use-login";
import { toast } from "sonner";
import { GoogleLogin } from "@react-oauth/google";
//login page
export function LoginPage() {
  const { isGoogleLoginPending, loginWithGoogleAsync } = useLogin();
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-background via-primary/5 to-background px-4 relative">
      <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-2xl">
        {/* Header with back button */}
        <div className="mb-8 text-center sm:text-left">
          <Link
            href="/"
            className="group inline-flex items-center gap-1.5 text-muted-foreground hover:text-primary font-medium transition-all mb-5 hover:underline decoration-primary/30 underline-offset-4"
          >
            <ChevronLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            Back to home
          </Link>
        </div>

        {/* Main Login Card */}
        <Card className="border-primary/20 shadow-2xl overflow-hidden min-h-[460px] flex flex-col">
          <CardHeader className="text-center bg-gradient-to-b from-card to-primary/5 rounded-t-lg pt-12 pb-8">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-white p-3 shadow-xl ring-1 ring-black/5 dark:bg-zinc-900 dark:ring-white/10">
              <img src="/rumsan-logo-blk.png" alt="Rumsan Logo" className="h-full w-full object-contain dark:invert" />
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
                              const token = response.token || response.access_token;
                              if (token) {
                                document.cookie = `access_token=${token}; path=/; max-age=${7 * 24 * 60 * 60}`;
                                window.location.href = "/dashboard";
                              } else {
                                setIsLoggingIn(false);
                                toast.error("Login Failed: Error in logging with google");
                              }
                            })
                            .catch((error: any) => {
                              setIsLoggingIn(false);
                              toast.error(`Login Failed: ${error.message || "Failed to login"}`);
                            });
                        } else {
                          setIsLoggingIn(false);
                        }
                      }}
                      onError={() => {
                        setIsLoggingIn(false);
                        toast.error("Login Failed: Failed to login with Google");
                      }}
                      useOneTap
                    />
                  </div>
                )}
              </div>

            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
