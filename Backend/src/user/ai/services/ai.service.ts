import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from 'src/prisma/prisma.service';

import { ExplainAiDto } from '../dto/explain-ai.dto';

@Injectable()
export class AiService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  /**
   * POST /ai/explain
   */
  async explain(
    userId: string | number,
    dto: ExplainAiDto,
  ) {
    const question = dto.question.trim();

    /**
     * --------------------------------
     * THREAD
     * --------------------------------
     */

    let thread: any;

    if (dto.thread_id) {
      thread =
        await this.prisma.ai_chat_threads.findFirst({
          where: {
            id: BigInt(dto.thread_id),
            user_id: BigInt(userId),
          },
        });

      if (!thread) {
        throw new NotFoundException(
          'Chat thread not found',
        );
      }
    } else {
      thread =
        await this.prisma.ai_chat_threads.create({
          data: {
            user_id: BigInt(userId),
            title: question.substring(0, 50),
          },
        });
    }

    /**
     * --------------------------------
     * SAVE USER MESSAGE
     * --------------------------------
     */

    await this.prisma.ai_chat_messages.create({
      data: {
        thread_id: thread.id,
        role: 'user',
        message: question,
      },
    });

    /**
     * --------------------------------
     * LAST 8 MESSAGES
     * --------------------------------
     */

    const messages =
      await this.prisma.ai_chat_messages.findMany({
        where: {
          thread_id: thread.id,
        },

        orderBy: {
          id: 'desc',
        },

        take: 8,
      });

    const history = messages
      .reverse()
      .map((message) => ({
        role: message.role,
        text: message.message,
      }));

    /**
     * --------------------------------
     * GREETING
     * --------------------------------
     */

    if (this.detectGreeting(question)) {
      const answer = `Hello 👋

Main aapki padhai me help karne ke liye hoon 📚  
Aap Maths, Science, SST (9–10) ya PCM/PCB/Commerce/Arts (11–12) se related kuch bhi pooch sakte ho 👍`;

      await this.saveAiMessage(
        thread.id,
        answer,
      );

      return {
        status: true,
        answer,
        thread_id: thread.id.toString(),
      };
    }

    /**
     * --------------------------------
     * LANGUAGE SWITCH
     * --------------------------------
     */

    if (
      this.isLanguageSwitchRequest(question)
    ) {
      const requestedLang =
        this.extractRequestedLanguage(question);

      const answer =
        `Sure 👍 Let's continue in ${this.capitalize(
          requestedLang,
        )}. Ab aap apna study question pooch sakte ho.`;

      await this.saveAiMessage(
        thread.id,
        answer,
      );

      return {
        status: true,
        answer,
        thread_id: thread.id.toString(),
      };
    }

    /**
     * --------------------------------
     * INTENT
     * --------------------------------
     */

    let intent: 'study' | 'non_study';

    if (question.length <= 10) {
      intent = 'study';
    } else {
      intent =
        this.quickCheck(question) ??
        'study';
    }

    /**
     * --------------------------------
     * NON STUDY
     * --------------------------------
     */

    if (intent === 'non_study') {
      const answer = `Main sirf padhai aur general knowledge se related help karta hoon 📚

Aap Maths, Science, SST (9–10) ya PCM/PCB/Commerce/Arts (11–12) se related question pooch sakte ho 👍`;

      await this.saveAiMessage(
        thread.id,
        answer,
      );

      return {
        status: true,
        answer,
        thread_id: thread.id.toString(),
      };
    }

    /**
     * --------------------------------
     * AI CALL
     * --------------------------------
     */

    const lang =
      this.detectLanguage(question);

    const answer =
      await this.ask(
        question,
        history,
        lang,
      );

    /**
     * --------------------------------
     * SAVE AI RESPONSE
     * --------------------------------
     */

    await this.saveAiMessage(
      thread.id,
      answer,
    );

    return {
      status: true,
      answer,
      thread_id: thread.id.toString(),
    };
  }

  /**
   * --------------------------------
   * CHAT LIST
   * --------------------------------
   */

  async chatList(
    userId: string | number,
  ) {
    const threads =
      await this.prisma.ai_chat_threads.findMany({
        where: {
          user_id: BigInt(userId),
        },

        orderBy: {
          updated_at: 'desc',
        },

        include: {
          ai_chat_messages: {
            orderBy: {
              id: 'desc',
            },

            take: 1,
          },
        },
      });

    return {
      status: true,

      data: threads.map((thread) => ({
        thread_id:
          thread.id.toString(),

        title: thread.title,

        last_message:
          thread.ai_chat_messages[0]
            ?.message ?? null,

        updated_at:
          thread.updated_at,
      })),
    };
  }

  /**
   * --------------------------------
   * CHAT MESSAGES
   * --------------------------------
   */

  async chatMessages(
    userId: string | number,
    threadId: string,
  ) {
    const thread =
      await this.prisma.ai_chat_threads.findFirst({
        where: {
          id: BigInt(threadId),
          user_id: BigInt(userId),
        },
      });

    if (!thread) {
      throw new NotFoundException(
        'Chat thread not found',
      );
    }

    const messages =
      await this.prisma.ai_chat_messages.findMany({
        where: {
          thread_id: thread.id,
        },

        orderBy: {
          id: 'asc',
        },
      });

    return {
      status: true,

      thread_id:
        thread.id.toString(),

      data: messages.map((message) => ({
        role: message.role,
        text: message.message,
        time: message.created_at,
      })),
    };
  }

  /**
   * --------------------------------
   * SAVE AI MESSAGE
   * --------------------------------
   */

  private async saveAiMessage(
    threadId: bigint,
    answer: string,
  ) {
    await this.prisma.ai_chat_messages.create({
      data: {
        thread_id: threadId,
        role: 'ai',
        message: answer,
      },
    });
  }

  /**
   * --------------------------------
   * GREETING
   * --------------------------------
   */

  private detectGreeting(
    question: string,
  ): boolean {
    const q =
      question.toLowerCase().trim();

    const greetings = [
      'hi',
      'hello',
      'hey',
      'hii',
      'namaste',
    ];

    return greetings.includes(q);
  }

  /**
   * --------------------------------
   * LANGUAGE SWITCH
   * --------------------------------
   */

  private isLanguageSwitchRequest(
    question: string,
  ): boolean {
    const q =
      question.toLowerCase();

    const hasLanguageWord =
      /\b(english|hindi|hinglish)\b/i.test(
        q,
      ) ||
      q.includes('angrezi');

    if (!hasLanguageWord) {
      return false;
    }

    const switchPhrases = [
      'reply in',
      'answer in',
      'speak in',
      'talk in',
      'mein bolo',
      'mein baat',
      'mein bolna',
      'mein reply',
      'mein samjhao',
      'mein batao',
      'switch to',
      'change to',
      'can you speak',
      'bol sakte',
      'bol sakte ho',
    ];

    return switchPhrases.some(
      (phrase) =>
        q.includes(phrase),
    );
  }

  /**
   * --------------------------------
   * LANGUAGE
   * --------------------------------
   */

  private extractRequestedLanguage(
    question: string,
  ): string {
    const q =
      question.toLowerCase();

    if (q.includes('hindi')) {
      return 'hindi';
    }

    if (q.includes('hinglish')) {
      return 'hinglish';
    }

    if (
      q.includes('english') ||
      q.includes('angrezi')
    ) {
      return 'english';
    }

    return 'hinglish';
  }

  private detectLanguage(
    question: string,
  ): string {
    const hindiPattern =
      /[\u0900-\u097F]/;

    if (hindiPattern.test(question)) {
      return 'hindi';
    }

    return 'english';
  }

  /**
   * --------------------------------
   * QUICK INTENT CHECK
   * --------------------------------
   */

  private quickCheck(
    question: string,
  ): 'study' | 'non_study' | null {
    const q =
      question.toLowerCase();

    const nonStudy = [
      'girlfriend',
      'boyfriend',
      'breakup',
      'love',
      'bgmi',
      'pubg',
      'free fire',
      'game',
      'hack',
      'password',
      'instagram',
      'movie',
      'song',
    ];

    for (const word of nonStudy) {
      if (q.includes(word)) {
        return 'non_study';
      }
    }

    const study = [
      'math',
      'science',
      'physics',
      'chemistry',
      'biology',
      'account',
      'economics',
      'history',
      'geography',
      'political',
      'career',
      'exam',
      'study',
    ];

    for (const word of study) {
      if (q.includes(word)) {
        return 'study';
      }
    }

    return null;
  }

  /**
   * --------------------------------
   * OPENAI
   * --------------------------------
   */

  private async ask(
    question: string,
    history: any[],
    language: string,
  ): Promise<string> {
    const apiKey =
      process.env.OPENAI_API_KEY;

    if (!apiKey) {
      throw new Error(
        'OPENAI_API_KEY is not configured',
      );
    }

    const response =
      await fetch(
        'https://api.openai.com/v1/chat/completions',
        {
          method: 'POST',

          headers: {
            Authorization:
              `Bearer ${apiKey}`,

            'Content-Type':
              'application/json',
          },

          body: JSON.stringify({
            model: 'gpt-4o-mini',

            messages: [
              {
                role: 'system',

                content: `
You are an educational AI assistant for a school learning platform.

Answer the user's question clearly and accurately.

The user prefers responses in ${language}.

You can help with:
- Maths
- Science
- SST
- Physics
- Chemistry
- Biology
- Commerce
- Arts
- Career guidance
- Exams
- Study planning
- General knowledge

Keep explanations appropriate for students.
                `.trim(),
              },

              ...history.map(
                (item) => ({
                  role:
                    item.role === 'ai'
                      ? 'assistant'
                      : 'user',

                  content:
                    item.text,
                }),
              ),

              {
                role: 'user',
                content: question,
              },
            ],

            temperature: 0.7,
          }),
        },
      );

    if (!response.ok) {
      const error =
        await response.text();

      console.error(
        'OpenAI Error:',
        error,
      );

      throw new Error(
        'AI service failed',
      );
    }

    const result =
      await response.json();

    return (
      result?.choices?.[0]
        ?.message?.content
        ?.trim() ||
      'Sorry, I could not generate an answer.'
    );
  }

  private capitalize(
    value: string,
  ) {
    return (
      value.charAt(0).toUpperCase() +
      value.slice(1)
    );
  }
}