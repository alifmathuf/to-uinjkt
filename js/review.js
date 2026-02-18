function loadReview(examId) {
  
  if (examId) {
    // Load specific exam
    database.ref(`exams/${user.id}/${examId}`).once("value")
      .then(snapshot => processExamData(snapshot.val(), examId));
  } else {
    // Load LAST exam by submittedAt
    database.ref(`exams/${user.id}`).once("value")
      .then(snapshot => {
        if(!snapshot.exists()) return;

        const exams = [];
        
        snapshot.forEach(child => {
          const examData = child.val();
          
          if (examData.submittedAt) {
            exams.push({
              key: child.key,
              ...examData
            });
          } else {
            Object.keys(examData).forEach(subKey => {
              const subData = examData[subKey];
              if (subData && subData.submittedAt) {
                exams.push({
                  key: `${child.key}/${subKey}`,
                  ...subData
                });
              }
            });
          }
        });

        if (exams.length === 0) {
          alert("Belum ada data ujian.");
          window.location.href = "dashboard.html";
          return;
        }

        // Sort by submittedAt descending
        exams.sort((a, b) => (b.submittedAt || 0) - (a.submittedAt || 0));
        
        const lastExam = exams[0];
        processExamData(lastExam, lastExam.key);
      });
  }
}

function processExamData(examData, examKey) {
  if(!examData) {
    alert("Data ujian tidak ditemukan.");
    return;
  }

  const jawaban = examData.answers || [];
  const mapel = examData.mapel;
  const paket = examData.paket;

  updatePageInfo(examData, examKey);

  fetch(`paket/${mapel}/${paket}.json`)
    .then(res => res.json())
    .then(soalData => {
      tampilkanReview(soalData.slice(0, jawaban.length), jawaban, examData);
    });
}
