import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { BATCH_03 } from "@/lib/blog/batches/batch-03";
import { BATCH_04 } from "@/lib/blog/batches/batch-04";
import { BATCH_05 } from "@/lib/blog/batches/batch-05";
import { BATCH_06 } from "@/lib/blog/batches/batch-06";
import { BATCH_07 } from "@/lib/blog/batches/batch-07";
import { BATCH_08 } from "@/lib/blog/batches/batch-08";
import { BATCH_09 } from "@/lib/blog/batches/batch-09";
import { BATCH_10 } from "@/lib/blog/batches/batch-10";
import { BATCH_11 } from "@/lib/blog/batches/batch-11";
import { BATCH_12 } from "@/lib/blog/batches/batch-12";

const QUALITY_GATED_POSTS = [
  ...BATCH_03,
  ...BATCH_04,
  ...BATCH_05,
  ...BATCH_06,
  ...BATCH_07,
  ...BATCH_08,
  ...BATCH_09,
  ...BATCH_10,
  ...BATCH_11,
  ...BATCH_12,
];

describe("Blog quality gates", () => {
  it("keeps quality-gated posts at score 90 or higher", () => {
    for (const post of QUALITY_GATED_POSTS) {
      assert.ok(
        post.qualityScore && post.qualityScore >= 90,
        `${post.slug} qualityScore is below 90`,
      );
    }
  });

  it("keeps three research sources on every quality-gated post", () => {
    for (const post of QUALITY_GATED_POSTS) {
      assert.equal(
        post.researchSources?.length,
        3,
        `${post.slug} must keep three research sources`,
      );
    }
  });

  it("keeps required article elements on every quality-gated post", () => {
    for (const post of QUALITY_GATED_POSTS) {
      assert.match(post.content, /<div class="tf-tldr">/, post.slug);
      assert.match(post.content, /<h2>/, post.slug);
      assert.match(post.content, /<table>|<ul>/, post.slug);
      assert.match(post.content, /자주 묻는 질문/, post.slug);
    }
  });

  it("keeps quality-gated posts at 3,500 plain-text characters or longer", () => {
    for (const post of QUALITY_GATED_POSTS) {
      const plainTextLength = post.content.replace(/<[^>]+>/g, "").length;

      assert.ok(
        plainTextLength >= 3_500,
        `${post.slug} is ${plainTextLength} plain-text characters`,
      );
    }
  });
});
