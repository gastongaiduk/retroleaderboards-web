import { ref } from "vue";
import { supabase } from "../utils/supabaseClient.ts";
import { Subscription } from "../models/Subscription.ts";

export function useSubscriptionList() {
  const subscriptions = ref<Subscription[] | null>(null);

  const fetchSubscriptions = async (): Promise<void> => {
    subscriptions.value = null;
    let { data, error } = await supabase
      .from("game_subscriptions")
      .select(
        `
        game_id,
        created_at,
        games (name, image_icon)
      `,
      )
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching updates:", error);
      return;
    }

    subscriptions.value = data as Subscription[] | null;
  };

  return {
    subscriptions,
    fetchSubscriptions,
  };
}
