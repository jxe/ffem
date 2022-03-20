import * as Collapsible from "@radix-ui/react-collapsible"
import { Checkbox } from "melements"
import { ReactNode } from "react"
import { Form } from "remix"
import { LoaderData } from "~/routes"
import { keyframes, styled } from "~/styles/stitches.config"

export const Description = styled('div', {
  color: '$gray10',
  fontSize: '$3',
})

export const PageContainer = styled('div', {
  maxWidth: '600px',
  margin: '$1 auto',
  padding: '$1',
})

function LoginButton({ me }: { me: LoaderData['me'] }) {
  if (me) return <span>{me.name}
    <Form method="post" action="/auth/logout">
      <button>Logout</button>
    </Form>
  </span>
  else return <Form method="post" action="/auth/twitter">
    <button>Login</button>
  </Form>
}

export function Page({ me, children }: { children: ReactNode, me: LoaderData['me'] }) {
  return (
    <>
      <div style={{ display: "flex", justifyContent: "end" }}>
        <LoginButton me={me} />
      </div>
      <PageContainer>
        {children}
      </PageContainer>
    </>
  )
}

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

export const Avatar = styled('img', {
  borderRadius: '50%',
  height: '50px',
  width: '50px',
})

export const CheckboxList = styled('div', {
  display: "flex",
  gap: "8pt",
  flexDirection: "column",
})

export const Label = styled('label', {
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
  variants: {
    wide: {
      true: {
        padding: "12px 8px",
      }
    }
  }
});

export function CheckboxRow({
  id,
  children,
  checked,
  name,
  wide,
}: {
  id: string,
  children: ReactNode,
  checked: string[],
  name: string,
  wide?: boolean,
}) {
  return (
    <Label htmlFor={id} wide={wide}>
      <Checkbox
        id={id}
        name={name}
        value={id}
        defaultChecked={checked.includes(id)}
        style={{ flexShrink: 0 }}
      />
      <div> {children} </div>
    </Label>
  )
}

export const Row = styled('div', {
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

export const CollapsibleContent = styled(Collapsible.Content, {
  overflow: 'hidden',
  '&[data-state="open"]': { animation: `${open} 300ms ease-out forwards` },
  '&[data-state="closed"]': { animation: `${close} 300ms ease-out forwards` },
});
