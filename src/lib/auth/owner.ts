export type OwnerLike = {
  uid?: string | null;
  email?: string | null;
  admin?: boolean;
} | null | undefined;

function normalized(value: string | null | undefined): string | null {
  const trimmed = value?.trim();
  return trimmed && trimmed.length > 0 ? trimmed : null;
}

function configuredOwnerEmail(): string | null {
  const email = normalized(process.env.NEXT_PUBLIC_ADMIN_OWNER_EMAIL);
  return email ? email.toLowerCase() : null;
}

function configuredOwnerUid(): string | null {
  return (
    normalized(process.env.ADMIN_OWNER_UID) ||
    normalized(process.env.NEXT_PUBLIC_ADMIN_OWNER_UID)
  );
}

const OWNER_EMAIL = configuredOwnerEmail();
const OWNER_UID = configuredOwnerUid();

export function isOwnerUser(user: OwnerLike): boolean {
  if (!user) {
    return false;
  }

  if (user.admin === true) {
    return true;
  }

  const uid = normalized(user.uid ?? null);
  if (OWNER_UID && uid && uid === OWNER_UID) {
    return true;
  }

  const email = normalized(user.email ?? null)?.toLowerCase() ?? null;
  if (OWNER_EMAIL && email && email === OWNER_EMAIL) {
    return true;
  }

  return false;
}
