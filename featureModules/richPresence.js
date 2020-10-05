// Discord Rich Presence for Zeno Client
// By TheDevKeval - Keval#8167
// mf don't you dare remove this...
const {discordClientID: clientID, gameLoaded, getGame} = require('../consts.js');
const RPC = require("discord-rpc");
const discordClient = new RPC.Client({
    transport: "ipc"
});

function initDiscord() {
    discordClient.login({ clientId: clientID })

    discordClient.on("ready", () => {
        discordClient.setActivity({
            details: `${discordClient.user.username}`,
            state: "Started Playing",
            largeImageKey: "zeno_menu",
            largeImageText: "Zeno Client",
            smallImageKey: "zeno_menu",
            smallImageText: `${discordClient.user.username}#${discordClient.user.discriminator}`,
        });

        discordClient.subscribe("ACTIVITY_INVITE", (para) => {
            window.location.href = `https://krunker.io/?game=${para.activity.party.id}`;
        });

        discordClient.subscribe("ACTIVITY_JOIN_REQUEST", ({ user }) => {
            var { id, username, discriminator, avatar } = user;
            window.confirm(`${username}#${discriminator} wants to join your game!`) ?
                () => {
                    discordClient.request("SEND_ACTIVITY_JOIN_INVITE", { user_id: id });
                } :
                () => {
                    discordClient.request("CLOSE_ACTIVITY_REQUEST", { user_id: id });
                };
        });

        setInterval(() => {
            updateDiscord();
        }, 1000);
    });
}

var gameMode = null;
var mapName = null;
var className = null;
var timeLeft = null;
var gameActivity = null;
var id = null;
var playerCount = null
var playerMax = null

function updateDiscord() {
    // var checkDat = undefined;
    // try {
    //     checkDat = window.getGameActivity();
    // } catch {}
    if (gameLoaded()) {
        gameActivity = window.getGameActivity();
        gameMode = gameActivity.mode;
        mapName = gameActivity.map;
        className = gameActivity.class.name;
        timeLeft = gameActivity.time;
        id = gameActivity.id;
        fetch(getGame(id))
            .then(res => res.json())
            .then(json => {
                playerCount = json[2];
                playerMax = json[3];
            })
            .catch(console.log);

        if (gameMode == undefined || mapName == undefined || className == undefined) { return console.log("Not Loaded") } else {
            discordClient.setActivity({
                details: `Playing ${gameMode}`,
                state: `on ${mapName}`,
                endTimestamp: Date.now() + timeLeft * 1000,
                largeImageKey: "zeno_menu",
                largeImageText: "Zeno Client",
                smallImageKey: `class_${className.toLowerCase()}`,
                smallImageText: className,
                partyId: id,
                matchSecret: id + '-match',
                spectateSecret: id + "-spectate",
                joinSecret: id + "-join",
                partyMax: playerMax,
                partySize: playerCount,
            });
        }
    }
}

exports.initDiscord = initDiscord;