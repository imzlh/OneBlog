interface IPost {
    /**
     * 创建时间
     */
    created: bigint;
    /**
     * 修改时间
     */
    modified: bigint;
    /**
     * 扩展名之前的文件名
     */
    name: string;

    /**
     * 文章标题
     */
    title: string;
    /**
     * 排序，越大越靠前
     */
    order: number;

    /**
     * 附件列表
     */
    attachment: string[];

    /**
     * 标签
     */
    tags: string[];
    /**
     * 分类
     */
    category?: string;

    /**
     * 摘录
     */
    outline: string;
}