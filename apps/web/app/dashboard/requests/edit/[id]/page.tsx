"use client";

import React from "react";
import { useAuth } from "@/lib/auth-context";
import { useGetRequestByIdQuery } from "@/hooks/request/useGetRequest";
import { useUpdateRequestMutation } from "@/hooks/request/useUpdateRequest";
import { useRouter, useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ArrowLeft, Loader } from "lucide-react";
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
import { Skeleton } from "@/components/ui/skeleton";

export default function EditRequestPage() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const { data: requestById, isLoading } = useGetRequestByIdQuery(id);
  const request = requestById?.request;
  const updateRequest = useUpdateRequestMutation();

  const getDefaultValues = React.useCallback((): RequestFormValues => {
    if (!request) {
      return {
        type: "ISSUE",
        title: "",
        description: "",
        issuePriority: "MEDIUM",
        issueCategory: "TECHNICAL",
        location: "",
      };
    }
    if (request.type === "ISSUE" || request.type === "Issue") {
      return {
        type: "ISSUE",
        title: request.title,
        description: request.description || "",
        issuePriority: request.issueDetails?.priority || "MEDIUM",
        issueCategory: request.issueDetails?.category || "TECHNICAL",
        location: request.issueDetails?.location || "",
      };
    }
    return {
      type: "Supplies",
      title: request.title,
      description: request.description || "",
      SuppliesCategory: request.suppliesDetails?.category || "OFFICE_Supplies",
      itemName: request.suppliesDetails?.itemName || "",
    };
  }, [request]);

  const form = useForm<RequestFormValues>({
    resolver: zodResolver(requestSchema),
    defaultValues: getDefaultValues(),
  });

  // Update form when request data loads
  React.useEffect(() => {
    if (request) {
      form.reset(getDefaultValues());
    }
  }, [request, form, getDefaultValues]);

  const requestType = form.watch("type");

  const handleTypeChange = (newType: "ISSUE" | "Supplies") => {
    if (newType === "ISSUE") {
      form.reset({
        type: "ISSUE",
        title: form.getValues("title"),
        description: form.getValues("description") || "",
        issuePriority: "MEDIUM",
        issueCategory: "TECHNICAL",
        location: "",
      });
    } else {
      form.reset({
        type: "Supplies",
        title: form.getValues("title"),
        description: form.getValues("description") || "",
        SuppliesCategory: "OFFICE_Supplies",
        itemName: "",
      });
    }
  };

  // Check authorization
  const isCreator = user?.id === request?.userId;
  const isNotPending = request && request.status !== "PENDING";

  if (isLoading) {
    return (
      <div className="mx-auto max-w-xl">
        <Skeleton className="mb-4 h-8 w-32" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (!request) {
    return (
      <div className="mx-auto max-w-xl text-center">
        <p className="text-sm text-muted-foreground">Request not found.</p>
        <Button asChild variant="ghost" className="mt-4">
          <Link href="/dashboard/requests">Back to Requests</Link>
        </Button>
      </div>
    );
  }

  if (!isCreator) {
    return (
      <div className="mx-auto max-w-xl text-center">
        <p className="text-sm text-muted-foreground">
          You can only edit your own requests.
        </p>
        <Button asChild variant="ghost" className="mt-4">
          <Link href={`/dashboard/requests/${id}`}>Back to Request</Link>
        </Button>
      </div>
    );
  }

  if (isNotPending) {
    return (
      <div className="mx-auto max-w-xl text-center">
        <p className="text-sm text-muted-foreground">
          You can only edit requests with pending status.
        </p>
        <Button asChild variant="ghost" className="mt-4">
          <Link href={`/dashboard/requests/${id}`}>Back to Request</Link>
        </Button>
      </div>
    );
  }

  const handleSubmit = (values: RequestFormValues) => {
    updateRequest.mutate(
      {
        id: request.id,
        ...values,
        itemName: values.type === "Supplies" ? values.itemName : "",
      },
      {
        onSuccess: () => {
          toast.success("Request updated successfully.");
          router.push(`/dashboard/requests/${request.id}`);
        },
        onError: (error) => {
          console.error("Failed to update request:", error);
          toast.error("Failed to update request. Please try again.");
        },
      },
    );
  };

  return (
    <div className="mx-auto max-w-xl">
      <div className="mb-6">
        <Button variant="ghost" size="sm" asChild>
          <Link href={`/dashboard/requests/${id}`}>
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back to Request
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-foreground">
            Edit Service Request
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
                          handleTypeChange(val as "ISSUE" | "Supplies");
                        }}
                        value={field.value}
                        className="flex gap-4"
                      >
                        <label
                          htmlFor="edit-type-issue"
                          className="flex cursor-pointer items-center gap-2 rounded-md border border-border px-4 py-2.5 text-sm transition-colors has-[*[data-state=checked]]:border-primary has-[*[data-state=checked]]:bg-primary/5"
                        >
                          <RadioGroupItem value="ISSUE" id="edit-type-issue" />
                          <span className="font-medium text-foreground">
                            Issue
                          </span>
                        </label>
                        <label
                          htmlFor="edit-type-Supplies"
                          className="flex cursor-pointer items-center gap-2 rounded-md border border-border px-4 py-2.5 text-sm transition-colors has-[*[data-state=checked]]:border-primary has-[*[data-state=checked]]:bg-primary/5"
                        >
                          <RadioGroupItem
                            value="Supplies"
                            id="edit-type-Supplies"
                          />
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
              {requestType === "Supplies" && (
                <>
                  <FormField
                    control={form.control}
                    name="SuppliesCategory"
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

              <div className="flex gap-2 pt-2">
                <Button type="submit" disabled={updateRequest.isPending}>
                  {updateRequest.isPending ? (
                    <>
                      <Loader className="mr-2 h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    "Update Request"
                  )}
                </Button>
                <Button type="button" variant="outline" asChild>
                  <Link href={`/dashboard/requests/${id}`}>Cancel</Link>
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
