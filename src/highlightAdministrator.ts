import SlackActionWrapper from "./slackActionWrapper";
import {ReactionAddedEvent} from "@slack/bolt";
import {sleepSeconds} from "./util";
import log4js from "log4js";
import config from "./config.json"

interface ItemData {
    ts: string,
    channel: string,
    reactedUsers: string[],
}

export class HighlightAdministrator {
    private currentData = new Map<string, ItemData>()

    public constructor(
        private readonly slackAction: SlackActionWrapper
    ) {
    }

    public async startProcess() {
        let lastPostDailyChannelDay = -1;
        while (true) {
            await sleepSeconds(60)

            const now = new Date();
            if (now.getDay() !== lastPostDailyChannelDay && now.getHours() === config.dailyPostHour) {
                // 日付が変わって特定の時間になったらメッセージ送信
                await this.slackAction.postMessage("おはようございます :tada: 昨日のハイライトはこれ :point_down:");
                await this.postHighlight();
                lastPostDailyChannelDay = now.getDay();
            }
        }
    }

    private async postHighlight() {
        if (this.currentData.size === 0) return

        // ソート
        log4js.getLogger().info(`Start sort ${this.currentData.size} messages`)
        const ranking: [string, ItemData][] = Array.from(this.currentData.entries());
        ranking.sort((a, b) => a[1].reactedUsers.length - b[1].reactedUsers.length)

        // チャンネル情報取得
        const channelList = await this.slackAction.fetchAllChannels()

        // 投稿
        let threadId: string | undefined = undefined
        const maxPost = 10
        for (let i = 0; i < maxPost; ++i) {
            if (i >= ranking.length) break
            const channel = channelList.find(c => c.id == ranking[i][1].channel)
            if (channel === undefined) continue

            const message = `<https://kmc-jp.slack.com/archives/${ranking[i][0]}|#${channel.name}>`
            if (threadId !== undefined) {
                // スレッド内
                await this.slackAction.postReply(message, threadId)
            } else {
                // トップ
                let result = await this.slackAction.postMessage(message)
                threadId = result.ts
            }
        }

        this.currentData.clear()
    }

    public onReactionAdded(event: ReactionAddedEvent) {
        const key = `${event.item.channel}/p${event.item.ts.replace(/\./g, "")}`
        const user = event.user
        console.log(key)
        if (!this.currentData.has(key)) {
            // まだリアクションがついていないアイテムへリアクション
            this.currentData.set(key, {
                ts: event.item.ts,
                channel: event.item.channel,
                reactedUsers: [user]
            })
        } else if (this.currentData.get(key)?.reactedUsers.indexOf(user) === -1) {
            // 既にリアクションがついたアイテムへ新しいユーザーがリアクション
            this.currentData.get(key)?.reactedUsers.push(user)
        }

        console.log(event)
    }
}