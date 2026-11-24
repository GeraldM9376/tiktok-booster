
"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

type Ticket = {
  id: string;
  subject: string;
  message: string;
  status: string;
  response: string | null;
  created_at: string;
  updated_at: string;
};

function settingValue(value: unknown): string {
  return typeof value === "string" ? value : "";
}

const faqs = [
  {
    question: "How do campaigns work?",
    answer:
      "Creators create campaigns by choosing the action they want to promote, such as Likes or Follows. Earners complete eligible tasks and receive rewards according to the campaign rules.",
  },
  {
    question: "How are campaign credits charged?",
    answer:
      "Likes cost 1 credit and Follows cost 10 credits. Credits are charged when an eligible action is completed, not when you initially create the campaign.",
  },
  {
    question: "Can I pause or cancel a campaign?",
    answer:
      "Yes. You can pause, resume or cancel campaigns. Unused credits remain available according to the platform's campaign rules.",
  },
  {
    question: "How do I top up my credits?",
    answer:
      "Open the Creator Top Up section, choose an available package or amount, and follow the payment instructions displayed there.",
  },
  {
    question: "Why is my video or campaign not receiving engagement?",
    answer:
      "Check that your campaign is active, your video link is correct and your campaign has sufficient credits. If the problem continues, submit a support ticket.",
  },
  {
    question: "How do I submit a video?",
    answer:
      "Copy the link to your TikTok video, open the relevant Creator campaign or video section, and follow the instructions to submit the link and campaign details.",
  },
  {
    question: "How can I track campaign performance?",
    answer:
      "Use your Creator dashboard and campaign pages to review campaign activity, completed actions and remaining credits.",
  },
];

