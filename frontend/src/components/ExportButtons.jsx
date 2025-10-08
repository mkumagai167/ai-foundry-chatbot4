import React from "react";
import { exportToDocx, exportToPdf } from "../utils/export";

export default function ExportButtons({ messages }) {
  return (
    <div style={{ marginTop: 20 }}>
      <button onClick={() => exportToDocx(messages)}>Export to Word</button>
      <button onClick={() => exportToPdf(messages)}>Export to PDF</button>
    </div>
  );
}
