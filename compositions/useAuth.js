import {
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { db } from "@/plugins/firebase.js";

/**
 *uidを取得する
 */
export const getUid = (peerId) => peerId.substr(0, peerId.indexOf("_"));

/**
 *ユーザーを取得する
 */

export const getUserByUid = async (uid) => {
  const q = query(collection(db, "users"), where("uid", "==", uid));
  const querySnapshot = await getDocs(q);
  let target = {};
  querySnapshot.forEach((doc) => {
    target = doc.data();
  });
  return target;
};
