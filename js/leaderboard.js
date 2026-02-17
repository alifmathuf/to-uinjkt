document.addEventListener("DOMContentLoaded", () => {

  const tbody = document.getElementById("leaderboardBody");
  const filterMapel = document.getElementById("filterMapel");
  const filterPaket = document.getElementById("filterPaket");

  if (!tbody) return;

  let allData = {};
  let currentMapel = "all";
  let currentPaket = "all";

  if (typeof firebase === "undefined") {
    tbody.innerHTML = `
      <tr>
        <td colspan="4" style="text-align:center;">
          Firebase belum terhubung.
        </td>
      </tr>
    `;
    return;
  }

  loadData();

  function loadData() {
    firebase.database()
      .ref("leaderboard")
      .once("value")
      .then(snapshot => {

        if (!snapshot.exists()) {
          tbody.innerHTML = `
            <tr>
              <td colspan="4" style="text-align:center;">
                Belum ada data.
              </td>
            </tr>
          `;
          return;
        }

        allData = snapshot.val();
        
        // Parse mapel dan paket dari key (contoh: "Aqidah_paket1")
        populateFilters();
        renderLeaderboard();

      })
      .catch(err => {
        console.log("Leaderboard error:", err);
        tbody.innerHTML = `
          <tr>
            <td colspan="4" style="text-align:center;">
              Error mengambil data.
            </td>
          </tr>
        `;
      });
  }

  // Parse key seperti "Aqidah_paket1" jadi mapel dan paket
  function parseKey(key) {
    const parts = key.split('_');
    return {
      mapel: parts[0],
      paket: parts.slice(1).join('_') || 'default'
    };
  }

  // Populate filter dari keys
  function populateFilters() {
    const mapels = new Set();
    const pakets = new Set();
    
    Object.keys(allData).forEach(key => {
      const parsed = parseKey(key);
      mapels.add(parsed.mapel);
      pakets.add(parsed.paket);
    });

    // Isi dropdown mapel
    filterMapel.innerHTML = '<option value="all">Semua Mapel</option>';
    Array.from(mapels).sort().forEach(mapel => {
      const option = document.createElement("option");
      option.value = mapel;
      option.textContent = mapel;
      filterMapel.appendChild(option);
    });

    // Isi dropdown paket
    populatePaketDropdown(Array.from(pakets).sort());
  }

  function populatePaketDropdown(paketList) {
    filterPaket.innerHTML = '<option value="all">Semua Paket</option>';
    paketList.forEach(paket => {
      const option = document.createElement("option");
      option.value = paket;
      option.textContent = paket;
      filterPaket.appendChild(option);
    });
  }

  // Update paket dropdown saat mapel dipilih
  function updatePaketFilter() {
    const selectedMapel = filterMapel.value;
    
    if (selectedMapel === "all") {
      // Tampilkan semua paket
      const allPakets = new Set();
      Object.keys(allData).forEach(key => {
        allPakets.add(parseKey(key).paket);
      });
      populatePaketDropdown(Array.from(allPakets).sort());
    } else {
      // Filter paket berdasarkan mapel
      const filteredPakets = new Set();
      Object.keys(allData).forEach(key => {
        const parsed = parseKey(key);
        if (parsed.mapel === selectedMapel) {
          filteredPakets.add(parsed.paket);
        }
      });
      populatePaketDropdown(Array.from(filteredPakets).sort());
    }
    
    filterPaket.value = "all";
    currentPaket = "all";
  }

  function renderLeaderboard() {
    let leaderboard = [];

    Object.keys(allData).forEach(key => {
      const parsed = parseKey(key);
      
      // Filter mapel
      if (currentMapel !== "all" && parsed.mapel !== currentMapel) return;
      
      // Filter paket
      if (currentPaket !== "all" && parsed.paket !== currentPaket) return;
      
      const users = allData[key];
      
      Object.keys(users).forEach(userId => {
        const item = users[userId];
        
        leaderboard.push({
          nama: item.nama || "-",
          kelas: item.kelas || "-",
          mapel: parsed.mapel,
          paket: parsed.paket,
          score: item.score || 0
        });
      });
    });

    leaderboard.sort((a, b) => b.score - a.score);

    tbody.innerHTML = "";

    if (leaderboard.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="4" style="text-align:center;">
            Tidak ada data untuk filter ini.
          </td>
        </tr>
      `;
      return;
    }

    leaderboard.slice(0, 10).forEach((item, index) => {
      let medal =
        index === 0 ? "🥇"
        : index === 1 ? "🥈"
        : index === 2 ? "🥉"
        : index + 1;

      tbody.innerHTML += `
        <tr>
          <td>${medal}</td>
          <td>${item.nama}</td>
          <td>${item.mapel}${currentPaket === 'all' ? ' - ' + item.paket : ''}</td>
          <td>${item.score}</td>
        </tr>
      `;
    });
  }

    window.filterLeaderboard = function(event) {  // ⬅️ Tambah (event)
    const target = event.target;
    
    if (target === filterMapel) {
      currentMapel = filterMapel.value;
      updatePaketFilter();
    } else if (target === filterPaket) {
      currentPaket = filterPaket.value;
    }
    
    renderLeaderboard();
  };

  window.refreshData = function() {
    loadData();
  };

});
