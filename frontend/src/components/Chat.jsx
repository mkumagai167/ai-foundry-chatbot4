// frontend/src/components/Chat.jsx
import React, { useState } from "react";
import { useMsal } from "@azure/msal-react";
import { postToBackend } from "../services/api";
import ReactMarkdown from "react-markdown";
import FileUpload from "./FileUpload";

export default function Chat({ messages, setMessages }) {
  const { instance, accounts } = useMsal();
  const account = accounts[0];

  const [text, setText] = useState("");
  const [threadId, setThreadId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [attachedFileIds, setAttachedFileIds] = useState([]);

  async function send() {
    if (!text.trim()) return;

    const userMsg = {
      role: "user",
      text,
      time: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setText("");
    setLoading(true);

    try {
      const tokenResponse = await instance.acquireTokenSilent({
        scopes: ["api://9630bd34-dff3-4fb7-84f6-cccca22c95ca/.default"],
        account,
      });

      const accessToken = tokenResponse.accessToken;

      const resp = await postToBackend(
        userMsg.text,
        accessToken,
        attachedFileIds,
        threadId
      );

      if (resp.threadId && !threadId) {
        setThreadId(resp.threadId);
      }

      const assistantMessages = (resp.assistantMessages || []).map((m) => ({
        role: "assistant",
        text: m.content
          ? m.content.map((c) => c.text?.value || "").join("\n")
          : m.text || "",
        time: m.createdAt,
      }));

      setMessages((prev) => [...prev, ...assistantMessages]);
      setAttachedFileIds([]); // clear after use
    } catch (err) {
      console.error("Chat error:", err);
      setMessages((prev) => [
        ...prev,
        {
          role: "system",
          text: `Error: ${err.message}`,
          time: new Date().toISOString(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "75vh" }}>
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          border: "1px solid #ccc",
          borderRadius: 6,
          padding: 12,
          marginBottom: 10,
        }}
      >
        {messages.map((m, i) => (
          <div
            key={i}
            style={{
              margin: "8px 0",
              textAlign: m.role === "user" ? "right" : "left",
            }}
          >
            <span
              style={{
                display: "inline-block",
                background: m.role === "user" ? "#0078d7" : "#f3f2f1",
                color: m.role === "user" ? "white" : "black",
                padding: "8px 12px",
                borderRadius: 12,
                maxWidth: "75%",
                wordBreak: "break-word",
              }}
            >
              <ReactMarkdown>{m.text}</ReactMarkdown>
            </span>
          </div>
        ))}
      </div>

      <FileUpload
        onFileUploaded={(fileId) => {
          setAttachedFileIds((prev) => [...prev, fileId]);
        }}
      />

      <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          style={{ flex: 1, padding: "8px" }}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder="Type a message..."
        />
        <button onClick={send} disabled={loading}>
          {loading ? "Sending..." : "Send"}
        </button>
      </div>
    </div>
  );
}
