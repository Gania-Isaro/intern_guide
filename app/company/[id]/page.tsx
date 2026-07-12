"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { apiFetch } from "@/lib/utils";
import { StarRating } from "@/components/ui/star-rating";

export default function CompanyProfilePage() {
    const { id } = useParams();
    const [company, setCompany] = useState<any>(null);
    useEffect(() => {
        apiFetch(`/companies/${id}`).then(setCompany);
    }, [id]);

    if (!company) return <p className="text-center py-10">Loading...</p>;
    return (
        <div className="max-w-3xl mx-auto px-4 py-10">
            <h1 className="text-2xl font-bold mb-4">{company.name}</h1>
            <p className="text-gray-500 mb-4">{company.industry}. {company.location}</p>
            {company.average_rating != null? (
                <StarRating value={company.average_rating}  readOnly />
            ):(
                <p className="text-sm text-gray-500">No ratings yet</p>
            )}
            <p className="mt-4">{company.description}</p>
        </div>
    );
}
            

