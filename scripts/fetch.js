const fs = require('fs');
const path = require('path');

// 读取和Workflow里完全匹配的环境变量
const CHANNEL_ID = process.env.CHANNEL_ID;
const BOT_TOKEN = process.env.DISCORD_TOKEN;

if (!CHANNEL_ID || !BOT_TOKEN) {
  console.error("❌ 环境变量缺失，请检查Workflow环境映射");
  process.exit(1);
}

async function fetchDiscordMessages() {
  try {
    const res = await fetch(`https://discord.com/api/v10/channels/${CHANNEL_ID}/messages?limit=100`, {
      headers: { Authorization: `Bot ${BOT_TOKEN}` }
    });

    if (!res.ok) throw new Error(`API请求失败: ${res.status}`);
    const data = await res.json();
    console.log(`ℹ️ 接口原始返回消息数：${Array.isArray(data) ? data.length : "非数组格式"}`);

    const posts = Array.isArray(data)
      ? data.map(m => {
          let fullContent = m.content || "";

          // 第一步：适配图片附件
          if (Array.isArray(m.attachments) && m.attachments.length > 0) {
            m.attachments.forEach(att => {
              if (att.width && att.height) {
                fullContent += `\n`;
}
});
}

      // 第二步：兜底Embed空内容
      if (!fullContent && Array.isArray(m.embeds) && m.embeds.length > 0) {
        fullContent += m.embeds.map(e => e.description || e.title || '').join('\n');
      }

      // 第三步：适配普通自定义静态表情包
      fullContent = fullContent.replace(/<:([a-zA-Z0-9_]+):(\d+)>/g, (_, name, id) => {
        return ``;
});

      // 第四步：适配动态GIF表情包
      fullContent = fullContent.replace(/<a:([a-zA-Z0-9_]+):(\d+)>/g, (_, name, id) => {
        return ``;
});
      console.log(`✅ 处理消息ID ${m.id}，内容长度：${fullContent.length}`);
      return {
        id: m.id,
        author: m.author?.username ?? "匿名用户",
        timestamp: m.timestamp,
        content: fullContent
      };
    })
  : [];

const outputPath = path.join(process.cwd(), 'docs', 'posts.json');
fs.writeFileSync(outputPath, JSON.stringify(posts, null, 2), 'utf8');
console.log(`🎉 同步完成，共写入 ${posts.length} 条完整消息`);


} catch (err) {
console.error('❌ 同步执行失败:', err);
process.exit(1);
}
}

fetchDiscordMessages();




