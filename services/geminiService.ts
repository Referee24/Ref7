
import { GoogleGenAI, Type } from "@google/genai";
import { Question, QuestionType, StudyTopic } from "../types";

// Initialize Gemini Client
// Note: API Key is accessed via process.env.API_KEY as per instructions
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const MODEL_NAME = 'gemini-2.5-flash';

/**
 * Generates a set of exam questions based on FIBA rules.
 * It requests a JSON array from the model.
 */
export const generateExamQuestions = async (count: number = 5): Promise<Question[]> => {
  try {
    const prompt = `
      你是一名FIBA国际篮联规则专家，也是中国国家级篮球裁判员培训师。
      请生成 ${count} 道用于裁判理论考试的判断题 (Yes/No Question)。
      
      要求：
      1. 题目难度要符合国家级裁判员考试标准（较高难度）。
      2. 包含大约 70% 的纯理论文字题 (THEORY) 和 30% 的视频情境模拟题 (VIDEO)。
      3. 对于 VIDEO 类型的题目，在 'content' 字段中详细描述一个具体的比赛场景（例如：A1持球突破，B1在合理冲撞区内建立防守位置...），让考生判断判罚是否正确。
      4. 输出必须是简体中文。
      5. 返回严格的 JSON 格式。

      Schema:
      Array<Object> {
        content: string (题目描述或场景描述),
        type: string ("THEORY" or "VIDEO"),
        correctAnswer: boolean (true 代表 "是/正确/合规", false 代表 "否/错误/违例/犯规"),
        explanation: string (详细的规则解析，引用FIBA规则条款)
      }
    `;

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              content: { type: Type.STRING },
              type: { type: Type.STRING, enum: ['THEORY', 'VIDEO'] },
              correctAnswer: { type: Type.BOOLEAN },
              explanation: { type: Type.STRING }
            },
            required: ['content', 'type', 'correctAnswer', 'explanation']
          }
        }
      }
    });

    if (!response.text) {
      throw new Error("No data received from Gemini");
    }

    const rawData = JSON.parse(response.text);

    return rawData.map((item: any, index: number) => ({
      id: `q-${Date.now()}-${index}`,
      type: item.type === 'VIDEO' ? QuestionType.VIDEO : QuestionType.THEORY,
      content: item.content,
      correctAnswer: item.correctAnswer,
      explanation: item.explanation,
      videoPlaceholderUrl: item.type === 'VIDEO' ? `https://picsum.photos/800/450?random=${index}` : undefined
    }));

  } catch (error) {
    console.error("Error generating exam:", error);
    // Fallback questions in case of API failure or quota issues
    return [
      {
        id: 'fallback-1',
        type: QuestionType.THEORY,
        content: '在第四节比赛还剩0.3秒时，A1获得掷球入界权。A1将球掷向篮筐，球触及篮圈后反弹，B1在空中接住球并投篮命中。裁判员判得分有效。这个判罚正确吗？',
        correctAnswer: false,
        explanation: '错误。根据FIBA规则，如果比赛时间少于0.3秒（包含0.3秒），球员获得控球权后不能进行投篮，只能进行空中接力扣篮或点拨球。虽然此题是0.3秒，但描述中B1是"接住球"再投篮，这通常需要多于0.3秒的时间动作，且必须是直接的点拨。更精确地，0.3秒只能完成一次接触后的投篮（拍球入筐）。如果接住球再投，时间不够。'
      },
      {
        id: 'fallback-2',
        type: QuestionType.VIDEO,
        content: '场景描述：A1运球结束，此时左脚为中枢脚。A1跳起左脚，右脚落地，随后左脚落地（双脚分先后落地），并在双脚离地前进行了投篮。裁判员判罚A1走步违例。这个判罚正确吗？',
        correctAnswer: false,
        explanation: '错误。这是合法的"一步急停"后的动作或者是合法的脚步移动。如果中枢脚离地，球在手中，中枢脚再次落地前球必须离手。但在描述中是典型的“错步”上篮或移动，需要具体判断中枢脚状态。如果是跳起中枢脚，双脚落地（类似跳步），此时不能旋转中枢脚，但可以跳起投篮。'
      }
    ];
  }
};

/**
 * Generates study content or analyzes user provided content.
 */
export const generateStudyMaterial = async (topic: StudyTopic): Promise<string> => {
    try {
        let prompt = '';

        if (topic.isCustom && topic.userContent) {
            // AI Analysis mode for user content
            prompt = `
              你是一位资深的国家级篮球裁判讲师。
              用户提供了一份关于 "${topic.title}" 的学习资料原文。
              
              请你完成以下任务：
              1. 整理并优化这份资料的格式（使用Markdown），使其更易于阅读。
              2. 提炼出其中的【核心考点】和【判罚关键】。
              3. 如果资料中涉及规则，请补充相关的FIBA规则解释或判例（如果原文未提及）。
              4. 针对这份资料，出1-2道自测思考题（附带答案）。

              用户资料原文如下：
              """
              ${topic.userContent}
              """
            `;
        } else {
            // Generation mode for system topics
            prompt = `
              请用专业的语言，为中国国家级篮球裁判员生成关于 "${topic.prompt}" 的复习资料。
              包括：
              1. 核心规则定义。
              2. 常见判罚误区。
              3. 判罚原则与技巧（Mechanics）。
              请使用Markdown格式输出。
            `;
        }

        const response = await ai.models.generateContent({
            model: MODEL_NAME,
            contents: prompt,
        });

        return response.text || "无法生成该主题的内容，请稍后再试。";
    } catch (error) {
        return "获取学习资料失败，请检查网络设置。";
    }
}
