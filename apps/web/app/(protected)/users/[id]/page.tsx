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
    MapPin,
    Building2,
    Shield,
    User as UserIcon,
    CircleAlert,
    Clock
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
        className: "bg-muted text-muted-foreground border-border",
        icon: UserIcon,
    },
    ADMIN: {
        label: "Admin",
        className: "bg-primary/10 text-primary border-primary/20",
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

    const roleInfo = roleBadge[user.roles?.[0] || "EMPLOYEE"] || roleBadge.EMPLOYEE;
    const RoleIcon = roleInfo.icon;

    return (
        <div className="flex flex-col pb-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Header with Navigation */}
            <div className="flex items-center justify-between py-6 border-b border-border/50 mb-8">
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.back()}
                        className="h-9 w-9 rounded-full p-0 transition-colors"
                    >
                        <ChevronLeft className="h-5 w-5 text-muted-foreground" />
                    </Button>
                    <div>
                        <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">User Directory</h2>
                        <h1 className="text-2xl font-bold text-foreground tracking-tight">Personnel Profile</h1>
                    </div>
                </div>
                <div className="flex gap-3">
                </div>
            </div>

            {/* Profile Information Section */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                {/* Profile Identity Card */}
                <div className="lg:col-span-12">
                    <div className="bg-card border border-border/60 rounded-2xl overflow-hidden shadow-sm">
                        <div className="h-32 w-full bg-muted/50 border-b border-border/40 flex items-center justify-end px-8">
                            <Badge className={`${roleInfo.className} shadow-none border px-3 py-1.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-opacity-100`}>
                                <RoleIcon className="mr-1.5 h-3.5 w-3.5" />
                                {roleInfo.label}
                            </Badge>
                        </div>
                        <div className="px-8 pb-8 flex flex-col md:flex-row items-start md:items-end gap-6 -mt-12">
                            <Avatar className="h-32 w-32 border-4 border-card shadow-md ring-1 ring-border bg-card">
                                {user.photoURL ? (
                                    <img src={user.photoURL} alt={user.name} className="object-cover" />
                                ) : (
                                    <AvatarFallback className="bg-muted text-muted-foreground text-3xl font-bold">
                                        {getInitials(user.name)}
                                    </AvatarFallback>
                                )}
                            </Avatar>
                            <div className="flex-1 pb-2">
                                <div className="flex items-center gap-3 flex-wrap">
                                    <h1 className="text-3xl font-bold text-foreground tracking-tight">
                                        {user.name}
                                    </h1>
                                    {user.isActive && (
                                        <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-[10px] font-bold px-2 py-0.5">
                                            ACTIVE
                                        </Badge>
                                    )}
                                </div>
                                <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-2">
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium whitespace-nowrap">
                                        <Mail className="h-4 w-4 opacity-70" /> {user.email}
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium whitespace-nowrap">
                                        <Building2 className="h-4 w-4 opacity-70" /> {user.department || "Independent Professional"}
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium whitespace-nowrap">
                                        <MapPin className="h-4 w-4 opacity-70" /> {user.address || "Corporate Office"}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Left Content Area: Details & Bio */}
                <div className="lg:col-span-8 space-y-8">
                    {/* Professional Info Card */}
                    <Card className="rounded-2xl border-border/50 shadow-none bg-card">
                        <CardHeader className="pt-8 px-8">
                            <CardTitle className="text-base font-bold text-foreground flex items-center gap-2 tracking-tight uppercase tracking-widest text-xs opacity-60">
                                Professional Insights
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="px-8 pb-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-10 gap-x-12">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Department</label>
                                    <p className="text-base font-medium text-foreground border-b border-border/20 pb-2">
                                        {user.department || "Operations & Strategy"}
                                    </p>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Job Position</label>
                                    <p className="text-base font-medium text-foreground border-b border-border/20 pb-2">
                                        {user.position || "Senior Professional Staff"}
                                    </p>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Access Level</label>
                                    <p className="text-base font-medium text-foreground border-b border-border/20 pb-2 flex items-center gap-2">
                                        <Shield className="h-4 w-4 text-muted-foreground" />
                                        {roleInfo.label} Managed Account
                                    </p>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Joined Date</label>
                                    <div className="flex items-center justify-between border-b border-border/20 pb-2">
                                        <p className="text-base font-medium text-foreground">
                                            {user.createdAt ? format(parseISO(user.createdAt), "MMM d, yyyy") : "N/A"}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Content Area: Meta Info */}
                <div className="lg:col-span-4 space-y-8">
                    {/* Activity Tracking */}
                    <Card className="rounded-2xl border-border/50 shadow-none bg-card overflow-hidden">
                        <div className="h-1 w-full bg-primary" />
                        <CardHeader className="pt-6 px-6">
                            <CardTitle className="text-sm font-bold text-foreground uppercase tracking-wider opacity-60">System Metadata</CardTitle>
                        </CardHeader>
                        <CardContent className="px-6 pb-6 space-y-5">
                            <div className="flex items-start gap-4">
                                <div className="mt-1 h-8 w-8 bg-muted rounded-lg flex items-center justify-center text-muted-foreground border border-border">
                                    <Clock className="h-4 w-4" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Last Access</p>
                                    <p className="text-sm font-semibold text-foreground">
                                        {user.lastLoginAt ? format(parseISO(user.lastLoginAt), "MMM d, yyyy HH:mm") : "None recorded"}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <div className="mt-1 h-8 w-8 bg-muted rounded-lg flex items-center justify-center text-muted-foreground border border-border">
                                    <Shield className="h-4 w-4" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Unique Identifier</p>
                                    <p className="text-sm font-mono text-muted-foreground bg-muted px-2 py-0.5 rounded mt-1 overflow-hidden truncate max-w-[180px]">
                                        {user.uid || user.id}
                                    </p>
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
