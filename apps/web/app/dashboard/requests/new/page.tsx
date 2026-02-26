"use client";

import React, { useState, useRef } from "react";
import { useAuth } from "@/lib/auth-context";
import { useCreateRequest } from "@/lib/queries";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import useCreateRequestMutation from "@/hooks/request/use-createRequest";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  ArrowLeft,
  Paperclip,
  X,
  FileText,
  ImageIcon,
  File,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  requestSchema,
  ISSUE_CATEGORIES,
  ISSUE_PRIORITIES,
  SUPPLIES_CATEGORIES,
  ISSUE_CATEGORY_LABELS,
  SUPPLIES_CATEGORY_LABELS,
  ISSUE_PRIORITY_LABELS,
} from "@/schemas";
import type { Attachment } from "@/lib/types";
import error from "next/error";
import { CreateRequestPayload } from "@/lib/type/requestType"; // fix import path

type RequestFormValues = {
  type: "ISSUE" | "SUPPLIES";
  title: string;
  description?: string;
  issuePriority?: "LOW" | "MEDIUM" | "HIGH";
  issueCategory?: "HARDWARE" | "SOFTWARE" | "NETWORK";
  location?: string;
  suppliesCategory?: "OFFICE" | "MAINTENANCE" | "OTHER";
  itemName?: string;
};

// ✅ keep non-hook constants at module level
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const MAX_FILES = 5;
const ACCEPTED_TYPES = ["image/png", "image/jpeg", "image/webp", "image/gif"];

