import { useMemo } from "react";
import cstimer from "cstimer_module";

interface Props {
  scramble: string;
  cubeType?: string | null;
  width?: number;
  height?: number;
}

export default function ScrambleImage({
  scramble,
  cubeType,
  width,
  height,
}: Props) {
  const scrambleSvg = useMemo(() => {
    const svgString = cstimer.getImage(scramble, cubeType ?? undefined);

    const widthMatch = svgString.match(/width="(\d+\.?\d*)"/);
    const heightMatch = svgString.match(/height="(\d+\.?\d*)"/);

    const widthS = widthMatch ? widthMatch[1] : "266";
    const heightS = heightMatch ? heightMatch[1] : "199.333";

    return svgString.replace(
      /<svg width="\d+\.?\d*" height="\d+\.?\d*"/,
      `<svg viewBox="0 0 ${widthS} ${heightS}" width="${width ?? 250}" height="${height ?? 100}"`,
    );
  }, [scramble, cubeType]);

  return (
    <div
      dangerouslySetInnerHTML={{
        __html: scrambleSvg,
      }}
    />
  );
}