export function CreatorHelpClient() {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [email, setEmail] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    let active = true;

    async function loadHelpData() {
      const supabase = createClient();

      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        window.location.href = "/creator/auth";
        return;
      }

      const [settingsResult, ticketsResult] = await Promise.all([
        supabase
          .from("platform_settings")
          .select("key,value")
          .in("key", ["support_email", "support_whatsapp"]),

        supabase
          .from("support_tickets")
          .select("id,subject,message,status,response,created_at,updated_at")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false }),
      ]);

      if (!active) return;

      if (settingsResult.error) {
        console.error("Could not load support contacts:", settingsResult.error);
      } else {
        for (const setting of settingsResult.data ?? []) {
          if (setting.key === "support_email") {
            setEmail(settingValue(setting.value));
          }

          if (setting.key === "support_whatsapp") {
            setWhatsapp(settingValue(setting.value));
          }
        }
      }

      if (ticketsResult.error) {
        console.error("Could not load support tickets:", ticketsResult.error);
        toast.error("Could not load your support history.");
      } else {
        setTickets((ticketsResult.data ?? []) as Ticket[]);
      }

      setLoading(false);
    }

    loadHelpData();

    return () => {
      active = false;
    };
  }, []);

  async function submitTicket(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const cleanSubject = subject.trim();
    const cleanMessage = message.trim();

    if (!cleanSubject || !cleanMessage) {
      toast.error("Please complete both fields.");
      return;
    }

    if (cleanSubject.length > 150 || cleanMessage.length > 5000) {
      toast.error("Your subject or message is too long.");
      return;
    }

    setSubmitting(true);

    try {
      const supabase = createClient();

      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        toast.error("Please sign in again.");
        return;
      }

      const { data, error } = await supabase
        .from("support_tickets")
        .insert({
          user_id: user.id,
          subject: cleanSubject,
          message: cleanMessage,
        })
        .select("id,subject,message,status,response,created_at,updated_at")
        .single();

      if (error) {
        console.error("Ticket submission failed:", error);
        toast.error("Could not submit your ticket. Please try again.");
        return;
      }

      setTickets((current) => [data as Ticket, ...current]);
      setSubject("");
      setMessage("");
      toast.success("Your support ticket has been submitted.");
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  const whatsappNumber = whatsapp.replace(/\D/g, "");
  const whatsappUrl = whatsappNumber
    ? `https://wa.me/${whatsappNumber}`
    : "";

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Help Centre</h1>
        <p className="mt-2 text-muted-foreground">
          Find answers, learn how to use Creator tools and contact support.
        </p>
      </div>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Frequently asked questions</h2>

        <div className="space-y-3">
          {faqs.map((faq) => (
            <details
              key={faq.question}
              className="group rounded-xl border bg-card p-4"
            >
              <summary className="cursor-pointer list-none font-medium">
                <span className="flex items-center justify-between gap-3">
                  {faq.question}
                  <span className="text-muted-foreground group-open:rotate-180">
                    ↓
                  </span>
                </span>
              </summary>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                {faq.answer}
              </p>
            </details>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Quick guides</h2>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border bg-card p-5">
            <h3 className="font-semibold">Submitting a TikTok video</h3>
            <ol className="mt-3 list-inside list-decimal space-y-2 text-sm text-muted-foreground">
              <li>Open the TikTok video you want to promote.</li>
              <li>Copy its share link.</li>
              <li>Open the relevant Creator campaign or video section.</li>
              <li>Paste the link and complete the required details.</li>
              <li>Submit and check your campaign dashboard.</li>
            </ol>
          </div>

          <div className="rounded-xl border bg-card p-5">
            <h3 className="font-semibold">Managing campaigns</h3>
            <ol className="mt-3 list-inside list-decimal space-y-2 text-sm text-muted-foreground">
              <li>Open your Creator campaigns.</li>
              <li>Review campaign progress and remaining credits.</li>
              <li>Pause a campaign when you want to stop activity temporarily.</li>
              <li>Resume it when you are ready.</li>
              <li>Cancel campaigns you no longer need.</li>
            </ol>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Contact support</h2>

        <div className="rounded-xl border bg-card p-5">
          {email || whatsappUrl ? (
            <div className="flex flex-wrap gap-3">
              {email && (
                <a
                  href={`mailto:${email}`}
                  className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-muted"
                >
                  Email support
                </a>
              )}

              {whatsappUrl && (
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-muted"
                >
                  WhatsApp support
                </a>
              )}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Direct support contacts have not been configured. You can still
              submit a support ticket below.
            </p>
          )}
        </div>
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold">Report an issue</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Describe your problem and our Admin team can respond to you.
          </p>
        </div>

        <form
          onSubmit={submitTicket}
          className="space-y-4 rounded-xl border bg-card p-5"
        >
          <div className="space-y-2">
            <label htmlFor="support-subject" className="text-sm font-medium">
              Subject
            </label>
            <input
              id="support-subject"
              value={subject}
              onChange={(event) => setSubject(event.target.value)}
              maxLength={150}
              required
              placeholder="e.g. Problem with my campaign"
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="support-message" className="text-sm font-medium">
              Describe your issue
            </label>
            <textarea
              id="support-message"
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              maxLength={5000}
              rows={5}
              required
              placeholder="Explain what happened and what help you need..."
              className="w-full rounded-lg border bg-background p-3 text-sm"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground disabled:opacity-50"
          >
            {submitting ? "Submitting..." : "Submit support ticket"}
          </button>
        </form>
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold">My support tickets</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            View your submitted requests and Admin responses.
          </p>
        </div>

        {loading ? (
          <p className="text-sm text-muted-foreground">
            Loading your support history...
          </p>
        ) : tickets.length === 0 ? (
          <div className="rounded-xl border p-6 text-center text-sm text-muted-foreground">
            You have not submitted any support tickets yet.
          </div>
        ) : (
          <div className="space-y-3">
            {tickets.map((ticket) => (
              <div key={ticket.id} className="space-y-3 rounded-xl border bg-card p-5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="font-semibold">{ticket.subject}</h3>
                  <span className="rounded-full border px-3 py-1 text-xs">
                    {ticket.status.replace("_", " ")}
                  </span>
                </div>

                <p className="whitespace-pre-wrap text-sm text-muted-foreground">
                  {ticket.message}
                </p>

                {ticket.response && (
                  <div className="rounded-lg bg-muted/50 p-4">
                    <p className="text-xs font-semibold">Admin response</p>
                    <p className="mt-2 whitespace-pre-wrap text-sm">
                      {ticket.response}
                    </p>
                  </div>
                )}

                <p className="text-xs text-muted-foreground">
                  Submitted {new Date(ticket.created_at).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
