import { ReactNode } from "react"
import { ActionFunction, Form, json, LoaderFunction, useLoaderData } from "remix"
import { db } from "~/services/db.server"
import { getSession } from "~/services/session.server"
import { TwitterLogoIcon } from '@radix-ui/react-icons'
import { styled, keyframes } from "~/styles/stitches.config"
import { BoldedList, Checkbox, Dialog, DialogContent, DialogTrigger } from 'melements'
import { Button } from 'melements/dist/components/Button'
import TheFight from '~/components/thefight.mdx'
import * as Collapsible from '@radix-ui/react-collapsible'

type LoaderData = Awaited<ReturnType<typeof loaderData>>

async function loaderData() {
  const session = await getSession()
  return {
    me: session.data['userId'] ? await db.user.findUnique({
      where: {
        id: session.data['userId']
      },
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
  const body = await request.formData();
  console.log(body)
  return null
  // const todo = await fakeCreateTodo({
  //   title: body.get("title"),
  // });
  // return redirect(`/todos/${todo.id}`);
}

export const loader: LoaderFunction = async () => json<LoaderData>(await loaderData())

export function headers() {
  return {
    "Cache-Control": 'public, s-maxage=10, stale-while-revalidate=3600'
  };
}

const Description = styled('div', {
  color: '$gray10',
  fontSize: '$3',
})

const Page = styled('div', {
  maxWidth: '600px',
  margin: '$1 auto',
  padding: '$1',
  fontFamily: 'system-ui, sans-serif',
})

export function smallCloudinaryImg(src: string) {
  if (!src.includes("cloudinary.com")) return src
  if (src.includes("upload")) {
    const [head, tail] = src.split("/upload/")
    return `${head}/upload/w_60,h_60,c_fill,r_max/${tail}`
  } else {
    const [head, tail] = src.split("/twitter/")
    return `${head}/twitter/w_60,h_60,c_fill,r_max/${tail}`
  }
}

const Avatar = styled('img', {
  borderRadius: '50%',
  height: '50px',
  width: '50px',
})

const CheckboxList = styled('div', {
  display: "flex",
  gap: "8pt",
  flexDirection: "column",
})

const Label = styled('label', {
  padding: "12px 8px",
  gap: "8px",
  display: 'flex',
  justifyContent: "flex-start",
  color: 'black',
  fontSize: 15,
  lineHeight: 1,
  userSelect: 'none',
  flex: "auto",
  textAlign: "left",
  backgroundColor: 'white',
});

function CheckboxRow({
  id,
  children,
  checked,
  name,
}: {
  id: string,
  children: ReactNode,
  checked: string[],
  name: string
}) {
  return (
    <Label htmlFor={id}>
      <Checkbox
        id={id}
        name={name}
        value={id}
        defaultChecked={checked.includes(id)}
        style={{ flexShrink: 0 }}
      />
      <div>
        <div><b>{id}</b></div>
        <div style={{ color: "#666" }}>{children}</div>
      </div>

    </Label>
  )
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

const Row = styled('div', {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "8pt",
  borderBottom: "1px #eee solid",
  paddingBottom: "16px",
  marginBottom: "8px",
})

const open = keyframes({
  from: { height: 0 },
  to: { height: 'var(--radix-collapsible-content-height)' },
});
const close = keyframes({
  from: { height: 'var(--radix-collapsible-content-height)' },
  to: { height: 0 },
});
const CollapsibleContent = styled(Collapsible.Content, {
  overflow: 'hidden',
  '&[data-state="open"]': { animation: `${open} 300ms ease-out forwards` },
  '&[data-state="closed"]': { animation: `${close} 300ms ease-out forwards` },
});

export default function Index() {
  const { directory, me } = useLoaderData<LoaderData>()
  const filteredUsers = directory.filter(u => u.makes?.length)
  const makes = me?.makes?.trim()?.split(' ')?.map(x => x.replace('-', ' ')) || [];
  const pledge: string[] = []
  return (
    <Page>
      <Description css={{ textAlign: "center", marginY: "10px" }}>{directory.length} have signed</Description>
      <TheFight />
      <Row css={{ justifyContent: "center" }}>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              {me?.spacemaker ? "Edit your info" : "Join the fight!"}
            </Button>
          </DialogTrigger>
          <DialogContent>
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
                    <Label htmlFor="spaces">
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
                        <b>I pledge to pour my energy into the parts of life I would not accelerate.</b> I will design for the sources of meaning of the people around me, not just their goals. I will find others who do the same for me. We’ll build shared practices together.
                      </div>
                    </Label>
                    <CollapsibleContent>
                      <h4>Which kinds of exploratory spaces have you made?</h4>
                      <Description>Local ones</Description>
                      <CheckboxList>
                        <CheckboxRow name="makes" id="events" checked={makes}>
                          I make meaning-driven, exploratory, non-goal-driven events
                        </CheckboxRow>
                        <CheckboxRow name="makes" id="sites" checked={makes}>
                          I design real-world places for exploration (e.g., playgrounds, buildings)
                        </CheckboxRow>
                      </CheckboxList>
                      <Description>Potentially global ones</Description>
                      <CheckboxList>
                        <CheckboxRow name="makes" id="introspection-tools" checked={makes}>
                          I invent journaling or introspection processes
                        </CheckboxRow>
                        <CheckboxRow name="makes" id="group-processes" checked={makes} >
                          I invent exploratory group processes
                        </CheckboxRow>
                        <CheckboxRow name="makes" id="collaboration-structures" checked={makes} >
                          I invent exploratory collaboration or org structures
                        </CheckboxRow>
                        <CheckboxRow name="makes" id="funding-structures" checked={makes} >
                          I invent exploratory funding structures
                        </CheckboxRow>
                        <CheckboxRow name="makes" id="apps" checked={makes} >
                          I design exploratory apps and interfaces
                        </CheckboxRow>
                      </CheckboxList>
                    </CollapsibleContent>
                  </Collapsible.Root>

                  <CheckboxRow name="pledge" id="feelings" checked={pledge}>
                    <b>I pledge to look for wisdom in my feelings, and the feelings of those around me.</b> I will find others who do the same for me. We’ll identify each other’s sources of meaning and hold them sacred.
                  </CheckboxRow>
                  <CheckboxRow name="pledge" id="norms" checked={pledge}>
                    <b>I pledge to avoid universalizing norms and ideologies</b>, by forming groups where we encourage one another to live each by our own, divergent wisdom and character. Where we refrain from pushing towards one ideal character we think everyone should be like.
                  </CheckboxRow>


                </CheckboxList>


                <button type="submit">Save</button>
              </Form>
            </div>
          </DialogContent>
        </Dialog>
      </Row>
      <div style={{ display: "grid", gap: "8px", marginTop: "8pt" }}>
        {filteredUsers.map((u) => (
          <SpacemakerListing key={u.id} user={u} />
        ))}
      </div>
      <div style={{ color: "#666", flex: 3, marginTop: "32px", paddingTop: "16px", borderTop: "solid 1px #ccc" }}>
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
