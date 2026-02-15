// avatar generator
const avatar = document.getElementById("avatar");
avatar.innerText = "A";

// upload JSON
document.getElementById("uploadBtn").onclick = () => {
  const file = document.getElementById("fileInput").files[0];

  if(!file){
    alert("Pilih file JSON dulu");
    return;
  }

  if(file.type !== "application/json"){
    alert("File harus format JSON");
    return;
  }

  alert("File siap diupload ke GitHub (next step)");
};
