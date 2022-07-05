import { json, LinksFunction, LoaderFunction, Outlet, useLoaderData, useMatches, useNavigate } from "remix"
import { db } from "~/services/db.server"
import { TwitterLogoIcon } from '@radix-ui/react-icons'
import { BoldedList, Dialog, DialogContent, DialogTrigger } from 'melements'
import { Button } from 'melements/dist/components/Button'
import TheFight from '~/components/thefight.mdx'
import ForWhat from '~/components/ffwhat.mdx'
import { Row, Avatar, smallCloudinaryImg, Description, Page } from "~/components/layout"
import { styled } from "~/styles/stitches.config"
import { authenticator } from "~/services/auth.server"

export type LoaderData = Awaited<ReturnType<typeof loaderData>>

export const links: LinksFunction = () => [
  {
    rel: 'stylesheet',
    href: '/global.css',
  }
]

async function loaderData({ request }: { request: Request }) {
  let session = await authenticator.isAuthenticated(request)
  return {
    me: session?.userId ? await db.user.findUnique({
      where: { id: session.userId },
    }) : null,
    directory: await db.user.findMany({
      where: { spacemaker: true },
      select: {
        id: true,
        name: true,
        photoUrl: true,
        twitterId: true,
        twitterName: true,
        makes: true,
        city: true,
      },
      orderBy: {
        name: "asc",
      }
    })
  }
}

export const loader: LoaderFunction = async ({ request }) => json<LoaderData>(await loaderData({ request }))

export function headers() {
  return {
    "Cache-Control": 'public, s-maxage=10, stale-while-revalidate=3600'
  };
}



export function SpacemakerListing({ user }: { user: LoaderData['directory'][0] }) {
  const makes = user.makes?.trim()?.split(' ')?.map(x => x.replace('-', ' ')) || [];
  return <Row>
    <Avatar src={smallCloudinaryImg(user.photoUrl!)} />
    <div style={{ flex: "auto", display: "grid" }}>
      <div><b>{user.name}</b> fights by making <b>exploratory</b> <BoldedList words={makes} /></div>
      <div style={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
        <Description>{user.city}</Description>
        {user.twitterId ? <a href={`https://twitter.com/${user.twitterName}`} target="_blank" rel="noopener noreferrer"><TwitterLogoIcon /></a> : null}
      </div>
    </div>
  </Row>
}

const Card = styled('div', {
  background: "#ddd",
  borderRadius: "8px",
  padding: "0.1px 16px 16px",
  margin: "8px 0px 8px",
  boxModel: "border-box",
  // boxShadow: "0px 0px 8px rgba(0,0,0,0.1)",
})

const ButttonRow = styled('div', {
  display: "flex",
  gap: "8px",
  justifyContent: "end",
})

export default function Index() {
  const { directory, me } = useLoaderData<LoaderData>()
  const matches = useMatches()
  console.log('matches', matches)
  const navigate = useNavigate()
  const editing = matches.some(x => x.pathname.startsWith('/edit'))
  const filteredUsers = directory.filter(u => u.makes?.length)
  return (
    <Page me={me}>
      <h2>The Fight for Everyday Meaning</h2>
      <Card>
        <TheFight />
        <Dialog>
          <ButttonRow>
            <DialogTrigger asChild>
              <Button>
                Read more
              </Button>
            </DialogTrigger>
          </ButttonRow>
          <DialogContent>
            <div style={{ overflowY: "auto", height: "calc(100vh - 200px)" }}>
              <ForWhat />
            </div>
          </DialogContent>
        </Dialog>
      </Card>

      <Row css={{ justifyContent: "center", padding: "48px 0px 24px" }}>
        <div style={{ fontSize: "24px" }}>
          <b>{directory.length} people</b> are fighting for meaning
        </div>
        <Dialog open={editing} onOpenChange={(open) => {
          navigate(open ? '/edit' : '/')
        }}>
          <DialogTrigger asChild>
            <Button>
              {me?.spacemaker ? "Edit your info" : "Join them!"}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <Outlet />
          </DialogContent>
        </Dialog>
      </Row>
      <div style={{ display: "grid", gap: "8px", marginTop: "16px" }}>
        {filteredUsers.map((u) => (
          <SpacemakerListing key={u.id} user={u} />
        ))}
      </div>
      <div style={{ color: "#666", flex: 3, marginTop: "64px" }}>
        This directory is maintained by
        <ul>
          <li><a target="_" href="https://twitter.com/edelwax">Joe Edelman</a>
          </li>
          <li> <a target="_" href="https://sfsd.io">the School for Social Design</a> (a training program for Spacemakers) </li>
          <li> and <a target="_" href="https://www.notion.so/humsys/Meaning-Economy-Working-Group-64e0dd86028943389a2ee1d2675c381c">the Meaning Economy Working Group</a></li>
        </ul>
        Get in touch with suggestions!
      </div>
    </Page>
  )
}
