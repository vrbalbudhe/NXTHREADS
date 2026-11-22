const { test } = require("node:test");
const assert = require("node:assert/strict");
const { hotness, decay, diversify, topicLabel } = require("../../lib/recommend");

const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;
const now = Date.UTC(2026, 0, 15, 12);

const post = (hoursAgo, { likes = 0, unlikes = 0, comments = 0, saves = 0 } = {}) => ({
  createdAt: new Date(now - hoursAgo * HOUR),
  likes,
  unlikes,
  _count: { comment: comments, savedPosts: saves },
});

test("interest halves every 30 days", () => {
  assert.equal(decay(new Date(now), now), 1);
  assert.ok(Math.abs(decay(new Date(now - 30 * DAY), now) - 0.5) < 1e-9);
  assert.ok(Math.abs(decay(new Date(now - 60 * DAY), now) - 0.25) < 1e-9);
  assert.equal(decay(null, now), 0.5, "rows without a timestamp count as 'a while ago'");
});

test("a fresh post with some engagement beats an old popular one", () => {
  assert.ok(hotness(post(2, { likes: 5 }), now) > hotness(post(48, { likes: 20 }), now));
});

test("saves count more than comments, comments more than likes, dislikes subtract", () => {
  const base = hotness(post(5), now);
  const liked = hotness(post(5, { likes: 1 }), now);
  const commented = hotness(post(5, { comments: 1 }), now);
  const saved = hotness(post(5, { saves: 1 }), now);
  const disliked = hotness(post(5, { likes: 1, unlikes: 1 }), now);
  assert.ok(saved > commented && commented > liked && liked > base);
  assert.equal(disliked, base);
  assert.equal(hotness(post(5, { unlikes: 10 }), now), base, "never below zero engagement");
});

test("variety: no author three times in a row while others are available", () => {
  const items = [
    ...Array.from({ length: 4 }, (_, i) => ({ id: `a${i}`, userId: "A", category: "X" })),
    { id: "b1", userId: "B", category: "Y" },
    { id: "c1", userId: "C", category: "Z" },
  ];
  const result = diversify(items);
  assert.equal(result.length, items.length, "nothing is dropped");
  const authors = result.map((item) => item.userId).join("");
  assert.ok(!authors.slice(0, 5).includes("AAA"), authors);
});

test("variety: no topic four times in a row while others are available", () => {
  const items = [
    ...Array.from({ length: 5 }, (_, i) => ({ id: `t${i}`, userId: `u${i}`, category: "X" })),
    { id: "y", userId: "z", category: "Y" },
  ];
  const topics = diversify(items)
    .map((item) => item.category)
    .join("");
  assert.ok(!topics.slice(0, 4).includes("XXXX"), topics);
});

test("variety keeps order when nothing conflicts", () => {
  const items = ["A", "B", "C"].map((userId, i) => ({ id: i, userId, category: userId }));
  assert.deepEqual(diversify(items), items);
});

test("topic labels are readable", () => {
  assert.equal(topicLabel("Food_and_Cooking"), "Food & Cooking");
  assert.equal(topicLabel("Web_Development"), "Web Development");
});
