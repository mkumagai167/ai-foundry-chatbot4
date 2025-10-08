// src/utils/export.js

// Import jsPDF for PDF export
import { jsPDF } from "jspdf";

// Import docx and file-saver for Word export
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
} from "docx";
import { saveAs } from "file-saver";

/**
 * Export chat messages to PDF file.
 * @param {Array} messages - Array of message objects { role, text, time }
 */
export const exportToPdf = (messages) => {
  const doc = new jsPDF();

  let y = 10; // vertical starting point on page

  messages.forEach((msg) => {
    // Determine prefix based on role
    const prefix =
      msg.role === "user"
        ? "You: "
        : msg.role === "assistant"
        ? "Assistant: "
        : "System: ";
    const text = prefix + msg.text;

    // Split long text to fit page width
    const lines = doc.splitTextToSize(text, 180);
    doc.text(lines, 10, y);

    y += lines.length * 10;

    // Add new page if bottom is reached
    if (y > 280) {
      doc.addPage();
      y = 10;
    }
  });

  // Save PDF with filename
  doc.save("chat-export.pdf");
};

/**
 * Export chat messages to Word (.docx) file.
 * @param {Array} messages - Array of message objects { role, text, time }
 */
export const exportToDocx = async (messages) => {
  // Create a new Word Document
  const doc = new Document({
    creator: "Azure Foundry Chat App",
    title: "Chat Export",
    description: "Chat conversation exported from Azure Foundry Chat App",
    sections: [
      {
        children: messages.map((msg) =>
          new Paragraph({
            children: [
              new TextRun({
                text:
                  (msg.role === "user"
                    ? "You: "
                    : msg.role === "assistant"
                    ? "Assistant: "
                    : "System: ") + msg.text,
                bold: msg.role === "user",
                color: msg.role === "user" ? "0000FF" : "000000",
              }),
            ],
          })
        ),
      },
    ],
  });

  // Generate the Word document as a Blob (must await)
  const blob = await Packer.toBlob(doc);

  // Trigger file download using file-saver
  saveAs(blob, "chat-export.docx");
};
