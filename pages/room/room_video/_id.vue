<template>
  <div>
    <Video
      @click="onJoin"
      :is-join="isJoin"
      :has-member="hasMember"
      :room="roomRef"
      @select-avatar="initializeVideo"
      @leave="onLeave"
      @mute="onMute"
      @video="onVideo"
      @scree-sharing="onScreeSharing"
    ></Video>
  </div>
</template>

<script>
import {
  defineComponent,
  onMounted,
  ref,
  useRoute,
  useRouter,
} from "@nuxtjs/composition-api";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { VRM, VRMSchema } from "@pixiv/three-vrm";
import * as faceapi from "face-api.js";
import Peer from "skyway-js";
import Video from "@/components/video.vue";
import { getAuth } from "firebase/auth";
import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";

export default defineComponent({
  name: "RoomDetailPage",
  components: {
    Video,
  },
  setup() {
    const remoteVideos = ref();
    const Route = useRoute();
    const Router = useRouter();

    const firebaseConfig = {
      apiKey: process.env.API_KEY,
      authDomain: process.env.AUTH_DOMAIN,
      projectId: process.env.PROJECT_ID,
      storageBucket: process.env.STORAGE_BUCKET,
      messagingSenderId: process.env.MESSAGING_SENDER_ID,
      appId: process.env.APP_ID,
      measurementId: process.env.MEASUREMENT_ID,
    };
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);

    const roomId = Route.value.params.id;
    const docId = ref();

    const roomRef = {
      name: roomId,
      id: docId.value,
    };

    const isJoin = ref(false);
    const hasMember = ref(false);
    let room;
    const peer = ref();
    const vrm = ref(null);
    const setSkyWay = (auth) => {
      const API_KEY = process.env.SKY_WAY_API_KEY;

      peer.value = new Peer({
        key: API_KEY,
        user: {
          name: auth.displayName,
          icon: auth.photoURL,
        },
      });
      peer.value.on("open", (pid) => {
        console.log(`PeerId: ${pid}`);
      });
    };
    const switchAvator = (type) => {
      if (type === "A") {
        return "/resource/sample1.vrm";
      }
      return "/resource/sample2.vrm";
    };
    const initializeVideo = async (avatar) => {
      const avatarDom = document.getElementById("avatar-canvas");
      if (avatarDom) {
        avatarDom.remove();
      }
      const width = 500;
      const height = 300;
      const scene = new THREE.Scene();
      const loader = new GLTFLoader();
      const camera = new THREE.PerspectiveCamera(
        30.0,
        width / height,
        0.1,
        20.0
      );
      const renderer = new THREE.WebGLRenderer();
      const light = new THREE.DirectionalLight(0xffffff, 1);
      const $video = document.getElementById("webcam-video");
      const $landmarkCanvas = document.getElementById("landmarks");
      let blinking = false;
      let smiling = false;
      let lipDist;
      let headYawAngle;
      let prevHeadYawAngle;

      // three.js settings
      renderer.setClearColor(0xeeeeee);
      renderer.setSize(width, height);
      camera.position.set(0.0, 1.35, 0.8);
      light.position.set(0, 100, 30);
      scene.add(light);
      const $body = document.getElementById("body");
      const $avatarCanvas = renderer.domElement;
      $avatarCanvas.id = "avatar-canvas";
      $avatarCanvas.class = "my-avatar-canvas";

      $body.insertBefore($avatarCanvas, $body.firstChild);
      const gridHelper = new THREE.GridHelper(10, 10);
      scene.add(gridHelper);
      const axesHelper = new THREE.AxesHelper(5);
      scene.add(axesHelper);

      // face detecting
      $video.srcObject = await navigator.mediaDevices.getUserMedia({
        video: true,
      });
      $video.play().then(async () => {
        // Load learned models
        await faceapi.nets.tinyFaceDetector.load("/weights");
        await faceapi.loadFaceLandmarkModel("/weights");
        await faceapi.loadFaceExpressionModel("/weights");
        const loop = async () => {
          if (!faceapi.nets.tinyFaceDetector.params) {
            return setTimeout(() => loop());
          }
          // Exampleを参考に設定
          const option = new faceapi.TinyFaceDetectorOptions({
            inputSize: 224,
            scoreThreshold: 0.5,
          });
          const result = await faceapi
            .detectSingleFace($video, option)
            .withFaceLandmarks()
            .withFaceExpressions();
          if (result) {
            // デバッグをしつつ決めた値をスレッショルドとする(表情筋が硬い場合は下げようね！)
            if (result.expressions.happy > 0.7) {
              smiling = true;
            }
            // 頭部回転角度を鼻のベクトルに近似する
            // 68landmarksの定義から鼻のベクトルを求める
            const upperNose = result.landmarks.positions[27];
            const lowerNose = result.landmarks.positions[30];
            let noseVec = lowerNose.sub(upperNose);
            noseVec = new THREE.Vector2(noseVec.x, noseVec.y);
            // angle関数はx+方向を基準に角度を求めるため、π/2引いておき、逆回転のマイナスをかける
            headYawAngle = -(noseVec.angle() - Math.PI / 2);
            // リップシンク
            // 68landmarksの定義から、口の垂直距離を測る
            const upperLip = result.landmarks.positions[51];
            const lowerLip = result.landmarks.positions[57];
            lipDist = lowerLip.y - upperLip.y;
            // デバッグ用にcanvasに表示する
            const dims = faceapi.matchDimensions($landmarkCanvas, $video, true);
            const resizedResult = faceapi.resizeResults(result, dims);
            faceapi.draw.drawFaceLandmarks($landmarkCanvas, resizedResult);
          }
          setTimeout(() => loop());
        };
        loop();
      });

      // VRM Settings

      loader.load(
        switchAvator(avatar),
        async (gltf) => {
          vrm.value = await VRM.from(gltf);
          scene.add(vrm.value.scene);
          vrm.value.humanoid.getBoneNode(
            VRMSchema.HumanoidBoneName.Hips
          ).rotation.y = Math.PI;
        },
        (progress) =>
          console.log(
            "Loading model...",
            100.0 * (progress.loaded / progress.total),
            "%"
          ),
        (error) => console.error(error)
      );

      setInterval(() => {
        if (Math.random() < 0.15) {
          blinking = true;
        }
      }, 1000);
      const clock = new THREE.Clock();
      const render = () => {
        if (vrm.value) {
          const deltaTime = clock.getDelta();
          let s = Math.sin(Math.PI * clock.elapsedTime);
          if (smiling) {
            s *= 2;
            vrm.value.blendShapeProxy.setValue(
              VRMSchema.BlendShapePresetName.A,
              0
            );
            vrm.value.blendShapeProxy.setValue(
              VRMSchema.BlendShapePresetName.Joy,
              s
            );
            if (Math.abs(s) < 0.1) {
              smiling = false;
              vrm.value.blendShapeProxy.setValue(
                VRMSchema.BlendShapePresetName.Joy,
                0
              );
            }
          } else if (blinking) {
            s *= 5;
            vrm.value.blendShapeProxy.setValue(
              VRMSchema.BlendShapePresetName.Blink,
              s
            );
            if (Math.abs(s) < 0.1) {
              blinking = false;
              vrm.value.blendShapeProxy.setValue(
                VRMSchema.BlendShapePresetName.Blink,
                0
              );
            }
          }
          // vrm.blendShapeProxy.setValue( 'a', 0.5 + 0.5 * s );
          if (lipDist && !smiling) {
            // 初期距離(30)を引いて、口を最大限に開けた時を最大値とした時を参考に割合を決める
            let lipRatio = (lipDist - 30) / 25;
            if (lipRatio < 0) {
              lipRatio = 0;
            } else if (lipRatio > 1) {
              lipRatio = 1;
            }
            vrm.value.blendShapeProxy.setValue(
              VRMSchema.BlendShapePresetName.A,
              lipRatio
            );
          }
          if (headYawAngle) {
            if (Math.abs(prevHeadYawAngle - headYawAngle) > 0.02) {
              // 変化を増幅させる
              const y = headYawAngle * 2.5;
              if (Math.abs(y) < Math.PI / 2) {
                vrm.value.humanoid.getBoneNode(
                  VRMSchema.HumanoidBoneName.Head
                ).rotation.y = y;
              }
            }
            prevHeadYawAngle = headYawAngle;
          }
          vrm.value.humanoid.getBoneNode(
            VRMSchema.HumanoidBoneName.LeftUpperArm
          ).rotation.z = Math.PI / 3;
          vrm.value.humanoid.getBoneNode(
            VRMSchema.HumanoidBoneName.RightUpperArm
          ).rotation.z = -Math.PI / 3;

          // update vrm
          vrm.value.update(deltaTime);
        }
        renderer.render(scene, camera);
        requestAnimationFrame(render);
      };
      render();
    };
    const onJoin = async () => {
      remoteVideos.value = document.getElementById("js-remote-streams");
      isJoin.value = true;
      if (roomId === "") {
        return console.warn("ルームIDがありません");
      }
      if (!vrm.value) {
        return console.warn("A VRM hasn't been loaded yet");
      }
      const $avatarCanvas = document.querySelector("#avatar-canvas");
      const stream = $avatarCanvas.captureStream(30);
      const audioStream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });
      const audioTrack = audioStream.getAudioTracks()[0];
      stream.addTrack(audioTrack);
      room = peer.value.joinRoom(roomId, {
        mode: "sfu",
        stream,
      });
      room.on("open", async () => {
        console.log(`join: ${room.name}`);
        console.log(room);
        hasMember.value = !!room.members.length;
        room.on("stream", async (stream) => {
          console.log("stream!!!!!!!");
          hasMember.value = !!room.members.length;
          const newDom = document.createElement("div");
          const newVideo = document.createElement("video");
          const userName = document.createElement("p");
          // newDom.append(newVideo);
          userName.textContent = stream.peerId;
          newVideo.srcObject = stream;
          newVideo.playsInline = true;
          // mark peerId to find it later at peerLeave event
          newDom.setAttribute("class", "remote-item");
          newDom.setAttribute("data-remote-item-id", stream.peerId);
          newVideo.setAttribute("data-peer-id", stream.peerId);
          newVideo.setAttribute("class", "remote-video");
          newDom.append(newVideo);
          newDom.append(userName);
          remoteVideos.value.append(newDom);
          await newVideo.play().catch(console.error);
        });
        room.on("close", async () => {
          hasMember.value = !!room.members.length;
          Array.from(remoteVideos.value.children).forEach((remoteVideo) => {
            remoteVideo.srcObject.getTracks().forEach((track) => track.stop());
            remoteVideo.srcObject = null;
            remoteVideo.remove();
          });
        });
        room.on("peerLeave", (peerId) => {
          hasMember.value = !!room.members.length;
          const leavedPeer = document.querySelector(
            `[data-remote-item-id="${peerId}"]`
          );
          console.log("leavedPeer", leavedPeer);
          if (leavedPeer) {
            leavedPeer.remove();
          }
        });
      });
    };
    const onLeave = async () => {
      console.log("a");
      await room.close();
      await peer.value.destroy();
      peer.value = null;
      // わからないのでリロードしてます。
      window.location.href = `/room/leaved/${roomId}`;
    };
    onMounted(async () => {
      const auth = getAuth();

      const q = query(collection(db, "room"), where("name", "==", roomId));
      const querySnapshot = await getDocs(q);
      querySnapshot.forEach((doc) => {
        docId.value = doc.id;
      });

      await initializeVideo(auth.currentUser.photoURL);
      await setSkyWay(auth.currentUser);
    });

    const onMute = (event) => {
      console.log(event, "ミュート");
    };
    const onVideo = (event) => {
      console.log(event, "ビデオ");
    };
    const onScreeSharing = (event) => {
      console.log(event, "画面共有");
    };

    return {
      peer,
      isJoin,
      onJoin,
      hasMember,
      roomRef,
      initializeVideo,
      onLeave,
      onMute,
      onVideo,
      onScreeSharing,
    };
  },
});
</script>
