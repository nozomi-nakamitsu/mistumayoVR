import { APP_ROUTES, ROOM_ROUTES } from "../config/routes.ts";
import "firebase/compat/auth";
import "firebase/compat/firestore";
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

export default function ({ route, redirect }) {
  // 未ログインでも閲覧できるページたち
  const guestPages = [APP_ROUTES.index.path];

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

  return new Promise(async (resolve) => {
    auth.onAuthStateChanged((currentUser) => {
      // 未ログイン中に、ゲストページ以外を閲覧する場合
      if (!currentUser && !guestPages.includes(route.path)) {
        redirect(APP_ROUTES.index.path);
      }

      // ログイン中にゲストページを閲覧しようとした場合
      if (currentUser && guestPages.includes(route.path)) {
        redirect(ROOM_ROUTES.index.path);
      }
    });
    resolve();
  });
}
