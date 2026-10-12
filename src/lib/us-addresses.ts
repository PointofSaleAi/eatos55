export type UsAddress = {
  street: string;
  unit: string;
  city: string;
  state: string;
  zipCode: string;
};

export const usAddressSuggestions: UsAddress[] = [
  { street: "1 Market St", unit: "", city: "San Francisco", state: "CA", zipCode: "94105" },
  { street: "11 Wall St", unit: "", city: "New York", state: "NY", zipCode: "10005" },
  { street: "100 N Tryon St", unit: "", city: "Charlotte", state: "NC", zipCode: "28202" },
  { street: "1600 Pennsylvania Ave NW", unit: "", city: "Washington", state: "DC", zipCode: "20500" },
  { street: "200 S Biscayne Blvd", unit: "", city: "Miami", state: "FL", zipCode: "33131" },
  { street: "233 S Wacker Dr", unit: "", city: "Chicago", state: "IL", zipCode: "60606" },
  { street: "301 Congress Ave", unit: "", city: "Austin", state: "TX", zipCode: "78701" },
  { street: "401 N Michigan Ave", unit: "", city: "Chicago", state: "IL", zipCode: "60611" },
  { street: "500 Boylston St", unit: "", city: "Boston", state: "MA", zipCode: "02116" },
  { street: "600 Congress Ave", unit: "", city: "Austin", state: "TX", zipCode: "78701" },
  { street: "701 5th Ave", unit: "", city: "Seattle", state: "WA", zipCode: "98104" },
  { street: "800 W Olympic Blvd", unit: "", city: "Los Angeles", state: "CA", zipCode: "90015" },
  { street: "1000 Peachtree St NE", unit: "", city: "Atlanta", state: "GA", zipCode: "30309" },
  { street: "1201 3rd Ave", unit: "", city: "Seattle", state: "WA", zipCode: "98101" },
  { street: "1700 Lincoln St", unit: "", city: "Denver", state: "CO", zipCode: "80203" },
  { street: "1801 California St", unit: "", city: "Denver", state: "CO", zipCode: "80202" },
  { street: "1900 Market St", unit: "", city: "Philadelphia", state: "PA", zipCode: "19103" },
  { street: "222 Berkeley St", unit: "", city: "Boston", state: "MA", zipCode: "02116" },
  { street: "350 5th Ave", unit: "", city: "New York", state: "NY", zipCode: "10118" },
  { street: "600 Montgomery St", unit: "", city: "San Francisco", state: "CA", zipCode: "94111" },
];

export const usStates = [
  "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "DC", "FL", "GA", "HI", "ID", "IL", "IN", "IA",
  "KS", "KY", "LA", "ME", "MD", "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ", "NM",
  "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC", "SD", "TN", "TX", "UT", "VT", "VA", "WA",
  "WV", "WI", "WY",
];

export function formatUsAddress(address: UsAddress) {
  const street = [address.street.trim(), address.unit.trim()].filter(Boolean).join(", ");
  const locality = [address.city.trim(), address.state.trim()].filter(Boolean).join(", ");
  return [street, [locality, address.zipCode.trim()].filter(Boolean).join(" ")].filter(Boolean).join(", ");
}