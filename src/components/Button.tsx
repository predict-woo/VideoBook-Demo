import React, { forwardRef } from "react";
import { Spacing } from "./Spacing";
import { Spinner } from "./Spinner";

const ButtonForward: React.ForwardRefRenderFunction<
  HTMLButtonElement,
  {
    onClick?: () => void;
    disabled?: boolean;
    children: React.ReactNode;
    loading?: boolean;
    secondary?: boolean;
  }
> = ({ onClick, disabled, children, loading }, ref) => {
  return (
    <button
      ref={ref}
      onClick={onClick}
      disabled={disabled}
    >
      {loading && (
        <>
          <Spinner size={20}></Spinner>
          <Spacing></Spacing>
        </>
      )}
      {children}
    </button>
  );
};

export const Button = forwardRef(ButtonForward);
