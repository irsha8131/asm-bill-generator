import React from "react";
import asmLogo from "../assets/asm-logo.jpeg";

export default function ItemsPage({
  quotationId,
  quotationNumber = "2026-01",
  items,
  addItem,
  removeItem,
  updateItem,
  gstEnabled,
  setGstEnabled,
  gstRate,
  setGstRate,
  subtotal,
  gstAmount,
  grandTotal,
  discountAmount,
  setDiscountAmount,
  getItemAmount,
  formatCurrency,
  setCurrentStep,
}) {
  const safeSubtotal = Number(subtotal || 0);

  const safeDiscount = Math.min(
    Math.max(Number(discountAmount || 0), 0),
    safeSubtotal,
  );

  const afterDiscount = Math.max(0, safeSubtotal - safeDiscount);

  const safeGstRate =
    gstEnabled && Number(gstRate || 0) > 0 ? Number(gstRate) : 0;

  const calculatedGstAmount =
    safeGstRate > 0 ? afterDiscount * (safeGstRate / 100) : 0;

  const calculatedGrandTotal = afterDiscount + calculatedGstAmount;

  const handleReviewQuotation = () => {
    const validItems = items.filter(
      (item) => String(item.description || "").trim() !== "",
    );

    if (validItems.length === 0) {
      alert("Please add at least one quotation item description.");
      return;
    }

    setCurrentStep(3);
  };

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

          <div className="flex items-center gap-2 rounded-[3px] border border-[#3A4A5E] px-2.5 sm:px-3 py-1 sm:py-1.5">
            <span className="font-serif text-[11px] sm:text-[12px] font-bold text-[#F4E9D8]">
              #{quotationNumber}
            </span>
          </div>
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <main className="mx-auto max-w-[1140px] px-4 py-6 sm:px-6 sm:py-9 lg:py-12">
        {/* PAGE HEADER */}
        <div className="mb-6 sm:mb-8">
          <button
            type="button"
            onClick={() => setCurrentStep(1)}
            className="mb-4 sm:mb-6 inline-flex items-center gap-1.5 text-[12.5px] sm:text-[13px] font-semibold text-[#6B6558] transition-colors duration-150 hover:text-[#1E2A38]"
          >
            <span className="text-[16px]">←</span>
            Back to details
          </button>

          <div className="flex flex-col justify-between gap-4 border-b-2 border-[#1E2A38] pb-5 sm:pb-6 md:flex-row md:items-end">
            <div>
              <p className="mb-1.5 sm:mb-2 text-[10.5px] sm:text-[11px] font-semibold tracking-[0.12em] text-[#9C6B30]">
                Quotation Builder • #{quotationNumber}
              </p>

              <h2 className="font-serif text-[28px] sm:text-[36px] lg:text-[40px] font-bold tracking-tight text-[#1E2A38]">
                Add quotation items
              </h2>

              <p className="mt-1.5 sm:mt-2 max-w-xl text-[13px] sm:text-[14px] leading-relaxed text-[#6B6558]">
                Add interior work descriptions, quantities, and pricing for this quotation.
              </p>
            </div>

            <div className="whitespace-nowrap font-serif text-[12px] sm:text-[13px] text-[#6B6558]">
              Step <span className="font-bold text-[#1E2A38]">2</span> of 3
            </div>
          </div>
        </div>

        {/* STEP PROGRESS */}
        <div className="mb-6 sm:mb-8 rounded-[4px] border border-[#D9D3C3] bg-white px-4 py-4 sm:px-8 sm:py-5">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setCurrentStep(1)}
              className="flex min-w-0 items-center sm:items-baseline gap-2 sm:gap-3 text-left"
            >
              <span className="font-serif text-[18px] sm:text-[22px] font-bold leading-none text-[#9C6B30]">
                ✓
              </span>
              <div className="border-l border-[#E1DBC9] pl-2 sm:pl-3">
                <p className="text-[11.5px] sm:text-[13px] font-bold text-[#1E2A38]">Details</p>
                <p className="hidden md:block mt-0.5 text-[10.5px] sm:text-[11px] text-[#A9A28E]">
                  Business & client
                </p>
              </div>
            </button>

            <div className="mx-2 sm:mx-6 md:mx-8 h-px flex-1 bg-[#E1DBC9]" />

            <div className="flex min-w-0 items-center sm:items-baseline gap-2 sm:gap-3">
              <span className="font-serif text-[18px] sm:text-[22px] font-bold leading-none tabular-nums text-[#9C6B30]">
                02
              </span>
              <div className="border-l border-[#E1DBC9] pl-2 sm:pl-3">
                <p className="text-[11.5px] sm:text-[13px] font-bold text-[#1E2A38]">Items</p>
                <p className="hidden md:block mt-0.5 text-[10.5px] sm:text-[11px] text-[#A9A28E]">
                  Products & pricing
                </p>
              </div>
            </div>

            <div className="mx-2 sm:mx-6 md:mx-8 h-px flex-1 bg-[#E1DBC9]" />

            <div className="flex min-w-0 items-center sm:items-baseline gap-2 sm:gap-3">
              <span className="font-serif text-[18px] sm:text-[22px] font-bold leading-none tabular-nums text-[#C7C0AC]">
                03
              </span>
              <div className="border-l border-[#E1DBC9] pl-2 sm:pl-3">
                <p className="text-[11.5px] sm:text-[13px] font-bold text-[#A9A28E]">Preview</p>
                <p className="hidden md:block mt-0.5 text-[10.5px] sm:text-[11px] text-[#A9A28E]">
                  Final quotation
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ITEMS CARD */}
        <div className="overflow-hidden rounded-[4px] border border-[#D9D3C3] bg-white shadow-sm">
          {/* CARD HEADER */}
          <div className="flex flex-col justify-between gap-3 border-b border-[#D9D3C3] bg-[#FAF8F2] p-5 sm:flex-row sm:items-center sm:p-7">
            <div className="flex items-center gap-3 sm:gap-3.5">
              <div className="flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-[3px] border border-[#1E2A38] bg-[#1E2A38] text-[#F4E9D8]">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                >
                  <path d="M8 6h13" />
                  <path d="M8 12h13" />
                  <path d="M8 18h13" />
                  <path d="M3 6h.01" />
                  <path d="M3 12h.01" />
                  <path d="M3 18h.01" />
                </svg>
              </div>

              <div>
                <h3 className="font-serif text-[16px] sm:text-[17px] font-bold text-[#1E2A38]">
                  Quotation items
                </h3>
                <p className="mt-0.5 text-[11.5px] sm:text-[12px] text-[#8A8371]">
                  Add work items with quantity and unit price.
                </p>
              </div>
            </div>

            <div className="w-fit rounded-[3px] border border-[#D9D3C3] bg-white px-3 py-1.5 text-[12px] font-semibold tabular-nums text-[#5B5647]">
              {items.length} {items.length === 1 ? "item" : "items"}
            </div>
          </div>

          {/* TABLE (WITH RESPONSIVE SCROLL & MOBILE FRIENDLY ROWS) */}
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] border-collapse">
              <thead>
                <tr className="border-b border-[#D9D3C3] bg-[#FAF8F2]">
                  <th className="px-4 sm:px-6 py-3.5 text-left text-[11px] font-semibold tracking-[0.06em] text-[#8A8371]">
                    Description
                  </th>
                  <th className="w-28 sm:w-32 px-3 sm:px-4 py-3.5 text-left text-[11px] font-semibold tracking-[0.06em] text-[#8A8371]">
                    Quantity
                  </th>
                  <th className="w-40 sm:w-48 px-3 sm:px-4 py-3.5 text-left text-[11px] font-semibold tracking-[0.06em] text-[#8A8371]">
                    Unit price
                  </th>
                  <th className="w-36 sm:w-48 px-3 sm:px-4 py-3.5 text-right text-[11px] font-semibold tracking-[0.06em] text-[#8A8371]">
                    Amount
                  </th>
                  <th className="w-20 sm:w-24 px-4 py-3.5 text-right text-[11px] font-semibold text-[#8A8371]">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody>
                {items.map((item, index) => (
                  <tr
                    key={item.id}
                    className="border-b border-[#EDE8DA] transition-colors duration-150 hover:bg-[#FAF8F2]/70"
                  >
                    <td className="px-4 sm:px-6 py-3.5 sm:py-4">
                      <div className="flex items-center gap-2.5 sm:gap-3">
                        <div className="flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-[3px] border border-[#D9D3C3] font-serif text-[12px] sm:text-[13px] font-bold tabular-nums text-[#9C6B30]">
                          {index + 1}
                        </div>

                        <input
                          type="text"
                          value={item.description}
                          onChange={(e) =>
                            updateItem(item.id, "description", e.target.value)
                          }
                          placeholder="e.g. 6x3 cupboard rack"
                          className="
                            h-[44px] sm:h-[48px]
                            w-full
                            rounded-[3px]
                            border
                            border-[#D9D3C3]
                            bg-white
                            px-3.5
                            text-[14px] sm:text-[15px]
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
                    </td>

                    <td className="px-3 sm:px-4 py-3.5 sm:py-4">
                      <input
                        type="number"
                        min="0"
                        value={item.quantity}
                        onChange={(e) =>
                          updateItem(item.id, "quantity", e.target.value)
                        }
                        className="
                          h-[44px] sm:h-[48px]
                          w-full
                          rounded-[3px]
                          border
                          border-[#D9D3C3]
                          bg-white
                          px-3
                          text-[14px] sm:text-[15px]
                          tabular-nums
                          text-[#1E2A38]
                          outline-none
                          transition-colors
                          duration-150
                          focus:border-[#9C6B30]
                          focus:ring-1
                          focus:ring-[#9C6B30]/30
                        "
                      />
                    </td>

                    <td className="px-3 sm:px-4 py-3.5 sm:py-4">
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[14px] font-medium text-[#B3AC98]">
                          ₹
                        </span>

                        <input
                          type="number"
                          min="0"
                          value={item.price}
                          onChange={(e) =>
                            updateItem(item.id, "price", e.target.value)
                          }
                          className="
                            h-[44px] sm:h-[48px]
                            w-full
                            rounded-[3px]
                            border
                            border-[#D9D3C3]
                            bg-white
                            py-2.5
                            pl-7
                            pr-3
                            text-[14px] sm:text-[15px]
                            tabular-nums
                            text-[#1E2A38]
                            outline-none
                            transition-colors
                            duration-150
                            focus:border-[#9C6B30]
                            focus:ring-1
                            focus:ring-[#9C6B30]/30
                          "
                        />
                      </div>
                    </td>

                    <td className="px-3 sm:px-4 py-3.5 sm:py-4 text-right">
                      <span className="font-serif text-[15px] sm:text-[16px] font-bold tabular-nums text-[#1E2A38]">
                        {formatCurrency(getItemAmount(item))}
                      </span>
                    </td>

                    <td className="px-4 py-3.5 sm:py-4 text-right">
                      <button
                        type="button"
                        onClick={() => removeItem(item.id)}
                        disabled={items.length === 1}
                        className="
                          rounded-[3px]
                          px-2
                          py-1.5
                          text-[12px]
                          font-semibold
                          text-[#B24A3C]
                          transition-colors
                          duration-150
                          hover:bg-[#F6E9E6]
                          hover:text-[#8C3A2F]
                          disabled:cursor-not-allowed
                          disabled:opacity-30
                        "
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* ADD ITEM BUTTON */}
          <div className="border-b border-[#D9D3C3] p-4 sm:p-7">
            <button
              type="button"
              onClick={addItem}
              className="
                inline-flex
                h-[44px]
                items-center
                gap-2
                rounded-[3px]
                border
                border-[#1E2A38]
                bg-white
                px-4
                text-[13px]
                font-semibold
                text-[#1E2A38]
                transition-colors
                duration-150
                hover:bg-[#1E2A38]
                hover:text-white
              "
            >
              <span className="text-[17px] leading-none">+</span>
              Add another item
            </button>
          </div>

          {/* TOTALS CALCULATION SECTION */}
          <div className="grid gap-6 p-5 sm:p-8 lg:grid-cols-2">
            <div className="hidden lg:block">
              <div className="rounded-[4px] border border-dashed border-[#D9D3C3] bg-[#FAF8F2] p-7">
                <p className="text-[11px] font-semibold tracking-[0.1em] text-[#9C6B30]">
                  Pricing summary
                </p>

                <h4 className="mt-2.5 font-serif text-[21px] font-bold text-[#1E2A38]">
                  Review your quotation
                </h4>

                <p className="mt-2 text-[13.5px] leading-6 text-[#6B6558]">
                  Check item quantities, discounts, and GST before proceeding to bill preview.
                </p>

                <div className="mt-7 flex items-center gap-3 border-t border-[#E1DBC9] pt-5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-[3px] border border-[#7BAE85] font-serif text-[13px] font-bold text-[#4B7A55]">
                    ✓
                  </div>
                  <span className="text-[13px] font-medium text-[#5B5647]">
                    Live calculation enabled
                  </span>
                </div>
              </div>
            </div>

            <div>
              <div className="rounded-[4px] border border-[#D9D3C3] bg-white p-5 sm:p-6">
                {/* SUBTOTAL */}
                <div className="flex justify-between border-b border-[#EDE8DA] pb-4 text-[14.5px]">
                  <span className="text-[#6B6558]">Subtotal</span>
                  <span className="font-semibold tabular-nums text-[#1E2A38]">
                    {formatCurrency(safeSubtotal)}
                  </span>
                </div>

                {/* DISCOUNT */}
                <div className="border-b border-[#EDE8DA] py-5">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-[14.5px] font-semibold text-[#1E2A38]">Discount</p>
                      <p className="mt-0.5 text-[11.5px] text-[#8A8371]">Enter discount amount</p>
                    </div>

                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[14px] font-medium text-[#B3AC98]">
                        ₹
                      </span>

                      <input
                        type="number"
                        min="0"
                        max={safeSubtotal}
                        value={discountAmount}
                        onChange={(e) => {
                          const val = Number(e.target.value || 0);
                          setDiscountAmount(Math.min(Math.max(val, 0), safeSubtotal));
                        }}
                        placeholder="0"
                        className="
                          h-[42px]
                          w-32 sm:w-36
                          rounded-[3px]
                          border
                          border-[#D9D3C3]
                          bg-white
                          px-3
                          pl-7
                          text-right
                          text-[14px] sm:text-[15px]
                          font-semibold
                          tabular-nums
                          text-[#1E2A38]
                          outline-none
                          transition-colors
                          duration-150
                          focus:border-[#9C6B30]
                          focus:ring-1
                          focus:ring-[#9C6B30]/30
                        "
                      />
                    </div>
                  </div>

                  {safeDiscount > 0 && (
                    <div className="mt-3 flex justify-between rounded-[3px] border border-[#CFE0D2] bg-[#F2F7F3] px-3.5 py-2">
                      <span className="text-[12.5px] font-medium text-[#4B7A55]">You saved</span>
                      <span className="text-[12.5px] font-semibold tabular-nums text-[#4B7A55]">
                        {formatCurrency(safeDiscount)}
                      </span>
                    </div>
                  )}
                </div>

                {/* AFTER DISCOUNT */}
                <div className="flex justify-between border-b border-[#EDE8DA] py-4 text-[14.5px]">
                  <span className="text-[#6B6558]">After discount</span>
                  <span className="font-semibold tabular-nums text-[#1E2A38]">
                    {formatCurrency(afterDiscount)}
                  </span>
                </div>

                {/* GST */}
                {!gstEnabled ? (
                  <div className="border-b border-[#EDE8DA] py-5">
                    <button
                      type="button"
                      onClick={() => {
                        setGstEnabled(true);
                        setGstRate("");
                      }}
                      className="text-[13px] font-semibold text-[#9C6B30] transition-colors duration-150 hover:text-[#7F5525]"
                    >
                      + Add GST
                    </button>
                  </div>
                ) : (
                  <div className="border-b border-[#EDE8DA] py-5">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-[14.5px] font-semibold text-[#1E2A38]">GST rate</p>
                        <p className="mt-0.5 text-[11.5px] text-[#8A8371]">Enter GST percentage</p>
                      </div>

                      <div className="relative">
                        <input
                          type="number"
                          min="0"
                          value={gstRate}
                          onChange={(e) => setGstRate(e.target.value)}
                          placeholder="18"
                          className="
                            h-[42px]
                            w-24 sm:w-28
                            rounded-[3px]
                            border
                            border-[#D9D3C3]
                            bg-white
                            px-3
                            pr-7
                            text-right
                            text-[14px] sm:text-[15px]
                            font-semibold
                            tabular-nums
                            text-[#1E2A38]
                            outline-none
                            transition-colors
                            duration-150
                            focus:border-[#9C6B30]
                            focus:ring-1
                            focus:ring-[#9C6B30]/30
                          "
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[14px] font-medium text-[#B3AC98]">
                          %
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setGstEnabled(false);
                        setGstRate("");
                      }}
                      className="mt-2.5 text-[11.5px] font-semibold text-[#B24A3C] hover:text-[#8C3A2F]"
                    >
                      Remove GST
                    </button>
                  </div>
                )}

                {/* GST AMOUNT */}
                {gstEnabled && Number(gstRate || 0) > 0 && (
                  <div className="flex justify-between border-b border-[#EDE8DA] py-4 text-[14.5px]">
                    <span className="text-[#6B6558]">GST ({gstRate}%)</span>
                    <span className="font-semibold tabular-nums text-[#1E2A38]">
                      {formatCurrency(calculatedGstAmount)}
                    </span>
                  </div>
                )}

                {/* GRAND TOTAL */}
                <div className="pt-5">
                  <div className="flex items-end justify-between gap-4">
                    <div>
                      <p className="text-[10.5px] font-semibold tracking-[0.1em] text-[#9C6B30]">
                        Grand total
                      </p>
                      <p className="mt-1 text-[11.5px] text-[#8A8371]">
                        {gstEnabled && Number(gstRate || 0) > 0
                          ? "Final amount including GST"
                          : "Final amount after discount"}
                      </p>
                    </div>

                    <span className="font-serif text-[24px] sm:text-[28px] font-bold tabular-nums tracking-tight text-[#1E2A38]">
                      {formatCurrency(calculatedGrandTotal)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* FOOTER ACTIONS */}
          <div className="flex flex-col gap-3.5 border-t border-[#D9D3C3] bg-[#FAF8F2] p-5 sm:flex-row sm:items-center sm:justify-between sm:px-8">
            <button
              type="button"
              onClick={() => setCurrentStep(1)}
              className="
                inline-flex
                h-[46px]
                w-full sm:w-auto
                items-center
                justify-center
                gap-2
                rounded-[3px]
                border
                border-[#D9D3C3]
                bg-white
                px-5
                text-[13px]
                font-semibold
                text-[#1E2A38]
                transition-colors
                duration-150
                hover:bg-[#F0ECE0]
              "
            >
              ← Back to details
            </button>

            <button
              type="button"
              onClick={handleReviewQuotation}
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
                px-6
                text-[14px]
                font-semibold
                text-white
                transition-colors
                duration-150
                hover:bg-[#0F1926]
              "
            >
              Review quotation
              <span className="text-[16px] transition-transform duration-200 group-hover:translate-x-0.5">
                →
              </span>
            </button>
          </div>
        </div>

        <p className="mt-5 text-center text-[11px] text-[#8A8371]">
          Item amounts, discount, and totals are calculated automatically.
        </p>
      </main>
    </div>
  );
}