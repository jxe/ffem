import { db } from "./db.server"
import { getSession } from "./session.server"

export async function getCurrentUser() {
  const session = await getSession()
  const id = session?.get('userId')
  if (!id) return null
  return await db.user.findUnique({
    where: { id },
    include: {
      flags: true,
      ownedLists: {
        select: {
          uuid: true,
          id: true,
          slug: true,
          name: true,
          unlisted: true,
          updatedAt: true,
          isPracticeGroup: true,
          _count: {
            select: {
              values: true
            }
          }
        },
      },
    },
  })
}
