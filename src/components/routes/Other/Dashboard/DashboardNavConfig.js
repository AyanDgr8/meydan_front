import {
  Bell,
  Building2,
  CreditCard,
  MessageSquare,
  Phone,
  Settings,
  UserCheck,
} from "lucide-react";

export const DASHBOARD_NAVIGATION_ITEMS = {
  directory: {
    name: "COMPANY",
    icon: Building2,
    roles: ["USER", "ADMIN", "RECEPTIONIST", "BRAND", "BUSINESS_CENTER"],
    actions: [
      {
        id: "view-company",
        name: "View Company",
        color: "blue",
        roles: ["USER", "ADMIN", "RECEPTIONIST", "BRAND", "BUSINESS_CENTER"],
      },
    ],
  },
  messages: {
    name: "MESSAGES",
    icon: MessageSquare,
    roles: ["USER", "ADMIN", "RECEPTIONIST"],
    actions: [
      {
        id: "view-messages",
        name: "View Messages",
        color: "blue",
        roles: ["USER", "ADMIN", "RECEPTIONIST"],
      },
      {
        id: "create-message",
        name: "Create Message",
        color: "green",
        roles: ["USER", "ADMIN"],
      },
      {
        id: "edit-messages",
        name: "Edit Messages",
        color: "yellow",
        roles: ["ADMIN"],
      },
      {
        id: "delete-messages",
        name: "Delete Messages",
        color: "red",
        roles: ["ADMIN"],
      },
    ],
  },
  reminders: {
    name: "REMINDERS",
    icon: Bell,
    roles: ["USER", "ADMIN", "RECEPTIONIST"],
    actions: [
      {
        id: "view-reminders",
        name: "View Reminders",
        color: "blue",
        roles: ["USER", "ADMIN", "RECEPTIONIST"],
      },
    ],
  },
  telecom: {
    name: "TELECOM",
    icon: Phone,
    roles: ["ADMIN", "BUSINESS_CENTER"],
    actions: [
      {
        id: "add-did",
        name: "Add DID",
        color: "blue",
        roles: ["ADMIN", "BUSINESS_CENTER"],
      },
      {
        id: "change-did",
        name: "Change DID",
        color: "yellow",
        roles: ["ADMIN"],
      },
      { id: "remove-did", name: "Remove DID", color: "red", roles: ["ADMIN"] },
    ],
  },
  billing: {
    name: "BILLING",
    icon: CreditCard,
    roles: ["ADMIN", "BUSINESS_CENTER"],
    actions: [
      {
        id: "view-bill",
        name: "View Bill",
        color: "blue",
        roles: ["USER", "ADMIN", "BUSINESS_CENTER"],
      },
      {
        id: "generate-bill",
        name: "Generate Bill",
        color: "green",
        roles: ["ADMIN", "BUSINESS_CENTER"],
      },
      {
        id: "dispatch-bill",
        name: "Dispatch Bill",
        color: "yellow",
        roles: ["ADMIN", "BUSINESS_CENTER"],
      },
    ],
  },
  visitor: {
    name: "VISITOR MANAGEMENT",
    icon: UserCheck,
    roles: ["ADMIN", "RECEPTIONIST"],
    actions: [
      {
        id: "approve-visitor",
        name: "Approve Visitor",
        color: "green",
        roles: ["ADMIN", "RECEPTIONIST"],
      },
      {
        id: "message-member",
        name: "Message Member",
        color: "blue",
        roles: ["ADMIN", "RECEPTIONIST"],
      },
      {
        id: "view-visitors",
        name: "View all Visitors",
        color: "blue",
        roles: ["USER", "ADMIN", "RECEPTIONIST"],
      },
    ],
  },
  settings: {
    name: "SETTINGS",
    icon: Settings,
    roles: ["ADMIN"],
    actions: [
      {
        id: "brand-management",
        name: "Brand Management",
        color: "blue",
        roles: ["ADMIN", "BRAND"],
      },
      {
        id: "business-management",
        name: "Business Center Management",
        color: "blue",
        roles: ["ADMIN", "BUSINESS_CENTER"],
      },
      {
        id: "receptionist-management",
        name: "Receptionist Management",
        color: "blue",
        roles: ["ADMIN"],
      },
      {
        id: "companies-users",
        name: "Companies and Users",
        color: "blue",
        roles: ["ADMIN"],
      },
    ],
  },
};

export const getFilteredNavigation = (userRole) => {
  // Convert userRole to lowercase for case-insensitive comparison
  const normalizedUserRole = userRole?.toLowerCase();

  return Object.entries(DASHBOARD_NAVIGATION_ITEMS)
    .filter(([_, item]) => {
      // Check if any of the item's roles (converted to lowercase) matches the user's role
      return item.roles.some(
        (role) => role.toLowerCase() === normalizedUserRole
      );
    })
    .map(([id, item]) => ({
      id,
      name: item.name,
      icon: item.icon,
      actions: item.actions.filter((action) =>
        action.roles.some((role) => role.toLowerCase() === normalizedUserRole)
      ),
    }));
};
