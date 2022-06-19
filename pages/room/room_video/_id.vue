<template>
  <div>
    <Loading v-if="isLoading"></Loading>
    <Video
      @click="onJoin"
      :is-join="isJoin"
      :has-member="hasMember"
      :room="roomRef"
      :switch-scree-sharing="switchScreeSharing"
      :comments="comments"
      :users="users"
      @select-avatar="initializeVideo"
      @leave="onLeave"
      @mute="onMute"
      @video="onVideo"
      @screen-sharing="onScreenShare"
      @comment="onComment"
    ></Video>
  </div>
</template>

<script>
import {
  defineComponent,
  onMounted,
  ref,
  useRoute,
} from "@nuxtjs/composition-api";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { VRM, VRMSchema } from "@pixiv/three-vrm";
import * as faceapi from "face-api.js";
import Peer from "skyway-js";
import Video from "@/components/video.vue";
import { getAuth } from "firebase/auth";
import { collection, query, where, getDocs } from "firebase/firestore";
import Loading from "@/components/AppLoading";
import dayjs from "dayjs";
import { getUid, getUserByUid } from "@/compositions/useAuth";
import { db } from "@/plugins/firebase.js";
import { Avatar } from "@/enums/avatar";
import voiceDetertor from "@/compositions/useVoiceDetection";

