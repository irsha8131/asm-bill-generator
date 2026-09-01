import React, { useMemo, useRef, useState } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { QRCodeSVG } from "qrcode.react";
import asmLogo from "../assets/asm-logo.jpeg";
import signatureImage from "../assets/sign.jpeg";
import { supabase } from "../utils/supabase";

const LAST_PAGE_ITEMS = 8;
const FIRST_PAGE_ITEMS = 13;
const MAX_CONTINUATION_ITEMS = 15;

const createItemPages = (sourceItems) => {
  const items = Array.isArray(sourceItems) ? sourceItems : [];

  if (items.length === 0) {
    return [[]];
  }

  if (items.length <= LAST_PAGE_ITEMS) {
    return [items];
  }

  const pages = [];
  let cursor = 0;

  const firstCount = Math.min(FIRST_PAGE_ITEMS, items.length);

  pages.push(items.slice(0, firstCount));
  cursor = firstCount;

  const remaining = items.length - cursor;

  if (remaining > 0) {
    if (remaining <= LAST_PAGE_ITEMS) {
      pages.push(items.slice(cursor));
    } else {
      const lastCount = Math.min(LAST_PAGE_ITEMS, remaining);
      const middleCount = remaining - lastCount;
      const middlePageCount = Math.ceil(middleCount / MAX_CONTINUATION_ITEMS);
      const baseCount = Math.floor(middleCount / middlePageCount);
      const extraItems = middleCount % middlePageCount;

      for (let pageIndex = 0; pageIndex < middlePageCount; pageIndex += 1) {
        const pageItemCount = baseCount + (pageIndex < extraItems ? 1 : 0);
        pages.push(items.slice(cursor, cursor + pageItemCount));
        cursor += pageItemCount;
      }

      pages.push(items.slice(cursor));
    }
  } else {
    pages.push([]);
  }

  return pages;
};

