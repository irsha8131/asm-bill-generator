// import { useEffect, useState } from "react";
// import { supabase } from "./utils/supabase";

// import LoginPage from "./pages/LoginPage";
// import DetailsPage from "./pages/DetailsPage";
// import ItemsPage from "./pages/ItemsPage";
// import BillPreviewPage from "./pages/BillPreviewPage";
// import PaymentPage from "./pages/PaymentPage";
// import AllQuotationsPage from "./pages/AllQuotationsPage";

// function App() {
//   // AUTH STATE
//   const [session, setSession] = useState(null);
//   const [authLoading, setAuthLoading] = useState(true);

//   const STEPS = {
//     DETAILS: 1,
//     ITEMS: 2,
//     BILL: 3,
//     PAYMENT: 4,
//     QUOTATIONS: 5,
//   };

//   const [currentStep, setCurrentStep] = useState(STEPS.DETAILS);
//   const [quotationId, setQuotationId] = useState(null);

//   // AUTOMATIC YEAR & SEQUENCE
//   const currentYear = new Date().getFullYear();
//   const [quotationYear, setQuotationYear] = useState(currentYear);
//   const [quotationSeq, setQuotationSeq] = useState("01");

//   const [existingQuotations, setExistingQuotations] = useState([]);
//   const [quotationsLoading, setQuotationsLoading] = useState(false);
//   const [savingQuotation, setSavingQuotation] = useState(false);

//   // SHOP / OWNER DETAILS
//   const [shopDetails, setShopDetails] = useState({
//     name: "ASM INTERIORS",
//     address:
//       "SF NO 659/2B | KUNIYAMUTHUR | COIMBATORE 641008 | Tamil Nadu, India",
//     phone: "+91 70929 83982",
//     email: "asminteriors4511@gmail.com",
//     gst: "",
//   });

//   // CUSTOMER DETAILS
//   const [clientDetails, setClientDetails] = useState({
//     shopName: "",
//     name: "",
//     address: "",
//     phone: "",
//     email: "",
//     gst: "",
//   });

//   // ITEMS
//   const createEmptyItem = () => ({
//     id: `${Date.now()}-${Math.random()}`,
//     description: "",
//     quantity: 1,
//     price: 0,
//   });

//   const [items, setItems] = useState([createEmptyItem()]);
//   const [gstEnabled, setGstEnabled] = useState(false);
//   const [gstRate, setGstRate] = useState("");
//   const [discountAmount, setDiscountAmount] = useState(0);

//   const fullQuotationNumber = `${quotationYear}-${String(quotationSeq || "01").trim()}`;

//   // =========================================================
//   // SUPABASE AUTH LISTENER & INITIAL SESSION CHECK
//   // =========================================================
//   useEffect(() => {
//     supabase.auth.getSession().then(({ data: { session } }) => {
//       setSession(session);
//       setAuthLoading(false);
//     });

//     const {
//       data: { subscription },
//     } = supabase.auth.onAuthStateChange((_event, session) => {
//       setSession(session);
//       setAuthLoading(false);
//     });

//     return () => subscription.unsubscribe();
//   }, []);

//   const handleSignOut = async () => {
//     const confirmLogout = window.confirm("Are you sure you want to sign out?");
//     if (!confirmLogout) return;

//     await supabase.auth.signOut();
//     setSession(null);
//   };

//   const handleShopChange = (e) => {
//     const { name, value } = e.target;
//     setShopDetails((prev) => ({ ...prev, [name]: value }));
//   };

//   const handleClientChange = (e) => {
//     const { name, value } = e.target;
//     setClientDetails((prev) => ({ ...prev, [name]: value }));
//   };

//   const addItem = () => {
//     setItems((prev) => [...prev, createEmptyItem()]);
//   };

//   const removeItem = (id) => {
//     setItems((prev) => {
//       if (prev.length <= 1) return prev;
//       return prev.filter((item) => item.id !== id);
//     });
//   };

//   const updateItem = (id, field, value) => {
//     setItems((prev) =>
//       prev.map((item) => {
//         if (item.id !== id) return item;
//         if (field === "quantity" || field === "price") {
//           return { ...item, [field]: Number(value) || 0 };
//         }
//         return { ...item, [field]: value };
//       })
//     );
//   };

//   const getItemAmount = (item) => {
//     const quantity = Number(item?.quantity || 0);
//     const price = Number(item?.price || 0);
//     return quantity * price;
//   };

//   const subtotal = items.reduce(
//     (total, item) => total + getItemAmount(item),
//     0
//   );

