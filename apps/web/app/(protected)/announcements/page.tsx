"use client"

import { useAuth } from "@/lib/auth-context"
import { useAnnouncements } from "@/hooks/announcement/useAnnouncements"
import { useCreateAnnouncement } from "@/hooks/announcement/useCreateAnnouncement"
import { usePinAnnouncement } from "@/hooks/announcement/usePinAnnouncement"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { Megaphone, Pin, X, ChevronLeft, ChevronRight, Search, CalendarIcon } from "lucide-react"
import { format, isWithinInterval, startOfDay, endOfDay, isSameDay, formatDistanceToNow } from "date-fns"
import { useState } from "react"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { DateRange } from "react-day-picker"
import { cn } from "@/lib/utils"


import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
const PRIORITY_STYLES: Record<string, string> = {
  low: "bg-slate-50 text-slate-600 border-slate-200",
  normal: "bg-blue-50 text-blue-600 border-blue-200",
  high: "bg-amber-50 text-amber-600 border-amber-200",
  urgent: "bg-red-50 text-red-600 border-red-200",
};

export default function AnnouncementsPage() {
  const { user } = useAuth()
  const { data: announcements, isLoading } = useAnnouncements()
  const createAnnouncement = useCreateAnnouncement()
  const pinAnnouncement = usePinAnnouncement()
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [priority, setPriority] = useState("normal")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [search, setSearch] = useState("")
  const [pinnedFilter, setPinnedFilter] = useState<string>("all")
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined)

  const canCreate = user?.roles?.some((r) => r.includes("ADMIN"));

  const filtered = announcements?.filter((ann) => {
    const matchSearch =
      ann.title.toLowerCase().includes(search.toLowerCase()) ||
      ann.content.toLowerCase().includes(search.toLowerCase())

    const matchPinned =
      pinnedFilter === "all" ||
      (pinnedFilter === "pinned" && ann.pinned) ||
      (pinnedFilter === "unpinned" && !ann.pinned)

    let matchDate = true
    if (dateRange?.from) {
      const annDate = new Date(ann.createdAt)
      if (dateRange.to) {
        matchDate = isWithinInterval(annDate, {
          start: startOfDay(dateRange.from),
          end: endOfDay(dateRange.to),
        })
      } else {
        matchDate = isSameDay(annDate, dateRange.from)
      }
    }

    return matchSearch && matchPinned && matchDate
  }) ?? []

  const totalAnnouncements = filtered.length
  const totalPages = Math.ceil(totalAnnouncements / itemsPerPage)
  const paginatedAnnouncements = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const handleSearch = (value: string) => {
    setSearch(value)
    setCurrentPage(1)
  }
  const handlePinnedFilter = (value: string) => {
    setPinnedFilter(value)
    setCurrentPage(1)
  }
  const handleDateChange = (range: DateRange | undefined) => {
    setDateRange(range)
    setCurrentPage(1)
  }
  const clearDateFilter = () => {
    setDateRange(undefined)
    setCurrentPage(1)
  }
  const handleItemsPerPageChange = (value: string) => {
    setItemsPerPage(Number(value))
    setCurrentPage(1)
  }

  const handleCreateAnnouncement = () => {
    if (title.trim() && content.trim() && user) {
      createAnnouncement.mutate(
        {
          title,
          content,
          priority,
        },
        {
          onSuccess: () => {
            setTitle("")
            setContent("")
            setPriority("normal")
            setOpen(false)
          },
        }
      )
    }
  }

  const handleTogglePin = (announcementId: string, currentPinned: boolean) => {
    pinAnnouncement.mutate({
      announcementId,
      pinned: !currentPinned,
    })
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Announcements
          </h1>
          <p className="text-base font-medium text-muted-foreground mt-1">
            Office-wide announcements and updates.
          </p>
        </div>
        {canCreate && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>Create Announcement</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Announcement</DialogTitle>
                <DialogDescription>
                  Share an important announcement with all users.
                </DialogDescription>
              </DialogHeader>
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="title" className="text-sm font-medium">
                    Title
                  </Label>
                  <Input
                    id="title"
                    placeholder="Announcement title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="content" className="text-sm font-medium">
                    Content
                  </Label>
                  <Textarea
                    id="content"
                    placeholder="Write your announcement..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="min-h-24"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="priority" className="text-sm font-medium">
                    Priority
                  </Label>
                  <Select value={priority} onValueChange={setPriority}>
                    <SelectTrigger id="priority">
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleCreateAnnouncement}
                    disabled={createAnnouncement.isPending || !title.trim() || !content.trim()}
                  >
                    {createAnnouncement.isPending
                      ? "Creating..."
                      : "Create"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        <div className="relative flex-1 min-w-0">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search announcements..."
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full sm:w-auto justify-start text-left font-normal gap-2",
                !dateRange && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="h-4 w-4 shrink-0" />
              {dateRange?.from ? (
                dateRange.to ? (
                  <span className="truncate">
                    {format(dateRange.from, "MMM d, yyyy")} - {format(dateRange.to, "MMM d, yyyy")}
                  </span>
                ) : (
                  <span className="truncate">{format(dateRange.from, "MMM d, yyyy")}</span>
                )
              ) : (
                <span>Filter by date</span>
              )}
              {dateRange?.from && (
                <span
                  role="button"
                  tabIndex={0}
                  className="ml-auto rounded-full p-0.5 hover:bg-muted"
                  onClick={(e) => {
                    e.stopPropagation()
                    clearDateFilter()
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.stopPropagation()
                      clearDateFilter()
                    }
                  }}
                >
                  <X className="h-3.5 w-3.5" />
                  <span className="sr-only">Clear date filter</span>
                </span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={dateRange?.from}
              selected={dateRange}
              onSelect={handleDateChange}
              numberOfMonths={2}
            />
          </PopoverContent>
        </Popover>
        <Select value={pinnedFilter} onValueChange={handlePinnedFilter}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="Filter" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="pinned">Pinned Only</SelectItem>
            <SelectItem value="unpinned">Unpinned Only</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Megaphone className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              {search || pinnedFilter !== "all" || dateRange?.from
                ? "No announcements match your filters."
                : "No announcements at this time."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="flex flex-col gap-3">
            {paginatedAnnouncements.map((ann) => (
              <Card
                key={ann.id}
                className={ann.pinned ? "border-primary/30 bg-primary/[0.02]" : ""}
              >
                <CardContent className="p-0">
                  <div className="flex items-start gap-4 p-5">
                    {/* Left Icon Area */}
                    <div className={cn(
                      "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl transition-all duration-300 shadow-sm border",
                      ann.pinned ? "bg-primary/10 border-primary/20 text-primary" : "bg-muted/30 border-border text-muted-foreground"
                    )}>
                      <Megaphone className={cn("h-6 w-6", ann.pinned && "animate-pulse")} />
                    </div>

                    {/* Middle Content Area */}
                    <div className="flex-1 space-y-2 py-0.5">
                      <div className="flex items-center flex-wrap gap-2">
                        <h3 className="text-base font-semibold text-foreground leading-none">
                          {ann.title}
                        </h3>
                        <div className="flex items-center gap-1.5 ml-1">
                          {ann.pinned && (
                            <Badge
                              variant="outline"
                              className="bg-primary/5 border-primary/20 text-primary text-[10px] h-4.5 px-1.5 py-0 font-bold uppercase tracking-wider"
                            >
                              Pinned
                            </Badge>
                          )}
                          <Badge
                            variant="outline"
                            className={cn(
                              "text-[10px] capitalize px-1.5 py-0 h-4.5 font-bold uppercase tracking-wider border",
                              PRIORITY_STYLES[ann.priority?.toLowerCase() || "normal"]
                            )}
                          >
                            {ann.priority || "Normal"}
                          </Badge>
                        </div>
                      </div>
                      <p className="text-sm leading-relaxed text-muted-foreground line-clamp-3">
                        {ann.content}
                      </p>
                    </div>

                    {/* Right Action/Meta Area */}
                    <div className="flex flex-col items-end justify-between self-stretch pt-0.5 pb-0.5 min-w-[120px]">
                      {canCreate ? (
                        <Button
                          variant="ghost"
                          size="icon"
                          className={cn(
                            "h-8 w-8 rounded-full transition-all duration-300",
                            ann.pinned ? "text-primary bg-primary/5 hover:bg-primary/10" : "text-muted-foreground hover:bg-muted"
                          )}
                          onClick={() => handleTogglePin(ann.id, ann.pinned)}
                          disabled={pinAnnouncement.isPending}
                        >
                          <Pin className={cn("h-4 w-4", ann.pinned && "fill-current")} />
                        </Button>
                      ) : (
                        <div className="h-8" />
                      )}

                      <div className="flex flex-col items-end gap-1">
                        <span className="text-xs font-semibold text-primary/70">
                          {ann.createdBy?.name || "System Admin"}
                        </span>
                        <div className="flex items-center gap-1.5 text-[10px] font-medium text-muted-foreground bg-muted/30 px-2 py-0.5 rounded-full border border-border/50">
                          <span title={format(new Date(ann.createdAt), "PPP p")}>
                            {formatDistanceToNow(new Date(ann.createdAt), { addSuffix: true })}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-2">
              <p className="text-sm text-muted-foreground">
                Showing {(currentPage - 1) * itemsPerPage + 1}-{Math.min(currentPage * itemsPerPage, totalAnnouncements)} of {totalAnnouncements}
              </p>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">Entries per page</span>
                  <Select
                    value={String(itemsPerPage)}
                    onValueChange={handleItemsPerPageChange}
                  >
                    <SelectTrigger className="h-8 w-[70px] text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="25">25</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                      <SelectItem value="100">100</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Next
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
