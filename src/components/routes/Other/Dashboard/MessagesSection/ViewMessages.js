import { useState } from "react";
import {
  Mail,
  ChevronRight,
  Clock,
  Check,
  Star,
  Trash2,
  Archive,
} from "lucide-react";

const ViewMessages = ({ mockMessages }) => {
  const [messages, setMessages] = useState(mockMessages);
  const [selectedMessage, setSelectedMessage] = useState(null);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const markAsRead = (id) => {
    setMessages(
      messages.map((msg) => (msg.id === id ? { ...msg, status: "read" } : msg))
    );
  };

  const deleteMessage = (id) => {
    setMessages(messages.filter((msg) => msg.id !== id));
    if (selectedMessage && selectedMessage.id === id) {
      setSelectedMessage(null);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        height: "calc(100vh - 120px)",
        backgroundColor: "#f8fafc",
        borderRadius: "8px",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          width: "350px",
          borderRight: "1px solid #e2e8f0",
          backgroundColor: "white",
          overflowY: "auto",
        }}
      >
        <div
          style={{
            padding: "16px",
            borderBottom: "1px solid #e2e8f0",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <h2 style={{ margin: 0, fontSize: "18px", color: "#1e293b" }}>
            Messages
          </h2>
          <div style={{ display: "flex", gap: "8px" }}>
            <button
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "#64748b",
              }}
            >
              <Archive size={18} />
            </button>
            <button
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "#64748b",
              }}
            >
              <Trash2 size={18} />
            </button>
          </div>
        </div>

        {messages.map((message) => (
          <div
            key={message.id}
            onClick={() => {
              setSelectedMessage(message);
              markAsRead(message.id);
            }}
            style={{
              padding: "16px",
              borderBottom: "1px solid #e2e8f0",
              cursor: "pointer",
              backgroundColor:
                message.status === "unread" ? "#f1f5f9" : "white",
              ":hover": {
                backgroundColor: "#f1f5f9",
              },
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "8px",
              }}
            >
              <div
                style={{
                  fontWeight: message.status === "unread" ? "600" : "400",
                  color: message.status === "unread" ? "#1e293b" : "#64748b",
                }}
              >
                {message.subject}
              </div>
              <div
                style={{
                  fontSize: "12px",
                  color: "#64748b",
                }}
              >
                {formatDate(message.date)}
              </div>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div
                style={{
                  fontSize: "14px",
                  color: "#64748b",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  maxWidth: "200px",
                }}
              >
                To: {message.recipient}
              </div>
              <div style={{ display: "flex", gap: "4px" }}>
                <button
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "#64748b",
                  }}
                >
                  <Star size={16} fill={message.starred ? "#f59e0b" : "none"} />
                </button>
                <ChevronRight size={16} color="#64748b" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Message Detail View */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          backgroundColor: "white",
          overflowY: "auto",
        }}
      >
        {selectedMessage ? (
          <>
            <div
              style={{
                padding: "24px",
                borderBottom: "1px solid #e2e8f0",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "16px",
                }}
              >
                <h2 style={{ margin: 0, fontSize: "20px", color: "#1e293b" }}>
                  {selectedMessage.subject}
                </h2>
                <div style={{ display: "flex", gap: "8px" }}>
                  <button
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: "#64748b",
                    }}
                  >
                    <Archive size={18} />
                  </button>
                  <button
                    onClick={() => deleteMessage(selectedMessage.id)}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: "#64748b",
                    }}
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "24px",
                }}
              >
                <div>
                  <div style={{ color: "#64748b", marginBottom: "4px" }}>
                    From: {selectedMessage.sender}
                  </div>
                  <div style={{ color: "#64748b" }}>
                    To: {selectedMessage.recipient}
                  </div>
                </div>
                <div style={{ color: "#64748b" }}>
                  {formatDate(selectedMessage.date)}
                </div>
              </div>
            </div>

            <div style={{ padding: "24px" }}>
              <h3
                style={{
                  color: "#1e40af",
                  marginBottom: "16px",
                  borderBottom: "1px solid #e2e8f0",
                  paddingBottom: "8px",
                }}
              >
                Customer Information
              </h3>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
                  gap: "16px",
                  marginBottom: "24px",
                }}
              >
                <div>
                  <div style={{ color: "#64748b", fontSize: "14px" }}>Name</div>
                  <div style={{ color: "#1e293b" }}>
                    {selectedMessage.content.customer_name}
                  </div>
                </div>
                <div>
                  <div style={{ color: "#64748b", fontSize: "14px" }}>
                    Phone
                  </div>
                  <div style={{ color: "#1e293b" }}>
                    {selectedMessage.content.phone_no_primary}
                  </div>
                </div>
                <div>
                  <div style={{ color: "#64748b", fontSize: "14px" }}>
                    Email
                  </div>
                  <div style={{ color: "#1e293b" }}>
                    {selectedMessage.content.email_id}
                  </div>
                </div>
                <div>
                  <div style={{ color: "#64748b", fontSize: "14px" }}>
                    Designation
                  </div>
                  <div style={{ color: "#1e293b" }}>
                    {selectedMessage.content.designation}
                  </div>
                </div>
                <div>
                  <div style={{ color: "#64748b", fontSize: "14px" }}>
                    Country
                  </div>
                  <div style={{ color: "#1e293b" }}>
                    {selectedMessage.content.country}
                  </div>
                </div>
                <div>
                  <div style={{ color: "#64748b", fontSize: "14px" }}>
                    Disposition
                  </div>
                  <div style={{ color: "#1e293b" }}>
                    {selectedMessage.content.disposition}
                  </div>
                </div>
              </div>

              <h3
                style={{
                  color: "#1e40af",
                  marginBottom: "16px",
                  borderBottom: "1px solid #e2e8f0",
                  paddingBottom: "8px",
                }}
              >
                Message Details
              </h3>

              <div style={{ marginBottom: "16px" }}>
                <div style={{ color: "#64748b", fontSize: "14px" }}>
                  Address
                </div>
                <div style={{ color: "#1e293b" }}>
                  {selectedMessage.content.address}
                </div>
              </div>

              <div>
                <div style={{ color: "#64748b", fontSize: "14px" }}>
                  Comments
                </div>
                <div
                  style={{
                    color: "#1e293b",
                    backgroundColor: "#f8fafc",
                    padding: "12px",
                    borderRadius: "4px",
                    marginTop: "8px",
                  }}
                >
                  {selectedMessage.content.comment}
                </div>
              </div>
            </div>
          </>
        ) : (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              height: "100%",
              color: "#64748b",
            }}
          >
            <Mail size={48} style={{ marginBottom: "16px" }} />
            <h3 style={{ margin: 0, marginBottom: "8px" }}>
              No Message Selected
            </h3>
            <p style={{ margin: 0 }}>Select a message to view its contents</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewMessages;
