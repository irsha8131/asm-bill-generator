import React, { useMemo, useRef, useState } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { QRCodeSVG } from "qrcode.react";
import asmLogo from "../assets/asm-logo.jpeg";

export default function BillPreview({
  shopDetails,
  clientDetails,
  items = [],
  gstEnabled,
  gstRate,
  subtotal,
  gstAmount,
  grandTotal,
  getItemAmount,
  formatCurrency,
  setCurrentStep,
  quotationNumber = "2026-01",
}) {
  const quotationRef = useRef(null);

  const [savingPDF, setSavingPDF] = useState(false);
  const [upiId, setUpiId] = useState("");

  /* =========================================================
     DATE
  ========================================================= */

  const quotationDate = useMemo(() => {
    return new Date().toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }, []);

  /* =========================================================
     FIXED ACCOUNT DETAILS
  ========================================================= */

  const accountDetails = {
    accountName: "ASM INTERIORS",
    accountNumber: "510909010369353",
    ifsc: "CIUB0000572",
    branch: "Podanur",
  };

  /* =========================================================
     UPI PAYMENT URL
  ========================================================= */

  const upiPaymentUrl = useMemo(() => {
    const cleanUpi = upiId.trim();

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

  /* =========================================================
     PROFESSIONAL NOTES
  ========================================================= */

  const professionalNotes = [
    "This quotation is valid for 15 days from the date of issue.",
    "Final pricing is subject to confirmation of design, materials and finishes.",
    "A minimum advance payment is required to confirm the order and commence work.",
    "Delivery and installation timelines will be shared upon order confirmation.",
  ];

  /* =========================================================
     MONEY FORMAT
  ========================================================= */

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

  /* =========================================================
     SAVE PDF
  ========================================================= */

  const handleSavePDF = async () => {
    if (!quotationRef.current) {
      alert("Quotation is not ready.");
      return;
    }

    try {
      setSavingPDF(true);

      const element = quotationRef.current;

      await new Promise((resolve) => {
        requestAnimationFrame(() => {
          requestAnimationFrame(resolve);
        });
      });

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: false,
        backgroundColor: "#ffffff",
        logging: false,

        ignoreElements: (node) => {
          return node?.dataset?.pdfIgnore === "true";
        },
      });

      const imgData = canvas.toDataURL("image/jpeg", 0.98);

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
        compress: true,
      });

      const pageWidth = 210;
      const pageHeight = 297;

      const margin = 4;

      const usableWidth = pageWidth - margin * 2;

      let imageWidth = usableWidth;

      let imageHeight =
        (canvas.height * imageWidth) / canvas.width;

      /*
       * Keep everything inside one A4 page.
       */

      if (imageHeight > pageHeight - margin * 2) {
        const scale =
          (pageHeight - margin * 2) / imageHeight;

        imageWidth *= scale;
        imageHeight *= scale;
      }

      const x =
        (pageWidth - imageWidth) / 2;

      const y = margin;

      pdf.addImage(
        imgData,
        "JPEG",
        x,
        y,
        imageWidth,
        imageHeight,
        undefined,
        "FAST",
      );

      const safeQuotationNumber = String(
        quotationNumber || "2026-01",
      ).replace(/[^a-zA-Z0-9-_]/g, "");

      pdf.save(
        `Quotation_${safeQuotationNumber}.pdf`,
      );
    } catch (error) {
      console.error("PDF generation failed:", error);

      alert(
        "Unable to save PDF. Please try again.",
      );
    } finally {
      setSavingPDF(false);
    }
  };

  /* =========================================================
     PRINT
  ========================================================= */

  const handlePrint = () => {
    window.print();
  };

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <div className="bill-preview-page">

      {/* =====================================================
          ACTION BAR
      ===================================================== */}

      <div
        className="bill-actions"
        data-pdf-ignore="true"
      >
        <button
          type="button"
          onClick={() => setCurrentStep(2)}
          className="secondary-action"
        >
          ← Back to Items
        </button>

        <div className="action-right">

          <button
            type="button"
            onClick={handleSavePDF}
            disabled={savingPDF}
            className="secondary-action"
          >
            {savingPDF ? (
              <>
                <span className="spinner" />
                Saving...
              </>
            ) : (
              "↓ Save PDF"
            )}
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="primary-action"
          >
            🖨 Print Quotation
          </button>

        </div>
      </div>

      {/* =====================================================
          A4 DOCUMENT
      ===================================================== */}

      <div
        ref={quotationRef}
        className="quotation-a4"
      >

        {/* ===================================================
            HEADER
        =================================================== */}

        <header className="quotation-header">

          <div className="company-section">

            <div className="logo-box">
              <img
                src={asmLogo}
                alt="ASM Interiors"
                crossOrigin="anonymous"
              />
            </div>

            <div className="company-info">

              <h1>
                ASM INTERIORS
              </h1>

              <p className="company-tagline">
                Interior Design & Commercial Works
              </p>

              <p className="company-contact">
                {shopDetails?.address}
              </p>

              <p className="company-contact">
                {shopDetails?.phone}
                <span> • </span>
                {shopDetails?.email}
              </p>

              {shopDetails?.gst && (
                <p className="company-gst">
                  GSTIN: {shopDetails.gst}
                </p>
              )}

            </div>

          </div>

          {/* QUOTATION NUMBER */}

          <div className="quotation-number-section">

            <p className="quotation-label">
              QUOTATION
            </p>

            <h2>
              #{quotationNumber}
            </h2>

            <div className="quotation-meta">

              <div>
                <span>Date</span>
                <strong>
                  {quotationDate}
                </strong>
              </div>

            </div>

          </div>

        </header>

        <div className="section-line" />

        {/* ===================================================
            BILL TO + QUOTATION DETAILS
        =================================================== */}

        <section className="details-section">

          {/* BILL TO */}

          <div className="client-block">

            <p className="section-label">
              BILL TO
            </p>

            <h3>
              {clientDetails?.shopName ||
                clientDetails?.name ||
                "Client Name"}
            </h3>

            {clientDetails?.shopName &&
              clientDetails?.name && (
                <p className="client-name">
                  {clientDetails.name}
                </p>
              )}

            {clientDetails?.address && (
              <p className="client-address">
                {clientDetails.address}
              </p>
            )}

            {clientDetails?.phone && (
              <p className="client-contact">
                {clientDetails.phone}
              </p>
            )}

            {clientDetails?.email && (
              <p className="client-contact">
                {clientDetails.email}
              </p>
            )}

            {clientDetails?.gst && (
              <p className="client-gst">
                GSTIN: {clientDetails.gst}
              </p>
            )}

          </div>

          {/* QUOTATION DETAILS */}

          <div className="quotation-details">

            <p className="section-label">
              QUOTATION DETAILS
            </p>

            <div className="detail-row">
              <span>Reference</span>
              <strong>
                #{quotationNumber}
              </strong>
            </div>

            <div className="detail-row">
              <span>Date</span>
              <strong>
                {quotationDate}
              </strong>
            </div>

            <div className="detail-row">
              <span>Prepared by</span>
              <strong>
                ASM INTERIORS
              </strong>
            </div>

          </div>

        </section>

        {/* ===================================================
            ITEMS
        =================================================== */}

        <section className="items-section">

          <table className="items-table">

            <thead>

              <tr>

                <th className="number-column">
                  #
                </th>

                <th>
                  DESCRIPTION
                </th>

                <th className="qty-column">
                  QTY
                </th>

                <th className="price-column">
                  UNIT PRICE
                </th>

                <th className="amount-column">
                  AMOUNT
                </th>

              </tr>

            </thead>

            <tbody>

              {items.map((item, index) => (

                <tr key={item.id || index}>

                  <td className="number-column">
                    {String(index + 1).padStart(
                      2,
                      "0",
                    )}
                  </td>

                  <td className="description-cell">
                    {item.description ||
                      "Interior work"}
                  </td>

                  <td className="qty-column">
                    {item.quantity}
                  </td>

                  <td className="price-column">
                    {money(item.price)}
                  </td>

                  <td className="amount-column">
                    {money(
                      getItemAmount
                        ? getItemAmount(item)
                        : Number(
                            item.quantity || 0,
                          ) *
                            Number(
                              item.price || 0,
                            ),
                    )}
                  </td>

                </tr>

              ))}

              {items.length === 0 && (
                <tr>
                  <td
                    colSpan="5"
                    className="empty-items"
                  >
                    No quotation items
                  </td>
                </tr>
              )}

            </tbody>

          </table>

        </section>

        {/* ===================================================
            TOTALS
        =================================================== */}

        <section className="totals-section">

          <div className="totals-box">

            <div className="total-row">

              <span>
                Subtotal
              </span>

              <strong>
                {money(subtotal)}
              </strong>

            </div>

            {gstEnabled &&
              Number(gstRate) > 0 && (
                <div className="total-row">

                  <span>
                    GST ({gstRate}%)
                  </span>

                  <strong>
                    {money(gstAmount)}
                  </strong>

                </div>
              )}

            <div className="grand-total-line" />

            <div className="grand-total-row">

              <div>

                <p>
                  GRAND TOTAL
                </p>

                <span>
                  {gstEnabled &&
                  Number(gstRate) > 0
                    ? "Including GST"
                    : "GST not included"}
                </span>

              </div>

              <strong>
                {money(grandTotal)}
              </strong>

            </div>

          </div>

        </section>

        {/* ===================================================
            NOTES
        =================================================== */}

        <section className="notes-section">

          <div>

            <p className="section-label">
              NOTES
            </p>

            <div className="notes-list">

              {professionalNotes.map(
                (note, index) => (
                  <div
                    className="note-row"
                    key={index}
                  >
                    <span className="note-dot">
                      {String(index + 1).padStart(
                        2,
                        "0",
                      )}
                    </span>

                    <span>
                      {note}
                    </span>
                  </div>
                ),
              )}

            </div>

          </div>

        </section>

        {/* ===================================================
            ACCOUNT DETAILS
        =================================================== */}

        <section className="account-section">

          <div className="account-header">

            <div>

              <p className="section-label">
                ACCOUNT DETAILS
              </p>

              <h3>
                Bank Transfer
              </h3>

            </div>

            <span className="account-secure">
              ASM INTERIORS
            </span>

          </div>

          <div className="account-grid">

            <div className="account-item">

              <span>
                ACCOUNT NAME
              </span>

              <strong>
                {accountDetails.accountName}
              </strong>

            </div>

            <div className="account-item">

              <span>
                ACCOUNT NUMBER
              </span>

              <strong>
                {accountDetails.accountNumber}
              </strong>

            </div>

            <div className="account-item">

              <span>
                IFSC CODE
              </span>

              <strong>
                {accountDetails.ifsc}
              </strong>

            </div>

            <div className="account-item">

              <span>
                BRANCH
              </span>

              <strong>
                {accountDetails.branch}
              </strong>

            </div>

          </div>

          {/* UPI */}

          <div className="upi-section">

            <div className="upi-heading">

              <p className="section-label">
                UPI PAYMENT
              </p>

              <span>
                Enter UPI ID to generate QR
              </span>

            </div>

            <div className="upi-content">

              <div className="upi-input-wrapper">

                <label htmlFor="upi-id">
                  UPI ID
                </label>

                <input
                  id="upi-id"
                  type="text"
                  value={upiId}
                  onChange={(e) =>
                    setUpiId(
                      e.target.value,
                    )
                  }
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
                      fgColor="#080d1d"
                      level="M"
                      includeMargin={false}
                    />

                  </div>

                  <div className="upi-qr-copy">

                    <strong>
                      SCAN TO PAY
                    </strong>

                    <span>
                      {money(grandTotal)}
                    </span>

                  </div>

                </div>
              )}

            </div>

          </div>

        </section>

        {/* ===================================================
            SIGNATURE
        =================================================== */}

        <section className="signature-section">

          <div className="signature-box">

            <div className="signature-line" />

            <p>
              AUTHORIZED SIGNATURE
            </p>

            <span>
              For ASM INTERIORS
            </span>

          </div>

        </section>

        {/* ===================================================
            FOOTER
        =================================================== */}

        <footer className="quotation-footer">

          <strong>
            Thank you for choosing ASM INTERIORS
          </strong>

          <p>
            {shopDetails?.address}
          </p>

          <p>
            {shopDetails?.phone}
            <span> • </span>
            {shopDetails?.email}
          </p>

        </footer>

      </div>

      {/* =====================================================
          STYLES
      ===================================================== */}

      <style>{`

        * {
          box-sizing: border-box;
        }

        /* ====================================================
           PAGE
        ==================================================== */

        .bill-preview-page {
          min-height: 100vh;
          background: #eef1f5;
          padding: 30px 20px 50px;
          color: #172033;

          font-family:
            Inter,
            -apple-system,
            BlinkMacSystemFont,
            "Segoe UI",
            Arial,
            sans-serif;
        }

        /* ====================================================
           ACTION BAR
        ==================================================== */

        .bill-actions {
          width: 794px;
          max-width: 100%;
          margin: 0 auto 20px;

          display: flex;
          align-items: center;
          justify-content: space-between;

          gap: 12px;
        }

        .action-right {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .secondary-action,
        .primary-action {
          height: 44px;
          padding: 0 19px;

          border-radius: 9px;

          font-size: 14px;
          font-weight: 700;

          cursor: pointer;

          transition:
            background 0.2s ease,
            box-shadow 0.2s ease,
            transform 0.15s ease;
        }

        .secondary-action {
          border: 1px solid #d7dee8;
          background: #ffffff;
          color: #243044;

          box-shadow:
            0 2px 6px rgba(
              15,
              23,
              42,
              0.05
            );
        }

        .secondary-action:hover {
          background: #f8fafc;
        }

        .primary-action {
          border: 1px solid #050816;
          background: #050816;
          color: #ffffff;

          box-shadow:
            0 4px 10px rgba(
              15,
              23,
              42,
              0.14
            );
        }

        .primary-action:hover {
          background: #151a2b;
          transform: translateY(-1px);
        }

        .secondary-action:disabled {
          opacity: 0.6;
          cursor: wait;
        }

        .spinner {
          display: inline-block;

          width: 14px;
          height: 14px;

          margin-right: 7px;

          border: 2px solid #cbd5e1;
          border-top-color: #111827;

          border-radius: 50%;

          animation:
            spin 0.7s linear infinite;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        /* ====================================================
           A4
        ==================================================== */

        .quotation-a4 {
          width: 794px;
          height: 1123px;

          max-width: 100%;

          margin: 0 auto;

          background: #ffffff;

          box-shadow:
            0 16px 45px rgba(
              15,
              23,
              42,
              0.11
            );

          overflow: hidden;

          display: flex;
          flex-direction: column;
        }

        /* ====================================================
           HEADER
        ==================================================== */

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

          font-size: 24px;
          line-height: 1.1;

          font-weight: 800;
          letter-spacing: -0.7px;

          color: #080d1d;
        }

        .company-tagline {
          margin: 5px 0 9px;

          font-size: 11px;
          font-weight: 600;

          color: #61718a;
        }

        .company-contact,
        .company-gst {
          margin: 3px 0;

          font-size: 9px;
          line-height: 1.45;

          color: #66758c;
        }

        .company-gst {
          color: #34435b;
          font-weight: 700;
        }

        /* ====================================================
           QUOTATION NUMBER
        ==================================================== */

        .quotation-number-section {
          min-width: 145px;

          text-align: right;
          padding-top: 3px;
        }

        .quotation-label {
          margin: 0;

          font-size: 8px;
          font-weight: 800;

          letter-spacing: 0.22em;

          color: #91a0b5;
        }

        .quotation-number-section h2 {
          margin: 5px 0 8px;

          font-size: 19px;
          line-height: 1;

          font-weight: 800;
          letter-spacing: -0.4px;

          color: #080d1d;
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
          color: #91a0b5;
        }

        .quotation-meta strong {
          min-width: 60px;
          color: #26344a;
        }

        .section-line {
          margin: 0 40px;
          border-top: 1px solid #e1e6ed;
        }

        /* ====================================================
           DETAILS
        ==================================================== */

        .details-section {
          padding: 20px 40px 18px;

          display: grid;

          grid-template-columns:
            1.25fr 0.75fr;

          gap: 45px;
        }

        .section-label {
          margin: 0 0 8px;

          font-size: 8px;
          line-height: 1;

          font-weight: 800;
          letter-spacing: 0.18em;

          color: #93a1b5;
        }

        .client-block h3 {
          margin: 0;

          font-size: 15px;
          line-height: 1.3;

          font-weight: 800;

          color: #101827;
        }

        .client-name {
          margin: 4px 0 0;

          font-size: 10px;
          font-weight: 600;

          color: #52637c;
        }

        .client-address {
          margin: 7px 0 5px;

          max-width: 370px;

          white-space: pre-line;

          font-size: 9.5px;
          line-height: 1.5;

          color: #61718a;
        }

        .client-contact,
        .client-gst {
          margin: 3px 0;

          font-size: 9.5px;

          color: #61718a;
        }

        .client-gst {
          margin-top: 6px;

          font-weight: 700;
          color: #334155;
        }

        /* ====================================================
           QUOTATION DETAILS
        ==================================================== */

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
          color: #93a1b5;
        }

        .detail-row strong {
          min-width: 82px;
          color: #26344a;
          font-weight: 700;
        }

        /* ====================================================
           ITEMS
        ==================================================== */

        .items-section {
          padding: 0 40px;
        }

        .items-table {
          width: 100%;

          border-collapse: separate;
          border-spacing: 0;

          overflow: hidden;

          border: 1px solid #dfe5ed;
          border-radius: 8px;

          font-size: 11px;
        }

        .items-table thead {
          background: #050816;
          color: #ffffff;
        }

        .items-table th {
          padding: 11px 12px;

          font-size: 8px;
          font-weight: 800;

          letter-spacing: 0.08em;

          text-align: left;

          white-space: nowrap;
        }

        .items-table td {
          padding: 11px 12px;

          border-bottom:
            1px solid #edf1f5;

          color: #43536a;
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
          color: #8da0b7;
          font-weight: 700;
        }

        .description-cell {
          font-size: 10.5px;
          font-weight: 600;
          color: #243149 !important;
        }

        .items-table td.amount-column {
          font-size: 11px;
          font-weight: 800;
          color: #111827;
        }

        .empty-items {
          padding: 25px !important;

          text-align: center !important;

          color: #94a3b8 !important;
        }

        /* ====================================================
           TOTALS
        ==================================================== */

        .totals-section {
          display: flex;
          justify-content: flex-end;

          padding: 17px 40px 18px;
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
          color: #68788f;
        }

        .total-row strong {
          color: #253149;
        }

        .grand-total-line {
          margin: 7px 0 10px;

          border-top:
            2px solid #121827;
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
          font-weight: 800;

          letter-spacing: 0.1em;

          color: #91a0b5;
        }

        .grand-total-row span {
          display: block;

          margin-top: 3px;

          font-size: 8px;

          color: #9aa7b8;
        }

        .grand-total-row > strong {
          font-size: 21px;
          line-height: 1;

          font-weight: 800;

          letter-spacing: -0.5px;

          color: #070b18;
        }

        /* ====================================================
           NOTES
        ==================================================== */

        .notes-section {
          border-top: 1px solid #e4e9ef;

          padding: 15px 40px 14px;
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

          color: #61718a;
        }

        .note-dot {
          flex: 0 0 auto;

          font-size: 7px;
          font-weight: 800;

          color: #9aa7b8;
        }

        /* ====================================================
           ACCOUNT DETAILS
        ==================================================== */

        .account-section {
          margin: 0 40px;

          padding: 14px 0 13px;

          border-top: 1px solid #edf1f5;
          border-bottom: 1px solid #edf1f5;
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

          font-size: 13px;
          font-weight: 800;

          color: #1a2435;
        }

        .account-secure {
          padding: 4px 8px;

          border-radius: 5px;

          background: #f5f7fa;

          font-size: 7px;
          font-weight: 800;

          letter-spacing: 0.08em;

          color: #738198;
        }

        .account-grid {
          display: grid;

          grid-template-columns:
            1.2fr 1.2fr 0.8fr 0.8fr;

          gap: 10px;

          padding: 10px 12px;

          border:
            1px solid #e5eaf0;

          border-radius: 7px;

          background: #fafbfc;
        }

        .account-item {
          display: flex;

          flex-direction: column;

          gap: 3px;
        }

        .account-item span {
          font-size: 7px;

          font-weight: 800;

          letter-spacing: 0.1em;

          color: #94a0b1;
        }

        .account-item strong {
          font-size: 9.5px;

          font-weight: 700;

          color: #253149;

          white-space: nowrap;
        }

        /* ====================================================
           UPI
        ==================================================== */

        .upi-section {
          margin-top: 11px;

          padding-top: 10px;

          border-top:
            1px solid #edf1f5;
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
          color: #9aa7b8;
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

          color: #7f8da0;
        }

        .upi-input-wrapper input {
          width: 260px;

          height: 28px;

          padding: 0 9px;

          border:
            1px solid #dce3eb;

          border-radius: 5px;

          outline: none;

          background: #ffffff;

          color: #253149;

          font-family:
            Inter,
            -apple-system,
            BlinkMacSystemFont,
            "Segoe UI",
            Arial,
            sans-serif;

          font-size: 9px;

          font-weight: 600;
        }

        .upi-input-wrapper input:focus {
          border-color: #94a3b8;

          box-shadow:
            0 0 0 2px
            rgba(
              100,
              116,
              139,
              0.08
            );
        }

        .upi-input-wrapper input::placeholder {
          color: #b1bbc8;
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

          border:
            1px solid #e1e7ee;

          border-radius: 6px;
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

          letter-spacing: 0.13em;

          color: #66758c;
        }

        .upi-qr-copy span {
          font-size: 10px;

          font-weight: 800;

          color: #172033;
        }

        /* ====================================================
           SIGNATURE
        ==================================================== */

        .signature-section {
          display: flex;

          justify-content: flex-end;

          padding: 11px 40px 10px;
        }

        .signature-box {
          width: 170px;

          text-align: center;
        }

        .signature-line {
          border-top:
            1px solid #bcc6d2;

          margin-bottom: 6px;
        }

        .signature-box p {
          margin: 0;

          font-size: 8px;

          font-weight: 800;

          color: #27354b;
        }

        .signature-box span {
          display: block;

          margin-top: 3px;

          font-size: 7px;

          color: #9aa7b8;
        }

        /* ====================================================
           FOOTER
        ==================================================== */

        .quotation-footer {
          margin-top: auto;

          border-top:
            1px solid #e2e7ed;

          background: #f8fafc;

          padding: 11px 40px 10px;

          text-align: center;
        }

        .quotation-footer strong {
          display: block;

          font-size: 9px;

          font-weight: 800;

          color: #334155;
        }

        .quotation-footer p {
          margin: 2px 0 0;

          font-size: 7px;

          color: #97a5b7;
        }

        /* ====================================================
           PRINT
        ==================================================== */

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
            height: 297mm !important;

            background: #ffffff !important;
          }

          body {
            -webkit-print-color-adjust:
              exact !important;

            print-color-adjust:
              exact !important;
          }

          .bill-preview-page {
            margin: 0 !important;
            padding: 0 !important;

            min-height: 297mm !important;

            background: #ffffff !important;
          }

          .bill-actions {
            display: none !important;
          }

          .quotation-a4 {
            width: 210mm !important;

            height: 297mm !important;
            min-height: 297mm !important;
            max-height: 297mm !important;

            margin: 0 !important;

            box-shadow: none !important;

            overflow: hidden !important;
          }

          * {
            -webkit-print-color-adjust:
              exact !important;

            print-color-adjust:
              exact !important;
          }
        }

        /* ====================================================
           MOBILE
        ==================================================== */

        @media screen and (max-width: 850px) {

          .bill-preview-page {
            padding: 15px 10px 30px;

            overflow-x: auto;
          }

          .quotation-a4 {
            width: 794px;
            min-width: 794px;
          }

          .bill-actions {
            min-width: 794px;
          }
        }

      `}</style>
    </div>
  );
}