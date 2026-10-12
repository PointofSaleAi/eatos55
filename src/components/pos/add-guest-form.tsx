import { Camera, ChevronDown, UserPlus, X } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { formatPhone } from "@/components/pos/guest-sheet";
import { usePos } from "@/lib/pos-store";
import { vehicleColors, vehicleTypes } from "@/lib/demo-data";

const inputClass = "h-11 w-full min-w-0 rounded-row border border-border bg-muted px-3 text-fs-sm text-foreground outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring";

export function AddGuestForm({ onClose }: { onClose: () => void }) {
  const { guest, setGuest } = usePos();
  const nameParts = guest.name.trim().split(/\s+/);
  const [firstName, setFirstName] = useState(guest.firstName ?? nameParts[0] ?? "");
  const [middleName, setMiddleName] = useState(guest.middleName ?? "");
  const [lastName, setLastName] = useState(guest.lastName ?? nameParts.slice(1).join(" "));
  const [email, setEmail] = useState(guest.email ?? "");
  const [phone, setPhone] = useState(guest.phone);
  const [customerSince, setCustomerSince] = useState(guest.customerSince ?? "");
  const [dateOfBirth, setDateOfBirth] = useState(guest.dateOfBirth ?? "");
  const [anniversary, setAnniversary] = useState(guest.anniversary ?? "");
  const [address, setAddress] = useState(guest.address ?? "");
  const [photo, setPhoto] = useState(guest.photo ?? "");
  const [vehicleOpen, setVehicleOpen] = useState(Boolean(guest.vehicle));
  const [vehicleType, setVehicleType] = useState(guest.vehicle?.type ?? "");
  const [vehicleColor, setVehicleColor] = useState(guest.vehicle?.color ?? "");
  const [vehicleBrand, setVehicleBrand] = useState(guest.vehicle?.brand ?? "");
  const [plate, setPlate] = useState(guest.vehicle?.plate ?? "");
  const photoInput = useRef<HTMLInputElement>(null);
  const valid = Boolean(firstName.trim() && lastName.trim() && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) && phone.replace(/\D/g, "").length === 10);

  const field = (label: string, value: string, change: (value: string) => void, type = "text", required = false) => (
    <label className="block min-w-0 space-y-1.5">
      <span className="text-fs-xs font-bold text-foreground">{label}{required ? <span className="text-destructive"> *</span> : null}</span>
      <input type={type} value={value} onChange={(e) => change(e.target.value)} required={required} aria-label={label} className={inputClass} placeholder={type === "date" ? undefined : `Enter ${label.toLowerCase()}`} />
    </label>
  );

  return (
    <form aria-label="Add Guest" className="flex min-h-0 flex-1 flex-col overflow-hidden" onSubmit={(event) => {
      event.preventDefault();
      if (!valid) return;
      setGuest({ firstName: firstName.trim(), middleName: middleName.trim(), lastName: lastName.trim(), name: [firstName, middleName, lastName].map((part) => part.trim()).filter(Boolean).join(" "), email: email.trim(), phone, customerSince, dateOfBirth, anniversary, address: address.trim(), photo, vehicle: vehicleOpen && (vehicleType || vehicleColor || vehicleBrand || plate) ? { type: vehicleType, color: vehicleColor, brand: vehicleBrand.trim(), plate: plate.trim() } : undefined });
      toast.success("Guest details saved");
      onClose();
    }}>
      <div className="flex shrink-0 items-center justify-between border-b border-border px-4 py-3">
        <h2 className="flex items-center gap-2 text-fs-base font-extrabold"><UserPlus className="size-5" />Add Guest</h2>
        <Button type="button" variant="secondary" size="icon" aria-label="Close Add Guest" title="Close Add Guest" onClick={onClose}><X /></Button>
      </div>
      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-4 py-4">
        <div className="flex flex-col items-center gap-2">
          <Button type="button" variant="outline" aria-label="Upload profile photo" title="Upload profile photo" onClick={() => photoInput.current?.click()} className="size-16 overflow-hidden rounded-pill border-dashed p-0 hover:bg-muted hover:text-foreground">
            {photo ? <img src={photo} alt="Guest profile" className="h-full w-full object-cover" /> : <Camera className="size-6" />}
          </Button>
          <span className="text-fs-xs text-muted-foreground">Profile Photo</span>
          <input ref={photoInput} type="file" accept="image/*" className="hidden" aria-label="Profile photo" onChange={(event) => {
            const file = event.target.files?.[0];
            if (!file) return;
            if (!file.type.startsWith("image/") || file.size > 2 * 1024 * 1024) { toast.error("Choose an image smaller than 2 MB"); return; }
            const reader = new FileReader();
            reader.onload = () => { if (typeof reader.result === "string") setPhoto(reader.result); };
            reader.readAsDataURL(file);
          }} />
          {photo ? <Button type="button" variant="link" onClick={() => setPhoto("")} className="h-6 text-fs-xs">Remove photo</Button> : null}
        </div>
        <div className="grid grid-cols-2 gap-x-3 gap-y-3">
          {field("First Name", firstName, setFirstName, "text", true)}
          {field("Middle Name", middleName, setMiddleName)}
          {field("Last Name", lastName, setLastName, "text", true)}
          {field("Email", email, setEmail, "email", true)}
          {field("Phone Number", phone, (value) => setPhone(formatPhone(value)), "tel", true)}
          {field("Customer Since", customerSince, setCustomerSince, "date")}
          {field("Date of Birth", dateOfBirth, setDateOfBirth, "date")}
          {field("Anniversary", anniversary, setAnniversary, "date")}
        </div>
        {field("Address", address, setAddress)}
        <Button type="button" variant="ghost" aria-expanded={vehicleOpen} onClick={() => setVehicleOpen((open) => !open)} className="h-auto w-full justify-start px-0 text-fs-xs font-bold hover:bg-muted hover:text-foreground">Add vehicle details<ChevronDown className={vehicleOpen ? "rotate-180" : ""} /></Button>
        {vehicleOpen ? <div className="grid grid-cols-2 gap-3">
          <label className="min-w-0 space-y-1.5"><span className="text-fs-xs font-bold">Vehicle Type</span><select aria-label="Vehicle Type" value={vehicleType} onChange={(e) => setVehicleType(e.target.value)} className={inputClass}><option value="">Select type</option>{vehicleTypes.map((type) => <option key={type}>{type}</option>)}</select></label>
          <label className="min-w-0 space-y-1.5"><span className="text-fs-xs font-bold">Color</span><select aria-label="Vehicle Color" value={vehicleColor} onChange={(e) => setVehicleColor(e.target.value)} className={inputClass}><option value="">Select color</option>{vehicleColors.map((color) => <option key={color.name}>{color.name}</option>)}</select></label>
          {field("Brand", vehicleBrand, setVehicleBrand)}{field("License Plate", plate, setPlate)}
        </div> : null}
      </div>
      <div className="grid shrink-0 grid-cols-2 gap-3 border-t border-border px-4 py-3 pb-[calc(0.75rem+var(--tabs-h,0px))]">
        <Button type="button" variant="outline" onClick={onClose} className="min-h-11 rounded-row hover:bg-muted hover:text-foreground">Cancel</Button>
        <Button type="submit" disabled={!valid} className="min-h-11 rounded-row font-bold">Save Guest</Button>
      </div>
    </form>
  );
}