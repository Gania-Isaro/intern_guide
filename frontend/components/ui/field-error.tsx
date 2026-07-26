// A form field's validation message. role="alert" means a screen reader
// announces it the moment it appears, and the shared id lets the input point
// at it via aria-describedby so the two are programmatically linked.
export function FieldError({ id, children }: { id: string; children?: React.ReactNode }) {
  if (!children) return null;
  return (
    <p id={id} role="alert" className="mt-1 text-xs text-danger">
      {children}
    </p>
  );
}
