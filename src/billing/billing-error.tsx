interface BillingErrorProps {
  message: string;
}

export function BillingError({ message }: BillingErrorProps) {
  return message ? (
    <p role="alert" className="billing-error">
      {message}
    </p>
  ) : null;
}
