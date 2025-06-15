import { useState, useEffect } from 'react';

export interface Comment {
  id: string;
  photo_id: string;
  user_id: string;
  user_name: string;
  comment_text: string;
  created_at: string;
}

interface CommentsProps {
  photoId: string;
  currentUserId?: string;
  currentUserName?: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function Comments({ photoId, currentUserId, currentUserName, isOpen, onClose }: CommentsProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Cargar comentarios cuando se abre el modal
  useEffect(() => {
    if (isOpen && photoId) {
      loadComments();
    }
  }, [isOpen, photoId]);

  const loadComments = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/comments?photoId=${photoId}`);
      if (response.ok) {
        const data = await response.json();
        setComments(data.comments || []);
      }
    } catch (error) {
      console.error('Error loading comments:', error);
    } finally {
      setLoading(false);
    }
  };

  const submitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !currentUserId || submitting) return;

    setSubmitting(true);
    try {
      const response = await fetch('/api/add-comment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          photoId,
          commentText: newComment.trim(),
          userName: currentUserName
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setComments([...comments, data.comment]);
        setNewComment('');
      } else {
        alert('Error al añadir el comentario');
      }
    } catch (error) {
      console.error('Error submitting comment:', error);
      alert('Error al añadir el comentario');
    } finally {
      setSubmitting(false);
    }
  };

  const deleteComment = async (commentId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este comentario?')) return;

    setDeletingId(commentId);
    try {
      const response = await fetch(`/api/delete-comment?id=${commentId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setComments(comments.filter(c => c.id !== commentId));
      } else {
        alert('Error al eliminar el comentario');
      }
    } catch (error) {
      console.error('Error deleting comment:', error);
      alert('Error al eliminar el comentario');
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'Ahora mismo';
    if (diffMins < 60) return `hace ${diffMins} min`;
    if (diffHours < 24) return `hace ${diffHours}h`;
    if (diffDays < 7) return `hace ${diffDays}d`;
    return date.toLocaleDateString();
  };

  if (!isOpen) return null;

