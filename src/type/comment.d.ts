interface IComment{
    /**
     * 评论时间
     */
    created: number;

    /**
     * 评论人
     */
    name: string;

    /**
     * 评论人邮箱
     */
    email: string;

    /**
     * 评论内容
     */
    content: string;

    /**
     * 评论人网站
     */
    website: string;

    /**
     * 评论人IP
     */
    ip: string;
    
    /**
     * 评论人UA
     */
    agent: string;

    /**
     * 子评论ID
     */
    children: IComment[];

    /**
     * 可选：头像
     */
    avator?: string;

    /**
     * 评论ID
     */
    uuid: string;
}