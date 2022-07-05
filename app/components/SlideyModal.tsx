import { useState, ReactNode } from "react";
// import { CSSTransition, TransitionGroup } from 'react-transition-group'

// function SlideyPane({ children, className, setStep }: { className?: string, children: ReactNode, setStep: (x: (step: number) => number) => void }) {
//   return <div className={`SlideyPane ${className}`}>
//     {children}
//     <div className="BottomBar">
//       <button onClick={(e) => { setStep(s => s - 1); e.preventDefault() }}>Back</button>
//       <button onClick={(e) => { setStep(s => s + 1); e.preventDefault() }}>Next</button>
//     </div>
//   </div>
// }

export function SlideyModal({ children }: { children: ReactNode[] }) {
  const [step, setStep] = useState(0)
  return (
    <div className="wizard">
      {children.map((x, i) => (
        <div key={i} className={`pane ${i < step ? 'done' : i === step ? 'active' : ''}`}>
          {x}
          <div className="BottomBar">
            <button onClick={(e) => { setStep(s => s - 1); e.preventDefault() }}>Back</button>
            <button onClick={(e) => { setStep(s => s + 1); e.preventDefault() }}>Next</button>
          </div>
        </div>
      ))}
    </div>
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
