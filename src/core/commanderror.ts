export default class CommandsError extends Error {
    public constructor(w: string, errorname: string) {
        super(w);
        this.name = errorname;
    }
}