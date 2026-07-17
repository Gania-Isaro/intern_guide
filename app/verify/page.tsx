"use client";

// Proof of placement upload (D5).
//
// An unverified student picks the company they interned at, attaches their
// certificate or offer letter (pdf/png/jpg, max 5 MB) and sends it. An
// admin checks it later; once approved, the student can write reviews.

import * as React from "react";
import Link from "next/link";
import { FileUp } from "lucide-react";

import { apiGet, apiUpload } from "@/lib/api";
import { useAuth } from "@/components/providers/auth-provider";
import { Button } from "@/components/ui/button";
import { LoadingState } from "@/components/ui/states";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // must match the backend's limit
const ALLOWED_TYPES = [".pdf", ".png", ".jpg", ".jpeg"];

interface CompanyOption {
  id: number;
  name: string;
}
