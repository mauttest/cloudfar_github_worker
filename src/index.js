export default {
  async fetch(request) {
    const { searchParams } = new URL(request.url);
    const raw_url = searchParams.get("url");

    if (!raw_url) {
      return new Response("❌ Missing URL parameter", { status: 400 });
    }

    const [video_url, quality] = raw_url.split("=");

    const api_url = "https://api.easydownloader.app/api-extract/";
    const body = JSON.stringify({
      video_url,
      pagination: false,
      key: "175p86550h7m5r3dsiesninx194"
    });

    try {
      const apiRes = await fetch(api_url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body
      });

      const data = await apiRes.json();

      if (data.status !== "success") {
        return new Response("❌ Failed to extract", { status: 400 });
      }

      const video = data.final_urls[0];
      const links = video.links;
      const title = video.title || "Unknown";
      const thumbnail = video.thumbnail || "N/A";

      if (quality) {
        const match = links.find(x => x.quality.includes(quality));
        if (match) {
          return Response.redirect(match.url, 302);
        } else {
          return new Response(`❌ Quality ${quality} not found`, { status: 404 });
        }
      }

      let text = `✅ Title: ${title}\n🖼️ Thumbnail: ${thumbnail}\n\n🎬 Direct Downloadable Links:\n\n`;

      for (const link of links) {
        text += `• ${link.quality} (${link.ext}) → ${link.url}\n`;
      }

      return new Response(text, { headers: { "Content-Type": "text/plain" } });

    } catch (err) {
      return new Response("❌ Internal Error: " + err.message, { status: 500 });
    }
  }
};