export default function BillPreview({
  quotationId,
  shopDetails,
  clientDetails,
  items = [],
  gstEnabled,
  gstRate,
  subtotal,
  discountAmount = 0,
  gstAmount,
  grandTotal,
  STEPS,
  getItemAmount,
  formatCurrency,
  setCurrentStep,
  quotationNumber = "2026-01",
  onSave,
  saving = false,
  quotationDate: propDate,
  setQuotationDate: setPropDate,
}) {
  const quotationRef = useRef(null);

  const [savingPDF, setSavingPDF] = useState(false);
  const [upiId, setUpiId] = useState("");

  // Internal date fallback if not passed
  const [localDate, setLocalDate] = useState(() => new Date().toISOString().split("T")[0]);
  const selectedDate = propDate || localDate;
  const setSelectedDate = setPropDate || setLocalDate;

  const [isEditingDate, setIsEditingDate] = useState(false);

  // Formatted date string (e.g., "01 Sep 2026")
  const formattedQuotationDate = useMemo(() => {
    if (!selectedDate) return "-";
    const parsed = new Date(selectedDate);
    if (Number.isNaN(parsed.getTime())) return String(selectedDate);

    return parsed.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }, [selectedDate]);

  const itemPages = useMemo(() => {
    return createItemPages(items);
  }, [items]);

  const accountDetails = {
    accountName: "ASM INTERIORS",
    accountNumber: "510909010369353",
    ifsc: "CIUB0000572",
    branch: "Podanur",
  };

  const upiPaymentUrl = useMemo(() => {
    const cleanUpi = String(upiId || "").trim();

    if (!cleanUpi || !cleanUpi.includes("@")) {
      return "";
    }

    const params = new URLSearchParams({
      pa: cleanUpi,
      pn: accountDetails.accountName,
      am: Number(grandTotal || 0).toFixed(2),
      cu: "INR",
    });

    return `upi://pay?${params.toString()}`;
  }, [upiId, grandTotal]);

  const professionalNotes = [
    "This quotation is valid for 15 days from the date of issue.",
    "Final pricing is subject to confirmation of design, materials and finishes.",
    "A minimum advance payment is required to confirm the order and commence work.",
    "Delivery and installation timelines will be shared upon order confirmation.",
  ];

  const money = (value) => {
    if (formatCurrency) {
      return formatCurrency(value);
    }

    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
    }).format(Number(value || 0));
  };

  const handleSave = async () => {
    if (saving || savingPDF) return;

    try {
      if (typeof onSave === "function") {
        await onSave();
        alert("Quotation saved successfully.");
        setCurrentStep(STEPS.PAYMENT);
        return;
      }

      if (!quotationId) {
        throw new Error(
          "Quotation ID is missing. Please go back to Details and continue again."
        );
      }

      const { error } = await supabase
        .from("quotations")
        .update({
          quotation_number: quotationNumber,
          quotation_date: selectedDate,
          subtotal: Number(subtotal || 0),
          discount_amount: Number(discountAmount || 0),
          gst_rate: Number(gstRate || 0),
          gst_amount: Number(gstAmount || 0),
          grand_total: Number(grandTotal || 0),
        })
        .eq("id", quotationId);

      if (error) throw error;

      alert("Quotation saved successfully.");
      setCurrentStep(STEPS.PAYMENT);
    } catch (error) {
      console.error("Save quotation error:", error);
      alert(error?.message || "Unable to save quotation. Please try again.");
    }
  };

  const handleSavePDF = async () => {
    if (!quotationRef.current) {
      alert("Quotation is not ready.");
      return;
    }

    try {
      setSavingPDF(true);
      setIsEditingDate(false);

      const pages = Array.from(
        quotationRef.current.querySelectorAll(".quotation-page")
      );

      if (!pages.length) {
        throw new Error("No quotation pages found.");
      }

      await new Promise((resolve) => {
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            resolve();
          });
        });
      });

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
        compress: true,
      });

      for (let pageIndex = 0; pageIndex < pages.length; pageIndex += 1) {
        const page = pages[pageIndex];

        const canvas = await html2canvas(page, {
          scale: 2,
          useCORS: true,
          allowTaint: false,
          backgroundColor: "#ffffff",
          logging: false,
          ignoreElements: (node) => node?.dataset?.pdfIgnore === "true",
        });

        if (pageIndex > 0) {
          pdf.addPage("a4", "portrait");
        }

        pdf.addImage(
          canvas.toDataURL("image/jpeg", 0.98),
          "JPEG",
          0,
          0,
          210,
          297,
          undefined,
          "FAST"
        );
      }

      const safeQuotationNumber = String(quotationNumber || "2026-01").replace(
        /[^a-zA-Z0-9-_]/g,
        ""
      );

      pdf.save(`Quotation_${safeQuotationNumber}.pdf`);
    } catch (error) {
      console.error("PDF generation failed:", error);
      alert("Unable to save PDF. Please try again.");
    } finally {
      setSavingPDF(false);
    }
  };

  const handlePrint = () => {
    setIsEditingDate(false);
    setTimeout(() => {
      window.print();
    }, 50);
  };

  return (
    <div className="bill-preview-page">
      {/* ACTION BAR */}
      <div className="bill-actions" data-pdf-ignore="true">
        <button
          type="button"
          onClick={() => setCurrentStep(2)}
          disabled={saving || savingPDF}
          className="secondary-action"
        >
          ← Back to Items
        </button>

        <div className="action-right">
          {/* EDITABLE DATE PICKER SHORTCUT */}
          <div className="date-picker-action">
            <span className="date-label">📅 Date:</span>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="action-date-input"
              title="Change quotation date"
            />
          </div>

          <button
            type="button"
            onClick={handleSave}
            disabled={saving || savingPDF}
            className="save-action"
          >
            {saving ? (
              <>
                <span className="spinner" />
                Saving...
              </>
            ) : (
              <>
                <span className="button-icon">💾</span>
                Save
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleSavePDF}
            disabled={savingPDF || saving}
            className="secondary-action"
          >
            {savingPDF ? (
              <>
                <span className="spinner" />
                Saving PDF...
              </>
            ) : (
              <>↓ Save PDF</>
            )}
          </button>

          <button
            type="button"
            onClick={handlePrint}
            disabled={saving || savingPDF}
            className="primary-action"
          >
            🖨 Print
          </button>
        </div>
      </div>

      {/* DOCUMENT CONTAINER */}
      <div className="document-viewport">
        <div ref={quotationRef} className="quotation-document">
          {itemPages.map((pageItems, pageIndex) => {
            const isFirstPage = pageIndex === 0;
            const isLastPage = pageIndex === itemPages.length - 1;

            const previousItems = itemPages
              .slice(0, pageIndex)
              .reduce((total, page) => total + page.length, 0);

            return (
              <div className="quotation-page" key={`quotation-page-${pageIndex}`}>
                {isFirstPage && (
                  <>
                    <header className="quotation-header">
                      <div className="company-section">
                        <div className="logo-box">
                          <img src={asmLogo} alt="ASM Interiors" crossOrigin="anonymous" />
                        </div>

                        <div className="company-info">
                          <h1>ASM INTERIORS</h1>
                          <p className="company-tagline">
                            Interior Design & Commercial Works
                          </p>
                          <p className="company-contact">{shopDetails?.address}</p>
                          <p className="company-contact">
                            {shopDetails?.phone}
                            <span>{" • "}</span>
                            {shopDetails?.email}
                          </p>
                          {shopDetails?.gst && (
                            <p className="company-gst">GSTIN: {shopDetails.gst}</p>
                          )}
                        </div>
                      </div>

                      <div className="quotation-number-section">
                        <p className="quotation-label">QUOTATION</p>
                        <h2>#{quotationNumber}</h2>
                        <div className="quotation-meta">
                          <div>
                            <span>Date</span>
                            <div className="editable-date-container">
                              {isEditingDate ? (
                                <input
                                  type="date"
                                  value={selectedDate}
                                  autoFocus
                                  onBlur={() => setIsEditingDate(false)}
                                  onChange={(e) => setSelectedDate(e.target.value)}
                                  className="inline-date-input"
                                />
                              ) : (
                                <strong
                                  onClick={() => setIsEditingDate(true)}
                                  className="clickable-date"
                                  title="Click to edit date"
                                >
                                  {formattedQuotationDate}
                                  <span className="edit-date-pencil" data-pdf-ignore="true">✎</span>
                                </strong>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </header>

                    <div className="section-line" />

                    <section className="details-section">
                      <div className="client-block">
                        <p className="section-label">BILL TO</p>
                        <h3>
                          {clientDetails?.shopName || clientDetails?.name || "Client Name"}
                        </h3>
                        {clientDetails?.shopName && clientDetails?.name && (
                          <p className="client-name">{clientDetails.name}</p>
                        )}
                        {clientDetails?.address && (
                          <p className="client-address">{clientDetails.address}</p>
                        )}
                        {clientDetails?.phone && (
                          <p className="client-contact">{clientDetails.phone}</p>
                        )}
                        {clientDetails?.email && (
                          <p className="client-contact">{clientDetails.email}</p>
                        )}
                        {clientDetails?.gst && (
                          <p className="client-gst">GSTIN: {clientDetails.gst}</p>
                        )}
                      </div>

                      <div className="quotation-details">
                        <p className="section-label">QUOTATION DETAILS</p>
                        <div className="detail-row">
                          <span>Reference</span>
                          <strong>#{quotationNumber}</strong>
                        </div>
                        <div className="detail-row">
                          <span>Date</span>
                          <strong>{formattedQuotationDate}</strong>
                        </div>
                        <div className="detail-row">
                          <span>Prepared by</span>
                          <strong>ASM INTERIORS</strong>
                        </div>
                      </div>
                    </section>
                  </>
                )}

                {!isFirstPage && (
                  <div className="continuation-header">
                    <div className="continuation-company">
                      <img src={asmLogo} alt="ASM Interiors" crossOrigin="anonymous" />
                      <div>
                        <strong>ASM INTERIORS</strong>
                        <span>Quotation #{quotationNumber}</span>
                      </div>
                    </div>

                    <div className="continued-label">
                      {pageItems.length === 0 && isLastPage ? (
                        <>
                          TOTALS &<br />
                          SIGNATURE
                        </>
                      ) : (
                        <>
                          QUOTATION
                          <br />
                          CONTINUED
                        </>
                      )}
                    </div>
                  </div>
                )}

                {pageItems.length > 0 && (
                  <section
                    className={`items-section ${!isFirstPage ? "continuation-items" : ""}`}
                  >
                    <table className="items-table">
                      <thead>
                        <tr>
                          <th className="number-column">#</th>
                          <th>DESCRIPTION</th>
                          <th className="qty-column">QTY</th>
                          <th className="price-column">UNIT PRICE</th>
                          <th className="amount-column">AMOUNT</th>
                        </tr>
                      </thead>

                      <tbody>
                        {pageItems.map((item, itemIndex) => {
                          const globalIndex = previousItems + itemIndex;

                          const amount = getItemAmount
                            ? getItemAmount(item)
                            : Number(item.quantity || 0) * Number(item.price || 0);

                          return (
                            <tr key={item.id || `item-${globalIndex}`}>
                              <td className="number-column">
                                {String(globalIndex + 1).padStart(2, "0")}
                              </td>
                              <td className="description-cell">
                                {item.description || "Interior work"}
                              </td>
                              <td className="qty-column">{item.quantity}</td>
                              <td className="price-column">{money(item.price)}</td>
                              <td className="amount-column">{money(amount)}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </section>
                )}

                {isLastPage && (
                  <>
                    <section className="totals-section">
                      <div className="totals-box">
                        <div className="total-row">
                          <span>Subtotal</span>
                          <strong>{money(subtotal)}</strong>
                        </div>

                        {Number(discountAmount || 0) > 0 && (
                          <div className="total-row discount-row">
                            <span>Discount</span>
                            <strong>-{money(discountAmount)}</strong>
                          </div>
                        )}

                        {Number(discountAmount || 0) > 0 && (
                          <div className="total-row">
                            <span>After Discount</span>
                            <strong>
                              {money(
                                Math.max(
                                  0,
                                  Number(subtotal || 0) - Number(discountAmount || 0)
                                )
                              )}
                            </strong>
                          </div>
                        )}

                        {gstEnabled && Number(gstRate || 0) > 0 && (
                          <div className="total-row">
                            <span>GST ({gstRate}%)</span>
                            <strong>{money(gstAmount)}</strong>
                          </div>
                        )}

                        <div className="grand-total-line" />

                        <div className="grand-total-row">
                          <div>
                            <p>GRAND TOTAL</p>
                            <span>
                              {gstEnabled && Number(gstRate || 0) > 0
                                ? "Including GST"
                                : "GST not included"}
                            </span>
                          </div>

                          <strong>{money(grandTotal)}</strong>
                        </div>
                      </div>
                    </section>

                    <section className="notes-section">
                      <div>
                        <p className="section-label">NOTES</p>
                        <div className="notes-list">
                          {professionalNotes.map((note, index) => (
                            <div className="note-row" key={index}>
                              <span className="note-dot">
                                {String(index + 1).padStart(2, "0")}
                              </span>
                              <span>{note}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </section>

                    <section className="account-section">
                      <div className="account-header">
                        <div>
                          <p className="section-label">ACCOUNT DETAILS</p>
                          <h3>Bank Transfer</h3>
                        </div>
                        <span className="account-secure">ASM INTERIORS</span>
                      </div>

                      <div className="account-grid">
                        <div className="account-item">
                          <span>ACCOUNT NAME</span>
                          <strong>{accountDetails.accountName}</strong>
                        </div>
                        <div className="account-item">
                          <span>ACCOUNT NUMBER</span>
                          <strong>{accountDetails.accountNumber}</strong>
                        </div>
                        <div className="account-item">
                          <span>IFSC CODE</span>
                          <strong>{accountDetails.ifsc}</strong>
                        </div>
                        <div className="account-item">
                          <span>BRANCH</span>
                          <strong>{accountDetails.branch}</strong>
                        </div>
                      </div>

                      <div className="upi-section">
                        <div className="upi-heading">
                          <p className="section-label">UPI PAYMENT</p>
                          <span>Enter UPI ID to generate QR</span>
                        </div>

                        <div className="upi-content">
                          <div className="upi-input-wrapper">
                            <label htmlFor="upi-id">UPI ID</label>
                            <input
                              id="upi-id"
                              type="text"
                              value={upiId}
                              onChange={(e) => setUpiId(e.target.value)}
                              placeholder="example@upi"
                              spellCheck="false"
                              autoComplete="off"
                            />
                          </div>

                          {upiPaymentUrl && (
                            <div className="upi-qr-area">
                              <div className="upi-qr-card">
                                <QRCodeSVG
                                  value={upiPaymentUrl}
                                  size={92}
                                  bgColor="#ffffff"
                                  fgColor="#1E2A38"
                                  level="M"
                                  includeMargin={false}
                                />
                              </div>
                              <div className="upi-qr-copy">
                                <strong>SCAN TO PAY</strong>
                                <span>{money(grandTotal)}</span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </section>

                    <section className="signature-section">
                      <div className="signature-box">
                        <img
                          src={signatureImage}
                          alt="Authorized signature"
                          crossOrigin="anonymous"
                          className="signature-image"
                        />
                        <div className="signature-line" />
                        <p>AUTHORIZED SIGNATURE</p>
                        <span>For ASM INTERIORS</span>
                      </div>
                    </section>
                  </>
                )}

                <footer className="quotation-footer">
                  <strong>
                    {isLastPage
                      ? "Thank you for choosing ASM INTERIORS"
                      : `Quotation #${quotationNumber || "2026-01"} — Continued`}
                  </strong>
                  <p>
                    Page {pageIndex + 1} of {itemPages.length}
                    {" • "}
                    {shopDetails?.phone}
                    <span>{" • "}</span>
                    {shopDetails?.email}
                  </p>
                </footer>
              </div>
            );
          })}
        </div>
      </div>

      <style>{`
        * {
          box-sizing: border-box;
        }

        .bill-preview-page {
          min-height: 100vh;
          background: #F5F2EA;
          padding: 20px 12px 40px;
          color: #1E2A38;
          font-family: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif;
        }

        .bill-actions {
          width: 794px;
          max-width: 100%;
          margin: 0 auto 16px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 10px;
        }

        .action-right {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
        }

        .date-picker-action {
          display: flex;
          align-items: center;
          gap: 6px;
          background: #ffffff;
          border: 1px solid #D9D3C3;
          padding: 0 10px;
          height: 42px;
          border-radius: 3px;
        }

        .date-label {
          font-size: 11.5px;
          font-weight: 600;
          color: #5B5647;
        }

        .action-date-input {
          border: none;
          outline: none;
          font-size: 12px;
          font-weight: 600;
          color: #1E2A38;
          background: transparent;
          cursor: pointer;
        }

        .editable-date-container {
          display: inline-block;
        }

        .clickable-date {
          cursor: pointer;
          border-bottom: 1px dashed #9C6B30;
          padding-bottom: 1px;
          transition: color 0.15s ease;
        }

        .clickable-date:hover {
          color: #9C6B30;
        }

        .edit-date-pencil {
          margin-left: 4px;
          font-size: 10px;
          color: #9C6B30;
        }

        .inline-date-input {
          font-size: 10px;
          font-weight: 700;
          border: 1px solid #9C6B30;
          padding: 2px 4px;
          border-radius: 2px;
          outline: none;
          color: #1E2A38;
          background: #FAF8F2;
        }

        .secondary-action,
        .primary-action,
        .save-action {
          height: 42px;
          padding: 0 16px;
          border-radius: 3px;
          font-size: 12.5px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.15s ease, transform 0.15s ease;
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }

        .secondary-action {
          border: 1px solid #1E2A38;
          background: #ffffff;
          color: #1E2A38;
        }

        .secondary-action:hover {
          background: #1E2A38;
          color: #ffffff;
        }

        .save-action {
          border: 1px solid #3F6B4A;
          background: #3F6B4A;
          color: #ffffff;
        }

        .save-action:hover {
          background: #345A3E;
        }

        .primary-action {
          border: 1px solid #9C6B30;
          background: #9C6B30;
          color: #ffffff;
        }

        .primary-action:hover {
          background: #7F5525;
        }

        .secondary-action:disabled,
        .primary-action:disabled,
        .save-action:disabled {
          opacity: 0.6;
          cursor: wait;
          transform: none;
        }

        .button-icon {
          margin-right: 5px;
        }

        .spinner {
          display: inline-block;
          width: 14px;
          height: 14px;
          margin-right: 7px;
          border: 2px solid rgba(255, 255, 255, 0.4);
          border-top-color: #ffffff;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        .document-viewport {
          width: 100%;
          overflow-x: auto;
          padding-bottom: 20px;
        }

        .quotation-document {
          width: 794px;
          margin: 0 auto;
        }

        .quotation-page {
          width: 794px;
          height: 1123px;
          margin: 0 auto 20px;
          background: #ffffff;
          border: 1px solid #D9D3C3;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          position: relative;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
        }

        .quotation-page:last-child {
          margin-bottom: 0;
        }

        .quotation-header {
          padding: 31px 40px 22px;
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 20px;
        }

        .company-section {
          display: flex;
          align-items: flex-start;
          gap: 15px;
          min-width: 0;
        }

        .logo-box {
          width: 64px;
          height: 64px;
          flex: 0 0 64px;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          border: 1px solid #D9D3C3;
        }

        .logo-box img {
          width: 100%;
          height: 100%;
          object-fit: contain;
        }

        .company-info {
          padding-top: 1px;
        }

        .company-info h1 {
          margin: 0;
          font-family: Georgia, "Times New Roman", serif;
          font-size: 24px;
          line-height: 1.1;
          font-weight: 700;
          letter-spacing: -0.3px;
          color: #1E2A38;
        }

        .company-tagline {
          margin: 5px 0 9px;
          font-size: 11px;
          font-weight: 600;
          color: #9C6B30;
        }

        .company-contact,
        .company-gst {
          margin: 3px 0;
          font-size: 9px;
          line-height: 1.45;
          color: #6B6558;
        }

        .company-gst {
          color: #3A362C;
          font-weight: 700;
        }

        .quotation-number-section {
          min-width: 145px;
          text-align: right;
          padding-top: 3px;
        }

        .quotation-label {
          margin: 0;
          font-size: 8px;
          font-weight: 700;
          letter-spacing: 0.18em;
          color: #9C6B30;
        }

        .quotation-number-section h2 {
          margin: 5px 0 8px;
          font-family: Georgia, "Times New Roman", serif;
          font-size: 19px;
          line-height: 1;
          font-weight: 700;
          letter-spacing: -0.2px;
          color: #1E2A38;
        }

        .quotation-meta {
          display: flex;
          flex-direction: column;
          gap: 3px;
        }

        .quotation-meta div {
          display: flex;
          justify-content: flex-end;
          gap: 10px;
          font-size: 9px;
        }

        .quotation-meta span {
          color: #8A8371;
        }

        .quotation-meta strong {
          min-width: 60px;
          color: #1E2A38;
        }

        .section-line {
          margin: 0 40px;
          border-top: 1px solid #D9D3C3;
        }

        .details-section {
          padding: 20px 40px 18px;
          display: grid;
          grid-template-columns: 1.25fr 0.75fr;
          gap: 45px;
        }

        .section-label {
          margin: 0 0 8px;
          font-size: 8px;
          line-height: 1;
          font-weight: 700;
          letter-spacing: 0.16em;
          color: #9C6B30;
        }

        .client-block h3 {
          margin: 0;
          font-family: Georgia, "Times New Roman", serif;
          font-size: 15px;
          line-height: 1.3;
          font-weight: 700;
          color: #1E2A38;
        }

        .client-name {
          margin: 4px 0 0;
          font-size: 10px;
          font-weight: 600;
          color: #5B5647;
        }

        .client-address {
          margin: 7px 0 5px;
          max-width: 370px;
          white-space: pre-line;
          font-size: 9.5px;
          line-height: 1.5;
          color: #6B6558;
        }

        .client-contact,
        .client-gst {
          margin: 3px 0;
          font-size: 9.5px;
          color: #6B6558;
        }

        .client-gst {
          margin-top: 6px;
          font-weight: 700;
          color: #3A362C;
        }

        .quotation-details {
          text-align: right;
        }

        .quotation-details .section-label {
          text-align: right;
          margin-bottom: 7px;
        }

        .detail-row {
          display: flex;
          justify-content: flex-end;
          align-items: center;
          gap: 9px;
          margin-bottom: 4px;
          font-size: 9px;
          line-height: 1.25;
        }

        .detail-row:last-child {
          margin-bottom: 0;
        }

        .detail-row span {
          color: #8A8371;
        }

        .detail-row strong {
          min-width: 82px;
          color: #1E2A38;
          font-weight: 700;
        }

        .continuation-header {
          margin: 0 40px;
          padding: 25px 0 18px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid #D9D3C3;
        }

        .continuation-company {
          display: flex;
          align-items: center;
          gap: 11px;
        }

        .continuation-company img {
          width: 38px;
          height: 38px;
          object-fit: contain;
        }

        .continuation-company div {
          display: flex;
          flex-direction: column;
          gap: 3px;
        }

        .continuation-company strong {
          font-family: Georgia, "Times New Roman", serif;
          font-size: 14px;
          font-weight: 700;
          color: #1E2A38;
        }

        .continuation-company span {
          font-size: 8px;
          color: #8A8371;
        }

        .continued-label {
          text-align: right;
          font-size: 7px;
          line-height: 1.4;
          font-weight: 700;
          letter-spacing: 0.14em;
          color: #9C6B30;
        }

        .items-section {
          padding: 0 40px;
        }

        .continuation-items {
          padding-top: 20px;
        }

        .items-table {
          width: 100%;
          border-collapse: separate;
          border-spacing: 0;
          overflow: hidden;
          border: 1px solid #D9D3C3;
          border-radius: 3px;
          font-size: 11px;
          table-layout: fixed;
        }

        .items-table thead {
          background: #1E2A38;
          color: #F4E9D8;
        }

        .items-table th {
          padding: 11px 12px;
          font-size: 8px;
          font-weight: 700;
          letter-spacing: 0.07em;
          text-align: left;
          white-space: nowrap;
        }

        .items-table td {
          padding: 11px 12px;
          border-bottom: 1px solid #EDE8DA;
          color: #3A362C;
          vertical-align: middle;
        }

        .items-table tbody tr:last-child td {
          border-bottom: none;
        }

        .number-column {
          width: 44px;
          text-align: center !important;
        }

        .qty-column {
          width: 75px;
          text-align: center !important;
        }

        .price-column {
          width: 120px;
          text-align: right !important;
        }

        .amount-column {
          width: 130px;
          text-align: right !important;
        }

        .items-table td.number-column {
          color: #9C6B30;
          font-weight: 700;
        }

        .description-cell {
          font-size: 10.5px;
          font-weight: 600;
          color: #1E2A38 !important;
          word-break: break-word;
        }

        .items-table td.amount-column {
          font-size: 11px;
          font-weight: 700;
          color: #1E2A38;
        }

        .totals-section {
          display: flex;
          justify-content: flex-end;
          padding: 10px 40px 10px;
        }

        .totals-box {
          width: 325px;
        }

        .total-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 4px 0;
          font-size: 10px;
        }

        .total-row span {
          color: #6B6558;
        }

        .total-row strong {
          color: #1E2A38;
        }

        .discount-row strong {
          color: #B24A3C;
        }

        .grand-total-line {
          margin: 7px 0 10px;
          border-top: 2px solid #1E2A38;
        }

        .grand-total-row {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 15px;
        }

        .grand-total-row p {
          margin: 0;
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 0.1em;
          color: #9C6B30;
        }

        .grand-total-row span {
          display: block;
          margin-top: 3px;
          font-size: 8px;
          color: #8A8371;
        }

        .grand-total-row > strong {
          font-family: Georgia, "Times New Roman", serif;
          font-size: 21px;
          line-height: 1;
          font-weight: 700;
          letter-spacing: -0.3px;
          color: #1E2A38;
        }

        .notes-section {
          border-top: 1px solid #EDE8DA;
          padding: 9px 40px 8px;
        }

        .notes-list {
          display: grid;
          grid-template-columns: 1fr 1fr;
          column-gap: 28px;
          row-gap: 6px;
        }

        .note-row {
          display: flex;
          align-items: flex-start;
          gap: 8px;
          font-size: 8.5px;
          line-height: 1.35;
          color: #6B6558;
        }

        .note-dot {
          flex: 0 0 auto;
          font-size: 7px;
          font-weight: 700;
          color: #9C6B30;
        }

        .account-section {
          margin: 0 40px;
          padding: 8px 0 8px;
          border-top: 1px solid #EDE8DA;
          border-bottom: 1px solid #EDE8DA;
        }

        .account-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 10px;
        }

        .account-header .section-label {
          margin-bottom: 4px;
        }

        .account-header h3 {
          margin: 0;
          font-family: Georgia, "Times New Roman", serif;
          font-size: 13px;
          font-weight: 700;
          color: #1E2A38;
        }

        .account-secure {
          padding: 4px 8px;
          border-radius: 3px;
          background: #FAF8F2;
          border: 1px solid #D9D3C3;
          font-size: 7px;
          font-weight: 700;
          letter-spacing: 0.08em;
          color: #6B6558;
        }

        .account-grid {
          display: grid;
          grid-template-columns: 1.2fr 1.2fr 0.8fr 0.8fr;
          gap: 10px;
          padding: 10px 12px;
          border: 1px dashed #D9D3C3;
          border-radius: 3px;
          background: #FAF8F2;
        }

        .account-item {
          display: flex;
          flex-direction: column;
          gap: 3px;
        }

        .account-item span {
          font-size: 7px;
          font-weight: 700;
          letter-spacing: 0.1em;
          color: #8A8371;
        }

        .account-item strong {
          font-size: 9.5px;
          font-weight: 700;
          color: #1E2A38;
          white-space: nowrap;
        }

        .upi-section {
          margin-top: 7px;
          padding-top: 6px;
          border-top: 1px solid #EDE8DA;
        }

        .upi-heading {
          display: flex;
          align-items: baseline;
          justify-content: space-between;
          margin-bottom: 7px;
        }

        .upi-heading .section-label {
          margin: 0;
        }

        .upi-heading > span {
          font-size: 7.5px;
          color: #8A8371;
        }

        .upi-content {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 18px;
        }

        .upi-input-wrapper {
          display: flex;
          align-items: center;
          gap: 10px;
          flex: 1;
        }

        .upi-input-wrapper label {
          font-size: 8px;
          font-weight: 600;
          color: #8A8371;
        }

        .upi-input-wrapper input {
          width: 260px;
          height: 28px;
          padding: 0 9px;
          border: 1px solid #D9D3C3;
          border-radius: 3px;
          outline: none;
          background: #ffffff;
          color: #1E2A38;
          font-size: 9px;
          font-weight: 600;
        }

        .upi-input-wrapper input:focus {
          border-color: #9C6B30;
          box-shadow: 0 0 0 1px rgba(156, 107, 48, 0.25);
        }

        .upi-input-wrapper input::placeholder {
          color: #B3AC98;
        }

        .upi-qr-area {
          display: flex;
          align-items: center;
          gap: 9px;
        }

        .upi-qr-card {
          width: 82px;
          height: 82px;
          padding: 5px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #ffffff;
          border: 1px solid #D9D3C3;
          border-radius: 3px;
        }

        .upi-qr-card svg {
          display: block;
          width: 70px;
          height: 70px;
        }

        .upi-qr-copy {
          display: flex;
          flex-direction: column;
          gap: 3px;
        }

        .upi-qr-copy strong {
          font-size: 7px;
          letter-spacing: 0.12em;
          color: #6B6558;
        }

        .upi-qr-copy span {
          font-size: 10px;
          font-weight: 700;
          color: #1E2A38;
        }

        .signature-section {
          display: flex;
          justify-content: flex-end;
          padding: 6px 40px 6px;
        }

        .signature-box {
          width: 190px;
          text-align: center;
        }

        .signature-image {
          display: block;
          height: 56px;
          width: auto;
          max-width: 100%;
          margin: 0 auto 4px;
          object-fit: contain;
          filter: grayscale(1) contrast(2.4) brightness(0.5);
        }

        .signature-line {
          border-top: 1px solid #D9D3C3;
          margin-bottom: 6px;
        }

        .signature-box p {
          margin: 0;
          font-size: 8px;
          font-weight: 700;
          color: #1E2A38;
        }

        .signature-box span {
          display: block;
          margin-top: 3px;
          font-size: 7px;
          color: #8A8371;
        }

        .quotation-footer {
          margin-top: auto;
          border-top: 1px solid #D9D3C3;
          background: #FAF8F2;
          padding: 8px 40px 7px;
          text-align: center;
          flex-shrink: 0;
        }

        .quotation-footer strong {
          display: block;
          font-size: 9px;
          font-weight: 700;
          color: #1E2A38;
        }

        .quotation-footer p {
          margin: 2px 0 0;
          font-size: 7px;
          color: #8A8371;
        }

        @media print {
          @page {
            size: A4 portrait;
            margin: 0;
          }

          html,
          body {
            margin: 0 !important;
            padding: 0 !important;
            width: 210mm !important;
            background: #ffffff !important;
          }

          body {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          .bill-preview-page {
            margin: 0 !important;
            padding: 0 !important;
            background: #ffffff !important;
          }

          .bill-actions {
            display: none !important;
          }

          .document-viewport {
            overflow: visible !important;
            padding: 0 !important;
          }

          .quotation-document {
            width: 210mm !important;
            max-width: none !important;
            margin: 0 !important;
          }

          .quotation-page {
            width: 210mm !important;
            height: 297mm !important;
            min-height: 297mm !important;
            max-height: 297mm !important;
            margin: 0 !important;
            box-shadow: none !important;
            overflow: hidden !important;
            break-after: page;
            page-break-after: always;
          }

          .quotation-page:last-child {
            break-after: auto;
            page-break-after: auto;
          }

          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }
      `}</style>
    </div>
  );
}