#!/bin/bash

# 3D Model Draco Compression Script
# Usage: ./compress-model.sh input.glb output.glb

INPUT_FILE=${1:-"public/assets/landscape-original.glb"}
OUTPUT_FILE=${2:-"public/assets/landscape.glb"}
COMPRESSION_LEVEL=${3:-10}

echo "🗜️  Compressing 3D model with Draco..."
echo "📁 Input:  $INPUT_FILE"
echo "📁 Output: $OUTPUT_FILE"
echo "🎚️  Compression Level: $COMPRESSION_LEVEL (max: 10)"
echo ""

# Check if input file exists
if [ ! -f "$INPUT_FILE" ]; then
    echo "❌ Error: Input file '$INPUT_FILE' not found!"
    exit 1
fi

# Get original file size
ORIGINAL_SIZE=$(ls -lh "$INPUT_FILE" | awk '{print $5}')
echo "📊 Original size: $ORIGINAL_SIZE"

# Compress with Draco
npx gltf-pipeline -i "$INPUT_FILE" -o "$OUTPUT_FILE" --draco.compressionLevel="$COMPRESSION_LEVEL"

# Get compressed file size
if [ -f "$OUTPUT_FILE" ]; then
    COMPRESSED_SIZE=$(ls -lh "$OUTPUT_FILE" | awk '{print $5}')
    echo "📊 Compressed size: $COMPRESSED_SIZE"
    echo "✅ Compression complete!"
    echo ""
    echo "💡 Don't forget to:"
    echo "   1. Test the model loads correctly"
    echo "   2. Deploy with: npm run deploy"
else
    echo "❌ Compression failed!"
    exit 1
fi 