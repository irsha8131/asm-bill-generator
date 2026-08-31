import { useMemo, useState } from "react";
import asmLogo from "../assets/asm-logo.jpeg";

const ActivityLoader = ({ message = "Loading saved quotations..." }) => (
  <div className="flex flex-col items-center justify-center gap-3 py-16">
    <div className="relative h-10 w-10">
      <div className="absolute inset-0 rounded-full border-2 border-[#D9D3C3]" />
      <div className="absolute inset-0 animate-spin rounded-full border-2 border-[#9C6B30] border-t-transparent" />
    </div>
    <p className="text-[13px] font-semibold text-[#6B6558]">{message}</p>
  </div>
);

export default function AllQuotationsPage({
  existingQuotations = [],
  quotationsLoading = false,
  onOpenQuotation,
  onBack,
  onRefresh,
}) {
  const [search, setSearch] = useState("");

  const filteredQuotations = useMemo(() => {
    const term = search.trim().toLowerCase();

    if (!term) {
      return existingQuotations;
    }

    return existingQuotations.filter((quotation) => {
      const haystack = [
        quotation.quotation_number,
        quotation.client_shop_name,
        quotation.client_name,
        quotation.client_phone,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return haystack.includes(term);
    });
  }, [existingQuotations, search]);

  return (
    <div className="min-h-screen bg-[#F5F2EA] text-[#1E2A38]">
      {/* HEADER */}
      <header className="sticky top-0 z-30 border-b border-[#1E2A38] bg-[#1E2A38]">
        <div className="mx-auto flex h-[64px] sm:h-[70px] max-w-[1140px] items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3 sm:gap-3.5">
            <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center overflow-hidden rounded-[3px] border border-[#3A4A5E] bg-black">
              <img
                src={asmLogo}
                alt="ASM Interiors"
                className="h-full w-full object-contain"
              />
            </div>

            <div className="leading-none">
              <h1 className="font-serif text-[15px] sm:text-[17px] font-bold tracking-tight text-[#F4E9D8]">
                ASM Interiors
              </h1>
              <p className="mt-1 sm:mt-1.5 text-[9px] sm:text-[10px] font-medium tracking-[0.1em] text-[#8FA0B3]">
                Quotation &amp; Billing
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onBack}
            className="inline-flex h-[38px] sm:h-10 items-center justify-center gap-1.5 rounded-[3px] border border-[#3A4A5E] bg-transparent px-3 sm:px-4 text-[12px] sm:text-[13px] font-semibold text-[#C9D2DB] transition-colors duration-150 hover:bg-[#0F1926]"
          >
            ← Back
          </button>
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <main className="mx-auto w-full max-w-[1140px] px-4 py-6 sm:px-6 sm:py-9 lg:py-12">
        <div className="mb-6 sm:mb-8 flex flex-col justify-between gap-4 border-b-2 border-[#1E2A38] pb-5 sm:pb-6 sm:flex-row sm:items-end">
          <div>
            <p className="mb-1.5 sm:mb-2 text-[10.5px] sm:text-[11px] font-semibold tracking-[0.12em] text-[#9C6B30]">
              Quotation Management
            </p>

            <h2 className="font-serif text-[28px] sm:text-[36px] lg:text-[40px] font-bold tracking-tight text-[#1E2A38]">
              All quotations
            </h2>

            <p className="mt-1.5 sm:mt-2 max-w-xl text-[13px] sm:text-[14px] leading-relaxed text-[#6B6558]">
              Review saved quotations, check payments received, or open an existing quote to manage its ledger.
            </p>
          </div>

          <div className="whitespace-nowrap font-serif text-[12px] sm:text-[13px] text-[#6B6558]">
            <span className="font-bold text-[#1E2A38]">
              {existingQuotations.length}
            </span>{" "}
            total
          </div>
        </div>

        {/* SEARCH & REFRESH BAR */}
        <section className="overflow-hidden rounded-[4px] border border-[#D9D3C3] bg-white shadow-sm">
          <div className="flex flex-col gap-3.5 border-b border-[#D9D3C3] bg-[#FAF8F2] p-4 sm:p-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative w-full sm:max-w-xs">
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8A8371]"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" />
              </svg>

              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name, code, phone..."
                className="h-[44px] sm:h-[46px] w-full rounded-[3px] border border-[#D9D3C3] bg-white pl-10 pr-4 text-[13px] font-medium text-[#1E2A38] placeholder:text-[#B3AC98] outline-none transition-colors duration-150 focus:border-[#9C6B30] focus:ring-1 focus:ring-[#9C6B30]/30"
              />
            </div>

            <button
              type="button"
              onClick={onRefresh}
              disabled={quotationsLoading}
              className="inline-flex h-[44px] sm:h-[46px] shrink-0 items-center justify-center gap-2 rounded-[3px] border border-[#1E2A38] bg-white px-4 text-[12.5px] font-semibold text-[#1E2A38] transition-colors duration-150 hover:bg-[#1E2A38] hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              {quotationsLoading ? (
                <>
                  <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-[#1E2A38] border-t-transparent" />
                  Refreshing...
                </>
              ) : (
                "↻ Refresh"
              )}
            </button>
          </div>

          <div className="p-3.5 sm:p-5">
            {quotationsLoading ? (
              <ActivityLoader message="Loading saved quotations from database..." />
            ) : filteredQuotations.length === 0 ? (
              <div className="rounded-[3px] border border-dashed border-[#D9D3C3] bg-[#FAF8F2] px-4 py-12 text-center">
                <div className="mx-auto flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-[3px] border border-[#D9D3C3] bg-white text-[#9C6B30]">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                    <path d="M6 2h9l3 3v17H6z" />
                    <path d="M14 2v4h4" />
                    <path d="M9 12h6M9 16h6" />
                  </svg>
                </div>

                <p className="mt-3 text-[13px] font-bold text-[#1E2A38]">
                  {existingQuotations.length === 0
                    ? "No saved quotations yet"
                    : "No quotations match your search"}
                </p>

                <p className="mt-1 text-[11px] text-[#8A8371]">
                  {existingQuotations.length === 0
                    ? "Your saved quotations will appear here."
                    : "Try searching with a customer name, shop or phone number."}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredQuotations.map((quotation) => {
                  const total = Number(quotation.grand_total || 0);
                  const paid = Number(quotation.total_paid || 0);
                  const balance = Math.max(0, total - paid);
                  const isPaid = balance <= 0 && total > 0;

                  return (
                    <div
                      key={quotation.id}
                      className="rounded-[3px] border border-[#D9D3C3] bg-white p-4 sm:p-5 transition-colors duration-150 hover:border-[#9C6B30]"
                    >
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="rounded-[3px] border border-[#1E2A38] bg-[#1E2A38] px-2.5 py-1 text-[11px] font-semibold tabular-nums text-[#F4E9D8]">
                              #{quotation.quotation_number || "Quotation"}
                            </span>
                            <span
                              className={`rounded-[3px] border px-2.5 py-1 text-[10px] font-semibold ${
                                isPaid
                                  ? "border-[#CFE0D2] bg-[#F2F7F3] text-[#3F6B4A]"
                                  : "border-[#E5D3B3] bg-[#FBF4E8] text-[#8A6220]"
                              }`}
                            >
                              {isPaid ? "Paid" : "Balance due"}
                            </span>
                          </div>

                          <h4 className="mt-2.5 truncate font-serif text-[15px] sm:text-[16px] font-bold text-[#1E2A38]">
                            {quotation.client_shop_name ||
                              quotation.client_name ||
                              "Customer"}
                          </h4>

                          <p className="mt-0.5 truncate text-[12px] text-[#6B6558]">
                            {quotation.client_name || "No client name"}
                            {quotation.client_phone
                              ? ` • ${quotation.client_phone}`
                              : ""}
                          </p>
                        </div>

                        <div className="grid grid-cols-3 gap-2 sm:gap-3 lg:min-w-[420px]">
                          <div className="rounded-[3px] border border-dashed border-[#D9D3C3] bg-[#FAF8F2] p-2.5 sm:p-3">
                            <p className="text-[9px] font-semibold tracking-[0.1em] text-[#9C6B30]">
                              Total
                            </p>
                            <p className="mt-1 text-[12.5px] sm:text-[14px] font-bold tabular-nums text-[#1E2A38]">
                              ₹{total.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                            </p>
                          </div>

                          <div className="rounded-[3px] border border-dashed border-[#D9D3C3] bg-[#FAF8F2] p-2.5 sm:p-3">
                            <p className="text-[9px] font-semibold tracking-[0.1em] text-[#9C6B30]">
                              Paid
                            </p>
                            <p className="mt-1 text-[12.5px] sm:text-[14px] font-bold tabular-nums text-[#3F6B4A]">
                              ₹{paid.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                            </p>
                          </div>

                          <div className="rounded-[3px] border border-dashed border-[#D9D3C3] bg-[#FAF8F2] p-2.5 sm:p-3">
                            <p className="text-[9px] font-semibold tracking-[0.1em] text-[#9C6B30]">
                              Balance
                            </p>
                            <p
                              className={`mt-1 text-[12.5px] sm:text-[14px] font-bold tabular-nums ${
                                balance > 0 ? "text-[#8A6220]" : "text-[#3F6B4A]"
                              }`}
                            >
                              ₹{balance.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                            </p>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => onOpenQuotation(quotation.id)}
                          className="inline-flex h-10 w-full sm:w-auto shrink-0 items-center justify-center gap-2 rounded-[3px] border border-[#1E2A38] bg-white px-4 text-[12px] font-semibold text-[#1E2A38] transition-colors duration-150 hover:bg-[#1E2A38] hover:text-white"
                        >
                          Open
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M5 12h14" />
                            <path d="m13 6 6 6-6 6" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}