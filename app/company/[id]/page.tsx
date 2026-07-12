"use client";

import * as React from "react";
import Link from "next/link";
import { ShieldCheck, MapPin, Globe, Briefcase, CalendarClock } from "lucide-react";

import { apiGet } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { StarRating } from "@/components/ui/star-rating";
import { LoadingState, ErrorState, EmptyState } from "@/components/ui/states";
import { type Company } from "@/components/company/company-card";