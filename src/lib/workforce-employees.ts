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