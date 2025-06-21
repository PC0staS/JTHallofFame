import { useState, useEffect } from 'react';
import { getPhotos as getPhotosFromSupabase, type Photo } from '../lib/supabase';
import Comments from './Comments.tsx';

// Utilidad para forzar el uso del proxy para las URLs de R2
function toProxyUrl(url: string): string {
  if (!url) return '';
  // Solo forzar el proxy en producción
  if (import.meta.env.PROD) {
    // Detecta si es una URL de R2 (development, dominio personalizado anterior o nuevo)
    if (url.includes('.r2.dev/') || url.includes('memes.jonastown.es/') || url.includes('img.jonastown.es/')) {
      return `/r2-proxy?url=${encodeURIComponent(url)}`;
    }
  }
  return url;
}

// Utilidad para formatear el nombre del usuario
function formatUploadedBy(uploadedBy: string): string {
  if (!uploadedBy) return 'Usuario desconocido';
  
  // Si empieza con "user_" (formato de Clerk), extraer la parte útil
  if (uploadedBy.startsWith('user_')) {
    // Extraer el ID después de "user_" y tomar los últimos 8 caracteres
    const userId = uploadedBy.substring(5);
    return `user-${userId.slice(-8)}`;
  }
  
  // Si empieza con "user-", ya está en el formato correcto
  if (uploadedBy.startsWith('user-')) {
    return uploadedBy;
  }
  
  // Si es un username normal (sin prefijos), devolverlo tal como está
  if (uploadedBy.length > 0 && !uploadedBy.includes('@')) {
    return uploadedBy;
  }
  
  // Si es un email, extraer la parte antes del @
  if (uploadedBy.includes('@')) {
    return uploadedBy.split('@')[0];
  }
  
  return uploadedBy;
}

interface GalleryProps {
  photos?: Photo[];
  currentUserId?: string;
  currentUserName?: string;
  currentUserImageUrl?: string;
}

