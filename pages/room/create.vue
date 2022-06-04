<template>
  <div class="create-room-container">
    <h1>CREATE ROOM</h1>
    <form class="form">
      <input type="text" v-model="name" class="input" />

      <input type="datetime-local" v-model="date" />
      <button @click="createRoom" class="button">ROOMを作成</button>
    </form>
  </div>
</template>

<script>
import { defineComponent, ref, watchEffect } from "@nuxtjs/composition-api";

export default defineComponent({
  name: "CreateRoomPage",
  setup() {
    const name = ref(null);
    const date = ref(null);
    const createRoom = () => {
      console.log(name.value, date.value);
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
  background: #fafafa;
  margin: 4em auto;
  padding: 6em;
  max-width: 720px;

  > .form > .input {
    border: 1px solid gray;
    border-radius: 5px;
  }

  > .form > .button {
    background: #f16272;
    padding: 5px;
    font-size: 18px;
  }
}
</style>
