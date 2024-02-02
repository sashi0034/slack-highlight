import {connectLines, getDateString, randomInt, sleepSeconds} from "./util";
import config from "./config.json"
import SlackActionWrapper, {SlackChannel} from "./slackActionWrapper";
import {getContentsBlock} from "./mssageBlock";
import {getLogger} from "log4js";


export class ChannelGacha {
    private receivedChannelList: SlackChannel[] = []

    public constructor(
        private readonly slackAction: SlackActionWrapper
    ) {
    }

    public async startProcess() {
        const updateInterval = 60;

        let fetchRemaining = 0;
        let lastPostDailyChannelDay = -1;
        while (true) {

            fetchRemaining -= updateInterval;
            if (fetchRemaining <= 0) {
                // チャンネルリストの更新
                await this.driveFetchEvent();
                fetchRemaining = config.fetchInterval;
            }

            const now = new Date();
            if (now.getDay() !== lastPostDailyChannelDay && now.getHours() === config.dailyPostHour) {
                // 日付が変わって特定の時間になったら
                await this.postDailyMessage();
                lastPostDailyChannelDay = now.getDay();
            }

            await sleepSeconds(updateInterval);
        }
    }

    private async postDailyMessage() {
        getLogger().log("post daily message");
        await this.slackAction.postMessageAt("おはようございます :tada: 今日のおすすめチャンネルはこれ :point_down:", config.targetChannel);
        await this.postChannelInfoRandomBy(config.targetChannel, channel => (channel.num_members ?? 0) > 0);
    }

    private async driveFetchEvent() {
        this.receivedChannelList = await this.slackAction.fetchAllChannels();
        getLogger().log("received channels: " + this.receivedChannelList.length);

        await this.postChannelInfoRandom(config.targetChannel);
    }

    public async postChannelInfoRandom(targetChannel: string) {
        await this.postChannelInfoRandomBy(targetChannel, _ => true);
    }

    public async postChannelInfoRandomBy(targetChannel: string, channelFiltering: (channel: SlackChannel) => boolean) {
        if (this.receivedChannelList.length === 0) return;

        const filteredChannels = this.receivedChannelList.filter(channelFiltering);
        const channel = filteredChannels[randomInt(filteredChannels.length)];

        getLogger().info(channel);

        const content = getContentsBlock(
            channel.name as string,
            connectLines([
                `:house:    <#${channel.id}>`,
                `:people_holding_hands:    ${channel.num_members}`,
            ]), [
                `${channel.purpose?.value}`,
                `${channel.topic?.value}`
            ]);

        await this.slackAction.postBlockText(
            targetChannel,
            channel.name as string,
            content);
    }
}

