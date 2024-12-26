import axios from "axios";

interface CardContext {
  /**
   * 触发类型
   * @default "papi_query"
   * papi_query: 业务场景,如: 触发命令,开始查询
   * preview: 预览模式,用户在设置预览图片
   */
  type: "papi_query" | "preview";
  /**
   * 来自哪个服务器
   */
  from_server_token: string;
  /**
   * 发送人社交帐号ID
   */
  from_user_id: string;
  /**
   * 是否绑定了社交帐号
   */
  is_bind: boolean;
  /**
   * 绑定的第一个玩家的名字
   */
  first_player_name: string;
  /**
   * 绑定的所有玩家名字
   */
  player_name_list: string[];
}

declare function __internal_get_context(): Promise<string>;

/**
 * 获取上下文信息
 */
export async function readContext(): Promise<CardContext> {
  if (typeof __internal_get_context !== "function")
    return {
      type: "preview",
      from_server_token: "unknown",
      from_user_id: "unknown",
      is_bind: false,
      first_player_name: "unknown",
      player_name_list: ["unknown"],
    } as CardContext;
  return JSON.parse(await __internal_get_context()) as CardContext;
}

/**
 * 通过Url获取ApiKey
 */
export function readApiKey() {
  const url = new URL(window.location.href);
  const regex = /\/template\/proxy\/([^/]+)\//;
  const match = url.pathname.match(regex);
  return match ? match[1] : null;
}

/**
 * 读属于本图片模板的配置
 * @param key 键
 * @returns 没有就返回null
 */
export async function readOptions(key: string): Promise<any | null> {
  try {
    const response = await axios.get(
      "/template/api/" + readApiKey() + "/options",
      {
        params: {
          key: key,
        },
      }
    );
    return response.data || null; // 如果没有数据返回空对象
  } catch (error) {
    console.error("Error fetching options:", error);
    return null;
  }
}

/**
 * 写出属于本图片模板的配置
 * @param key 键
 * @param value 值
 */
export async function writeOptions(key: string, value: any) {
  await axios.post("/template/api/" + readApiKey() + "/options", {
    key: key,
    value: JSON.stringify(value),
  });
}

/**
 * 调用上下文服务器的PlaceholderApi
 * @param query 含有PlaceholderApi变量的文本
 * @param player 如果不指定玩家,就是Papi默认的 --null
 * @returns 处理后的文本
 */
export async function placeholder(
  query: string,
  player?: string
): Promise<string> {
  var result = await axios.post(
    "/template/api/" + readApiKey() + "/placeholder",
    {
      text: query,
      playerName: player,
      context: await readContext(),
    }
  );
  return result.data;
}

declare function parse(text: string): string;

/**
 * 将带有颜色标记的文本转换为 `HTML` 格式。
 * 需要带有指定的`css` 详见文档
 *
 * @param {string} text - 带有颜色标记的文本字符串。
 * @returns {string} 转换后的 HTML 字符串。
 */
export function coloredTextToHtml(text: string): string {
  return parse(text);
}
