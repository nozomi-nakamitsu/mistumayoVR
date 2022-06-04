<template>
  <div class="prepare-container" :class="{ '-is-join': isJoin }">
    <div class="container">
      <div class="left" id="body" :class="{ '-no-member': !hasMember }">
        <video class="video" id="webcam-video" style="display: none"></video>
        <canvas id="landmarks" style="display: none"></canvas>
        <p v-if="isJoin">あなた</p>
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
      <div class="right">
        <div class="remote-streams" id="js-remote-streams"></div>
      </div>
    </div>
    <div class="footer-container" v-if="isJoin">
      <button @click="$emit('leave')">退出</button>
    </div>
  </div>
</template>

<script>
import { defineComponent, ref, PropType } from "@nuxtjs/composition-api";
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
  emits: ["click", "select-avatar", "leave"],
  setup() {},
});
</script>
