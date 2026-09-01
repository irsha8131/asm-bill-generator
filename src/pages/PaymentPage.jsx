import { useEffect, useMemo, useState } from "react";
import asmLogo from "../assets/asm-logo.jpeg";

const ActivityLoader = ({ message = "Loading payment details..." }) => (
  <div className="flex flex-col items-center justify-center gap-3 py-16">
    <div className="relative h-10 w-10">
      <div className="absolute inset-0 rounded-full border-2 border-[#D9D3C3]" />
      <div className="absolute inset-0 animate-spin rounded-full border-2 border-[#9C6B30] border-t-transparent" />
    </div>
    <p className="text-[13px] font-semibold text-[#6B6558]">{message}</p>
  </div>
);

export default function PaymentPage({
  quotationId,
  setCurrentStep,
  STEPS,
  formatCurrency,
  supabase,
}) {
  const [quotation, setQuotation] = useState(null);
  const [payments, setPayments] = useState([]);
  const [quotationItems, setQuotationItems] = useState([]);

  const [paymentDate, setPaymentDate] = useState(
    new Date().toISOString().split("T")[0],
  );

  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [notes, setNotes] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showReport, setShowReport] = useState(false);

  const loadQuotation = async () => {
    if (!quotationId) {
      alert("Quotation ID is missing. Please save the quotation first.");
      setCurrentStep(STEPS.BILL);
      return;
    }

    try {
      setLoading(true);

      const { data: quotationData, error: quotationError } = await supabase
        .from("quotations")
        .select("*")
        .eq("id", quotationId)
        .single();

      if (quotationError) throw quotationError;

      const { data: quotationItemsData, error: quotationItemsError } =
        await supabase
          .from("quotation_items")
          .select("id, description, quantity, price, amount, created_at")
          .eq("quotation_id", quotationId)
          .order("created_at", { ascending: true });

      if (quotationItemsError) throw quotationItemsError;

      setQuotationItems(quotationItemsData || []);

      const storedSubtotal = Number(quotationData?.subtotal || 0) || 0;
      const storedDiscount = Math.max(
        Number(quotationData?.discount_amount || 0) || 0,
        0,
      );
      const storedGstRate = Number(quotationData?.gst_rate || 0) || 0;
      const storedGstAmount = Number(quotationData?.gst_amount || 0) || 0;

      let itemSubtotal = storedSubtotal;

      if (itemSubtotal <= 0 && (quotationItemsData || []).length > 0) {
        itemSubtotal = quotationItemsData.reduce((total, item) => {
          const savedAmount = Number(item?.amount);
          if (Number.isFinite(savedAmount) && savedAmount >= 0) {
            return total + savedAmount;
          }
          return total + Number(item?.quantity || 0) * Number(item?.price || 0);
        }, 0);
      }

      const safeDiscount = Math.min(storedDiscount, itemSubtotal);
      const afterDiscount = Math.max(0, itemSubtotal - safeDiscount);
      const calculatedGstAmount =
        storedGstRate > 0
          ? afterDiscount * (storedGstRate / 100)
          : storedGstAmount;

      const calculatedGrandTotal = afterDiscount + calculatedGstAmount;
      const storedGrandTotal = Number(quotationData?.grand_total || 0) || 0;
      const finalGrandTotal =
        calculatedGrandTotal > 0 ? calculatedGrandTotal : storedGrandTotal;

      const finalQuotation = {
        ...quotationData,
        subtotal: itemSubtotal,
        discount_amount: safeDiscount,
        gst_rate: storedGstRate,
        gst_amount: calculatedGstAmount,
        grand_total: finalGrandTotal,
      };

      if (
        finalGrandTotal !== storedGrandTotal ||
        Number(quotationData?.subtotal || 0) !== itemSubtotal ||
        Number(quotationData?.discount_amount || 0) !== safeDiscount ||
        Number(quotationData?.gst_amount || 0) !== calculatedGstAmount
      ) {
        const { error: repairError } = await supabase
          .from("quotations")
          .update({
            subtotal: itemSubtotal,
            discount_amount: safeDiscount,
            gst_rate: storedGstRate,
            gst_amount: calculatedGstAmount,
            grand_total: finalGrandTotal,
          })
          .eq("id", quotationId);

        if (repairError) throw repairError;
      }

      setQuotation(finalQuotation);

      const { data: paymentData, error: paymentError } = await supabase
        .from("payments")
        .select("*")
        .eq("quotation_id", quotationId)
        .order("payment_date", { ascending: false })
        .order("created_at", { ascending: false });

      if (paymentError) throw paymentError;

      setPayments(paymentData || []);
    } catch (error) {
      console.error("Payment page loading error:", error);
      alert(error?.message || "Failed to load quotation payment details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQuotation();
  }, [quotationId]);

  const totalAmount = Math.max(0, Number(quotation?.grand_total || 0) || 0);

  const totalPaid = useMemo(() => {
    return payments.reduce(
      (total, payment) => total + Number(payment.amount || 0),
      0,
    );
  }, [payments]);

  const balance = Math.max(0, totalAmount - totalPaid);

  const getStoredItemAmount = (item) => {
    const savedAmount = Number(item?.amount);
    if (Number.isFinite(savedAmount) && savedAmount >= 0) {
      return savedAmount;
    }
    return Number(item?.quantity || 0) * Number(item?.price || 0);
  };

  const handleAddPayment = async () => {
    if (saving) return;

    const paymentAmount = Number(amount || 0);

    if (paymentAmount <= 0) {
      alert("Please enter a valid payment amount.");
      return;
    }

    if (paymentAmount > balance) {
      alert(
        `Payment cannot be more than the remaining balance of ${formatCurrency(balance)}.`,
      );
      return;
    }

    if (!paymentMethod) {
      alert("Please select a payment method.");
      return;
    }

    try {
      setSaving(true);

      const { error } = await supabase.from("payments").insert({
        quotation_id: quotationId,
        payment_date: paymentDate,
        amount: paymentAmount,
        payment_method: paymentMethod,
        notes: String(notes || "").trim() || null,
      });

      if (error) throw error;

      setAmount("");
      setNotes("");
      await loadQuotation();
      alert("Payment added successfully.");
    } catch (error) {
      console.error("Add payment error:", error);
      alert(error?.message || "Failed to save payment.");
    } finally {
      setSaving(false);
    }
  };

  const handleDeletePayment = async (paymentId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this payment?",
    );

    if (!confirmed) return;

    try {
      const { error } = await supabase
        .from("payments")
        .delete()
        .eq("id", paymentId);

      if (error) throw error;

      await loadQuotation();
      alert("Payment deleted successfully.");
    } catch (error) {
      console.error("Delete payment error:", error);
      alert(error?.message || "Failed to delete payment.");
    }
  };

  // TIMEZONE-SAFE DATE FORMATTER
  const formatReportDate = (value) => {
    if (!value) return "-";
    
    // If format is YYYY-MM-DD
    if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
      const [year, month, day] = value.split("-");
      const localDate = new Date(Number(year), Number(month) - 1, Number(day));
      return localDate.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    }

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return String(value);

    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // The exact date saved with the quotation
  const displayQuotationDate = formatReportDate(
    quotation?.quotation_date || quotation?.created_at
  );

  const openReport = () => {
    setShowReport(true);
  };

  const printReport = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F5F2EA] px-4">
        <div className="rounded-[4px] border border-[#D9D3C3] bg-white px-8 py-6 shadow-sm">
          <ActivityLoader message="Loading payment details..." />
        </div>
      </div>
    );
  }

  return (
    <>
      <style>{`
        @media print {
          body {
            background: white !important;
          }
          body > * {
            background: white !important;
          }
          body * {
            visibility: hidden !important;
          }
          #payment-report,
          #payment-report * {
            visibility: visible !important;
          }
          #payment-report {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            max-width: none !important;
            margin: 0 !important;
            box-shadow: none !important;
          }
          @page {
            size: A4;
            margin: 10mm;
          }
        }
      `}</style>

      <div className="min-h-screen bg-[#F5F2EA] text-[#1E2A38]">
        {/* HEADER */}
        <header className="sticky top-0 z-30 border-b border-[#1E2A38] bg-[#1E2A38]">
          <div className="mx-auto flex max-w-[1000px] items-center justify-between px-4 sm:px-6 py-4">
            <div>
              <p className="text-[10.5px] sm:text-[11px] font-semibold tracking-[0.12em] text-[#9C6B30]">
                Payment Tracking
              </p>
              <h1 className="mt-1 font-serif text-[20px] sm:text-2xl font-bold text-[#F4E9D8]">
                Paid Bill
              </h1>
            </div>

            <button
              type="button"
              onClick={() => setCurrentStep(STEPS.BILL)}
              className="rounded-[3px] border border-[#3A4A5E] bg-transparent px-3.5 sm:px-4 py-2 text-[12px] sm:text-[13px] font-semibold text-[#C9D2DB] transition-colors duration-150 hover:bg-[#0F1926]"
            >
              ← Back to Bill
            </button>
          </div>
        </header>

        {/* MAIN BODY */}
        <main className="mx-auto max-w-[1000px] px-4 py-6 sm:px-6 sm:py-8">
          {/* CUSTOMER & QUOTATION SUMMARY CARD */}
          <div className="mb-6 rounded-[4px] border border-[#D9D3C3] bg-white p-5 sm:p-6 shadow-sm">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
              <div>
                <p className="text-[10.5px] sm:text-[11px] font-semibold tracking-[0.1em] text-[#9C6B30]">
                  Customer
                </p>

                <h2 className="mt-1 font-serif text-lg sm:text-xl font-bold text-[#1E2A38]">
                  {quotation?.client_shop_name ||
                    quotation?.client_name ||
                    "Customer"}
                </h2>

                {quotation?.client_name && quotation?.client_shop_name && (
                  <p className="mt-0.5 text-[12.5px] sm:text-[13px] text-[#6B6558]">
                    {quotation.client_name}
                  </p>
                )}

                {quotation?.client_phone && (
                  <p className="mt-1 text-[12px] sm:text-[13px] text-[#6B6558]">
                    {quotation.client_phone}
                  </p>
                )}
              </div>

              <div className="text-left sm:text-right">
                <p className="text-[10.5px] sm:text-[11px] font-semibold tracking-[0.1em] text-[#9C6B30]">
                  Quotation Code
                </p>

                <p className="mt-1 font-serif text-[16px] sm:text-[18px] font-bold tabular-nums text-[#1E2A38]">
                  #{quotation?.quotation_number}
                </p>
              </div>
            </div>
          </div>

          {/* THREE STATS CARDS */}
          <div className="grid gap-3.5 sm:gap-4 grid-cols-1 sm:grid-cols-3">
            <div className="rounded-[4px] border border-[#D9D3C3] bg-white p-5 sm:p-6">
              <p className="text-[10.5px] sm:text-[11px] font-semibold tracking-[0.1em] text-[#9C6B30]">
                Total Bill
              </p>
              <p className="mt-2.5 font-serif text-[22px] sm:text-2xl font-bold tabular-nums text-[#1E2A38]">
                {formatCurrency(totalAmount)}
              </p>
            </div>

            <div className="rounded-[4px] border border-[#D9D3C3] bg-white p-5 sm:p-6">
              <p className="text-[10.5px] sm:text-[11px] font-semibold tracking-[0.1em] text-[#9C6B30]">
                Total Paid
              </p>
              <p className="mt-2.5 font-serif text-[22px] sm:text-2xl font-bold tabular-nums text-[#3F6B4A]">
                {formatCurrency(totalPaid)}
              </p>
            </div>

            <div className="rounded-[4px] border border-[#D9D3C3] bg-white p-5 sm:p-6">
              <p className="text-[10.5px] sm:text-[11px] font-semibold tracking-[0.1em] text-[#9C6B30]">
                Balance
              </p>
              <p
                className={`mt-2.5 font-serif text-[22px] sm:text-2xl font-bold tabular-nums ${
                  balance === 0 ? "text-[#3F6B4A]" : "text-[#B24A3C]"
                }`}
              >
                {formatCurrency(balance)}
              </p>
            </div>
          </div>

          {/* STATUS BANNER */}
          <div className="mt-4 sm:mt-5">
            {balance === 0 ? (
              <div className="rounded-[3px] border border-[#CFE0D2] bg-[#F2F7F3] px-4 sm:px-5 py-3 sm:py-4">
                <p className="text-[12.5px] sm:text-[13px] font-semibold text-[#3F6B4A]">
                  ✓ Fully Paid
                </p>
              </div>
            ) : (
              <div className="rounded-[3px] border border-[#E5D3B3] bg-[#FBF4E8] px-4 sm:px-5 py-3 sm:py-4">
                <p className="text-[12.5px] sm:text-[13px] font-semibold text-[#8A6220]">
                  Partially Paid — Balance {formatCurrency(balance)}
                </p>
              </div>
            )}
          </div>

          {/* RECORD PAYMENT FORM */}
          {balance > 0 && (
            <div className="mt-6 overflow-hidden rounded-[4px] border border-[#D9D3C3] bg-white shadow-sm">
              <div className="border-b border-[#D9D3C3] bg-[#FAF8F2] p-5 sm:p-6">
                <h2 className="font-serif text-[17px] sm:text-lg font-bold text-[#1E2A38]">
                  Record Payment
                </h2>
                <p className="mt-0.5 text-[12px] sm:text-[13px] text-[#6B6558]">
                  Add the amount received from the customer.
                </p>
              </div>

              <div className="grid gap-4 sm:gap-5 p-5 sm:p-6 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 sm:mb-2 block text-[12.5px] font-semibold text-[#5B5647]">
                    Payment Date
                  </label>
                  <input
                    type="date"
                    value={paymentDate}
                    onChange={(e) => setPaymentDate(e.target.value)}
                    className="h-[46px] sm:h-[48px] w-full rounded-[3px] border border-[#D9D3C3] bg-white px-3.5 text-[14.5px] sm:text-[15px] font-medium tabular-nums text-[#1E2A38] outline-none transition-colors duration-150 focus:border-[#9C6B30] focus:ring-1 focus:ring-[#9C6B30]/30"
                  />
                </div>

                <div>
                  <label className="mb-1.5 sm:mb-2 block text-[12.5px] font-semibold text-[#5B5647]">
                    Amount Received
                  </label>

                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[15px] font-medium text-[#B3AC98]">
                      ₹
                    </span>
                    <input
                      type="number"
                      min="0"
                      max={balance}
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="50000"
                      className="h-[46px] sm:h-[48px] w-full rounded-[3px] border border-[#D9D3C3] bg-white px-3.5 pl-8 text-[14.5px] sm:text-[15px] font-semibold tabular-nums text-[#1E2A38] outline-none transition-colors duration-150 focus:border-[#9C6B30] focus:ring-1 focus:ring-[#9C6B30]/30"
                    />
                  </div>

                  <p className="mt-1.5 text-[11.5px] sm:text-[12px] text-[#8A8371]">
                    Maximum: {formatCurrency(balance)}
                  </p>
                </div>

                <div>
                  <label className="mb-1.5 sm:mb-2 block text-[12.5px] font-semibold text-[#5B5647]">
                    Payment Method
                  </label>

                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="h-[46px] sm:h-[48px] w-full rounded-[3px] border border-[#D9D3C3] bg-white px-3.5 text-[14.5px] sm:text-[15px] font-semibold text-[#1E2A38] outline-none transition-colors duration-150 focus:border-[#9C6B30] focus:ring-1 focus:ring-[#9C6B30]/30"
                  >
                    <option value="Cash">Cash</option>
                    <option value="UPI">UPI</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="Cheque">Cheque</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1.5 sm:mb-2 block text-[12.5px] font-semibold text-[#5B5647]">
                    Notes
                  </label>

                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Advance / Token payment"
                    className="h-[46px] sm:h-[48px] w-full rounded-[3px] border border-[#D9D3C3] bg-white px-3.5 text-[14.5px] sm:text-[15px] text-[#1E2A38] outline-none transition-colors duration-150 focus:border-[#9C6B30] focus:ring-1 focus:ring-[#9C6B30]/30"
                  />
                </div>

                <div className="sm:col-span-2 pt-2">
                  <button
                    type="button"
                    onClick={handleAddPayment}
                    disabled={saving}
                    className="h-[48px] w-full rounded-[3px] bg-[#1E2A38] px-6 text-[14px] font-semibold text-white transition-colors duration-150 hover:bg-[#0F1926] disabled:cursor-not-allowed disabled:opacity-60 flex items-center justify-center gap-2"
                  >
                    {saving ? (
                      <>
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        Saving Payment...
                      </>
                    ) : (
                      "Add Payment"
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* PAYMENT HISTORY */}
          <div className="mt-6 overflow-hidden rounded-[4px] border border-[#D9D3C3] bg-white shadow-sm">
            <div className="border-b border-[#D9D3C3] bg-[#FAF8F2] p-5 sm:p-6">
              <h2 className="font-serif text-[17px] sm:text-lg font-bold text-[#1E2A38]">
                Payment History
              </h2>
              <p className="mt-0.5 text-[12px] sm:text-[13px] text-[#6B6558]">
                Every payment received for this quotation.
              </p>
            </div>

            {payments.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-[13px] font-semibold text-[#8A8371]">
                  No payments recorded yet.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[550px] border-collapse">
                  <thead>
                    <tr className="border-b border-[#D9D3C3] bg-[#FAF8F2]">
                      <th className="px-5 py-3.5 text-left text-[11px] font-semibold tracking-[0.06em] text-[#8A8371]">
                        #
                      </th>
                      <th className="px-5 py-3.5 text-left text-[11px] font-semibold tracking-[0.06em] text-[#8A8371]">
                        Date
                      </th>
                      <th className="px-5 py-3.5 text-left text-[11px] font-semibold tracking-[0.06em] text-[#8A8371]">
                        Method
                      </th>
                      <th className="px-5 py-3.5 text-right text-[11px] font-semibold tracking-[0.06em] text-[#8A8371]">
                        Amount
                      </th>
                      <th className="px-5 py-3.5 text-right text-[11px] font-semibold tracking-[0.06em] text-[#8A8371]">
                        Action
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {payments.map((payment, index) => (
                      <tr
                        key={payment.id}
                        className="border-b border-[#EDE8DA]"
                      >
                        <td className="px-5 py-3.5 text-[12.5px] font-semibold tabular-nums text-[#A9A28E]">
                          {index + 1}
                        </td>
                        <td className="px-5 py-3.5 text-[12.5px] font-semibold tabular-nums text-[#3A362C]">
                          {formatReportDate(payment.payment_date)}
                        </td>
                        <td className="px-5 py-3.5">
                          <span className="rounded-[3px] border border-[#D9D3C3] px-2.5 py-1 text-[11px] font-semibold text-[#5B5647]">
                            {payment.payment_method}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-right text-[13px] font-bold tabular-nums text-[#3F6B4A]">
                          {formatCurrency(payment.amount)}
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          <button
                            type="button"
                            onClick={() => handleDeletePayment(payment.id)}
                            className="text-[12px] font-semibold text-[#B24A3C] transition-colors duration-150 hover:text-[#8C3A2F]"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="border-t border-[#D9D3C3] bg-[#FAF8F2] p-5 sm:p-6">
              <div className="ml-auto max-w-sm space-y-2.5">
                <div className="flex justify-between text-[13px]">
                  <span className="text-[#6B6558]">Total Bill</span>
                  <span className="font-semibold tabular-nums text-[#1E2A38]">
                    {formatCurrency(totalAmount)}
                  </span>
                </div>

                <div className="flex justify-between text-[13px]">
                  <span className="text-[#6B6558]">Total Paid</span>
                  <span className="font-semibold tabular-nums text-[#3F6B4A]">
                    {formatCurrency(totalPaid)}
                  </span>
                </div>

                <div className="flex justify-between border-t border-[#D9D3C3] pt-2.5">
                  <span className="font-serif font-bold text-[#1E2A38]">
                    Balance
                  </span>
                  <span
                    className={`font-serif font-bold tabular-nums ${
                      balance === 0 ? "text-[#3F6B4A]" : "text-[#B24A3C]"
                    }`}
                  >
                    {formatCurrency(balance)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* ACTION BUTTONS */}
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <button
              type="button"
              onClick={() => setCurrentStep(STEPS.BILL)}
              className="rounded-[3px] border border-[#D9D3C3] bg-white px-5 py-3 text-[13px] font-semibold text-[#1E2A38] transition-colors duration-150 hover:bg-[#F0ECE0]"
            >
              ← Back to Bill Preview
            </button>

            <button
              type="button"
              onClick={openReport}
              className="rounded-[3px] bg-[#9C6B30] px-6 py-3 text-[13px] font-semibold text-white transition-colors duration-150 hover:bg-[#7F5525]"
            >
              View Report
            </button>
          </div>

          {/* REPORT MODAL */}
          {showReport && (
            <div className="fixed inset-0 z-50 overflow-y-auto bg-[#1E2A38]/60 p-3 sm:p-6 print:static print:bg-white print:p-0">
              <div className="mx-auto w-full max-w-[900px]">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3 print:hidden">
                  <button
                    type="button"
                    onClick={() => setShowReport(false)}
                    className="rounded-[3px] border border-[#D9D3C3] bg-white px-4 py-2 text-[12.5px] font-semibold text-[#1E2A38] transition-colors duration-150 hover:bg-[#F0ECE0]"
                  >
                    ← Close Report
                  </button>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={printReport}
                      className="rounded-[3px] border border-[#D9D3C3] bg-white px-4 py-2 text-[12.5px] font-semibold text-[#1E2A38] transition-colors duration-150 hover:bg-[#F0ECE0]"
                    >
                      🖨 Print Report
                    </button>

                    <button
                      type="button"
                      onClick={printReport}
                      className="rounded-[3px] bg-[#1E2A38] px-4 py-2 text-[12.5px] font-semibold text-white transition-colors duration-150 hover:bg-[#0F1926]"
                    >
                      ↓ Save PDF
                    </button>
                  </div>
                </div>

                <section
                  id="payment-report"
                  className="overflow-hidden bg-white text-[#1E2A38] print:shadow-none"
                >
                  {/* =========================================================
                      HEADER: LEFT COMPANY INFO + RIGHT BOX WITH ASM LOGO INSIDE
                  ========================================================= */}
                  <div className="border-b-2 border-[#1E2A38] px-6 py-6 sm:px-10 sm:py-8">
                    <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                      {/* COMPANY INFO (LEFT SIDE) */}
                      <div className="min-w-0">
                        <p className="text-[10px] font-semibold tracking-[0.16em] text-[#9C6B30]">
                          Payment Report
                        </p>
                        <h1 className="mt-1.5 font-serif text-2xl sm:text-3xl font-bold tracking-tight text-[#1E2A38]">
                          {quotation?.shop_name || "ASM INTERIORS"}
                        </h1>

                        <div className="mt-2.5 max-w-xl space-y-0.5 text-[11.5px] sm:text-[12px] leading-5 text-[#6B6558]">
                          {quotation?.shop_address && (
                            <p>{quotation.shop_address}</p>
                          )}
                          {quotation?.shop_phone && (
                            <p>Phone: {quotation.shop_phone}</p>
                          )}
                          {quotation?.shop_email && (
                            <p>Email: {quotation.shop_email}</p>
                          )}
                          {quotation?.shop_gst && (
                            <p>GST: {quotation.shop_gst}</p>
                          )}
                        </div>
                      </div>

                      {/* RIGHT BOX WITH ASM LOGO INSIDE & BILL PREVIEW DATE */}
                      <div className="shrink-0 rounded-[4px] border border-[#D9D3C3] bg-[#FAF8F2] px-3.5 py-2.5 flex items-center gap-3">
                        <div className="flex h-[44px] w-[44px] shrink-0 items-center justify-center overflow-hidden rounded-[3px] border border-[#D9D3C3] bg-black">
                          <img
                            src={asmLogo}
                            alt="ASM Interiors"
                            crossOrigin="anonymous"
                            className="h-full w-full object-contain"
                          />
                        </div>

                        <div className="text-right leading-tight">
                          <p className="text-[8.5px] font-bold tracking-[0.14em] text-[#9C6B30]">
                            QUOTATION
                          </p>
                          <p className="font-serif text-[15px] font-bold tabular-nums text-[#1E2A38]">
                            #{quotation?.quotation_number || "-"}
                          </p>
                          <p className="text-[10px] text-[#8A8371]">
                            {displayQuotationDate}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* BILL TO & REPORT DETAILS */}
                  <div className="grid border-b border-[#D9D3C3] sm:grid-cols-2">
                    <div className="border-b border-[#D9D3C3] px-6 py-5 sm:border-b-0 sm:border-r sm:px-10">
                      <p className="text-[9px] font-semibold tracking-[0.16em] text-[#9C6B30]">
                        Bill To
                      </p>

                      <h2 className="mt-1.5 font-serif text-base sm:text-lg font-bold text-[#1E2A38]">
                        {quotation?.client_shop_name ||
                          quotation?.client_name ||
                          "Customer"}
                      </h2>

                      {quotation?.client_name &&
                        quotation?.client_shop_name && (
                          <p className="mt-0.5 text-[12.5px] font-semibold text-[#3A362C]">
                            {quotation.client_name}
                          </p>
                        )}

                      <div className="mt-2.5 space-y-0.5 text-[11.5px] leading-5 text-[#6B6558]">
                        {quotation?.client_address && (
                          <p>{quotation.client_address}</p>
                        )}
                        {quotation?.client_phone && (
                          <p>Phone: {quotation.client_phone}</p>
                        )}
                        {quotation?.client_email && (
                          <p>Email: {quotation.client_email}</p>
                        )}
                        {quotation?.client_gst && (
                          <p>GST: {quotation.client_gst}</p>
                        )}
                      </div>
                    </div>

                    <div className="px-6 py-5 sm:px-10">
                      <p className="text-[9px] font-semibold tracking-[0.16em] text-[#9C6B30]">
                        Report Details
                      </p>

                      <div className="mt-2.5 space-y-2 text-[12px]">
                        <div className="flex items-center justify-between">
                          <span className="text-[#8A8371]">
                            Report Generated
                          </span>
                          <span className="font-semibold tabular-nums text-[#3A362C]">
                            {displayQuotationDate}
                          </span>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-[#8A8371]">Prepared By</span>
                          <span className="font-semibold text-[#3A362C]">
                            ASM INTERIORS
                          </span>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-[#8A8371]">
                            Payments Recorded
                          </span>
                          <span className="font-semibold tabular-nums text-[#3A362C]">
                            {payments.length}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* SUMMARY & TOTALS */}
                  <div className="px-6 py-6 sm:px-10">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                      <div>
                        <p className="text-[9px] font-semibold tracking-[0.16em] text-[#9C6B30]">
                          Payment Status
                        </p>
                        <h2 className="mt-1 font-serif text-lg sm:text-xl font-bold text-[#1E2A38]">
                          {balance === 0
                            ? "Payment Completed"
                            : "Payment Pending"}
                        </h2>
                      </div>

                      <span
                        className={`inline-flex w-fit rounded-[3px] border px-3 py-1 text-[10px] font-semibold ${
                          balance === 0
                            ? "border-[#CFE0D2] bg-[#F2F7F3] text-[#3F6B4A]"
                            : "border-[#E5D3B3] bg-[#FBF4E8] text-[#8A6220]"
                        }`}
                      >
                        {balance === 0 ? "FULLY PAID" : "BALANCE DUE"}
                      </span>
                    </div>

                    <div className="mt-4 grid gap-3 sm:grid-cols-3">
                      <div className="rounded-[3px] border border-[#D9D3C3] bg-[#FAF8F2] p-4">
                        <p className="text-[9px] font-semibold tracking-[0.13em] text-[#9C6B30]">
                          Total Bill
                        </p>
                        <p className="mt-1.5 font-serif text-lg sm:text-xl font-bold tabular-nums text-[#1E2A38]">
                          {formatCurrency(totalAmount)}
                        </p>
                      </div>

                      <div className="rounded-[3px] border border-[#CFE0D2] bg-[#F2F7F3] p-4">
                        <p className="text-[9px] font-semibold tracking-[0.13em] text-[#4B7A55]">
                          Customer Paid
                        </p>
                        <p className="mt-1.5 font-serif text-lg sm:text-xl font-bold tabular-nums text-[#3F6B4A]">
                          {formatCurrency(totalPaid)}
                        </p>
                      </div>

                      <div
                        className={`rounded-[3px] border p-4 ${
                          balance === 0
                            ? "border-[#CFE0D2] bg-[#F2F7F3]"
                            : "border-[#E5D3B3] bg-[#FBF4E8]"
                        }`}
                      >
                        <p
                          className={`text-[9px] font-semibold tracking-[0.13em] ${
                            balance === 0 ? "text-[#4B7A55]" : "text-[#8A6220]"
                          }`}
                        >
                          Balance to Pay
                        </p>
                        <p
                          className={`mt-1.5 font-serif text-lg sm:text-xl font-bold tabular-nums ${
                            balance === 0 ? "text-[#3F6B4A]" : "text-[#8A6220]"
                          }`}
                        >
                          {formatCurrency(balance)}
                        </p>
                      </div>
                    </div>

                    {/* ITEMS TABLE */}
                    <div className="mt-7">
                      <p className="text-[9px] font-semibold tracking-[0.16em] text-[#9C6B30]">
                        Quotation Items
                      </p>
                      <h3 className="mt-0.5 font-serif text-base sm:text-lg font-bold text-[#1E2A38]">
                        Items Billed
                      </h3>

                      <div className="mt-3 overflow-x-auto rounded-[3px] border border-[#D9D3C3]">
                        <table className="w-full min-w-[520px] border-collapse">
                          <thead>
                            <tr className="bg-[#FAF8F2]">
                              <th className="border-b border-[#D9D3C3] px-3.5 py-2.5 text-left text-[9px] font-semibold tracking-[0.08em] text-[#8A8371]">
                                #
                              </th>
                              <th className="border-b border-[#D9D3C3] px-3.5 py-2.5 text-left text-[9px] font-semibold tracking-[0.08em] text-[#8A8371]">
                                Description
                              </th>
                              <th className="border-b border-[#D9D3C3] px-3.5 py-2.5 text-right text-[9px] font-semibold tracking-[0.08em] text-[#8A8371]">
                                Qty
                              </th>
                              <th className="border-b border-[#D9D3C3] px-3.5 py-2.5 text-right text-[9px] font-semibold tracking-[0.08em] text-[#8A8371]">
                                Unit Price
                              </th>
                              <th className="border-b border-[#D9D3C3] px-3.5 py-2.5 text-right text-[9px] font-semibold tracking-[0.08em] text-[#8A8371]">
                                Amount
                              </th>
                            </tr>
                          </thead>

                          <tbody>
                            {quotationItems.map((item, index) => (
                              <tr key={item.id || index}>
                                <td className="border-b border-[#EDE8DA] px-3.5 py-2.5 text-[11.5px] font-semibold tabular-nums text-[#A9A28E]">
                                  {index + 1}
                                </td>
                                <td className="border-b border-[#EDE8DA] px-3.5 py-2.5 text-[11.5px] font-semibold text-[#3A362C]">
                                  {item.description || "Interior work"}
                                </td>
                                <td className="border-b border-[#EDE8DA] px-3.5 py-2.5 text-right text-[11.5px] tabular-nums text-[#5B5647]">
                                  {item.quantity}
                                </td>
                                <td className="border-b border-[#EDE8DA] px-3.5 py-2.5 text-right text-[11.5px] tabular-nums text-[#5B5647]">
                                  {formatCurrency(item.price)}
                                </td>
                                <td className="border-b border-[#EDE8DA] px-3.5 py-2.5 text-right text-[11.5px] font-bold tabular-nums text-[#1E2A38]">
                                  {formatCurrency(getStoredItemAmount(item))}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    <div className="mt-8 border-t border-[#D9D3C3] pt-4 text-center">
                      <p className="text-[12px] font-semibold text-[#3A362C]">
                        Thank you for your business.
                      </p>
                      <p className="mt-0.5 text-[10px] text-[#8A8371]">
                        Payment report generated for ASM INTERIORS Quotation #
                        {quotation?.quotation_number}.
                      </p>
                    </div>
                  </div>
                </section>
              </div>
            </div>
          )}
        </main>
      </div>
    </>
  );
}