import { useState, useEffect } from "react";
import { addMinutes } from "date-fns";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useBookingData } from "@/hooks/useBookingData";
import { cn } from "@/lib/utils";
import {
  CreditCard,
  CheckCircle2,
  Timer,
  Tag,
  User,
  Mail,
  Smartphone,
} from "lucide-react";

// ── Types ────────────────────────────────────────────────────────
export interface PaymentModalField {
  key: string;
  label: string;
  placeholder?: string;
  type?: string;
  required?: boolean;
}

export interface PaymentModalData {
  name: string;
  email: string;
  whatsapp: string;
  paymentMethod: "bkash" | "nagad" | "";
  transactionId: string;
  /** Any extra field values keyed by PaymentModalField.key */
  extras: Record<string, string>;
}

export interface PaymentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Dialog title, e.g. "Enroll in React Bootcamp" */
  title: string;
  /** Whether the item is free (skips payment step) */
  isFree: boolean;
  /** Price string to display, e.g. "৳499" or "Free" */
  priceLabel?: string;
  /** Extra form fields beyond Name / Email / WhatsApp */
  extraFields?: PaymentModalField[];
  /** Called with form data when user clicks submit.
   *  The consumer is responsible for the Supabase insert. */
  onSubmit: (data: PaymentModalData) => Promise<void>;
  /** Label for the submit button. Defaults to "Confirm" */
  submitLabel?: string;
  /** Label shown for free items. Defaults to "Confirm Free Booking" */
  freeSubmitLabel?: string;
}

