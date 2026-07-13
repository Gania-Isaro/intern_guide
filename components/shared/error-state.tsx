export function ErrorState({ message = "Something went wrong." }: { message?: string }) {
  return <p className="text-center py-10 text-red-500">{message}</p>;
}