<template>
  <div class="index-container">
    <div class="form">
      <h1>Welcome !</h1>
      <div class="button-panel">
        <div id="auth"></div>
      </div>
      <div class="footer"></div>
    </div>
  </div>
</template>

<script>
import { defineComponent, useRouter } from "@nuxtjs/composition-api";
import "firebase/compat/auth";
import "firebase/compat/firestore";
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { ROOM_ROUTES } from "@/config/routes.ts";
import { collection, addDoc } from "firebase/firestore";
import { db, auth } from "@/plugins/firebase.js";

export default defineComponent({
  name: "Index",
  setup() {
    const router = useRouter();
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
        const signOutMessage = `
          <button class="button" type="submit"  onClick="signOut()">ログアウト<\/button>
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
      } else {
        const signInMessage = `
            <div class="lead">Googleでログイン</div>
            <button class="button" type="submit"  onClick="signIn()">続ける<\/button>
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
  background: url("/resource/mori.png");
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
    background-color: rgba(255, 255, 255, 0.85);
    padding: 60px;
    border-radius: 24px;
  }

  > .auth > .lead {
    color: rgba(5, 5, 41, 0.45);
    margin-top: 8px;
    margin-bottom: 20px;
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
    text-shadow: rgb(0 0 0 / 25%) 0px 3px 8px;
    background: #e8374a;
    border: 1px solid transparent;
    color: #fff;
    cursor: pointer;
    height: 50px;
    border-radius: 23px;
    padding: 0 23px;
    margin-top: 20px;
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
