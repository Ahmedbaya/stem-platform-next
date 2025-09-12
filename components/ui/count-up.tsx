"use client"

import { useInView } from "react-intersection-observer"
import CountUp from "react-countup"

export function CountUpAnimation(props: {
  end: number
  suffix?: string
  prefix?: string
  duration?: number
}) {
  const { ref, inView } = useInView({
    threshold: 0,
    triggerOnce: true,
  })

  return (
    <span ref={ref} className="tabular-nums">
      {inView && <CountUp {...props} />}
      {!inView && (props.prefix || "") + "0" + (props.suffix || "")}
    </span>
  )
} 