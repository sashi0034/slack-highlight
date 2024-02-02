import {App, GenericMessageEvent} from "@slack/bolt";
import config from "./config.json";

import SlackActionWrapper from "./slackActionWrapper";
import log4js from "log4js";
import {ChannelGacha} from "./channelGacha";
import {HighlightAdministrator} from "./HighlightAdministrator";

export async function processBotRoutine() {
    const app: App = new App({
        token: config.botToken,
        appToken: config.appToken,

        socketMode: true
    });

    const slackAction = new SlackActionWrapper(app, config)
    await slackAction.postMessage("Initializing...")

    const highlightAdministrator = new HighlightAdministrator(slackAction);

    app.event("reaction_added", async ({event, say}) => {
        highlightAdministrator.onReactionAdded(event);
    });

    app.event("message", async ({event, say}) => {
        const messageEvent: GenericMessageEvent = event as GenericMessageEvent
        // if (messageEvent.subtype !== undefined && messageEvent.subtype === "message_changed") return;
        if (messageEvent.subtype === "bot_message") return;
        // if (messageEvent.channel !== config.targetChannel) return;
        // console.log(messageEvent)
        // channelGacha.postChannelInfoRandom(config.targetChannel);
    });

    await app.start();
    highlightAdministrator.startProcess();

    log4js.getLogger().info("Bolt app is running up.");
    await slackAction.postMessage("finish setup")
}


