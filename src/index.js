export default {
  async fetch(request) {
    const { searchParams } = new URL(request.url);
    const video_url = searchParams.get("url");

    if (!video_url) {
      return new Response("❌ Missing URL parameter", { status: 400 });
    }

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

      const best = links.find(link => link.link_url.includes(".mp4") && !link.link_url.includes(".m3u8"));

      if (!best) {
        return new Response("❌ No MP4 link found", { status: 404 });
      }

      return Response.redirect(best.link_url, 302);

    } catch (e) {
      return new Response(`⚠️ Error: ${e.message}`, { status: 500 });
    }
  }
};
