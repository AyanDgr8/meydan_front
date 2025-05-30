import {
  AlertCircle,
  Building2,
  Calendar,
  Edit2,
  Loader,
  Mail,
  MapPin,
  Phone,
  Trash2,
  User,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const ViewDirectory = ({ businesses, error, loading, onEdit, onDelete }) => {
  const navigate = useNavigate();

  const handleEdit = (businessItem) => {
    if (onEdit) {
      onEdit(businessItem);
    }
  };

  const handleDelete = (businessId) => {
    if (window.confirm("Are you sure you want to delete this business?")) {
      if (onDelete) {
        onDelete(businessId);
      }
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    try {
      return new Date(dateString).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch (error) {
      return "-";
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <Loader className="animate-spin" size={48} color="#3b82f6" />
        <span className="loading-text">Loading business data...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <AlertCircle size={48} color="#ef4444" />
        <p className="error-text">{error}</p>
      </div>
    );
  }

  if (!businesses || !Array.isArray(businesses) || businesses.length === 0) {
    return (
      <div className="no-data-container">
        <Building2 size={48} color="#64748b" />
        <p>No business data available</p>
      </div>
    );
  }

  return (
    <div className="directory-container">
      <div className="businesses-grid">
        {businesses.map((business) => (
          <div
            key={business.id}
            className="business-card"
            onClick={() =>
              navigate(`/dashboard-new/business/center/${business.id}`)
            }
          >
            <div className="business-header">
              <div className="business-title">
                <Building2 size={20} color="#1e40af" />
                <h3>{business.business_name || "Unnamed Business"}</h3>
              </div>
              <div className="business-actions">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEdit(business);
                  }}
                  className="action-btn edit-btn"
                  title="Edit Business"
                >
                  <Edit2 size={16} />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(business.id);
                  }}
                  className="action-btn delete-btn"
                  title="Delete Business"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>

            <div className="business-details">
              <div className="detail-row">
                <Phone size={16} />
                <span className="detail-label">Phone:</span>
                <span className="detail-value">
                  {business.business_phone || "-"}
                </span>
              </div>

              <div className="detail-row">
                <Mail size={16} />
                <span className="detail-label">Email:</span>
                <span className="detail-value">
                  {business.business_email || "-"}
                </span>
              </div>

              {business.business_whatsapp && (
                <div className="detail-row">
                  <Phone size={16} />
                  <span className="detail-label">WhatsApp:</span>
                  <span className="detail-value">
                    {business.business_whatsapp}
                  </span>
                </div>
              )}

              <div className="detail-row">
                <MapPin size={16} />
                <span className="detail-label">Address:</span>
                <span className="detail-value">
                  {business.business_address || "-"}
                </span>
              </div>

              <div className="detail-row">
                <MapPin size={16} />
                <span className="detail-label">Country:</span>
                <span className="detail-value">
                  {business.business_country || "-"}
                </span>
              </div>

              {business.business_reg_no && (
                <div className="detail-row">
                  <Building2 size={16} />
                  <span className="detail-label">Reg No:</span>
                  <span className="detail-value">
                    {business.business_reg_no}
                  </span>
                </div>
              )}

              {business.business_tax_id && (
                <div className="detail-row">
                  <Building2 size={16} />
                  <span className="detail-label">Tax ID:</span>
                  <span className="detail-value">
                    {business.business_tax_id}
                  </span>
                </div>
              )}

              <div className="detail-row">
                <Calendar size={16} />
                <span className="detail-label">Created:</span>
                <span className="detail-value">
                  {formatDate(business.created_at)}
                </span>
              </div>

              <div className="detail-row">
                <span className="status-badge" data-active={business.is_active}>
                  {business.is_active ? "Active" : "Inactive"}
                </span>
              </div>

              {business.other_detail && (
                <div className="detail-row full-width">
                  <span className="detail-label">Notes:</span>
                  <span className="detail-value">{business.other_detail}</span>
                </div>
              )}
            </div>

            {business.users &&
              Array.isArray(business.users) &&
              business.users.length > 0 && (
                <div className="employees-section">
                  <h4 className="employees-title">
                    <User size={16} />
                    Employees ({business.users.length})
                  </h4>
                  <div className="employees-list">
                    {business.users.map((user, index) => (
                      <div key={user.id || index} className="employee-item">
                        <span className="employee-name">
                          {user.username || user.name || "Unknown"}
                        </span>
                        <span className="employee-role">
                          {user.designation || "Employee"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
          </div>
        ))}
      </div>

      <style jsx>{`
        .directory-container {
          padding: 1rem;
        }

        .loading-container,
        .error-container,
        .no-data-container {
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          min-height: 200px;
          gap: 1rem;
        }

        .loading-text {
          color: #64748b;
          font-size: 1rem;
        }

        .error-text {
          color: #ef4444;
          text-align: center;
          margin: 0;
        }

        .no-data-container p {
          color: #64748b;
          font-style: italic;
          margin: 0;
        }

        .businesses-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
          gap: 1.5rem;
          margin-top: 1rem;
        }

        .business-card {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 1.5rem;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
          transition: all 0.2s ease;
        }

        .business-card:hover {
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
          transform: translateY(-2px);
        }

        .business-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 1.5rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid #e2e8f0;
        }

        .business-title {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          flex: 1;
        }

        .business-title h3 {
          margin: 0;
          color: #1e40af;
          font-size: 1.25rem;
          font-weight: 600;
        }

        .business-actions {
          display: flex;
          gap: 0.5rem;
        }

        .action-btn {
          padding: 0.5rem;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .edit-btn {
          background-color: #3b82f6;
          color: white;
        }

        .edit-btn:hover {
          background-color: #2563eb;
        }

        .delete-btn {
          background-color: #ef4444;
          color: white;
        }

        .delete-btn:hover {
          background-color: #dc2626;
        }

        .business-details {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .detail-row {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.9rem;
        }

        .detail-row.full-width {
          flex-direction: column;
          align-items: flex-start;
        }

        .detail-row svg {
          color: #64748b;
          flex-shrink: 0;
        }

        .detail-label {
          font-weight: 500;
          color: #374151;
          min-width: 80px;
        }

        .detail-value {
          color: #64748b;
          flex: 1;
          word-break: break-word;
        }

        .status-badge {
          padding: 0.25rem 0.75rem;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.025em;
        }

        .status-badge[data-active="1"] {
          background-color: #dcfce7;
          color: #166534;
        }

        .status-badge[data-active="0"] {
          background-color: #fef2f2;
          color: #991b1b;
        }

        .employees-section {
          margin-top: 1.5rem;
          padding-top: 1rem;
          border-top: 1px solid #e2e8f0;
        }

        .employees-title {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin: 0 0 0.75rem 0;
          color: #374151;
          font-size: 1rem;
          font-weight: 500;
        }

        .employees-list {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .employee-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.5rem;
          background-color: #f8fafc;
          border-radius: 6px;
          font-size: 0.85rem;
        }

        .employee-name {
          font-weight: 500;
          color: #374151;
        }

        .employee-role {
          color: #64748b;
          font-size: 0.75rem;
        }

        @media (max-width: 768px) {
          .businesses-grid {
            grid-template-columns: 1fr;
          }

          .business-header {
            flex-direction: column;
            gap: 1rem;
          }

          .business-actions {
            align-self: flex-end;
          }
        }
      `}</style>
    </div>
  );
};

export default ViewDirectory;
