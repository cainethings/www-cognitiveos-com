import { useEffect, useMemo, useState } from 'react';
import {
  deleteMemory,
  getConversations,
  getHealth,
  getMemories,
  sendChatMessage,
} from './api.js';

const DEMO_PROMPTS = [
  'My name is Caine and I prefer focused evening study sessions.',
  'My goal is to finish my final year project report by next Friday.',
  'I will review the memory retrieval module every morning this week.',
  'What do you remember about how I like to work and what I am trying to finish?',
];

const DEMO_STEPS = [
  {
    id: 'profile',
    label: 'Step 1',
    title: 'Store a preference',
    message: DEMO_PROMPTS[0],
  },
  {
    id: 'goal',
    label: 'Step 2',
    title: 'Store a goal',
    message: DEMO_PROMPTS[1],
  },
  {
    id: 'commitment',
    label: 'Step 3',
    title: 'Store a commitment',
    message: DEMO_PROMPTS[2],
  },
  {
    id: 'recall',
    label: 'Step 4',
    title: 'Trigger recall',
    message: DEMO_PROMPTS[3],
  },
];

function escapeHtml(value) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function renderInlineMarkdown(text) {
  return escapeHtml(text)
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`(.+?)`/g, '<code>$1</code>');
}

function renderMarkdown(text) {
  const normalized = text.replace(/\r\n/g, '\n').trim();
  if (!normalized) return '';

  const blocks = normalized.split(/\n\s*\n/);

  return blocks
    .map((block) => {
      const lines = block.split('\n').map((line) => line.trim()).filter(Boolean);

      if (lines.every((line) => /^\d+\.\s+/.test(line))) {
        const items = lines
          .map((line) => line.replace(/^\d+\.\s+/, ''))
          .map((line) => `<li>${renderInlineMarkdown(line)}</li>`)
          .join('');

        return `<ol>${items}</ol>`;
      }

      if (lines.every((line) => /^[-*]\s+/.test(line))) {
        const items = lines
          .map((line) => line.replace(/^[-*]\s+/, ''))
          .map((line) => `<li>${renderInlineMarkdown(line)}</li>`)
          .join('');

        return `<ul>${items}</ul>`;
      }

      return `<p>${lines.map(renderInlineMarkdown).join('<br />')}</p>`;
    })
    .join('');
}

function formatTypeLabel(type) {
  if (!type) return 'Memory';
  return type.charAt(0).toUpperCase() + type.slice(1);
}

function formatTimestamp(value) {
  if (!value) return 'Unknown time';

  const date = new Date(value.replace(' ', 'T'));
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
}

function EmptyState({ title, description }) {
  return (
    <div className="empty-state">
      <strong>{title}</strong>
      <p>{description}</p>
    </div>
  );
}

function StatusPill({ health }) {
  if (health.loading) {
    return <span className="status-pill status-pill--neutral">API status: checking</span>;
  }

  if (health.error) {
    return <span className="status-pill status-pill--error">API status: offline</span>;
  }

  return <span className="status-pill status-pill--success">API status: healthy</span>;
}

function MessageBody({ message }) {
  return (
    <div
      className="message__body markdown-content"
      dangerouslySetInnerHTML={{ __html: renderMarkdown(message) }}
    />
  );
}

