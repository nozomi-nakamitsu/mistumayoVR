import { APP_ROUTES, ROOM_ROUTES } from "../config/routes.ts";
import { app } from "@/plugins/firebase.js";
import { getAuth } from "firebase/auth";

export default function ({ route, redirect }) {
  const auth = getAuth();

  // 未ログインでも閲覧できるゲストページたち
  const guestPages = [APP_ROUTES.index.path];

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
