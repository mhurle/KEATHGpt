import React from "react";

// LogoIcon component that can be exported and used in MessageItem
export const LogoIcon: React.FC = () => {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M12 2L2 7L12 12L22 7L12 2Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M2 17L12 22L22 17"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M2 12L12 17L22 12"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

// Main Logo component
export const Logo: React.FC = () => {
  return (
    <div>
      <LogoIcon />
      <span>KEATH GPT</span>
    </div>
  );
};

export function LogoText(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="160"
      height="40"
      viewBox="0 0 160 40"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <text
        x="0"
        y="30"
        fontFamily="Arial, sans-serif"
        fontSize="30"
        fill="orange"
        fontWeight="bold"
      >
        KEATHGPT
      </text>
    </svg>
  );
}