<script setup lang="ts">
import { supabase } from "../utils/supabaseClient.ts";
import { useRouter } from "vue-router";
import { usePostStore } from "../stores/postStore.ts";
import { useUserStore } from "../stores/user.ts";
import { useGamesStore } from "../stores/games.ts";
import { useFriendsState } from "../stores/friends.ts";
import { onMounted } from "vue";

const router = useRouter();
const postStore = usePostStore();
const user = useUserStore();
const games = useGamesStore();
const friends = useFriendsState();

async function logout() {
  localStorage.clear();
  user.$reset();
  games.$reset();
  friends.$reset();
  postStore.$reset();

  await supabase.auth.signOut();
}

onMounted(async () => {
  await logout();

  await router.push("/");
});
</script>

<template></template>

<style scoped></style>
