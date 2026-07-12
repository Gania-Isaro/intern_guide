import { StarRating } from "@/components/ui/star-rating";

export function CompanyCard({ company }: { company: any }) {
  return (
    <div className="border rounded-lg p-4">
      <h3 className="font-semibold">{company.name}</h3>
      <p className="text-sm text-gray-500">{company.industry} · {company.location}</p>
      {company.average_rating != null ? (
        <StarRating value={company.average_rating} readOnly />
      ) : (
        <p className="text-xs text-gray-400">Not yet rated</p>
      )}
    </div>
  );
}
