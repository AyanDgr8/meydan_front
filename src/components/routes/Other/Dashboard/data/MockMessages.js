// src/data/mockMessages.js
export const mockMessages = [
  {
    id: 1,
    subject: "New Customer Query - John Doe",
    sender: "crm@akashbusiness.com",
    recipient: "sales@akashbusiness.com",
    date: "2023-05-15T10:30:00Z",
    status: "read",
    content: {
      customer_name: "John Doe",
      phone_no_primary: "+1 555-123-4567",
      email_id: "john.doe@example.com",
      address: "123 Main St, New York, NY",
      country: "USA",
      designation: "CEO",
      comment: "Interested in your premium services package",
      disposition: "New Lead"
    }
  },
  {
    id: 2,
    subject: "New Customer Query - Jane Smith",
    sender: "crm@akashbusiness.com",
    recipient: "support@akashbusiness.com",
    date: "2023-05-14T14:45:00Z",
    status: "unread",
    content: {
      customer_name: "Jane Smith",
      phone_no_primary: "+1 555-987-6543",
      email_id: "jane.smith@example.com",
      address: "456 Oak Ave, Los Angeles, CA",
      country: "USA",
      designation: "Marketing Director",
      comment: "Need information about your CRM integration",
      disposition: "Information Request"
    }
  },
  {
    id: 3,
    subject: "New Customer Query - Acme Corp",
    sender: "crm@akashbusiness.com",
    recipient: "enterprise@akashbusiness.com",
    date: "2023-05-13T09:15:00Z",
    status: "read",
    content: {
      customer_name: "Robert Johnson (Acme Corp)",
      phone_no_primary: "+1 555-456-7890",
      email_id: "r.johnson@acmecorp.com",
      address: "789 Enterprise Blvd, Chicago, IL",
      country: "USA",
      designation: "IT Manager",
      comment: "Enterprise solution inquiry for 500+ users",
      disposition: "Enterprise Inquiry"
    }
  }
];