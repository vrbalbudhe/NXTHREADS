const img = (id, width = 1400) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${width}&q=80`;

const DEMO_DOMAIN = "example.com";

const users = [
  {
    key: "ava",
    username: "ava.martinez",
    fullname: "Ava Martinez",
    gender: "female",
    avatar: img("photo-1494790108377-be9c29b29330", 320),
  },
  {
    key: "ben",
    username: "bencarter",
    fullname: "Ben Carter",
    gender: "male",
    avatar: img("photo-1507003211169-0a1dd7228f2d", 320),
  },
  {
    key: "priya",
    username: "priya.sharma",
    fullname: "Priya Sharma",
    gender: "female",
    avatar: img("photo-1438761681033-6461ffad8d80", 320),
  },
  {
    key: "daniel",
    username: "danielkim",
    fullname: "Daniel Kim",
    gender: "male",
    avatar: img("photo-1500648767791-00dcc994a43e", 320),
  },
  {
    key: "sofia",
    username: "sofia.rossi",
    fullname: "Sofia Rossi",
    gender: "female",
    avatar: img("photo-1544005313-94ddf0286df2", 320),
  },
  {
    key: "marcus",
    username: "marcusj",
    fullname: "Marcus Johnson",
    gender: "male",
    avatar: img("photo-1506794778202-cad84cf45f1d", 320),
  },
  {
    key: "lena",
    username: "lena.fischer",
    fullname: "Lena Fischer",
    gender: "female",
    avatar: img("photo-1534528741775-53994a69daeb", 320),
  },
];

const posts = [
  {
    key: "calm-ui",
    author: "ava",
    daysAgo: 12,
    category: "Design",
    title: "Designing calm interfaces",
    subtitle: "Why less visual noise makes products feel faster",
    images: [img("photo-1558655146-d09347e92766"), img("photo-1561070791-2526d30994b5")],
    content: `Most interfaces don't feel slow because of the network. They feel slow because every element is shouting for attention at the same time.

Over the last year I've redesigned three dashboards, and the same three moves made the biggest difference every time.

1. Start with a neutral canvas. A soft gray page with white panels gives content a natural hierarchy without a single extra border.
2. Pick one accent colour and protect it. If blue means "you can click this", don't also use it for decoration.
3. Let spacing do the grouping. Twelve pixels between related items and twenty-four between groups is enough structure for most screens.

None of this is new, but it's easy to forget under deadline pressure. Next week I'll share the type scale we settled on.`,
  },
  {
    key: "prisma-mongo",
    author: "ben",
    daysAgo: 11,
    category: "Programming",
    title: "A practical guide to Prisma with MongoDB",
    subtitle: "Relations, transactions and the gotchas nobody warns you about",
    images: [img("photo-1555066931-4365d14bab8c")],
    content: `Prisma makes MongoDB feel surprisingly relational, but a few behaviours caught our team off guard in production.

Missing is not null. If a document was written before you added an optional field, filtering with "field: null" won't match it. Use "isSet: false" alongside the null check.

"contains" is a regex. Prisma turns it into a MongoDB regular expression, so a search for ".*" matches everything. Escape user input before passing it in.

Transactions need a replica set. Atlas gives you one by default, but a plain local mongod does not, and the error message is not obvious.

Run "prisma db push" after schema changes. Indexes and unique constraints only exist once you push them, and without them duplicate likes and follows can slip through.`,
  },
  {
    key: "realtime-chat",
    author: "ben",
    daysAgo: 9,
    category: "Web_Development",
    title: "Shipping realtime chat with Socket.IO",
    subtitle: "Cookie auth, rooms and read receipts in under 300 lines",
    images: [img("photo-1498050108023-c5249f4df085")],
    content: `We replaced a third-party chat SDK with about 300 lines of our own code, and the result is faster and easier to reason about.

Authenticate the socket with the same HTTP-only session cookie your REST API uses. Parse it in the handshake middleware and reject the connection if the session is invalid or revoked.

Give every user a room named after their ID. Sending a message is then just emitting to two rooms: the sender's and the receiver's. Every open tab stays in sync for free.

