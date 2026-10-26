import { CircleAlert, CircleCheck } from "lucide-react";

type FormMessageProps = {
  type: "erreur" | "succes";
  children: React.ReactNode;
};

/** Message global d'un formulaire (erreur serveur, confirmation). */
export function FormMessage({ type, children }: FormMessageProps) {
  const Icon = type === "erreur" ? CircleAlert : CircleCheck;
  return (
    <div
      role={type === "erreur" ? "alert" : "status"}
      className={`flex gap-3 rounded-xl border px-4 py-3 text-sm ${
        type === "erreur"
          ? "border-error/40 bg-error/10 text-error"
          : "border-primary/40 bg-primary-soft text-text"
      }`}
    >
      <Icon aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
      <div>{children}</div>
    </div>
  );
}
