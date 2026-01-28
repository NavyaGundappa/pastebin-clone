'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

export default function PasteViewPage() {
    const params = useParams();
    const router = useRouter();
    const [paste, setPaste] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string>('');
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        async function fetchPaste() {
            try {
                const id = params.id as string;
                console.log('Fetching paste:', id);

                const response = await fetch(`/api/pastes/${id}`);

                if (!response.ok) {
                    if (response.status === 404) {
                        setError('Paste not found or has expired');
                    } else {
                        setError('Failed to load paste');
                    }
                    return;
                }

                const data = await response.json();
                setPaste(data);
            } catch (err) {
                console.error('Error fetching paste:', err);
                setError('An error occurred while loading the paste');
            } finally {
                setLoading(false);
            }
        }

        if (params.id) {
            fetchPaste();
        }
    }, [params.id]);

    const copyToClipboard = async () => {
        if (paste?.content) {
            try {
                await navigator.clipboard.writeText(paste.content);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
            } catch (err) {
                console.error('Failed to copy:', err);
            }
        }
    };

    const createNewPaste = () => {
        router.push('/');
    };

    if (loading) {
        return (
            <div style={styles.container}>
                <div style={styles.loading}>
                    <div style={styles.spinner}></div>
                    <p>Loading paste...</p>
                </div>
            </div>
        );
    }

    if (error || !paste) {
        return (
            <div style={styles.container}>
                <div style={styles.errorContainer}>
                    <h1 style={styles.errorTitle}>404 - Paste Not Found</h1>
                    <p style={styles.errorMessage}>{error || 'The paste you\'re looking for doesn\'t exist or has expired.'}</p>
                    <div style={styles.errorActions}>
                        <button
                            onClick={createNewPaste}
                            style={styles.primaryButton}
                        >
                            Create New Paste
                        </button>
                        <button
                            onClick={() => router.back()}
                            style={styles.secondaryButton}
                        >
                            Go Back
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div style={styles.container}>
            <header style={styles.header}>
                <div style={styles.headerContent}>
                    <h1 style={styles.logo}>📋 TextPaste</h1>
                    <button
                        onClick={createNewPaste}
                        style={styles.createButton}
                    >
                        + Create New
                    </button>
                </div>
            </header>

            <main style={styles.main}>
                <div style={styles.card}>
                    <div style={styles.metadata}>
                        <div style={styles.metaGrid}>
                            <div style={styles.metaItem}>
                                <span style={styles.metaLabel}>Created:</span>
                                <span style={styles.metaValue}>
                                    {new Date(paste.created_at).toLocaleString()}
                                </span>
                            </div>
                            <div style={styles.metaItem}>
                                <span style={styles.metaLabel}>Expires:</span>
                                <span style={styles.metaValue}>
                                    {paste.expires_at ? new Date(paste.expires_at).toLocaleString() : 'Never'}
                                </span>
                            </div>
                            <div style={styles.metaItem}>
                                <span style={styles.metaLabel}>Views:</span>
                                <span style={styles.metaValue}>
                                    {paste.view_count} {paste.remaining_views !== null ? `(${paste.remaining_views} left)` : ''}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div style={styles.contentSection}>
                        <div style={styles.contentHeader}>
                            <h2 style={styles.contentTitle}>Paste Content</h2>
                            <button
                                onClick={copyToClipboard}
                                style={{
                                    ...styles.copyButton,
                                    backgroundColor: copied ? '#38a169' : '#4299e1'
                                }}
                            >
                                {copied ? '✓ Copied!' : '📋 Copy'}
                            </button>
                        </div>

                        <div style={styles.contentBox}>
                            <pre style={styles.content}>
                                {paste.content}
                            </pre>
                        </div>
                    </div>

                    <div style={styles.actions}>
                        <button
                            onClick={copyToClipboard}
                            style={styles.actionButton}
                        >
                            Copy Content
                        </button>
                        <button
                            onClick={() => window.print()}
                            style={styles.actionButton}
                        >
                            Print
                        </button>
                        <button
                            onClick={createNewPaste}
                            style={styles.actionButton}
                        >
                            Create Another
                        </button>
                    </div>
                </div>

                <div style={styles.infoBox}>
                    <h3 style={styles.infoTitle}>About This Paste</h3>
                    <ul style={styles.infoList}>
                        <li>This paste will {paste.expires_at ? `expire on ${new Date(paste.expires_at).toLocaleString()}` : 'never expire'}</li>
                        <li>It has been viewed {paste.view_count} time{paste.view_count !== 1 ? 's' : ''}</li>
                        {paste.remaining_views !== null && (
                            <li>{paste.remaining_views} view{paste.remaining_views !== 1 ? 's' : ''} remaining</li>
                        )}
                        <li>The content is stored securely and will be automatically deleted when expired</li>
                    </ul>
                </div>
            </main>

            <footer style={styles.footer}>
                <p style={styles.footerText}>
                    📋 TextPaste • Simple text sharing •{' '}
                    <a
                        href="/"
                        style={styles.footerLink}
                    >
                        Create your own paste
                    </a>
                </p>
            </footer>
        </div>
    );
}

