import tasks from "./tasks"
import CommandError from "./commanderror"
import { Message, Client } from "discord.js"

interface CommandDict {
    name?: string,
    aliases?: string[],
    help?: any,
    brief?: any
}

class command {
    public fun: Function;
    public name: string;
    public aliases: string[];
    public help: string;
    public brief: string;

    constructor(fun: Function, name: string, aliases: string[], help: string, brief: string) {
        this.fun = fun;
        this.name = name;
        this.aliases = aliases;
        this.help = help;
        this.brief = brief;
    }
    public Run() {
        let co = {};
        co[this.name] = this.fun;
        if (this.aliases === null) {
            return co;
        }
        for (let i of this.aliases) {
            co[i] = this.fun;
        }
        return co;
    }
    public error(fun: Function) {
        let fune = this.fun;
        this.fun = async (msg: any, ...x: any) => {
            try {
                await fune(msg, ...x);
            } catch (error) {
                fun(msg, error);
            }
        }
    }
}
class Group {
    public fun: Function;
    public name: string;
    public aliases: string[];
    public help: string;
    public brief: string;
    public groupcommands = {};
    public commandslist: command[] = [];
    public errorfun = async (msg: any, error: any) => { };
    constructor(fun: Function, name: string, aliases: string[], help: string, brief: string) {
        this.fun = fun;
        this.name = name;
        this.aliases = aliases;
        this.help = help;
        this.brief = brief;
    }
    public command(fun: Function, dict: CommandDict = null) {
        dict = dict || {}
        dict.name = dict.name || null;
        dict.aliases = dict.aliases || null;
        dict.help = dict.help || null;
        dict.brief = dict.brief || null;
        if (dict.name === null) {
            dict.name = fun.name;
        }
        let commandw = new command(fun, dict.name, dict.aliases, dict.help, dict.brief)
        this.commandslist.push(commandw)
        return commandw
    }
    public Run() {
        let fuf = this.fun
        for (let i of this.commandslist) {
            Object.assign(this.groupcommands, i.Run())
        }
        let ww = this.groupcommands
        let pp = this.errorfun
        let commandee = new command(async (msg: any, ...x: any[]) => {
            try {
                if (x.length === 0) {
                    await fuf(msg, ...x)
                } else {
                    await fuf(msg, ...x)
                    let w = x.shift()
                    if (Object.keys(ww).includes(w)) {
                        ww[w](msg, ...x)
                    } else {
                        throw new CommandError(`Not command is ${w}`, "Commands.Error.GroupNotCommand")
                    }
                }
            } catch (error) {
                await pp(msg, error)
            }
        }, this.name, this.aliases, this.help, this.brief)
        return commandee.Run()
    }
    public error(fun: { (msg: any, error: any): Promise<void>; (msg: any, error: any): Promise<void>; }) {
        this.errorfun = fun
    }
}

export default class Commands {
    public bot: Client;
    public tasks: tasks;
    public name: string;
    private commands = {}
    private event: Function[] = []
    private commandlist: command[] = []
    private grouplist: Group[] = []
    public constructor(bot: Client, name?: string) {
        this.bot = bot
        this.tasks = new tasks(bot)
        if (name) {
            this.name = name
        } else {
            this.name = this.constructor.name
        }
    }
    public command(fun: Function, dict?: CommandDict) {
        if (fun.name !== null) {
            let commandw: command;
            dict = dict ?? {}
            dict.name = dict?.name ?? null;
            dict.aliases = dict?.aliases ?? null;
            dict.help = dict?.help ?? null;
            dict.brief = dict?.brief ?? null;

            if (dict.name !== null) {
                commandw = new command(fun, dict.name, dict.aliases, dict.help, dict.brief)
            } else {
                commandw = new command(fun, fun.name, dict.aliases, dict.help, dict.brief)
            }
            this.commandlist.push(commandw)
            return commandw
        }
    }
    public commandsreturn() {
        for (let i of this.commandlist) {
            Object.assign(this.commands, i.Run())
        }
        return this.commands
    }
    public listener(fun: Function) {
        this.event.push(fun)
    }
    public eventretuen() {
        return this.event
    }
    public cogreturn() {
        return this.commandlist;
    }
    public group(fun: Function, dict?: CommandDict) {
        dict = dict ?? {}
        dict.name = dict?.name ?? null;
        dict.aliases = dict?.aliases ?? null;
        dict.help = dict?.help ?? null;
        dict.brief = dict?.brief ?? null;
        if (dict.name === null) {
            dict.name = fun.name
        }
        if (fun.name) {
            let group = new Group(fun, dict.name, dict.aliases, dict.help, dict.brief)
            this.commandlist.push(group)
            this.grouplist.push(group)
            return group
        }
    }
    public groupreturn() {
        for (let i of this.grouplist) {
            return i.Run()
        }
    }

    public is_owner(message: { author: { id: string; }; }) { //是不是作者
        if (message.author.id !== this.bot.owner) {
            throw new CommandError("You are not the owner.", "Commands.Error.owner")
        }
    }
    public has_any_role(message: Message, ...a: (string | number)[]) {
        for (let eqw of message.member.roles.cache) {
            if (a.includes(Number(eqw[0])) || a.includes(eqw[1].name)) {
                return
            }
        }
        throw new CommandError("You are not the role.", "Commands.Error.role")
    }
    public is_guild_owner(message: Message) {
        if (message.guild.owner.id !== message.member.id) {
            throw new CommandError("You are not guild owner.", "Commands.Error.guild_owner")
        }
    }
}