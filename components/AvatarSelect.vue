<template>
  <div class="avatar-select-container">
    <p class="title">アバターを選択してください！</p>
    <div class="container">
      <div class="card" @click="$emit('click', Avatar.avatar1)">
        <h3 class="title">タイメイ</h3>
        <div class="bar">
          <div class="emptybar"></div>
          <div class="filledbar"></div>
        </div>
        <div class="circle">
          <div class="image">
            <img class="img" src="@/assets/images/avatars/taimei1.png" />
          </div>
        </div>
      </div>
      <div class="card" @click="$emit('click', Avatar.avatar2)">
        <h3 class="title">ホシノ</h3>
        <div class="bar">
          <div class="emptybar"></div>
          <div class="filledbar"></div>
        </div>
        <div class="circle">
          <div class="image">
            <img class="img" src="@/assets/images/avatars/hoshino.png" />
          </div>
        </div>
      </div>
      <div class="card" @click="$emit('click', Avatar.avatar3)">
        <h3 class="title">キシガミ</h3>
        <div class="bar">
          <div class="emptybar"></div>
          <div class="filledbar"></div>
        </div>
        <div class="circle">
          <div class="image">
            <img class="img" src="@/assets/images/avatars/kishigami1.png" />
          </div>
        </div>
      </div>
      <div class="card" @click="$emit('click', Avatar.avatar4)">
        <h3 class="title">タイメイ2</h3>
        <div class="bar">
          <div class="emptybar"></div>
          <div class="filledbar"></div>
        </div>
        <div class="circle">
          <div class="image">
            <img class="img" src="@/assets/images/avatars/taimei2.png" />
          </div>
        </div>
      </div>
      <div class="card" @click="$emit('click', Avatar.avatar5)">
        <h3 class="title">ホシノ2</h3>
        <div class="bar">
          <div class="emptybar"></div>
          <div class="filledbar"></div>
        </div>
        <div class="circle">
          <div class="image">
            <img class="img" src="@/assets/images/avatars/hoshino2.png" />
          </div>
        </div>
      </div>
      <div class="card" @click="$emit('click', Avatar.avatar6)">
        <h3 class="title">キシガミ2</h3>
        <div class="bar">
          <div class="emptybar"></div>
          <div class="filledbar"></div>
        </div>
        <div class="circle">
          <div class="image">
            <img class="img" src="@/assets/images/avatars/kishigami2.png" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { defineComponent } from "@nuxtjs/composition-api";
import { Avatar } from "@/enums/avatar";

export default defineComponent({
  props: {},
  emits: ["click"],
  setup() {
    return { Avatar };
  },
});
</script>
