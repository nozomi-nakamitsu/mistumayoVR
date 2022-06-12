<template>
  <div class="index-container">
    <h1>VR VIDEO</h1>
    <div class="button-panel">
      <div id="auth"></div>
    </div>
  </div>
</template>

<script>
import { defineComponent, useRouter } from "@nuxtjs/composition-api";
import "firebase/compat/auth";
import "firebase/compat/firestore";
import { initializeApp } from "firebase/app";
import { getAuth, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { ROOM_ROUTES } from "@/config/routes.ts";
import { getFirestore, collection, addDoc } from "firebase/firestore";

export default defineComponent({
  name: "Index",
  setup() {
    const router = useRouter();
    // TODO: 共通化する
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
    const db = getFirestore(app);
    const auth = getAuth();
    const provider = new GoogleAuthProvider();

    window.signIn = function () {
      signInWithPopup(auth, provider)
        .then((result) => {
          const credential = GoogleAuthProvider.credentialFromResult(result);
          const token = credential.accessToken;
          const user = result.user;
          router.push(ROOM_ROUTES.index.path);
        })
        .catch((error) => {
          const errorCode = error.code;
          const errorMessage = error.message;
          const email = error.email;
          const credential = GoogleAuthProvider.credentialFromError(error);
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

    auth.onAuthStateChanged(async (user) => {
      if (user) {
        // NOTE: ログインユーザーの名前は仮置き
        const signOutMessage = `
          <p>Hello, ${user.displayName}!<\/p>
          <button class="button" type="submit"  onClick="signOut()">SIGN OUT<\/button>
          `;
        document.getElementById("auth").innerHTML = signOutMessage;

        try {
          const docRef = await addDoc(collection(db, "users"), {
            uid: user.uid,
            name: user.displayName,
            icon: user.photoURL,
          });
          console.log(docRef, "できたっぽい");
        } catch (e) {
          console.error(e);
        }

        router.push(ROOM_ROUTES.create.path);
      } else {
        const signInMessage = `
            <button class="button" type="submit"  onClick="signIn()">SIGN IN WITH GOOGLE<\/button>
            `;
        document.getElementById("auth").innerHTML = signInMessage;
      }
    });
  },
});
</script>

<style lang="scss">
.index-container {
  background: #fafafa;
  margin: 15em auto;
  padding: 4em;
  max-width: 370px;

  > h1 {
    text-align: center;
    padding: 1em 0;
    font-size: 1.5em;
  }

  > form {
    padding: 0 1.5em;
  }

  .form-item {
    margin-bottom: 0.75em;
    width: 100%;
  }

  .form-item input {
    background: #fafafa;
    border: none;
    border-bottom: 2px solid #e9e9e9;
    color: #666;
    font-family: "Open Sans", sans-serif;
    font-size: 1em;
    height: 50px;
    transition: border-color 0.3s;
    width: 100%;
  }

  .form-item input:focus {
    border-bottom: 2px solid #c0c0c0;
    outline: none;
  }

  .button-panel {
    margin: 2em 0 0;
    width: 100%;
  }

  .button-panel .button {
    background: #f16272;
    border: none;
    color: #fff;
    cursor: pointer;
    height: 50px;
    font-family: "Open Sans", sans-serif;
    font-size: 1em;
    letter-spacing: 0.05em;
    text-align: center;
    text-transform: uppercase;
    transition: background 0.3s ease-in-out;
    width: 100%;
  }

  .button:hover {
    background: #ee3e52;
  }
}
</style>
