import SlackActionWrapper from "./slackActionWrapper";
import {ReactionAddedEvent} from "@slack/bolt";
import {sleepSeconds} from "./util";
import log4js from "log4js";

interface ItemData {
    ts: string,
    channel: string,
    reactedUsers: string[]
}

export class HighlightAdministrator {
    private currentData = new Map<string, ItemData>()

    public constructor(
        private readonly slackAction: SlackActionWrapper
    ) {
    }

    public async startProcess() {
        while (true) {
            await sleepSeconds(10)

            // メッセージ送信
            await this.postHighlight();
        }
    }

    private async postHighlight() {
        log4js.getLogger().info(`Start sort ${this.currentData.size} messages`)
        const ranking: [string, ItemData][] = Array.from(this.currentData.entries());
        ranking.sort((a, b) => a[1].reactedUsers.length - b[1].reactedUsers.length)

        for (let i = 0; i < 10; ++i) {
            if (i >= ranking.length) break
            await this.slackAction.postMessage(`https://kmc-jp.slack.com/archives/${ranking[i][0]}`)
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
        } else if (this.currentData.get(key)?.reactedUsers.indexOf(user) !== -1) {
            // 既にリアクションがついたアイテムへ新しいユーザーがリアクション
            this.currentData.get(key)?.reactedUsers.push(user)
        }

        console.log(event)
    }
}