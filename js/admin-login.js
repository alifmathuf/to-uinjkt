import { auth, db } from "./firebase-init.js";
import {
  signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

window.loginAdmin = async function () {
  const email = email.value;
  const password = password.value;
  const errorText = document.getElementById("error");

  try {
    const userCredential =
      await signInWithEmailAndPassword(auth, email, password);

    const uid = userCredential.user.uid;

    // cek role admin
    const adminRef = doc(db, "admins", uid);
    const adminSnap = await getDoc(adminRef);

    if (!adminSnap.exists()) {
      errorText.innerText = "Bukan akun admin!";
      return;
    }

    location.href = "admin.html";

  } catch (err) {
    errorText.innerText = "Login gagal!";
    console.log(err);
  }
};
