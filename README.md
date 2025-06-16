# 📸 PicBooth

**Pixel-perfect emotional AI.**  
A fun and expressive web app where users can take photobooth-style pictures, analyze their emotions using AI, and chat based on detected moods. Built for the [HACK THE VIBE Hackathon](https://www.techhorizonsclub.com/).

[🎥 Watch Demo Video](https://youtube.com/shorts/o4AtwqidDtQ)

## 🌟 Features

- 📸 **Photobooth** – Capture a 3-photo strip with 3-second intervals.
- 🧠 **Emotion Analyzer** – AI detects your mood based on facial expressions.
- 💬 **AI Chat** – Chatbot changes tone based on your emotional state.
- 🔐 **Privacy-First** – Save photos to your own gallery, or download locally.
- 🎮 **Retro Pixel UI** – Inspired by Japanese Purikura + retro gaming vibes.
- ⚡ **Fast & Responsive** – Works across all devices.

## 🚀 Live Demo

👉 [https://pic-booth.vercel.app](https://pic-booth.vercel.app)

## 🛠️ Tech Stack

- **Frontend:** HTML, Tailwind CSS, JavaScript
- **Backend:** Flask (Python)
- **AI/ML:** Emotion Detection Model (Vision), GPT-based Chat
- **Database:** Supabase
- **Deployment:** Vercel

---

## 💻 Local Setup Instructions

Want to run PicBooth locally? Here's how:

### ⚙️ Prerequisites

- Python 3.8+
- pip
- Git

### 📦 Clone the Repo

```bash
git clone https://github.com/mani-1509/PicBooth
cd picbooth
```

### 🧪 Create & Activate Virtual Environment

```bash
python -m venv venv
source venv/bin/activate  # For Windows: venv\Scripts\activate
```

### 📥 Install Dependencies

```bash
pip install -r requirements.txt
```

### ⚙️ Setup Environment Variables

Create a `.env` file in the root directory and add:

```env
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_api_key
SECRET_KEY=your_flask_secret_key
NEBIUS_API_KEY=your_nebius_api_key
```

> If you're using image/video processing or face recognition, also install required system libraries like `opencv-python`, `face_recognition`, etc.

### 🚀 Run the App

```bash
flask run
```

Visit: [http://127.0.0.1:5000](http://127.0.0.1:5000)

---

## 💡 Inspiration

We wanted to build something that feels nostalgic, fun, and deeply personal — something that combines emotions, AI, and creativity. Inspired by Japanese Purikura booths, but powered by modern AI.

## 📚 How It Works

1. **Sign Up / Log In** to access personalized features.
2. **Launch the Photobooth** and capture your photo strip.
3. **AI analyzes your face** and detects the emotion.
4. **Chatbot opens up** a conversation based on your mood.
5. **Choose to download or save** the strip in your gallery.

## 🔒 Privacy

Photos are stored only if you choose to save them. Nothing gets uploaded automatically. You own your data.

## 🧑‍💻 Contributing

1. Fork the repo
2. Clone it: `git clone https://github.com/mani-1509/PicBooth`
3. Install dependencies
4. Run the Flask app
5. Create a PR!

## 📄 License

MIT License

## ✨ Built By

👤 **[@Mani1509](https://github.com/mani-1509)**  
🎓 Featured in Times of India | Winner @ Nosu AI Hackathon  
🚀 [LinkedIn](https://www.linkedin.com/in/sharvan-gajula) | [Devpost](https://devpost.com/software/picbooth)
