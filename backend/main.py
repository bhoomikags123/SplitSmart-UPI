from fastapi import FastAPI
from pydantic import BaseModel
from typing import Optional, List
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime
import os
from twilio.rest import Client

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

transactions = []

class Payment(BaseModel):
    sender: str
    receiver: str
    receiver_upi: str
    amount: float
    phone: Optional[str] = None
    note: Optional[str] = "SplitSmart UPI Payment"

def send_sms(phone: Optional[str], message: str):
    if not phone:
        return {
            "status": "skipped",
            "message": "No phone number provided"
        }

    sid = os.getenv("TWILIO_ACCOUNT_SID")
    token = os.getenv("TWILIO_AUTH_TOKEN")
    twilio_from = os.getenv("TWILIO_PHONE_NUMBER")

    if not sid or not token or not twilio_from:
        return {
            "status": "simulated",
            "message": f"Demo SMS sent to {phone}"
        }

    try:
        client = Client(sid, token)
        sms = client.messages.create(
            body=message,
            from_=twilio_from,
            to=phone
        )

        return {
            "status": "sent",
            "sid": sms.sid
        }

    except Exception as e:
        return {
            "status": "failed",
            "message": str(e)
        }

@app.get("/")
def home():
    return {"message": "SplitSmart Backend Running 🚀"}

@app.post("/payment")
def create_payment(payment: Payment):
    upi_link = (
        f"upi://pay?pa={payment.receiver_upi}"
        f"&pn={payment.receiver}"
        f"&am={payment.amount}"
        f"&cu=INR"
        f"&tn={payment.note}"
    )

    transaction = {
        "id": len(transactions) + 1,
        "sender": payment.sender,
        "receiver": payment.receiver,
        "receiver_upi": payment.receiver_upi,
        "amount": payment.amount,
        "note": payment.note,
        "upi_link": upi_link,
        "time": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    }

    transactions.append(transaction)

    sms_message = (
        f"SplitSmart UPI: {payment.sender} needs to pay "
        f"₹{payment.amount} to {payment.receiver}. "
        f"UPI ID: {payment.receiver_upi}"
    )

    notification = send_sms(payment.phone, sms_message)

    return {
        "transaction": transaction,
        "notification": notification
    }

@app.get("/transactions")
def get_transactions():
    return transactions