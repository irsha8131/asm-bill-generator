import { useState } from "react";
import { supabase } from "./utils/supabase";

import DetailsPage from "./pages/DetailsPage";
import ItemsPage from "./pages/ItemsPage";
import BillPreview from "./pages/BillPreviewPage";

function App() {
  const [currentStep, setCurrentStep] = useState(1);

  // --------------------------------
  // QUOTATION ID
  // --------------------------------

  const [quotationId, setQuotationId] = useState(null);

  // --------------------------------
  // FIXED LOGO
  // --------------------------------

  const logo = null;

  // --------------------------------
  // SHOP DETAILS
  // --------------------------------

  const [shopDetails, setShopDetails] = useState({
    name: "ASM INTERIORS",
    address:
      "SF NO 659/2B | KUNIYAMUTHUR | COIMBATORE 641008 | Tamil Nadu, India",
    phone: "+91 70929 83982",
    email: "asminteriors4511@gmail.com",
    gst: "",
  });

  // --------------------------------
  // CLIENT DETAILS
  // --------------------------------

  const [clientDetails, setClientDetails] = useState({
    shopName: "",
    name: "",
    address: "",
    phone: "",
    email: "",
    gst: "",
  });

  // --------------------------------
  // ITEMS
  // --------------------------------

  const [items, setItems] = useState([
    {
      id: Date.now(),
      description: "",
      quantity: 1,
      price: 0,
    },
  ]);

  // --------------------------------
  // GST
  // --------------------------------

  const [gstEnabled, setGstEnabled] = useState(false);

  const [gstRate, setGstRate] = useState("");

  // --------------------------------
  // SHOP DETAILS CHANGE
  // --------------------------------

  const handleShopChange = (e) => {
    const { name, value } = e.target;

    setShopDetails((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // --------------------------------
  // CLIENT DETAILS CHANGE
  // --------------------------------

  const handleClientChange = (e) => {
    const { name, value } = e.target;

    setClientDetails((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // --------------------------------
  // ITEMS
  // --------------------------------

  const addItem = () => {
    setItems((prev) => [
      ...prev,
      {
        id: Date.now(),
        description: "",
        quantity: 1,
        price: 0,
      },
    ]);
  };

  const removeItem = (id) => {
    setItems((prev) => {
      if (prev.length === 1) {
        return prev;
      }

      return prev.filter((item) => item.id !== id);
    });
  };

  const updateItem = (id, field, value) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              [field]:
                field === "quantity" || field === "price"
                  ? Number(value)
                  : value,
            }
          : item,
      ),
    );
  };

  // --------------------------------
  // CALCULATIONS
  // --------------------------------

  const getItemAmount = (item) => {
    return Number(item.quantity || 0) * Number(item.price || 0);
  };

  const subtotal = items.reduce((total, item) => {
    return total + getItemAmount(item);
  }, 0);

  const gstAmount =
    gstEnabled && Number(gstRate) > 0
      ? subtotal * (Number(gstRate) / 100)
      : 0;

  const grandTotal = subtotal + gstAmount;

  // --------------------------------
  // CURRENCY
  // --------------------------------

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(amount);
  };

  // --------------------------------
  // SAVE QUOTATION TO SUPABASE
  // --------------------------------

  const handleContinueToItems = async () => {
    try {
      console.log("Saving quotation...");

      const quotationNumber = `ASM-${Date.now()}`;

      const { data, error } = await supabase
        .from("quotations")
        .insert([
          {
            quotation_number: quotationNumber,

            // SHOP
            shop_name: shopDetails.name,
            shop_address: shopDetails.address,
            shop_phone: shopDetails.phone,
            shop_email: shopDetails.email,
            shop_gst: shopDetails.gst,

            // CLIENT
            client_shop_name: clientDetails.shopName,
            client_name: clientDetails.name,
            client_address: clientDetails.address,
            client_phone: clientDetails.phone,
            client_email: clientDetails.email,
            client_gst: clientDetails.gst,

            // INITIAL TOTALS
            gst_rate: 0,
            subtotal: 0,
            gst_amount: 0,
            grand_total: 0,
          },
        ])
        .select()
        .single();

      if (error) {
        console.error("Quotation save error:", error);

        alert(
          `Failed to save quotation.\n\n${error.message}`,
        );

        return;
      }

      console.log("Quotation saved successfully:", data);

      // Store Supabase quotation ID
      setQuotationId(data.id);

      // Move to Items page
      setCurrentStep(2);
    } catch (error) {
      console.error("Unexpected quotation error:", error);

      alert("Something went wrong while saving the quotation.");
    }
  };

  // --------------------------------
  // STEP 1
  // --------------------------------

  if (currentStep === 1) {
    return (
      <DetailsPage
        logo={logo}
        shopDetails={shopDetails}
        clientDetails={clientDetails}
        handleShopChange={handleShopChange}
        handleClientChange={handleClientChange}
        setCurrentStep={setCurrentStep}
        onContinue={handleContinueToItems}
      />
    );
  }

  // --------------------------------
  // STEP 2
  // --------------------------------

  if (currentStep === 2) {
    return (
      <ItemsPage
        quotationId={quotationId}
        items={items}
        addItem={addItem}
        removeItem={removeItem}
        updateItem={updateItem}
        gstEnabled={gstEnabled}
        setGstEnabled={setGstEnabled}
        gstRate={gstRate}
        setGstRate={setGstRate}
        subtotal={subtotal}
        gstAmount={gstAmount}
        grandTotal={grandTotal}
        getItemAmount={getItemAmount}
        formatCurrency={formatCurrency}
        setCurrentStep={setCurrentStep}
      />
    );
  }

  // --------------------------------
  // STEP 3
  // --------------------------------

  if (currentStep === 3) {
    return (
      <BillPreview
        logo={logo}
        quotationId={quotationId}
        shopDetails={shopDetails}
        clientDetails={clientDetails}
        items={items}
        gstEnabled={gstEnabled}
        gstRate={gstRate}
        subtotal={subtotal}
        gstAmount={gstAmount}
        grandTotal={grandTotal}
        getItemAmount={getItemAmount}
        formatCurrency={formatCurrency}
        setCurrentStep={setCurrentStep}
      />
    );
  }

  return null;
}

export default App;