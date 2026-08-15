import {
  ArrowDownRight,
  ArrowUpRight,
  Bot,
  Lightbulb,
  LoaderCircle,
  MessageSquareText,
  Send,
  Sparkles,
  UserRound,
} from "lucide-react";

import {
  useMemo,
  useState,
} from "react";

import type {
  FormEvent,
} from "react";

import {
  askAIChat,
} from "../../../api/chat.api";

import type {
  AssistantChatMessage,
  ChatHistoryMessage,
  ChatInsight,
  ChatMessage,
  StructuredChatAnswer,
} from "../../../types/chat";


interface AIChatTabProps {
  datasetId: number;
}


const suggestedQuestions = [
  "Summarize the main findings in this dataset.",
  "Which variables show the strongest relationships?",
  "What are the biggest data quality issues?",
  "What should I investigate next?",
];


function createMessageId(): string {
  return `${Date.now()}-${Math.random()
    .toString(36)
    .slice(2)}`;
}


function getValueDirection(
  value: string | null,
):
  | "positive"
  | "negative"
  | "neutral" {
  if (!value) {
    return "neutral";
  }

  const normalized =
    value.trim();

  if (
    normalized.startsWith(
      "+",
    )
  ) {
    return "positive";
  }

  if (
    normalized.startsWith(
      "-",
    )
  ) {
    return "negative";
  }

  return "neutral";
}


function normalizeAnswer(
  answer:
    | StructuredChatAnswer
    | null
    | undefined,
): StructuredChatAnswer {
  return {
    headline:
      answer?.headline?.trim() ||
      "Dataset analysis",

    summary:
      answer?.summary?.trim() ||
      "The assistant did not return a summary.",

    insights:
      Array.isArray(
        answer?.insights,
      )
        ? answer.insights.filter(
            (
              insight,
            ): insight is ChatInsight =>
              Boolean(
                insight &&
                  typeof insight.title ===
                    "string" &&
                  typeof insight.description ===
                    "string",
              ),
          )
        : [],

    takeaway:
      typeof answer?.takeaway ===
        "string" &&
      answer.takeaway.trim()
        ? answer.takeaway.trim()
        : null,
  };
}


function buildHistory(
  messages: ChatMessage[],
): ChatHistoryMessage[] {
  return messages.map(
    (
      message,
    ): ChatHistoryMessage => {
      if (
        message.role ===
        "user"
      ) {
        return {
          role: "user",
          content:
            message.content,
        };
      }

      const answer =
        normalizeAnswer(
          message.content,
        );

      const insightParts =
        answer.insights.map(
          (insight) => {
            const parts = [
              insight.title,
              insight.value,
              insight.description,
            ].filter(
              (
                part,
              ): part is string =>
                typeof part ===
                  "string" &&
                part.trim().length >
                  0,
            );

            return parts.join(
              " | ",
            );
          },
        );

      const assistantParts = [
        answer.headline,
        answer.summary,
        ...insightParts,
        answer.takeaway,
      ].filter(
        (
          part,
        ): part is string =>
          typeof part ===
            "string" &&
          part.trim().length >
            0,
      );

      return {
        role: "assistant",
        content:
          assistantParts.join(
            "\n",
          ),
      };
    },
  );
}


