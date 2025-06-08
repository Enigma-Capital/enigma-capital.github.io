let chartInstance = null;

async function fetchData() {
  try {
    const res = await fetch('http://localhost:5000/api/data');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    updateDashboard(data);
  } catch (err) {
    console.error('🔥 fetch error:', err);
  }
}

function updateDashboard(data) {
  const rec = data.recommendation || data.current_recommendation;
  const perf = data.performance_data;

  if (rec) {
    document.getElementById('signal').textContent = rec.signal ?? '—';
    document.getElementById('reason').textContent = rec.reason ?? '—';
    document.getElementById('time').textContent = rec.time ? new Date(rec.time).toLocaleString() : '—';
  }

  if (perf) {
    document.getElementById('portfolio-value').textContent = perf.portfolio_value?.toFixed(2) ?? '—';
    document.getElementById('trades-count').textContent = perf.trades_count ?? '—';
    document.getElementById('position').textContent = perf.position ?? '—';
  }

  document.getElementById('last-updated').textContent = `last sync: ${new Date().toLocaleTimeString()}`;

  drawChart(data.chart_data ?? []);
  updateNews(data.news_data ?? []);
}

function updateNews(newsArray) {
  const feed = document.getElementById('news-feed');
  feed.innerHTML = '';
  newsArray.forEach(article => {
    const el = document.createElement('div');
    el.classList.add('news-article');
    el.innerHTML = `<strong>${article.title}</strong><br><small>${article.source} — ${new Date(article.timestamp).toLocaleString()}</small><p>${article.content}</p>`;
    feed.appendChild(el);
  });
}

function drawChart(chartData) {
  if (!chartData.length) return;

  const labels = chartData.map(d => new Date(d.timestamp).toLocaleTimeString());
  const prices = chartData.map(d => d.close);
  const sma = chartData.map(d => d.sma);
  const ema = chartData.map(d => d.ema);

  const ctx = document.getElementById('priceChart').getContext('2d');

  if (chartInstance) {
    chartInstance.destroy();
  }

  chartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [
        {
          label: 'Close Price',
          data: prices,
          borderColor: '#58a6ff',
          borderWidth: 2,
          tension: 0.2
        },
        {
          label: 'SMA',
          data: sma,
          borderColor: '#34d399',
          borderDash: [5, 5],
          borderWidth: 1
        },
        {
          label: 'EMA',
          data: ema,
          borderColor: '#facc15',
          borderDash: [2, 2],
          borderWidth: 1
        }
      ]
    },
    options: {
      responsive: true,
      scales: {
        x: {
          ticks: { color: '#aaa' }
        },
        y: {
          ticks: { color: '#aaa' }
        }
      },
      plugins: {
        legend: {
          labels: {
            color: '#ddd'
          }
        }
      }
    }
  });
}

fetchData();
setInterval(fetchData, 30_000);