export default function App() {
  const [userId, setUserId] = useState('demo-user');
  const [draft, setDraft] = useState(DEMO_PROMPTS[0]);
  const [health, setHealth] = useState({ loading: true, error: null });
  const [chatState, setChatState] = useState({ loading: false, error: null, lastMeta: null });
  const [demoState, setDemoState] = useState({ running: false, activeStepId: null });
  const [messages, setMessages] = useState([]);
  const [memories, setMemories] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [memoryLoading, setMemoryLoading] = useState(true);
  const [memoryError, setMemoryError] = useState(null);
  const [historyError, setHistoryError] = useState(null);

  useEffect(() => {
    let active = true;

    getHealth()
      .then(() => {
        if (active) {
          setHealth({ loading: false, error: null });
        }
      })
      .catch((error) => {
        if (active) {
          setHealth({ loading: false, error: error.message });
        }
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;

    setHistoryLoading(true);
    setHistoryError(null);
    setMemoryLoading(true);
    setMemoryError(null);

    Promise.all([
      getConversations(userId),
      getMemories(userId),
    ])
      .then(([conversationData, memoryData]) => {
        if (!active) return;

        setMessages(conversationData.items || []);
        setMemories(memoryData.items || []);
      })
      .catch((error) => {
        if (!active) return;

        setHistoryError(error.message);
        setMemoryError(error.message);
      })
      .finally(() => {
        if (!active) return;

        setHistoryLoading(false);
        setMemoryLoading(false);
      });

    return () => {
      active = false;
    };
  }, [userId]);

  const memoryStats = useMemo(() => {
    return memories.reduce(
      (accumulator, memory) => {
        accumulator.total += 1;
        accumulator[memory.memory_type] = (accumulator[memory.memory_type] || 0) + 1;
        return accumulator;
      },
      { total: 0, profile: 0, goals: 0, commitments: 0, context: 0 }
    );
  }, [memories]);

  const handlePromptUse = (prompt) => {
    setDraft(prompt);
  };

  const submitMessage = async (message) => {
    const trimmedMessage = message.trim();
    if (!trimmedMessage) return null;

    setChatState({ loading: true, error: null, lastMeta: null });

    const data = await sendChatMessage({
      user_id: userId,
      message: trimmedMessage,
    });

    setDraft('');
    await refreshData();
    setChatState({
      loading: false,
      error: null,
      lastMeta: {
        retrievedMemories: data.retrieved_memories || [],
        storedMemories: data.stored_memories || [],
      },
    });

    return data;
  };

  const refreshData = async () => {
    const [conversationData, memoryData] = await Promise.all([
      getConversations(userId),
      getMemories(userId),
    ]);

    setMessages(conversationData.items || []);
    setMemories(memoryData.items || []);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const message = draft.trim();
    if (!message) return;

    try {
      await submitMessage(message);
    } catch (error) {
      setChatState({ loading: false, error: error.message, lastMeta: null });
    }
  };

  const handleDemoStep = async (step) => {
    setDemoState({ running: true, activeStepId: step.id });

    try {
      await submitMessage(step.message);
    } catch (error) {
      setChatState({ loading: false, error: error.message, lastMeta: null });
    } finally {
      setDemoState({ running: false, activeStepId: null });
    }
  };

  const handleRunFullDemo = async () => {
    setDemoState({ running: true, activeStepId: 'full-demo' });

    try {
      for (const step of DEMO_STEPS) {
        setDemoState({ running: true, activeStepId: step.id });
        await submitMessage(step.message);
      }
    } catch (error) {
      setChatState({ loading: false, error: error.message, lastMeta: null });
    } finally {
      setDemoState({ running: false, activeStepId: null });
    }
  };

  const handleDeleteMemory = async (memoryId) => {
    setMemoryError(null);

    try {
      await deleteMemory(memoryId, userId);
      const data = await getMemories(userId);
      setMemories(data.items || []);
    } catch (error) {
      setMemoryError(error.message);
    }
  };

  return (
    <div className="page-shell">
      <section className="hero">
        <div className="hero__content">
          <p className="eyebrow">Final Year Project</p>
          <h1>CognitiveOS</h1>
          <p className="hero__lede">
            A memory-aware personal AI assistant that remembers preferences, goals,
            commitments, and recurring context across conversations.
          </p>
          <div className="hero__actions">
            <a href="#workspace" className="button button--primary">
              Open Workspace
            </a>
            <a href="#dashboard" className="button button--ghost">
              View Memory Dashboard
            </a>
          </div>
        </div>

        <div className="hero__panel card card--glow">
          <StatusPill health={health} />
          <div className="hero-metric-grid">
            <div>
              <span>Conversations</span>
              <strong>{messages.length}</strong>
            </div>
            <div>
              <span>Active memories</span>
              <strong>{memoryStats.total}</strong>
            </div>
            <div>
              <span>Core value</span>
              <strong>Explainable recall</strong>
            </div>
          </div>
          <p className="hero__panel-copy">
            The demo shows memory extraction, persistence, retrieval, and user control
            over what the assistant keeps.
          </p>
        </div>
      </section>

      <section className="feature-strip">
        <article className="card">
          <p className="feature-strip__label">What it remembers</p>
          <h2>Personal facts with useful structure</h2>
          <p>Profile, goals, commitments, and recurring context are stored separately.</p>
        </article>
        <article className="card">
          <p className="feature-strip__label">Why it matters</p>
          <h2>Responses improve over time</h2>
          <p>The assistant brings forward relevant memories instead of starting cold every time.</p>
        </article>
        <article className="card">
          <p className="feature-strip__label">User control</p>
          <h2>Visible and editable memory</h2>
          <p>Users can inspect stored memories and remove bad ones directly from the dashboard.</p>
        </article>
      </section>

      <main className="workspace" id="workspace">
        <section className="workspace__main">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Chat Workspace</p>
              <h2>Talk naturally. CognitiveOS keeps the important parts.</h2>
            </div>
          </div>

          <div className="card composer-card">
            <div className="field-group">
              <label htmlFor="user-id">Demo user id</label>
              <input
                id="user-id"
                value={userId}
                onChange={(event) => setUserId(event.target.value || 'demo-user')}
                placeholder="demo-user"
              />
            </div>

            <div className="prompt-row">
              {DEMO_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  className="prompt-chip"
                  onClick={() => handlePromptUse(prompt)}
                >
                  {prompt}
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="composer-form">
              <label htmlFor="chat-message">Message</label>
              <textarea
                id="chat-message"
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                rows={4}
                placeholder="Tell CognitiveOS something worth remembering."
              />
              <div className="composer-form__footer">
                <p>
                  Try telling it a preference, a goal, or a commitment, then ask what it
                  remembers later.
                </p>
                <button type="submit" className="button button--primary" disabled={chatState.loading}>
                  {chatState.loading ? 'Thinking...' : 'Send to CognitiveOS'}
                </button>
              </div>
            </form>

            {chatState.error && <p className="inline-error">{chatState.error}</p>}
          </div>

          <div className="card conversation-card">
            <div className="section-heading section-heading--tight">
              <div>
                <p className="eyebrow">Conversation</p>
                <h3>Live assistant timeline</h3>
              </div>
            </div>

            {historyLoading ? (
              <EmptyState
                title="Loading conversation"
                description="Fetching stored messages for this user."
              />
            ) : historyError ? (
              <p className="inline-error">{historyError}</p>
            ) : messages.length === 0 ? (
              <EmptyState
                title="No conversation yet"
                description="Send the first message to start building the user memory profile."
              />
            ) : (
              <div className="message-list">
                {messages.map((message) => (
                  <article
                    key={message.id}
                    className={`message message--${message.role}`}
                  >
                    <div className="message__meta">
                      <span>{message.role === 'assistant' ? 'CognitiveOS' : 'User'}</span>
                      <time>{formatTimestamp(message.created_at)}</time>
                    </div>
                    <MessageBody message={message.message} />
                  </article>
                ))}
              </div>
            )}

            {chatState.lastMeta && (
              <div className="memory-insights">
                <div>
                  <p className="eyebrow">Latest extraction</p>
                  <div className="memory-tag-list">
                    {chatState.lastMeta.storedMemories.length > 0 ? (
                      chatState.lastMeta.storedMemories.map((memory) => (
                        <span key={`stored-${memory.id}`} className="memory-tag">
                          Stored {formatTypeLabel(memory.memory_type)}: {memory.summary_text}
                        </span>
                      ))
                    ) : (
                      <span className="memory-tag memory-tag--muted">No new memories extracted</span>
                    )}
                  </div>
                </div>

                <div>
                  <p className="eyebrow">Latest retrieval</p>
                  <div className="memory-tag-list">
                    {chatState.lastMeta.retrievedMemories.length > 0 ? (
                      chatState.lastMeta.retrievedMemories.map((memory) => (
                        <span key={`retrieved-${memory.id}`} className="memory-tag memory-tag--accent">
                          Used {formatTypeLabel(memory.memory_type)}: {memory.summary_text}
                        </span>
                      ))
                    ) : (
                      <span className="memory-tag memory-tag--muted">No prior memories used</span>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        <aside className="workspace__side" id="dashboard">
          <div className="card">
            <div className="section-heading section-heading--tight">
              <div>
                <p className="eyebrow">Memory Dashboard</p>
                <h3>What CognitiveOS remembers</h3>
              </div>
            </div>

            <div className="stats-grid">
              <div>
                <span>Total</span>
                <strong>{memoryStats.total}</strong>
              </div>
              <div>
                <span>Profile</span>
                <strong>{memoryStats.profile}</strong>
              </div>
              <div>
                <span>Goals</span>
                <strong>{memoryStats.goals}</strong>
              </div>
              <div>
                <span>Commitments</span>
                <strong>{memoryStats.commitments}</strong>
              </div>
              <div>
                <span>Context</span>
                <strong>{memoryStats.context}</strong>
              </div>
            </div>

            {memoryLoading ? (
              <EmptyState
                title="Loading memories"
                description="Collecting active memory events for this user."
              />
            ) : memoryError ? (
              <p className="inline-error">{memoryError}</p>
            ) : memories.length === 0 ? (
              <EmptyState
                title="No memories stored yet"
                description="Once the user shares a goal, preference, or commitment, it will appear here."
              />
            ) : (
              <div className="memory-list">
                {memories.map((memory) => (
                  <article key={memory.id} className="memory-card">
                    <div className="memory-card__header">
                      <span className={`memory-type memory-type--${memory.memory_type}`}>
                        {formatTypeLabel(memory.memory_type)}
                      </span>
                      <button
                        type="button"
                        className="memory-delete"
                        onClick={() => handleDeleteMemory(memory.id)}
                      >
                        Delete
                      </button>
                    </div>
                    <p>{memory.summary_text}</p>
                    <div className="memory-card__meta">
                      <span>Confidence {(memory.confidence * 100).toFixed(0)}%</span>
                      <span>Source #{memory.source_message_id ?? 'n/a'}</span>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>

          <div className="card">
            <div className="section-heading section-heading--tight">
              <div>
                <p className="eyebrow">Demo Story</p>
                <h3>Trigger real memory messages</h3>
              </div>
            </div>
            <p className="demo-copy">
              These controls send actual messages to <code>/api/chat</code>. Use them to
              populate memory, trigger retrieval, and show the dashboard updating live.
            </p>
            <div className="demo-actions">
              {DEMO_STEPS.map((step) => (
                <button
                  key={step.id}
                  type="button"
                  className={`demo-step-button${
                    demoState.activeStepId === step.id ? ' demo-step-button--active' : ''
                  }`}
                  onClick={() => handleDemoStep(step)}
                  disabled={chatState.loading || demoState.running}
                >
                  <span>{step.label}</span>
                  <strong>{step.title}</strong>
                </button>
              ))}
            </div>
            <button
              type="button"
              className="button button--primary demo-run-button"
              onClick={handleRunFullDemo}
              disabled={chatState.loading || demoState.running}
            >
              {demoState.running && demoState.activeStepId === 'full-demo'
                ? 'Starting demo...'
                : demoState.running
                  ? 'Running step...'
                  : 'Run Full Memory Demo'}
            </button>
          </div>
        </aside>
      </main>
    </div>
  );
}
