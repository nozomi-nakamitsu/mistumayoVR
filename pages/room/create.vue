<template>
  <div class="create-room-container">
    <h1>CREATE ROOM</h1>
    <form class="form" @submit.prevent="createRoom">
      <label class="section">
        <span class="title">Room name</span>
        <input type="text" v-model="name" class="text" required />
      </label>
      <label class="date">
        <input type="datetime-local" v-model="date" required />
      </label>
      <div class="footer">
        <button type="submit" class="button">Continue</button>
      </div>
    </form>
  </div>
</template>

<script>
import { defineComponent, ref, useRouter } from "@nuxtjs/composition-api";
import { collection, addDoc } from "firebase/firestore";
import { ROOM_ROUTES } from "@/config/routes.ts";
import { db } from "@/plugins/firebase.js";

export default defineComponent({
  name: "CreateRoomPage",
  setup() {
    const router = useRouter();
    const name = ref(null);
    const date = ref(null);

    const createRoom = async () => {
      try {
        const docRef = await addDoc(collection(db, "room"), {
          name: name.value,
          dateTime: date.value,
        });
        router.push(ROOM_ROUTES.index.path);
      } catch (e) {
        console.error("Error adding document: ", e);
      }
    };

    return {
      createRoom,
      name,
      date,
    };
  },
});
</script>

<style lang="scss">
.create-room-container {
  width: 460px;
  max-width: 100%;
  padding-top: 240px;
  padding-bottom: 40px;
  border-radius: 24px;
  background-color: #fff;
  color: #050529;
  margin: auto;

  > h1 {
    margin-bottom: 30px;
  }

  > .form {
    display: grid;
    grid-template-columns: 100%;
    grid-gap: 24px;
  }

  > .form > .section > .title {
    display: flex;
    justify-content: space-between;
    margin-bottom: 8px;
  }

  > .form > .section > .text {
    width: 100%;
    height: 48px;
    padding-left: 16px;
    padding-right: 16px;
    box-sizing: border-box;
    border-radius: 10px;
    color: #050529;
    background-color: rgba(5, 5, 41, 0.03);
    border: 1px solid transparent;
    outline: none;
    transition: background 0.3s, color 0.3s, border-color 0.3s;
    word-break: normal;
  }

  > .form > .date {
    width: 100%;
    height: 48px;
    padding-left: 30px;
    padding-top: 10px;
    box-sizing: border-box;
    border-radius: 10px;
    color: #050529;
    background-color: rgba(5, 5, 41, 0.03);
    border: 1px solid transparent;
    outline: none;
    transition: background 0.3s, color 0.3s, border-color 0.3s;
    word-break: normal;
  }

  > .form > .footer > .button {
    width: 100%;
    background: #e8374a;
    border: 1px solid transparent;
    color: #fff;
    height: 56px;
    border-radius: 23px;
    padding: 0 23px;
  }
}
</style>
