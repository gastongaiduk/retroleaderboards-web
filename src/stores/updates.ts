import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { supabase } from "../utils/supabaseClient";
import { Update } from "../models/Update";

export const useUpdatesStore = defineStore("updates", () => {
    const updates = ref<Update[] | null>(null);

    const updatesNumber = computed(() => {
        return updates.value?.filter((update) => !update.read_at).length || 0;
    });

    const fetchUpdates = async (): Promise<void> => {
        const { data, error } = await supabase
            .from("leaderboards_updates")
            .select(
                `
        leaderboard_id,
        friend_name,
        user_score,
        friend_score,
        created_at,
        read_at,
        leaderboards (name, description, game_id, games (name, image_icon))
      `
            )
            .is("deleted_at", null)
            .order("created_at", { ascending: false });

        if (error) {
            console.error("Error fetching updates:", error);
            return;
        }

        updates.value = data as unknown as Update[];
    };

    const markUpdateAsRead = async (
        id: number,
        user_id: string,
        friend: string
    ): Promise<void> => {
        const { error } = await supabase
            .from("leaderboards_updates")
            .update({ read_at: new Date() })
            .eq("leaderboard_id", id)
            .eq("user_id", user_id)
            .eq("friend_name", friend)
            .select();

        if (error) {
            console.log("Error while changing update status to read: ", error);
            return;
        }

        await fetchUpdates();
    };

    const deleteUpdate = async (
        id: number,
        user_id: string,
        friend: string
    ): Promise<void> => {
        const { error } = await supabase
            .from("leaderboards_updates")
            .update({ deleted_at: new Date() })
            .eq("leaderboard_id", id)
            .eq("user_id", user_id)
            .eq("friend_name", friend)
            .select();

        if (error) {
            console.log("Error while changing update status to deleted: ", error);
            return;
        }

        await fetchUpdates();
    };

    return {
        updates,
        updatesNumber,
        fetchUpdates,
        markUpdateAsRead,
        deleteUpdate,
    };
});
