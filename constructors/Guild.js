const {
  verificationLevel,
  systemChannelFlags,
  defaultMessageNotificationLevel
} = require('../Constants');
const { parseFlags, snowflakeDate } = require('../Util');

module.exports = class Guild {
    constructor(data) {
        this.ownerID = data.owner_id;
        this.icon = data.icon;
        this.maxVideoChannelUsers = data.max_video_channel_users;
        this.unavailable = data.unavailable;
        this.verificationLevel = verificationLevel[verificationLevel.indexOf(data.verification_level) || 0];
        this.rulesChannelID = data.rules_channel_id;
        this.afk_timeout = data.afk_timeout != null ? data.afk_timeout : 300;
        this.premiumSubscriptionCount = data.premium_subscription_count || 0;
        this.nsfw = data.nsfw;
        this.mfaRequirement = !!data.mfa_level;
        this.name = data.name;
        this.joinedAt = new Date(data.joined_at);
        this.systemChannelFlags = data.system_channel_flags ? (Object.entries(parseFlags(data.system_channel_flags, systemChannelFlags)).find(x => x[1]) || [])[0] : null;
        this.banner = data.banner;
        this.systemChannelID = data.system_channel_id;
        this.vanityURL = data.vanity_url_code;
        this.discoverySplash = data.discovery_splash;
        this.publicUpdatesChannelID = data.public_updates_channel_id;
        this.premiumTier = data.premium_tier || 0;
        this.splash = data.splash;
        this.memberCount = data.member_count;
        this.voiceStates = data.voice_states;
        this.description = data.description;
        this.presences = data.presences;
        this.applicationID = data.application_id;
        this.afkChannelID = data.afk_channel_id;
        this.region = data.region;
        this.features = data.features;
        this.maximumMembers = data.max_members;
        this.stageInstances = data.stage_instances;
        this.threads = data.threads;
        this.defaultMessageNotifications = defaultMessageNotificationLevel[defaultMessageNotificationLevel.indexOf(data.default_message_notifications) || 0];
        this.large = data.large;
        this.id = data.id;
    }
    
    get createdAt() {
        return snowflakeDate(this.id);
    }
};
