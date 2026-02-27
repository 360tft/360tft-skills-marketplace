/**
 * Test PDF text extraction using unpdf
 * Run: npx tsx scripts/test-pdf-extract.ts
 */
import { readFileSync } from "fs";
import { getDocumentProxy, extractText } from "unpdf";

const PDF_DIR = "/tmp/aifootball-content";

async function testExtract() {
  // Test with the smallest game model PDF first
  const files = [
    `${PDF_DIR}/game-model/Age_Group_Sessions.pdf`,
    `${PDF_DIR}/sessions/45_Ball_Mastery_Sessions_-_Control,__Confidence,__Creativity.pdf`,
  ];

  for (const filePath of files) {
    console.log(`\n=== Testing: ${filePath.split("/").pop()} ===`);

    try {
      const buffer = readFileSync(filePath);
      const pdf = await getDocumentProxy(new Uint8Array(buffer));
      console.log(`Pages: ${pdf.numPages}`);

      const { totalPages, text } = await extractText(pdf, { mergePages: true });
      console.log(`Total pages extracted: ${totalPages}`);
      console.log(`Text length: ${text.length} chars`);

      const words = text.split(/\s+/).filter(Boolean);
      console.log(`Word count: ${words.length}`);
      console.log(`Words per page: ~${Math.round(words.length / totalPages)}`);

      // Show first 500 chars as sample
      console.log(`\nSample (first 500 chars):\n${text.slice(0, 500)}`);
    } catch (err) {
      console.error(`Error: ${err}`);
    }
  }
}

testExtract();
