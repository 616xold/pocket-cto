"use client";

import React from "react";
import { useFormStatus } from "react-dom";

type ActionSubmitButtonProps = {
  className: string;
  disabled?: boolean;
  label: string;
  name?: string;
  pendingLabel: string;
  value?: string;
};

export function ActionSubmitButton({
  className,
  disabled = false,
  label,
  name,
  pendingLabel,
  value,
}: ActionSubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <button
      className={className}
      disabled={disabled || pending}
      name={name}
      type="submit"
      value={value}
    >
      {pending ? pendingLabel : label}
    </button>
  );
}
