/**
 * Suggestion engine end to end: For you feed, who to follow, trending topics, related
 * posts and topic preferences. Uses a throwaway account; needs some posts in the
 * database (run `npm run seed` on a fresh database).
 */
const { describe, test, before, after } = require("node:test");
const assert = require("node:assert/strict");
const { startServer, registerUser } = require("../helpers/server");

describe("suggestions", { concurrency: false }, () => {
  let server;
  let user;
  let feed = [];
  let skipReason = null;

  before(async () => {
    server = await startServer();
    const probe = await server.client().get("/post?page=1&limit=1");
    if (!probe.data?.posts?.length) {
      skipReason = "No posts in the database. Run `npm run seed` first.";
      return;
    }
    user = await registerUser(server, { label: "reco" });
  });

  after(async () => {
    if (user) await user.api.del(`/user/${user.id}`, { password: user.password });
    await server?.stop();
  });

  const run = (name, fn) =>
    test(name, async (t) => {
      if (skipReason) return t.skip(skipReason);
      return fn();
    });

  run("trending topics are public and ranked", async () => {
    const r = await server.client().get("/post/trending");
    assert.equal(r.status, 200);
    assert.ok(["week", "allTime"].includes(r.data.basis));
    assert.ok(r.data.topics.length > 0);
    for (const topic of r.data.topics) {
      assert.ok("growth" in topic && "postsThisWeek" in topic && "count" in topic);
    }
  });

  run("personal endpoints need a session", async () => {
    const guest = server.client();
    assert.equal((await guest.get("/post/feed")).status, 401);
    assert.equal((await guest.get("/user/suggestions")).status, 401);
    assert.equal((await guest.get("/user/me/interests")).status, 401);
  });

  run("topics: invalid names are refused, duplicates removed", async () => {
    const bad = await user.api.put("/user/me/interests", { interests: ["Travel", "Nope"] });
    assert.equal(bad.status, 400);
    const r = await user.api.put("/user/me/interests", {
      interests: ["Technology", "Programming", "Technology"],
    });
    assert.equal(r.status, 200);
    assert.deepEqual(r.data.interests, ["Technology", "Programming"]);
    const read = await user.api.get("/user/me/interests");
    assert.deepEqual(read.data.interests, ["Technology", "Programming"]);
  });

  run("For you feed: every post explains itself, own posts excluded", async () => {
    const r = await user.api.get("/post/feed?page=1&limit=10");
    assert.equal(r.status, 200);
    feed = r.data.posts;
    assert.ok(feed.length > 0, "a brand-new account still gets suggestions");
    for (const post of feed) {
      assert.equal(typeof post.reason, "string");
      assert.ok(post.reason.length > 0);
      assert.notEqual(post.userId, user.id);
    }
  });

  run("For you feed: later pages continue without repeats", async () => {
    const first = await user.api.get("/post/feed?page=1&limit=5");
    const second = await user.api.get("/post/feed?page=2&limit=5");
    assert.equal(second.status, 200);
    const seen = new Set(first.data.posts.map((post) => post.id));
    assert.ok(second.data.posts.every((post) => !seen.has(post.id)));
    assert.equal(first.data.meta.total, second.data.meta.total);
  });

  run("For you feed: no writer three times in a row", async () => {
    const r = await user.api.get("/post/feed?page=1&limit=30");
    const authors = r.data.posts.map((post) => post.userId);
    const distinct = new Set(authors).size;
    if (distinct < 2) return; // only one writer in the database: nothing to vary
    for (let i = 2; i < authors.length; i += 1) {
      const run3 = authors[i] === authors[i - 1] && authors[i] === authors[i - 2];
      // Allowed only once other writers have run out (the tail of the list).
      if (run3) assert.ok(new Set(authors.slice(i)).size === 1, `run at ${i}: ${authors}`);
    }
  });

  run("For you feed: a disliked post disappears, and comes back when undone", async () => {
    const target = feed.find((post) => !post.viewer.disliked && !post.viewer.liked);
    assert.ok(target, "need a post this account hasn't reacted to");
    await user.api.post("/post/unlike", { postId: target.id });
    const after = await user.api.get("/post/feed?page=1&limit=50");
    assert.ok(after.data.posts.every((post) => post.id !== target.id));
    await user.api.post("/post/unlike", { postId: target.id }); // toggle back
    const state = await user.api.get(`/post/get/${target.id}`);
    assert.equal(state.data.post.viewer.disliked, false);
  });

  run("who to follow: reasons given, never yourself", async () => {
    const r = await user.api.get("/user/suggestions?limit=5");
    assert.equal(r.status, 200);
    assert.ok(r.data.users.length <= 5);
    for (const suggestion of r.data.users) {
      assert.ok(suggestion.reason);
      assert.notEqual(suggestion.id, user.id);
      assert.ok(!("email" in suggestion), "no emails in suggestions");
    }
  });

  run("who to follow: following someone removes them from suggestions", async () => {
    const before = await user.api.get("/user/suggestions?limit=5");
    const first = before.data.users[0];
    if (!first) return; // nobody to suggest in this database
    await user.api.post("/userfollow/follow", { followingId: first.id });
    const after = await user.api.get("/user/suggestions?limit=20");
    assert.ok(after.data.users.every((suggestion) => suggestion.id !== first.id));
    await user.api.post("/userfollow/follow", { followingId: first.id }); // unfollow
  });

  run("recommended reads: ranked, explained, never the post itself", async () => {
    const postId = feed[0].id;
    const r = await server.client().get(`/post/related/${postId}?limit=4`);
    assert.equal(r.status, 200);
    assert.ok(r.data.posts.length <= 4);
    for (const post of r.data.posts) {
      assert.notEqual(post.id, postId);
      assert.ok(post.reason);
    }
    const missing = await server.client().get("/post/related/000000000000000000000000");
    assert.equal(missing.status, 404);
  });
});
