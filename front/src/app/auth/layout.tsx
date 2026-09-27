import React from "react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen w-full m-0 p-0 overflow-x-hidden bg-app text-main transition-colors duration-200">
      {children}
    </div>
  );
}