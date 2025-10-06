import twilio from "twilio";
import dotenv from "dotenv";
dotenv.config();

const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

export const checkTwilioAccountStatus = async () => {
    try {
        const account = await client.api.accounts(process.env.TWILIO_ACCOUNT_SID).fetch();
        console.log("🔍 Twilio Account Status:", account.status);
        console.log("🔍 Account Type:", account.type);
        console.log("🔍 Trial Account?", account.status === 'active' && account.type === 'Trial');

        return {
            status: account.status,
            type: account.type,
            isTrial: account.status === 'active' && account.type === 'Trial'
        };
    } catch (error) {
        console.error("❌ Error fetching Twilio account status:", error.message);
        return null;
    }
};
