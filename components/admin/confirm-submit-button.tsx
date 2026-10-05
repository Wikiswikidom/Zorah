"use client";

import { useFormStatus } from "react-dom";
import type { ReactNode, MouseEvent } from "react";

type ConfirmSubmitButtonProps = {
  children: ReactNode;
  confirmMessage: string;
  pendingLabel?: string;
  className?: string;
  disabled?: boolean;
};

function PendingContents({ children, pendingLabel }: { children: ReactNode; pendingLabel: string }) {
  const { pending } = useFormStatus();

  return (
    <>
      {pending ? (
        <span
          aria-hidden="true"
          className="zorah-action-spinner"
        />
      ) : null}
      <span>{pending ? pendingLabel : children}</span>
    </>
  );
}

/**
 * Submit button for consequential admin actions.
 * Confirmation happens before the form submits; pending state prevents repeat clicks
 * while the server action is running.
 */
export function ConfirmSubmitButton({
  children,
  confirmMessage,
  pendingLabel = "Working…",
  className,
  disabled = false,
}: ConfirmSubmitButtonProps) {
  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    if (!window.confirm(confirmMessage)) {
      event.preventDefault();
    }
  };

  return (
    <button
      type="submit"
      onClick={handleClick}
      disabled={disabled}
      className={className}
      aria-live="polite"
    >
      <PendingContents pendingLabel={pendingLabel}>{children}</PendingContents>
    </button>
  );
}
