import { useState } from "react";
import asmLogo from "../assets/asm-logo.jpeg";

/* =========================================================
   INPUT FIELD
========================================================= */

const InputField = ({
  label,
  name,
  value,
  onChange,
  placeholder,
  type = "text",
}) => {
  return (
    <div className="space-y-2.5">
      <label
        htmlFor={name}
        className="block text-[13px] font-semibold tracking-wide text-slate-600"
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
          h-[52px]
          w-full
          rounded-lg
          border
          border-slate-200
          bg-white
          px-4
          text-[15px]
          font-medium
          text-slate-900
          placeholder:text-slate-400
          outline-none
          transition-all
          duration-200
          hover:border-slate-300
          focus:border-slate-900
          focus:ring-4
          focus:ring-slate-900/[0.06]
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
    <div className="space-y-2.5">
      <label className="block text-[13px] font-semibold tracking-wide text-slate-600">
        {label}
      </label>

      <div
        className="
          flex
          min-h-[52px]
          items-center
          rounded-lg
          border
          border-slate-200
          bg-slate-50
          px-4
          py-3
          text-[15px]
          font-medium
          leading-6
          text-slate-700
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
    <div className="space-y-2.5">
      <label
        htmlFor={name}
        className="block text-[13px] font-semibold tracking-wide text-slate-600"
      >
        {label}
      </label>

      <textarea
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={4}
        className="
          min-h-[112px]
          w-full
          resize-none
          rounded-lg
          border
          border-slate-200
          bg-white
          px-4
          py-3.5
          text-[15px]
          font-medium
          leading-6
          text-slate-900
          placeholder:text-slate-400
          outline-none
          transition-all
          duration-200
          hover:border-slate-300
          focus:border-slate-900
          focus:ring-4
          focus:ring-slate-900/[0.06]
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
      <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-slate-950 text-white">
        <svg
          width="19"
          height="19"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
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
    <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
      <svg
        width="19"
        height="19"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
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
    <div className="flex min-w-0 items-center">
      <div
        className={`
          flex
          h-9
          w-9
          shrink-0
          items-center
          justify-center
          rounded-full
          text-[12px]
          font-bold
          transition
          ${
            active
              ? "bg-slate-950 text-white shadow-sm"
              : completed
                ? "bg-slate-100 text-slate-700"
                : "border border-slate-200 bg-white text-slate-400"
          }
        `}
      >
        {completed ? "✓" : number}
      </div>

      <div className="ml-3 hidden sm:block">
        <p
          className={`text-[13px] font-bold ${
            active ? "text-slate-950" : "text-slate-500"
          }`}
        >
          {title}
        </p>

        <p className="mt-1 text-[11px] text-slate-400">
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
  onContinue,
}) {
  const [showGst, setShowGst] = useState(
    Boolean(shopDetails.gst),
  );

  return (
    <div className="min-h-screen bg-[#f7f8fa] text-slate-950">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <header className="border-b border-slate-200 bg-white">

        <div className="mx-auto flex h-[74px] max-w-[1180px] items-center justify-between px-5 sm:px-6">

          {/* BRAND */}

          <div className="flex items-center gap-3.5">

            <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-lg bg-black">
              <img
                src={asmLogo}
                alt="ASM Interiors"
                className="h-full w-full object-contain"
              />
            </div>

            <div className="leading-none">

              <h1 className="text-[16px] font-bold tracking-tight text-slate-950">
                ASM INTERIORS
              </h1>

              <p className="mt-1.5 text-[10px] font-semibold tracking-[0.12em] text-slate-400">
                QUOTATION & BILLING
              </p>

            </div>
          </div>

          {/* STATUS */}

          <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3.5 py-2">

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

      <main className="mx-auto w-full max-w-[1180px] px-5 py-8 sm:px-6 lg:py-10">

        {/* ===================================================
            TITLE
        =================================================== */}

        <div className="mb-7">

          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">

            <div>

              <p className="mb-2.5 text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">
                Quotation Builder
              </p>

              <h2 className="text-[34px] font-bold tracking-[-0.03em] text-slate-950 sm:text-[38px]">
                Create quotation
              </h2>

              <p className="mt-2 max-w-xl text-[14px] leading-6 text-slate-500">
                Enter the customer information and quotation
                details to generate a professional bill.
              </p>

            </div>

            <div className="text-[13px] font-medium text-slate-400">

              Step{" "}

              <span className="font-bold text-slate-900">
                1
              </span>{" "}

              of 3

            </div>

          </div>

        </div>

        {/* ===================================================
            STEPS
        =================================================== */}

        <div className="mb-7 rounded-xl border border-slate-200 bg-white px-5 py-5 shadow-[0_1px_3px_rgba(15,23,42,0.04)] sm:px-7">

          <div className="flex items-center">

            <StepItem
              number="1"
              title="Details"
              subtitle="Business & client"
              active
            />

            <div className="mx-3 h-px flex-1 bg-slate-200 sm:mx-7" />

            <StepItem
              number="2"
              title="Items"
              subtitle="Products & pricing"
            />

            <div className="mx-3 h-px flex-1 bg-slate-200 sm:mx-7" />

            <StepItem
              number="3"
              title="Preview"
              subtitle="Final quotation"
            />

          </div>

        </div>

        {/* ===================================================
            MAIN FORM CARD
        =================================================== */}

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_4px_18px_rgba(15,23,42,0.04)]">

          {/* =================================================
              BRAND HEADER
          ================================================= */}

          <div className="border-b border-slate-200 px-6 py-7 sm:px-9">

            <div className="flex items-center gap-4">

              <div className="flex h-[72px] w-[72px] shrink-0 items-center justify-center overflow-hidden rounded-xl border border-slate-100 bg-black">
                <img
                  src={asmLogo}
                  alt="ASM Interiors"
                  className="h-full w-full object-contain"
                />
              </div>

              <div>

                <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">
                  Business identity
                </p>

                <h3 className="mt-1.5 text-[21px] font-bold tracking-tight text-slate-950">
                  ASM INTERIORS
                </h3>

                <p className="mt-1 text-[13px] text-slate-500">
                  Interior Design & Commercial Works
                </p>

              </div>

            </div>

          </div>

          {/* =================================================
              TWO COLUMN DETAILS
          ================================================= */}

          <div className="grid lg:grid-cols-2">

            {/* =================================================
                BUSINESS DETAILS
            ================================================= */}

            <section className="border-b border-slate-200 p-7 sm:p-9 lg:border-b-0 lg:border-r">

              <div className="mb-7 flex items-center gap-3.5">

                <SectionIcon type="business" />

                <div>

                  <h3 className="text-[18px] font-bold text-slate-950">
                    Business details
                  </h3>

                  <p className="mt-1 text-[12px] text-slate-400">
                    Fixed information for ASM Interiors.
                  </p>

                </div>

              </div>

              <div className="space-y-5">

                <FixedField
                  label="Shop name"
                  value={shopDetails.name}
                />

                <div className="space-y-2.5">

                  <label className="block text-[13px] font-semibold tracking-wide text-slate-600">
                    Shop address
                  </label>

                  <div
                    className="
                      min-h-[70px]
                      rounded-lg
                      border
                      border-slate-200
                      bg-slate-50
                      px-4
                      py-3
                      text-[15px]
                      font-medium
                      leading-6
                      text-slate-700
                    "
                  >
                    {shopDetails.address}
                  </div>

                </div>

                <FixedField
                  label="Phone number"
                  value={shopDetails.phone}
                />

                <FixedField
                  label="Email address"
                  value={shopDetails.email}
                />

                {!showGst ? (

                  <button
                    type="button"
                    onClick={() => setShowGst(true)}
                    className="
                      inline-flex
                      items-center
                      gap-2
                      text-[13px]
                      font-bold
                      text-slate-600
                      transition
                      hover:text-slate-950
                    "
                  >
                    <span className="text-[18px] leading-none">
                      +
                    </span>

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
                          target: {
                            name: "gst",
                            value: "",
                          },
                        });

                      }}
                      className="mt-2.5 text-[12px] font-semibold text-red-500 transition hover:text-red-700"
                    >
                      Remove GST
                    </button>

                  </div>

                )}

              </div>

            </section>

            {/* =================================================
                CLIENT DETAILS
            ================================================= */}

            <section className="p-7 sm:p-9">

              <div className="mb-7 flex items-center gap-3.5">

                <SectionIcon type="client" />

                <div>

                  <h3 className="text-[18px] font-bold text-slate-950">
                    Client details
                  </h3>

                  <p className="mt-1 text-[12px] text-slate-400">
                    Customer information for this quotation.
                  </p>

                </div>

              </div>

              <div className="space-y-5">

                <InputField
                  label="Client shop name"
                  name="shopName"
                  value={clientDetails.shopName}
                  onChange={handleClientChange}
                  placeholder="e.g. Nila Agencies"
                />

                <InputField
                  label="Client name"
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

                <div className="grid gap-5 sm:grid-cols-2">

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

          {/* =================================================
              ACTION FOOTER
          ================================================= */}

          <div className="flex flex-col gap-4 border-t border-slate-200 bg-slate-50/60 px-6 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-9">

            <div>

              <p className="text-[13px] font-bold text-slate-700">
                Ready to continue?
              </p>

              <p className="mt-1 text-[11px] text-slate-400">
                Your business information is already saved.
              </p>

            </div>

            <button
              type="button"
              onClick={onContinue}
              className="
                group
                inline-flex
                h-[50px]
                items-center
                justify-center
                gap-2.5
                rounded-lg
                bg-slate-950
                px-6
                text-[14px]
                font-bold
                text-white
                shadow-sm
                transition-all
                duration-200
                hover:bg-slate-800
                hover:shadow-md
                active:scale-[0.98]
              "
            >
              Continue to items

              <svg
                width="17"
                height="17"
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

        {/* ===================================================
            FOOTNOTE
        =================================================== */}

        <div className="mt-6 flex items-center justify-center gap-2 text-center">

          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            className="text-slate-400"
          >
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />
            <path d="m9 12 2 2 4-4" />
          </svg>

          <p className="text-[11px] text-slate-400">
            Your quotation information is used only to generate the bill.
          </p>

        </div>

      </main>

    </div>
  );
}