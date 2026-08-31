import { useState } from "react";
import asmLogo from "../assets/asm-logo.jpeg";


const ActivityLoader = ({ message = "Loading..." }) => (
  <div className="flex flex-col items-center justify-center gap-3 py-10">
    <div className="relative h-9 w-9">
      <div className="absolute inset-0 rounded-full border-2 border-[#D9D3C3]" />
      <div className="absolute inset-0 animate-spin rounded-full border-2 border-[#9C6B30] border-t-transparent" />
    </div>
    <p className="text-[12.5px] font-semibold text-[#6B6558]">{message}</p>
  </div>
);


const InputField = ({
  label,
  name,
  value,
  onChange,
  placeholder,
  type = "text",
}) => {
  return (
    <div className="space-y-1.5 sm:space-y-2">
      <label
        htmlFor={name}
        className="block text-[12.5px] font-semibold text-[#5B5647]"
      >
        {label}
      </label>

      <input
        id={name}
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="
          h-[46px] sm:h-[48px]
          w-full
          rounded-[3px]
          border
          border-[#D9D3C3]
          bg-white
          px-3.5
          text-[14.5px] sm:text-[15px]
          text-[#1E2A38]
          placeholder:text-[#B3AC98]
          outline-none
          transition-colors
          duration-150
          focus:border-[#9C6B30]
          focus:ring-1
          focus:ring-[#9C6B30]/30
        "
      />
    </div>
  );
};

/* =========================================================
   FIXED FIELD
========================================================= */

const FixedField = ({ label, value }) => {
  return (
    <div className="space-y-1.5 sm:space-y-2">
      <label className="block text-[12.5px] font-semibold text-[#5B5647]">
        {label}
      </label>

      <div
        className="
          flex
          min-h-[46px] sm:min-h-[48px]
          items-center
          rounded-[3px]
          border
          border-dashed
          border-[#D9D3C3]
          bg-[#FAF8F2]
          px-3.5
          py-2.5
          text-[14px] sm:text-[15px]
          leading-6
          text-[#3A362C]
          break-words
        "
      >
        {value}
      </div>
    </div>
  );
};

/* =========================================================
   TEXT AREA
========================================================= */

const TextAreaField = ({
  label,
  name,
  value,
  onChange,
  placeholder,
}) => {
  return (
    <div className="space-y-1.5 sm:space-y-2">
      <label
        htmlFor={name}
        className="block text-[12.5px] font-semibold text-[#5B5647]"
      >
        {label}
      </label>

      <textarea
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={3}
        className="
          min-h-[96px] sm:min-h-[104px]
          w-full
          resize-none
          rounded-[3px]
          border
          border-[#D9D3C3]
          bg-white
          px-3.5
          py-3
          text-[14.5px] sm:text-[15px]
          leading-6
          text-[#1E2A38]
          placeholder:text-[#B3AC98]
          outline-none
          transition-colors
          duration-150
          focus:border-[#9C6B30]
          focus:ring-1
          focus:ring-[#9C6B30]/30
        "
      />
    </div>
  );
};

/* =========================================================
   SECTION ICON
========================================================= */

const SectionIcon = ({ type }) => {
  if (type === "business") {
    return (
      <div className="flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-[3px] border border-[#1E2A38] bg-[#1E2A38] text-[#F4E9D8]">
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
        >
          <path d="M3 21h18" />
          <path d="M5 21V5l7-3 7 3v16" />
          <path d="M9 9h1" />
          <path d="M14 9h1" />
          <path d="M9 13h1" />
          <path d="M14 13h1" />
          <path d="M9 21v-4h6v4" />
        </svg>
      </div>
    );
  }

  return (
    <div className="flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-[3px] border border-[#9C6B30] text-[#9C6B30]">
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
      >
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    </div>
  );
};

/* =========================================================
   STEP ITEM
========================================================= */

const StepItem = ({
  number,
  title,
  subtitle,
  active,
  completed,
}) => {
  return (
    <div className="flex min-w-0 items-center sm:items-baseline gap-2 sm:gap-3">
      <span
        className={`
          font-serif
          text-[18px] sm:text-[22px]
          leading-none
          tabular-nums
          font-bold
          ${active ? "text-[#9C6B30]" : "text-[#C7C0AC]"}
        `}
      >
        {completed ? "✓" : `0${number}`}
      </span>

      <div className="border-l border-[#E1DBC9] pl-2 sm:pl-3">
        <p
          className={`text-[11.5px] sm:text-[13px] font-bold ${
            active ? "text-[#1E2A38]" : "text-[#A9A28E]"
          }`}
        >
          {title}
        </p>

        <p className="hidden md:block mt-0.5 text-[10.5px] sm:text-[11px] text-[#A9A28E]">
          {subtitle}
        </p>
      </div>
    </div>
  );
};

/* =========================================================
   DETAILS PAGE
========================================================= */

export default function DetailsPage({
  shopDetails,
  clientDetails,
  handleShopChange,
  handleClientChange,
  quotationYear,
  setQuotationYear,
  quotationSeq,
  setQuotationSeq,
  onContinue,
  existingQuotations = [],
  quotationsLoading = false,
  onOpenQuotation,
  onNewQuotation,
  onViewAllQuotations,
  onSignOut,
}) {
  const [showGst, setShowGst] = useState(Boolean(shopDetails?.gst));
  
  // EDIT / SAVE TOGGLE FOR QUOTATION NUMBER & YEAR
  const [isEditingQuotationNumber, setIsEditingQuotationNumber] = useState(false);
  const [tempYear, setTempYear] = useState(quotationYear || new Date().getFullYear());
  const [tempSeq, setTempSeq] = useState(quotationSeq || "01");

  const totalQuotations = existingQuotations.length;

  const totalBalanceDue = existingQuotations.reduce(
    (total, quotation) => {
      const grand = Number(quotation.grand_total || 0);
      const paid = Number(quotation.total_paid || 0);
      return total + Math.max(0, grand - paid);
    },
    0,
  );

  const handleSaveQuotationNumber = () => {
    const cleanYear = String(tempYear || "").trim().replace(/[^0-9]/g, "") || new Date().getFullYear();
    const cleanSeq = String(tempSeq || "").trim().replace(/[^a-zA-Z0-9-_]/g, "") || "01";
    
    setQuotationYear(cleanYear);
    setQuotationSeq(cleanSeq);
    setTempYear(cleanYear);
    setTempSeq(cleanSeq);
    setIsEditingQuotationNumber(false);
  };

  const handleStartEdit = () => {
    setTempYear(quotationYear || new Date().getFullYear());
    setTempSeq(quotationSeq || "01");
    setIsEditingQuotationNumber(true);
  };

  return (
    <div className="min-h-screen bg-[#F5F2EA] text-[#1E2A38]">
      {/* =====================================================
          HEADER WITH BRAND & SIGN OUT BUTTON
      ===================================================== */}
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

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 rounded-[3px] border border-[#3A4A5E] px-3 py-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-[#7BAE85]" />
              <span className="text-[12px] font-medium text-[#C9D2DB]">
                Active Session
              </span>
            </div>

            {onSignOut && (
              <button
                type="button"
                onClick={onSignOut}
                className="inline-flex h-9 items-center justify-center gap-1.5 rounded-[3px] border border-[#B24A3C] bg-transparent px-3 text-[12px] font-semibold text-[#EAC1BA] transition-colors hover:bg-[#B24A3C] hover:text-white"
                title="Sign out securely"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
                Sign Out
              </button>
            )}
          </div>
        </div>
      </header>

      {/* =====================================================
          MAIN CONTENT
      ===================================================== */}
      <main className="mx-auto w-full max-w-[1140px] px-4 py-6 sm:px-6 sm:py-9 lg:py-12">
        {/* TITLE */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col justify-between gap-4 border-b-2 border-[#1E2A38] pb-5 sm:pb-6 sm:flex-row sm:items-end">
            <div>
              <p className="mb-1.5 sm:mb-2 text-[10.5px] sm:text-[11px] font-semibold tracking-[0.12em] text-[#9C6B30]">
                Quotation Builder
              </p>

              <h2 className="font-serif text-[28px] sm:text-[36px] lg:text-[40px] font-bold tracking-tight text-[#1E2A38]">
                Create quotation
              </h2>

              <p className="mt-1.5 sm:mt-2 max-w-xl text-[13px] sm:text-[14px] leading-relaxed text-[#6B6558]">
                Enter customer details, customize the quotation code, and proceed to add items.
              </p>
            </div>

            <div className="whitespace-nowrap font-serif text-[12px] sm:text-[13px] text-[#6B6558]">
              Step <span className="font-bold text-[#1E2A38]">1</span> of 3
            </div>
          </div>
        </div>

        {/* STEP PROGRESS */}
        <div className="mb-6 sm:mb-8 rounded-[4px] border border-[#D9D3C3] bg-white px-4 py-4 sm:px-8 sm:py-5">
          <div className="flex items-center justify-between">
            <StepItem
              number="1"
              title="Details"
              subtitle="Business & client"
              active
            />

            <div className="mx-2 sm:mx-6 md:mx-8 h-px flex-1 bg-[#E1DBC9]" />

            <StepItem
              number="2"
              title="Items"
              subtitle="Products & pricing"
            />

            <div className="mx-2 sm:mx-6 md:mx-8 h-px flex-1 bg-[#E1DBC9]" />

            <StepItem
              number="3"
              title="Preview"
              subtitle="Final quotation"
            />
          </div>
        </div>

        {/* SAVED QUOTATIONS QUICK CARD */}
        <section className="mb-6 sm:mb-8 rounded-[4px] border border-[#D9D3C3] bg-white">
          {quotationsLoading ? (
            <ActivityLoader message="Loading saved quotations..." />
          ) : (
            <div className="flex flex-col gap-4 sm:gap-5 p-5 sm:p-7 md:flex-row md:items-center md:justify-between">
              <div className="flex items-start sm:items-center gap-3.5 sm:gap-4">
                <div className="flex h-10 w-10 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-[3px] border border-[#1E2A38] text-[#1E2A38]">
                  <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                    <path d="M6 2h9l3 3v17H6z" />
                    <path d="M14 2v4h4" />
                    <path d="M9 12h6M9 16h6" />
                  </svg>
                </div>

                <div>
                  <p className="text-[10.5px] sm:text-[11px] font-semibold tracking-[0.1em] text-[#9C6B30]">
                    Saved quotations
                  </p>

                  <h3 className="mt-1 font-serif text-[17px] sm:text-[19px] font-bold tracking-tight text-[#1E2A38]">
                    {totalQuotations === 0
                      ? "No saved quotations yet"
                      : `${totalQuotations} saved ${
                          totalQuotations === 1 ? "quotation" : "quotations"
                        }`}
                  </h3>

                  <p className="mt-0.5 sm:mt-1 text-[11.5px] sm:text-[12px] tabular-nums text-[#8A8371]">
                    {totalQuotations === 0
                      ? "Your saved quotations will appear here."
                      : `Balance due across all quotations: ₹${totalBalanceDue.toLocaleString(
                          "en-IN",
                          { minimumFractionDigits: 2 },
                        )}`}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 pt-2 md:pt-0">
                <button
                  type="button"
                  onClick={onViewAllQuotations}
                  disabled={quotationsLoading}
                  className="
                    inline-flex
                    h-[42px] sm:h-10
                    flex-1 sm:flex-initial
                    items-center
                    justify-center
                    gap-2
                    rounded-[3px]
                    border
                    border-[#1E2A38]
                    bg-white
                    px-4
                    text-[12.5px] sm:text-[13px]
                    font-semibold
                    text-[#1E2A38]
                    transition-colors
                    duration-150
                    hover:bg-[#1E2A38]
                    hover:text-white
                    disabled:cursor-not-allowed
                    disabled:opacity-50
                  "
                >
                  View all
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M5 12h14" />
                    <path d="m13 6 6 6-6 6" />
                  </svg>
                </button>

                <button
                  type="button"
                  onClick={onNewQuotation}
                  className="
                    inline-flex
                    h-[42px] sm:h-10
                    flex-1 sm:flex-initial
                    items-center
                    justify-center
                    gap-1.5
                    rounded-[3px]
                    bg-[#9C6B30]
                    px-4
                    text-[12px] sm:text-[12.5px]
                    font-semibold
                    text-white
                    transition-colors
                    duration-150
                    hover:bg-[#7F5525]
                  "
                >
                  <span className="text-[15px] leading-none">+</span>
                  New quotation
                </button>
              </div>
            </div>
          )}
        </section>

        {/* MAIN FORM CARD */}
        <div className="overflow-hidden rounded-[4px] border border-[#D9D3C3] bg-white shadow-sm">
          {/* BRAND & FULLY EDITABLE QUOTATION NUMBER HEADER */}
          <div className="border-b border-[#D9D3C3] bg-[#FAF8F2] p-5 sm:p-7 lg:p-9">
            <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-3.5 sm:gap-4">
                <div className="flex h-[56px] w-[56px] sm:h-[68px] sm:w-[68px] shrink-0 items-center justify-center overflow-hidden rounded-[3px] border border-[#D9D3C3] bg-black">
                  <img
                    src={asmLogo}
                    alt="ASM Interiors"
                    className="h-full w-full object-contain"
                  />
                </div>

                <div>
                  <p className="text-[10.5px] sm:text-[11px] font-semibold tracking-[0.1em] text-[#9C6B30]">
                    Business identity
                  </p>

                  <h3 className="mt-1 font-serif text-[18px] sm:text-[21px] font-bold tracking-tight text-[#1E2A38]">
                    ASM Interiors
                  </h3>

                  <p className="mt-0.5 text-[12px] sm:text-[13px] text-[#6B6558]">
                    Interior Design &amp; Commercial Works
                  </p>
                </div>
              </div>

              {/* =========================================================
                  FULLY EDITABLE QUOTATION CODE (YEAR + NUMBER)
              ========================================================= */}
              <div className="w-full rounded-[4px] border border-[#D9D3C3] bg-white p-4 md:w-auto md:min-w-[340px]">
                {isEditingQuotationNumber ? (
                  /* --- EDIT MODE (BOTH YEAR AND NUMBER EDITABLE) --- */
                  <div className="mt-2.5 space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="flex flex-1 items-center overflow-hidden rounded-[3px] border border-[#9C6B30] bg-white ring-1 ring-[#9C6B30]/30">
                        {/* EDITABLE YEAR */}
                        <input
                          type="text"
                          value={tempYear}
                          maxLength={4}
                          onChange={(e) => setTempYear(e.target.value.replace(/[^0-9]/g, ""))}
                          placeholder="2026"
                          className="h-[42px] w-16 text-center border-r border-[#D9D3C3] bg-[#FAF8F2] font-serif text-[14.5px] font-bold text-[#1E2A38] outline-none"
                          title="Quotation Year"
                        />

                        <span className="px-1 text-[#8A8371] font-bold">-</span>

                        {/* EDITABLE QUOTATION NUMBER */}
                        <input
                          type="text"
                          value={tempSeq}
                          autoFocus
                          onChange={(e) => setTempSeq(e.target.value.replace(/[^a-zA-Z0-9-_]/g, ""))}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              handleSaveQuotationNumber();
                            }
                          }}
                          placeholder="300"
                          className="h-[42px] w-full px-2.5 text-[15px] font-bold tabular-nums text-[#1E2A38] outline-none placeholder:text-[#B3AC98]"
                          title="Quotation Number"
                        />
                      </div>

                      {/* SAVE BUTTON */}
                      <button
                        type="button"
                        onClick={handleSaveQuotationNumber}
                        className="inline-flex h-[42px] items-center justify-center gap-1.5 rounded-[3px] bg-[#3F6B4A] px-3.5 text-[12.5px] font-semibold text-white transition-colors hover:bg-[#345A3E]"
                        title="Save quotation number"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                        Save
                      </button>
                    </div>

                    <p className="text-[11px] text-[#8A8371]">
                      Preview: <strong className="text-[#1E2A38]">{tempYear || "2026"}-{tempSeq || "01"}</strong>
                    </p>
                  </div>
                ) : (
                  /* --- SAVED DISPLAY MODE --- */
                  <div className="mt-2.5 flex items-center justify-between rounded-[3px] border border-[#D9D3C3] bg-[#FAF8F2] px-3.5 py-2.5">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex h-2 w-2 rounded-full bg-[#3F6B4A]" />
                      <span className="text-[11px] font-semibold text-[#6B6558]">
                        Quotation Code:
                      </span>
                      <span className="font-serif text-[16px] font-bold tabular-nums text-[#1E2A38]">
                        {quotationYear}-{quotationSeq || "01"}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={handleStartEdit}
                      className="p-1 text-[#6B6558] hover:text-[#9C6B30] transition-colors rounded hover:bg-white"
                      title="Edit quotation code"
                    >
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 20h9" />
                        <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                      </svg>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* TWO COLUMN DETAILS */}
          <div className="grid lg:grid-cols-2">
            {/* BUSINESS DETAILS */}
            <section className="border-b border-[#D9D3C3] p-5 sm:p-7 lg:border-b-0 lg:border-r lg:p-9">
              <div className="mb-5 sm:mb-7 flex items-center gap-3.5">
                <SectionIcon type="business" />
                <div>
                  <h3 className="font-serif text-[16px] sm:text-[17px] font-bold text-[#1E2A38]">
                    Business details
                  </h3>
                  <p className="mt-0.5 text-[11.5px] sm:text-[12px] text-[#8A8371]">
                    Fixed information for ASM Interiors.
                  </p>
                </div>
              </div>

              <div className="space-y-4 sm:space-y-5">
                <FixedField label="Shop name" value={shopDetails.name} />

                <div className="space-y-1.5 sm:space-y-2">
                  <label className="block text-[12.5px] font-semibold text-[#5B5647]">
                    Shop address
                  </label>
                  <div className="min-h-[60px] sm:min-h-[66px] rounded-[3px] border border-dashed border-[#D9D3C3] bg-[#FAF8F2] px-3.5 py-2.5 text-[13.5px] sm:text-[15px] leading-6 text-[#3A362C] break-words">
                    {shopDetails.address}
                  </div>
                </div>

                <FixedField label="Phone number" value={shopDetails.phone} />
                <FixedField label="Email address" value={shopDetails.email} />

                {!showGst ? (
                  <button
                    type="button"
                    onClick={() => setShowGst(true)}
                    className="inline-flex items-center gap-1.5 text-[12.5px] sm:text-[13px] font-semibold text-[#9C6B30] transition-colors duration-150 hover:text-[#7F5525]"
                  >
                    <span className="text-[16px] leading-none">+</span>
                    Add GST number
                  </button>
                ) : (
                  <div>
                    <InputField
                      label="GST number"
                      name="gst"
                      value={shopDetails.gst}
                      onChange={handleShopChange}
                      placeholder="Enter GST number"
                    />

                    <button
                      type="button"
                      onClick={() => {
                        setShowGst(false);
                        handleShopChange({
                          target: { name: "gst", value: "" },
                        });
                      }}
                      className="mt-2 text-[11.5px] sm:text-[12px] font-semibold text-[#B24A3C] transition-colors duration-150 hover:text-[#8C3A2F]"
                    >
                      Remove GST
                    </button>
                  </div>
                )}
              </div>
            </section>

            {/* CLIENT DETAILS */}
            <section className="p-5 sm:p-7 lg:p-9">
              <div className="mb-5 sm:mb-7 flex items-center gap-3.5">
                <SectionIcon type="client" />
                <div>
                  <h3 className="font-serif text-[16px] sm:text-[17px] font-bold text-[#1E2A38]">
                    Client details
                  </h3>
                  <p className="mt-0.5 text-[11.5px] sm:text-[12px] text-[#8A8371]">
                    Customer information for this quotation.
                  </p>
                </div>
              </div>

              <div className="space-y-4 sm:space-y-5">
                <InputField
                  label="Client shop name"
                  name="shopName"
                  value={clientDetails.shopName}
                  onChange={handleClientChange}
                  placeholder="e.g. Nila Agencies"
                />

                <InputField
                  label="Client name *"
                  name="name"
                  value={clientDetails.name}
                  onChange={handleClientChange}
                  placeholder="Enter client name"
                />

                <TextAreaField
                  label="Client address"
                  name="address"
                  value={clientDetails.address}
                  onChange={handleClientChange}
                  placeholder="Enter complete client address"
                />

                <div className="grid gap-4 sm:gap-5 sm:grid-cols-2">
                  <InputField
                    label="Phone number"
                    name="phone"
                    value={clientDetails.phone}
                    onChange={handleClientChange}
                    placeholder="+91 XXXXX XXXXX"
                  />

                  <InputField
                    label="GST number"
                    name="gst"
                    value={clientDetails.gst}
                    onChange={handleClientChange}
                    placeholder="GSTIN"
                  />
                </div>

                <InputField
                  label="Email address"
                  name="email"
                  type="email"
                  value={clientDetails.email}
                  onChange={handleClientChange}
                  placeholder="client@example.com"
                />
              </div>
            </section>
          </div>

          {/* ACTION FOOTER */}
          <div className="flex flex-col gap-4 border-t border-[#D9D3C3] bg-[#FAF8F2] px-5 py-5 sm:px-9 sm:py-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[12.5px] sm:text-[13px] font-bold text-[#1E2A38]">
                Ready to continue?
              </p>
              <p className="mt-0.5 text-[11px] text-[#8A8371]">
                Quotation #{quotationYear}-{quotationSeq || "01"}
              </p>
            </div>

            <button
              type="button"
              onClick={onContinue}
              className="
                group
                inline-flex
                h-[48px]
                w-full sm:w-auto
                items-center
                justify-center
                gap-2.5
                rounded-[3px]
                bg-[#1E2A38]
                px-7
                text-[14px]
                font-semibold
                text-white
                transition-all
                duration-150
                hover:bg-[#0F1926]
              "
            >
              Continue to items
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="transition-transform duration-200 group-hover:translate-x-0.5"
              >
                <path d="M5 12h14" />
                <path d="m13 6 6 6-6 6" />
              </svg>
            </button>
          </div>
        </div>

        {/* FOOTNOTE */}
        <div className="mt-6 flex items-center justify-center gap-2 text-center">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="text-[#9C6B30]">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" /><path d="m9 12 2 2 4-4" />
          </svg>
          <p className="text-[11px] text-[#8A8371]">
            Your quotation information is used securely to generate invoices and track payments.
          </p>
        </div>
      </main>
    </div>
  );
}