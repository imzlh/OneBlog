import { VERSION } from "./main.ts";

export class vResponse{
    constructor(
        private $request: Request,
        private $iaddr: Deno.Addr,
        private $headers: Headers,
        private $callback: (res: Response) => void
    ){
        this.$urlObj = new URL(this.$request.url, `http://${this.$request.headers.get("host") || this.addr}`);
    }

    private $status = 200;
    private $content: (string | Uint8Array)[] = [];
    private $urlObj;
    private $time = Date.now();

    header(key: string, value: string){
        this.$headers.set(key, value);
        return this;
    }

    status(code: number){
        this.$status = code;
        return this;
    }

    chunk(chunk: string | Uint8Array){
        this.$content.push(chunk);
        return this;
    }

    end(chunk?: string | Uint8Array | ReadableStream<Uint8Array>){
        if(chunk && !(chunk instanceof ReadableStream)) this.chunk(chunk);
        const body = chunk instanceof ReadableStream? chunk : new Blob(this.$content),
            res = new Response(this.$status == 204 ? null : body, {
                status: this.$status,
                headers: this.$headers
            });
        this.$callback(res);
        console.log(`${this.req.method} ${this.req.url} ${this.$status} ${Date.now() - this.$time}ms`)
    }
    
    get req(){
        return this.$request;
    }

    get addr(){
        switch(this.$iaddr.transport){
            case "tcp":
                return `tcp://${this.$iaddr.hostname}:${this.$iaddr.port}/`;
            case "unix":
                return `unix://${encodeURIComponent(this.$iaddr.path)}/`;
            default:
                return "unknown://0/";
        }
    }

    get url(){
        return this.$urlObj;
    }
}

export default class Server{
    constructor(
        private $scheme: string,
        private $port: number,
        private $host: string
    ){}

    private $server: Deno.HttpServer | undefined;
    private $defHeader: Record<string, string> = {
        "Content-Type": "application/json; charset=utf-8",
        "Server": "OneComment/" + VERSION
    };
    private $handlers: Map<string, (res: vResponse) => any> = new Map();

    on(method: string, handler: (res: vResponse) => any){
        this.$handlers.set(method, handler);
        return this;
    }

    header(key: string, value: string){
        this.$defHeader[key] = value;
        return this;
    }

    start(){
        const handler = (req: Request, inf: Deno.ServeHandlerInfo) => {
            if(req.method == "OPTIONS")
                return new Response(null, {
                    status: 204,
                    headers: new Headers(this.$defHeader)
                });
            // deno-lint-ignore no-async-promise-executor
            return new Promise<Response>(async rs => {
                const res = new vResponse(req, inf.remoteAddr, new Headers(this.$defHeader), rs);
                if(!this.$handlers.has(req.method))
                    return res.status(405).end();
                else try{
                    await this.$handlers.get(req.method)!(res);
                }catch(e){
                    console.error(e);
                    res.status(500).end();
                }
            })
        };
        this.$server = this.$scheme == 'unix'
            ? Deno.serve({
                path: this.$host,
            }, handler)
            : Deno.serve({
                hostname: this.$host,
                port: this.$port,
            }, handler);
    }

    end(){
        this.$server && this.$server.shutdown();
    }
}