export interface UserSummary {
    User: string;
    ULID: string;
    MemberSince: string;
    LastActivity: {
        timestamp: string | null;
    };
    RichPresenceMsg: string;
    RichPresenceMsgDate: string;
    LastGameID: number;
    TotalPoints: number;
    TotalTruePoints: number;
    Motto: string;
    Rank: number;
    Status: "Online" | "Offline" | string;
    UserPic: string;
    TotalRanked: number;
}