// ── Component ────────────────────────────────────────────────────
const PaymentModal = ({
  open,
  onOpenChange,
  title,
  isFree,
  priceLabel,
  extraFields = [],
  onSubmit,
  submitLabel = "Confirm Booking",
  freeSubmitLabel = "Confirm Free Booking",
}: PaymentModalProps) => {
  const { toast } = useToast();
  const { paymentSettings } = useBookingData();

  // ── Local state ──────────────────────────────────────────────
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [extras, setExtras] = useState<Record<string, string>>({});
  const [paymentMethod, setPaymentMethod] = useState<"bkash" | "nagad" | "">("");
  const [transactionId, setTransactionId] = useState("");
  const [paymentDeadline, setPaymentDeadline] = useState<Date | null>(null);
  const [timeLeft, setTimeLeft] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (!open) {
      // Delay reset so closing animation finishes
      const t = setTimeout(() => {
        setName("");
        setEmail("");
        setWhatsapp("");
        setExtras({});
        setPaymentMethod("");
        setTransactionId("");
        setPaymentDeadline(null);
        setTimeLeft("");
        setSubmitting(false);
        setSuccess(false);
      }, 300);
      return () => clearTimeout(t);
    }
  }, [open]);

  // ── Payment countdown ────────────────────────────────────────
  useEffect(() => {
    if (!paymentDeadline) return;
    const interval = setInterval(() => {
      const now = new Date();
      const diff = paymentDeadline.getTime() - now.getTime();
      if (diff <= 0) {
        setTimeLeft("Expired");
        clearInterval(interval);
        return;
      }
      const mins = Math.floor(diff / 60000);
      const secs = Math.floor((diff % 60000) / 1000);
      setTimeLeft(`${mins}:${secs.toString().padStart(2, "0")}`);
    }, 1000);
    return () => clearInterval(interval);
  }, [paymentDeadline]);

  // ── Helpers ──────────────────────────────────────────────────
  const handleSelectPaymentMethod = (method: "bkash" | "nagad") => {
    setPaymentMethod(method);
    if (!paymentDeadline) {
      const windowMins = paymentSettings?.payment_window_minutes || 30;
      setPaymentDeadline(addMinutes(new Date(), windowMins));
    }
  };

  const handleSubmit = async () => {
    // Validate base fields
    if (!name || !email) {
      toast({ title: "Error", description: "Please fill in Name and Email.", variant: "destructive" });
      return;
    }

    // Validate required extras
    for (const field of extraFields) {
      if (field.required && !extras[field.key]?.trim()) {
        toast({ title: "Error", description: `${field.label} is required.`, variant: "destructive" });
        return;
      }
    }

    // Validate payment for paid items
    if (!isFree) {
      if (!paymentMethod) {
        toast({ title: "Error", description: "Please select a payment method.", variant: "destructive" });
        return;
      }
      if (!transactionId.trim()) {
        toast({ title: "Error", description: "Transaction ID is strictly required. Check your SMS.", variant: "destructive" });
        return;
      }
      if (timeLeft === "Expired") {
        toast({ title: "Error", description: "Payment window has expired. Please close and try again.", variant: "destructive" });
        return;
      }
    }

    setSubmitting(true);
    try {
      await onSubmit({
        name,
        email,
        whatsapp,
        paymentMethod,
        transactionId,
        extras,
      });
      setSuccess(true);
    } catch (err: any) {
      toast({
        title: "Error",
        description: err?.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const isSubmitDisabled =
    submitting ||
    !name ||
    !email ||
    (!isFree && (!paymentMethod || !transactionId.trim())) ||
    timeLeft === "Expired";

  // ── Render ───────────────────────────────────────────────────
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        {success ? (
          /* ── Success View ─────────────────────────────────── */
          <div className="py-10 text-center space-y-6">
            <div className={cn(
              "w-20 h-20 rounded-full flex items-center justify-center mx-auto",
              isFree ? "bg-success-soft" : "bg-primary/10"
            )}>
              <CheckCircle2 className={cn("h-10 w-10", isFree ? "text-success" : "text-primary")} />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-foreground">
                {isFree ? "Confirmed!" : "Booking Submitted!"}
              </h2>
              <p className="text-muted-foreground">
                {isFree
                  ? <>Your spot has been confirmed. We'll send a reminder to <strong>{email}</strong>.</>
                  : <>Your booking has been submitted. We'll verify your payment and send a confirmation to <strong>{email}</strong>.</>
                }
              </p>
            </div>
            {!isFree && transactionId && (
              <div className="bg-muted rounded-lg p-4 text-sm text-left space-y-2 max-w-xs mx-auto">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Transaction ID</span>
                  <span className="font-mono text-foreground">{transactionId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status</span>
                  <Badge className="bg-primary/10 text-primary">Pending Verification</Badge>
                </div>
              </div>
            )}
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
          </div>
        ) : (
          /* ── Form View ──────────────────────────────────── */
          <>
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold">{title}</DialogTitle>
            </DialogHeader>

            <div className="space-y-4 pt-2">
              {/* Base fields */}
              <div className="space-y-1.5">
                <Label className="text-sm font-semibold">Full Name *</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    className="pl-9"
                    placeholder="Your full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-sm font-semibold">Email *</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    className="pl-9"
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-sm font-semibold">WhatsApp Number</Label>
                <div className="relative">
                  <Smartphone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    className="pl-9"
                    placeholder="01XXXXXXXXX"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                  />
                </div>
              </div>

              {/* Extra fields */}
              {extraFields.map((field) => (
                <div key={field.key} className="space-y-1.5">
                  <Label className="text-sm font-semibold">
                    {field.label} {field.required && "*"}
                  </Label>
                  <Input
                    type={field.type || "text"}
                    placeholder={field.placeholder}
                    value={extras[field.key] || ""}
                    onChange={(e) =>
                      setExtras((prev) => ({ ...prev, [field.key]: e.target.value }))
                    }
                  />
                </div>
              ))}

              {/* ── Payment Section (paid only) ─────────────── */}
              {!isFree && (
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Payment Method *</Label>
                  <div className="grid grid-cols-2 gap-3">
                    {(["bkash", "nagad"] as const).map((method) => (
                      <Button
                        key={method}
                        type="button"
                        variant="outline"
                        className={cn(
                          "h-14 text-base font-semibold transition-all",
                          paymentMethod === method
                            ? method === "bkash"
                              ? "border-brand-bkash bg-brand-bkash-soft text-brand-bkash-soft-foreground"
                              : "border-brand-nagad bg-brand-nagad-soft text-brand-nagad-soft-foreground"
                            : "hover:border-primary/40"
                        )}
                        onClick={() => handleSelectPaymentMethod(method)}
                      >
                        <CreditCard className="h-5 w-5 mr-2" />
                        {method === "bkash" ? "bKash" : "Nagad"}
                      </Button>
                    ))}
                  </div>

                  {/* QR / account / txn input */}
                  {paymentMethod && timeLeft !== "Expired" && (
                    <div
                      className={cn(
                        "rounded-xl p-5 border-2 text-center space-y-4 mt-4 animate-in fade-in slide-in-from-top-4",
                        paymentMethod === "bkash"
                          ? "border-brand-bkash/60 bg-brand-bkash-soft"
                          : "border-brand-nagad/60 bg-brand-nagad-soft"
                      )}
                    >
                      <div className="flex justify-between items-center bg-background/60 p-2 rounded-lg backdrop-blur-sm">
                        <div className="flex items-center gap-2 text-sm font-semibold text-destructive">
                          <Timer className="h-4 w-4" />
                          {timeLeft} left to pay
                        </div>
                        {priceLabel && (
                          <h4 className="font-semibold text-foreground text-sm">
                            Fee:{" "}
                            <span className="font-bold text-lg text-primary">
                              {priceLabel}
                            </span>
                          </h4>
                        )}
                      </div>

                      <p className="text-2xl font-mono font-bold text-foreground">
                        {paymentMethod === "bkash"
                          ? paymentSettings?.bkash_number
                          : paymentSettings?.nagad_number}
                      </p>

                      {(paymentMethod === "bkash"
                        ? paymentSettings?.bkash_qr_code
                        : paymentSettings?.nagad_qr_code) && (
                        <div className="mx-auto w-44 h-44 bg-white rounded-xl shadow-sm my-4 overflow-hidden border border-border/50">
                          <img
                            src={
                              paymentMethod === "bkash"
                                ? paymentSettings?.bkash_qr_code!
                                : paymentSettings?.nagad_qr_code!
                            }
                            alt={`${paymentMethod} QR Code`}
                            className="w-full h-full object-cover"
                            loading="lazy"
                            decoding="async"
                          />
                        </div>
                      )}

                      <p className="text-sm font-medium opacity-80 max-w-[280px] mx-auto">
                        Scan the QR code or send money directly with proper
                        details as a reference.
                      </p>

                      {paymentSettings?.additional_instructions && (
                        <p className="text-sm text-muted-foreground pt-2 border-t border-black/10 dark:border-white/10">
                          {paymentSettings.additional_instructions}
                        </p>
                      )}

                      <div className="space-y-1.5 pt-4 text-left">
                        <Label htmlFor="pm-txnId" className="font-semibold text-sm">
                          Enter Transaction ID{" "}
                          <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          id="pm-txnId"
                          value={transactionId}
                          onChange={(e) => setTransactionId(e.target.value)}
                          placeholder="e.g., 9F8G7H6A5B"
                          className="font-mono h-11 uppercase bg-background"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ── Free banner ─────────────────────────────── */}
              {isFree && (
                <div className="flex items-center gap-3 rounded-lg border border-success/30 bg-success-soft p-4">
                  <Tag className="h-5 w-5 text-success flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-success-foreground text-sm">
                      This is Free
                    </p>
                    <p className="text-xs text-success/80 mt-0.5">
                      No payment required. Your booking will be confirmed
                      immediately.
                    </p>
                  </div>
                </div>
              )}

              {/* ── Expired banner ──────────────────────────── */}
              {timeLeft === "Expired" && !isFree && (
                <div className="bg-destructive/10 rounded-lg p-4 text-center">
                  <p className="text-destructive font-semibold">
                    Payment window expired.
                  </p>
                  <Button
                    className="mt-2"
                    variant="outline"
                    onClick={() => {
                      setPaymentMethod("");
                      setPaymentDeadline(null);
                      setTimeLeft("");
                      setTransactionId("");
                    }}
                  >
                    Reset &amp; Try Again
                  </Button>
                </div>
              )}

              {/* ── Submit ──────────────────────────────────── */}
              <div className="pt-2">
                <Button
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                  size="lg"
                  onClick={handleSubmit}
                  disabled={isSubmitDisabled}
                >
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  {submitting
                    ? "Processing..."
                    : isFree
                    ? freeSubmitLabel
                    : submitLabel}
                </Button>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default PaymentModal;