Read receipts are a single updateMany when a conversation is opened, plus a small "chat:read" event while it stays open.

Once you run more than one server, add the Redis adapter so a message emitted on one instance reaches sockets connected to another.`,
  },
  {
    key: "notebook-habits",
    author: "priya",
    daysAgo: 10,
    category: "Data_Science",
    title: "Five notebook habits that saved my analyses",
    subtitle: "Small rules that make data work reproducible",
    images: [img("photo-1551288049-bebda4e38f71")],
    content: `I used to lose hours trying to reproduce charts I had made only a week earlier. These habits fixed that.

Restart and run all before sharing anything. If the notebook only works in the order you happened to run it, it doesn't work.

Pin your data. Save the exact extract you analysed with a date in the filename instead of re-querying a live table.

Write the question at the top. One sentence describing what the notebook is trying to answer keeps the analysis from drifting.

Keep cleaning functions in a module. Notebooks are great for exploring and terrible for logic you need to trust.

End with a "So what?" cell. Two or three bullet points that a busy stakeholder can read without scrolling.`,
  },
  {
    key: "dashboard-metrics",
    author: "priya",
    daysAgo: 4,
    category: "Data_Science",
    title: "Your dashboard has too many metrics",
    subtitle: "How we cut 38 charts down to 6 and made better decisions",
    images: [img("photo-1460925895917-afdab827c52f")],
    content: `Our product dashboard had 38 charts. Nobody looked at more than five of them, and nobody agreed which five mattered.

We ran a simple exercise: for every chart, the team had to name the decision it changes. If nobody could, the chart went into an archive tab.

Six survived. Weekly active writers, posts per active writer, time to first comment, follow-back rate, seven-day retention, and the share of posts that get at least one reply.