  return (
    <div className="comments-overlay" onClick={onClose}>
      <div className="comments-modal" onClick={(e) => e.stopPropagation()}>
        <div className="comments-header">
          <h5 className="comments-title">
            <i className="bi bi-chat-dots me-2"></i>
            Comentarios ({comments.length})
          </h5>
          <button className="comments-close-btn" onClick={onClose}>
            <i className="bi bi-x-lg"></i>
          </button>
        </div>

        <div className="comments-body">
          {loading ? (
            <div className="comments-loading">
              <div className="spinner-border spinner-border-sm me-2"></div>
              Cargando comentarios...
            </div>
          ) : comments.length === 0 ? (
            <div className="comments-empty">
              <i className="bi bi-chat-text text-muted"></i>
              <p>No hay comentarios aún</p>
              <small className="text-muted">¡Sé el primero en comentar!</small>
            </div>
          ) : (
            <div className="comments-list">
              {comments.map((comment) => (
                <div key={comment.id} className="comment-item">
                  <div className="comment-avatar">
                    <i className="bi bi-person-circle"></i>
                  </div>
                  <div className="comment-content">
                    <div className="comment-header">
                      <span className="comment-author">{comment.user_name}</span>
                      <span className="comment-date">{formatDate(comment.created_at)}</span>
                      {currentUserId === comment.user_id && (
                        <button
                          className="comment-delete-btn"
                          onClick={() => deleteComment(comment.id)}
                          disabled={deletingId === comment.id}
                          title="Eliminar comentario"
                        >
                          {deletingId === comment.id ? (
                            <span className="spinner-border spinner-border-sm"></span>
                          ) : (
                            <i className="bi bi-trash3"></i>
                          )}
                        </button>
                      )}
                    </div>
                    <p className="comment-text">{comment.comment_text}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {currentUserId && (
          <div className="comments-footer">
            <form onSubmit={submitComment} className="comment-form">
              <div className="comment-input-group">
                <div className="comment-input-avatar">
                  <i className="bi bi-person-circle"></i>
                </div>
                <textarea
                  className="comment-input"
                  placeholder="Escribe un comentario..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  rows={2}
                  maxLength={500}
                  disabled={submitting}
                />
              </div>
              <div className="comment-actions">
                <span className="comment-char-count">
                  {newComment.length}/500
                </span>
                <button
                  type="submit"
                  className="comment-submit-btn"
                  disabled={!newComment.trim() || submitting}
                >
                  {submitting ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>
                      Enviando...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-send me-2"></i>
                      Comentar
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        <style>{`
          .comments-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
            padding: 20px;
          }

          .comments-modal {
            background: white;
            border-radius: 20px;
            width: 100%;
            max-width: 500px;
            max-height: 80vh;
            display: flex;
            flex-direction: column;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
            overflow: hidden;
          }

          .comments-header {
            padding: 20px 24px 16px;
            border-bottom: 1px solid #e9ecef;
            display: flex;
            align-items: center;
            justify-content: space-between;
            background: #f8f9fa;
          }

          .comments-title {
            margin: 0;
            color: #495057;
            font-weight: 600;
            display: flex;
            align-items: center;
          }

          .comments-close-btn {
            background: none;
            border: none;
            font-size: 18px;
            color: #6c757d;
            cursor: pointer;
            padding: 8px;
            border-radius: 8px;
            transition: all 0.2s ease;
          }

          .comments-close-btn:hover {
            background: #e9ecef;
            color: #495057;
          }

          .comments-body {
            flex: 1;
            overflow-y: auto;
            min-height: 200px;
            max-height: 400px;
          }

          .comments-loading {
            padding: 40px 24px;
            text-align: center;
            color: #6c757d;
          }

          .comments-empty {
            padding: 40px 24px;
            text-align: center;
            color: #6c757d;
          }

          .comments-empty i {
            font-size: 3rem;
            margin-bottom: 16px;
            display: block;
          }

          .comments-empty p {
            margin-bottom: 8px;
            font-weight: 500;
          }

          .comments-list {
            padding: 16px 0;
          }

          .comment-item {
            display: flex;
            padding: 16px 24px;
            gap: 12px;
            transition: background 0.2s ease;
          }

          .comment-item:hover {
            background: #f8f9fa;
          }

          .comment-avatar {
            flex-shrink: 0;
          }

          .comment-avatar i {
            font-size: 32px;
            color: #6c757d;
          }

          .comment-content {
            flex: 1;
            min-width: 0;
          }

          .comment-header {
            display: flex;
            align-items: center;
            gap: 12px;
            margin-bottom: 6px;
          }

          .comment-author {
            font-weight: 600;
            color: #495057;
            font-size: 14px;
          }

          .comment-date {
            font-size: 12px;
            color: #6c757d;
          }

          .comment-delete-btn {
            margin-left: auto;
            background: none;
            border: none;
            color: #dc3545;
            cursor: pointer;
            padding: 4px 8px;
            border-radius: 6px;
            font-size: 12px;
            opacity: 0.7;
            transition: all 0.2s ease;
          }

          .comment-delete-btn:hover {
            opacity: 1;
            background: rgba(220, 53, 69, 0.1);
          }

          .comment-text {
            margin: 0;
            color: #495057;
            line-height: 1.5;
            word-wrap: break-word;
            font-size: 14px;
          }

          .comments-footer {
            border-top: 1px solid #e9ecef;
            padding: 20px 24px;
            background: #f8f9fa;
          }

          .comment-form {
            display: flex;
            flex-direction: column;
            gap: 12px;
          }

          .comment-input-group {
            display: flex;
            gap: 12px;
            align-items: flex-start;
          }

          .comment-input-avatar i {
            font-size: 28px;
            color: #6c757d;
          }

          .comment-input {
            flex: 1;
            border: 1px solid #dee2e6;
            border-radius: 12px;
            padding: 12px 16px;
            font-size: 14px;
            resize: none;
            transition: border-color 0.2s ease;
            font-family: inherit;
          }

          .comment-input:focus {
            outline: none;
            border-color: #667eea;
            box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
          }

          .comment-actions {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-left: 40px;
          }

          .comment-char-count {
            font-size: 12px;
            color: #6c757d;
          }

          .comment-submit-btn {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border: none;
            color: white;
            padding: 8px 16px;
            border-radius: 8px;
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s ease;
            display: flex;
            align-items: center;
          }

          .comment-submit-btn:hover:not(:disabled) {
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
          }

          .comment-submit-btn:disabled {
            opacity: 0.6;
            cursor: not-allowed;
            transform: none;
          }

          @media (max-width: 768px) {
            .comments-overlay {
              padding: 10px;
            }

            .comments-modal {
              max-height: 90vh;
              border-radius: 16px;
            }

            .comments-header {
              padding: 16px 20px 12px;
            }

            .comments-title {
              font-size: 16px;
            }

            .comment-item {
              padding: 12px 20px;
            }

            .comments-footer {
              padding: 16px 20px;
            }

            .comment-actions {
              margin-left: 36px;
            }
          }
        `}</style>
      </div>
    </div>
  );
}
