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
        <div className="flex flex-col pb-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Header with Navigation */}
            <div className="flex items-center justify-between py-6 border-b border-border/50 mb-8">
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.back()}
                        className="h-9 w-9 rounded-full p-0 hover:bg-slate-100 transition-colors"
                    >
                        <ChevronLeft className="h-5 w-5 text-slate-600" />
                    </Button>
                    <div>
                        <h2 className="text-sm font-medium text-slate-500 uppercase tracking-wider">User Directory</h2>
                        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Personnel Profile</h1>
                    </div>
                </div>
                <div className="flex gap-3">

                    <Button size="sm" className="h-9 px-4 text-xs font-semibold rounded-lg bg-slate-900 hover:bg-slate-800 text-white shadow-sm transition-all active:scale-95">
                        Send Message
                    </Button>
                </div>
            </div>

            {/* Profile Information Section */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                {/* Profile Identity Card */}
                <div className="lg:col-span-12">
                    <div className="bg-white border border-border/60 rounded-2xl overflow-hidden shadow-sm">
                        <div className="h-32 w-full bg-slate-50 border-b border-border/40 flex items-center justify-end px-8">
                            <Badge className={`${roleInfo.className} shadow-none border px-3 py-1.5 rounded-full text-[10px] font-bold tracking-wider uppercase`}>
                                <RoleIcon className="mr-1.5 h-3.5 w-3.5" />
                                {roleInfo.label}
                            </Badge>
                        </div>
                        <div className="px-8 pb-8 flex flex-col md:flex-row items-start md:items-end gap-6 -mt-12">
                            <Avatar className="h-32 w-32 border-4 border-white shadow-md ring-1 ring-slate-100 bg-white">
                                {user.photoURL ? (
                                    <img src={user.photoURL} alt={user.name} className="object-cover" />
                                ) : (
                                    <AvatarFallback className="bg-slate-100 text-slate-600 text-3xl font-bold">
                                        {getInitials(user.name)}
                                    </AvatarFallback>
                                )}
                            </Avatar>
                            <div className="flex-1 pb-2">
                                <div className="flex items-center gap-3 flex-wrap">
                                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
                                        {user.name}
                                    </h1>
                                    {user.isActive && (
                                        <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-100 text-[10px] font-bold px-2 py-0.5">
                                            ACTIVE
                                        </Badge>
                                    )}
                                </div>
                                <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-2">
                                    <div className="flex items-center gap-2 text-sm text-slate-500 font-medium whitespace-nowrap">
                                        <Mail className="h-4 w-4 opacity-70" /> {user.email}
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-slate-500 font-medium whitespace-nowrap">
                                        <Building2 className="h-4 w-4 opacity-70" /> {user.department || "Independent Professional"}
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-slate-500 font-medium whitespace-nowrap">
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
                    <Card className="rounded-2xl border-border/50 shadow-none bg-white">
                        <CardHeader className="pt-8 px-8">
                            <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2 tracking-tight uppercase tracking-widest text-xs opacity-60">
                                Professional Insights
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="px-8 pb-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-10 gap-x-12">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Department</label>
                                    <p className="text-base font-medium text-slate-800 border-b border-slate-50 pb-2">
                                        {user.department || "Operations & Strategy"}
                                    </p>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Job Position</label>
                                    <p className="text-base font-medium text-slate-800 border-b border-slate-50 pb-2">
                                        {user.position || "Senior Professional Staff"}
                                    </p>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Access Level</label>
                                    <p className="text-base font-medium text-slate-800 border-b border-slate-50 pb-2 flex items-center gap-2">
                                        <Shield className="h-4 w-4 text-slate-400" />
                                        {roleInfo.label} Managed Account
                                    </p>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Joined Date</label>
                                    <div className="flex items-center justify-between border-b border-slate-50 pb-2">
                                        <p className="text-base font-medium text-slate-800">
                                            {user.createdAt ? format(parseISO(user.createdAt), "MMM d, yyyy") : "N/A"}
                                        </p>
                                        <span className="text-[11px] font-semibold text-slate-400 bg-slate-50 px-2 py-0.5 rounded-full uppercase">
                                            {formatDistanceToNow(user.createdAt)} Tenure
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Biography Card */}
                    <Card className="rounded-2xl border-border/50 shadow-none bg-white">
                        <CardHeader className="pt-8 px-8">
                            <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2 tracking-tight uppercase tracking-widest text-xs opacity-60">
                                User Statement
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="px-8 pb-10">
                            <div className="text-base leading-relaxed text-slate-600 max-w-none">
                                {user.bio || "No professional biography has been provided by this user. This section typically outlines the individual's core competencies, project involvements, and professional background within the organization."}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Content Area: Meta Info */}
                <div className="lg:col-span-4 space-y-8">
                    {/* Activity Tracking */}
                    <Card className="rounded-2xl border-border/50 shadow-none bg-white overflow-hidden">
                        <div className="h-1 w-full bg-slate-900" />
                        <CardHeader className="pt-6 px-6">
                            <CardTitle className="text-sm font-bold text-slate-900 uppercase tracking-wider opacity-60">System Metadata</CardTitle>
                        </CardHeader>
                        <CardContent className="px-6 pb-6 space-y-5">
                            <div className="flex items-start gap-4">
                                <div className="mt-1 h-8 w-8 bg-slate-50 rounded-lg flex items-center justify-center text-slate-400 border border-slate-100">
                                    <Clock className="h-4 w-4" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Last Access</p>
                                    <p className="text-sm font-semibold text-slate-700">
                                        {user.lastLoginAt ? format(parseISO(user.lastLoginAt), "MMM d, yyyy HH:mm") : "None recorded"}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <div className="mt-1 h-8 w-8 bg-slate-50 rounded-lg flex items-center justify-center text-slate-400 border border-slate-100">
                                    <Shield className="h-4 w-4" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Unique Identifier</p>
                                    <p className="text-sm font-mono text-slate-500 bg-slate-50 px-2 py-0.5 rounded mt-1 overflow-hidden truncate max-w-[180px]">
                                        {user.uid || user.id}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Quick Tools / Communication */}
                    <div className="bg-slate-900 rounded-2xl p-6 text-white shadow-lg shadow-slate-200">
                        <h3 className="text-lg font-bold mb-2 tracking-tight">Organization Contact</h3>
                        <p className="text-xs text-slate-400 mb-6 leading-relaxed">
                            Official communication channels should be used for all professional outreach regarding organizational matters.
                        </p>
                        <div className="space-y-4">
                            <div className="group flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors cursor-pointer">
                                <Mail className="h-4 w-4 text-slate-300" />
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Email</span>
                                    <span className="text-xs font-medium text-slate-200 truncate max-w-[180px]">{user.email}</span>
                                </div>
                            </div>
                            <div className="group flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors cursor-pointer">
                                <Phone className="h-4 w-4 text-slate-300" />
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Extension</span>
                                    <span className="text-xs font-medium text-slate-200">{user.phone || "+977 (Official Line)"}</span>
                                </div>
                            </div>
                        </div>
                        <Button className="w-full mt-6 bg-white text-slate-900 hover:bg-slate-100 font-bold py-5 rounded-xl transition-all">
                            Generate Report
                        </Button>
                    </div>
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
