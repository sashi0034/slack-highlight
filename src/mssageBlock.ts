import {SlackBlock} from "./slackActionWrapper";


export function getContentsBlock(header: string, content: string, subContents: string[]) {
    const result: SlackBlock = [
        {
            "type": "header",
            "text": {
                "type": "plain_text",
                "text": `#${header}`,
                "emoji": true
            }
        },
        {
            "type": "divider"
        },
        {
            "type": "section",
            "text": {
                "type": "mrkdwn",
                "text": `${content}`
            }
        }
    ];
    for (const sub of subContents) {
        if (sub === undefined || sub === "") continue;
        result.push({
            "type": "context",
            "elements": [
                {
                    "type": "mrkdwn",
                    "text": sub
                },
            ]
        });
    }
    // result.push({
    //     "type": "divider"
    // });
    return result;
}


