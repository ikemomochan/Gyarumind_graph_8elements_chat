document.addEventListener("DOMContentLoaded", () => {
  const chatArea = document.getElementById("chat-area");
  const form = document.getElementById("chat-form");
  const input = document.getElementById("message");
  const galImg = document.getElementById("gal-img");

  function addBubble(text, sender = "user") {
    const bubble = document.createElement("div");
    bubble.className = `bubble ${sender}`;
    bubble.innerText = text;
    chatArea.appendChild(bubble);
    chatArea.scrollTop = chatArea.scrollHeight;
  }

  function setThinking(thinking = true) {
    galImg.src = thinking
      ? "/static/gal_thinking.png"
      : "/static/gal_sample.png";
  }

  // ギャルマイン度表示用
  function updateGyarumind(score) {
    const gmEl = document.getElementById("gm-score");
    gmEl.textContent = score ?? "--";
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const text = input.value.trim();
    if (!text) return;

    addBubble(text, "user");
    input.value = "";
    input.focus();

    const loader = "……🤔";
    const loadingBubble = document.createElement("div");
    loadingBubble.className = "bubble gal";
    loadingBubble.innerText = loader;
    chatArea.appendChild(loadingBubble);
    chatArea.scrollTop = chatArea.scrollHeight;
    setThinking(true);

    try {
      const res = await fetch("/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });
      const data = await res.json();
      loadingBubble.remove();
      addBubble(data.answer, "gal");

      // ギャルマイン度が返ってきたら表示を更新
      if (data.gyarumind !== undefined && data.gyarumind !== null) {
        updateGyarumind(data.gyarumind);
        updateChart(data.score_history);    // ← グラフ更新
      }
    } catch (err) {
      loadingBubble.remove();
      addBubble("通信エラーだよ💦", "gal");
    } finally {
      setThinking(false);
    }
  });
});

let gmChart = null;

function updateChart(scoreHistory) {
  console.log("グラフ用データ:", scoreHistory);  // ← ここ！
  const ctx = document.getElementById("gm-chart").getContext("2d");

  // 初回 or 更新のたびにグラフを破棄して描き直す
  if (gmChart) {
    gmChart.destroy();
  }

  gmChart = new Chart(ctx, {
    type: "line",
    data: {
      labels: scoreHistory.map((_, i) => `#${(i + 1) * 5}`),
      datasets: [{
        label: "ギャルマイン度📈",
        data: scoreHistory,
        borderColor: "#e91e63",
        backgroundColor: "#ffeef5",
        tension: 0.3,
        pointRadius: 5,
      }]
    },
    options: {
      scales: {
        y: {
          min: 0,
          max: 50
        }
      },
      responsive: true,
      plugins: {
        legend: { display: false }
      }
    }
  });
}