export default defineComponent({
  name: "RoomDetailPage",
  components: {
    Video,
    Loading,
  },
  setup() {
    const remoteVideos = ref();
    const Route = useRoute();
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
    const localAvatar = ref(Avatar.avatar1);
    const users = ref([]);
    const auth = ref();
    const vad = new voiceDetertor();
    const voiceDetection = ref({
      prevBefore: 1,
      prev: 1,
      current: 1,
    });

    const setSkyWay = () => {
      const API_KEY = process.env.SKY_WAY_API_KEY;
      const date = dayjs(new Date()).format("YYYYMMDDHHmmss");
      // NOTE: PeerIDは「fireStoreのuid_日付」を指定している
      const peerId = `${auth.value.currentUser.uid}_${date}`;
      peer.value = new Peer(peerId, {
        key: API_KEY,
      });
      peer.value.on("open", (pid) => {
        console.log(`PeerId: ${pid}`);
      });
      users.value = [
        ...users.value,
        {
          name: auth.value.currentUser.displayName,
          icon: auth.value.currentUser.photoURL,
          uid: auth.value.currentUser.uid,
        },
      ];
    };
    const switchAvator = () => {
      if (localAvatar.value === Avatar.avatar1) {
        return "/resource/taimei1.vrm";
      }
      if (localAvatar.value === Avatar.avatar2) {
        return "/resource/hoshino1.vrm";
      }
      if (localAvatar.value === Avatar.avatar3) {
        return "/resource/kishigami1.vrm";
      }
      if (localAvatar.value === Avatar.avatar4) {
        return "/resource/taimei2.vrm";
      }
      if (localAvatar.value === Avatar.avatar5) {
        return "/resource/hoshino2.vrm";
      }
      if (localAvatar.value === Avatar.avatar6) {
        return "/resource/kishigami2.vrm";
      }
      return "/resource/hoshino1.vrm";
    };
    // 画面共有の設定
    let screenShareStream;
    let stream;

    /**
     *アバターを描画する
     */
    const initializeVideo = async (avatar) => {
      isLoading.value = true;
      localAvatar.value = avatar;
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
      $avatarCanvas.setAttribute("class", "my-avatar-canvas");
      const newDom = document.createElement("div");
      newDom.setAttribute("class", "my-avatar-canvas-wrapper");
      newDom.append($avatarCanvas);
      $body.append(newDom);
      const gridHelper = new THREE.GridHelper(10, 10);
      scene.add(gridHelper);
      const axesHelper = new THREE.AxesHelper(5);
      scene.add(axesHelper);

      // face detecting
      $video.srcObject = await navigator.mediaDevices.getUserMedia({
        video: true,
        // audio: true,
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
        switchAvator(),
        async (gltf) => {
          vrm.value = await VRM.from(gltf);
          scene.add(vrm.value.scene);
          vrm.value.humanoid.getBoneNode(
            VRMSchema.HumanoidBoneName.Hips
          ).rotation.y = Math.PI;
        },
        (progress) => {
          console.log(
            "Loading model...",
            100.0 * (progress.loaded / progress.total),
            "%"
          );
        },
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
      await render();
      setTimeout(() => {
        isLoading.value = false;
      }, 3000);
    };
    const setMiximizeIcon = (peerId, type) => {
      const maximizeIcon = document.createElement("img");
      maximizeIcon.setAttribute("class", "maximizeIcon");
      maximizeIcon.setAttribute("src", "/resource/maximizeIcon.png");
      maximizeIcon.setAttribute("data-maxmize-icon-id", peerId);
      if (type === "currentUser") {
        maximizeIcon.setAttribute("class", "-currentUser");
      }
      return maximizeIcon;
    };
    const setMuteIcon = (peerId, type) => {
      const muteIcon = document.createElement("img");
      const muteIconWrapper = document.createElement("div");
      muteIcon.setAttribute("class", "muteIcon");
      muteIconWrapper.setAttribute("class", "muteIconWrapper");
      muteIcon.setAttribute("src", "/resource/muteIcon.png");
      muteIcon.setAttribute("data-mute-icon-id", peerId);
      muteIconWrapper.setAttribute("data-mute-icon-wrapper-id", peerId);
      muteIconWrapper.append(muteIcon);
      if (type === "currentUser") {
        muteIconWrapper.setAttribute("class", "-currentUser");
      }
      return muteIconWrapper;
    };
    const setSpeakingIcon = (peerId, type) => {
      const speakingIcon = document.createElement("img");
      const speakingIconWrapper = document.createElement("div");
      speakingIcon.setAttribute("class", "speakingIcon");
      speakingIconWrapper.setAttribute("class", "speakingIconWrapper");
      speakingIcon.setAttribute("src", "/resource/speakingIcon.svg");
      speakingIcon.setAttribute("data-speaking-icon-id", peerId);
      speakingIconWrapper.setAttribute("data-speaking-icon-wrapper-id", peerId);
      speakingIconWrapper.append(speakingIcon);
      if (type === "currentUser") {
        speakingIconWrapper.setAttribute("class", "-currentUser");
      }
      return speakingIconWrapper;
    };
    const isDetectingAudioStaus = ref("untreated");

    /**
     *部屋入室の処理
     */
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
      stream = $avatarCanvas.captureStream(30);
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
        hasMember.value = !!room.members.length;
      });
      room.on("stream", async (stream) => {
        const remoteUser = await fetchUserByPeerId(stream.peerId);
        addRemoteVideo(stream, remoteUser);
        users.value = [...users.value, remoteUser];
        vad.startVoiceDetection(stream, (val) => {
          const mutePeerIcon = document.querySelector(
            `[data-mute-icon-wrapper-id="${stream.peerId}"]`
          );
          const speakingPeerIcon = document.querySelector(
            `[data-speaking-icon-wrapper-id="${stream.peerId}"]`
          );
          if (isDetectingAudioStaus.value === "untreated") {
            isDetectingAudioStaus.value = "completed";
          }
          if (isDetectingAudioStaus.value === "completed") {
            isDetectingAudioStaus.value = "processing";
            setTimeout(() => {
              isDetectingAudioStaus.value = "completed";
              if (val === 0) {
                mutePeerIcon.style.display = "flex";
                speakingPeerIcon.style.display = "none";
                return;
              }
              mutePeerIcon.style.display = "none";
              speakingPeerIcon.style.display = "flex";
            }, 1000);
          }
        });
      });
      room.on("close", async () => {
        hasMember.value = !!room.members.length;
        Array.from(remoteVideos.value.children).forEach((remoteVideo) => {
          remoteVideo.srcObject.getTracks().forEach((track) => track.stop());
          remoteVideo.srcObject = null;
          remoteVideo.remove();
        });
        vad.stopVoiceDetection();
      });
      room.on("peerLeave", (peerId) => {
        hasMember.value = !!room.members.length;
        const leavedPeer = document.querySelector(
          `[data-remote-item-id="${peerId}"]`
        );
        removeMaximizeVideo(peerId);
        if (leavedPeer) {
          leavedPeer.remove();
        }
        removeUserList(peerId);
      });
      room.on("data", async (message) => {
        const uid = getUid(message.src);
        const remoteUser = await getUserByUid(uid);
        comments.value = [
          ...comments.value,
          {
            name: remoteUser.name,
            message: message.data,
            createdAt: dayjs(new Date()).format("HH:mm"),
          },
        ];
      });
    };
    /**
     *peerIdからユーザー情報を取得する
     */
    const fetchUserByPeerId = async (peerId) => {
      const uid = getUid(peerId);
      const remoteUser = await getUserByUid(uid);
      return remoteUser;
    };
    /**
     *ユーザー一覧からユーザーを取り除く
     */
    const removeUserList = async (peerId) => {
      const uid = getUid(peerId);
      users.value = users.value.filter((user) => {
        user.uid !== uid;
      });
    };
    /**
     *リモートのビデオを右側に表示する
     */
    const addRemoteVideo = async (stream, remoteUser) => {
      hasMember.value = !!room.members.length;
      const newDom = document.createElement("div");
      const newVideo = document.createElement("video");
      const userName = document.createElement("p");
      userName.textContent = remoteUser.name;
      newVideo.srcObject = stream;
      newVideo.playsInline = true;
      newDom.setAttribute("class", "remote-item");
      newDom.setAttribute("data-remote-item-id", stream.peerId);
      newVideo.setAttribute("data-peer-id", stream.peerId);
      newVideo.setAttribute("class", "remote-video");
      newDom.append(newVideo);
      newDom.append(userName);
      const icon = setMiximizeIcon(stream.peerId, "");
      const muteIcon = setMuteIcon(stream.peerId, "");
      const speakingIcon = setSpeakingIcon(stream.peerId, "");
      newDom.append(icon);
      newDom.append(muteIcon);
      newDom.append(speakingIcon);

      remoteVideos.value.append(newDom);
      await newVideo.play().catch(console.error);
      document
        .querySelector(`[data-maxmize-icon-id="${stream.peerId}"]`)
        .addEventListener("click", () => {
          onMaximize(stream.peerId);
        });
    };
    const removeMaximizeVideo = (peerId) => {
      const target = document.querySelector(
        `[data-maxmize-icon-id="${peerId}"]`
      );
      if (target) {
        onMaximizeLocalVideo();
      }
    };
    /**
     *画面共有ボタンを推したときに発火
     */
    async function onScreenShare(isShare) {
      if (isShare.value) {
        onClickStartScreenShare();
        onMaximizeLocalVideo();
        return;
      }
      onClickStopScreenShare();
    }
    /**
     *画面共有処理
     */
    async function onClickStartScreenShare() {
      const $video = document.getElementById("webcam-video");
      const $avatarCanvas = document.getElementById("avatar-canvas");
      switchScreeSharing.value = false;
      let noAudioStream = null;
      try {
        screenShareStream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
        });
        const audioStream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });
        const audioTrack = audioStream.getAudioTracks()[0];
        noAudioStream = screenShareStream;
        screenShareStream.addTrack(audioTrack);
      } catch (error) {
        switchScreeSharing.value = true;
        return;
      }
      $video.srcObject = noAudioStream;
      $video.style.display = "block";
      $avatarCanvas.style.display = "none";
      await $video.play().catch(console.error);
      room.replaceStream(screenShareStream);
    }
    /**
     *画面共有を解除する処理
     */
    async function onClickStopScreenShare() {
      const $video = document.getElementById("webcam-video");
      const $avatarCanvas = document.getElementById("avatar-canvas");
      let screenShareStreamTrack = await screenShareStream.getTracks();
      screenShareStreamTrack.forEach(function (track) {
        track.stop();
      });
      screenShareStream = null;
      $video.style.display = "none";
      $avatarCanvas.style.display = "block";
      await initializeVideo(localAvatar.value);
      room.replaceStream(stream);
    }
    /**
     *部屋を退出する処理
     */
    const onLeave = async () => {
      await room.close();
      await peer.value.destroy();
      peer.value = null;
      // わからないのでリロードしてます。
      window.location.href = `/room/leaved/${roomId}`;
    };
    /**
     *画面を拡大する
     */
    const onMaximize = async (peerId) => {
      if (isMeClicked(peerId)) {
        onMaximizeLocalVideo();
        return;
      }
      onMiximizeLocalVideo();
      onMaximizeRemoteVideo(peerId);
    };
    /**
     *自分の映像を小さくする
     */
    const onMiximizeLocalVideo = () => {
      const localAvatar = document.getElementById("avatar-canvas");
      localAvatar.classList.add("-mixmize");
      localAvatar.parentNode.insertBefore(
        setMiximizeIcon(peer.value.id, "currentUser"),
        localAvatar.nextElementSibling
      );
      document
        .querySelector(`[data-maxmize-icon-id="${peer.value.id}"]`)
        .addEventListener("click", () => {
          onMaximize(peer.value.id);
        });
    };
    /**
     *自分の映像を大きくする
     */
    const onMaximizeLocalVideo = async () => {
      const localAvatar = document.getElementById("avatar-canvas");
      localAvatar.classList.remove("-mixmize");
      document.getElementById("maximize-screen-user-name").textContent =
        "あなた";
      const defaultRemoteMaximizeVideo = document.getElementById(
        "remote-maximize-video"
      );

      const peerId = defaultRemoteMaximizeVideo.dataset.maximizeId;

      defaultRemoteMaximizeVideo.remove();
      document
        .querySelector(`[data-maxmize-icon-id="${peer.value.id}"]`)
        .remove();

      const remoteItem = document.querySelector(
        `[data-remote-item-id="${peerId}"]`
      );
      remoteItem.style.display = "block";
    };
    const isMeClicked = (peerId) => peer.value.id === peerId;
    const hasDisplayedRemoteMembers = () => room.members.length - 1 > 0;

    /**
     *相手の映像を拡大する
     */
    const onMaximizeRemoteVideo = async (peerId) => {
      const defaultRemoteMaximizeVideo = document.getElementById(
        "remote-maximize-video"
      );
      if (defaultRemoteMaximizeVideo) {
        defaultRemoteMaximizeVideo.remove();
      }

      const remoteItem = document.querySelector(
        `[data-remote-item-id="${peerId}"]`
      );
      const remoteVideo = document.querySelector(`[data-peer-id="${peerId}"]`);
      const $body = document.getElementById("body");

      let remotMaximizeVideo = document.createElement("video");
      remotMaximizeVideo.id = "remote-maximize-video";
      remotMaximizeVideo.setAttribute("class", "webcam-video");
      remotMaximizeVideo.setAttribute("data-maximize-id", peerId);
      remotMaximizeVideo.srcObject = remoteVideo.srcObject;
      remotMaximizeVideo.playsInline = true;
      $body.insertBefore(remotMaximizeVideo, $body.firstChild);
      await remotMaximizeVideo.play().catch(console.error);
      remoteItem.style.display = "none";
      const uid = getUid(peerId);
      const remoteUser = await getUserByUid(uid);
      document.getElementById("maximize-screen-user-name").textContent =
        remoteUser.name;
      if (isMeClicked(peerId)) {
        return;
      }
      hasMember.value = hasDisplayedRemoteMembers();
    };

    onMounted(async () => {
      auth.value = await getAuth();
      const q = query(collection(db, "room"), where("name", "==", roomId));
      const querySnapshot = await getDocs(q);
      querySnapshot.forEach((doc) => {
        docId.value = doc.id;
      });
      await setSkyWay();
      await initializeVideo(Avatar.avatar1);
    });

    /**
     *ミュートボタン押下時に発火
     */
    const onMute = async (event) => {
      // 自身ののストリーム
      const $video = document.getElementById("webcam-video");
      $video.srcObject
        .getAudioTracks()
        .forEach((track) => (track.enabled = !event.value));
      const audioTrack = stream.getAudioTracks()[0];
      audioTrack.enabled = !event.value;
    };

    /**
     *ビデオボタン押下時に発火
     */
    const onVideo = (toVideoOn) => {
      if (toVideoOn.value) {
        onVideoChat();
        return;
      }
      onRemoveVideoChat();
    };
    /**
     *ビデオを表示する
     */
    const onVideoChat = async () => {
      const $avatarCanvas = document.getElementById("avatar-canvas");
      $avatarCanvas.style.display = "none";
      const $video = document.getElementById("webcam-video");
      $video.style.display = "block";
      $video.srcObject.getTracks().forEach((track) => {
        track.stop();
      });
      const audioStream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true,
      });
      $video.srcObject = audioStream;
      await $video.play().catch(console.error);
      room.replaceStream(audioStream);
    };
    /**
     *ビデオを非表示にする
     */
    const onRemoveVideoChat = () => {
      const $avatarCanvas = document.getElementById("avatar-canvas");
      $avatarCanvas.style.display = "block";
      const $video = document.getElementById("webcam-video");
      $video.style.display = "none";
      room.replaceStream(stream);
    };
    /**
     *ローディング
     */
    const isLoading = ref(true);
    const switchScreeSharing = ref(false);

    /**
     *コメントを送信する
     */
    const onComment = (inputValue) => {
      comments.value = [
        ...comments.value,
        {
          name: auth.value.currentUser.displayName,
          message: inputValue,
          createdAt: dayjs(new Date()).format("HH:mm"),
        },
      ];
      room.send(inputValue);
    };
    const comments = ref([]);

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
      onScreenShare,
      onMaximize,
      isLoading,
      switchScreeSharing,
      onComment,
      comments,
      users,
    };
  },
});
</script>
