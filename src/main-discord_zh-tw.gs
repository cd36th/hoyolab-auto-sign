const profiles = [
  { token: "ltoken=gBxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxCY; ltuid=26XXXXX20;", 
    genshin: true, 
    honkai_star_rail: true, 
    honkai_3: false, 
    accountName: "你的名子" }
];

const discord_notify = {
  on_run: true,
  on_error: false
}
const myDiscordID = ""
const discordWebhook = ""

/** 以上為設定檔，請參考 https://github.com/canaria3406/hoyolab-auto-sign 之說明進行設定**/
/** 以下為程式碼，請勿更動 **/

const urlDict = {
  Genshin: 'https://sg-hk4e-api.hoyolab.com/event/sol/sign?lang=zh-tw&act_id=e202102251931481',
  Star_Rail: 'https://sg-public-api.hoyolab.com/event/luna/os/sign?lang=zh-tw&act_id=e202303301540311',
  Honkai_3: 'https://sg-public-api.hoyolab.com/event/mani/sign?lang=zh-tw&act_id=e202110291205111'
}

async function main() {

  const messages = await Promise.all(profiles.map(autoSignFunction));
  const hoyolabResp = `${discordPing(discord_notify.on_run)}\n${messages.join('\n\n')}`

  if(discordWebhook) {
    postWebhook(hoyolabResp);
  }

}

function discordPing(pingWanted) {
  if(pingWanted && myDiscordID) {
    return `<@${myDiscordID}> `;
  } else {
    return '';
  }
}

function autoSignFunction({ token, genshin, honkai_star_rail, honkai_3, accountName }) {

  const urls = [];

  if (genshin) urls.push(urlDict.Genshin);
  if (honkai_star_rail) urls.push(urlDict.Star_Rail);
  if (honkai_3) urls.push(urlDict.Honkai_3);

  const header = {
    Cookie: token
  };

  const options = {
    method: 'POST',
    headers: header,
    muteHttpExceptions: true,
  };

  let response = `${accountName} 的自動簽到作業已完成`;

  const httpResponses = UrlFetchApp.fetchAll(urls.map(url => ({ url, ...options })));

  for (const [i, hoyolabResponse] of httpResponses.entries()) {
    const checkInResult = JSON.parse(hoyolabResponse).message;
    const enGameName = Object.keys(urlDict).find(key => urlDict[key] === urls[i]);
    switch (enGameName) {
      case 'Genshin':
      gameName = '原神';
      break;
      case 'Star_Rail':
      gameName = '星穹鐵道';
      break;
      case 'Honkai_3':
      gameName = '崩壞3rd';
      break;
    }
    const isError = checkInResult != "OK";
    response += `\n${gameName}: ${isError ? discordPing(discord_notify.on_error) : ""}${checkInResult}`;
  };

  return response;
}

function postWebhook(data) {

  let payload = JSON.stringify({
    'username': '自動簽到',
    'avatar_url': 'https://i.imgur.com/LI1D4hP.png',
    'content': data
  });

  const options = {
    method: 'POST',
    contentType: 'application/json',
    payload: payload,
    muteHttpExceptions: true,
  };

  UrlFetchApp.fetch(discordWebhook, options);
}
