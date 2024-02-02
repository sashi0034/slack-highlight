import {App, Block, KnownBlock} from "@slack/bolt";
import {stringify} from "querystring";
import Config from "./config.json";
import {Channel} from "@slack/web-api/dist/response/ConversationsListResponse"


export type SlackBlock = (KnownBlock | Block)[];
export type SlackChannel = Channel;


export default class SlackActionWrapper {

    public constructor(
        private readonly app: App,
        private readonly config: typeof Config
    ) {
    }

    public async postMessage(text: string) {
        return await this.postMessageAt(text, this.config.targetChannel);
    }

    public async postMessageAt(text: string, channel: string) {
        const result = await this.app.client.chat.postMessage({
            token: this.config.botToken,
            channel: channel,
            text: text,
        })

        if (!result.ok) console.error(result)

        return result;
    }

    public async postReply(text: string, threadTs: string) {
        const result = await this.app.client.chat.postMessage({
            token: this.config.botToken,
            channel: this.config.targetChannel,
            text: text,
            thread_ts: threadTs
        })

        if (!result.ok) console.error(result)

        return result;
    }

    public async updateMessage(timeStamp: string, text: string) {
        const result = await this.app.client.chat.update({
            token: this.config.botToken,
            channel: this.config.targetChannel,
            ts: timeStamp,
            text: text,
        })

        if (!result.ok) console.error(result)

        return result;
    }

    public async updateBlockText(timeStamp: string, text: string, blocks: SlackBlock) {
        const result = await this.app.client.chat.update({
            token: this.config.botToken,
            channel: this.config.targetChannel,
            ts: timeStamp,
            text: text,
            blocks: blocks,
        })

        if (!result.ok) console.error(result)

        return result;
    }

    public async postBlockText(channel: string, text: string, blocks: (KnownBlock | Block)[]) {
        const result = await this.app.client.chat.postMessage({
            token: this.config.botToken,
            channel: channel,
            text: text,
            blocks: blocks
        })

        if (!result.ok) console.error(result)

        return result
    }

    public async fetchEmojiList(): Promise<Array<string>> {
        let result: Array<string> = [];

        const fetchedList = await this.app.client.emoji.list({
            token: this.config.botToken
        });

        if (fetchedList.emoji == null) return result;

        for (let emoji in fetchedList.emoji) {
            result.push(emoji);
        }

        return result;
    }

    public async joinChannel(channelId: string) {
        const result = await this.app.client.conversations.join({
            token: Config.botToken,
            channel: channelId
        });

        if (!result.ok) console.error(result)

        return result;
    }

    public async leaveChannel(channelId: string) {
        const result = await this.app.client.conversations.leave({
            token: Config.botToken,
            channel: channelId
        });

        if (!result.ok) console.error(result)

        return result;
    }

    public async addEmoji(emojiName: string, channelId: string, timeStamp: string) {
        const result = await this.app.client.reactions.add({
            token: Config.botToken,
            channel: channelId,
            name: emojiName,
            timestamp: timeStamp
        });

        if (!result.ok) console.error(result)

        return result;
    }

    public async fetchAllChannels() {
        let result: SlackChannel[] = []
        let response = await this.app.client.conversations.list();
        while (true) {
            result = result.concat(response.channels as SlackChannel[]);
            const next = response.response_metadata?.next_cursor;
            if (next === undefined || next === null || next === "") break;
            response = await this.app.client.conversations.list({"cursor": next});
        }
        return result;
    }
}


