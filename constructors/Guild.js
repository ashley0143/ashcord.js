const {
  verificationLevel,
  systemChannelFlags,
  defaultMessageNotificationLevel
} = require('../Constants');
const { parseFlags, snowflakeDate, assign, camelCase } = require('../Util');

module.exports = class Guild {
    constructor(data) {
        // someone give me a better approach to this i'm drunk
        assign(this, data, key => {
            if (key.includes('id')) return camelCase(key).replace(/Id/, 'ID');
            else if ([ 'roles', 'channels' ].includes(key)) return;
            return camelCase(key);
        });
        this.verificationLevel = verificationLevel[verificationLevel.indexOf(data.verification_level) || 0];
        this.afkTimeout = data.afk_timeout != null ? data.afk_timeout : 300;
        this.premiumSubscriptionCount = data.premium_subscription_count || 0;
        this.mfaRequirement = !!data.mfa_level;
        this.joinedAt = new Date(data.joined_at);
        this.systemChannelFlags = data.system_channel_flags ? (Object.entries(parseFlags(data.system_channel_flags, systemChannelFlags)).find(x => x[1]) || [])[0] : null;
        this.premiumTier = data.premium_tier || 0;
        this.defaultMessageNotifications = defaultMessageNotificationLevel[defaultMessageNotificationLevel.indexOf(data.default_message_notifications || 0)];
    }
    
    get createdAt() {
        return snowflakeDate(this.id);
    }
};