The surprising part wasn't the cut. It was how much faster planning meetings became once everyone was looking at the same small set of numbers.`,
  },
  {
    key: "hills-trip",
    author: "daniel",
    daysAgo: 8,
    category: "Travel",
    title: "Three slow days in the Dolomites",
    subtitle: "Trails, quiet lakes and the art of not over-planning",
    images: [img("photo-1501785888041-af3ef285b470"), img("photo-1469474968028-56623f02e42e")],
    content: `I went with a camera, a rain jacket and exactly one plan per day. It was the best trip I've taken in years.

Day one was the lake loop at sunrise. Get there before seven and you'll share the shoreline with a handful of photographers and a very curious duck.

Day two was a ridge walk I picked from a map in the guesthouse. Four hours, two huts, and the best apple strudel of my life.

Day three I did almost nothing. I sat by a stream, edited photos and talked to a shepherd who has walked the same valley for forty years.

The lesson: leave room in the schedule. The moments I remember most were the ones I didn't plan.`,
  },
  {
    key: "travel-camera",
    author: "daniel",
    daysAgo: 2,
    category: "Photography",
    title: "The only three camera settings I change while travelling",
    subtitle: "Spend less time in menus and more time looking up",
    images: [img("photo-1488646953014-85cb44e25828")],
    content: `When you're moving fast, menus are the enemy. I leave almost everything on auto and change only three things.

Exposure compensation. Bright skies fool the meter, so I dial in minus two-thirds of a stop and recover shadows later.

Minimum shutter speed. Set it to 1/250 in aperture priority and you'll stop losing street shots to motion blur.

Focus mode. Single point for landscapes, tracking for anything that moves. That's it.

Everything else can be fixed in editing. A missed moment can't.`,
  },
  {
    key: "weeknight-pasta",
    author: "sofia",
    daysAgo: 7,
    category: "Food_and_Cooking",
    title: "My grandmother's 20-minute weeknight pasta",
    subtitle: "Five ingredients, one pan and no shortcuts that matter",
    images: [img("photo-1504674900247-0877df9cc836"), img("photo-1495521821757-a1efb6729352")],
    content: `This is the dish my nonna made whenever someone walked in hungry and unannounced.

You need spaghetti, good canned tomatoes, two cloves of garlic, a generous pour of olive oil and a handful of basil.

Warm the oil gently with sliced garlic until it smells sweet, not brown. Crush the tomatoes in by hand, add a pinch of salt and let it bubble while the pasta cooks.

Here's the trick: pull the pasta two minutes early and finish it in the sauce with a ladle of the cooking water. The starch turns everything glossy.

Tear the basil over the top at the very end. Grandma would want you to eat it right away.`,
  },
  {
    key: "meal-prep",
    author: "sofia",
    daysAgo: 1,
    category: "Health_and_Wellness",
    title: "Meal prep that doesn't feel like punishment",
    subtitle: "Cook components, not meals",
    images: [img("photo-1512621776951-a57141f2eefd"), img("photo-1540189549336-e6e99c3679fe")],
    content: `I gave up on meal prep twice because eating the same box five days in a row was miserable. The fix was cooking components instead of meals.

On Sunday I make one grain, two roasted vegetables, one protein and two sauces. That's about ninety minutes of mostly hands-off cooking.

During the week I mix and match. Rice, roasted peppers, chickpeas and yoghurt sauce on Monday. The same rice with broccoli, chicken and a chilli dressing on Tuesday.

Same effort, much more variety, and nothing goes to waste.`,
  },
  {
    key: "strength-habit",
    author: "marcus",
    daysAgo: 6,
    category: "Personal_Development",
    title: "How I finally stuck with strength training",
    subtitle: "Stop chasing motivation and design for the bad days",
    images: [img("photo-1571019613454-1cb2f99b2d8b")],
    content: `I started and quit the gym four times before something finally stuck. It wasn't a new programme. It was planning for the days I didn't feel like going.

Shrink the minimum. My rule is two working sets of one exercise. Some days that's all I do. Most days, once I'm there, I do the full session.

Remove decisions. The same three workouts on repeat, written on a card in my bag, so there's nothing to think about.

Track streaks, not numbers. Showing up eleven weeks in a row mattered more than any personal record.

Six months in, the habit runs itself. The strength followed.`,
  },
  {
    key: "threat-modeling",
    author: "lena",
    daysAgo: 5,
    category: "Cybersecurity",
    title: "Threat modeling for small teams",
    subtitle: "A one-hour exercise that catches the bugs scanners miss",
    images: [img("photo-1563986768609-322da13575f3")],
    content: `You don't need a security team to do threat modeling. You need a whiteboard, an hour and the people who built the feature.

Draw the data flow. Users, browser, API, database, any third parties. Mark every place where data crosses a trust boundary.

At each boundary, ask four questions. Who could pretend to be someone else here? What could they change? What could they read that they shouldn't? What could they break?

Write down the answers as tickets, not as a report. Last month this caught an endpoint that trusted a user ID from the request body instead of the session. No scanner would have found it.`,
  },
  {
    key: "sessions-revoked",
    author: "lena",
    daysAgo: 0,
    category: "Cybersecurity",
    title: "Logging out should actually log you out",
    subtitle: "Why stateless JWTs need a small amount of state",
    images: [img("photo-1526374965328-7f61d4dc18c5")],
    content: `A common bug in apps that use JSON Web Tokens: clicking "Sign out" deletes the cookie, but the token itself stays valid until it expires. If it was copied or stolen, it keeps working for days.

The fix is a tiny bit of state. Give every token a unique ID. On logout, store that ID in a fast key-value store like Redis until the token would have expired, and reject any request that presents it.

For password changes and account deletion, store a "valid after" timestamp per user instead. Any token issued before it is rejected, which signs out every other device in one step.

It's a few dozen lines of code and it closes a gap most users assume doesn't exist.`,
  },
  {
    key: "remote-teams",
    author: "marcus",
    daysAgo: 3,
    category: "Entrepreneurship",
    title: "What running a four-person remote team taught me",
    subtitle: "Writing things down is the whole job",
    images: [img("photo-1522202176988-66273c2fd55f")],
    content: `When we went fully remote I thought the hard part would be tools. It turned out to be writing.

Decisions that live in a call are forgotten by Thursday. Decisions written in a short doc with a date and an owner survive.

We adopted three habits: every meeting ends with a written summary, every project has a one-page brief, and every Friday each person posts what they shipped and what's blocking them.

It felt slow for two weeks. Then it made everything else faster.`,
  },
];