export default function NewRequestPage() {
  // ✅ hooks must be inside component
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const { mutate, isPending } = useCreateRequestMutation();

  const form = useForm<RequestFormValues>({
    resolver: zodResolver(requestSchema),
    defaultValues: {
      type: "ISSUE",
      title: "",
      description: "",
      issuePriority: "MEDIUM",
      issueCategory: "SOFTWARE",
      location: "",
    },
  });

  const requestType = form.watch("type");

  const handleTypeChange = (newType: "ISSUE" | "SUPPLIES") => {
    if (newType === "ISSUE") {
      form.reset({
        type: "ISSUE",
        title: form.getValues("title"),
        description: form.getValues("description") || "",
        issuePriority: "MEDIUM",
        issueCategory: "SOFTWARE",
        location: "",
      });
    } else {
      form.reset({
        type: "SUPPLIES",
        title: form.getValues("title"),
        description: form.getValues("description") || "",
        suppliesCategory: "OFFICE",
        itemName: "",
      });
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const remaining = MAX_FILES - attachments.length;
    if (remaining <= 0) {
      toast.error(`Maximum ${MAX_FILES} files allowed.`);
      return;
    }

    const newAttachments: Attachment[] = [];
    const fileArray = Array.from(files).slice(0, remaining);

    for (const file of fileArray) {
      if (!ACCEPTED_TYPES.includes(file.type)) {
        toast.error(`"${file.name}" is not a supported file type.`);
        continue;
      }
      if (file.size > MAX_FILE_SIZE) {
        toast.error(`"${file.name}" exceeds 5MB limit.`);
        continue;
      }
      newAttachments.push({
        id: `att-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        name: file.name,
        size: file.size,
        type: file.type,
        url: URL.createObjectURL(file),
      });
    }

    setAttachments((prev) => [...prev, ...newAttachments]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeAttachment = (id: string) => {
    setAttachments((prev) => {
      const removed = prev.find((a) => a.id === id);
      if (removed) URL.revokeObjectURL(removed.url);
      return prev.filter((a) => a.id !== id);
    });
  };

  const handleSubmit = async (data: RequestFormValues) => {
    const apiType = data.type === "ISSUE" ? "ISSUE" : "SUPPLIES"; // ensure correct type for API

    const payload: CreateRequestPayload = {
      type: apiType as RequestFormValues["type"],
      title: data.title,
      description: data.description?.trim() || undefined,
      attachments: attachments.map((a) => a.name),
      ...(data.type === "ISSUE"
        ? {
            issueDetails: {
              priority: data.issuePriority!,
              category: data.issueCategory!,
              location: data.location?.trim() || undefined,
            },
          }
        : {
            suppliesDetails: {
              category: data.suppliesCategory!,
              itemName: data.itemName!,
            },
          }),
    };

    mutate(payload, {
      onSuccess: () => {
        toast.success("Request created successfully!");
        router.push("/dashboard/requests");
      },
      onError: (error: any) => {
        toast.error(
          error?.response?.data?.message ||
            "An error occurred while creating the request.",
        );
      },
    });
  };

  return (
    <div className="mx-auto max-w-xl">
      <div className="mb-6">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/dashboard/requests">
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back to Requests
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-foreground">
            New Service Request
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="flex flex-col gap-4"
            >
              {/* Request Type Radio */}
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Request Type *</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={(val) => {
                          field.onChange(val);
                          handleTypeChange(val as "ISSUE" | "SUPPLIES");
                        }}
                        value={field.value}
                        className="flex gap-4"
                      >
                        <label
                          htmlFor="type-issue"
                          className="flex cursor-pointer items-center gap-2 rounded-md border border-border px-4 py-2.5 text-sm transition-colors has-[*[data-state=checked]]:border-primary has-[*[data-state=checked]]:bg-primary/5"
                        >
                          <RadioGroupItem value="ISSUE" id="type-issue" />
                          <span className="font-medium text-foreground">
                            Issue
                          </span>
                        </label>
                        <label
                          htmlFor="type-supplies"
                          className="flex cursor-pointer items-center gap-2 rounded-md border border-border px-4 py-2.5 text-sm transition-colors has-[*[data-state=checked]]:border-primary has-[*[data-state=checked]]:bg-primary/5"
                        >
                          <RadioGroupItem value="SUPPLIES" id="type-supplies" />
                          <span className="font-medium text-foreground">
                            Supplies Request
                          </span>
                        </label>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Brief description of your request"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Description
                      {requestType === "ISSUE" ? " *" : " (optional)"}
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Provide details about your request..."
                        rows={4}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Issue-specific fields */}
              {requestType === "ISSUE" && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="issueCategory"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Category *</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select category" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {ISSUE_CATEGORIES.map((cat) => (
                                <SelectItem key={cat} value={cat}>
                                  {ISSUE_CATEGORY_LABELS[cat]}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="issuePriority"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Priority *</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select priority" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {ISSUE_PRIORITIES.map((priority) => (
                                <SelectItem key={priority} value={priority}>
                                  {ISSUE_PRIORITY_LABELS[priority]}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Location (optional)</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Where did the issue occur? (e.g., 2nd Floor, Meeting Room B)"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              )}

              {/* Supplies-specific fields */}
              {requestType === "SUPPLIES" && (
                <>
                  <FormField
                    control={form.control}
                    name="suppliesCategory"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Supplies Category *</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select supplies category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {SUPPLIES_CATEGORIES.map((cat) => (
                              <SelectItem key={cat} value={cat}>
                                {SUPPLIES_CATEGORY_LABELS[cat]}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="itemName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Item Name *</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Name of item requested (e.g., A4 Paper, Coffee Beans)"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              )}

              {/* Attachments */}
              <div className="flex flex-col gap-2">
                <FormLabel>Attachments</FormLabel>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                  aria-label="Upload attachments"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={attachments.length >= MAX_FILES}
                  className="w-fit gap-2"
                >
                  <Paperclip className="h-4 w-4" />
                  Add Attachment
                </Button>
                <p className="text-xs text-muted-foreground">
                  Max {MAX_FILES} files, up to 5MB each. Supported: images, PDF,
                  Word, text.
                </p>

                {attachments.length > 0 && (
                  <div className="mt-1 flex flex-col gap-1.5">
                    {attachments.map((att) => (
                      <div
                        key={att.id}
                        className="flex items-center gap-2 rounded-md border border-border bg-muted/30 px-3 py-2 text-sm"
                      >
                        <span className="flex-1 truncate text-foreground">
                          {att.name}
                        </span>
                        <span className="shrink-0 text-xs text-muted-foreground"></span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 shrink-0"
                          onClick={() => removeAttachment(att.id)}
                        >
                          <X className="h-3.5 w-3.5" />
                          <span className="sr-only">Remove {att.name}</span>
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <Button type="submit" className="mt-2" disabled={isPending}>
                {isPending ? "Creating Request..." : "Create Request"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
