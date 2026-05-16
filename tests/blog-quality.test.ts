import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { BATCH_03 } from "@/lib/blog/batches/batch-03";

describe("Blog quality gates", () => {
  it("keeps batch-03 posts at quality score 90 or higher", () => {
    for (const post of BATCH_03) {
      assert.ok(
        post.qualityScore && post.qualityScore >= 90,
        `${post.slug} qualityScore is below 90`,
      );
    }
  });

  it("keeps three research sources on every batch-03 post", () => {
    for (const post of BATCH_03) {
      assert.equal(
        post.researchSources?.length,
        3,
        `${post.slug} must keep three research sources`,
      );
    }
  });

  it("keeps required article elements on every batch-03 post", () => {
    for (const post of BATCH_03) {
      assert.match(post.content, /<div class="tf-tldr">/, post.slug);
      assert.match(post.content, /<h2>/, post.slug);
      assert.match(post.content, /<table>|<ul>/, post.slug);
      assert.match(post.content, /자주 묻는 질문/, post.slug);
    }
  });

  it("keeps batch-03 posts at 3,500 plain-text characters or longer", () => {
    for (const post of BATCH_03) {
      const plainTextLength = post.content.replace(/<[^>]+>/g, "").length;

      assert.ok(
        plainTextLength >= 3_500,
        `${post.slug} is ${plainTextLength} plain-text characters`,
      );
    }
  });
});
