<template>
  <div class="index-container">
    <div class="form">
      <h1>Welcome !</h1>
      <div class="lead">Please login with Google</div>
      <div class="button-panel">
        <div id="auth"></div>
      </div>
      <div class="footer">
        By clicking “Continue” above, you acknowledge that you have read and
        understood, and agree to SpatialChat’s Privacy Policy and Terms of
        Service.
      </div>
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
        // TODO: ヘッダーの作成をしたらログインユーザ名は不要
        const signOutMessage = `
          <p>Hello, ${user.displayName}!<\/p>
          <button class="button" type="submit"  onClick="signOut()">Sign out<\/button>
          `;
        document.getElementById("auth").innerHTML = signOutMessage;

        try {
          const docRef = await addDoc(collection(db, "users"), {
            uid: user.uid,
            name: user.displayName,
            icon: user.photoURL,
          });
        } catch (e) {
          console.error(e);
        }

        router.push(ROOM_ROUTES.create.path);
      } else {
        const signInMessage = `
            <button class="button" type="submit"  onClick="signIn()">Continue<\/button>
            `;
        document.getElementById("auth").innerHTML = signInMessage;
      }
    });
  },
});
</script>

<style lang="scss">
.index-container {
  position: relative;
  padding-top: 300px;
  background: url("/resource/background-img.jpg");
  background-position: center;
  background-size: cover;
  width: 100%;
  height: 100vh;

  > h1 {
    text-align: center;
    padding: 1em 0;
    font-size: 1.5em;
  }

  > .form {
    margin: auto;
    max-width: 370px;
    text-align: center;
    display: flex;
    flex-direction: column;
    background: #fff;
    padding: 60px;
    border-radius: 24px;
  }

  > .form > .lead {
    color: rgba(5, 5, 41, 0.45);
    margin-top: 8px;
    flex-shrink: 0;
  }

  .form-item {
    margin-bottom: 0.75em;
    width: 100%;
  }

  .button-panel {
    margin: 2em 0 0;
    width: 100%;
  }

  > .form > .button-panel .button {
    background-color: #5727e7;
    border: 1px solid transparent;
    color: #fff;
    cursor: pointer;
    height: 50px;
    border-radius: 23px;
    padding: 0 23px;
    font-size: 1em;
    letter-spacing: 0.05em;
    transition: background 0.3s ease-in-out;
    width: 100%;

    &:hover {
      filter: opacity(85%);
    }
  }

  > .form > .footer {
    font-size: 12px;
    line-height: 16px;
    letter-spacing: 0.01em;
    color: rgba(5, 5, 41, 0.45);
    margin: 15px 0 0 0;
    flex-shrink: 0;
  }
}
</style>
