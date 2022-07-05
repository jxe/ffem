import { useState, ReactNode, useContext, createContext } from "react";

const MultipaneContext = createContext<{ active: string }>({ active: "" })

export function Pane({ children, id }: { children: ReactNode, id: string }) {
  const { active } = useContext(MultipaneContext)
  return <div className={`pane ${active === id ? 'active' : 'inactive'}`}>
    {children}
  </div>
}

export function Root({ children, active }: { children: ReactNode, active: string }) {
  return (
    <MultipaneContext.Provider value={{ active }}>
      <div className="multipane">
        {children}
      </div>
    </MultipaneContext.Provider>
  )
}


// export function SlideyModal({ children }: { children: ReactNode[] }) {
//   const [step, setStep] = useState(0)
//   return (
//     <TransitionGroup className="SlideyModal">
//       {children.slice(0, step + 1).map((c, idx) => (
//         <CSSTransition key={idx} in classNames="slide" timeout={300}>
//           <SlideyPane key={idx} setStep={setStep}>{c}</SlideyPane>
//         </CSSTransition>)
//       )
//       }
//     </TransitionGroup>
//   )
// }