const styles = {
    container: {
        minHeight: '100vh',
        backgroundColor: '#f8fafc',
        fontFamily: 'system-ui, -apple-system, sans-serif',
    },
    loading: {
        display: 'flex',
        flexDirection: 'column' as const,
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        color: '#4a5568',
    },
    spinner: {
        width: '40px',
        height: '40px',
        border: '4px solid #e2e8f0',
        borderTop: '4px solid #4299e1',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
        marginBottom: '1rem',
    },
    '@keyframes spin': {
        '0%': { transform: 'rotate(0deg)' },
        '100%': { transform: 'rotate(360deg)' },
    },
    errorContainer: {
        maxWidth: '500px',
        margin: '0 auto',
        padding: '4rem 1rem',
        textAlign: 'center' as const,
    },
    errorTitle: {
        fontSize: '2rem',
        color: '#2d3748',
        marginBottom: '1rem',
    },
    errorMessage: {
        color: '#718096',
        marginBottom: '2rem',
        lineHeight: '1.6',
    },
    errorActions: {
        display: 'flex',
        gap: '1rem',
        justifyContent: 'center',
    },
    primaryButton: {
        padding: '0.75rem 1.5rem',
        backgroundColor: '#4299e1',
        color: 'white',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer',
        fontSize: '1rem',
        fontWeight: '600',
    },
    secondaryButton: {
        padding: '0.75rem 1.5rem',
        backgroundColor: '#e2e8f0',
        color: '#4a5568',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer',
        fontSize: '1rem',
        fontWeight: '600',
    },
    header: {
        backgroundColor: 'white',
        borderBottom: '1px solid #e2e8f0',
        padding: '1rem 0',
    },
    headerContent: {
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '0 1rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    logo: {
        margin: 0,
        fontSize: '1.5rem',
        color: '#2d3748',
    },
    createButton: {
        padding: '0.5rem 1.5rem',
        backgroundColor: '#4299e1',
        color: 'white',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer',
        fontSize: '1rem',
        fontWeight: '600',
    },
    main: {
        maxWidth: '1200px',
        margin: '2rem auto',
        padding: '0 1rem',
    },
    card: {
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        overflow: 'hidden',
        marginBottom: '2rem',
    },
    metadata: {
        backgroundColor: '#f7fafc',
        padding: '1.5rem',
        borderBottom: '1px solid #e2e8f0',
    },
    metaGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1rem',
    },
    metaItem: {
        display: 'flex',
        flexDirection: 'column' as const,
    },
    metaLabel: {
        fontSize: '0.875rem',
        color: '#718096',
        marginBottom: '0.25rem',
    },
    metaValue: {
        fontSize: '1rem',
        color: '#2d3748',
        fontWeight: '600',
    },
    contentSection: {
        padding: '1.5rem',
    },
    contentHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1rem',
    },
    contentTitle: {
        margin: 0,
        fontSize: '1.25rem',
        color: '#2d3748',
    },
    copyButton: {
        padding: '0.5rem 1rem',
        backgroundColor: '#4299e1',
        color: 'white',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer',
        fontSize: '0.875rem',
        fontWeight: '600',
    },
    contentBox: {
        backgroundColor: '#f8fafc',
        borderRadius: '8px',
        padding: '1.5rem',
        maxHeight: '500px',
        overflowY: 'auto' as const,
    },
    content: {
        margin: 0,
        fontFamily: "'Monaco', 'Menlo', 'Ubuntu Mono', monospace",
        fontSize: '14px',
        lineHeight: '1.6',
        whiteSpace: 'pre-wrap' as const,
        wordBreak: 'break-word' as const,
        color: '#2d3748',
    },
    actions: {
        padding: '1.5rem',
        borderTop: '1px solid #e2e8f0',
        display: 'flex',
        gap: '1rem',
        justifyContent: 'center',
    },
    actionButton: {
        padding: '0.75rem 1.5rem',
        backgroundColor: '#edf2f7',
        color: '#4a5568',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer',
        fontSize: '1rem',
        fontWeight: '600',
        transition: 'all 0.2s',
    },
    infoBox: {
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '1.5rem',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    },
    infoTitle: {
        margin: '0 0 1rem 0',
        fontSize: '1.25rem',
        color: '#2d3748',
    },
    infoList: {
        margin: 0,
        paddingLeft: '1.5rem',
        color: '#4a5568',
        lineHeight: '1.8',
    },
    footer: {
        marginTop: '3rem',
        padding: '1.5rem',
        textAlign: 'center' as const,
        color: '#718096',
        borderTop: '1px solid #e2e8f0',
    },
    footerText: {
        margin: 0,
        fontSize: '0.875rem',
    },
    footerLink: {
        color: '#4299e1',
        textDecoration: 'none',
        fontWeight: '600',
    },
};