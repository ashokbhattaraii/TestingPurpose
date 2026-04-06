"use client";

import React from "react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Slack, Mail, Plus, Check, Clock } from "lucide-react";
import type { SocialAccount, SocialProvider } from "@/lib/types";
import { useState } from "react";
import { toast } from "sonner";

interface ConnectedAccountsProps {
  accounts: SocialAccount[] | undefined;
  onConnect?: (provider: SocialProvider) => void;
  onDisconnect?: (provider: SocialProvider) => void;
}

const socialProviders: Record<
  SocialProvider,
  {
    label: string;
    icon: React.ReactNode;
    color: string;
    textColor: string;
  }
> = {
  google: {
    label: "Google",
    icon: <Mail className="h-4 w-4" />,
    color: "bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800",
    textColor: "text-blue-700 dark:text-blue-300",
  },
  slack: {
    label: "Slack",
    icon: <Slack className="h-4 w-4" />,
    color: "bg-purple-50 dark:bg-purple-950/30 border-purple-200 dark:border-purple-800",
    textColor: "text-purple-700 dark:text-purple-300",
  },
};

export function ConnectedAccounts({
  accounts = [],
  onConnect,
  onDisconnect,
}: ConnectedAccountsProps) {
  const [disconnecting, setDisconnecting] = useState<SocialProvider | null>(
    null,
  );
  const [connecting, setConnecting] = useState<SocialProvider | null>(null);

  const handleConnect = (provider: SocialProvider) => {
    setConnecting(provider);
    setTimeout(() => {
      setConnecting(null);
      onConnect?.(provider);
      toast.success(
        `${socialProviders[provider].label} connected successfully`,
      );
    }, 1000);
  };

  const handleDisconnect = (provider: SocialProvider) => {
    setDisconnecting(provider);
    setTimeout(() => {
      setDisconnecting(null);
      onDisconnect?.(provider);
      toast.success(`${socialProviders[provider].label} disconnected`);
    }, 1000);
  };

  const connectedProviders = new Set(accounts.map((acc) => acc.provider));
  const availableProviders = (
    Object.keys(socialProviders) as SocialProvider[]
  ).filter((provider) => !connectedProviders.has(provider));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Connected Social Accounts</CardTitle>
        <CardDescription>
          Link your social accounts to streamline authentication and profile
          management
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        {/* Connected Accounts */}
        {accounts.length > 0 && (
          <div className="flex flex-col gap-3">
            <h3 className="text-sm font-semibold text-foreground">
              Connected Accounts
            </h3>
            <div className="flex flex-col gap-2">
              {accounts.map((account) => {
                const provider = socialProviders[account.provider];
                return (
                  <div
                    key={account.provider}
                    className={`flex items-center justify-between p-3 border rounded-lg ${provider.color}`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`p-2 rounded-md bg-card ${provider.textColor}`}
                      >
                        {provider.icon}
                      </div>
                      <div className="flex flex-col">
                        <span
                          className={`text-sm font-medium ${provider.textColor}`}
                        >
                          {provider.label}
                        </span>
                        <span
                          className={`text-xs ${provider.textColor} opacity-75`}
                        >
                          {account.email}
                        </span>
                        <span
                          className={`text-[10px] ${provider.textColor} opacity-60 mt-0.5`}
                        >
                          Connected{" "}
                          {new Date(account.connectedAt).toLocaleDateString(
                            "en-US",
                            {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            },
                          )}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={provider.textColor}>
                        <Check className="h-3 w-3 mr-1" />
                        Connected
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {accounts.length > 0 && availableProviders.length > 0 && <Separator />}

        {/* Available Providers */}
        {availableProviders.length > 0 && (
          <div className="flex flex-col gap-3">
            <h3 className="text-sm font-semibold text-foreground">
              Available Connections
            </h3>
            <div className="flex flex-col gap-2">
              {availableProviders.map((provider) => {
                const config = socialProviders[provider];
                return (
                  <div
                    key={provider}
                    className="flex items-center justify-between p-3 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-md bg-muted">
                        {config.icon}
                      </div>
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-foreground">
                            {config.label}
                          </span>
                          {provider === "slack" && (
                            <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 bg-purple-100 text-purple-700 hover:bg-purple-100 italic font-normal">
                              Coming Soon
                            </Badge>
                          )}
                        </div>
                        <span className="text-xs text-muted-foreground">
                          Connect your {config.label} account
                        </span>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handleConnect(provider)}
                      disabled={connecting === provider || provider === "slack"}
                      className="gap-1 min-w-[100px]"
                      variant={provider === "slack" ? "secondary" : "default"}
                    >
                      {connecting === provider ? (
                        <>
                          <span className="animate-pulse">Connecting...</span>
                        </>
                      ) : provider === "slack" ? (
                        <div className="flex items-center gap-1.5">
                          <Clock className="h-3 w-3" />
                          Coming Soon
                        </div>
                      ) : (
                        <>
                          <Plus className="h-3.5 w-3.5" />
                          Connect
                        </>
                      )}
                    </Button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Empty State */}
        {accounts.length === 0 && (
          <div className="flex flex-col items-center gap-3 py-8 text-center">
            <div className="p-3 rounded-full bg-muted">
              <Mail className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">
                No social accounts connected
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Connect your social accounts to manage your profile easily
              </p>
            </div>
          </div>
        )}

        <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
          <p className="text-[10px] font-semibold text-blue-900 dark:text-blue-200 mb-1">
            Why connect social accounts?
          </p>
          <ul className="text-[10px] text-blue-800 dark:text-blue-300 space-y-0.5">
            <li>• Faster and easier login</li>
            <li>• Automatically sync profile information</li>
            <li>• Enhanced security with multi-factor authentication</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
