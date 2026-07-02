"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiPost } from "@/lib/api";
import { validateRegisterForm } from "@/lib/validation";

function inputClass(hasError: boolean) {
  const base = "w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2";
  return hasError
    ? `${base} border-red-500 focus:ring-red-200`
    : `${base} border-gray-300 focus:ring-blue-200`;
}
