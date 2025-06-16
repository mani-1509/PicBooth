document.querySelectorAll(".remove-btn").forEach((btn) => {
  btn.onclick = async function () {
    if (!confirm("Are you sure you want to delete this photo?")) return;
    const imageUrl = btn.getAttribute("data-url");
    const res = await fetch("/delete_photo", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ image_url: imageUrl }),
    });
    const data = await res.json();
    if (data.success) {
      btn.closest(".photo-card").remove();
    } else {
      alert("Failed to delete: " + (data.error || "Unknown error"));
    }
  };
});
