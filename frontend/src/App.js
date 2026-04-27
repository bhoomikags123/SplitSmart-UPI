import React from "react";
import PaymentForm from "./components/PaymentForm";
import ReceiptScanner from "./components/ReceiptScanner";
import TransactionList from "./components/TransactionList";
import SummaryCards from "./components/SummaryCards";
import "./styles.css";

function App() {
  const [amountFromReceipt, setAmountFromReceipt] = React.useState("");
  const [refresh, setRefresh] = React.useState(false);

  return (
    <div className="app">
      <div className="hero">
        <h1>🚀 SplitSmart UPI</h1>
        <p>Smart sender-to-receiver payments with receipt OCR and SMS alerts</p>
      </div>

      <SummaryCards refresh={refresh} />

      <div className="grid">
        <PaymentForm
          amountFromReceipt={amountFromReceipt}
          setRefresh={setRefresh}
        />

        <ReceiptScanner setAmountFromReceipt={setAmountFromReceipt} />
      </div>

      <TransactionList refresh={refresh} />
    </div>
  );
}

export default App;