export default function Gallery({ photos: initialPhotos, currentUserId, currentUserName, currentUserImageUrl }: GalleryProps) {
  const [photos, setPhotos] = useState<Photo[]>(initialPhotos || []);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [loading, setLoading] = useState(!initialPhotos);
  const [isClient, setIsClient] = useState(false);
  const [deletingPhotoId, setDeletingPhotoId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [showComments, setShowComments] = useState<string | null>(null);
  const [commentCounts, setCommentCounts] = useState<Record<string, number>>({});
  const [loadingCommentCounts, setLoadingCommentCounts] = useState(false);
  
  // Filtrar fotos basado en el término de búsqueda
  const filteredPhotos = photos.filter(photo => {
    if (!searchTerm.trim()) return true;
    
    const searchLower = searchTerm.toLowerCase();
    const titleMatch = photo.title.toLowerCase().includes(searchLower);
    const userMatch = formatUploadedBy(photo.uploaded_by).toLowerCase().includes(searchLower);
    
    return titleMatch || userMatch;
  });

  useEffect(() => {
    setIsClient(true);
    if (!initialPhotos) {
      loadPhotos();
    } else {
      // Aplicar proxy a las URLs de las fotos
      const photosWithProxy = initialPhotos.map((photo: Photo) => ({
        ...photo,
        image_data: toProxyUrl(photo.image_data)
      }));
      setPhotos(photosWithProxy);
    }
  }, [initialPhotos]);

  // Cargar conteos cuando las fotos están listas
  useEffect(() => {
    if (photos.length > 0 && isClient) {
      console.log('Photos loaded, loading comment counts for', photos.length, 'photos');
      loadCommentCounts(photos);
    }
  }, [photos, isClient]);

  // Listener para el evento de refresh desde el navbar
  useEffect(() => {
    const handleRefreshPhotos = () => {
      console.log('Refresh photos event received');
      loadPhotos();
      
      // Si hay comentarios abiertos, crear evento para refrescarlos también
      if (showComments) {
        const refreshCommentsEvent = new CustomEvent('refreshComments', {
          detail: { photoId: showComments }
        });
        window.dispatchEvent(refreshCommentsEvent);
      }
    };

    window.addEventListener('refreshPhotos', handleRefreshPhotos);

    return () => {
      window.removeEventListener('refreshPhotos', handleRefreshPhotos);
    };
  }, [showComments]); // Añadido showComments como dependencia

  const loadPhotos = async () => {
    setLoading(true);
    const fetchedPhotos = await getPhotosFromSupabase();
    // Aplicar proxy a las URLs
    const photosWithProxy = fetchedPhotos.map((photo: Photo) => ({
      ...photo,
      image_data: toProxyUrl(photo.image_data)
    }));
    setPhotos(photosWithProxy);
    setLoading(false);
  };

  const deletePhoto = async (photoId: string, event?: React.MouseEvent) => {
    if (event) {
      event.stopPropagation(); // Evitar que se abra el modal
    }

    if (!confirm('¿Estás seguro de que quieres eliminar esta imagen?')) {
      return;
    }

    setDeletingPhotoId(photoId);

    try {
      const response = await fetch(`/api/delete-photo?id=${photoId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        // Remover la foto del estado local
        setPhotos(photos.filter(photo => photo.id !== photoId));
        // Cerrar modal si la foto eliminada estaba seleccionada
        if (selectedPhoto?.id === photoId) {
          setSelectedPhoto(null);
        }
        alert('Imagen eliminada exitosamente');
      } else {
        const error = await response.json();
        alert(`Error al eliminar la imagen: ${error.error}`);
      }
    } catch (error) {
      console.error('Error al eliminar foto:', error);
      alert('Error al eliminar la imagen');
    } finally {
      setDeletingPhotoId(null);
    }
  };

  const openModal = (photo: Photo) => {
    setSelectedPhoto(photo);
  };

  const closeModal = () => {
    setSelectedPhoto(null);
  };

  // Función para actualizar el conteo de comentarios de una foto específica
  const updateCommentCount = (photoId: string, newCount: number) => {
    setCommentCounts(prev => ({
      ...prev,
      [photoId]: newCount
    }));
  };

  // Función para cargar conteos de comentarios (optimizada: batch API)
  const loadCommentCounts = async (photoList: Photo[]) => {
    if (!photoList.length) {
      setCommentCounts({});
      return;
    }
    console.log('Cargando contadores de comentarios para', photoList.length, 'fotos');
    setLoadingCommentCounts(true);
    try {
      const response = await fetch('/api/comment-counts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ photoIds: photoList.map((p) => p.id) })
      });
      if (response.ok) {
        const counts = await response.json();
        console.log('Contadores recibidos:', counts);
        setCommentCounts(counts);
      } else {
        console.error('Error en la respuesta del servidor:', response.status);
        setCommentCounts({});
      }
    } catch (error) {
      console.error('Error cargando contadores:', error);
      setCommentCounts({});
    } finally {
      setLoadingCommentCounts(false);
    }
  };

  if (loading) {
    return (
      <div className="container-fluid p-4">
        {/* Barra de búsqueda (deshabilitada durante carga) */}
        <div className="row mb-4">
          <div className="col-12 col-md-8 col-lg-6 mx-auto">
            <div className="search-container loading">
              <i className="bi bi-search search-icon"></i>
              <input
                type="text"
                className="search-input"
                placeholder="Buscar por título o usuario..."
                value=""
                disabled
              />
            </div>
          </div>
        </div>
        <div className="d-flex justify-content-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
        </div>
      </div>
    );
  }

  // Mostrar un estado de carga durante la hidratación
  if (!isClient) {
    return (
      <div className="container-fluid p-4">
        <div className="row g-3">
          {photos.map((photo) => (
            <div key={photo.id} className="col-12 col-sm-6 col-md-4 col-lg-3">
              <div className="card h-100 shadow-sm custom-card gallery-image position-relative">
                <img
                  src={photo.image_data}
                  className="card-img-top"
                  alt={photo.title}
                  style={{ height: '200px', objectFit: 'cover' }}
                  loading="lazy"
                />
                <div className="card-body p-2">
                  <h6 className="card-title mb-1 text-truncate">{photo.title}</h6>
                  <small className="text-muted">
                    subido por {formatUploadedBy(photo.uploaded_by)}
                    <br />
                    {new Date(photo.uploaded_at).toLocaleDateString()}
                  </small>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid p-4">      {/* Barra de búsqueda */}
      <div className="row mb-4">
        <div className="col-12 col-md-8 col-lg-6 mx-auto">
          <div className="search-container">
            <i className="bi bi-search search-icon"></i>
            <input
              type="text"
              className="search-input"
              placeholder="Buscar por título o usuario..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button 
                className="clear-search-btn"
                onClick={() => setSearchTerm('')}
                title="Limpiar búsqueda"
              >
                <i className="bi bi-x-circle-fill"></i>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Grid de fotos */}
      <div className="row g-4">
        {filteredPhotos.map((photo) => (          <div key={photo.id} className="col-12 col-sm-6 col-md-4 col-lg-3">
            <div 
              className="photo-card position-relative"
              onClick={() => openModal(photo)}
            >
              {/* Botón de eliminar */}
              <button
                className="delete-btn"
                onClick={(e) => deletePhoto(photo.id, e)}
                disabled={deletingPhotoId === photo.id}
                title="Eliminar imagen"
              >
                {deletingPhotoId === photo.id ? (
                  <span className="spinner-border spinner-border-sm"></span>
                ) : (
                  <i className="bi bi-trash"></i>
                )}
              </button>              {/* Imagen de fondo que ocupa toda la card */}
              <img
                src={photo.image_data}
                className="card-background-image"
                alt={photo.title}
                loading="lazy"
              />
              
              {/* Glass effect overlay */}
              <div className="glass-overlay"></div>
              {/* Contenido de texto superpuesto */}
              <div className="text-overlay">
                <h6 className="overlay-title">{photo.title}</h6>
                <div className="overlay-meta">
                  <span className="overlay-author">
                    <i className="bi bi-person-circle me-1"></i>
                    {formatUploadedBy(photo.uploaded_by)}
                  </span>
                  <span className="overlay-date">
                    <i className="bi bi-calendar3 me-1"></i>
                    {new Date(photo.uploaded_at).toLocaleDateString()}
                  </span>
                </div>
                
                {/* Botón de comentarios en el overlay */}
                <button
                  className={`overlay-comments-btn ${commentCounts[photo.id] > 0 ? 'has-comments' : ''}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowComments(photo.id);
                  }}
                  title={`Ver comentarios${commentCounts[photo.id] !== undefined ? ` (${commentCounts[photo.id]})` : ''}`}
                >
                  <i className="bi bi-chat-dots"></i>
                  {/* Siempre mostrar contador: spinner si está cargando, número si ya se cargó */}
                  {commentCounts[photo.id] === undefined ? (
                    <span className="comment-count loading">
                      <div className="spinner-border spinner-border-sm"></div>
                    </span>
                  ) : commentCounts[photo.id] > 0 ? (
                    <span className="comment-count">{commentCounts[photo.id]}</span>
                  ) : (
                    <span className="comment-count zero">0</span>
                  )}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Estado vacío - cuando no hay fotos o no hay resultados de búsqueda */}
      {filteredPhotos.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">
            <i className={searchTerm.trim() ? "bi bi-search" : "bi bi-images"}></i>
          </div>
          {searchTerm.trim() ? (
            <>
              <h5>No se encontraron resultados</h5>
              <p>No hay fotos que coincidan con "{searchTerm}"</p>
              <button 
                className="btn btn-outline-primary"
                onClick={() => setSearchTerm('')}
              >
                <i className="bi bi-arrow-clockwise me-2"></i>
                Limpiar búsqueda
              </button>
            </>
          ) : (
            <>
              <h5>No hay fotos disponibles</h5>
              <p>Sube tu primera imagen para comenzar</p>
              <a href="/upload" className="btn btn-primary btn-upload-cta">
                <i className="bi bi-cloud-arrow-up me-2"></i>
                Subir primera imagen
              </a>
            </>
          )}
        </div>
      )}

      {/* Modal para mostrar foto ampliada */}
      {selectedPhoto && (
        <div 
          className="modal fade show d-block" 
          style={{ backgroundColor: 'rgba(0,0,0,0.8)' }}
          onClick={closeModal}
        >
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content bg-transparent border-0">
              <div className="modal-header border-0 position-absolute" style={{ top: 0, right: 0, zIndex: 20 }}>
                <button 
                  type="button" 
                  className="btn-close btn-close-white" 
                  onClick={closeModal}
                  style={{ position: 'absolute', top: '10px', right: '10px' }}
                ></button>
              </div>
              
              <div className="modal-body p-0 text-center">
                <img
                  src={selectedPhoto.image_data}
                  alt={selectedPhoto.title}
                  className="img-fluid"
                  style={{ 
                    maxHeight: '90vh',
                    maxWidth: '100%',
                    objectFit: 'contain'
                  }}
                  onClick={(e) => e.stopPropagation()}
                />
                <div className="mt-3 text-white">
                  <h5>{selectedPhoto.title}</h5>
                  <p className="mb-2">
                    Subido por {formatUploadedBy(selectedPhoto.uploaded_by)} - {new Date(selectedPhoto.uploaded_at).toLocaleDateString()}
                  </p>
                  
                  {/* Botón de eliminar en el modal */}
                  <button
                    className="btn btn-danger btn-sm me-2"
                    onClick={(e) => {
                      e.stopPropagation();
                      deletePhoto(selectedPhoto.id);
                    }}
                    disabled={deletingPhotoId === selectedPhoto.id}
                  >
                    {deletingPhotoId === selectedPhoto.id ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" style={{ width: '12px', height: '12px' }}></span>
                        Eliminando...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-trash me-2"></i>
                        Eliminar imagen
                      </>
                    )}
                  </button>

                  {/* Botón de comentarios en el modal */}
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowComments(selectedPhoto.id);
                    }}
                  >
                    <i className="bi bi-chat-dots me-2"></i>
                    Comentarios
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Componente de comentarios */}
      {showComments && (
        <Comments
          photoId={showComments}
          currentUserId={currentUserId}
          currentUserName={currentUserName}
          currentUserImageUrl={currentUserImageUrl}
          isOpen={!!showComments}
          onClose={() => setShowComments(null)}
          onCommentUpdate={updateCommentCount}
        />
      )}

      <style>{`
        .photo-card {
          position: relative;
          width: 100%;
          height: 300px;
          border-radius: 20px;
          overflow: hidden;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
        }
        
        .photo-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.25);
        }
        
        .card-background-image {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.3s ease;
        }
        
        .photo-card {
          transition: box-shadow 0.7s cubic-bezier(.4,1.6,.6,1), border-color 0.7s cubic-bezier(.4,1.6,.6,1), transform 0.4s cubic-bezier(.4,1.6,.6,1);
          border: 2px solid transparent;
        }
        .photo-card:hover {
          box-shadow:
            0 0 0 8px rgba(102,126,234,0.18),
            0 0 24px 8px rgba(102,126,234,0.18),
            0 8px 32px 0 rgba(102, 126, 234, 0.25),
            0 1.5px 12px 0 rgba(118, 75, 162, 0.15);
          border-color: #a3bffa;
          /* Borde luminoso animado */
          animation: borderGlow 1.5s linear infinite alternate;
          transform: scale(1.04);
        }
        @keyframes borderGlow {
          0% {
            box-shadow:
              0 0 0 4px rgba(102,126,234,0.10),
              0 0 24px 4px rgba(102,126,234,0.10),
              0 8px 32px 0 rgba(102, 126, 234, 0.18),
              0 1.5px 12px 0 rgba(118, 75, 162, 0.10);
          }
          100% {
            box-shadow:
              0 0 0 12px rgba(102,126,234,0.22),
              0 0 32px 16px rgba(102,126,234,0.22),
              0 8px 32px 0 rgba(102, 126, 234, 0.28),
              0 1.5px 12px 0 rgba(118, 75, 162, 0.18);
          }
        }
        .photo-card .card-background-image {
          transition: none;
        }
        .photo-card:hover .card-background-image {
          transform: none;
        }
        
        
        
        .text-overlay {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          background: linear-gradient(transparent, rgba(0, 0, 0, 0.8));
          padding: 2rem 1.5rem 1.5rem;
          color: white;
        }
        
        .overlay-title {
          font-size: 1.1rem;
          font-weight: 600;
          margin-bottom: 0.75rem;
          line-height: 1.3;
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.7);
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        
        .overlay-meta {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          font-size: 0.875rem;
        }
        
        .overlay-author, .overlay-date {
          display: flex;
          align-items: center;
          color: rgba(255, 255, 255, 0.9);
          text-shadow: 0 1px 3px rgba(0, 0, 0, 0.7);
        }
        
        .overlay-author i, .overlay-date i {
          font-size: 1rem;
          color: rgba(255, 255, 255, 0.8);
        }
        
        .delete-btn {
          position: absolute;
          top: 12px;
          right: 12px;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          border: none;
          background: rgba(220, 53, 69, 0.9);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10;
          opacity: 0;
          transition: all 0.3s ease;
          font-size: 14px;
          backdrop-filter: blur(8px);
        }
        
        .photo-card:hover .delete-btn {
          opacity: 1;
        }
        
        .delete-btn:hover {
          background: rgba(220, 53, 69, 1);
          transform: scale(1.1);
        }
        
        .overlay-comments-btn {
          position: absolute;
          bottom: 16px;
          right: 8px;
          width: 48px;
          height: 48px;
          border-radius: 50%;
          border: none;
          background: rgba(255, 255, 255, 0.2);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          cursor: pointer;
          transition: all 0.3s ease;
          backdrop-filter: blur(15px);
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.25);
          border: 2px solid rgba(255, 255, 255, 0.3);
        }
        
        .overlay-comments-btn:hover {
          background: rgba(255, 255, 255, 0.3);
          transform: scale(1.05);
          box-shadow: 0 6px 25px rgba(0, 0, 0, 0.3);
          border: 2px solid rgba(255, 255, 255, 0.5);
        }
        
        .overlay-comments-btn.has-comments {
          background: rgba(255, 255, 255, 0.25);
          box-shadow: 0 6px 25px rgba(0, 0, 0, 0.3);
        }
        
        .overlay-comments-btn.has-comments:hover {
          background: rgba(255, 255, 255, 0.4);
        }
        
        .comment-count {
          position: absolute;
          top: -6px;
          right: -6px;
          background: linear-gradient(135deg, #ff4757 0%, #ff3742 100%);
          color: white;
          border-radius: 50%;
          min-width: 24px;
          height: 24px;
          font-size: 13px;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 3px solid white;
          box-shadow: 0 3px 8px rgba(255, 71, 87, 0.4);
          animation: pulse 2s infinite;
        }
        
        .comment-count.loading {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          box-shadow: 0 3px 8px rgba(102, 126, 234, 0.4);
          animation: loadingPulse 1.5s ease-in-out infinite;
        }
        
        .comment-count.loading .spinner-border-sm {
          width: 12px;
          height: 12px;
          border-width: 1px;
        }
        
        .comment-count.zero {
          background: rgba(108, 117, 125, 0.8);
          color: white;
          box-shadow: 0 3px 8px rgba(108, 117, 125, 0.3);
          animation: none;
        }
        
        @keyframes pulse {
          0% {
            transform: scale(1);
            box-shadow: 0 3px 8px rgba(255, 71, 87, 0.4);
          }
          50% {
            transform: scale(1.1);
            box-shadow: 0 4px 12px rgba(255, 71, 87, 0.6);
          }
          100% {
            transform: scale(1);
            box-shadow: 0 3px 8px rgba(255, 71, 87, 0.4);
          }
        }
        
        @keyframes loadingPulse {
          0% {
            transform: scale(1);
            box-shadow: 0 3px 8px rgba(102, 126, 234, 0.4);
          }
          50% {
            transform: scale(1.05);
            box-shadow: 0 4px 12px rgba(102, 126, 234, 0.6);
          }
          100% {
            transform: scale(1);
            box-shadow: 0 3px 8px rgba(102, 126, 234, 0.4);
          }
        }

        .empty-state {
          text-align: center;
          padding: 4rem 2rem;
          color: #718096;
        }
        
        .empty-icon {
          font-size: 4rem;
          color: #e2e8f0;
          margin-bottom: 1.5rem;
        }
        
        .empty-state h5 {
          color: #4a5568;
          margin-bottom: 0.5rem;
        }
        
        .empty-state p {
          margin-bottom: 2rem;
        }
        
        .btn-upload-cta {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border: none;
          border-radius: 12px;
          padding: 0.75rem 2rem;
          font-weight: 600;
          transition: all 0.3s ease;
          box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
        }
        
        .btn-upload-cta:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
        }
        
        .bi {
          font-style: normal !important;
          line-height: 1 !important;
        }
        
        @media (max-width: 768px) {
          .photo-card {
            height: 250px;
          }
          
          .text-overlay {
            padding: 1.5rem 1rem 1rem;
          }
          
          .overlay-title {
            font-size: 1rem;
          }
          
          .overlay-meta {
            font-size: 0.8rem;
          }
          
          .photo-card:hover {
            transform: translateY(-4px);
          }
          
          .overlay-comments-btn {
            width: 42px;
            height: 42px;
            bottom: 12px;
            right: 6px;
            font-size: 16px;
          }
          
          .comment-count {
            min-width: 22px;
            height: 22px;
            font-size: 12px;
            top: -5px;
            right: -5px;
            border: 2px solid white;
          }
          
          .overlay-comments-btn {
            width: 36px;
            height: 36px;
            bottom: 12px;
            right: 12px;
            font-size: 14px;
          }
        }
          @media (max-width: 576px) {
          .photo-card {
            height: 220px;
          }
          
          .overlay-icon {
            font-size: 2rem;
          }        }
        
        /* Estilos mejorados para la búsqueda */
        .search-container {
          position: relative;
          display: flex;
          align-items: center;
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(20px);
          border-radius: 25px;
          border: 2px solid transparent;
          box-shadow: 
            0 8px 32px rgba(0, 0, 0, 0.1),
            0 1px 2px rgba(0, 0, 0, 0.05);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          overflow: hidden;
        }
        
        .search-container:focus-within {
          border-color: #667eea;
          box-shadow: 
            0 0 0 4px rgba(102, 126, 234, 0.15),
            0 12px 40px rgba(102, 126, 234, 0.2),
            0 1px 2px rgba(0, 0, 0, 0.05);
          transform: translateY(-2px);
        }
        
        .search-container.loading {
          opacity: 0.7;
          pointer-events: none;
        }
        
        .search-icon {
          position: absolute;
          left: 20px;
          color: #9ca3af;
          font-size: 18px;
          z-index: 2;
          transition: color 0.3s ease;
        }
        
        .search-container:focus-within .search-icon {
          color: #667eea;
        }
        
        .search-input {
          width: 100%;
          padding: 16px 60px 16px 50px;
          border: none;
          background: transparent;
          font-size: 16px;
          font-weight: 500;
          color: #374151;
          outline: none;
          transition: all 0.3s ease;
        }
        
        .search-input::placeholder {
          color: #9ca3af;
          font-weight: 400;
        }
        
        .search-input:focus::placeholder {
          color: transparent;
        }
        
        .clear-search-btn {
          position: absolute;
          right: 15px;
          background: none;
          border: none;
          color: #9ca3af;
          font-size: 18px;
          cursor: pointer;
          padding: 5px;
          border-radius: 50%;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .clear-search-btn:hover {
          color: #ef4444;
          background: rgba(239, 68, 68, 0.1);
          transform: scale(1.1);
        }
        
        .form-control:focus {
          border-color: #667eea !important;
          box-shadow: 0 0 0 0.2rem rgba(102, 126, 234, 0.25) !important;
        }
        
        .btn-outline-primary {
          border-color: #667eea;
          color: #667eea;
          border-radius: 12px;
          padding: 0.75rem 2rem;
          font-weight: 600;
          transition: all 0.3s ease;
        }
        
        .btn-outline-primary:hover {
          background-color: #667eea;
          border-color: #667eea;
          transform: translateY(-2px);
          box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
        }
        
        /* Responsive para la búsqueda */
        @media (max-width: 768px) {
          .search-container {
            border-radius: 20px;
          }
          
          .search-input {
            padding: 14px 50px 14px 45px;
            font-size: 15px;
          }
          
          .search-icon {
            left: 15px;
            font-size: 16px;
          }
          
          .clear-search-btn {
            right: 12px;
            font-size: 16px;
          }
        }
      `}</style>
    </div>
  );
}
