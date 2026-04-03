"use client";

import { useAuth } from "@/lib/auth-context";
import { useLunchTokens } from "@/queries/lunch/useLunchTokens";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useMarkLunchAttendance,
  useMyLunchAttendance,
  useNotifyLunchReady,
} from "@/queries/lunch/useLunchAttendance";
import { useLunchContext } from "@/lib/lunch/lunchContext";
import {
  UtensilsCrossed,
  Clock,
  Leaf,
  Drumstick,
  CheckCircle2,
  XCircle,
  Ticket,
  Users,
  Send,
} from "lucide-react";
import { format } from "date-fns";
import { useState, useMemo } from "react";
import { toast } from "sonner";
import type { MealPreference } from "@/lib/types";

function getToday() {
  return new Date().toISOString().split("T")[0];
}

function isWithinCollectionWindow() {
  const now = new Date();
  const hours = now.getHours();
  const minutes = now.getMinutes();
  const totalMinutes = hours * 60 + minutes;
  return totalMinutes >= 9 * 60 + 45 && totalMinutes < 11 * 60;
}

function isBeforeCollectionWindow() {
  const now = new Date();
  const totalMinutes = now.getHours() * 60 + now.getMinutes();
  return totalMinutes < 9 * 60 + 45;
}

export default function LunchTokenPage() {
  const { user } = useAuth();
  const { data: myAttendance, isLoading: attendanceLoading } =
    useMyLunchAttendance();
  const today = getToday();

  const { data: allTokensToday, isLoading: allLoading } = useLunchTokens(today);
  const [preferredLunchOption, setPreference] = useState<MealPreference | null>(
    null,
  );

  const { totalAttending, totalTokens, totalVegetarian, totalNonVegetarian } =
    useLunchContext();

  const isWeekend = new Date().getDay() === 0 || new Date().getDay() === 6;
  const canCollect = !isWeekend && isWithinCollectionWindow();
  const isBefore = isBeforeCollectionWindow();

  // Read from myAttendance.attendance — matches the actual API response shape
  const alreadyCollected = myAttendance?.attendance?.isAttending === true;
  const collectedPreference = myAttendance?.attendance?.preferredLunchOption as
    | MealPreference
    | undefined;
//
  const isAdmin = user?.roles?.some((r) => r.includes("ADMIN"));

  const stats = useMemo(() => {
    if (!allTokensToday) return { total: 0, veg: 0, nonVeg: 0 };
    return {
      total: allTokensToday.length,
      veg: allTokensToday.filter((t) => t.preferredLunchOption === "VEG")
        .length,
      nonVeg: allTokensToday.filter((t) => t.preferredLunchOption === "NON_VEG")
        .length,
    };
  }, [allTokensToday]);

  const { mutate: handleAttendance, isPending, variables } = useMarkLunchAttendance();
  const isCollecting = isPending && variables?.isAttending === true;
  const isCancelling = isPending && variables?.isAttending === false;

  const { mutate: notifyReady, isPending: isNotifying } = useNotifyLunchReady();

  const handleCollect = () => {
    if (!preferredLunchOption) {
      toast.error(
        "Please select a meal preference before collecting your token.",
      );
      return;
    }
    handleAttendance({
      isAttending: true,
      preferredLunchOption: preferredLunchOption as MealPreference,
      userId: user?.id,
    });
  };

  const handleCancelCollection = () => {
    handleAttendance({
      isAttending: false,
      preferredLunchOption: (collectedPreference ??
        preferredLunchOption) as MealPreference,
      userId: user?.id,
    });
  };
//
  // Full-page skeleton while loading
  if (attendanceLoading) {
    return (
      <div className="mx-auto max-w-3xl flex flex-col gap-6">
        <div>
          <Skeleton className="h-7 w-40" />
          <Skeleton className="mt-1 h-4 w-72" />
        </div>
        <Skeleton className="h-20 w-full rounded-lg" />
        <Skeleton className="h-48 w-full rounded-lg" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Lunch Token</h1>
        <p className="text-base font-medium text-muted-foreground mt-1">
          Collect your daily lunch token before 11:00 AM.
        </p>
      </div>

      {/* Status banner */}
      <Card>
        <CardContent className="flex items-center gap-4 p-4">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary/10">
            <UtensilsCrossed className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-foreground">
              {format(new Date(), "EEEE, MMMM d, yyyy")}
            </p>
            <div className="flex items-center gap-2 mt-1">
              <Clock className="h-3 w-3 text-muted-foreground" />
              <span className={`text-xs font-medium ${
                isWeekend 
                  ? 'text-yellow-600' 
                  : canCollect 
                    ? 'text-green-600' 
                    : isBefore
                      ? 'text-orange-600'
                      : 'text-red-600'
              }`}>
                {isWeekend
                  ? "Collection closed on weekends"
                  : canCollect
                    ? "Token collection is open (9:45 AM - 11:00 AM)"
                    : isBefore
                      ? "Collection opens at 9:45 AM (9:45 AM - 11:00 AM)"
                      : "Collection closed for today (was 9:45 AM - 11:00 AM)"}
              </span>
            </div>
          </div>
          {isWeekend ? (
            <Badge className="bg-yellow-100 text-yellow-800 gap-1 hover:bg-yellow-100/80">
              <Clock className="h-3 w-3" />
              Weekend
            </Badge>
          ) : alreadyCollected ? (
            <Badge className="bg-green-100 text-green-800 gap-1 hover:bg-green-100/80">
              <CheckCircle2 className="h-3 w-3" />
              Collected
            </Badge>
          ) : (
            <Badge variant="outline" className="gap-1 text-muted-foreground">
              <XCircle className="h-3 w-3" />
              Not Collected
            </Badge>
          )}
        </CardContent>
      </Card>

      {/* Collect Token Card */}
      {alreadyCollected ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base text-foreground">
              Your Token for Today
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex items-center gap-4 rounded-lg border border-border bg-muted/30 p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                {collectedPreference === "VEG" ? (
                  <Leaf className="h-6 w-6 text-green-600" />
                ) : (
                  <Drumstick className="h-6 w-6 text-orange-600" />
                )}
              </div>
              <div>
                <p className="text-sm font-medium text-foreground capitalize">
                  {collectedPreference === "VEG"
                    ? "Vegetarian"
                    : "Non-Vegetarian"}
                </p>
                <p className="text-xs text-muted-foreground">
                  Token collected for today
                </p>
              </div>
            </div>
            {canCollect && (
              <Button
                variant="destructive"
                onClick={handleCancelCollection}
                disabled={isPending}
                className="w-full"
              >
                {isCancelling ? "Cancelling..." : "Cancel Token Collection"}
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-base text-foreground">
              Select Your Meal Preference
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setPreference("VEG")}
                disabled={isPending}
                className={`flex flex-col items-center gap-2 rounded-lg border-2 p-4 transition-colors ${preferredLunchOption === "VEG"
                  ? "border-green-500 bg-green-50"
                  : "border-border hover:border-green-300"
                  }`}
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                  <Leaf className="h-6 w-6 text-green-600" />
                </div>
                <span className="text-sm font-medium text-foreground">
                  Vegetarian
                </span>
              </button>
              <button
                type="button"
                onClick={() => setPreference("NON_VEG")}
                disabled={isPending}
                className={`flex flex-col items-center gap-2 rounded-lg border-2 p-4 transition-colors ${preferredLunchOption === "NON_VEG"
                  ? "border-orange-500 bg-orange-50"
                  : "border-border hover:border-orange-300"
                  }`}
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-100">
                  <Drumstick className="h-6 w-6 text-orange-600" />
                </div>
                <span className="text-sm font-medium text-foreground">
                  Non-Vegetarian
                </span>
              </button>
            </div>
            <Button
              onClick={handleCollect}
              disabled={!preferredLunchOption || !canCollect || isPending}
              className="w-full"
            >
              {isCollecting
                ? "Collecting..."
                : isWeekend
                  ? "Collection Closed (Weekend)"
                  : !canCollect
                    ? isBefore
                      ? "Opens at 9:45 AM"
                      : "Collection Closed (After 11 AM)"
                    : "Collect Lunch Token"}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* ── Today's Lunch Overview ── */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">

        {/* Total Attending */}
        <Card className="relative overflow-hidden">
          <CardContent className="flex flex-col items-center justify-center p-4">
            <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-purple-100">
              <Users className="h-5 w-5 text-purple-600" />
            </div>
            <p className="text-3xl font-bold text-foreground">
              {totalAttending}
            </p>
            <p className="text-xs font-medium text-muted-foreground">
              Attending
            </p>
          </CardContent>
          <div className="absolute inset-x-0 bottom-0 h-1 bg-purple-500" />
        </Card>

        {/* Vegetarian */}
        <Card className="relative overflow-hidden">
          <CardContent className="flex flex-col items-center justify-center p-4">
            <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
              <Leaf className="h-5 w-5 text-green-600" />
            </div>
            <p className="text-3xl font-bold text-green-600">
              {totalVegetarian}
            </p>
            <p className="text-xs font-medium text-muted-foreground">Veg</p>
          </CardContent>
          <div className="absolute inset-x-0 bottom-0 h-1 bg-green-500" />
        </Card>

        {/* Non-Vegetarian */}
        <Card className="relative overflow-hidden">
          <CardContent className="flex flex-col items-center justify-center p-4">
            <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-orange-100">
              <Drumstick className="h-5 w-5 text-orange-600" />
            </div>
            <p className="text-3xl font-bold text-orange-600">
              {totalNonVegetarian}
            </p>
            <p className="text-xs font-medium text-muted-foreground">Non-Veg</p>
          </CardContent>
          <div className="absolute inset-x-0 bottom-0 h-1 bg-orange-500" />
        </Card>
      </div>



    </div>
  );
}
