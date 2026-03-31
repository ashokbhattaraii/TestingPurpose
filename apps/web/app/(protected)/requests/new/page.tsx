"use client";

import React, { useState, useRef } from "react";
import { useAuth } from "@/lib/auth-context";

import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import useCreateRequestMutation from "@/hooks/request/useCreateRequest";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
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
  type RequestFormValues,
  ISSUE_CATEGORIES,
  ISSUE_PRIORITIES,
  SUPPLIES_CATEGORIES,
  ISSUE_CATEGORY_LABELS,
  SUPPLIES_CATEGORY_LABELS,
  ISSUE_PRIORITY_LABELS,
} from "@/schemas";
import { CreateRequestPayload } from "@/lib/type/requestType"; // fix import path

export default function NewRequestPage() {
  const router = useRouter();
  const { mutate, isPending } = useCreateRequestMutation();

  const form = useForm<RequestFormValues>({
    resolver: zodResolver(requestSchema),
    defaultValues: {
      type: "ISSUE",
      title: "",
      description: "",
      isAnonymous: false,
      issuePriority: "MEDIUM",
      issueCategory: "TECHNICAL",
      location: "",
    },
  });

  const requestType = form.watch("type");
  const issueCategory = form.watch("issueCategory");
  const suppliesCategory = form.watch("suppliesCategory");

  const handleTypeChange = (newType: "ISSUE" | "SUPPLIES") => {
    const isAnonymous = form.getValues("isAnonymous");
    if (newType === "ISSUE") {
      form.reset({
        type: "ISSUE",
        title: form.getValues("title"),
        description: form.getValues("description") || "",
        isAnonymous,
        issuePriority: "MEDIUM",
        issueCategory: "TECHNICAL",
        location: "",
      });
    } else {
      form.reset({
        type: "SUPPLIES",
        title: form.getValues("title"),
        description: form.getValues("description") || "",
        isAnonymous,
        suppliesCategory: "OFFICE_SUPPLIES",
        itemName: "",
      });
    }
  };

  const handleSubmit = async (data: RequestFormValues) => {
    const apiType = data.type === "ISSUE" ? "ISSUE" : "SUPPLIES"; // ensure correct type for API

    const payload: CreateRequestPayload = {
      type: apiType as RequestFormValues["type"],
      title: data.title,
      description: data.description?.trim() || undefined,
      isAnonymous: data.isAnonymous,
      ...(data.type === "ISSUE"
        ? {
          issueDetails: {
            priority: data.issuePriority!,
            category: data.issueCategory!,
            otherCategoryDetails: data.issueCategory === "OTHER" ? data.otherCategoryDetails : undefined,
            location: data.location?.trim() || undefined,
          },
        }
        : {
          suppliesDetails: {
            category: data.suppliesCategory!,
            otherCategoryDetails: data.suppliesCategory === "OTHER" ? data.otherCategoryDetails : undefined,
            itemName: data.itemName!,
          },
        }),
    };

    mutate(payload, {
      onSuccess: () => {
        router.push("/requests");
      },
    });
  };

  return (
    <div className="mx-auto max-w-xl">
      <div className="mb-6">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/requests">
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

              <FormField
                control={form.control}
                name="isAnonymous"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 bg-muted/20">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Submit Anonymously</FormLabel>
                      <p className="text-sm text-muted-foreground pt-1">
                        Your identity will be hidden from other users, including App Admins.
                      </p>
                    </div>
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

                    {issueCategory === "OTHER" && (
                      <FormField
                        control={form.control}
                        name="otherCategoryDetails"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Specify Category *</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Please specify (max 15 words)"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}

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

                  {suppliesCategory === "OTHER" && (
                    <FormField
                      control={form.control}
                      name="otherCategoryDetails"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Specify Category *</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Please specify (max 15 words)"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

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

              {/* Submit Button */}

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
