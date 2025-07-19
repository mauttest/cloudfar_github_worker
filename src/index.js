export default {
  async fetch(request) {
    const { searchParams } = new URL(request.url);
    const videoUrl = searchParams.get("url");

    if (!videoUrl) {
      return new Response("❌ Provide a valid ?url=", { status: 400 });
    }

    try {
      const res = await fetch(videoUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0',
        }
      });
      const html = await res.text();

      // Properly decode HTML entities
      const decode = (str) => new TextDecoder("utf-8").decode(new Uint8Array([...str].map(c => c.charCodeAt(0))));

      const titleMatch = html.match(/<title>(.*?)<\/title>/);
      const rawTitle = titleMatch?.[1] || 'N/A';
      const title = decode(rawTitle.replace(/&[^;]+;/g, '')).trim();

      const thumbnailMatch = html.match(/poster="([^"]+)"/);
      const thumbnail = thumbnailMatch?.[1] || 'N/A';

      const qualities = {};
      const regex = /"videoUrl":"(https:[^"]+\.mp4)","quality":"(\d+)"/g;
      let match;

      while ((match = regex.exec(html)) !== null) {
        const videoLink = decodeURIComponent(match[1]);
        const quality = match[2];
        qualities[quality] = videoLink;
      }

      let output = `✅ Title: ${title}\n`;
      output += `🖼️ Thumbnail: ${thumbnail}\n\n🎬 Direct Downloadable Links:\n`;

      if (Object.keys(qualities).length === 0) {
        output += `❌ No video links found.\n`;
      } else {
        for (const [q, l] of Object.entries(qualities)) {
          output += `• ${q}p → ${l}\n`;
        }
      }

      return new Response(output, {
        headers: { "Content-Type": "text/plain; charset=utf-8" }
      });

    } catch (err) {
      return new Response(`❌ Error: ${err.message}`, { status: 500 });
    }
  }
}
