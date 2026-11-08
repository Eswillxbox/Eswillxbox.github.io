const fs = require("fs");

async function main() {
  const channelId = process.env.CHANNEL_ID;
  const discordToken = process.env.DISCORD_TOKEN;

  if (!channelId || !discordToken) {
    console.error("环境变量 CHANNEL_ID 或 DISCORD_TOKEN 缺失");
    process.exit(1);
  }

  const url = `https://discord.com/api/v10/channels/${channelId}/messages?limit=30`;
  const res = await fetch(url, {
    headers: { Authorization: `Bot ${discordToken}` }
  });

  // 接口返回非200时打印信息，直接写空数组
  if (!res.ok) {
    console.error(`接口请求失败，状态码：${res.status}`);
    fs.writeFileSync("docs/posts.json", JSON.stringify([], null, 2));
    return;
  }

  const data = await res.json();

  // 兜底判断：确认拿到的是数组才处理map
  const posts = Array.isArray(data)
    ? data.map(m => ({
        id: m.id,
        author: m.author?.username ?? "匿名",
        timestamp: m.timestamp,
        content: m.content || ""
      }))
    : [];

  fs.writeFileSync("docs/posts.json", JSON.stringify(posts, null, 2));
  console.log(`成功同步 ${posts.length} 条消息`);
}

main().catch(e => {
  console.error("脚本运行出错：", e);
  process.exit(1);
});
