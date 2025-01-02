<script setup lang="ts">
import { useRouter } from 'vue-router';
import {supabase} from "../utils/supabaseClient.ts";
import {onMounted} from "vue";
import {useUserStore} from "../stores/user.ts";

const router = useRouter();
const user = useUserStore();

function parseHashFragment(): { accessToken: string | null; refreshToken: string | null } {
  const fullHash = window.location.hash;
  const secondHashIndex = fullHash.indexOf('#', 1); // Find the second hash fragment

  if (secondHashIndex !== -1) {
    const queryString = fullHash.substring(secondHashIndex + 1); // Extract everything after the second #
    const params = new URLSearchParams(queryString);

    return {
      accessToken: params.get('access_token'),
      refreshToken: params.get('refresh_token'),
    };
  }

  console.error('No second hash fragment found.');
  return { accessToken: null, refreshToken: null };
}

async function loginUserWithTokens(accessToken: string, refreshToken: string): Promise<void> {
  try {
    const { data, error } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    });

    if (error) {
      console.error('Error setting session:', error.message);
      await router.push('/login');
    }

    try {
      user.login(data.user.id, data.session.access_token);
      console.log('User logged in successfully:', data);
    } catch (e) {
      await router.push('/logout');
    }

    await router.push('/');
  } catch (err) {
    console.error('Unexpected error during login:', err);
  }
}

onMounted(async () => {
  const { accessToken, refreshToken } = parseHashFragment();

  if (accessToken && refreshToken) {
    await loginUserWithTokens(accessToken, refreshToken);
  } else {
    console.error('Missing access or refresh token.');
    await router.push('/login');
  }
});
</script>

<template>
<div>Loading, please wait...</div>
</template>

<style scoped>

</style>