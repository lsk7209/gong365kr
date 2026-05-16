import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { BATCH_03 } from "@/lib/blog/batches/batch-03";
import { BATCH_04 } from "@/lib/blog/batches/batch-04";

const QUALITY_GATED_POSTS = [...BATCH_03, ...BATCH_04];

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
