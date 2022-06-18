<template>
  <div class="comment-container">
    <div class="header">
      <p class="title">通話中のメッセージ</p>
      <div class="close" @click="$emit('close')">X</div>
    </div>

    <div class="description">
      <p>
        メッセージは、通話参加中のユーザーにのみ表示され、
        通話が終了すると削除されます
      </p>
    </div>
    <div class="comments">
      <div class="item">
        <div class="header">
          <p>あなた</p>
          <p class="time">11:22</p>
        </div>
        <p>こんにちは</p>
      </div>
      <!-- <div class="item">
        <div class="header">
          <p>あなた</p>
          <p class="time">11:22</p>
        </div>
        <p>こんにちは</p>
      </div> -->
    </div>
    <div class="search">
      <input
        class="input"
        placeholder="メッセージを送信"
        v-model="inputValue"
      />
      <div class="submit" @click="onSubmit">
        <AppIcon :icon="faPaperPlane" color="gray"></AppIcon>
      </div>
    </div>
  </div>
</template>
<script>
import { defineComponent, ref } from "@nuxtjs/composition-api";
import AppIcon from "@/components/AppIcon.vue";
import { faPaperPlane } from "@fortawesome/free-solid-svg-icons";
export default defineComponent({
  emits: ["close", "submit"],
  components: { AppIcon },
  setup(_, { emit }) {
    const inputValue = ref("");
    const onSubmit = () => {
      emit("submit", inputValue.value);
      inputValue.value = "";
    };
    return { faPaperPlane, inputValue, onSubmit };
  },
});
</script>
