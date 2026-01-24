import { auth, currentUser } from '@clerk/nextjs/server'
import { db } from './db'
import { Role } from '@/generated/prisma'

export type AuthSession = {
  userId: string
  orgId: string
  role: Role
  clerkUserId: string
}

/**
 * Get the current authenticated session with org context
 * Throws if not authenticated or no org selected
 */
export async function getAuthSession(): Promise<AuthSession> {
  const { userId, orgId } = await auth()
  
  if (!userId) {
    throw new Error('Unauthorized: No user session')
  }
  
  if (!orgId) {
    throw new Error('Unauthorized: No organization selected')
  }
  
  // Get or create user in our database
  let user = await db.user.findUnique({
    where: { clerkId: userId },
    select: { id: true, role: true },
  })
  
  if (!user) {
    // Sync user from Clerk
    const clerkUser = await currentUser()
    if (!clerkUser) {
      throw new Error('Unauthorized: User not found')
    }
    
    user = await db.user.create({
      data: {
        clerkId: userId,
        email: clerkUser.emailAddresses[0]?.emailAddress ?? '',
        firstName: clerkUser.firstName,
        lastName: clerkUser.lastName,
        imageUrl: clerkUser.imageUrl,
        orgId: orgId,
        role: Role.REP, // Default role for new users
      },
      select: { id: true, role: true },
    })
  }
  
  return {
    userId: user.id,
    orgId,
    role: user.role,
    clerkUserId: userId,
  }
}

/**
 * Check if user has required role (or higher)
 */
export function hasRole(userRole: Role, requiredRole: Role): boolean {
  const roleHierarchy: Record<Role, number> = {
    [Role.REP]: 1,
    [Role.MANAGER]: 2,
    [Role.ADMIN]: 3,
  }
  
  return roleHierarchy[userRole] >= roleHierarchy[requiredRole]
}

/**
 * Require specific role - throws if insufficient
 */
export function requireRole(session: AuthSession, requiredRole: Role): void {
  if (!hasRole(session.role, requiredRole)) {
    throw new Error(`Forbidden: Requires ${requiredRole} role or higher`)
  }
}
