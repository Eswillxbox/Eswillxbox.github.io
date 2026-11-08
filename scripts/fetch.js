const fs = require("fs");
async function main() {
  const res = await fetch(
    `https://discord.com/api/v10/channels/${process.env.CHANNEL_ID}/messages?limit=50`,
    { headers: { Authorization: `Bot ${process.env.DISCORD_TOKEN}` } }
  );
  const msgs = await res.json();
  const posts = msgs.map(m => ({
    id: m.id,
    author: m.author.username,
    time: m.timestamp,
    content: m.content
  }));
  fs.writeFileSync("docs/posts.json", JSON.stringify(posts, null, 2));
}
main();
