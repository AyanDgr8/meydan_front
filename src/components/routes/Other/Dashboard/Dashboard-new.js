import { useState, useEffect } from "react";
import {
  Building2,
  Users,
  MessageSquare,
  Bell,
  Phone,
  CreditCard,
  UserCheck,
  Settings,
  ChevronDown,
  ChevronRight,
  Loader,
  AlertCircle,
  ChevronLeft,
  Edit2,
  Trash2,
  Mail,
  MapPin,
  Calendar,
  User,
} from "lucide-react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Brand from "../../Forms/AdminPortal/Brand/Brand";
import Business from "../../Forms/AdminPortal/Business/Business";
import Receptionist from "../../Forms/AdminPortal/Receptionist/Receptionist";
import AdminPortal from "../../Forms/AdminPortal/AdminPortal";
import { getFilteredNavigation } from "./DashboardNavConfig";
import ViewMessages from "./MessagesSection/ViewMessages";
import CreateMessage from "./MessagesSection/CreateMessage";
import ViewDirectory from "./DirectorySection/ViewDirectory";
import { mockMessages } from "./data/MockMessages";

const DashboardNew = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [businesses, setBusinesses] = useState([]);
  const [navigationItems, setNavigationItems] = useState([]);
  const [user, setUser] = useState(null); // Add user to state
  const [isNavCollapsed, setIsNavCollapsed] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [activeAction, setActiveAction] = useState(null);
  const [expandedSections, setExpandedSections] = useState({});

  const [error, setError] = useState(null);

  useEffect(() => {
    try {
      const userData = localStorage.getItem("user");
      if (userData) {
        const parsedUser = JSON.parse(userData);

        if (parsedUser && parsedUser.role) {
          setUser(parsedUser);
        } else {
          console.error("User data exists but no role found");
          navigate("/admin");
          return;
        }
      } else {
        console.error("No user data found in localStorage");
        navigate("/admin");
        return;
      }
    } catch (error) {
      console.error("Error parsing user data from localStorage:", error);
      navigate("/admin");
      return;
    }
  }, [navigate]);

  useEffect(() => {
    if (user && user.role) {
      const filteredNav = getFilteredNavigation(user.role);

      setNavigationItems(filteredNav);

      // Initialize expanded sections
      const initialExpandedSections = {};
      filteredNav.forEach((item) => {
        initialExpandedSections[item.id] = false;
      });
      setExpandedSections(initialExpandedSections);
    }
  }, [user]);

  const fetchBusinesses = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/admin");
        return;
      }

      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/business`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setBusinesses(response.data);
    } catch (error) {
      console.error("Error fetching businesses:", error);
      setError(
        error.response?.data?.message ||
          "You do not have access to any business centers"
      );
      setBusinesses([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBusinesses();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const toggleSection = (sectionId) => {
    setExpandedSections((prev) => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }));
  };

  const renderContent = () => {
    switch (activeAction) {
      case "view-company":
        return (
          <ViewDirectory
            businesses={businesses}
            loading={loading}
            error={error}
          />
        );
      case "view-messages":
        return <ViewMessages mockMessages={mockMessages} />;
      case "create-message":
        return <CreateMessage />;
      case "edit-messages":
        return <EditMessagesSection />;
      case "delete-messages":
        return <DeleteMessagesSection />;
      case "view-reminders":
        return <ViewRemindersSection />;
      case "add-did":
        return <AddDidSection />;
      case "change-did":
        return <ChangeDidSection />;
      case "remove-did":
        return <RemoveDidSection />;
      case "view-bill":
        return <ViewBillSection />;
      case "generate-bill":
        return <GenerateBillSection />;
      case "dispatch-bill":
        return <DispatchBillSection />;
      case "approve-visitor":
        return <ApproveVisitorSection />;
      case "message-member":
        return <MessageMemberSection />;
      case "view-visitors":
        return <ViewVisitorsSection />;
      case "brand-management":
        return <Brand />;
      case "business-management":
        return <Business />;
      case "receptionist-management":
        return <Receptionist />;
      case "companies-users":
        return <AdminPortal />;
      default:
        return <DefaultDashboardView />;
    }
  };

  if (!user) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <Loader style={{ animation: "spin 1s linear infinite" }} />
        <span style={{ marginLeft: "0.5rem" }}>Loading user data...</span>
      </div>
    );
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        background: "linear-gradient(135deg, #f8fafc 0%, #e0f2fe 100%)",
      }}
    >
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        <nav
          style={{
            width: isNavCollapsed ? "4rem" : "16rem",
            background: "white",
            boxShadow: "0 0 15px rgba(0, 0, 0, 0.1)",
            overflowY: "auto",
            transition: "width 0.3s ease",
            position: "relative",
          }}
        >
          <div style={{ padding: "1rem" }}>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.25rem",
              }}
            >
              {navigationItems.length === 0 ? (
                <div
                  style={{
                    padding: "1rem",
                    textAlign: "center",
                    color: "#64748b",
                    fontSize: "0.875rem",
                  }}
                >
                  No navigation items available for your role
                </div>
              ) : (
                navigationItems.map((item) => {
                  const Icon = item.icon;
                  const ChevronIcon = expandedSections[item.id]
                    ? ChevronDown
                    : ChevronRight;

                  return (
                    <div key={item.id} style={{ marginBottom: "0.25rem" }}>
                      <button
                        onClick={() => toggleSection(item.id)}
                        style={{
                          width: "100%",
                          display: "flex",
                          alignItems: "center",
                          gap: isNavCollapsed ? "0" : "0.75rem",
                          padding: isNavCollapsed ? "0.75rem 0" : "0.75rem",
                          justifyContent: isNavCollapsed
                            ? "center"
                            : "flex-start",
                          borderRadius: "0.5rem",
                          border: "none",
                          background: "none",
                          color: "#374151",
                          fontWeight: 500,
                          fontSize: "0.875rem",
                          cursor: "pointer",
                          textAlign: "left",
                          transition: "all 0.2s",
                          position: "relative",
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.background = "#f1f5f9";
                          e.target.style.color = "#1f2937";
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.background = "none";
                          e.target.style.color = "#374151";
                        }}
                      >
                        <Icon style={{ width: "1.25rem", height: "1.25rem" }} />
                        {!isNavCollapsed && <span>{item.name}</span>}
                        {!isNavCollapsed && item.actions?.length > 0 && (
                          <ChevronIcon
                            style={{
                              width: "1rem",
                              height: "1rem",
                              marginLeft: "auto",
                              transition: "transform 0.2s",
                            }}
                          />
                        )}
                      </button>

                      {!isNavCollapsed &&
                        expandedSections[item.id] &&
                        item.actions?.length > 0 && (
                          <div
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              paddingLeft: "2rem",
                              marginTop: "0.25rem",
                              gap: "0.25rem",
                            }}
                          >
                            {item.actions.map((action) => (
                              <button
                                key={action.id}
                                className={
                                  activeAction === action.id ? "active" : ""
                                }
                                onClick={() => setActiveAction(action.id)}
                                style={{
                                  padding: "0.5rem 0.75rem",
                                  borderRadius: "0.5rem",
                                  border: "none",
                                  background:
                                    activeAction === action.id
                                      ? "#e0f2fe"
                                      : "none",
                                  color:
                                    activeAction === action.id
                                      ? "#0369a1"
                                      : "#64748b",
                                  fontSize: "0.875rem",
                                  textAlign: "left",
                                  cursor: "pointer",
                                  transition: "all 0.2s",
                                  fontWeight:
                                    activeAction === action.id ? 500 : "normal",
                                }}
                                onMouseEnter={(e) => {
                                  if (activeAction !== action.id) {
                                    e.target.style.background = "#f1f5f9";
                                    e.target.style.color = "#1f2937";
                                  }
                                }}
                                onMouseLeave={(e) => {
                                  if (activeAction !== action.id) {
                                    e.target.style.background = "none";
                                    e.target.style.color = "#64748b";
                                  }
                                }}
                              >
                                {action.name}
                              </button>
                            ))}
                          </div>
                        )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </nav>

        <main
          style={{
            flex: 1,
            overflowY: "hidden",
            padding: "0.75rem",
            paddingBottom: "1.5rem",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* <div
            style={{
              position: "sticky",
              top: 0,
              zIndex: 10,
              background: "linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)",
              color: "white",
              padding: "0.5rem 0",
              borderRadius: "12px",
              marginBottom: "0",
              boxShadow: "0 4px 20px rgba(30, 64, 175, 0.3)",
              textAlign: "center",
            }}
          >
            <h1
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "2rem",
                fontWeight: "bold",
                margin: "0",
              }}
            >
              <Building2
                style={{
                  width: "2.5rem",
                  height: "2.0rem",
                  color: "white",
                }}
              />
              Akash Business Center
            </h1>
          </div> */}

          <div style={{ flex: 1 }}>{renderContent()}</div>
        </main>
      </div>
    </div>
  );
};

const DefaultDashboardView = () => {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "1.5rem",
        marginTop: "1.5rem",
      }}
    >
      {/* Left Column - Actions */}
      <div
        style={{
          background: "white",
          borderRadius: "12px",
          padding: "1.5rem",
          boxShadow: "0 4px 6px rgba(0, 0, 0, 0.05)",
        }}
      >
        <h3
          style={{
            fontSize: "1.25rem",
            fontWeight: 600,
            color: "#1e293b",
            marginBottom: "1rem",
            borderBottom: "1px solid #e2e8f0",
            paddingBottom: "0.5rem",
          }}
        >
          Quick Actions
        </h3>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "1rem",
          }}
        >
          <button
            style={{
              padding: "0.75rem",
              borderRadius: "8px",
              background: "#e0f7fa",
              border: "none",
              color: "#006064",
              fontWeight: 500,
              cursor: "pointer",
              transition: "all 0.2s",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            <Phone size={18} /> Call Logs
          </button>
          <button
            style={{
              padding: "0.75rem",
              borderRadius: "8px",
              background: "#e8f5e9",
              border: "none",
              color: "#2e7d32",
              fontWeight: 500,
              cursor: "pointer",
              transition: "all 0.2s",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            <MessageSquare size={18} /> New Message
          </button>
          <button
            style={{
              padding: "0.75rem",
              borderRadius: "8px",
              background: "#fff3e0",
              border: "none",
              color: "#e65100",
              fontWeight: 500,
              cursor: "pointer",
              transition: "all 0.2s",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            <UserCheck size={18} /> Visitor Approval
          </button>
          <button
            style={{
              padding: "0.75rem",
              borderRadius: "8px",
              background: "#f3e5f5",
              border: "none",
              color: "#6a1b9a",
              fontWeight: 500,
              cursor: "pointer",
              transition: "all 0.2s",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            <CreditCard size={18} /> Generate Bill
          </button>
        </div>
      </div>

      {/* Right Column - Stats */}
      <div
        style={{
          background: "white",
          borderRadius: "12px",
          padding: "1.5rem",
          boxShadow: "0 4px 6px rgba(0, 0, 0, 0.05)",
        }}
      >
        <h3
          style={{
            fontSize: "1.25rem",
            fontWeight: 600,
            color: "#1e293b",
            marginBottom: "1rem",
            borderBottom: "1px solid #e2e8f0",
            paddingBottom: "0.5rem",
          }}
        >
          Switchboard Activity
        </h3>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "1rem",
          }}
        >
          <div
            style={{
              background: "#f8fafc",
              borderRadius: "8px",
              padding: "1rem",
            }}
          >
            <div style={{ color: "#64748b", fontSize: "0.875rem" }}>
              Last Call Received at
            </div>
            <div
              style={{
                fontSize: "1.25rem",
                fontWeight: 600,
                color: "#1e293b",
                marginTop: "0.25rem",
              }}
            >
              {new Date().toLocaleTimeString()}
            </div>
          </div>

          <div
            style={{
              background: "#f8fafc",
              borderRadius: "8px",
              padding: "1rem",
            }}
          >
            <div style={{ color: "#64748b", fontSize: "0.875rem" }}>
              Last Call received for
            </div>
            <div
              style={{
                fontSize: "1.25rem",
                fontWeight: 600,
                color: "#1e293b",
                marginTop: "0.25rem",
              }}
            >
              Company name
            </div>
          </div>

          <div
            style={{
              background: "#f8fafc",
              borderRadius: "8px",
              padding: "1rem",
            }}
          >
            <div style={{ color: "#64748b", fontSize: "0.875rem" }}>
              Last Call for member
            </div>
            <div
              style={{
                fontSize: "1.25rem",
                fontWeight: 600,
                color: "#1e293b",
                marginTop: "0.25rem",
              }}
            >
              Member name
            </div>
          </div>

          <div
            style={{
              background: "#f8fafc",
              borderRadius: "8px",
              padding: "1rem",
            }}
          >
            <div style={{ color: "#64748b", fontSize: "0.875rem" }}>
              Last Action
            </div>
            <div
              style={{
                fontSize: "1.25rem",
                fontWeight: 600,
                color: "#1e293b",
                marginTop: "0.25rem",
              }}
            >
              Transfer
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Row - Statistics */}
      <div
        style={{
          background: "white",
          borderRadius: "12px",
          padding: "1.5rem",
          boxShadow: "0 4px 6px rgba(0, 0, 0, 0.05)",
          gridColumn: "1 / -1",
        }}
      >
        <h3
          style={{
            fontSize: "1.25rem",
            fontWeight: 600,
            color: "#1e293b",
            marginBottom: "1rem",
            borderBottom: "1px solid #e2e8f0",
            paddingBottom: "0.5rem",
          }}
        >
          System Statistics
        </h3>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: "1rem",
          }}
        >
          <div
            style={{
              background: "#f0fdf4",
              borderRadius: "8px",
              padding: "1rem",
              borderLeft: "4px solid #22c55e",
            }}
          >
            <div style={{ color: "#64748b", fontSize: "0.875rem" }}>
              Active Companies
            </div>
            <div
              style={{
                fontSize: "1.5rem",
                fontWeight: 700,
                color: "#166534",
                marginTop: "0.25rem",
              }}
            >
              23
            </div>
          </div>

          <div
            style={{
              background: "#eff6ff",
              borderRadius: "8px",
              padding: "1rem",
              borderLeft: "4px solid #3b82f6",
            }}
          >
            <div style={{ color: "#64748b", fontSize: "0.875rem" }}>
              Subscribed Companies
            </div>
            <div
              style={{
                fontSize: "1.5rem",
                fontWeight: 700,
                color: "#1e40af",
                marginTop: "0.25rem",
              }}
            >
              11
            </div>
          </div>

          <div
            style={{
              background: "#fef2f2",
              borderRadius: "8px",
              padding: "1rem",
              borderLeft: "4px solid #ef4444",
            }}
          >
            <div style={{ color: "#64748b", fontSize: "0.875rem" }}>
              Today's Calls
            </div>
            <div
              style={{
                fontSize: "1.5rem",
                fontWeight: 700,
                color: "#991b1b",
                marginTop: "0.25rem",
              }}
            >
              123
            </div>
          </div>

          <div
            style={{
              background: "#faf5ff",
              borderRadius: "8px",
              padding: "1rem",
              borderLeft: "4px solid #8b5cf6",
            }}
          >
            <div style={{ color: "#64748b", fontSize: "0.875rem" }}>
              Messages Sent
            </div>
            <div
              style={{
                fontSize: "1.5rem",
                fontWeight: 700,
                color: "#6d28d9",
                marginTop: "0.25rem",
              }}
            >
              19
            </div>
          </div>

          <div
            style={{
              background: "#ecfdf5",
              borderRadius: "8px",
              padding: "1rem",
              borderLeft: "4px solid #10b981",
            }}
          >
            <div style={{ color: "#64748b", fontSize: "0.875rem" }}>
              Walk-in Visitors
            </div>
            <div
              style={{
                fontSize: "1.5rem",
                fontWeight: 700,
                color: "#065f46",
                marginTop: "0.25rem",
              }}
            >
              23
            </div>
          </div>

          <div
            style={{
              background: "#fff7ed",
              borderRadius: "8px",
              padding: "1rem",
              borderLeft: "4px solid #f97316",
            }}
          >
            <div style={{ color: "#64748b", fontSize: "0.875rem" }}>
              Last Walk-in
            </div>
            <div
              style={{
                fontSize: "1.25rem",
                fontWeight: 600,
                color: "#9a3412",
                marginTop: "0.25rem",
              }}
            >
              1 hour ago
            </div>
          </div>

          <div
            style={{
              background: "#f5f3ff",
              borderRadius: "8px",
              padding: "1rem",
              borderLeft: "4px solid #7c3aed",
            }}
          >
            <div style={{ color: "#64748b", fontSize: "0.875rem" }}>
              Last Office Visitor
            </div>
            <div
              style={{
                fontSize: "1.25rem",
                fontWeight: 600,
                color: "#5b21b6",
                marginTop: "0.25rem",
              }}
            >
              Googly
            </div>
          </div>

          <div
            style={{
              background: "#f1f5f9",
              borderRadius: "8px",
              padding: "1rem",
              borderLeft: "4px solid #64748b",
            }}
          >
            <div style={{ color: "#64748b", fontSize: "0.875rem" }}>
              Last Member Visitor
            </div>
            <div
              style={{
                fontSize: "1.25rem",
                fontWeight: 600,
                color: "#334155",
                marginTop: "0.25rem",
              }}
            >
              X
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const EditMessagesSection = () => (
  <div style={{ padding: "2rem", textAlign: "center" }}>
    <h2 style={{ color: "#1e293b", marginBottom: "1rem" }}>Edit Messages</h2>
    <p style={{ color: "#64748b" }}>
      This section will allow editing of existing messages with message
      templates and formatting options.
    </p>
  </div>
);

const DeleteMessagesSection = () => (
  <div style={{ padding: "2rem", textAlign: "center" }}>
    <h2 style={{ color: "#1e293b", marginBottom: "1rem" }}>Delete Messages</h2>
    <p style={{ color: "#64748b" }}>
      This section will allow deleting of existing messages with message
      templates and formatting options.
    </p>
  </div>
);

const ViewRemindersSection = () => (
  <div style={{ padding: "2rem", textAlign: "center" }}>
    <h2 style={{ color: "#1e293b", marginBottom: "1rem" }}>View Reminders</h2>
    <p style={{ color: "#64748b" }}>Reminders management section</p>
  </div>
);

const AddDidSection = () => (
  <div style={{ padding: "2rem", textAlign: "center" }}>
    <h2 style={{ color: "#1e293b", marginBottom: "1rem" }}>Add DID</h2>
    <p style={{ color: "#64748b" }}>Add DID number section</p>
  </div>
);

const ChangeDidSection = () => (
  <div style={{ padding: "2rem", textAlign: "center" }}>
    <h2 style={{ color: "#1e293b", marginBottom: "1rem" }}>Change DID</h2>
    <p style={{ color: "#64748b" }}>Change DID number section</p>
  </div>
);

const RemoveDidSection = () => (
  <div style={{ padding: "2rem", textAlign: "center" }}>
    <h2 style={{ color: "#1e293b", marginBottom: "1rem" }}>Remove DID</h2>
    <p style={{ color: "#64748b" }}>Remove DID number section</p>
  </div>
);

const ViewBillSection = () => (
  <div style={{ padding: "2rem", textAlign: "center" }}>
    <h2 style={{ color: "#1e293b", marginBottom: "1rem" }}>View Bill</h2>
    <p style={{ color: "#64748b" }}>Billing information section</p>
  </div>
);

const GenerateBillSection = () => (
  <div style={{ padding: "2rem", textAlign: "center" }}>
    <h2 style={{ color: "#1e293b", marginBottom: "1rem" }}>Generate Bill</h2>
    <p style={{ color: "#64748b" }}>Generate new bills section</p>
  </div>
);

const DispatchBillSection = () => (
  <div style={{ padding: "2rem", textAlign: "center" }}>
    <h2 style={{ color: "#1e293b", marginBottom: "1rem" }}>Dispatch Bill</h2>
    <p style={{ color: "#64748b" }}>Send bills to customers section</p>
  </div>
);

const ApproveVisitorSection = () => (
  <div style={{ padding: "2rem", textAlign: "center" }}>
    <h2 style={{ color: "#1e293b", marginBottom: "1rem" }}>Approve Visitor</h2>
    <p style={{ color: "#64748b" }}>Visitor approval section</p>
  </div>
);

const MessageMemberSection = () => (
  <div style={{ padding: "2rem", textAlign: "center" }}>
    <h2 style={{ color: "#1e293b", marginBottom: "1rem" }}>Message Member</h2>
    <p style={{ color: "#64748b" }}>Send messages to members section</p>
  </div>
);

const ViewVisitorsSection = () => (
  <div style={{ padding: "2rem", textAlign: "center" }}>
    <h2 style={{ color: "#1e293b", marginBottom: "1rem" }}>
      View all Visitors
    </h2>
    <p style={{ color: "#64748b" }}>All visitors list section</p>
  </div>
);

export default DashboardNew;
