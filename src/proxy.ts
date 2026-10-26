import type { NextRequest } from "next/server";

import { updateSession } from "@/lib/supabase/proxy";

export async function proxy(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  // Toutes les routes sauf les fichiers statiques, les images et les ressources 3D.
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|3d/|images/|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|hdr|glb|gltf)$).*)",
  ],
};
