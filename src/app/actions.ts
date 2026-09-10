"use server";

import { createInquiry, inquirySchema } from "@/lib/inquiries";

export type InquiryFormState =
  | { status: "idle" }
  | { status: "error"; message: string; fieldErrors?: Record<string, string> }
  | { status: "success"; id: string; emailed: boolean };

function parseItems(raw: FormDataEntryValue | null) {
  if (typeof raw !== "string" || !raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function submitInquiry(
  _prev: InquiryFormState,
  formData: FormData,
): Promise<InquiryFormState> {
  const parsed = inquirySchema.safeParse({
    type: formData.get("type"),
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone") ?? "",
    subject: formData.get("subject") ?? "",
    message: formData.get("message") ?? "",
    eventDate: formData.get("eventDate") ?? "",
    venue: formData.get("venue") ?? "",
    guestCount: formData.get("guestCount") ?? "",
    caterer: formData.get("caterer") ?? "",
    planner: formData.get("planner") ?? "",
    howHeard: formData.get("howHeard") ?? "",
    company: formData.get("company") ?? "",
    items: parseItems(formData.get("items")),
  });

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? "form");
      fieldErrors[key] ??= issue.message;
    }
    return {
      status: "error",
      message: "Please check the highlighted fields and try again.",
      fieldErrors,
    };
  }

  try {
    const { id, emailed } = await createInquiry(parsed.data);
    return { status: "success", id, emailed };
  } catch (err) {
    console.error("submitInquiry failed:", err);
    return {
      status: "error",
      message:
        "Something went wrong submitting your request. Please call us at (224) 279-1500 or email info@windycitylinen.com.",
    };
  }
}
