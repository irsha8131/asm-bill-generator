import { useState } from "react";
import { supabase } from "../utils/supabase";
import asmLogo from "../assets/asm-logo.jpeg";

export default function ItemsPage({
  quotationId,
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
  getItemAmount,
  formatCurrency,
  setCurrentStep,
}) {
  const [saving, setSaving] = useState(false);

  /* =========================================================
     SAVE ITEMS + TOTALS
  ========================================================= */

  const handleReviewQuotation = async () => {
    if (!quotationId) {
      alert("Quotation ID is missing. Please go back and try again.");
      return;
    }

    try {
      setSaving(true);

      console.log("Saving quotation items...");

      /* -------------------------------------------------------
         REMOVE OLD ITEMS
      ------------------------------------------------------- */

      const { error: deleteError } = await supabase
        .from("quotation_items")
        .delete()
        .eq("quotation_id", quotationId);

      if (deleteError) {
        console.error("Delete old items error:", deleteError);

        alert(
          `Failed to prepare quotation items.\n\n${deleteError.message}`,
        );

        return;
      }

      /* -------------------------------------------------------
         PREPARE ITEMS
      ------------------------------------------------------- */

      const validItems = items.filter(
        (item) =>
          item.description.trim() !== "" ||
          Number(item.price) > 0 ||
          Number(item.quantity) > 0,
      );

      if (validItems.length === 0) {
        alert("Please add at least one quotation item.");
        return;
      }

      const quotationItems = validItems.map((item) => ({
        quotation_id: quotationId,
        description: item.description || "Item",
        quantity: Number(item.quantity || 0),
        price: Number(item.price || 0),
        amount: Number(getItemAmount(item) || 0),
      }));

      /* -------------------------------------------------------
         INSERT ITEMS
      ------------------------------------------------------- */

      const { error: itemsError } = await supabase
        .from("quotation_items")
        .insert(quotationItems);

      if (itemsError) {
        console.error("Quotation items error:", itemsError);

        alert(
          `Failed to save quotation items.\n\n${itemsError.message}`,
        );

        return;
      }

      /* -------------------------------------------------------
         UPDATE QUOTATION TOTALS
      ------------------------------------------------------- */

      const { error: quotationError } = await supabase
        .from("quotations")
        .update({
          gst_rate:
            gstEnabled && Number(gstRate) > 0
              ? Number(gstRate)
              : 0,

          subtotal: Number(subtotal || 0),

          gst_amount: Number(gstAmount || 0),

          grand_total: Number(grandTotal || 0),
        })
        .eq("id", quotationId);

      if (quotationError) {
        console.error(
          "Quotation totals update error:",
          quotationError,
        );

        alert(
          `Failed to update quotation totals.\n\n${quotationError.message}`,
        );

        return;
      }

      console.log("Quotation saved successfully.");

      setCurrentStep(3);
    } catch (error) {
      console.error("Unexpected save error:", error);

      alert(
        "Something went wrong while saving the quotation.",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f8fa] text-slate-900">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <header className="border-b border-slate-200 bg-white">

        <div className="mx-auto flex h-[74px] max-w-[1180px] items-center justify-between px-5 sm:px-6">

          <div className="flex items-center gap-3.5">

            <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-lg bg-black">

              <img
                src={asmLogo}
                alt="ASM Interiors"
                className="h-full w-full object-contain"
              />

            </div>

            <div>

              <h1 className="text-[16px] font-bold tracking-tight text-slate-950">
                ASM INTERIORS
              </h1>

              <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                Quotation & Billing
              </p>

            </div>

          </div>

          <div className="hidden items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3.5 py-2 sm:flex">

            <span className="h-2 w-2 rounded-full bg-emerald-500" />

            <span className="text-[12px] font-semibold text-slate-600">
              New quotation
            </span>

          </div>

        </div>

      </header>

      {/* =====================================================
          MAIN
      ===================================================== */}

      <main className="mx-auto max-w-[1180px] px-5 py-8 sm:px-6 lg:py-10">

        {/* ===================================================
            PAGE HEADER
        =================================================== */}

        <div className="mb-7">

          <button
            type="button"
            onClick={() => setCurrentStep(1)}
            disabled={saving}
            className="
              mb-6
              inline-flex
              items-center
              gap-2
              text-[13px]
              font-semibold
              text-slate-500
              transition
              hover:text-slate-950
              disabled:cursor-not-allowed
              disabled:opacity-50
            "
          >
            <span className="text-[17px]">
              ←
            </span>

            Back to details
          </button>

          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">

            <div>

              <p className="mb-2.5 text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">
                Quotation Builder
              </p>

              <h2 className="text-[34px] font-bold tracking-[-0.03em] text-slate-950 sm:text-[38px]">
                Add quotation items
              </h2>

              <p className="mt-2 max-w-xl text-[14px] leading-6 text-slate-500">
                Add the interior work, products, quantities and
                pricing for this quotation.
              </p>

            </div>

            <div className="text-[13px] font-medium text-slate-400">

              Step{" "}

              <span className="font-bold text-slate-950">
                2
              </span>{" "}

              of 3

            </div>

          </div>

        </div>

        {/* ===================================================
            STEP INDICATOR
        =================================================== */}

        <div className="mb-7 rounded-xl border border-slate-200 bg-white px-5 py-5 shadow-[0_1px_3px_rgba(15,23,42,0.04)] sm:px-7">

          <div className="flex items-center">

            {/* STEP 1 */}

            <button
              type="button"
              onClick={() => setCurrentStep(1)}
              disabled={saving}
              className="flex items-center disabled:cursor-not-allowed"
            >

              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-[12px] font-bold text-slate-700">
                ✓
              </div>

              <div className="ml-3 hidden text-left sm:block">

                <p className="text-[13px] font-bold text-slate-700">
                  Details
                </p>

                <p className="mt-1 text-[11px] text-slate-400">
                  Business & client
                </p>

              </div>

            </button>

            <div className="mx-3 h-px flex-1 bg-slate-900 sm:mx-7" />

            {/* STEP 2 */}

            <div className="flex items-center">

              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-950 text-[12px] font-bold text-white">
                2
              </div>

              <div className="ml-3 hidden sm:block">

                <p className="text-[13px] font-bold text-slate-950">
                  Items
                </p>

                <p className="mt-1 text-[11px] text-slate-400">
                  Products & pricing
                </p>

              </div>

            </div>

            <div className="mx-3 h-px flex-1 bg-slate-200 sm:mx-7" />

            {/* STEP 3 */}

            <div className="flex items-center">

              <div className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-[12px] font-semibold text-slate-400">
                3
              </div>

              <div className="ml-3 hidden sm:block">

                <p className="text-[13px] font-semibold text-slate-400">
                  Preview
                </p>

                <p className="mt-1 text-[11px] text-slate-300">
                  Final quotation
                </p>

              </div>

            </div>

          </div>

        </div>

        {/* ===================================================
            ITEMS CARD
        =================================================== */}

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_4px_18px_rgba(15,23,42,0.04)]">

          {/* =================================================
              CARD HEADER
          ================================================= */}

          <div className="flex flex-col justify-between gap-4 border-b border-slate-200 p-6 sm:flex-row sm:items-center sm:p-8">

            <div className="flex items-center gap-4">

              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-slate-950 text-white">

                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
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

                <h3 className="text-[19px] font-bold text-slate-950">
                  Quotation items
                </h3>

                <p className="mt-1.5 text-[13px] text-slate-400">
                  Add every interior work item that should appear on the bill.
                </p>

              </div>

            </div>

            <div className="w-fit rounded-lg bg-slate-100 px-3.5 py-2 text-[13px] font-semibold text-slate-600">
              {items.length}{" "}
              {items.length === 1 ? "item" : "items"}
            </div>

          </div>

          {/* =================================================
              TABLE
          ================================================= */}

          <div className="overflow-x-auto">

            <table className="w-full min-w-[900px]">

              <thead>

                <tr className="border-b border-slate-200 bg-slate-50/80">

                  <th className="px-6 py-4.5 text-left text-[13px] font-bold uppercase tracking-wide text-slate-500">
                    Description
                  </th>

                  <th className="w-32 px-4 py-4.5 text-left text-[13px] font-bold uppercase tracking-wide text-slate-500">
                    Quantity
                  </th>

                  <th className="w-48 px-4 py-4.5 text-left text-[13px] font-bold uppercase tracking-wide text-slate-500">
                    Unit price
                  </th>

                  <th className="w-48 px-4 py-4.5 text-right text-[13px] font-bold uppercase tracking-wide text-slate-500">
                    Amount
                  </th>

                  <th className="w-28 px-6 py-4.5" />

                </tr>

              </thead>

              <tbody>

                {items.map((item, index) => (

                  <tr
                    key={item.id}
                    className="border-b border-slate-100 transition hover:bg-slate-50/50"
                  >

                    {/* DESCRIPTION */}

                    <td className="px-6 py-6">

                      <div className="flex items-center gap-3">

                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-[13px] font-bold text-slate-500">
                          {index + 1}
                        </div>

                        <input
                          type="text"
                          value={item.description}
                          onChange={(e) =>
                            updateItem(
                              item.id,
                              "description",
                              e.target.value,
                            )
                          }
                          placeholder="e.g. 6x3 cupboard rack"
                          className="
                            h-[52px]
                            w-full
                            rounded-lg
                            border
                            border-slate-200
                            bg-slate-50
                            px-4
                            text-[15px]
                            font-medium
                            text-slate-900
                            placeholder:text-slate-400
                            outline-none
                            transition
                            hover:border-slate-300
                            focus:border-slate-900
                            focus:bg-white
                            focus:ring-4
                            focus:ring-slate-900/5
                          "
                        />

                      </div>

                    </td>

                    {/* QUANTITY */}

                    <td className="px-4 py-6">

                      <input
                        type="number"
                        min="0"
                        value={item.quantity}
                        onChange={(e) =>
                          updateItem(
                            item.id,
                            "quantity",
                            e.target.value,
                          )
                        }
                        className="
                          h-[52px]
                          w-full
                          rounded-lg
                          border
                          border-slate-200
                          bg-slate-50
                          px-4
                          text-[15px]
                          font-medium
                          text-slate-900
                          outline-none
                          transition
                          hover:border-slate-300
                          focus:border-slate-900
                          focus:bg-white
                          focus:ring-4
                          focus:ring-slate-900/5
                        "
                      />

                    </td>

                    {/* UNIT PRICE */}

                    <td className="px-4 py-6">

                      <div className="relative">

                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[15px] font-semibold text-slate-400">
                          ₹
                        </span>

                        <input
                          type="number"
                          min="0"
                          value={item.price}
                          onChange={(e) =>
                            updateItem(
                              item.id,
                              "price",
                              e.target.value,
                            )
                          }
                          className="
                            h-[52px]
                            w-full
                            rounded-lg
                            border
                            border-slate-200
                            bg-slate-50
                            py-3
                            pl-9
                            pr-4
                            text-[15px]
                            font-medium
                            text-slate-900
                            outline-none
                            transition
                            hover:border-slate-300
                            focus:border-slate-900
                            focus:bg-white
                            focus:ring-4
                            focus:ring-slate-900/5
                          "
                        />

                      </div>

                    </td>

                    {/* AMOUNT */}

                    <td className="px-4 py-6 text-right">

                      <span className="text-[16px] font-bold text-slate-950">
                        {formatCurrency(
                          getItemAmount(item),
                        )}
                      </span>

                    </td>

                    {/* REMOVE */}

                    <td className="px-6 py-6 text-right">

                      <button
                        type="button"
                        onClick={() => removeItem(item.id)}
                        disabled={items.length === 1}
                        className="
                          rounded-lg
                          px-3
                          py-2
                          text-[12px]
                          font-semibold
                          text-red-500
                          transition
                          hover:bg-red-50
                          hover:text-red-700
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

          {/* =================================================
              ADD ITEM
          ================================================= */}

          <div className="border-b border-slate-200 p-6 sm:p-8">

            <button
              type="button"
              onClick={addItem}
              className="
                inline-flex
                h-[48px]
                items-center
                gap-2
                rounded-lg
                border
                border-slate-200
                bg-white
                px-5
                text-[14px]
                font-bold
                text-slate-700
                shadow-sm
                transition
                hover:border-slate-300
                hover:bg-slate-50
              "
            >

              <span className="text-[20px] leading-none">
                +
              </span>

              Add another item

            </button>

          </div>

          {/* =================================================
              TOTALS
          ================================================= */}

          <div className="grid gap-8 p-6 sm:p-8 lg:grid-cols-2">

            {/* LEFT SUMMARY */}

            <div className="hidden lg:block">

              <div className="rounded-xl bg-slate-50 p-7">

                <p className="text-[12px] font-bold uppercase tracking-[0.12em] text-slate-400">
                  Pricing summary
                </p>

                <h4 className="mt-3 text-[21px] font-bold text-slate-950">
                  Review your quotation
                </h4>

                <p className="mt-2 max-w-sm text-[13px] leading-6 text-slate-500">
                  Check the item quantities and pricing before
                  generating the final quotation.
                </p>

                <div className="mt-7 flex items-center gap-3">

                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white text-[15px] font-bold text-emerald-600 shadow-sm">
                    ✓
                  </div>

                  <span className="text-[13px] font-medium text-slate-600">
                    Automatic calculations enabled
                  </span>

                </div>

              </div>

            </div>

            {/* RIGHT TOTALS */}

            <div>

              <div className="rounded-xl border border-slate-200 bg-white p-6 sm:p-7">

                {/* SUBTOTAL */}

                <div className="flex justify-between border-b border-slate-100 pb-5 text-[15px]">

                  <span className="font-medium text-slate-500">
                    Subtotal
                  </span>

                  <span className="font-bold text-slate-800">
                    {formatCurrency(subtotal)}
                  </span>

                </div>

                {/* GST OPTIONAL */}

                {!gstEnabled ? (

                  <div className="py-6">

                    <button
                      type="button"
                      onClick={() => {
                        setGstEnabled(true);
                        setGstRate("");
                      }}
                      className="
                        text-[14px]
                        font-bold
                        text-slate-600
                        transition
                        hover:text-slate-950
                      "
                    >
                      + Add GST
                    </button>

                  </div>

                ) : (

                  <div className="border-b border-slate-100 py-6">

                    <div className="flex items-center justify-between gap-4">

                      <div>

                        <p className="text-[15px] font-bold text-slate-700">
                          GST rate
                        </p>

                        <p className="mt-1 text-[12px] text-slate-400">
                          Enter GST percentage
                        </p>

                      </div>

                      <div className="relative">

                        <input
                          type="number"
                          min="0"
                          value={gstRate}
                          onChange={(e) =>
                            setGstRate(e.target.value)
                          }
                          placeholder="18"
                          className="
                            h-[46px]
                            w-28
                            rounded-lg
                            border
                            border-slate-200
                            bg-slate-50
                            px-3
                            pr-8
                            text-right
                            text-[15px]
                            font-bold
                            outline-none
                            transition
                            focus:border-slate-900
                            focus:bg-white
                            focus:ring-4
                            focus:ring-slate-900/5
                          "
                        />

                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[15px] font-semibold text-slate-400">
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
                      className="mt-3 text-[12px] font-semibold text-red-500 hover:text-red-700"
                    >
                      Remove GST
                    </button>

                  </div>

                )}

                {/* GST AMOUNT */}

                {gstEnabled && Number(gstRate) > 0 && (

                  <div className="flex justify-between border-b border-slate-100 py-5 text-[15px]">

                    <span className="font-medium text-slate-500">
                      GST ({gstRate}%)
                    </span>

                    <span className="font-bold text-slate-800">
                      {formatCurrency(gstAmount)}
                    </span>

                  </div>

                )}

                {/* GRAND TOTAL */}

                <div className="pt-6">

                  <div className="flex items-end justify-between gap-4">

                    <div>

                      <p className="text-[12px] font-bold uppercase tracking-[0.12em] text-slate-400">
                        Grand total
                      </p>

                      <p className="mt-1.5 text-[12px] text-slate-400">
                        {gstEnabled && Number(gstRate) > 0
                          ? "Including GST"
                          : "Before GST"}
                      </p>

                    </div>

                    <span className="text-[28px] font-bold tracking-tight text-slate-950">
                      {formatCurrency(grandTotal)}
                    </span>

                  </div>

                </div>

              </div>

            </div>

          </div>

          {/* =================================================
              FOOTER ACTIONS
          ================================================= */}

          <div className="flex flex-col gap-4 border-t border-slate-200 bg-slate-50/70 p-6 sm:flex-row sm:items-center sm:justify-between sm:px-8">

            <button
              type="button"
              onClick={() => setCurrentStep(1)}
              disabled={saving}
              className="
                inline-flex
                h-[48px]
                items-center
                justify-center
                gap-2
                rounded-lg
                border
                border-slate-200
                bg-white
                px-5
                text-[14px]
                font-bold
                text-slate-700
                shadow-sm
                transition
                hover:bg-slate-50
                disabled:cursor-not-allowed
                disabled:opacity-50
              "
            >
              ← Back to details
            </button>

            <button
              type="button"
              onClick={handleReviewQuotation}
              disabled={saving}
              className="
                group
                inline-flex
                h-[50px]
                items-center
                justify-center
                gap-3
                rounded-lg
                bg-slate-950
                px-7
                text-[14px]
                font-bold
                text-white
                shadow-sm
                transition-all
                duration-200
                hover:bg-slate-800
                hover:shadow-lg
                active:scale-[0.98]
                disabled:cursor-not-allowed
                disabled:opacity-60
              "
            >

              {saving
                ? "Saving quotation..."
                : "Review quotation"}

              {!saving && (
                <span className="text-[18px] transition-transform duration-200 group-hover:translate-x-1">
                  →
                </span>
              )}

            </button>

          </div>

        </div>

        <p className="mt-6 text-center text-[12px] text-slate-400">
          Item amounts are calculated automatically.
        </p>

      </main>

    </div>
  );
}