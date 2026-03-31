"use client";

import { useAuth } from "@/lib/auth-context";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useLunchContext } from "@/lib/lunch/lunchContext";
import { Notification } from "@/lib/types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  LayoutDashboard,
  ClipboardList,
  UserCheck,
  Megaphone,
  BarChart3,
  Users,
  User,
  LogOut,
  Menu,
  ChevronRight,
  UtensilsCrossed,
  Bell,
  ExternalLink,
  Settings,
  PanelLeft,
  ArrowLeft,
  Moon,
  Sun,
} from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";
import { useNotifications, useMarkNotificationRead, useMarkAllNotificationsRead } from "@/hooks/notification/useNotifications";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface NavItem {
  label: string;
  href: string;
  icon: ReactNode;
  roles: string[];
  badgeKey?: string;
  section?: string;
}

const navItems: NavItem[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: <LayoutDashboard className="h-4 w-4" />,
    roles: ["EMPLOYEE", "ADMIN"],
    section: "General",
  },
  {
    label: "Service Requests",
    href: "/requests",
    icon: <ClipboardList className="h-4 w-4" />,
    roles: ["EMPLOYEE", "ADMIN"],
    section: "General",
  },
  {
    label: "My Requests",
    href: "/my-requests",
    icon: <ClipboardList className="h-4 w-4" />,
    roles: ["EMPLOYEE", "ADMIN"],
    section: "General",
  },
  {
    label: "Assigned to Me",
    href: "/assigned-requests",
    icon: <UserCheck className="h-4 w-4" />,
    roles: ["ADMIN"],
    section: "General",
  },
  {
    label: "Lunch Token",
    href: "/lunch",
    icon: <UtensilsCrossed className="h-4 w-4" />,
    roles: ["EMPLOYEE", "ADMIN"],
    badgeKey: "lunchToken",
    section: "General",
  },
  {
    label: "Announcements",
    href: "/announcements",
    icon: <Megaphone className="h-4 w-4" />,
    roles: ["EMPLOYEE", "ADMIN"],
    section: "General",
  },
  {
    label: "Analytics",
    href: "/analytics",
    icon: <BarChart3 className="h-4 w-4" />,
    roles: ["ADMIN"],
    section: "Administration",
  },
  {
    label: "Users",
    href: "/users",
    icon: <Users className="h-4 w-4" />,
    roles: ["ADMIN"],
    section: "Administration",
  },
];

