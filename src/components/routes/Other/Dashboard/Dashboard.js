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
} from "lucide-react";
import DashboardService, { AuthenticationError } from "./Dashboard.service";

const Dashboard = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [activeAction, setActiveAction] = useState("view-directory");
  const [expandedSections, setExpandedSections] = useState({
    directory: true,
    messages: false,
    reminders: false,
    telecom: false,
    billing: false,
    visitor: false,
    settings: false,
  });

  // Data states
  const [directoryData, setDirectoryData] = useState({
    teams: [],
    users: [],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch directory data when component mounts or when view-directory is selected
  useEffect(() => {
    if (activeAction === "view-directory") {
      fetchDirectoryData();
    }
  }, [activeAction]);

  const fetchDirectoryData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await DashboardService.getDirectoryData();
      setDirectoryData({
        teams: data.teams || [],
        users: data.users || [],
      });
    } catch (error) {
      console.error("Failed to fetch directory data:", error);
      if (error instanceof AuthenticationError) {
        setError("Authentication failed. Please log in again.");
        // Optionally redirect to login
        // DashboardService.logout();
      } else {
        setError("Failed to load directory data. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const toggleSection = (sectionId) => {
    setExpandedSections((prev) => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }));
  };

  const navigationItems = [
    {
      id: "directory",
      name: "DIRECTORY",
      icon: Building2,
      actions: [
        { id: "view-directory", name: "View Directory", color: "blue" },
        { id: "create-company", name: "Create Company", color: "green" },
        { id: "edit-company", name: "Edit Company", color: "yellow" },
        { id: "delete-company", name: "Delete Company", color: "red" },
      ],
    },
    {
      id: "messages",
      name: "MESSAGES",
      icon: MessageSquare,
      actions: [
        { id: "view-messages", name: "View Messages", color: "blue" },
        { id: "create-message", name: "Create Message", color: "green" },
        { id: "edit-messages", name: "Edit Messages", color: "yellow" },
        { id: "delete-messages", name: "Delete Messages", color: "red" },
      ],
    },
    {
      id: "reminders",
      name: "REMINDERS",
      icon: Bell,
      actions: [
        { id: "view-reminders", name: "View Reminders", color: "blue" },
      ],
    },
    {
      id: "telecom",
      name: "TELECOM",
      icon: Phone,
      actions: [
        { id: "add-did", name: "Add DID", color: "blue" },
        { id: "change-did", name: "Change DID", color: "yellow" },
        { id: "remove-did", name: "Remove DID", color: "red" },
      ],
    },
    {
      id: "billing",
      name: "BILLING",
      icon: CreditCard,
      actions: [
        { id: "view-bill", name: "View Bill", color: "blue" },
        { id: "generate-bill", name: "Generate Bill", color: "green" },
        { id: "dispatch-bill", name: "Dispatch Bill", color: "yellow" },
      ],
    },
    {
      id: "visitor",
      name: "VISITOR MANAGEMENT",
      icon: UserCheck,
      actions: [
        { id: "approve-visitor", name: "Approve Visitor", color: "green" },
        { id: "message-member", name: "Message Member", color: "blue" },
        { id: "view-visitors", name: "View all Visitors", color: "blue" },
      ],
    },
    {
      id: "settings",
      name: "SETTINGS",
      icon: Settings,
      actions: [
        { id: "email-settings", name: "Email Settings", color: "blue" },
        { id: "whatsapp-settings", name: "Whatsapp Settings", color: "blue" },
        { id: "voicemail-settings", name: "Voicemail Settings", color: "blue" },
      ],
    },
  ];

  const renderContent = () => {
    switch (activeAction) {
      // Directory Actions
      case "view-directory":
        return (
          <DirectorySection
            teams={directoryData.teams}
            users={directoryData.users}
            loading={loading}
            error={error}
            onRetry={fetchDirectoryData}
          />
        );
      case "create-company":
        return <CreateCompanySection />;
      case "edit-company":
        return <EditCompanySection />;
      case "delete-company":
        return <DeleteCompanySection />;

      // Messages Actions
      case "view-messages":
        return <ViewMessagesSection />;
      case "create-message":
        return <CreateMessageSection />;
      case "edit-messages":
        return <EditMessagesSection />;
      case "delete-messages":
        return <DeleteMessagesSection />;

      // Reminders Actions
      case "view-reminders":
        return <ViewRemindersSection />;

      // Telecom Actions
      case "add-did":
        return <AddDidSection />;
      case "change-did":
        return <ChangeDidSection />;
      case "remove-did":
        return <RemoveDidSection />;

      // Billing Actions
      case "view-bill":
        return <ViewBillSection />;
      case "generate-bill":
        return <GenerateBillSection />;
      case "dispatch-bill":
        return <DispatchBillSection />;

      // Visitor Actions
      case "approve-visitor":
        return <ApproveVisitorSection />;
      case "message-member":
        return <MessageMemberSection />;
      case "view-visitors":
        return <ViewVisitorsSection />;

      // Settings Actions
      case "email-settings":
        return <EmailSettingsSection />;
      case "whatsapp-settings":
        return <WhatsappSettingsSection />;
      case "voicemail-settings":
        return <VoicemailSettingsSection />;

      default:
        return (
          <DirectorySection
            teams={directoryData.teams}
            users={directoryData.users}
            loading={loading}
            error={error}
            onRetry={fetchDirectoryData}
          />
        );
    }
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        background: "linear-gradient(135deg, #f8fafc 0%, #e0f2fe 100%)",
      }}
    >
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        <nav
          style={{
            width: "16rem",
            background: "white",
            boxShadow: "0 0 15px rgba(0, 0, 0, 0.1)",
            overflowY: "auto",
            transition: "width 0.3s ease",
          }}
        >
          <div style={{ padding: "1rem" }}>
            <h3
              style={{
                fontSize: "0.75rem",
                fontWeight: 600,
                color: "#64748b",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                marginBottom: "1rem",
              }}
            >
              Navigation
            </h3>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.25rem",
              }}
            >
              {navigationItems.map((item) => {
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
                        gap: "0.75rem",
                        padding: "0.75rem",
                        borderRadius: "0.5rem",
                        border: "none",
                        background: "none",
                        color: "#374151",
                        fontWeight: 500,
                        fontSize: "0.875rem",
                        cursor: "pointer",
                        textAlign: "left",
                        transition: "all 0.2s",
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
                      <span>{item.name}</span>
                      <ChevronIcon
                        style={{
                          width: "1rem",
                          height: "1rem",
                          marginLeft: "auto",
                          transition: "transform 0.2s",
                        }}
                      />
                    </button>

                    {expandedSections[item.id] && (
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
                                activeAction === action.id ? "#e0f2fe" : "none",
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
              })}
            </div>
          </div>
        </nav>

        <main
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "1.5rem",
          }}
        >
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

