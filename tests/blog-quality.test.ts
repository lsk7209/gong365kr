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
import { BATCH_13 } from "@/lib/blog/batches/batch-13";
import { BATCH_14 } from "@/lib/blog/batches/batch-14";
import { BATCH_15 } from "@/lib/blog/batches/batch-15";
import { BATCH_16 } from "@/lib/blog/batches/batch-16";
import { BATCH_17 } from "@/lib/blog/batches/batch-17";
import { BATCH_18 } from "@/lib/blog/batches/batch-18";
import { BATCH_19 } from "@/lib/blog/batches/batch-19";
import { BATCH_20 } from "@/lib/blog/batches/batch-20";
import { BATCH_21 } from "@/lib/blog/batches/batch-21";
import { BATCH_22 } from "@/lib/blog/batches/batch-22";
import { BATCH_23 } from "@/lib/blog/batches/batch-23";

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
  ...BATCH_13,
  ...BATCH_14,
  ...BATCH_15,
  ...BATCH_16,
  ...BATCH_17,
  ...BATCH_18,
  ...BATCH_19,
  ...BATCH_20,
  ...BATCH_21,
  ...BATCH_22,
  ...BATCH_23,
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
