'use client';

import { useState } from 'react';

export default function HomePage() {
    const [content, setContent] = useState('');
    const [ttlSeconds, setTtlSeconds] = useState<string>('');
    const [maxViews, setMaxViews] = useState<string>('');
    const [url, setUrl] = useState<string>('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string>('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setUrl('');

        try {
            const body: any = { content };

            if (ttlSeconds) {
                body.ttl_seconds = parseInt(ttlSeconds, 10);
            }

            if (maxViews) {
                body.max_views = parseInt(maxViews, 10);
            }

            const response = await fetch('/api/pastes', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(body),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to create paste');
            }

            setUrl(data.url);
            setContent('');
            setTtlSeconds('');
            setMaxViews('');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.container} >
            <header style={styles.header}>
                <h1>Pastebin </h1>
                < p > Share text snippets with optional expiry </p>
            </header>

            < main style={styles.main} >
                <form onSubmit={handleSubmit} style={styles.form} >
                    <div style={styles.formGroup}>
                        <label htmlFor="content" style={styles.label} >
                            Paste Content *
                        </label>
                        < textarea
                            id="content"
                            value={content}
                            onChange={(e) => setContent(e.target.value)
                            }
                            placeholder="Enter your text here..."
                            required
                            rows={10}
                            style={styles.textarea}
                        />
                    </div>

                    < div style={styles.options} >
                        <div style={styles.formGroup}>
                            <label htmlFor="ttlSeconds" style={styles.label} >
                                Expire After(seconds)
                            </label>
                            < input
                                type="number"
                                id="ttlSeconds"
                                value={ttlSeconds}
                                onChange={(e) => setTtlSeconds(e.target.value)}
                                placeholder="e.g., 3600"
                                min="1"
                                style={styles.input}
                            />
                            <small style={styles.helpText}>
                                Leave empty for no expiration
                            </small>
                        </div>

                        < div style={styles.formGroup} >
                            <label htmlFor="maxViews" style={styles.label} >
                                Maximum Views
                            </label>
                            < input
                                type="number"
                                id="maxViews"
                                value={maxViews}
                                onChange={(e) => setMaxViews(e.target.value)}
                                placeholder="e.g., 10"
                                min="1"
                                style={styles.input}
                            />
                            <small style={styles.helpText}>
                                Leave empty for unlimited views
                            </small>
                        </div>
                    </div>

                    {error && (
                        <div style={styles.error} >
                            {error}
                        </div>
                    )}

                    {
                        url && (
                            <div style={styles.success}>
                                <p>Paste created successfully! </p>
                                < div style={styles.urlContainer} >
                                    <a
                                        href={url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        style={styles.urlLink}
                                    >
                                        {url}
                                    </a>
                                    < button
                                        type="button"
                                        onClick={() => navigator.clipboard.writeText(url)
                                        }
                                        style={styles.copyButton}
                                    >
                                        Copy
                                    </button>
                                </div>
                            </div>
                        )}

                    <button
                        type="submit"
                        disabled={loading || !content.trim()}
                        style={{
                            ...styles.submitButton,
                            opacity: loading || !content.trim() ? 0.6 : 1,
                        }}
                    >
                        {loading ? 'Creating...' : 'Create Paste'}
                    </button>
                </form>

                < div style={styles.info} >
                    <h3>How it works: </h3>
                    < ul style={styles.list} >
                        <li>Create a paste with optional constraints </li>
                        < li > Get a shareable URL </li>
                        < li > Paste expires when constraints are met </li>
                        < li > Each API fetch counts as a view </li>
                    </ul>
                </div>
            </main>
        </div>
    );
}

const styles = {
    container: {
        minHeight: '100vh',
        backgroundColor: '#f5f5f5',
    },
    header: {
        textAlign: 'center' as const,
        padding: '3rem 1rem',
        backgroundColor: '#0070f3',
        color: 'white',
    },
    main: {
        maxWidth: '800px',
        margin: '0 auto',
        padding: '2rem 1rem',
    },
    form: {
        backgroundColor: 'white',
        padding: '2rem',
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        marginBottom: '2rem',
    },
    formGroup: {
        marginBottom: '1.5rem',
    },
    label: {
        display: 'block',
        marginBottom: '0.5rem',
        fontWeight: '600' as const,
    },
    textarea: {
        width: '100%',
        padding: '0.75rem',
        border: '1px solid #ddd',
        borderRadius: '4px',
        fontFamily: 'monospace',
        fontSize: '14px',
        resize: 'vertical' as const,
        boxSizing: 'border-box' as const,
    },
    input: {
        width: '100%',
        padding: '0.75rem',
        border: '1px solid #ddd',
        borderRadius: '4px',
        fontSize: '14px',
    },
    helpText: {
        display: 'block',
        marginTop: '0.25rem',
        color: '#666',
        fontSize: '12px',
    },
    options: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1rem',
        marginBottom: '1.5rem',
    },
    error: {
        padding: '0.75rem',
        backgroundColor: '#fee',
        border: '1px solid #f99',
        borderRadius: '4px',
        color: '#c00',
        marginBottom: '1rem',
    },
    success: {
        padding: '0.75rem',
        backgroundColor: '#efe',
        border: '1px solid #9f9',
        borderRadius: '4px',
        marginBottom: '1rem',
    },
    urlContainer: {
        display: 'flex',
        gap: '0.5rem',
        alignItems: 'center',
        marginTop: '0.5rem',
    },
    urlLink: {
        flex: 1,
        padding: '0.5rem',
        backgroundColor: '#f5f5f5',
        border: '1px solid #ddd',
        borderRadius: '4px',
        textDecoration: 'none',
        color: '#0070f3',
        fontSize: '14px',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap' as const,
    },
    copyButton: {
        padding: '0.5rem 1rem',
        backgroundColor: '#666',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '14px',
    },
    submitButton: {
        width: '100%',
        padding: '1rem',
        backgroundColor: '#0070f3',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        fontSize: '16px',
        fontWeight: '600' as const,
        cursor: 'pointer',
    },
    info: {
        backgroundColor: 'white',
        padding: '1.5rem',
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    },
    list: {
        paddingLeft: '1.5rem',
        lineHeight: '1.6',
    },
};