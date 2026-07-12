export function EmptyState({ message = "Nothing here yet." }: { message?: string }) {
  return <p className="text-center py-10 text-gray-500">{message}</p>;
}