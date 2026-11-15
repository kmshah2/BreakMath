import { Audio } from "@remotion/media";
import { AbsoluteFill, Series, staticFile } from "remotion";
import { Background, SceneShell, Words } from "../parts";
import { Cta } from "../scenes/Cta";
import { SHORT_CTA_FRAMES, SHORTS, ShortId } from "../script";
import { headline } from "../theme";
import { FeesDemo } from "./FeesDemo";
import { TiersDemo } from "./TiersDemo";
import { WhatIfDemo } from "./WhatIfDemo";

const DEMOS: Record<ShortId, React.FC<{ duration: number }>> = {
  fees: FeesDemo,
  tiers: TiersDemo,
  whatif: WhatIfDemo,
};

export const shortFrames = (id: ShortId) => SHORTS[id].hookFrames + SHORTS[id].demoFrames + SHORT_CTA_FRAMES;

export type ShortProps = { id: ShortId; voiceover: boolean };

// A follow-up video: hook line, one demo, closing call.
export const Short: React.FC<ShortProps> = ({ id, voiceover }) => {
  const short = SHORTS[id];
  const Demo = DEMOS[id];
  return (
    <AbsoluteFill>
      <Background />
      <Series>
        <Series.Sequence name="Hook" durationInFrames={short.hookFrames}>
          <SceneShell duration={short.hookFrames}>
            <Words text={short.hook} style={{ ...headline, fontSize: 124 }} />
          </SceneShell>
          {voiceover ? <Audio from={4} src={staticFile(`voiceover/short-${id}-hook.mp3`)} /> : null}
        </Series.Sequence>
        <Series.Sequence name="Demo" durationInFrames={short.demoFrames}>
          <Demo duration={short.demoFrames} />
          {voiceover ? <Audio from={6} src={staticFile(`voiceover/short-${id}-demo.mp3`)} /> : null}
        </Series.Sequence>
        <Series.Sequence name="Call to action" durationInFrames={SHORT_CTA_FRAMES}>
          <Cta duration={SHORT_CTA_FRAMES} />
          {voiceover ? <Audio from={6} src={staticFile("voiceover/07-cta.mp3")} /> : null}
        </Series.Sequence>
      </Series>
    </AbsoluteFill>
  );
};
