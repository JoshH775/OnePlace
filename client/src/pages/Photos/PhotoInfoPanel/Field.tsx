import Input from "@frontend/components/ui/Input";
import moment from "moment";
import { useState } from "react";

type FieldProps = {
  label: string;
  icon: React.ReactNode;
  value: string;
  edit: boolean;
  type?: "text" | "location" | "date";
  onClick?: () => void;
};

const Field = ({
    label,
    icon,
    value,
    edit,
    onClick,
    type = "text",
  }: FieldProps) => {
    const [input, setInput] = useState(value);
  
    if (!edit && type === "date") {
      value = moment(value).format("LLL");
    }
  
    return (
      <div
        className={`flex w-full gap-3 items-center mb-2 ${
          onClick ? "cursor-pointer" : ""
        }`}
        onClick={!edit ? onClick : undefined}
      >
        {icon}
        <div className="flex flex-col w-full">
          <p className="text-black font-semibold text-base">{label}</p>
  
          {!edit && <p className="text-subtitle-light text-sm">{value}</p>}
  
          {edit && (
            <Input
              id={label}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="!bg-white py-1 !m-0 field-input"
              type={type === "date" ? "datetime-local" : undefined}
            />
          )}
  
          {edit && type === "location" && (
            <p className="text-sm text-subtitle-light">
              🛈 Format: Latitude/Longitude (e.g., 35.6895/139.6917)
            </p>
          )}
        </div>
      </div>
    );
  };

  export default Field;