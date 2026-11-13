// ai-happy-01 entry: "Laughing in the Golden Rain"
// A little girl in a yellow raincoat and red boots, arms wide, laughing in a
// golden puddle at sunset while a happy golden retriever puppy jumps beside
// her. Sincere warmth and joy, no text, two big clear figures that read at
// small size. Node 22, standard library only. The image is the entry.png
// beside this file (a JPEG, 1024x1024, 282,855 bytes — inside the 1 MiB and
// 1024x1024 limits); the program copies it to /output/entry.png, byte for
// byte, so both runs write identical bytes.
//
// Before copying, the program validates the source the same way the gate
// does: the file must exist, start with a PNG signature or a JPEG SOI
// marker, end with the matching terminator (PNG IEND chunk / JPEG EOI
// marker), and fit the 1 MiB cap. After copying it checks the copy is
// complete by comparing byte sizes, and exits non-zero on any failure
// instead of writing a partial or invalid file.
//
// Outside the grader's container, MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { copyFileSync, existsSync, mkdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const MAX_BYTES = 1048576;
const PNG_MAGIC = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
const JPEG_MAGIC = Buffer.from([0xff, 0xd8, 0xff]);
const PNG_IEND = Buffer.from([0x49, 0x45, 0x4e, 0x44, 0xae, 0x42, 0x60, 0x82]);
const JPEG_EOI = Buffer.from([0xff, 0xd9]);

function fail(message: string): never {
  console.error(`error: ${message}`);
  process.exit(1);
}

const source = new URL('./entry.png', import.meta.url);
if (!existsSync(source)) fail(`source image missing: ${source.pathname}`);

const bytes = readFileSync(source);
if (bytes.length > MAX_BYTES) {
  fail(`source image is ${bytes.length} bytes, over the ${MAX_BYTES} byte limit`);
}
const isPng = bytes.subarray(0, 8).equals(PNG_MAGIC);
const isJpeg = bytes.subarray(0, 3).equals(JPEG_MAGIC);
if (!isPng && !isJpeg) fail('source image is neither PNG nor JPEG (bad magic bytes)');
if (isPng && !bytes.subarray(bytes.length - 8).equals(PNG_IEND)) {
  fail('source PNG is truncated: missing IEND chunk');
}
if (isJpeg && !bytes.subarray(bytes.length - 2).equals(JPEG_EOI)) {
  fail('source JPEG is truncated: missing EOI marker');
}

const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';
mkdirSync(outDir, { recursive: true });
const dest = join(outDir, 'entry.png');
copyFileSync(source, dest);
if (statSync(dest).size !== bytes.length) {
  fail(`incomplete copy to ${dest}: ${statSync(dest).size} of ${bytes.length} bytes`);
}
