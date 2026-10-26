/** Traduit les erreurs d'authentification Supabase en messages compréhensibles. */
export function messageErreurAuth(erreur: { code?: string; message: string }): string {
  switch (erreur.code) {
    case "invalid_credentials":
      return "Email ou mot de passe incorrect.";
    case "email_not_confirmed":
      return "Confirmez d’abord votre adresse email grâce au lien reçu, puis reconnectez-vous.";
    case "user_already_exists":
    case "email_exists":
      return "Un compte existe déjà avec cette adresse email. Connectez-vous.";
    case "weak_password":
      return "Ce mot de passe est trop faible. Choisissez-en un plus long ou plus varié.";
    case "over_request_rate_limit":
    case "over_email_send_rate_limit":
      return "Trop de tentatives. Patientez quelques minutes avant de réessayer.";
    case "signup_disabled":
      return "Les inscriptions sont momentanément fermées.";
    default:
      return "Une erreur est survenue. Vérifiez votre connexion et réessayez.";
  }
}
