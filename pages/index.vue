<template>
  <div>
    <h1>こんにちは〜💁‍♂️</h1>
    <div id="auth"></div>
  </div>
</template>

<script>
import { defineComponent } from "@nuxtjs/composition-api";
import "firebase/compat/auth";
import "firebase/compat/firestore";
import { initializeApp } from "firebase/app";
import { getAuth, signInWithPopup, GoogleAuthProvider } from "firebase/auth";

export default defineComponent({
  name: "Index",
  setup() {
    const firebaseConfig = {
      apiKey: process.env.API_KEY,
      authDomain: process.env.AUTH_DOMAIN,
      projectId: process.env.PROJECT_ID,
      storageBucket: process.env.STORAGE_BUCKET,
      messagingSenderId: process.env.MESSAGING_SENDER_ID,
      appId: process.env.APP_ID,
      measurementId: process.env.MEASUREMENT_ID,
    };

    const app = initializeApp(firebaseConfig);

    const auth = getAuth();
    const provider = new GoogleAuthProvider();

    window.signIn = function () {
      signInWithPopup(auth, provider)
        .then((result) => {
          const credential = GoogleAuthProvider.credentialFromResult(result);
          const token = credential.accessToken;
          // The signed-in user info.
          const user = result.user;
          // ...
        })
        .catch((error) => {
          // Handle Errors here.
          const errorCode = error.code;
          const errorMessage = error.message;
          const email = error.email;
          const credential = GoogleAuthProvider.credentialFromError(error);
          // ...
        });
    };

    window.signOut = function () {
      auth.onAuthStateChanged((user) => {
        auth
          .signOut()
          .then(() => {
            location.reload();
          })
          .catch((error) => {
            console.log(`ログアウト時にエラーが発生しました (${error})`);
          });
      });
    };

    auth.onAuthStateChanged((user) => {
      if (user) {
        const signOutMessage = `
          <p>Hello, ${user.displayName}!<\/p>
          <button class="btn btn-primary" type="submit"  onClick="signOut()">サインアウト<\/button>
          `;
        document.getElementById("auth").innerHTML = signOutMessage;
      } else {
        const signInMessage = `
            <button class="btn btn-primary" type="submit"  onClick="signIn()">サインイン<\/button>
            `;
        document.getElementById("auth").innerHTML = signInMessage;
      }
    });
  },
});
</script>
