<script setup lang="ts">
import { supabase } from "../utils/supabaseClient.ts";
import { useRouter } from "vue-router";
import { usePostStore } from "../stores/postStore.ts";
import { useUserStore } from "../stores/user.ts";
import { useFriendsState } from "../stores/friends.ts";
import { resetUser, captureEvent } from "../utils/posthog";
import { onMounted } from "vue";

const router = useRouter();
const postStore = usePostStore();
const user = useUserStore();
const friends = useFriendsState();

async function logout() {
  captureEvent("logout_completed");
  localStorage.clear();
  user.$reset();
  friends.$reset();
  postStore.$reset();
  resetUser();

  await supabase.auth.signOut();
}

onMounted(async () => {
  await logout();

  await router.push("/");
});
</script>

<template></template>

<style scoped></style>