const comments = [
  {
    post: "calm-ui",
    author: "ben",
    hoursAfter: 3,
    text: "The spacing rule alone cleaned up our settings page. Twelve and twenty-four is going on a sticky note.",
  },
  {
    post: "calm-ui",
    author: "ava",
    hoursAfter: 4,
    text: "Thanks Ben! The type scale post is coming next week.",
  },
  {
    post: "calm-ui",
    author: "lena",
    hoursAfter: 20,
    text: "Protecting the accent colour is underrated. Ours had slowly turned into decoration.",
  },
  {
    post: "prisma-mongo",
    author: "priya",
    hoursAfter: 5,
    text: "The missing-versus-null thing bit us last month. Took ages to figure out why our counts were wrong.",
  },
  {
    post: "prisma-mongo",
    author: "lena",
    hoursAfter: 9,
    text: "Escaping regex input is also a ReDoS fix, not just a correctness one. Good call.",
  },
  {
    post: "realtime-chat",
    author: "ava",
    hoursAfter: 2,
    text: "The read receipts trick is clever. Going to try this in our app!",
  },
  {
    post: "realtime-chat",
    author: "daniel",
    hoursAfter: 30,
    text: "Does the Redis adapter add noticeable latency? Curious about real numbers.",
  },
  {
    post: "realtime-chat",
    author: "ben",
    hoursAfter: 31,
    text: "Barely measurable for us, a couple of milliseconds on the same network.",
  },
  {
    post: "notebook-habits",
    author: "marcus",
    hoursAfter: 6,
    text: "Restart and run all before sharing should be printed on every monitor.",
  },
  {
    post: "dashboard-metrics",
    author: "ava",
    hoursAfter: 4,
    text: "Name the decision it changes. Stealing this for our next design review.",
  },
  {
    post: "hills-trip",
    author: "sofia",
    hoursAfter: 8,
    text: "That strudel deserves its own post 😄 Which hut was it?",
  },
  {
    post: "hills-trip",
    author: "daniel",
    hoursAfter: 9,
    text: "The second one on the ridge. Sending you the name!",
  },
  {
    post: "weeknight-pasta",
    author: "marcus",
    hoursAfter: 12,
    text: "Made this last night. The pasta water trick really works.",
  },
  {
    post: "weeknight-pasta",
    author: "priya",
    hoursAfter: 26,
    text: "Added chilli flakes and it was perfect. Thank you for sharing your nonna's recipe.",
  },
  {
    post: "strength-habit",
    author: "ben",
    hoursAfter: 7,
    text: "Shrinking the minimum is the only thing that ever worked for me too.",
  },
  {
    post: "threat-modeling",
    author: "ben",
    hoursAfter: 3,
    text: "Trusting a user ID from the request body. I have definitely shipped that bug before.",
  },
  {
    post: "threat-modeling",
    author: "ava",
    hoursAfter: 10,
    text: "We tried this on Friday and found two issues in an hour. Highly recommend.",
  },
  {
    post: "remote-teams",
    author: "lena",
    hoursAfter: 5,
    text: "The Friday shipped-and-blocked post is gold. We do the same.",
  },
  {
    post: "travel-camera",
    author: "ava",
    hoursAfter: 2,
    text: "Minimum shutter speed at 1/250 was the tip I needed. Thanks Daniel!",
  },
  {
    post: "meal-prep",
    author: "daniel",
    hoursAfter: 3,
    text: "Components instead of meals is such a simple shift. Trying it this Sunday.",
  },
  {
    post: "sessions-revoked",
    author: "ben",
    hoursAfter: 1,
    text: "We added exactly this last sprint. Took an afternoon, closed a real gap.",
  },
];

