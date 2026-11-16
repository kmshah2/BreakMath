#!/bin/sh
# Renders every video with voice and copies them to ../launch/videos.
set -e
npx remotion render BreakMathReelWithVoiceover out/breakmath-reel-voiceover.mp4 --log=error
for id in fees tiers whatif packs; do
  npx remotion render "Short-$id" "out/breakmath-short-$id.mp4" --log=error
done
mkdir -p ../launch/videos
cp out/breakmath-reel-voiceover.mp4 ../launch/videos/breakmath-ad-field.mp4
cp out/breakmath-short-fees.mp4 ../launch/videos/breakmath-ad-receipt.mp4
cp out/breakmath-short-tiers.mp4 ../launch/videos/breakmath-ad-podium.mp4
cp out/breakmath-short-whatif.mp4 ../launch/videos/breakmath-ad-gauge.mp4
cp out/breakmath-short-packs.mp4 ../launch/videos/breakmath-ad-packs.mp4
echo "Done. Videos are in launch/videos."
