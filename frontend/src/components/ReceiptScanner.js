import React, { useState } from "react";
import Tesseract from "tesseract.js";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf";
import pdfWorker from "pdfjs-dist/legacy/build/pdf.worker.entry";

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

function ReceiptScanner({ setAmountFromReceipt }) {
  const [preview, setPreview] = useState(null);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [amount, setAmount] = useState("");

  const extractAmount = (ocrText) => {
    const lines = ocrText.split("\n");
    let possibleAmount = "";

    for (let line of lines) {
      const lower = line.toLowerCase();

      if (
        lower.includes("total") ||
        lower.includes("amount") ||
        lower.includes("grand") ||
        lower.includes("balance")
      ) {
        const match = line.match(/\d+(\.\d{1,2})?/g);
        if (match) possibleAmount = match[match.length - 1];
      }
    }

    if (!possibleAmount) {
      const allNumbers = ocrText.match(/\d+(\.\d{1,2})?/g);
      if (allNumbers) possibleAmount = allNumbers[allNumbers.length - 1];
    }

    return possibleAmount;
  };

  const readImage = async (file) => {
    setPreview(URL.createObjectURL(file));

    const result = await Tesseract.recognize(file, "eng");
    return result.data.text;
  };

  const readPdf = async (file) => {
    const fileReader = new FileReader();

    return new Promise((resolve, reject) => {
      fileReader.onload = async function () {
        try {
          const typedArray = new Uint8Array(this.result);
          const pdf = await pdfjsLib.getDocument(typedArray).promise;

          const page = await pdf.getPage(1);
          const viewport = page.getViewport({ scale: 2 });

          const canvas = document.createElement("canvas");
          const context = canvas.getContext("2d");

          canvas.width = viewport.width;
          canvas.height = viewport.height;

          await page.render({
            canvasContext: context,
            viewport: viewport,
          }).promise;

          setPreview(canvas.toDataURL("image/png"));

          const result = await Tesseract.recognize(canvas, "eng");
          resolve(result.data.text);
        } catch (err) {
          reject(err);
        }
      };

      fileReader.onerror = reject;
      fileReader.readAsArrayBuffer(file);
    });
  };

  const handleFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoading(true);
    setText("");
    setAmount("");
    setPreview(null);

    try {
      let extractedText = "";

      if (file.type.startsWith("image/")) {
        extractedText = await readImage(file);
      } else if (file.type === "application/pdf") {
        extractedText = await readPdf(file);
      } else {
        setText("❌ Unsupported file. Please upload image or PDF.");
        setLoading(false);
        return;
      }

      setText(extractedText);

      const detectedAmount = extractAmount(extractedText);

      if (detectedAmount) {
        setAmount(detectedAmount);
        setAmountFromReceipt(detectedAmount);
      }
    } catch (error) {
      setText("❌ OCR failed. Try a clearer receipt image or PDF.");
    }

    setLoading(false);
  };

  return (
    <div className="card">
      <h2>📸 Smart Receipt Scanner</h2>

      <input
        type="file"
        accept="image/png, image/jpeg, image/jpg, application/pdf"
        onChange={handleFile}
      />

      {preview && (
        <img className="receiptPreview" src={preview} alt="receipt preview" />
      )}

      {loading && <p>🔍 Reading file with OCR...</p>}

      {amount && (
        <div className="successBox">
          <h3>✅ Detected Amount</h3>
          <p>₹{amount}</p>
        </div>
      )}

      {text && (
        <div className="ocrBox">
          <h3>Extracted Text</h3>
          <p>{text}</p>
        </div>
      )}
    </div>
  );
}

export default ReceiptScanner;