function InsightCard({
  insight,
}: {
  insight: ChatInsight;
}) {
  const safeValue =
    typeof insight.value ===
    "string"
      ? insight.value
      : null;

  const direction =
    getValueDirection(
      safeValue,
    );

  const Icon =
    direction ===
    "positive"
      ? ArrowUpRight
      : direction ===
          "negative"
        ? ArrowDownRight
        : Sparkles;

  const classes =
    direction ===
    "positive"
      ? "border-blue-800/40 bg-blue-950/15"
      : direction ===
          "negative"
        ? "border-violet-800/40 bg-violet-950/15"
        : "border-slate-800 bg-slate-950/30";


  return (
    <article
      className={`min-w-0 rounded-xl border p-4 ${classes}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="break-words text-sm font-semibold text-white">
            {
              insight.title
            }
          </p>

          {safeValue && (
            <p className="mt-2 break-words text-2xl font-semibold tracking-tight text-white">
              {safeValue}
            </p>
          )}
        </div>

        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-950/50">
          <Icon
            size={16}
            className={
              direction ===
              "positive"
                ? "text-blue-300"
                : direction ===
                    "negative"
                  ? "text-violet-300"
                  : "text-slate-400"
            }
          />
        </div>
      </div>

      <p className="mt-3 break-words text-sm leading-6 text-slate-400">
        {
          insight.description
        }
      </p>
    </article>
  );
}


function StructuredAnswerCard({
  answer,
}: {
  answer: StructuredChatAnswer;
}) {
  const normalizedAnswer =
    normalizeAnswer(
      answer,
    );

  const {
    headline,
    summary,
    insights,
    takeaway,
  } = normalizedAnswer;


  return (
    <article className="w-full min-w-0 max-w-4xl overflow-hidden rounded-2xl rounded-bl-md border border-slate-800 bg-slate-950/30">
      <div className="border-b border-slate-800/80 px-5 py-5">
        <div className="flex items-center gap-2">
          <Sparkles
            size={13}
            className="text-blue-400"
          />

          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-blue-400">
            AI analysis
          </p>
        </div>

        <h3 className="mt-2 break-words text-lg font-semibold leading-7 text-white">
          {headline}
        </h3>

        <p className="mt-3 break-words text-sm leading-6 text-slate-400">
          {summary}
        </p>
      </div>


      {insights.length >
        0 && (
        <div className="grid gap-3 p-4 sm:grid-cols-2">
          {insights.map(
            (
              insight,
              index,
            ) => (
              <InsightCard
                key={`${insight.title}-${index}`}
                insight={
                  insight
                }
              />
            ),
          )}
        </div>
      )}


      {takeaway && (
        <div className="border-t border-slate-800/80 px-5 py-4">
          <div className="flex items-start gap-3 rounded-xl border border-amber-900/40 bg-amber-950/15 p-4">
            <Lightbulb
              size={17}
              className="mt-0.5 shrink-0 text-amber-300"
            />

            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-amber-300">
                Takeaway
              </p>

              <p className="mt-1 break-words text-sm leading-6 text-slate-400">
                {takeaway}
              </p>
            </div>
          </div>
        </div>
      )}
    </article>
  );
}


function AIChatTab({
  datasetId,
}: AIChatTabProps) {
  const [
    messages,
    setMessages,
  ] =
    useState<
      ChatMessage[]
    >([]);

  const [
    question,
    setQuestion,
  ] =
    useState("");

  const [
    loading,
    setLoading,
  ] =
    useState(false);

  const [
    error,
    setError,
  ] =
    useState("");


  const canSubmit =
    useMemo(
      () =>
        question.trim()
          .length > 0 &&
        !loading,
      [
        question,
        loading,
      ],
    );


  async function submitQuestion(
    value: string,
  ) {
    const cleanedQuestion =
      value.trim();

    if (
      !cleanedQuestion ||
      loading
    ) {
      return;
    }

    const history =
      buildHistory(
        messages,
      );

    const userMessage:
      ChatMessage = {
      id:
        createMessageId(),

      role: "user",

      content:
        cleanedQuestion,
    };

    setMessages(
      (current) => [
        ...current,
        userMessage,
      ],
    );

    setQuestion("");
    setLoading(true);
    setError("");

    try {
      const response =
        await askAIChat(
          datasetId,
          {
            question:
              cleanedQuestion,

            history,
          },
        );

      const assistantMessage:
        AssistantChatMessage =
        {
          id:
            createMessageId(),

          role:
            "assistant",

          content:
            normalizeAnswer(
              response.answer,
            ),
        };

      setMessages(
        (current) => [
          ...current,
          assistantMessage,
        ],
      );
    } catch {
      setError(
        "Unable to answer this question.",
      );
    } finally {
      setLoading(false);
    }
  }


  function handleSubmit(
    event:
      FormEvent<
        HTMLFormElement
      >,
  ) {
    event.preventDefault();

    submitQuestion(
      question,
    );
  }


  function handleKeyDown(
    event:
      React.KeyboardEvent<
        HTMLTextAreaElement
      >,
  ) {
    if (
      event.key ===
        "Enter" &&
      !event.shiftKey
    ) {
      event.preventDefault();

      if (canSubmit) {
        submitQuestion(
          question,
        );
      }
    }
  }


  return (
    <section className="space-y-6">
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
          <MessageSquareText
            size={17}
          />
        </div>

        <div>
          <h2 className="text-xl font-semibold tracking-tight text-white">
            AI Chat
          </h2>

          <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-500">
            Ask questions about the current dataset
            and receive structured, analysis-grounded responses.
          </p>
        </div>
      </div>


      {/* Chat */}
      <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/40">
        {messages.length ===
        0 ? (
          <div className="px-6 py-14 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-blue-500/10 bg-blue-500/10">
              <Bot
                size={24}
                className="text-blue-400"
              />
            </div>

            <h3 className="mt-5 text-base font-semibold text-white">
              Ask your dataset a question
            </h3>

            <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-500">
              Responses are grounded in the generated
              analysis and presented as structured insights.
            </p>


            <div className="mx-auto mt-7 grid max-w-3xl gap-3 md:grid-cols-2">
              {suggestedQuestions.map(
                (
                  suggestion,
                ) => (
                  <button
                    key={
                      suggestion
                    }
                    type="button"
                    onClick={() =>
                      submitQuestion(
                        suggestion,
                      )
                    }
                    disabled={
                      loading
                    }
                    className="group rounded-xl border border-slate-800 bg-slate-950/30 px-4 py-3 text-left text-sm leading-6 text-slate-400 transition hover:border-blue-500/40 hover:bg-blue-500/5 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <span className="flex items-start gap-2">
                      <Sparkles
                        size={14}
                        className="mt-1 shrink-0 text-slate-600 transition group-hover:text-blue-400"
                      />

                      {
                        suggestion
                      }
                    </span>
                  </button>
                ),
              )}
            </div>
          </div>
        ) : (
          <div className="max-h-[680px] space-y-6 overflow-y-auto px-4 py-6 sm:px-6">
            {messages.map(
              (
                message,
              ) => {
                const isUser =
                  message.role ===
                  "user";

                return (
                  <div
                    key={
                      message.id
                    }
                    className={[
                      "flex min-w-0 gap-3",

                      isUser
                        ? "justify-end"
                        : "justify-start",
                    ].join(" ")}
                  >
                    {!isUser && (
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-500/10">
                        <Bot
                          size={16}
                          className="text-blue-400"
                        />
                      </div>
                    )}


                    {isUser ? (
                      <div className="max-w-2xl break-words rounded-2xl rounded-br-md bg-blue-600 px-4 py-3 text-sm leading-6 text-white shadow-lg shadow-blue-950/20">
                        {
                          message.content
                        }
                      </div>
                    ) : (
                      <StructuredAnswerCard
                        answer={
                          message.content
                        }
                      />
                    )}


                    {isUser && (
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-800">
                        <UserRound
                          size={16}
                          className="text-slate-400"
                        />
                      </div>
                    )}
                  </div>
                );
              },
            )}


            {loading && (
              <div className="flex gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-500/10">
                  <Bot
                    size={16}
                    className="text-blue-400"
                  />
                </div>

                <div className="flex items-center gap-2 rounded-2xl rounded-bl-md border border-slate-800 bg-slate-950/30 px-4 py-3 text-sm text-slate-400">
                  <LoaderCircle
                    size={15}
                    className="animate-spin"
                  />

                  Analyzing the dataset...
                </div>
              </div>
            )}
          </div>
        )}


        {error && (
          <div className="border-t border-red-900/50 bg-red-950/20 px-5 py-3 text-sm text-red-300">
            {error}
          </div>
        )}


        {/* Input */}
        <form
          onSubmit={
            handleSubmit
          }
          className="border-t border-slate-800 bg-slate-950/30 p-4"
        >
          <div className="flex items-end gap-3">
            <textarea
              value={
                question
              }
              onChange={(
                event,
              ) =>
                setQuestion(
                  event.target
                    .value,
                )
              }
              onKeyDown={
                handleKeyDown
              }
              placeholder="Ask a question about this dataset..."
              rows={2}
              maxLength={
                2000
              }
              disabled={
                loading
              }
              className="min-h-[52px] flex-1 resize-none rounded-xl border border-slate-800 bg-slate-900/70 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:opacity-60"
            />

            <button
              type="submit"
              disabled={
                !canSubmit
              }
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-950/20 transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:shadow-none disabled:opacity-40"
              aria-label="Send question"
            >
              <Send
                size={17}
              />
            </button>
          </div>

          <p className="mt-2 text-xs text-slate-600">
            Enter to send · Shift + Enter for a new line
          </p>
        </form>
      </div>
    </section>
  );
}


export default AIChatTab;