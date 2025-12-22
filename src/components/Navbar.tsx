"use client";

import { useRef } from "react";

interface NavbarProps {
  title: string;
  onFileSelect: (file: File) => void;
}

export default function Navbar({ title, onFileSelect }: NavbarProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileSelect(file);
    }
    e.target.value = "";
  };

  return (
    <nav className="flex items-center justify-between px-4 py-3 bg-gray-800 border-b border-gray-700">
      <h1 className="text-lg font-semibold text-white">{title}</h1>
      <input
        ref={fileInputRef}
        type="file"
        accept=".jpg,.jpeg,.webp,image/jpeg,image/webp"
        onChange={handleFileChange}
        className="hidden"
      />
      <button
        onClick={handleButtonClick}
        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
      >
        Select File
      </button>
    </nav>
  );
}
