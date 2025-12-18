from flask import (
    Flask,
    render_template,
    session,
    request,
    jsonify,
    redirect,
    url_for,
    send_from_directory,
    Response,
    make_response,
)
import os
from datetime import datetime
from routes.auth import auth_bp
from supabase import create_client
from openai import OpenAI
import re
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
app.secret_key = os.environ.get("SECRET_KEY")

app.register_blueprint(auth_bp)
SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY")
supabase = create_client(SUPABASE_URL, SUPABASE_KEY)


@app.route("/")
def index():
    user = session.get("user")
    username = session.get("username")  # Add this line
    return render_template("index.html", user=user, username=username)


@app.route("/google3e8e0379edfd04f8.html")
def google_verification():
    return send_from_directory("static", "google3e8e0379edfd04f8.html")


@app.route("/robots.txt")
@app.route("/robots")
def robots():
    robots_txt = """User-agent: *
Allow: /
Disallow: /history
Disallow: /api/

Sitemap: https://pic-booth.vercel.app/sitemap.xml

Crawl-delay: 1"""
    return Response(robots_txt, mimetype="text/plain; charset=utf-8", status=200)


@app.route("/sitemap.xml")
@app.route("/sitemap")
def sitemap():
    # Get current timestamp in ISO format
    current_time = datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%S.000Z")

    pages = [
        "/",
        "/photobooth",
        "/picchat",
        "/chat",
        "/privacy-policy",
        "/login",
        "/signup",
    ]

    # Build URL entries
    url_entries = "".join(
        [
            f"  <url>\n    <loc>https://pic-booth.vercel.app{page}</loc>\n    <lastmod>{current_time}</lastmod>\n  </url>\n"
            for page in pages
        ]
    )

    sitemap_xml = f'<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n{url_entries}</urlset>'

    return Response(sitemap_xml, mimetype="text/xml; charset=utf-8", status=200)


@app.route("/privacy-policy")
def privacy_policy():
    user = session.get("user")
    return render_template("privacy-policy.html", user=user)


@app.route("/photobooth")
def photobooth():
    user = session.get("user")
    return render_template("photobooth.html", user=user)


@app.route("/save_photobooth", methods=["POST"])
def save_photobooth():
    user_id = session.get("user_id")
    user_email = session.get("user")
    if not user_id:
        return jsonify({"message": "Unauthorized"}), 401

    if "strip" not in request.files:
        return jsonify({"message": "No file uploaded"}), 400

    file = request.files["strip"]
    orientation = request.form.get("orientation", "horizontal")
    filename = f"{datetime.now().strftime('%Y%m%d_%H%M%S')}_{orientation}.png"

    bucket_name = "photobooth"
    safe_email = user_email.replace("@", "_").replace(".", "_")
    storage_path = f"{safe_email}/{filename}"

    file_bytes = file.read()

    supabase.storage.from_(bucket_name).upload(
        storage_path, file_bytes, {"content-type": file.content_type}
    )

    image_url = supabase.storage.from_(bucket_name).get_public_url(storage_path)

    supabase.table("photo_strips").insert(
        {"user_id": user_id, "image_url": image_url, "orientation": orientation}
    ).execute()

    return jsonify({"message": "Photo strip saved!"})


@app.route("/pic_chat", methods=["POST"])
def pic_chat():
    user = session.get("user")
    if not user:
        return jsonify({"message": "Unauthorized"}), 401

    data = request.get_json()
    image_base64 = data.get("image_base64")
    user_message = data.get("user_message", "What emotion do I look like?")

    if not image_base64:
        return jsonify({"message": "No image provided"}), 400

    client = OpenAI(
        base_url="https://api.studio.nebius.com/v1/",
        api_key=os.environ.get("NEBIUS_API_KEY"),
    )

    response = client.chat.completions.create(
        model="Qwen/Qwen2-VL-72B-Instruct",
        messages=[
            {
                "role": "system",
                "content": (
                    "You are a helpful assistant with vision. "
                    "If the image contains a person, give a breef description of their emotion"
                    "If the image does not contain a person, give details of the object or whats in image."
                ),
            },
            {
                "role": "user",
                "content": [
                    {"type": "text", "text": user_message},
                    {
                        "type": "image_url",
                        "image_url": {"url": f"data:image/png;base64,{image_base64}"},
                    },
                ],
            },
        ],
    )

    reply = response.choices[0].message.content if response.choices else "No response."
    return jsonify({"reply": reply})


@app.route("/pic-chat")
def picchat():
    user = session.get("user")
    if not user:
        return redirect(url_for("auth.login"))
    return render_template("picchat.html")


@app.route("/chat")
def chat():
    user = session.get("user")
    if not user:
        return redirect(url_for("auth.login"))
    return render_template("chat.html")


@app.route("/chat_api", methods=["POST"])
def chat_api():
    user = session.get("user")
    if not user:
        return jsonify({"message": "Unauthorized"}), 401

    data = request.get_json()
    history = data.get("history", [])
    user_message = data.get("user_message", "")

    # If user_message is provided, append it to history
    if user_message:
        history = history + [{"role": "user", "content": user_message}]

    client = OpenAI(
        base_url="https://api.studio.nebius.com/v1/",
        api_key=os.environ.get("NEBIUS_API_KEY"),
    )

    response = client.chat.completions.create(
        model="Qwen/Qwen3-30B-A3B", messages=history
    )
    content = (
        response.choices[0].message.content if response.choices else "No response."
    )

    # Extract <think>...</think> and reply
    think_match = re.search(r"<think>(.*?)</think>", content, re.DOTALL)
    think = think_match.group(1).strip() if think_match else ""
    reply = re.sub(r"<think>.*?</think>", "", content, flags=re.DOTALL).strip()

    return jsonify({"reply": reply, "thinking": think})


@app.route("/history")
def history():
    user_id = session.get("user_id")
    if not user_id:
        return redirect(url_for("auth.login"))
    # Fetch all photo strips for this user, newest first
    result = (
        supabase.table("photo_strips")
        .select("image_url, orientation, created_at")
        .eq("user_id", user_id)
        .order("created_at", desc=True)
        .execute()
    )
    photos = result.data or []
    return render_template("history.html", photos=photos)


@app.route("/delete_photo", methods=["POST"])
def delete_photo():
    user_id = session.get("user_id")
    if not user_id:
        return jsonify({"success": False, "error": "Not logged in"}), 401

    image_url = request.json.get("image_url")
    if not image_url:
        return jsonify({"success": False, "error": "No image URL provided"}), 400

    # Extract the storage path from the public URL
    # Example: .../object/public/photobooth/mani_gmail_com/filename.png
    try:
        path_start = image_url.index("/photobooth/")
        storage_path = image_url[path_start + 1 :]  # remove leading slash
    except ValueError:
        return jsonify({"success": False, "error": "Invalid image URL"}), 400

    # Delete from Supabase Storage
    supabase.storage.from_("photobooth").remove([storage_path])

    # Optionally, delete from photo_strips table
    supabase.table("photo_strips").delete().eq("image_url", image_url).eq(
        "user_id", user_id
    ).execute()

    return jsonify({"success": True})


if __name__ == "__main__":
    app.run(debug=True)
