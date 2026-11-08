const fs = require('fs');
const path = require('path');

// 从环境变量读取Discord配置
const CHANNEL_ID = process.env.CHANNEL_ID;
const BOT_TOKEN = process.env.DISCORD_TOKEN;

async function fetchDiscordMessages() {
  try {
    // 请求Discord API拉取频道消息
    const res = await fetch(`https://discord.com/api/v10/channels/${CHANNEL_ID}/messages?limit=100`, {
      headers: { Authorization: `Bot ${BOT_TOKEN}` }
    });

    if (!res.ok) throw new Error(`API请求失败: ${res.status}`);
    const data = await res.json();

    // 处理消息，兜底空内容+自动拼接图片
    const posts = Array.isArray(data)
      ? data.map(m => {
          let fullContent = m.content || "";
          // 自动把图片附件转成Markdown格式
          if (Array.isArray(m.attachments) && m.attachments.length > 0) {
            m.attachments.forEach(att => {
              if (att.width && att.height) {
                fullContent += `\n![${att.name || '图片'}](${att.url})\n`;
              }
            });
          }
          // 兜底纯Embed无文字的消息
          if (!fullContent && Array.isArray(m.embeds) && m.embeds.length > 0) {
            fullContent = m.embeds.map(e => e.description || e.title || '').join('\n');
          }
          // 返回完整结构化数据
          return {
            id: m.id,
            author: m.author?.username ?? "匿名用户",
            timestamp: m.timestamp,
            content: fullContent
          };
        })
      : [];

    // 写入到docs目录下的posts.json
    const outputPath = path.join(process.cwd(), 'docs', 'posts.json');
    fs.writeFileSync(outputPath, JSON.stringify(posts, null, 2), 'utf8');
    console.log(`✅ 同步完成，共写入 ${posts.length} 条消息`);
  } catch (err) {
    console.error('❌ 同步失败:', err);
    process.exit(1);
  }
}

fetchDiscordMessages();