// Updated Directory Section Component with loading and error handling
const DirectorySection = ({ teams, users, loading, error, onRetry }) => {
  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "200px",
          flexDirection: "column",
          gap: "1rem",
        }}
      >
        <Loader
          style={{
            width: "2rem",
            height: "2rem",
            animation: "spin 1s linear infinite",
          }}
        />
        <p style={{ color: "#64748b" }}>Loading directory data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "200px",
          flexDirection: "column",
          gap: "1rem",
        }}
      >
        <AlertCircle
          style={{ width: "2rem", height: "2rem", color: "#ef4444" }}
        />
        <p style={{ color: "#ef4444", textAlign: "center" }}>{error}</p>
        <button
          onClick={onRetry}
          style={{
            padding: "0.5rem 1rem",
            background: "#3b82f6",
            color: "white",
            border: "none",
            borderRadius: "0.5rem",
            cursor: "pointer",
          }}
        >
          Retry
        </button>
      </div>
    );
  }

  if (!teams || teams.length === 0) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "200px",
          flexDirection: "column",
          gap: "1rem",
        }}
      >
        <Building2
          style={{ width: "2rem", height: "2rem", color: "#64748b" }}
        />
        <p style={{ color: "#64748b" }}>No companies found in the directory.</p>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <h2
          style={{
            display: "flex",
            alignItems: "center",
            fontSize: "1.5rem",
            fontWeight: "bold",
            color: "#1e293b",
          }}
        >
          <Building2
            style={{
              width: "1.75rem",
              height: "1.75rem",
              marginRight: "0.75rem",
              color: "#3b82f6",
            }}
          />
          Directory Management
        </h2>
      </div>

      <div style={{ marginTop: "1.5rem" }}>
        {teams.map((team) => {
          const companyUsers = users.filter((user) => user.team_id === team.id);

          return (
            <div
              key={team.id}
              style={{
                background: "#f8fafc",
                borderRadius: "8px",
                padding: "1rem",
                marginBottom: "1.5rem",
                boxShadow: "0 2px 4px rgba(0, 0, 0, 0.05)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "1rem",
                  paddingBottom: "0.5rem",
                  borderBottom: "1px solid #e2e8f0",
                }}
              >
                <h4 style={{ color: "#1e40af", margin: 0 }}>
                  {team.team_name}
                </h4>
                <div
                  style={{
                    display: "flex",
                    gap: "1rem",
                    fontSize: "0.9rem",
                    color: "#64748b",
                  }}
                >
                  <span>Email: {team.team_email}</span>
                  <span>Phone: {team.team_phone}</span>
                </div>
              </div>

              {companyUsers.length > 0 ? (
                <div style={{ width: "100%" }}>
                  <div
                    style={{
                      display: "flex",
                      padding: "0.75rem 0",
                      borderBottom: "1px solid #e2e8f0",
                      fontWeight: 600,
                      backgroundColor: "#f1f5f9",
                      borderRadius: "4px",
                    }}
                  >
                    <div style={{ flex: 1, padding: "0 0.5rem" }}>Name</div>
                    <div style={{ flex: 1, padding: "0 0.5rem" }}>Email</div>
                    <div style={{ flex: 1, padding: "0 0.5rem" }}>
                      Mobile Number
                    </div>
                    <div style={{ flex: 1, padding: "0 0.5rem" }}>
                      Alternate Number
                    </div>
                    <div style={{ flex: 1, padding: "0 0.5rem" }}>
                      Designation
                    </div>
                  </div>

                  {companyUsers.map((user) => (
                    <div
                      key={user.id}
                      style={{
                        display: "flex",
                        padding: "0.75rem 0",
                        borderBottom: "1px solid #e2e8f0",
                      }}
                    >
                      <div style={{ flex: 1, padding: "0 0.5rem" }}>
                        {user.username}
                      </div>
                      <div style={{ flex: 1, padding: "0 0.5rem" }}>
                        {user.email}
                      </div>
                      <div style={{ flex: 1, padding: "0 0.5rem" }}>
                        {user.mobile_num}
                      </div>
                      <div style={{ flex: 1, padding: "0 0.5rem" }}>
                        {user.mobile_num_2 || "-"}
                      </div>
                      <div style={{ flex: 1, padding: "0 0.5rem" }}>
                        {user.designation}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div
                  style={{
                    padding: "1rem",
                    textAlign: "center",
                    color: "#64748b",
                    fontStyle: "italic",
                  }}
                >
                  No employees found for this company.
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Directory Action Components (unchanged)
const CreateCompanySection = () => (
  <div style={{ padding: "2rem", textAlign: "center" }}>
    <h2 style={{ color: "#1e293b", marginBottom: "1rem" }}>Create Company</h2>
    <p style={{ color: "#64748b" }}>
      This section will contain a form to create new companies. Form fields will
      include company name, email, phone, address, etc.
    </p>
  </div>
);

const EditCompanySection = () => (
  <div style={{ padding: "2rem", textAlign: "center" }}>
    <h2 style={{ color: "#1e293b", marginBottom: "1rem" }}>Edit Company</h2>
    <p style={{ color: "#64748b" }}>
      This section will show a list of companies to select and edit, with
      pre-filled forms for editing company details.
    </p>
  </div>
);

const DeleteCompanySection = () => (
  <div style={{ padding: "2rem", textAlign: "center" }}>
    <h2 style={{ color: "#1e293b", marginBottom: "1rem" }}>Delete Company</h2>
    <p style={{ color: "#64748b" }}>
      This section will show companies list with delete confirmation dialogs and
      warnings about data loss.
    </p>
  </div>
);

// Messages Action Components (unchanged)
const ViewMessagesSection = () => (
  <div style={{ padding: "2rem", textAlign: "center" }}>
    <h2 style={{ color: "#1e293b", marginBottom: "1rem" }}>View Messages</h2>
    <p style={{ color: "#64748b" }}>
      This section will display all messages in a table/list format with filters
      and search functionality.
    </p>
  </div>
);

const CreateMessageSection = () => (
  <div style={{ padding: "2rem", textAlign: "center" }}>
    <h2 style={{ color: "#1e293b", marginBottom: "1rem" }}>Create Message</h2>
    <p style={{ color: "#64748b" }}>
      This section will contain a form to compose and send new messages with
      recipient selection.
    </p>
  </div>
);

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
      This section will show messages with bulk delete options and confirmation
      dialogs.
    </p>
  </div>
);

// Other Action Components (unchanged)
const ViewRemindersSection = () => (
  <div style={{ padding: "2rem", textAlign: "center" }}>
    <h2 style={{ color: "#1e293b", marginBottom: "1rem" }}>View Reminders</h2>
    <p style={{ color: "#64748b" }}>
      This section will display all reminders with calendar view and
      notification settings.
    </p>
  </div>
);

const AddDidSection = () => (
  <div style={{ padding: "2rem", textAlign: "center" }}>
    <h2 style={{ color: "#1e293b", marginBottom: "1rem" }}>Add DID</h2>
    <p style={{ color: "#64748b" }}>
      This section will contain form to add new DID numbers with carrier
      selection and routing options.
    </p>
  </div>
);

const ChangeDidSection = () => (
  <div style={{ padding: "2rem", textAlign: "center" }}>
    <h2 style={{ color: "#1e293b", marginBottom: "1rem" }}>Change DID</h2>
    <p style={{ color: "#64748b" }}>
      This section will allow modification of existing DID numbers and their
      routing configurations.
    </p>
  </div>
);

const RemoveDidSection = () => (
  <div style={{ padding: "2rem", textAlign: "center" }}>
    <h2 style={{ color: "#1e293b", marginBottom: "1rem" }}>Remove DID</h2>
    <p style={{ color: "#64748b" }}>
      This section will show DID numbers list with removal options and
      confirmation dialogs.
    </p>
  </div>
);

const ViewBillSection = () => (
  <div style={{ padding: "2rem", textAlign: "center" }}>
    <h2 style={{ color: "#1e293b", marginBottom: "1rem" }}>View Bill</h2>
    <p style={{ color: "#64748b" }}>
      This section will display billing history, invoices, and payment details
      in a structured format.
    </p>
  </div>
);

const GenerateBillSection = () => (
  <div style={{ padding: "2rem", textAlign: "center" }}>
    <h2 style={{ color: "#1e293b", marginBottom: "1rem" }}>Generate Bill</h2>
    <p style={{ color: "#64748b" }}>
      This section will have tools to create new bills with itemized charges and
      customizable templates.
    </p>
  </div>
);

const DispatchBillSection = () => (
  <div style={{ padding: "2rem", textAlign: "center" }}>
    <h2 style={{ color: "#1e293b", marginBottom: "1rem" }}>Dispatch Bill</h2>
    <p style={{ color: "#64748b" }}>
      This section will manage bill delivery via email/SMS with tracking and
      delivery confirmation.
    </p>
  </div>
);

const ApproveVisitorSection = () => (
  <div style={{ padding: "2rem", textAlign: "center" }}>
    <h2 style={{ color: "#1e293b", marginBottom: "1rem" }}>Approve Visitor</h2>
    <p style={{ color: "#64748b" }}>
      This section will show pending visitor requests with approval/rejection
      options and access controls.
    </p>
  </div>
);

const MessageMemberSection = () => (
  <div style={{ padding: "2rem", textAlign: "center" }}>
    <h2 style={{ color: "#1e293b", marginBottom: "1rem" }}>Message Member</h2>
    <p style={{ color: "#64748b" }}>
      This section will provide messaging interface to communicate with building
      members about visitors.
    </p>
  </div>
);

const ViewVisitorsSection = () => (
  <div style={{ padding: "2rem", textAlign: "center" }}>
    <h2 style={{ color: "#1e293b", marginBottom: "1rem" }}>
      View All Visitors
    </h2>
    <p style={{ color: "#64748b" }}>
      This section will display comprehensive visitor logs with search, filter,
      and export functionality.
    </p>
  </div>
);

const EmailSettingsSection = () => (
  <div style={{ padding: "2rem", textAlign: "center" }}>
    <h2 style={{ color: "#1e293b", marginBottom: "1rem" }}>Email Settings</h2>
    <p style={{ color: "#64748b" }}>
      This section will contain SMTP configuration, email templates, and
      notification preferences.
    </p>
  </div>
);

const WhatsappSettingsSection = () => (
  <div style={{ padding: "2rem", textAlign: "center" }}>
    <h2 style={{ color: "#1e293b", marginBottom: "1rem" }}>
      WhatsApp Settings
    </h2>
    <p style={{ color: "#64748b" }}>
      This section will manage WhatsApp API integration, message templates, and
      delivery settings.
    </p>
  </div>
);

const VoicemailSettingsSection = () => (
  <div style={{ padding: "2rem", textAlign: "center" }}>
    <h2 style={{ color: "#1e293b", marginBottom: "1rem" }}>
      Voicemail Settings
    </h2>
    <p style={{ color: "#64748b" }}>
      This section will configure voicemail greetings, forwarding rules, and
      notification preferences.
    </p>
  </div>
);

export default Dashboard;