const follows = [
  ["ben", "ava"],
  ["priya", "ava"],
  ["lena", "ava"],
  ["daniel", "ava"],
  ["ava", "ben"],
  ["ava", "priya"],
  ["ava", "lena"],
  ["ava", "daniel"],
  ["ben", "lena"],
  ["lena", "ben"],
  ["priya", "ben"],
  ["sofia", "daniel"],
  ["daniel", "sofia"],
  ["marcus", "sofia"],
  ["sofia", "marcus"],
  ["priya", "marcus"],
  ["marcus", "ben"],
  ["lena", "priya"],
];

const likes = [
  ["ben", "calm-ui"],
  ["priya", "calm-ui"],
  ["lena", "calm-ui"],
  ["daniel", "calm-ui"],
  ["marcus", "calm-ui"],
  ["ava", "prisma-mongo"],
  ["priya", "prisma-mongo"],
  ["lena", "prisma-mongo"],
  ["ava", "realtime-chat"],
  ["daniel", "realtime-chat"],
  ["lena", "realtime-chat"],
  ["marcus", "notebook-habits"],
  ["ava", "notebook-habits"],
  ["ava", "dashboard-metrics"],
  ["ben", "dashboard-metrics"],
  ["sofia", "hills-trip"],
  ["ava", "hills-trip"],
  ["marcus", "hills-trip"],
  ["priya", "hills-trip"],
  ["marcus", "weeknight-pasta"],
  ["priya", "weeknight-pasta"],
  ["daniel", "weeknight-pasta"],
  ["ben", "strength-habit"],
  ["sofia", "strength-habit"],
  ["ben", "threat-modeling"],
  ["ava", "threat-modeling"],
  ["priya", "threat-modeling"],
  ["lena", "remote-teams"],
  ["ava", "travel-camera"],
  ["sofia", "travel-camera"],
  ["daniel", "meal-prep"],
  ["ben", "sessions-revoked"],
  ["ava", "sessions-revoked"],
];

const saves = [
  ["ava", "prisma-mongo"],
  ["ava", "threat-modeling"],
  ["ava", "hills-trip"],
  ["ben", "calm-ui"],
  ["priya", "realtime-chat"],
];

const conversations = [
  {
    between: ["ava", "ben"],
    messages: [
      { from: "ben", minutesAgo: 1500, text: "Hey Ava! Loved the calm interfaces post." },
      {
        from: "ava",
        minutesAgo: 1490,
        text: "Thank you! Your Prisma guide saved me a whole afternoon.",
      },
      {
        from: "ben",
        minutesAgo: 1485,
        text: "Ha, that missing-versus-null bug haunts everyone eventually.",
      },
      {
        from: "ava",
        minutesAgo: 95,
        text: "Are you free for a quick design review of the new chat screen tomorrow?",
      },
      { from: "ben", minutesAgo: 80, text: "Sure, 11am works. Send me the link 🙌" },
    ],
  },
  {
    between: ["ava", "lena"],
    messages: [
      {
        from: "lena",
        minutesAgo: 600,
        text: "Saw your comment on the threat modeling post. Want to run one for your team?",
      },
      { from: "ava", minutesAgo: 590, text: "Yes please! Next Friday afternoon?" },
      { from: "lena", minutesAgo: 30, text: "Booked. I'll bring the whiteboard markers." },
    ],
  },
  {
    between: ["ava", "priya"],
    messages: [
      {
        from: "priya",
        minutesAgo: 2400,
        text: "Your dashboard redesign looks amazing, by the way.",
      },
      {
        from: "ava",
        minutesAgo: 2390,
        text: "Only because you told us to cut it down to six metrics 😄",
      },
    ],
  },
  {
    between: ["daniel", "sofia"],
    messages: [
      { from: "sofia", minutesAgo: 700, text: "Which hut had that strudel?" },
      {
        from: "daniel",
        minutesAgo: 690,
        text: "Rifugio on the ridge, the second one. Go before noon, it sells out.",
      },
    ],
  },
];

module.exports = {
  DEMO_DOMAIN,
  users,
  posts,
  comments,
  follows,
  likes,
  saves,
  conversations,
};
