const kvdb = await Deno.openKv('./oneblog.db');

export class Comment{
    private constructor(
        private $data: IComment,
        private $from_post?: string
    ){
        if(!$data) throw new Error('Comment data not provided');
    };

    static async get_by_id(id: string): Promise<Comment>{
        // @ts-ignore Will throw error if $data is not provided
        return new this((await kvdb.get<IComment>(['by_id', id])).value);
    }

    static async get_by_postid(postid: string): Promise<Comment[]>{
        const idList = (await kvdb.get<string[]>(['by_post', postid])).value;
        if(!idList) return [];
        return Promise.all(idList.map(Comment.get_by_id));
    }

    static async put_by_postid(postid: string, comment: Partial<IComment>){
        if(!comment.uuid){
            let uuid = '';
            do uuid = crypto.randomUUID(); while (await kvdb.get<IComment>(['by_id', uuid]));
            comment.uuid = uuid;
        }

        const idList = (await kvdb.get<string[]>(['by_post', postid])).value || [];
        idList.push(comment.uuid);
        kvdb.atomic()
            .set(['by_id', comment.uuid], comment)
            .set(['by_post', postid], idList);
    }

    async subComment(){
        const childrenList = await kvdb.get<string[]>(['children', this.$data.uuid]);
        if(!childrenList.value) return [];
        const result = [];
        for(const id of childrenList.value)
            result.push(await Comment.get_by_id(id));
        return result;
    }

    async putComment(comment: Partial<IComment>){
        if(!comment.uuid){
            let uuid = '';
            do uuid = crypto.randomUUID(); while (await kvdb.get<IComment>(['by_id', uuid]));
            comment.uuid = uuid;
        }

        kvdb.atomic()
            .set(['by_id', comment.uuid], comment)
            .set(['children', this.$data.uuid], comment.uuid);
    }

    async export(){
        const tree: Record<string, any> = {};
        for(const [key, val] of Object.entries(this.$data))
            if(key === 'children'){
                const children = await this.subComment();
                tree[key] = children.map(c => c.export());
            } else {
                tree[key] = val;
            }
        return tree as IComment;
    }
}