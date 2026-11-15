#!/bin/sh
# Renders every video with voice and copies them to ../launch/videos.
set -e
npx remotion render BreakMathReelWithVoiceover out/breakmath-reel-voiceover.mp4 --log=error
for id in fees tiers whatif; do
  npx remotion render "Short-$id" "out/breakmath-short-$id.mp4" --log=error
done
mkdir -p ../launch/videos
cp out/breakmath-reel-voiceover.mp4 out/breakmath-short-*.mp4 ../launch/videos/
echo "Done. Videos are in launch/videos."
