import React, { useEffect, useState } from "react";
import axios from "axios";

function SummaryCards({ refresh }) {
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    axios
      .get("https://splitsmart-upi.onrender.com/transactions")
      .then((res) => setTransactions(res.data))
      .catch(() => setTransactions([]));
  }, [refresh]);

  const total = transactions.reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="summary">
      <div className="summaryCard">
        <h3>💰 Total Amount</h3>
        <p>₹{total.toFixed(2)}</p>
      </div>

      <div className="summaryCard">
        <h3>🔁 Transactions</h3>
        <p>{transactions.length}</p>
      </div>

      <div className="summaryCard">
        <h3>⚡ UPI Ready</h3>
        <p>Enabled</p>
      </div>
    </div>
  );
}

export default SummaryCards;