import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  BLOG_POSTS,
  getPublishedBlogPost,
  getPublishedBlogPosts,
} from "@/lib/blog/posts";

describe("Blog schedule", () => {
  it("keeps posts on five-hour publishing intervals", () => {
    const timestamps = BLOG_POSTS.map((post) =>
      new Date(post.publishedAt).getTime(),
    );

    for (let i = 1; i < timestamps.length; i += 1) {
      const intervalHours = (timestamps[i] - timestamps[i - 1]) / 3_600_000;
      assert.equal(intervalHours, 5);
    }
  });

  it("sets the current last scheduled post to 2026-06-04 19:00 KST", () => {
    const lastPost = BLOG_POSTS.at(-1);

    assert.equal(lastPost?.publishedAt, "2026-06-04T19:00:00+09:00");
  });

  it("hides posts before their scheduled publish time", () => {
    const beforeFourthPost = new Date("2026-05-16T14:59:59+09:00");
    const atFourthPost = new Date("2026-05-16T15:00:00+09:00");

    assert.equal(getPublishedBlogPosts(beforeFourthPost).length, 3);
    assert.equal(getPublishedBlogPosts(atFourthPost).length, 4);
    assert.equal(
      getPublishedBlogPost(
        "changup-saeopgyehoekseo-jagseong",
        beforeFourthPost,
      ),
      undefined,
    );
  });
});