//   const safeDiscount = Math.min(
//     Math.max(Number(discountAmount || 0), 0),
//     subtotal
//   );

//   const afterDiscount = Math.max(0, subtotal - safeDiscount);

//   const safeGstRate =
//     gstEnabled && Number(gstRate || 0) > 0 ? Number(gstRate) : 0;

//   const gstAmount =
//     safeGstRate > 0 ? afterDiscount * (safeGstRate / 100) : 0;

//   const grandTotal = afterDiscount + gstAmount;

//   const formatCurrency = (amount) => {
//     return new Intl.NumberFormat("en-IN", {
//       style: "currency",
//       currency: "INR",
//       maximumFractionDigits: 2,
//     }).format(Number(amount || 0));
//   };

//   // LOAD SAVED QUOTATIONS LIST
//   const loadExistingQuotations = async () => {
//     if (!session) return;
//     setQuotationsLoading(true);

//     try {
//       const { data: quotationRows, error: quotationError } = await supabase
//         .from("quotations")
//         .select(
//           "id, quotation_number, client_shop_name, client_name, client_phone, grand_total, created_at"
//         )
//         .order("created_at", { ascending: false })
//         .limit(50);

//       if (quotationError) throw quotationError;

//       if (!quotationRows?.length) {
//         setExistingQuotations([]);
//         return;
//       }

//       const quotationIds = quotationRows.map((q) => q.id);

//       const { data: paymentRows, error: paymentError } = await supabase
//         .from("payments")
//         .select("quotation_id, amount")
//         .in("quotation_id", quotationIds);

//       if (paymentError) throw paymentError;

//       const paidByQuotation = {};
//       (paymentRows || []).forEach((payment) => {
//         const id = payment.quotation_id;
//         paidByQuotation[id] =
//           (paidByQuotation[id] || 0) + Number(payment.amount || 0);
//       });

//       const enriched = quotationRows.map((q) => ({
//         ...q,
//         total_paid: paidByQuotation[q.id] || 0,
//       }));

//       setExistingQuotations(enriched);
//     } catch (error) {
//       console.error("Load saved quotations error:", error);
//       setExistingQuotations([]);
//     } finally {
//       setQuotationsLoading(false);
//     }
//   };

//   useEffect(() => {
//     if (
//       session &&
//       (currentStep === STEPS.DETAILS || currentStep === STEPS.QUOTATIONS)
//     ) {
//       loadExistingQuotations();
//     }
//   }, [currentStep, session]);

//   // OPEN EXISTING QUOTATION
//   const openExistingQuotation = async (id) => {
//     try {
//       const { data: quotation, error: quotationError } = await supabase
//         .from("quotations")
//         .select("*")
//         .eq("id", id)
//         .single();

//       if (quotationError) throw quotationError;

//       const { data: savedItems, error: itemsError } = await supabase
//         .from("quotation_items")
//         .select("*")
//         .eq("quotation_id", id)
//         .order("created_at", { ascending: true });

//       if (itemsError) throw itemsError;

//       setQuotationId(id);

//       if (quotation.quotation_number) {
//         const match = String(quotation.quotation_number).match(/^(\d{4})-(.+)$/);
//         if (match) {
//           setQuotationYear(match[1]);
//           setQuotationSeq(match[2]);
//         } else {
//           setQuotationSeq(quotation.quotation_number);
//         }
//       }

//       setShopDetails({
//         name: quotation.shop_name || "ASM INTERIORS",
//         address: quotation.shop_address || "",
//         phone: quotation.shop_phone || "",
//         email: quotation.shop_email || "",
//         gst: quotation.shop_gst || "",
//       });

//       setClientDetails({
//         shopName: quotation.client_shop_name || "",
//         name: quotation.client_name || "",
//         address: quotation.client_address || "",
//         phone: quotation.client_phone || "",
//         email: quotation.client_email || "",
//         gst: quotation.client_gst || "",
//       });

//       const restoredItems = (savedItems || []).map((item) => ({
//         id: item.id || `${Date.now()}-${Math.random()}`,
//         description: item.description || "",
//         quantity: Number(item.quantity || 0),
//         price: Number(item.price || 0),
//       }));

//       setItems(restoredItems.length ? restoredItems : [createEmptyItem()]);

//       const restoredDiscount = Number(quotation.discount_amount || 0);
//       const restoredGstRate = Number(quotation.gst_rate || 0);

//       setDiscountAmount(restoredDiscount);
//       setGstRate(restoredGstRate ? String(restoredGstRate) : "");
//       setGstEnabled(restoredGstRate > 0);

