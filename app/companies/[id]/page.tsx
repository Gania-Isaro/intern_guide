"use client";

import * as React from "react";
import Link from "next/link";
import { ShieldCheck, MapPin, Globe, Briefcase, CalendarClock } from "lucide-react";

import { apiGet } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { StarRating } from "@/components/ui/star-rating";
import { LoadingState, ErrorState, EmptyState } from "@/components/ui/states";
import { type Company } from "@/components/company/company-card";

interface Internship {
  id: number;
  title: string;
  description: string | null;
  location: string | null;
  deadline: string | null;
  is_active: boolean;
}

interface Review {
  id: number;
  rating: number;
  mentorship: number;
  tasks: number;
  learning: number;
  environment: number;
  comment: string | null;
  created_at: string;
  reviewer_name: string;
  reviewer_verified: boolean;
  reply: { body: string; created_at: string } | null;
}

interface CompanyDetail extends Company {
  internships: Internship[];
  reviews: Review[];
}

