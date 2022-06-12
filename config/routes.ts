export const APP_ROUTES = {
  login: { path: "/login", name: "ログイン" },
};

const roomPrefix = "/room";

export const ROOM_ROUTES = {
  create: { path: `${roomPrefix}/create`, name: "ルーム作成" },
  index: { path: `${roomPrefix}`, name: "ルーム一覧" },
  roomVideo: { path: `${roomPrefix}/room_video`, name: "ルーム参加" },
};
