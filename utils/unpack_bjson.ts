import { decode } from "../src//utils/bjson.ts";

Deno.chdir(import.meta.dirname!);

// const args = parseArgs(Deno.args);
const packageJson = '../package.json';

const { config } = JSON.parse(Deno.readTextFileSync(packageJson));
const index_file = '../' + config.base + config.index;

const file = Deno.args[1] || index_file,
    output = Deno.args[2] || 'out.json',
    stream = Deno.openSync(file, { read: true });

const data = await decode(stream.readable);
Deno.writeTextFileSync(output, JSON.stringify(data, null, 4));
stream.close();
