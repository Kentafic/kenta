import React from "react";

type AppleContainerVariant = "content" | "wide";

type Props = {
  children: React.ReactNode;
  className?: string;
  /** tuỳ chọn: khi cần “nới” hoặc “siết” theo từng page */
  variant?: AppleContainerVariant;
};

export default function AppleContainer({
  children,
  className,
  variant = "content",
}: Props) {
  const base = "apple-container";
  const variantClass =
    variant === "wide" ? "apple-container--wide" : "apple-container--content";

  const classes = [base, variantClass, className].filter(Boolean).join(" ");

  return <div className={classes}>{children}</div>;
}