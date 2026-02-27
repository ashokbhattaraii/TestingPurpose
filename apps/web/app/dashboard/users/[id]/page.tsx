"use client";

import { useParams, useRouter } from "next/navigation";
import { useGetUserById } from "@/hooks/users/useGetUser";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
    ChevronLeft,
    Mail,
    Phone,
    MapPin,
    Building2,
    Calendar,
    Shield,
    User as UserIcon,
    CircleCheck,
    CircleAlert
} from "lucide-react";
import { format, parseISO, isValid } from "date-fns";

function getInitials(name: string) {
    return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
}

const roleBadge: Record<string, { label: string; className: string; icon: any }> = {
    EMPLOYEE: {
        label: "Employee",
        className: "bg-slate-100 text-slate-700 border-slate-200",
        icon: UserIcon,
    },
    ADMIN: {
        label: "Admin",
        className: "bg-blue-100 text-blue-700 border-blue-200",
        icon: Shield,
    },
    SUPER_ADMIN: {
        label: "Super Admin",
        className: "bg-indigo-100 text-indigo-700 border-indigo-200",
        icon: Shield,
    },
};

export default function UserDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const { data: user, isLoading } = useGetUserById(id as string);

    if (isLoading) {
        return (
            <div className="flex flex-col gap-6 animate-pulse">
                <div className="h-40 w-full bg-muted rounded-3xl" />
                <div className="flex gap-6 -mt-16 px-8 relative">
                    <div className="h-32 w-32 rounded-full bg-muted border-4 border-background" />
                    <div className="mt-16 space-y-2">
                        <div className="h-8 w-48 bg-muted rounded" />
                        <div className="h-4 w-32 bg-muted rounded" />
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-4">
                    <div className="md:col-span-2 space-y-6">
                        <div className="h-64 bg-muted rounded-2xl" />
                    </div>
                    <div className="space-y-6">
                        <div className="h-32 bg-muted rounded-2xl" />
                        <div className="h-48 bg-muted rounded-2xl" />
                    </div>
                </div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center">
                <CircleAlert className="h-12 w-12 text-muted-foreground mb-4" />
                <h2 className="text-2xl font-bold">User Not Found</h2>
                <p className="text-muted-foreground mt-2">The user you are looking for does not exist or has been removed.</p>
                <Button variant="outline" className="mt-6" onClick={() => router.back()}>
                    <ChevronLeft className="mr-2 h-4 w-4" /> Go Back
                </Button>
            </div>
        );
    }

    const roleInfo = roleBadge[user.role] || roleBadge.EMPLOYEE;
    const RoleIcon = roleInfo.icon;

    return (
        <div className="flex flex-col pb-10">
            {/* Header with Back Button */}
            <div className="mb-6">
                <Button variant="ghost" size="sm" onClick={() => router.back()} className="rounded-full hover:bg-muted font-medium">
                    <ChevronLeft className="mr-1 h-4 w-4" /> Back to Users
                </Button>
            </div>

            {/* Profile Cover & Main Info */}
            <div className="relative mb-20">
                <div className="h-48 w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-3xl opacity-90 shadow-lg shadow-indigo-100" />

                <div className="absolute -bottom-16 left-8 flex flex-col md:flex-row md:items-end gap-6">
                    <Avatar className="h-36 w-36 border-4 border-background shadow-xl ring-2 ring-primary/5">
                        {user.photoURL ? (
                            <img src={user.photoURL} alt={user.name} />
                        ) : (
                            <AvatarFallback className="bg-indigo-50 text-indigo-600 text-3xl font-bold">
                                {getInitials(user.name)}
                            </AvatarFallback>
                        )}
                    </Avatar>

                    <div className="flex flex-col pb-2">
                        <div className="flex items-center gap-3">
                            <h1 className="text-3xl font-extrabold tracking-tight text-foreground truncate">
                                {user.name}
                            </h1>
                            <Badge className={`${roleInfo.className} shadow-sm border px-3 py-1 rounded-full text-[11px] font-bold`}>
                                <RoleIcon className="mr-1.5 h-3.5 w-3.5" />
                                {roleInfo.label}
                            </Badge>
                            {user.isActive && (
                                <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                                    <CircleCheck className="h-3 w-3" /> ACTIVE
                                </div>
                            )}
                        </div>
                        <p className="text-muted-foreground font-medium flex items-center gap-1.5 mt-1">
                            <Mail className="h-3.5 w-3.5" /> {user.email}
                        </p>
                    </div>
                </div>
            </div>

            {/* Secondary Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 px-2">
                {/* Left Column: Essential Info */}
                <div className="lg:col-span-2 space-y-8">
                    <Card className="rounded-2xl shadow-sm border-border/60">
                        <CardHeader className="border-b border-border/40 pb-4">
                            <CardTitle className="text-lg font-bold flex items-center gap-2 tracking-tight">
                                <Building2 className="h-5 w-5 text-primary/70" />
                                Professional Identity
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-4">
                                <div className="group">
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/80 mb-1.5 flex items-center gap-1.5">
                                        <Building2 className="h-3 w-3" /> Department
                                    </p>
                                    <p className="text-sm font-semibold bg-muted/30 p-2.5 rounded-xl border border-border/50 transition-colors group-hover:border-primary/20">
                                        {user.department || "Organization General"}
                                    </p>
                                </div>

                                <div className="group">
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/80 mb-1.5 flex items-center gap-1.5">
                                        <Shield className="h-3 w-3" /> Current Position
                                    </p>
                                    <p className="text-sm font-semibold bg-muted/30 p-2.5 rounded-xl border border-border/50 transition-colors group-hover:border-primary/20">
                                        {user.position || "Professional Member"}
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="group">
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/80 mb-1.5 flex items-center gap-1.5">
                                        <Calendar className="h-3 w-3" /> Onboarding Date
                                    </p>
                                    <div className="p-2.5 rounded-xl bg-indigo-50/30 border border-indigo-100/50">
                                        <p className="text-sm font-bold text-indigo-700">
                                            {user.createdAt ? format(parseISO(user.createdAt), "MMMM d, yyyy") : "Date unset"}
                                        </p>
                                        <p className="text-[10px] text-indigo-600/70 mt-0.5">Member for over {formatDistanceToNow(user.createdAt)}</p>
                                    </div>
                                </div>

                                <div className="group">
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/80 mb-1.5 flex items-center gap-1.5">
                                        <CircleCheck className="h-3 w-3" /> Last Active
                                    </p>
                                    <p className="text-sm font-medium p-2.5 rounded-xl bg-card border border-border/40 shadow-sm">
                                        {user.lastLoginAt ? format(parseISO(user.lastLoginAt), "MMM d, yyyy 'at' h:mm a") : "Never logged in"}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="rounded-2xl shadow-sm border-border/60">
                        <CardHeader className="border-b border-border/40 pb-4">
                            <CardTitle className="text-lg font-bold flex items-center gap-2 tracking-tight">
                                <UserIcon className="h-5 w-5 text-primary/70" />
                                About User
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <div className="bg-slate-50/50 p-5 rounded-2xl border border-slate-100 text-sm leading-relaxed text-slate-700 min-h-[120px]">
                                {user.bio || "This professional hasn't added a biography yet. A brief introduction helps colleagues understand their role better."}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column: Contact & Metadata */}
                <div className="space-y-8">
                    <Card className="rounded-2xl shadow-sm border-border/60 bg-gradient-to-br from-white to-slate-50">
                        <CardHeader>
                            <CardTitle className="text-base font-bold tracking-tight">Contact Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex items-center gap-3">
                                <div className="h-9 w-9 bg-primary/5 rounded-full flex items-center justify-center text-primary shadow-sm border border-primary/10">
                                    <Mail className="h-4 w-4" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-bold text-muted-foreground/70 uppercase">Work Email</span>
                                    <span className="text-xs font-semibold">{user.email}</span>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="h-9 w-9 bg-primary/5 rounded-full flex items-center justify-center text-primary shadow-sm border border-primary/10">
                                    <Phone className="h-4 w-4" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-bold text-muted-foreground/70 uppercase">Mobile</span>
                                    <span className="text-xs font-semibold">{user.phone || "Not provided"}</span>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="h-9 w-9 bg-primary/5 rounded-full flex items-center justify-center text-primary shadow-sm border border-primary/10">
                                    <MapPin className="h-4 w-4" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-bold text-muted-foreground/70 uppercase">Primary Location</span>
                                    <span className="text-xs font-semibold">{user.address || "Organization Headquarters"}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="rounded-2xl shadow-sm border-border/60 border-l-4 border-l-indigo-500 overflow-hidden">
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-bold text-sm">System Access</h3>
                                <Shield className="h-4 w-4 text-indigo-500" />
                            </div>
                            <p className="text-xs text-muted-foreground leading-relaxed mb-4">
                                Current access levels allow this professional to {user.role === 'SUPER_ADMIN' ? 'manage the entire system configuration, users, and organization data.' : user.role === 'ADMIN' ? 'facilitate member requests, manage announcements and review analytics.' : 'participate in organization activities and submit requests.'}
                            </p>
                            <div className="flex flex-col gap-1.5">
                                <div className="flex justify-between text-[10px]">
                                    <span className="font-bold text-muted-foreground">ID REFERENCE</span>
                                    <span className="font-mono text-indigo-600 bg-indigo-50 px-1.5 rounded">{user.uid?.slice(0, 8)}...</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}

function formatDistanceToNow(dateString: any) {
    if (!dateString) return "...";
    try {
        const date = parseISO(dateString);
        if (!isValid(date)) return "...";

        const diffDays = Math.floor((new Date().getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
        if (diffDays < 30) return `${diffDays} days`;
        if (diffDays < 365) return `${Math.floor(diffDays / 30)} months`;
        return `${Math.floor(diffDays / 365)} years`;
    } catch (e) {
        return "...";
    }
}
