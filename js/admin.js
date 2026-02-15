function loadPage(page){

  const title = document.getElementById("pageTitle");
  const content = document.getElementById("adminContent");

  const pages = {

    home: {
      title: "Dashboard Admin",
      html: `<div class="card">Sistem berjalan normal</div>`
    },

    paket: {
      title: "Paket Soal",
      html: `
        <div class="card">
          <h3>Daftarkan Paket</h3>
          <input id="namaPaket" placeholder="paket1">
          <input id="urlSoal" placeholder="URL JSON GitHub">
          <button onclick="simpanPaket()">Simpan</button>
        </div>
        <div class="card">
          <h3>Paket Aktif</h3>
          <select id="paketAktif"></select>
          <button onclick="aktifkanPaket()">Aktifkan</button>
        </div>
      `
    },

    mapel: {
      title: "Mapel",
      html: `
        <div class="card">
          <label><input type="checkbox" id="ski"> SKI</label>
          <label><input type="checkbox" id="aqidah"> Aqidah</label>
          <button onclick="simpanMapel()">Simpan</button>
        </div>
      `
    },

    ujian: {
      title: "Pengaturan Ujian",
      html: `
        <div class="card">
          <label>Durasi (menit)</label>
          <input type="number" id="durasi" value="90">
          <button onclick="simpanDurasi()">Simpan</button>
        </div>
      `
    },

    peserta: {
      title: "Peserta",
      html: `<div id="pesertaList"></div>`
    },

    maintenance: {
      title: "Maintenance",
      html: `
        <div class="card">
          <button onclick="resetLeaderboard()">Reset Leaderboard</button>
        </div>
      `
    }

  };

  title.innerText = pages[page].title;
  content.innerHTML = pages[page].html;
}
