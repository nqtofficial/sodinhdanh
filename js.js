  document.addEventListener("DOMContentLoaded", function () {
    const API_URL = "https://script.google.com/macros/s/AKfycbz97N3WdNTsyFVPUJOxjSc0S373m-swMbprwhTr_RhzIqeH4B9JMk_YFQupDZQyGwMx/exec"; // ⚠️ THAY BẰNG LINK CỦA BẠN
    let currentUser = null, currentRole = null;

    async function apiCall(data) {
      try {
        const res = await fetch(API_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data)
        });
        return await res.json();
      } catch (e) {
        alert("Lỗi kết nối đến hệ thống.");
        return { status: "fail" };
      }
    }

    window.login = async function () {
      const username = document.getElementById("username").value.trim();
      const password = document.getElementById("password").value.trim();
      const res = await apiCall({ action: "login", username, password });
      if (res.status === "success") {
        currentUser = res.username;
        currentRole = res.role;
        document.getElementById("userInfo").innerText = `👤 ${currentUser} | 💰 ${res.coin} coin`;
        document.getElementById("loginSection").classList.add("hidden");
        document.getElementById("mainSection").classList.remove("hidden");
        if (res.maintenance && currentRole !== "admin") {
          alert("🛠 Hệ thống đang bảo trì.");
          location.reload();
          return;
        }
        if (currentRole !== "admin") document.getElementById("panelAdmin").style.display = "none";
      } else {
        document.getElementById("loginMessage").innerText = res.message || "Đăng nhập thất bại";
      }
    };

    window.switchTab = function (tab) {
      document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
      document.querySelectorAll(".panel").forEach(p => p.classList.remove("active"));
      document.querySelector(`.tab[onclick="switchTab('${tab}')"]`).classList.add("active");
      document.getElementById("panel" + tab.charAt(0).toUpperCase() + tab.slice(1)).classList.add("active");
    };

    window.generateID = async function () {
      const address = document.getElementById("address").value.trim();
      const quantity = parseInt(document.getElementById("quantity").value);
      const res = await apiCall({ action: "generateID", username: currentUser, address, quantity });
      const table = document.getElementById("resultTable");
      table.innerHTML = "";
      if (res.status === "success") {
        res.results.forEach(r => {
          const tr = document.createElement("tr");
          tr.innerHTML = `<td>${r.name}</td><td>${r.id}</td><td><button onclick="navigator.clipboard.writeText('${r.name} - ${r.id}')">📋</button></td>`;
          table.appendChild(tr);
        });
        document.getElementById("coinWarning").innerText = "";
      } else {
        document.getElementById("coinWarning").innerText = res.message;
      }
    };

    window.downloadHistory = async function () {
      const res = await apiCall({ action: "getHistory", username: currentUser });
      const blob = new Blob([res.join("\n")], { type: "text/plain" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "lich_su_dinh_danh.txt";
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
    };

    window.clearHistory = async function () {
      if (confirm("Xoá toàn bộ lịch sử?")) {
        await apiCall({ action: "clearHistory", username: currentUser });
        alert("✅ Đã xóa.");
      }
    };

    window.createUser = async function () {
      const username = document.getElementById("newUser").value;
      const password = document.getElementById("newPass").value;
      const coin = parseInt(document.getElementById("newCoin").value);
      const res = await apiCall({ action: "createUser", username, password, coin });
      alert(res.status === "success" ? "✅ Đã tạo" : "❌ " + res.message);
    };

    window.deleteUser = async function () {
      const username = document.getElementById("targetUser").value;
      const res = await apiCall({ action: "deleteUser", username });
      alert(res.status === "success" ? "✅ Đã xóa" : "❌ Không tìm thấy");
    };

    window.topup = async function () {
      const username = document.getElementById("targetUser").value;
      const coin = parseInt(document.getElementById("topupCoin").value);
      const res = await apiCall({ action: "topupCoin", username, coin });
      alert(res.status === "success" ? "✅ Đã nạp" : "❌ Không tìm thấy tài khoản");
    };

    window.broadcast = async function () {
      const message = document.getElementById("broadcastMsg").value;
      if (!message) return;
      const res = await apiCall({ action: "broadcast", message });
      if (res.status === "success") alert("📢 Đã gửi thông báo");
    };

    // Chặn chuột phải, F12, Ctrl+U
    document.addEventListener("keydown", function(e) {
      if (e.key === "F12" || (e.ctrlKey && e.key.toLowerCase() === "u") || (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === "i")) {
        e.preventDefault(); alert("🔒 Mã nguồn đã bảo vệ!");
      }
});