//       setCurrentStep(STEPS.PAYMENT);
//     } catch (error) {
//       console.error("Open quotation error:", error);
//       alert(
//         `Failed to open quotation.\n\n${
//           error?.message || "Something went wrong."
//         }`
//       );
//     }
//   };

//   const getQuotationPayload = () => {
//     return {
//       quotation_number: fullQuotationNumber,
//       shop_name: shopDetails?.name || "",
//       shop_address: shopDetails?.address || "",
//       shop_phone: shopDetails?.phone || "",
//       shop_email: shopDetails?.email || "",
//       shop_gst: shopDetails?.gst || "",
//       client_shop_name: clientDetails?.shopName || "",
//       client_name: clientDetails?.name || "",
//       client_address: clientDetails?.address || "",
//       client_phone: clientDetails?.phone || "",
//       client_email: clientDetails?.email || "",
//       client_gst: clientDetails?.gst || "",
//       gst_rate: Number(safeGstRate || 0),
//       subtotal: Number(subtotal || 0),
//       discount_amount: Number(safeDiscount || 0),
//       gst_amount: Number(gstAmount || 0),
//       grand_total: Number(grandTotal || 0),
//     };
//   };

//   const handleContinueToItems = () => {
//     const customerName = String(clientDetails?.name || "").trim();
//     if (!customerName) {
//       alert("Please enter the client name before continuing.");
//       return;
//     }
//     setCurrentStep(STEPS.ITEMS);
//   };

//   const handleContinueToBill = () => {
//     const validItems = items.filter(
//       (item) => String(item?.description || "").trim() !== ""
//     );

//     if (validItems.length === 0) {
//       alert("Please add at least one quotation item description.");
//       return;
//     }

//     setCurrentStep(STEPS.BILL);
//   };

//   // FULL SAVE TO SUPABASE (CALLED ONLY BY BILL PREVIEW SAVE BUTTON)
//   const saveEverything = async () => {
//     const customerName = String(clientDetails?.name || "").trim();
//     if (!customerName) {
//       throw new Error("Please enter the client name.");
//     }

//     const validItems = items.filter(
//       (item) => String(item?.description || "").trim() !== ""
//     );

//     if (validItems.length === 0) {
//       throw new Error("Please add at least one item before saving.");
//     }

//     setSavingQuotation(true);

//     try {
//       const latestSubtotal = validItems.reduce(
//         (total, item) =>
//           total + Number(item?.quantity || 0) * Number(item?.price || 0),
//         0
//       );

//       const latestDiscount = Math.min(
//         Math.max(Number(discountAmount || 0), 0),
//         latestSubtotal
//       );

//       const latestAfterDiscount = Math.max(0, latestSubtotal - latestDiscount);

//       const latestGstRate =
//         gstEnabled && Number(gstRate || 0) > 0 ? Number(gstRate) : 0;

//       const latestGstAmount =
//         latestGstRate > 0 ? latestAfterDiscount * (latestGstRate / 100) : 0;

//       const latestGrandTotal = latestAfterDiscount + latestGstAmount;

//       const payload = {
//         ...getQuotationPayload(),
//         subtotal: Number(latestSubtotal),
//         discount_amount: Number(latestDiscount),
//         gst_rate: Number(latestGstRate),
//         gst_amount: Number(latestGstAmount),
//         grand_total: Number(latestGrandTotal),
//       };

//       let activeId = quotationId;

//       if (activeId) {
//         const { error: quotationError } = await supabase
//           .from("quotations")
//           .update(payload)
//           .eq("id", activeId);

//         if (quotationError) throw quotationError;
//       } else {
//         const { data: newQuotation, error: insertError } = await supabase
//           .from("quotations")
//           .insert([payload])
//           .select("id")
//           .single();

//         if (insertError) throw insertError;
//         if (!newQuotation?.id) {
//           throw new Error("Quotation could not be created.");
//         }

//         activeId = newQuotation.id;
//         setQuotationId(activeId);
//       }

//       const { error: deleteItemsError } = await supabase
//         .from("quotation_items")
//         .delete()
//         .eq("quotation_id", activeId);

//       if (deleteItemsError) throw deleteItemsError;

//       const quotationItems = validItems.map((item) => ({
//         quotation_id: activeId,
//         description: String(item?.description || "").trim(),
//         quantity: Number(item?.quantity || 0),
//         price: Number(item?.price || 0),
//         amount: Number(getItemAmount(item) || 0),
//       }));

//       const { error: insertItemsError } = await supabase
//         .from("quotation_items")
//         .insert(quotationItems);

