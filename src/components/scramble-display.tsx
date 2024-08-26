import { useEffect, useRef } from "react";

export default function ScrambleDisplay({
  scramble,
  event,
  className,
}: {
  scramble: string;
  event: string;
  className?: string;
}) {
  const parentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      import("scramble-display").then(({ ScrambleDisplay: SD }) => {
        const el = new SD();

        el.event = event;
        el.scramble = scramble;

        parentRef.current?.appendChild(el);

        return () => {
          parentRef.current?.removeChild(el);
        };
      });
    }
  }, [event, scramble]);

  return <div ref={parentRef} className={className}></div>;
}
