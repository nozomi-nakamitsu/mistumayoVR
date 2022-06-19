import { APP_ROUTES } from "../config/routes";

export default function ({ route, redirect }) {
  // ゲスト用ページ：未ログイン時でも閲覧可能なページ
  const guestPages: string[] = [APP_ROUTES.index.path];

  if (!guestPages.includes(route.path)) return redirect(APP_ROUTES.index.path);
}