//       if (insertItemsError) throw insertItemsError;

//       await loadExistingQuotations();
//       return true;
//     } finally {
//       setSavingQuotation(false);
//     }
//   };

//   const startNewQuotation = () => {
//     setQuotationId(null);
//     setQuotationYear(new Date().getFullYear());
//     setQuotationSeq("01");
//     setClientDetails({
//       shopName: "",
//       name: "",
//       address: "",
//       phone: "",
//       email: "",
//       gst: "",
//     });

//     setItems([createEmptyItem()]);
//     setGstEnabled(false);
//     setGstRate("");
//     setDiscountAmount(0);
//     setCurrentStep(STEPS.DETAILS);
//   };

//   // LOADING INITIAL AUTH STATE
//   if (authLoading) {
//     return (
//       <div className="flex min-h-screen items-center justify-center bg-[#F5F2EA]">
//         <div className="flex flex-col items-center gap-3">
//           <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#9C6B30] border-t-transparent" />
//           <p className="text-[13px] font-semibold text-[#6B6558]">
//             Verifying security session...
//           </p>
//         </div>
//       </div>
//     );
//   }

//   // IF NOT AUTHENTICATED -> SHOW LOGIN SCREEN
//   if (!session) {
//     return <LoginPage onLoginSuccess={(user) => setSession({ user })} />;
//   }

//   // AUTHENTICATED APP VIEWS
//   if (currentStep === STEPS.DETAILS) {
//     return (
//       <DetailsPage
//         shopDetails={shopDetails}
//         clientDetails={clientDetails}
//         handleShopChange={handleShopChange}
//         handleClientChange={handleClientChange}
//         quotationYear={quotationYear}
//         setQuotationYear={setQuotationYear}
//         quotationSeq={quotationSeq}
//         setQuotationSeq={setQuotationSeq}
//         setCurrentStep={setCurrentStep}
//         onContinue={handleContinueToItems}
//         existingQuotations={existingQuotations}
//         quotationsLoading={quotationsLoading}
//         onOpenQuotation={openExistingQuotation}
//         onNewQuotation={startNewQuotation}
//         onViewAllQuotations={() => setCurrentStep(STEPS.QUOTATIONS)}
//         onSignOut={handleSignOut}
//       />
//     );
//   }

//   if (currentStep === STEPS.QUOTATIONS) {
//     return (
//       <AllQuotationsPage
//         existingQuotations={existingQuotations}
//         quotationsLoading={quotationsLoading}
//         onOpenQuotation={openExistingQuotation}
//         onBack={() => setCurrentStep(STEPS.DETAILS)}
//         onRefresh={loadExistingQuotations}
//       />
//     );
//   }

//   if (currentStep === STEPS.ITEMS) {
//     return (
//       <ItemsPage
//         quotationId={quotationId}
//         quotationNumber={fullQuotationNumber}
//         items={items}
//         addItem={addItem}
//         removeItem={removeItem}
//         updateItem={updateItem}
//         gstEnabled={gstEnabled}
//         setGstEnabled={setGstEnabled}
//         gstRate={gstRate}
//         setGstRate={setGstRate}
//         subtotal={subtotal}
//         afterDiscount={afterDiscount}
//         gstAmount={gstAmount}
//         grandTotal={grandTotal}
//         discountAmount={safeDiscount}
//         setDiscountAmount={setDiscountAmount}
//         getItemAmount={getItemAmount}
//         formatCurrency={formatCurrency}
//         setCurrentStep={setCurrentStep}
//         onContinue={handleContinueToBill}
//         STEPS={STEPS}
//       />
//     );
//   }

//   if (currentStep === STEPS.BILL) {
//     return (
//       <BillPreviewPage
//         quotationId={quotationId}
//         setQuotationId={setQuotationId}
//         quotationNumber={fullQuotationNumber}
//         shopDetails={shopDetails}
//         clientDetails={clientDetails}
//         items={items}
//         gstEnabled={gstEnabled}
//         gstRate={safeGstRate}
//         subtotal={subtotal}
//         discountAmount={safeDiscount}
//         afterDiscount={afterDiscount}
//         gstAmount={gstAmount}
//         grandTotal={grandTotal}
//         getItemAmount={getItemAmount}
//         formatCurrency={formatCurrency}
//         setCurrentStep={setCurrentStep}
//         STEPS={STEPS}
//         supabase={supabase}
//         onSave={saveEverything}
//         saving={savingQuotation}
//         startNewQuotation={startNewQuotation}
//       />
//     );
//   }

