import { isValidPhoneFor, phoneCountryByName, phoneErrorFor } from "@/lib/phone";

export type WorkforceEmployee = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  country: string;
  employeeId: string;
  role: string;
  revenueCentre: string;
  dashboardAccess: boolean;
  pinConfigured: boolean;
  payroll: boolean;
  jobType: string;
  archived: boolean;
  addedOn: string;
};

export const employeeRoles = ["Manager", "Server", "Bartender", "Line cook", "Host", "Dishwasher", "Barista"];
export const newWorkforceEmployee = (): WorkforceEmployee => ({
  id: "", firstName: "", lastName: "", email: "", phone: "", country: "United Kingdom",
  employeeId: "", role: "", revenueCentre: "", dashboardAccess: false, pinConfigured: false,
  payroll: false, jobType: "", archived: false, addedOn: "",
});

/** Issues that stop a record from being saved automatically. */
export const employeeErrorFor = (employee: WorkforceEmployee, others: WorkforceEmployee[], isNew = false): string => {
  if (!employee.firstName.trim() || !employee.lastName.trim()) return "Enter first name and last name.";
  if (isNew && (!employee.role || !employee.jobType)) return "Select job role and job type.";
  const employeeId = employee.employeeId.trim();
  if (employeeId && others.some(other => other.id !== employee.id && other.employeeId.trim() === employeeId)) return "Employee ID is already in use.";
  return "";
};

/** Format warnings that are shown while the value is still saved. */
export const employeeNoticeFor = (employee: WorkforceEmployee): string => {
  const email = employee.email.trim();
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "Enter a valid email address.";
  if (employee.phone && !isValidPhoneFor(phoneCountryByName(employee.country), employee.phone)) return phoneErrorFor(phoneCountryByName(employee.country));
  return "";
};

export const referenceEmployees: WorkforceEmployee[] = [
  ["Abhishek", "Test", "Manager", "", ""],
  ["Andrew", "Canfield", "Manager", "andrew.canfield@lcros.uk", "7971980606"],
  ["Andrew", "Canfield Test", "Manager", "canfieldandrew@hotmail.com", "7775508118"],
  ["Arthur", "Curry", "Dishwasher", "", ""],
  ["Barry", "Allen", "Barista", "support@lcrsystems.co.uk", ""],
  ["Becky", "lawson", "Manager", "BECKY.LAWSON@LCROS.UK", "7541346723"],
  ["Bruce", "Wayne", "Manager", "", ""],
  ["Charles", "Bronson", "Manager", "", ""],
].map(([firstName, lastName, role, email, phone], index) => ({
  ...newWorkforceEmployee(), id: `workforce-${index}`, firstName: firstName ?? "", lastName: lastName ?? "",
  role: role ?? "", email: email ?? "", phone: phone ?? "",
}));
