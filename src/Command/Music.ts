import Discord, { VoiceChannel, Message, StreamDispatcher, Client } from "discord.js";
import Commands from "../core/commands";
import youtubedl from "ytdl-core";
import ytsearch, { YouTubeSearchResults, YouTubeSearchOptions } from "youtube-search"
import { youtubeapitoken } from "../Config";

let opts: YouTubeSearchOptions = {
    maxResults: 10,
    key: youtubeapitoken
}

class Music extends Commands {

}

class Soninif {
    public url: string;
    public title: string;
    public img: string;
    public s: string;
    constructor(inif: YouTubeSearchResults, s: string) {
        this.url = inif.link
        this.title = inif.title
        this.img = inif.thumbnails.default.url
        this.s = s
    }
}

class PlayList {
    public id: string;
    public songlist: Soninif[];
    public nowplay: Soninif;
    public skip: boolean
    public play: boolean;
    public dispatcher: StreamDispatcher;
    public paused: boolean;
    public resume: boolean;
    public sw: boolean;
    constructor(id: string) {
        this.id = id
        this.songlist = []
        this.nowplay
        this.skip = false
        this.play = false
        this.dispatcher = null
        this.paused = false
        this.resume = false
        this.sw = false
    }
    public songadd(inif: YouTubeSearchResults[], s: string) {
        this.songlist.push(new Soninif(inif[0], s))
        //console.log(this.songlist)
    }
    public playsong(voice: { join: VoiceChannel, pl: PlayList }) {
        voice.join.join().then((connection: Discord.VoiceConnection) => {
            if (voice.pl.play === false) {
                if (voice.pl.songlist.length === 0) {
                    voice.pl.nowplay = null
                    return
                }
                //console.log(voice.pl.songlist1()[0].url)
                voice.pl.dispatcher = connection.play(youtubedl(voice.pl.songlist[0].url))
                //console.log(dispatcher)
                voice.pl.nowplay = voice.pl.songlist[0]
                voice.pl.songlist.shift()
                voice.pl.play = true
            } else {
                voice.pl.play = voice.pl.dispatcher.writable
                //console.log(voice.pl.dispatcher.paused, voice.pl.paused, voice.pl.play)
                if (!voice.pl.dispatcher.paused && voice.pl.paused && voice.pl.play) {
                    voice.pl.dispatcher.pause()
                    voice.pl.paused = false
                    voice.pl.sw = true
                }
                if (voice.pl.dispatcher.paused && voice.pl.resume) {
                    voice.pl.resume = false
                    voice.pl.dispatcher.resume()
                    voice.pl.sw = false
                }
                if (voice.pl.dispatcher.writable && voice.pl.skip) {
                    voice.pl.dispatcher.pause()
                    voice.pl.skip = false
                    voice.pl.play = false
                }
            }
        });
    }
    public skipw(x: string) {
        if (this.id !== x) return false
        this.skip = true
        return true
    }
    public pausew(x: string) {
        if (this.id !== x) return false
        this.paused = true
        return true
    }
    public resumew(x: string) {
        if (this.id !== x) return false
        this.resume = true
        return true
    }
    public nowpalytime(msg: Message, pl: PlayList) {
        let nowpp = Embed.embed()
        if (pl.nowplay.s === "0") {
            nowpp.setDescription(`正在播放:
            [${pl.nowplay.title}](${pl.nowplay.url})
            時間:${Math.floor(pl.dispatcher.streamTime / 60000)}:${Math.floor(pl.dispatcher.streamTime / 1000 % 60)}/∞`)
        } else {
            nowpp.setDescription(`正在播放:
            [${pl.nowplay.title}](${pl.nowplay.url})
            時間:${Math.floor(pl.dispatcher.streamTime / 60000)}:${Math.floor(pl.dispatcher.streamTime / 1000 % 60)}/${Math.floor(Number.parseInt(pl.nowplay.s) / 60)}:${Number.parseInt(pl.nowplay.s) % 60}`)
        }
        msg.channel.send(nowpp)
    }
}

class Player {
    public voiceid: { [channelid: string]: { join: VoiceChannel, pl: PlayList } }
    public constructor() {
        this.voiceid = {}
    }
    public AddPlayer(channel: VoiceChannel, playlist: PlayList) {
        let voicechannel = channel
        this.voiceid[channel.id] = { "join": voicechannel, "pl": playlist }
    }
    public Run() {
        let w = this.voiceid
        const delay = (s: number) => {
            return new Promise(function (resolve) { // 回傳一個 promise
                setTimeout(resolve, s); // 等待多少秒之後 resolve()
            });
        };
        ~async function (w) {
            while (1) {
                for (let i of Object.keys(w)) {
                    w[i].pl.playsong(w[i])
                }
                await delay(1500)
            }
        }(w)
    }
}

class Embed {
    public static embed() {
        let embed = new Discord.MessageEmbed();
        embed.setTitle("Music system")
        embed.setFooter("Author is xiao xigua", "https://cdn.discordapp.com/avatars/458988300418416640/544a35606fc1bf5e7a147aafc9759179.png?size=4096")
        return embed
    }
    public static Notvoicrasme(msg: Message) {
        // embed.setAuthor(msg.author.tag, msg.author.avatarURL())
        return Embed.embed().setDescription(`${msg.author.tag}\n你似乎跟我在不同的語音`)
    }
    public static Notinvoie(msg: Message) {
        return Embed.embed().setDescription(`${msg.author.tag}\n你似乎不再語音`)
    }
    public static playinif(w: YouTubeSearchResults[]) {
        let qqq = Embed.embed()
        qqq.setDescription(`搜尋:\n[${w[0].title}](${w[0].link})`)
        qqq.setThumbnail(w[0].thumbnails.default.url)
        return qqq
    }
    public static botnotinvoice(msg: Message) {
        return Embed.embed().setDescription(`${msg.author.tag}你似乎沒有把我加進語音優`)
    }
}

