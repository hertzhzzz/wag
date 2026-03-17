#!/bin/bash
cd /Users/mark/Projects/wa-global-nextjs/public/videos

# 行业列表
declare -a TITLES=("Manufacturing" "Logistics" "Industrial" "Port & Shipping" "Maritime" "Aviation" "Agriculture" "Chemical" "Electronics" "Healthcare")
declare -a SUBS=("Industrial Production" "Supply Chain" "Heavy Manufacturing" "Global Trade" "Ocean Transport" "Air Cargo" "Farming & Rural" "Lab & Research" "Tech & Semiconductors" "Medical Equipment")

# 用filter复杂滤镜合并加文字
FILTER=""

for i in {0..9}; do
  VIDEOS[$i]="${!i}.mp4"
  
  # 每个片段加文字
  FILTER+="[$i:v]drawtext=text='${TITLES[$i]}':fontsize=48:fontcolor=white:x=(w-text_w)/2:y=h-200:box=1:boxcolor=black@0.5:boxborderw=10,drawtext=text='${SUBS[$i]}':fontsize=24:fontcolor=#F59E0B:x=(w-text_w)/2:y=h-150[vid$i];"
done

# 合并所有
OUTPUT="hero-compiled.mp4"

# 简化方案：先合并，再加文字
ffmpeg -y \
  -i industry1.mp4 -i industry2.mp4 -i industry3.mp4 -i port.mp4 -i shipping.mp4 \
  -i airplane.mp4 -i agriculture.mp4 -i chemical.mp4 -i electronics.mp4 -i medical.mp4 \
  -filter_complex "[0:v][1:v][2:v][3:v][4:v][5:v][6:v][7:v][8:v][9:v]concat=n=10:v=1:a=0[out]" \
  -map "[out]" -c:v libx264 -crf 23 -preset fast $OUTPUT 2>&1 | tail -5

ls -lh $OUTPUT
