<template>
  <div class="comment-container">
    <div class="header">
      <p class="title">ユーザー</p>
      <div class="close" @click="$emit('close')">X</div>
    </div>
    <div class="users">
      <div class="user">
        <div　class="image">
          <img
            src="https://growthseed.jp/wp-content/uploads/2016/12/peach-1.jpg"
            class="img"
          />
        </div>
        <p>中満のぞみ</p>
        <button class="video-button -isActive button">
          <div>
            <AppIcon :icon="faMicrophoneSlash" color="white"></AppIcon>
          </div>
        </button>
      </div>
        <div class="user">
        <div　class="image">
          <img
            src="https://growthseed.jp/wp-content/uploads/2016/12/peach-1.jpg"
            class="img"
          />
        </div>
        <p>中満のぞみ</p>
        <button class="video-button -isActive button">
          <div>
            <AppIcon :icon="faMicrophoneSlash" color="white"></AppIcon>
          </div>
        </button>
      </div>
    </div>
  </div>
</template>
<script>
import { defineComponent, ref } from "@nuxtjs/composition-api";
import AppIcon from "@/components/AppIcon.vue";
import { faMicrophoneSlash } from "@fortawesome/free-solid-svg-icons";
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
    return { faMicrophoneSlash };
  },
});
</script>
