import React, { useEffect, useState } from "react";
import axios from "axios";

function PaymentForm({ amountFromReceipt, setRefresh }) {
  const [sender, setSender] = useState("");
  const [receiver, setReceiver] = useState("");
  const [receiverUpi, setReceiverUpi] = useState("");
  const [amount, setAmount] = useState("");
  const [phone, setPhone] = useState("");
  const [note, setNote] = useState("Food bill split");
  const [message, setMessage] = useState("");
  const [upiLink, setUpiLink] = useState("");

  useEffect(() => {
    if (amountFromReceipt) {
      setAmount(amountFromReceipt);
    }
  }, [amountFromReceipt]);

  const handlePayment = async () => {
    if (!sender || !receiver || !receiverUpi || !amount) {
      setMessage("⚠️ Please fill sender, receiver, UPI ID, and amount");
      return;
    }

    try {
      const res = await axios.post("https://splitsmart-upi.onrender.com/payment", {
        sender,
        receiver,
        receiver_upi: receiverUpi,
        amount: parseFloat(amount),
        phone,
        note,
      });

      setUpiLink(res.data.transaction.upi_link);

      const smsText = `SplitSmart SMS\n${sender} needs to pay ₹${amount} to ${receiver}\nUPI: ${receiverUpi}`;

      alert(`📩 SMS Notification Simulated\n\nTo: ${phone || "No phone entered"}\n\n${smsText}`);

      setMessage("✅ Payment created. SMS notification simulated for demo.");
      setRefresh((prev) => !prev);
    } catch (error) {
      setMessage("❌ Backend not responding");
    }
  };

  return (
    <div className="card">
      <h2>💸 Create UPI Payment</h2>

      {message && <p className="message">{message}</p>}

      <input
        placeholder="Sender name"
        value={sender}
        onChange={(e) => setSender(e.target.value)}
      />

      <input
        placeholder="Receiver name"
        value={receiver}
        onChange={(e) => setReceiver(e.target.value)}
      />

      <input
        placeholder="Receiver UPI ID e.g. name@upi"
        value={receiverUpi}
        onChange={(e) => setReceiverUpi(e.target.value)}
      />

      <input
        placeholder="Amount ₹"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
      />

      <input
        placeholder="Receiver phone number"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
      />

      <input
        placeholder="Note"
        value={note}
        onChange={(e) => setNote(e.target.value)}
      />

      <button onClick={handlePayment}>⚡ Generate Payment</button>

      {upiLink && (
        <div className="upiBox">
          <h3>📱 UPI Payment Link</h3>
          <p>{upiLink}</p>
          <a href={upiLink}>
            <button>Open UPI App</button>
          </a>
        </div>
      )}
    </div>
  );
}

export default PaymentForm;