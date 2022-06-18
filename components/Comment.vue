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
    <div class="comments" v-if="comments.length">
      <div v-for="(comment, index) in comments" :key="index" class="items">
        <div class="item">
          <div class="header">
            <p class="name">{{ comment.name }}</p>
            <p class="time">{{ comment.createdAt }}</p>
          </div>
          <p>{{ comment.message }}</p>
        </div>
      </div>
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
  props: {
    comments: {
      type: Array,
      required: true,
    },
  },
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
