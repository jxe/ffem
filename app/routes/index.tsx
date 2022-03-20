import { ActionFunction, Form, json, Link, LinksFunction, LoaderFunction, useLoaderData } from "remix"
import { db } from "~/services/db.server"
import { TwitterLogoIcon } from '@radix-ui/react-icons'
import { BoldedList, Checkbox, Dialog, DialogContent, DialogTrigger } from 'melements'
import { Button } from 'melements/dist/components/Button'
import TheFight from '~/components/thefight.mdx'
import ForWhat from '~/components/ffwhat.mdx'
import * as Collapsible from '@radix-ui/react-collapsible'
import { Row, Avatar, smallCloudinaryImg, Description, Page, Label, CheckboxRow, CheckboxList } from "~/components/layout"
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

export const action: ActionFunction = async ({ request }) => {
  const session = await authenticator.isAuthenticated(request)
  if (!session) throw new Error("Sign in!")
  const body = await request.formData();
  console.log(body)
  await db.user.update({
    where: { id: session.userId },
    data: {
      name: body.get("name") as string,
      city: body.get("city") as string,
      makes: body.getAll("makes").join(' '),
      spacemaker: true,
      // pledge: body.getAll("pledge") as string[],
    }
  })
  return null
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

function Editor() {
  const { me } = useLoaderData<LoaderData>()
  const makes = me?.makes?.trim()?.split(' ')?.map(x => x.replace('-', ' ')) || [];
  const pledge: string[] = []
  return (
    <div style={{ overflowY: "scroll", height: "calc(100vh - 200px)" }}>
      <Form method="post" replace style={{ display: "grid" }}>
        <input type="text" name="name" defaultValue={me?.name!} placeholder="Name" />
        <input type="text" name="city" defaultValue={me?.city!} placeholder="Name" />

        {/* <FlexRow alignItems="baseline" justifyContent="start" style={{ margin: "8pt 0 16pt", gap: "8pt", color: "#666" }}>
                Include me in the list!
                <Toggle disabled={!user || isLoading} checked={user?.spacemaker} onChange={async (e) =>
                  await editmeMut({ spacemaker: e.target.checked })
                } />
              </FlexRow> */}

        <CheckboxList>
          <Collapsible.Root>
            <Label htmlFor="spaces" wide>
              <Collapsible.Trigger asChild>
                <Checkbox
                  id="spaces"
                  name="pledge"
                  value="spaces"
                  defaultChecked={pledge.includes("spaces")}
                  style={{ flexShrink: 0 }}
                />
              </Collapsible.Trigger>
              <div>
                <b>I'll pour my energy into the parts of life I'd not accelerate.</b> I'll design for the sources of meaning of the people around me, not just their goals. I'll find others who do the same for me. We’ll build shared practices together.
              </div>
            </Label>
            <Collapsible.CollapsibleContent>
              <div style={{ marginLeft: "32px" }}>
                <Description>What kind of meaning-based practices do you make?</Description>
                <CheckboxList>
                  <CheckboxRow name="makes" id="events" checked={makes}>
                    <b>Events.</b> Meaning-driven, exploratory, non-goal-driven events.
                  </CheckboxRow>
                  <CheckboxRow name="makes" id="sites" checked={makes}>
                    <b>Places.</b> Real-world places for exploration (e.g., playgrounds, buildings).
                  </CheckboxRow>
                  <CheckboxRow name="makes" id="introspection-tools" checked={makes}>
                    <b>Introspection.</b> Journaling or introspection processes.
                  </CheckboxRow>
                  <CheckboxRow name="makes" id="group-processes" checked={makes} >
                    <b>Group Processes.</b> Exploratory group processes.
                  </CheckboxRow>
                  <CheckboxRow name="makes" id="collaboration-structures" checked={makes} >
                    <b>Collaboration.</b> Exploratory collaboration or org structures.
                  </CheckboxRow>
                  <CheckboxRow name="makes" id="funding-structures" checked={makes} >
                    <b>Funding.</b> Exploratory funding structures.
                  </CheckboxRow>
                  <CheckboxRow name="makes" id="apps" checked={makes} >
                    <b>Apps.</b> Exploratory apps and interfaces.
                  </CheckboxRow>
                </CheckboxList>
              </div>
            </Collapsible.CollapsibleContent>
          </Collapsible.Root>

          <CheckboxRow name="pledge" id="feelings" checked={pledge} wide>
            <b>I'll to look for wisdom in my feelings, and those around me.</b> I'll find others who do the same. We’ll identify each other’s sources of meaning and hold them sacred.
          </CheckboxRow>
          <CheckboxRow name="pledge" id="norms" checked={pledge} wide>
            <b>I'll avoid universalizing norms and ideologies</b>. We'll form groups encouraging one another to live each by our own, divergent wisdom and character. We'll refrain from pushing towards one ideal character we think everyone should be like.
          </CheckboxRow>


        </CheckboxList>
        <button type="submit">{me?.spacemaker ? "Update" : "Sign"}</button>
      </Form>
    </div>
  )
}

const Card = styled('div', {
  background: "#ddd",
  borderRadius: "8px",
  padding: "0px 16px 16px",
  margin: "8px 0px 8px",
  // boxShadow: "0px 0px 8px rgba(0,0,0,0.1)",
})

const ButttonRow = styled('div', {
  display: "flex",
  gap: "8px",
  justifyContent: "end",
})

export default function Index() {
  const { directory, me } = useLoaderData<LoaderData>()
  const filteredUsers = directory.filter(u => u.makes?.length)
  return (
    <Page me={me}>
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
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              {me?.spacemaker ? "Edit your info" : "Join them!"}
            </Button>
          </DialogTrigger>
          <DialogContent>
            {me ? <Editor /> :
              <Form method="post" action="/auth/twitter">
                <button>Login via twitter</button>
              </Form>
            }
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
