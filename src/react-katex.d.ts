declare module 'react-katex' {
  import type { FC, ReactNode } from 'react'
  interface MathProps {
    math?: string
    errorColor?: string
    renderError?: (error: Error) => ReactNode
  }
  export const BlockMath: FC<MathProps>
  export const InlineMath: FC<MathProps>
}
