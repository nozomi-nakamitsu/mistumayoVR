<template>
  <div class="leaved-container">
    <p class="text">ミーティングを退出しました。</p>
    <div class="items">
      <div class="item">
        <button
          class="common-button -outline"
          @click="redirect(`/room/${Route.params.id}`)"
        >
          再参加
        </button>
      </div>
      <div class="item">
        <button class="common-button" @click="redirect('/room')">
          ホーム画面に戻る
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { defineComponent, useRouter, useRoute } from "@nuxtjs/composition-api";

export default defineComponent({
  components: {},
  props: {},
  setup() {
    const Router = useRouter();
    const Route = useRoute();

    const redirect = (path) => {
      Router.push(path);
    };
    return {
      redirect,
      Route,
    };
  },
});
</script>
