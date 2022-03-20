import { ActionFunction, Form, redirect, useLoaderData, useMatches } from "remix"
import { db } from "~/services/db.server"
import { Checkbox } from 'melements'
import { Button } from 'melements/dist/components/Button'
import * as Collapsible from '@radix-ui/react-collapsible'
import { Description, Label, CheckboxRow, CheckboxList } from "~/components/layout"
import { styled } from "~/styles/stitches.config"
import { authenticator } from "~/services/auth.server"
import { LoaderData } from "../__directory"

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
      pledge: body.getAll("pledge") as string[],
    }
  })
  return redirect("/")
}

export default function Editor() {
  const matches = useMatches()
  const me: LoaderData['me'] = matches.find(x => x.data && "me" in x.data)?.data["me"]

  if (!me) return <Form method="post" action="/auth/twitter">
    <button>Login via twitter</button>
  </Form>

  console.log('me', me)
  const makes = me?.makes?.trim()?.split(' ')?.map(x => x.replace('-', ' ')) || [];
  const pledge: string[] = me?.pledge || [];
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