//   if (currentStep === STEPS.PAYMENT) {
//     return (
//       <PaymentPage
//         quotationId={quotationId}
//         setCurrentStep={setCurrentStep}
//         STEPS={STEPS}
//         formatCurrency={formatCurrency}
//         supabase={supabase}
//       />
//     );
//   }

//   return null;
// }

// export default App;




import { useEffect, useState } from "react";
import { supabase } from "./utils/supabase";

import LoginPage from "./pages/LoginPage";
import DetailsPage from "./pages/DetailsPage";
import ItemsPage from "./pages/ItemsPage";
import BillPreviewPage from "./pages/BillPreviewPage";
import PaymentPage from "./pages/PaymentPage";
import AllQuotationsPage from "./pages/AllQuotationsPage";

function App() {
  // AUTH STATE
  const [session, setSession] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  const STEPS = {
    DETAILS: 1,
    ITEMS: 2,
    BILL: 3,
    PAYMENT: 4,
    QUOTATIONS: 5,
  };

  const [currentStep, setCurrentStep] = useState(STEPS.DETAILS);
  const [quotationId, setQuotationId] = useState(null);

  // AUTOMATIC YEAR & SEQUENCE
  const currentYear = new Date().getFullYear();
  const [quotationYear, setQuotationYear] = useState(currentYear);
  const [quotationSeq, setQuotationSeq] = useState("01");

  const [existingQuotations, setExistingQuotations] = useState([]);
  const [quotationsLoading, setQuotationsLoading] = useState(false);
  const [savingQuotation, setSavingQuotation] = useState(false);

  // SHOP / OWNER DETAILS
  const [shopDetails, setShopDetails] = useState({
    name: "ASM INTERIORS",
    address:
      "SF NO 659/2B | KUNIYAMUTHUR | COIMBATORE 641008 | Tamil Nadu, India",
    phone: "+91 70929 83982",
    email: "asminteriors4511@gmail.com",
    gst: "",
  });

  // CUSTOMER DETAILS
  const [clientDetails, setClientDetails] = useState({
    shopName: "",
    name: "",
    address: "",
    phone: "",
    email: "",
    gst: "",
  });

  // ITEMS
  const createEmptyItem = () => ({
    id: `${Date.now()}-${Math.random()}`,
    description: "",
    quantity: 1,
    price: 0,
  });

  const [items, setItems] = useState([createEmptyItem()]);
  const [gstEnabled, setGstEnabled] = useState(false);
  const [gstRate, setGstRate] = useState("");
  const [discountAmount, setDiscountAmount] = useState(0);

  const fullQuotationNumber = `${quotationYear}-${String(quotationSeq || "01").trim()}`;

  // =========================================================
  // SUPABASE AUTH LISTENER & AUTO-CLEANUP ON SWITCHING USERS
  // =========================================================
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setAuthLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      setAuthLoading(false);

      // If user signed out or changed account, reset data immediately
      if (!newSession) {
        resetAllState();
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const resetAllState = () => {
    setExistingQuotations([]);
    setQuotationId(null);
    setQuotationYear(new Date().getFullYear());
    setQuotationSeq("01");
    setClientDetails({
      shopName: "",
      name: "",
      address: "",
      phone: "",
      email: "",
      gst: "",
    });
    setItems([createEmptyItem()]);
    setGstEnabled(false);
    setGstRate("");
    setDiscountAmount(0);
    setCurrentStep(STEPS.DETAILS);
  };

  const handleSignOut = async () => {
    const confirmLogout = window.confirm("Are you sure you want to sign out?");
    if (!confirmLogout) return;

    await supabase.auth.signOut();
    resetAllState();
    setSession(null);
  };

  const handleShopChange = (e) => {
    const { name, value } = e.target;
    setShopDetails((prev) => ({ ...prev, [name]: value }));
  };

  const handleClientChange = (e) => {
    const { name, value } = e.target;
    setClientDetails((prev) => ({ ...prev, [name]: value }));
  };

  const addItem = () => {
    setItems((prev) => [...prev, createEmptyItem()]);
  };

  const removeItem = (id) => {
    setItems((prev) => {
      if (prev.length <= 1) return prev;
      return prev.filter((item) => item.id !== id);
    });
  };

  const updateItem = (id, field, value) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        if (field === "quantity" || field === "price") {
          return { ...item, [field]: Number(value) || 0 };
        }
        return { ...item, [field]: value };
      })
    );
  };

  const getItemAmount = (item) => {
    const quantity = Number(item?.quantity || 0);
    const price = Number(item?.price || 0);
    return quantity * price;
  };

  const subtotal = items.reduce(
    (total, item) => total + getItemAmount(item),
    0
  );

  const safeDiscount = Math.min(
    Math.max(Number(discountAmount || 0), 0),
    subtotal
  );

  const afterDiscount = Math.max(0, subtotal - safeDiscount);

  const safeGstRate =
    gstEnabled && Number(gstRate || 0) > 0 ? Number(gstRate) : 0;

  const gstAmount =
    safeGstRate > 0 ? afterDiscount * (safeGstRate / 100) : 0;

  const grandTotal = afterDiscount + gstAmount;

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(Number(amount || 0));
  };

  // =========================================================
  // LOAD ONLY LOGGED-IN USER'S QUOTATIONS (USER ISOLATED)
  // =========================================================
  const loadExistingQuotations = async () => {
    const currentUserId = session?.user?.id;
    if (!currentUserId) {
      setExistingQuotations([]);
      return;
    }

    setQuotationsLoading(true);

    try {
      // Query ONLY quotations where user_id matches logged-in user
      const { data: quotationRows, error: quotationError } = await supabase
        .from("quotations")
        .select(
          "id, quotation_number, client_shop_name, client_name, client_phone, grand_total, created_at, user_id"
        )
        .eq("user_id", currentUserId)
        .order("created_at", { ascending: false })
        .limit(50);

      if (quotationError) throw quotationError;

      if (!quotationRows?.length) {
        setExistingQuotations([]);
        return;
      }

      const quotationIds = quotationRows.map((q) => q.id);

      const { data: paymentRows, error: paymentError } = await supabase
        .from("payments")
        .select("quotation_id, amount")
        .in("quotation_id", quotationIds);

      if (paymentError) throw paymentError;

      const paidByQuotation = {};
      (paymentRows || []).forEach((payment) => {
        const id = payment.quotation_id;
        paidByQuotation[id] =
          (paidByQuotation[id] || 0) + Number(payment.amount || 0);
      });

      const enriched = quotationRows.map((q) => ({
        ...q,
        total_paid: paidByQuotation[q.id] || 0,
      }));

      setExistingQuotations(enriched);
    } catch (error) {
      console.error("Load user quotations error:", error);
      setExistingQuotations([]);
    } finally {
      setQuotationsLoading(false);
    }
  };

  useEffect(() => {
    if (
      session?.user?.id &&
      (currentStep === STEPS.DETAILS || currentStep === STEPS.QUOTATIONS)
    ) {
      loadExistingQuotations();
    }
  }, [currentStep, session?.user?.id]);

  // OPEN EXISTING QUOTATION (VERIFIES OWNERSHIP)
  const openExistingQuotation = async (id) => {
    const currentUserId = session?.user?.id;
    if (!currentUserId) return;

    try {
      const { data: quotation, error: quotationError } = await supabase
        .from("quotations")
        .select("*")
        .eq("id", id)
        .eq("user_id", currentUserId)
        .single();

      if (quotationError) throw quotationError;

      const { data: savedItems, error: itemsError } = await supabase
        .from("quotation_items")
        .select("*")
        .eq("quotation_id", id)
        .order("created_at", { ascending: true });

      if (itemsError) throw itemsError;

      setQuotationId(id);

      if (quotation.quotation_number) {
        const match = String(quotation.quotation_number).match(/^(\d{4})-(.+)$/);
        if (match) {
          setQuotationYear(match[1]);
          setQuotationSeq(match[2]);
        } else {
          setQuotationSeq(quotation.quotation_number);
        }
      }

      setShopDetails({
        name: quotation.shop_name || "ASM INTERIORS",
        address: quotation.shop_address || "",
        phone: quotation.shop_phone || "",
        email: quotation.shop_email || "",
        gst: quotation.shop_gst || "",
      });

      setClientDetails({
        shopName: quotation.client_shop_name || "",
        name: quotation.client_name || "",
        address: quotation.client_address || "",
        phone: quotation.client_phone || "",
        email: quotation.client_email || "",
        gst: quotation.client_gst || "",
      });

      const restoredItems = (savedItems || []).map((item) => ({
        id: item.id || `${Date.now()}-${Math.random()}`,
        description: item.description || "",
        quantity: Number(item.quantity || 0),
        price: Number(item.price || 0),
      }));

      setItems(restoredItems.length ? restoredItems : [createEmptyItem()]);

      const restoredDiscount = Number(quotation.discount_amount || 0);
      const restoredGstRate = Number(quotation.gst_rate || 0);

      setDiscountAmount(restoredDiscount);
      setGstRate(restoredGstRate ? String(restoredGstRate) : "");
      setGstEnabled(restoredGstRate > 0);

      setCurrentStep(STEPS.PAYMENT);
    } catch (error) {
      console.error("Open quotation error:", error);
      alert(
        `Failed to open quotation.\n\n${
          error?.message || "Something went wrong."
        }`
      );
    }
  };

  const getQuotationPayload = () => {
    return {
      user_id: session?.user?.id, // ATTACH LOGGED-IN USER ID
      quotation_number: fullQuotationNumber,
      shop_name: shopDetails?.name || "",
      shop_address: shopDetails?.address || "",
      shop_phone: shopDetails?.phone || "",
      shop_email: shopDetails?.email || "",
      shop_gst: shopDetails?.gst || "",
      client_shop_name: clientDetails?.shopName || "",
      client_name: clientDetails?.name || "",
      client_address: clientDetails?.address || "",
      client_phone: clientDetails?.phone || "",
      client_email: clientDetails?.email || "",
      client_gst: clientDetails?.gst || "",
      gst_rate: Number(safeGstRate || 0),
      subtotal: Number(subtotal || 0),
      discount_amount: Number(safeDiscount || 0),
      gst_amount: Number(gstAmount || 0),
      grand_total: Number(grandTotal || 0),
    };
  };

  const handleContinueToItems = () => {
    const customerName = String(clientDetails?.name || "").trim();
    if (!customerName) {
      alert("Please enter the client name before continuing.");
      return;
    }
    setCurrentStep(STEPS.ITEMS);
  };

  const handleContinueToBill = () => {
    const validItems = items.filter(
      (item) => String(item?.description || "").trim() !== ""
    );

    if (validItems.length === 0) {
      alert("Please add at least one quotation item description.");
      return;
    }

    setCurrentStep(STEPS.BILL);
  };

  // =========================================================
  // SAVE EVERYTHING (SAVES TO USER'S ACCOUNT IN SUPABASE)
  // =========================================================
  const saveEverything = async () => {
    const currentUserId = session?.user?.id;
    if (!currentUserId) {
      throw new Error("You must be logged in to save quotations.");
    }

    const customerName = String(clientDetails?.name || "").trim();
    if (!customerName) {
      throw new Error("Please enter the client name.");
    }

    const validItems = items.filter(
      (item) => String(item?.description || "").trim() !== ""
    );

    if (validItems.length === 0) {
      throw new Error("Please add at least one item before saving.");
    }

    setSavingQuotation(true);

    try {
      const latestSubtotal = validItems.reduce(
        (total, item) =>
          total + Number(item?.quantity || 0) * Number(item?.price || 0),
        0
      );

      const latestDiscount = Math.min(
        Math.max(Number(discountAmount || 0), 0),
        latestSubtotal
      );

      const latestAfterDiscount = Math.max(0, latestSubtotal - latestDiscount);

      const latestGstRate =
        gstEnabled && Number(gstRate || 0) > 0 ? Number(gstRate) : 0;

      const latestGstAmount =
        latestGstRate > 0 ? latestAfterDiscount * (latestGstRate / 100) : 0;

      const latestGrandTotal = latestAfterDiscount + latestGstAmount;

      const payload = {
        ...getQuotationPayload(),
        subtotal: Number(latestSubtotal),
        discount_amount: Number(latestDiscount),
        gst_rate: Number(latestGstRate),
        gst_amount: Number(latestGstAmount),
        grand_total: Number(latestGrandTotal),
      };

      let activeId = quotationId;

      if (activeId) {
        // UPDATE existing quotation for this user
        const { error: quotationError } = await supabase
          .from("quotations")
          .update(payload)
          .eq("id", activeId)
          .eq("user_id", currentUserId);

        if (quotationError) throw quotationError;
      } else {
        // INSERT new quotation with user_id attached
        const { data: newQuotation, error: insertError } = await supabase
          .from("quotations")
          .insert([payload])
          .select("id")
          .single();

        if (insertError) throw insertError;
        if (!newQuotation?.id) {
          throw new Error("Quotation could not be created.");
        }

        activeId = newQuotation.id;
        setQuotationId(activeId);
      }

      // Refresh items
      const { error: deleteItemsError } = await supabase
        .from("quotation_items")
        .delete()
        .eq("quotation_id", activeId);

      if (deleteItemsError) throw deleteItemsError;

      const quotationItems = validItems.map((item) => ({
        quotation_id: activeId,
        description: String(item?.description || "").trim(),
        quantity: Number(item?.quantity || 0),
        price: Number(item?.price || 0),
        amount: Number(getItemAmount(item) || 0),
      }));

      const { error: insertItemsError } = await supabase
        .from("quotation_items")
        .insert(quotationItems);

      if (insertItemsError) throw insertItemsError;

      await loadExistingQuotations();
      return true;
    } finally {
      setSavingQuotation(false);
    }
  };

  const startNewQuotation = () => {
    setQuotationId(null);
    setQuotationYear(new Date().getFullYear());
    setQuotationSeq("01");
    setClientDetails({
      shopName: "",
      name: "",
      address: "",
      phone: "",
      email: "",
      gst: "",
    });

    setItems([createEmptyItem()]);
    setGstEnabled(false);
    setGstRate("");
    setDiscountAmount(0);
    setCurrentStep(STEPS.DETAILS);
  };

  // LOADING INITIAL SESSION
  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F5F2EA]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#9C6B30] border-t-transparent" />
          <p className="text-[13px] font-semibold text-[#6B6558]">
            Verifying security session...
          </p>
        </div>
      </div>
    );
  }

  // IF LOGGED OUT -> SHOW LOGIN PAGE
  if (!session) {
    return <LoginPage onLoginSuccess={(user) => setSession({ user })} />;
  }

  // APP VIEWS
  if (currentStep === STEPS.DETAILS) {
    return (
      <DetailsPage
        shopDetails={shopDetails}
        clientDetails={clientDetails}
        handleShopChange={handleShopChange}
        handleClientChange={handleClientChange}
        quotationYear={quotationYear}
        setQuotationYear={setQuotationYear}
        quotationSeq={quotationSeq}
        setQuotationSeq={setQuotationSeq}
        setCurrentStep={setCurrentStep}
        onContinue={handleContinueToItems}
        existingQuotations={existingQuotations}
        quotationsLoading={quotationsLoading}
        onOpenQuotation={openExistingQuotation}
        onNewQuotation={startNewQuotation}
        onViewAllQuotations={() => setCurrentStep(STEPS.QUOTATIONS)}
        onSignOut={handleSignOut}
      />
    );
  }

  if (currentStep === STEPS.QUOTATIONS) {
    return (
      <AllQuotationsPage
        existingQuotations={existingQuotations}
        quotationsLoading={quotationsLoading}
        onOpenQuotation={openExistingQuotation}
        onBack={() => setCurrentStep(STEPS.DETAILS)}
        onRefresh={loadExistingQuotations}
      />
    );
  }

  if (currentStep === STEPS.ITEMS) {
    return (
      <ItemsPage
        quotationId={quotationId}
        quotationNumber={fullQuotationNumber}
        items={items}
        addItem={addItem}
        removeItem={removeItem}
        updateItem={updateItem}
        gstEnabled={gstEnabled}
        setGstEnabled={setGstEnabled}
        gstRate={gstRate}
        setGstRate={setGstRate}
        subtotal={subtotal}
        afterDiscount={afterDiscount}
        gstAmount={gstAmount}
        grandTotal={grandTotal}
        discountAmount={safeDiscount}
        setDiscountAmount={setDiscountAmount}
        getItemAmount={getItemAmount}
        formatCurrency={formatCurrency}
        setCurrentStep={setCurrentStep}
        onContinue={handleContinueToBill}
        STEPS={STEPS}
      />
    );
  }

  if (currentStep === STEPS.BILL) {
    return (
      <BillPreviewPage
        quotationId={quotationId}
        setQuotationId={setQuotationId}
        quotationNumber={fullQuotationNumber}
        shopDetails={shopDetails}
        clientDetails={clientDetails}
        items={items}
        gstEnabled={gstEnabled}
        gstRate={safeGstRate}
        subtotal={subtotal}
        discountAmount={safeDiscount}
        afterDiscount={afterDiscount}
        gstAmount={gstAmount}
        grandTotal={grandTotal}
        getItemAmount={getItemAmount}
        formatCurrency={formatCurrency}
        setCurrentStep={setCurrentStep}
        STEPS={STEPS}
        supabase={supabase}
        onSave={saveEverything}
        saving={savingQuotation}
        startNewQuotation={startNewQuotation}
      />
    );
  }

  if (currentStep === STEPS.PAYMENT) {
    return (
      <PaymentPage
        quotationId={quotationId}
        setCurrentStep={setCurrentStep}
        STEPS={STEPS}
        formatCurrency={formatCurrency}
        supabase={supabase}
      />
    );
  }

  return null;
}

export default App;