function getInitials(name: string) {
  const cleanName = name.replace(/\s*undefined/gi, "").trim();
  return cleanName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function getRoleLabel(role: string) {
  const r = role.toUpperCase();
  if (r === "ADMIN" || r.includes("ADMIN")) return "Admin";
  return "Employee";
}

function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" className="text-foreground">
        <Sun className="h-5 w-5" />
        <span className="sr-only">Toggle theme</span>
      </Button>
    );
  }

  return (
    <TooltipProvider delayDuration={0}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="text-foreground"
          >
            {theme === "dark" ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
            <span className="sr-only">Toggle theme</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          {theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

function NotificationPopover({ userId }: { userId: string }) {
  const router = useRouter();
  const { data: notifications, isLoading } = useNotifications(userId);
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();
  const [open, setOpen] = useState(false);
  const unreadCount = notifications?.filter((n: Notification) => !n.isRead).length || 0;

  // Click notification to mark as read and navigate to its detail link
  const handleNotificationClick = (notif: Notification) => {
    if (!notif.isRead) {
      markRead.mutate(notif.id);
    }
    if (notif.link) {
      setOpen(false);
      router.push(notif.link);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative text-foreground"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
          <span className="sr-only">Notifications</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[calc(100vw-32px)] sm:w-80 p-0" align="end">
        <div className="flex h-12 items-center justify-between border-b border-border px-4">
          <h2 className="text-sm font-semibold text-foreground">
            Notifications
          </h2>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-auto p-0 text-[10px] font-medium text-primary hover:bg-transparent"
              onClick={() => markAllRead.mutate()}
            >
              Mark all as read
            </Button>
          )}
        </div>
        {isLoading ? (
          <div className="flex flex-col gap-2 p-3">
            <Skeleton className="h-12" />
            <Skeleton className="h-12" />
          </div>
        ) : !notifications || notifications.filter((n: Notification) => !n.isRead).length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-8 px-4 text-center">
            <Bell className="h-5 w-5 text-muted-foreground" />
            <p className="text-xs text-muted-foreground">
              No new notifications
            </p>
          </div>
        ) : (
          <ScrollArea className="max-h-[480px]">
            <div className="flex flex-col">
              {notifications
                .filter((n: Notification) => !n.isRead)
                .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                .slice(0, 5)
                .map((notif: Notification) => (
                  <div
                    key={notif.id}
                    onClick={() => handleNotificationClick(notif)}
                    className={cn(
                      "border-b border-border p-3 text-xs last:border-b-0 transition-colors",
                      notif.link ? "cursor-pointer hover:bg-muted/50" : "",
                      notif.isRead ? "bg-background" : "bg-primary/5",
                    )}
                  >
                    <div className="flex items-start gap-2">
                      <div
                        className={`mt-0.5 h-2 w-2 flex-shrink-0 rounded-full ${notif.isRead ? "bg-muted" : "bg-primary"
                          }`}
                      />
                      <div className="flex-1 min-w-0">
                        <p
                          className={`${notif.isRead
                            ? "text-muted-foreground"
                            : "font-medium text-foreground"
                            }`}
                        >
                          {notif.title}
                        </p>
                        <p className="text-muted-foreground line-clamp-2 mt-0.5">
                          {notif.message}
                        </p>
                        <span className="text-[10px] text-muted-foreground mt-1.5 block">
                          {format(new Date(notif.createdAt), "MMM d, h:mm a")}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </ScrollArea>
        )}
        <div className="flex border-t border-border">
          <Link
            href="/notifications"
            onClick={() => setOpen(false)}
            className="flex-1 flex items-center justify-center gap-1 py-2 px-4 text-xs font-medium text-primary hover:bg-muted transition-colors"
          >
            View all notifications
            <ExternalLink className="h-3 w-3" />
          </Link>
        </div>
      </PopoverContent>
    </Popover>
  );
}

function SidebarNav({
  onLinkClick,
  collapsed,
  badges,
  onLogout,
}: {
  onLinkClick?: () => void;
  collapsed?: boolean;
  badges?: Record<string, number>;
  onLogout?: () => void;
}) {
  const { user } = useAuth();
  const pathname = usePathname();
  const filteredItems = navItems.filter((item) =>
    item.roles.some((role) => user?.roles?.includes(role)),
  );

  // Group items by section
  const sections: { label: string; items: typeof filteredItems }[] = [];
  const sectionMap = new Map<string, typeof filteredItems>();
  for (const item of filteredItems) {
    const sec = item.section || "General";
    if (!sectionMap.has(sec)) {
      sectionMap.set(sec, []);
      sections.push({ label: sec, items: sectionMap.get(sec)! });
    }
    sectionMap.get(sec)!.push(item);
  }

  const isSettingsActive = pathname === "/settings";

  if (collapsed) {
    return (
      <TooltipProvider delayDuration={0}>
        <div className="flex flex-1 flex-col">
          <nav className="py-3 px-2">
            <div className="flex flex-col gap-1.5 items-center">
              {filteredItems.map((item) => {
                const isActive = pathname === item.href;
                const badgeCount = item.badgeKey
                  ? (badges?.[item.badgeKey] ?? 0)
                  : 0;
                return (
                  <Tooltip key={item.href}>
                    <TooltipTrigger asChild>
                      <Link
                        href={item.href}
                        onClick={onLinkClick}
                        className={cn(
                          "relative flex h-10 w-10 items-center justify-center rounded-lg transition-all duration-200 flex-shrink-0",
                          isActive
                            ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-md"
                            : "text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                        )}
                      >
                        {item.icon}
                        {badgeCount > 0 && (
                          <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-orange-500 text-[9px] font-bold text-white">
                            {badgeCount > 9 ? "9+" : badgeCount}
                          </span>
                        )}
                      </Link>
                    </TooltipTrigger>
                    <TooltipContent side="right" className="text-xs">
                      {item.label}
                      {badgeCount > 0 && ` (${badgeCount})`}
                    </TooltipContent>
                  </Tooltip>
                );
              })}
            </div>
          </nav>

          <div className="flex-1" />

          {/* Settings pinned to bottom */}
          <div className="px-2 pb-3">
            <Tooltip>
              <TooltipTrigger asChild>
                <Link
                  href="/settings"
                  onClick={onLinkClick}
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-lg transition-all duration-200 mx-auto",
                    isSettingsActive
                      ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-md"
                      : "text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                  )}
                >
                  <Settings className="h-4 w-4" />
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right" className="text-xs">
                Settings
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onLogout}
                  className="flex h-10 w-10 items-center justify-center rounded-lg transition-all duration-200 mx-auto text-destructive hover:bg-destructive/10 hover:text-destructive mt-1"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" className="text-xs">
                Sign out
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
      </TooltipProvider>
    );
  }

  return (
    <div className="flex flex-1 flex-col overflow-y-auto">
      <nav className="py-4 px-3">
        <div className="flex flex-col gap-6">
          {sections.map((section) => (
            <div key={section.label} className="flex flex-col gap-1">
              <span className="mb-1 px-3 text-[10px] font-semibold uppercase tracking-wider text-sidebar-foreground/40">
                {section.label}
              </span>
              {section.items.map((item) => {
                const isActive = pathname === item.href;
                const badgeCount = item.badgeKey
                  ? (badges?.[item.badgeKey] ?? 0)
                  : 0;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onLinkClick}
                    className={cn(
                      "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                      isActive
                        ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-md"
                        : "text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                    )}
                  >
                    <span
                      className={cn(
                        "flex h-5 w-5 items-center justify-center flex-shrink-0 transition-colors",
                        isActive
                          ? "text-sidebar-primary-foreground"
                          : "text-sidebar-foreground/50 group-hover:text-sidebar-accent-foreground",
                      )}
                    >
                      {item.icon}
                    </span>
                    <span className="flex-1 truncate">{item.label}</span>
                    {badgeCount > 0 && (
                      <span
                        className={cn(
                          "flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-[10px] font-bold",
                          isActive
                            ? "bg-white/20 text-sidebar-primary-foreground"
                            : "bg-orange-500 text-white",
                        )}
                      >
                        {badgeCount > 99 ? "99+" : badgeCount}
                      </span>
                    )}
                    {isActive && badgeCount === 0 && (
                      <ChevronRight className="ml-auto h-4 w-4 opacity-60" />
                    )}
                  </Link>
                );
              })}
            </div>
          ))}
        </div>
      </nav>

      <div className="flex-1" />

      {/* Settings & Logout pinned to bottom */}
      <div className="px-3 pb-3">
        <div className="flex flex-col gap-1 rounded-xl bg-sidebar-accent/40 p-1.5 border border-sidebar-border/50">
          <Link
            href="/settings"
            onClick={onLinkClick}
            className={cn(
              "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200",
              isSettingsActive
                ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-md"
                : "text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
            )}
          >
            <span
              className={cn(
                "flex h-5 w-5 items-center justify-center flex-shrink-0 transition-colors",
                isSettingsActive
                  ? "text-sidebar-primary-foreground"
                  : "text-sidebar-foreground/50 group-hover:text-sidebar-accent-foreground",
              )}
            >
              <Settings className="h-4 w-4" />
            </span>
            <span className="flex-1 truncate">Settings</span>
            {isSettingsActive && (
              <ChevronRight className="ml-auto h-4 w-4 opacity-60" />
            )}
          </Link>

          <Button
            variant="ghost"
            onClick={onLogout}
            className="group flex w-full h-auto items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 text-destructive hover:bg-destructive/10 hover:text-destructive"
          >
            <span className="flex h-5 w-5 items-center justify-center flex-shrink-0">
              <LogOut className="h-4 w-4" />
            </span>
            <span className="flex-1 truncate text-left">Logout</span>
          </Button>
        </div>
      </div>
    </div>
  );
}

function MobileSidebarContent({
  onLinkClick,
  badges,
  onLogout,
}: {
  onLinkClick?: () => void;
  badges?: Record<string, number>;
  onLogout?: () => void;
}) {
  const { user } = useAuth();
  return (
    <div className="flex h-full flex-col">
      <div className="flex h-14 items-center gap-3 border-b border-sidebar-border px-4">
        <Link href="/dashboard" className="flex h-10 w-10 items-center justify-center rounded-lg bg-white p-1 transition-opacity hover:opacity-90">
          <img src="/rumsan-logo-blk.png" alt="Rumsan Logo" className="h-full w-full object-contain" />
        </Link>
        <div className="flex flex-col">
          <span className="text-sm font-bold text-sidebar-foreground tracking-tight">
            WorkOps
          </span>
          <span className="text-[10px] text-sidebar-foreground/40">
            Workplace Portal
          </span>
        </div>
      </div>
      <SidebarNav onLinkClick={onLinkClick} badges={badges} onLogout={onLogout} />
    </div>
  );
}

export function DashboardShell({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const handleLogOut = () => {
    try {
      logout();
    } catch (error) {
      console.error("Logout error:", error);
    }
  };
  const router = useRouter();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { totalTokens } = useLunchContext();
  // Hardcoded lunch token badge count
  // console.log("DashboardShell - totalTokens from context:", totalTokens);
  const badges: Record<string, number> = {
    lunchToken: totalTokens,
  };

  useEffect(() => {
    if (!user) {
      router.push("/");
    }
  }, [router]);

  if (!user) {
    return null;
  }

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          "hidden border-r border-sidebar-border bg-sidebar transition-all duration-300 ease-in-out lg:flex lg:flex-col flex-shrink-0",
          sidebarCollapsed ? "w-[68px]" : "w-60",
        )}
      >
        <div className="flex h-full flex-col">
          {/* Sidebar Header */}
          <div
            className={cn(
              "flex h-14 items-center border-b border-sidebar-border",
              sidebarCollapsed ? "justify-center px-2" : "justify-between px-4",
            )}
          >
            {!sidebarCollapsed && (
              <div className="flex items-center gap-3">
                <Link href="/dashboard" className="flex h-10 w-10 items-center justify-center rounded-lg bg-white p-1 transition-opacity hover:opacity-90">
                  <img src="/rumsan-logo-blk.png" alt="Rumsan Logo" className="h-full w-full object-contain" />
                </Link>
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-sidebar-foreground tracking-tight">
                    WorkOps
                  </span>
                  <span className="text-[10px] text-sidebar-foreground/40">
                    Workplace Portal
                  </span>
                </div>
              </div>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className={cn(
                "h-8 w-8 text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-foreground flex-shrink-0 transition-colors",
              )}
              title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              <PanelLeft className="h-4 w-4" />
            </Button>
          </div>

          {/* Sidebar Nav */}
          <SidebarNav collapsed={sidebarCollapsed} badges={badges} onLogout={handleLogOut} />

        </div>
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top bar */}
        <header className="flex h-14 items-center justify-between border-b border-border bg-card px-4 lg:px-6">
          <div className="flex items-center gap-3">
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="lg:hidden text-foreground"
                >
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent
                side="left"
                className="w-56 bg-sidebar p-0 text-sidebar-foreground"
              >
                <MobileSidebarContent
                  onLinkClick={() => setMobileOpen(false)}
                  badges={badges}
                  onLogout={handleLogOut}
                />
              </SheetContent>
            </Sheet>
            {pathname !== "/dashboard" && (
              <TooltipProvider delayDuration={0}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => router.push("/dashboard")}
                      className="h-8 w-8 text-muted-foreground hover:text-foreground"
                    >
                      <ArrowLeft className="h-4 w-4" />
                      <span className="sr-only">Back to Dashboard</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">
                    Back to Dashboard
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
            <h1 className="text-sm font-medium text-foreground lg:hidden">
              WorkOps
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            {user && <NotificationPopover userId={user.id} />}
            <Link
              href="/profile"
              className="group flex items-center gap-3 px-3 py-1.5 rounded-xl transition-all duration-300 bg-muted/20 hover:bg-primary/10 border border-transparent hover:border-primary/20 shadow-sm"
            >
              <div className="hidden md:flex items-center gap-2.5">
                <div className="flex flex-col items-end leading-none gap-1">
                  <span className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">
                    {user.name.replace(/\s*undefined/gi, "").trim()}
                  </span>
                  <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest px-1.5 py-0.5 rounded-md bg-muted group-hover:bg-primary/20 group-hover:text-primary transition-all">
                    {getRoleLabel(user.roles?.[0] || "")}
                  </span>
                </div>
              </div>
              <Avatar className="h-8 w-8 ring-2 ring-transparent group-hover:ring-primary/30 transition-all shadow-md">
                {user.thumbnail_url ? (
                  <img src={user.thumbnail_url} alt={user.name} className="h-full w-full object-cover rounded-full" />
                ) : (
                  <AvatarFallback className="bg-primary text-primary-foreground text-xs font-bold">
                    {getInitials(user.name)}
                  </AvatarFallback>
                )}
              </Avatar>
            </Link>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