function Search(search: string, pl: PlayList, msg) {
    ytsearch(search, opts, (err, results) => {
        if (err) console.log(err)
        youtubedl.getInfo(results[0].link).then(w => {
            pl.songadd(results, w.videoDetails.lengthSeconds);
        });
        msg.channel.send(Embed.playinif(results));
    })
}

export default (bot: Client) => {
    let commands = new Music(bot);
    let player = new Player();
    player.Run();
    let Guilds = {};
    commands.command(function play(msg: Message, search: string = null) {
        if (search !== null) {
            if (msg.member.voice.channel === null) {
                msg.channel.send(Embed.Notinvoie(msg));
                return;
            }
            if (!Object.keys(Guilds).includes(msg.guild.id)) {
                let pl = new PlayList(msg.member.voice.channel.id);
                Guilds[msg.guild.id] = pl;
                player.AddPlayer(msg.member.voice.channel, pl);
                Search(search, pl, msg);
            } else {
                if (msg.member.voice.channel.id !== Guilds[msg.guild.id].id) {
                    msg.channel.send(Embed.Notvoicrasme(msg));
                    return;
                }
                Search(search, Guilds[msg.guild.id], msg);
            }
        }
    });
    commands.command(function skip(msg: Message) {
        if (msg.member.voice.channel === null) {
            msg.channel.send(Embed.Notinvoie(msg));
            return;
        }
        if (Object.keys(Guilds).includes(msg.guild.id)) {
            if (Guilds[msg.guild.id].songlist.length === 0) {
                msg.channel.send(Embed.embed().setDescription("已經沒有歌曲可以跳搂~"));
                return;
            }
            if (!Guilds[msg.guild.id].skipw(msg.member.voice.channel.id)) {
                msg.channel.send(Embed.Notvoicrasme(msg));
            } else {
                msg.channel.send(Embed.embed().setDescription("以跳過"));
            };
        } else {
            msg.channel.send(Embed.botnotinvoice(msg));
        }
    });
    commands.command(function pause(msg: Message) {
        if (msg.member.voice.channel === null) {
            msg.channel.send(Embed.Notinvoie(msg));
            return;
        }
        if (Object.keys(Guilds).includes(msg.guild.id)) {
            if (Guilds[msg.guild.id].sw) {
                msg.channel.send(Embed.embed().setDescription("已經暫停了優~~"));
            } else {
                if (!Guilds[msg.guild.id].pausew(msg.member.voice.channel.id))
                    msg.channel.send(Embed.Notvoicrasme(msg));
                else {
                    msg.channel.send(Embed.embed().setDescription("已暫停"));
                }
            }
        } else {
            msg.channel.send(Embed.botnotinvoice(msg));
        }
    });
    commands.command(function resume(msg: Message) {
        if (msg.member.voice.channel === null) {
            msg.channel.send(Embed.Notinvoie(msg));
            return;
        }
        if (Object.keys(Guilds).includes(msg.guild.id)) {
            if (!Guilds[msg.guild.id].sw) {
                msg.channel.send(Embed.embed().setDescription("已經在播放了優~~"));
            } else if (!Guilds[msg.guild.id].resumew(msg.member.voice.channel.id))
                msg.channel.send(Embed.Notvoicrasme(msg));
        } else {
            msg.channel.send(Embed.botnotinvoice(msg));
        }
    });
    commands.command(function join(msg: Message) {
        if (msg.member.voice.channel === null) {
            msg.channel.send(Embed.Notinvoie(msg));
            return;
        }
        if (!Object.keys(Guilds).includes(msg.guild.id)) {
            let pl = new PlayList(msg.member.voice.channel.id);
            Guilds[msg.guild.id] = pl;
            player.AddPlayer(msg.member.voice.channel, pl);
        }
    });
    commands.command(function nowplay(msg: Message) {
        if (msg.member.voice.channel === null) {
            msg.channel.send(Embed.Notinvoie(msg));
            return;
        }
        if (Object.keys(Guilds).includes(msg.guild.id)) {
            if (msg.member.voice.channel.id !== Guilds[msg.guild.id].id) {
                msg.channel.send(Embed.Notvoicrasme(msg));
                return;
            } else {
                if (Guilds[msg.guild.id].nowplay !== null) {
                    Guilds[msg.guild.id].nowpalytime(msg, Guilds[msg.guild.id]);
                } else {
                    msg.channel.send(Embed.embed().setDescription("沒有再播放歌曲優~"));
                }
            }
        } else {
            msg.channel.send(Embed.botnotinvoice(msg));
        }
    });
    commands.command(function queue(msg: Message) {
        if (msg.member.voice.channel === null) {
            msg.channel.send(Embed.Notinvoie(msg));
            return;
        }

        if (Object.keys(Guilds).includes(msg.guild.id)) {
            if (msg.member.voice.channel.id !== Guilds[msg.guild.id].id) {
                msg.channel.send(Embed.Notvoicrasme(msg));
                return;
            } else {
                if (Guilds[msg.guild.id].songlist.length !== 0) {
                    let text = "";
                    let w = 1;
                    for (let i of Guilds[msg.guild.id].songlist) {
                        text += `${w}.[${i.title}](${i.url})\n`;
                        w += 1;
                    }
                    msg.channel.send(Embed.embed().setDescription(text));
                } else {
                    msg.channel.send(Embed.embed().setDescription("沒有歌摟~"));
                }
            }
        } else {
            msg.channel.send(Embed.botnotinvoice(msg));
        }
    });
    bot.AddCog(commands);
}