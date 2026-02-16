import axios from "axios";
import { Friends } from "../models/Friends";
import { useUserStore } from "../stores/user";

import { UserSummary } from "../models/UserSummary";

class UserRepository {
  private url = import.meta.env.VITE_API_URL;
  private user = useUserStore();

  public async fetchFriends() {
    try {
      const response = await axios.get(
        `${this.url}/API/API_GetUsersIFollow.php`,
        {
          params: { y: this.user.key },
        },
      );
      return response.data as Friends;
    } catch (error) {
      console.error("Error fetching request:", error);
      throw error;
    }
  }

  public async fetchUserSummary(username: string) {
    try {
      const response = await axios.get(
        `${this.url}/API/API_GetUserSummary.php`,
        {
          params: { y: this.user.key, u: username },
        },
      );
      return response.data as UserSummary;
    } catch (error) {
      console.error("Error fetching user summary:", error);
      throw error;
    }
  }
}

export default UserRepository;
