import { HiOutlineExclamationCircle } from "react-icons/hi";

interface FieldErrorProps {
  message?: string;
}

export default function FieldError({ message }: FieldErrorProps) {
  if (!message) return null;

  return (
    <p className="mt-1 flex items-center gap-1 text-xs text-status-error">
      <HiOutlineExclamationCircle size={14} />
      {message}
    </p>
  );
}
