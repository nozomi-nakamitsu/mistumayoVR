<template>
  <div class="prepare-container" :class="{ '-is-join': isJoin }">
    <div class="container">
      <div class="left" id="body" :class="{ '-no-member': !hasMember }">
        <video class="video" id="webcam-video" style="display: none"></video>
        <canvas id="landmarks" style="display: none"></canvas>
        <p v-if="isJoin" id="maximize-screen-user-name">あなた</p>
      </div>
      <div class="right" v-if="!isJoin">
        <p class="title">{{ room.name }}</p>
        　<button class="common-button" @click="$emit('click')">
          今すぐ参加する
        </button>
        <div class="avatar-select">
          <p>アバターを選ぶ</p>
          <div class="items">
            <div class="item">
              　<button
                class="common-button"
                @click="$emit('select-avatar', 'A')"
              >
                A
              </button>
            </div>
            <div class="item">
              <button
                class="common-button"
                @click="$emit('select-avatar', 'B')"
              >
                B
              </button>
            </div>
            　
          </div>
        </div>
      </div>
      <div class="remote-streams" id="js-remote-streams">
        <div class="right" v-if="hasMember"></div>
      </div>
    </div>
    <VideoFooter
      v-if="isJoin"
      @leave="$emit('leave')"
      @mute="$emit('mute', $event)"
      @video="$emit('video', $event)"
      @screen-sharing="$emit('screen-sharing', $event)"
    >
    </VideoFooter>
  </div>
</template>

<script>
import { defineComponent } from "@nuxtjs/composition-api";
import VideoFooter from "@/components/videoFooter";

export default defineComponent({
  props: {
    isJoin: {
      type: Boolean,
      required: true,
    },
    hasMember: {
      type: Boolean,
      required: true,
    },
    room: {
      type: Object,
      required: true,
    },
  },
  emits: ["click", "select-avatar", "leave", "mute", "screen-sharing", "video"],
  components: VideoFooter,
  setup() {},
});
</script>
