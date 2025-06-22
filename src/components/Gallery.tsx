import { useState, useEffect } from 'react';
import { getPhotos as getPhotosFromSupabase, type Photo } from '../lib/supabase';
import Comments from './Comments.tsx';

// Utilidad para normalizar URLs y eliminar dobles barras
function normalizeUrl(url: string): string {
  if (!url) return '';
  
  // Reemplazar múltiples barras consecutivas con una sola (excepto después de http:// o https://)
  return url.replace(/([^:]\/)\/+/g, '$1');
}

// Utilidad para forzar el uso del proxy para las URLs de R2
function toProxyUrl(url: string): string {
  if (!url) return '';
  
  // Primero normalizar la URL para eliminar dobles barras
  const normalizedUrl = normalizeUrl(url);
  
  console.log('Original URL:', url);
  console.log('Normalized URL:', normalizedUrl);
  
  // En desarrollo, permitir acceso directo para debugging
  if (import.meta.env.DEV) {
    console.log('Development mode - using direct URL:', normalizedUrl);
    return normalizedUrl;
  }
  
  // Solo forzar el proxy en producción
  if (import.meta.env.PROD) {
    // Detecta si es una URL de R2 (development, dominio personalizado anterior o nuevo)
    if (normalizedUrl.includes('.r2.dev/') || 
        normalizedUrl.includes('memes.jonastown.es/') || 
        normalizedUrl.includes('img.jonastown.es/') ||
        normalizedUrl.includes('pub-') || // Para detectar URLs de R2 genéricas
        normalizedUrl.includes('r2.cloudflarestorage.com')) {
      const proxyUrl = `/r2-proxy?url=${encodeURIComponent(normalizedUrl)}`;
      console.log('Using proxy URL:', proxyUrl);
      return proxyUrl;
    }
  }
  
  console.log('Using direct URL:', normalizedUrl);
  return normalizedUrl;
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
  
  // Estado y funciones de zoom para el modal
  const [modalZoom, setModalZoom] = useState(1);
  const ZOOM_MIN = 1;
  const ZOOM_MAX = 4;
  const ZOOM_STEP = 0.2;

  // Estado y lógica para drag de la imagen ampliada
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  // Resetear zoom y drag al abrir/cerrar modal o cambiar imagen
  useEffect(() => {
    setModalZoom(1);
    setDragOffset({ x: 0, y: 0 });
    setIsDragging(false);
    setDragStart(null);
  }, [selectedPhoto]);
  const handleZoomIn = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setModalZoom(z => Math.min(ZOOM_MAX, +(z + ZOOM_STEP).toFixed(2)));
  };  const handleZoomOut = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const newZoom = Math.max(ZOOM_MIN, +(modalZoom - ZOOM_STEP).toFixed(2));
    setModalZoom(newZoom);
    // Si volvemos a zoom 1, resetear el drag inmediatamente
    if (newZoom === 1) {
      setDragOffset({ x: 0, y: 0 });
      setIsDragging(false);
      setDragStart(null);
    }
  };

  const handleResetPhoto = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setModalZoom(1);
    setDragOffset({ x: 0, y: 0 });
    setIsDragging(false);
    setDragStart(null);
  };const handleWheelZoom = (e: React.WheelEvent<HTMLImageElement>) => {
    if (e.ctrlKey || Math.abs(e.deltaY) < 2) return; // ignorar gestos de pinch
    e.preventDefault();
    e.stopPropagation();
    
    if (e.deltaY < 0) {
      setModalZoom(z => Math.min(ZOOM_MAX, +(z + ZOOM_STEP).toFixed(2)));
    } else if (e.deltaY > 0) {
      const newZoom = Math.max(ZOOM_MIN, +(modalZoom - ZOOM_STEP).toFixed(2));
      setModalZoom(newZoom);
      // Si volvemos a zoom 1, resetear el drag inmediatamente
      if (newZoom === 1) {
        setDragOffset({ x: 0, y: 0 });
        setIsDragging(false);
        setDragStart(null);
      }
    }
  };

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
      console.log('Initial photos received:', initialPhotos.map(p => ({ id: p.id, title: p.title, image_data: p.image_data })));
      
      // Aplicar proxy a las URLs de las fotos
      const photosWithProxy = initialPhotos.map((photo: Photo) => ({
        ...photo,
        image_data: toProxyUrl(photo.image_data)
      }));
      
      console.log('Initial photos with proxy:', photosWithProxy.map(p => ({ id: p.id, title: p.title, image_data: p.image_data })));
      
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

  // Verificar coherencia de selectedPhoto con filteredPhotos
  useEffect(() => {
    if (selectedPhoto && filteredPhotos.length > 0) {
      const photoExists = filteredPhotos.some(photo => photo.id === selectedPhoto.id);
      if (!photoExists) {
        // Si la foto seleccionada ya no está en los filtros, cerrar modal
        closeModal();
      }
    }
  }, [filteredPhotos]);
  const loadPhotos = async () => {
    setLoading(true);
    const fetchedPhotos = await getPhotosFromSupabase();
    
    console.log('Raw photos from database:', fetchedPhotos.map(p => ({ id: p.id, title: p.title, image_data: p.image_data })));
    
    // Aplicar proxy a las URLs
    const photosWithProxy = fetchedPhotos.map((photo: Photo) => ({
      ...photo,
      image_data: toProxyUrl(photo.image_data)
    }));
    
    console.log('Photos with proxy URLs:', photosWithProxy.map(p => ({ id: p.id, title: p.title, image_data: p.image_data })));
    
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

  // Funciones de navegación en el modal
  const goToPreviousPhoto = () => {
    if (!selectedPhoto || filteredPhotos.length === 0) return;
    
    const currentIndex = filteredPhotos.findIndex(photo => photo.id === selectedPhoto.id);
    if (currentIndex === -1) return;
    
    const previousIndex = currentIndex > 0 ? currentIndex - 1 : filteredPhotos.length - 1;
    const previousPhoto = filteredPhotos[previousIndex];
    
    if (previousPhoto) {
      setSelectedPhoto(previousPhoto);
    }
  };

  const goToNextPhoto = () => {
    if (!selectedPhoto || filteredPhotos.length === 0) return;
    
    const currentIndex = filteredPhotos.findIndex(photo => photo.id === selectedPhoto.id);
    if (currentIndex === -1) return;
    
    const nextIndex = currentIndex < filteredPhotos.length - 1 ? currentIndex + 1 : 0;
    const nextPhoto = filteredPhotos[nextIndex];
    
    if (nextPhoto) {
      setSelectedPhoto(nextPhoto);
    }
  };

  // Manejar teclas de navegación
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!selectedPhoto) return;
      
      switch (event.key) {
        case 'ArrowLeft':
          event.preventDefault();
          goToPreviousPhoto();
          break;
        case 'ArrowRight':
          event.preventDefault();
          goToNextPhoto();
          break;
        case 'Escape':
          event.preventDefault();
          closeModal();
          break;
      }
    };

    if (selectedPhoto) {
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedPhoto, filteredPhotos]);

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
  };  // --- DRAG HELPERS PARA EL MODAL ---
  function getLimitedOffset() {
    // Forzar centrado cuando zoom es exactamente 1
    if (modalZoom === 1) {
      return { x: 0, y: 0 };
    }
    if (!selectedPhoto) return { x: 0, y: 0 };
    
    const maxOffset = 200 * (modalZoom - 1);
    return {
      x: Math.max(Math.min(dragOffset.x, maxOffset), -maxOffset),
      y: Math.max(Math.min(dragOffset.y, maxOffset), -maxOffset),
    };
  }  function handleMouseDown(e: React.MouseEvent<HTMLImageElement>) {
    if (modalZoom <= 1) return;
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  }function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    if (!isDragging || !dragStart) return;
    e.preventDefault();
    e.stopPropagation();
    
    // Ajustar sensibilidad basada en el zoom - menos sensible a mayor zoom
    const sensitivity = Math.max(0.3, 1 / modalZoom);
    const deltaX = (e.clientX - dragStart.x) * sensitivity;
    const deltaY = (e.clientY - dragStart.y) * sensitivity;
    
    const newOffset = {
      x: dragOffset.x + deltaX,
      y: dragOffset.y + deltaY,
    };
    setDragOffset(newOffset);
    
    // Actualizar dragStart para el próximo movimiento
    setDragStart({ x: e.clientX, y: e.clientY });
  }  function handleMouseUp(e?: React.MouseEvent<HTMLDivElement>) {
    if (!isDragging) return;
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setIsDragging(false);
    setDragStart(null);
  }
  function handleTouchStart(e: React.TouchEvent<HTMLImageElement>) {
    if (modalZoom <= 1) return;
    if (e.touches.length !== 1) return;
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
    setDragStart({
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
    });
  }function handleTouchMove(e: React.TouchEvent<HTMLDivElement>) {
    if (!isDragging || !dragStart || e.touches.length !== 1) return;
    e.preventDefault();
    e.stopPropagation();
    
    // Ajustar sensibilidad basada en el zoom - menos sensible a mayor zoom
    const sensitivity = Math.max(0.3, 1 / modalZoom);
    const deltaX = (e.touches[0].clientX - dragStart.x) * sensitivity;
    const deltaY = (e.touches[0].clientY - dragStart.y) * sensitivity;
    
    const newOffset = {
      x: dragOffset.x + deltaX,
      y: dragOffset.y + deltaY,
    };
    setDragOffset(newOffset);
    
    // Actualizar dragStart para el próximo movimiento
    setDragStart({ x: e.touches[0].clientX, y: e.touches[0].clientY });
  }

  function handleTouchEnd(e?: React.TouchEvent<HTMLDivElement>) {
    if (!isDragging) return;
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setIsDragging(false);
    setDragStart(null);
  }

  // Efecto para asegurar centrado cuando zoom vuelve a 1
  useEffect(() => {
    if (modalZoom === 1) {
      setDragOffset({ x: 0, y: 0 });
    }
  }, [modalZoom]);

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
                onError={(e) => {
                  console.error('Failed to load image:', photo.image_data, 'for photo:', photo.title);
                  // Intentar cargar la URL original si el proxy falla
                  const originalUrl = photo.image_data.includes('/r2-proxy?url=') 
                    ? decodeURIComponent(photo.image_data.split('/r2-proxy?url=')[1])
                    : photo.image_data;
                  if (e.currentTarget.src !== originalUrl) {
                    console.log('Trying original URL:', originalUrl);
                    e.currentTarget.src = originalUrl;
                  }
                }}
                onLoad={() => {
                  console.log('Successfully loaded image:', photo.image_data, 'for photo:', photo.title);
                }}
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
                      <div className="glass-spinner">
                        <div className="glass-spinner-inner"></div>
                      </div>
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
      {selectedPhoto && (        <div 
          className="modal-overlay" 
          onClick={isDragging ? undefined : closeModal}
          onMouseMove={isDragging ? handleMouseMove : undefined}
          onMouseUp={isDragging ? handleMouseUp : undefined}
          onMouseLeave={isDragging ? handleMouseUp : undefined}
          onTouchMove={isDragging ? handleTouchMove : undefined}
          onTouchEnd={isDragging ? handleTouchEnd : undefined}
        >          <div 
            className="modal-container"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Controles de zoom */}
            <div className="modal-zoom-controls mt-4">
              <button
                className="modal-zoom-btn"
                onClick={handleZoomOut}
                disabled={modalZoom <= ZOOM_MIN}
                title="Alejar (-)"
              >
                <i className="bi bi-zoom-out"></i>
              </button>
              <span className="modal-zoom-label">{(modalZoom * 100).toFixed(0)}%</span>
              <button
                className="modal-zoom-btn"
                onClick={handleZoomIn}
                disabled={modalZoom >= ZOOM_MAX}
                title="Acercar (+)"
              >
                <i className="bi bi-zoom-in"></i>
              </button>
              <button
                className="modal-zoom-btn reset-btn"
                onClick={handleResetPhoto}
                disabled={modalZoom === 1 && dragOffset.x === 0 && dragOffset.y === 0}
                title="Resetear vista (1:1)"
              >
                <i className="bi bi-arrow-counterclockwise"></i>
              </button>
            </div>

            {/* Botón cerrar mejorado - ahora por encima de los controles */}
            <button 
              className="modal-close-btn"
              onClick={closeModal}
              title="Cerrar (Esc)"
            >
              <i className="bi bi-x-lg"></i>
            </button>{/* Contenedor de imagen mejorado */}
            <div className="modal-image-container">              <img
                src={selectedPhoto.image_data}
                alt={selectedPhoto.title}
                className="modal-image"
                style={{ 
                  transform: `scale(${modalZoom}) translate(${getLimitedOffset().x}px, ${getLimitedOffset().y}px)`,
                  cursor: modalZoom > 1 ? (isDragging ? 'grabbing' : 'grab') : 'zoom-in',
                  transition: isDragging ? 'none' : 'transform 0.2s cubic-bezier(.4,1.6,.6,1)',
                  userSelect: 'none',
                  transformOrigin: 'center center',
                }}
                onClick={(e) => e.stopPropagation()}
                onWheel={handleWheelZoom}
                draggable={false}
                onMouseDown={handleMouseDown}
                onTouchStart={handleTouchStart}
                onError={(e) => {
                  console.error('Failed to load modal image:', selectedPhoto.image_data);
                  // Intentar cargar la URL original si el proxy falla
                  const originalUrl = selectedPhoto.image_data.includes('/r2-proxy?url=') 
                    ? decodeURIComponent(selectedPhoto.image_data.split('/r2-proxy?url=')[1])
                    : selectedPhoto.image_data;
                  if (e.currentTarget.src !== originalUrl) {
                    console.log('Trying original URL for modal:', originalUrl);
                    e.currentTarget.src = originalUrl;
                  }
                }}
                onLoad={() => {
                  console.log('Successfully loaded modal image:', selectedPhoto.image_data);
                }}
              /></div>

            {/* Panel de información mejorado */}
            <div className="modal-info-panel">
              <div className="modal-info-content">
                <div className="modal-header-info">
                  <h3 className="modal-title">{selectedPhoto.title}</h3>
                  {filteredPhotos.length > 1 && (
                    <span className="modal-counter">
                      {filteredPhotos.findIndex(photo => photo.id === selectedPhoto.id) + 1} / {filteredPhotos.length}
                    </span>
                  )}
                </div>
                
                <div className="modal-meta">
                  <div className="modal-meta-item">
                    <i className="bi bi-person-circle"></i>
                    <span>Subido por {formatUploadedBy(selectedPhoto.uploaded_by)}</span>
                  </div>
                  <div className="modal-meta-item">
                    <i className="bi bi-calendar3"></i>
                    <span>{new Date(selectedPhoto.uploaded_at).toLocaleDateString()}</span>
                  </div>
                </div>
                
                {/* Botones de acción mejorados */}
                <div className="modal-actions">
                  <button
                    className="modal-action-btn primary"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowComments(selectedPhoto.id);
                    }}
                  >
                    <i className="bi bi-chat-dots"></i>
                    <span>Comentarios</span>
                    {commentCounts[selectedPhoto.id] > 0 && (
                      <span className="action-badge">{commentCounts[selectedPhoto.id]}</span>
                    )}
                  </button>
                  
                  <button
                    className="modal-action-btn danger"
                    onClick={(e) => {
                      e.stopPropagation();
                      deletePhoto(selectedPhoto.id);
                    }}
                    disabled={deletingPhotoId === selectedPhoto.id}
                  >
                    {deletingPhotoId === selectedPhoto.id ? (
                      <>
                        <div className="spinner-small"></div>
                        <span>Eliminando...</span>
                      </>
                    ) : (
                      <>
                        <i className="bi bi-trash"></i>
                        <span>Eliminar</span>
                      </>
                    )}
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
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0.1) 100%);
          backdrop-filter: blur(15px);
          border: 1px solid rgba(255, 255, 255, 0.3);
          box-shadow: 
            0 3px 8px rgba(0, 0, 0, 0.2),
            inset 0 1px 0 rgba(255, 255, 255, 0.4);
          animation: glassyPulse 2s ease-in-out infinite;
        }
        
        .glass-spinner {
          width: 14px;
          height: 14px;
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .glass-spinner-inner {
          width: 12px;
          height: 12px;
          border: 2px solid transparent;
          border-top: 2px solid rgba(255, 255, 255, 0.8);
          border-right: 2px solid rgba(255, 255, 255, 0.6);
          border-radius: 50%;
          animation: glassySpin 1s linear infinite;
          filter: drop-shadow(0 0 4px rgba(255, 255, 255, 0.3));
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
        
        @keyframes glassyPulse {
          0% {
            transform: scale(1);
            box-shadow: 
              0 3px 8px rgba(0, 0, 0, 0.2),
              inset 0 1px 0 rgba(255, 255, 255, 0.4),
              0 0 0 0 rgba(255, 255, 255, 0.3);
          }
          50% {
            transform: scale(1.05);
            box-shadow: 
              0 4px 12px rgba(0, 0, 0, 0.3),
              inset 0 1px 0 rgba(255, 255, 255, 0.6),
              0 0 0 4px rgba(255, 255, 255, 0.1);
          }
          100% {
            transform: scale(1);
            box-shadow: 
              0 3px 8px rgba(0, 0, 0, 0.2),
              inset 0 1px 0 rgba(255, 255, 255, 0.4),
              0 0 0 0 rgba(255, 255, 255, 0.3);
          }
        }
        
        @keyframes glassySpin {
          0% {
            transform: rotate(0deg);
            filter: drop-shadow(0 0 4px rgba(255, 255, 255, 0.3));
          }
          50% {
            filter: drop-shadow(0 0 8px rgba(255, 255, 255, 0.5));
          }
          100% {
            transform: rotate(360deg);
            filter: drop-shadow(0 0 4px rgba(255, 255, 255, 0.3));
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
          /* Estilos para el modal mejorado */
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.9);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1040;
          animation: modalFadeIn 0.2s ease-out;
          will-change: opacity;
          touch-action: none;
          -webkit-overflow-scrolling: touch;
          user-select: none;
        }
        
        .modal-container {
          position: relative;
          width: 95vw;
          height: 95vh;
          max-width: 1200px;
          display: flex;
          flex-direction: column;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 24px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(15px);
          box-shadow: 
            0 25px 50px rgba(0, 0, 0, 0.3),
            inset 0 1px 0 rgba(255, 255, 255, 0.1);
          overflow: hidden;
          will-change: transform, opacity;
          animation: modalSlideIn 0.2s ease-out;
        }
          .modal-close-btn {
          position: absolute;
          top: 20px;
          right: 20px;
          width: 44px;
          height: 44px;
          background: rgba(0, 0, 0, 0.6);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 50%;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          cursor: pointer;
          z-index: 20;
          transition: all 0.3s ease;
          backdrop-filter: blur(10px);
        }
        
        .modal-close-btn:hover {
          background: rgba(220, 53, 69, 0.8);
          border-color: rgba(220, 53, 69, 0.6);
          transform: scale(1.1);
        }
        
        .modal-image-container {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          min-height: 0;
        }
          .modal-image {
          max-width: 100%;
          max-height: 100%;
          object-fit: contain;
          border-radius: 16px;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
          transition: transform 0.2s ease;
          will-change: transform;
          image-rendering: -webkit-optimize-contrast;
          transform-origin: center center;
          display: block;
        }
        
        .modal-image:hover {
          transform: scale(1.01);
        }
        
        .modal-info-panel {
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.04) 100%);
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          padding: 24px;
          backdrop-filter: blur(10px);
          will-change: transform;
        }
        
        .modal-info-content {
          max-width: 800px;
          margin: 0 auto;
        }
        
        .modal-header-info {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
        }
        
        .modal-title {
          color: white;
          font-size: 1.5rem;
          font-weight: 600;
          margin: 0;
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
        }
        
        .modal-counter {
          background: rgba(102, 126, 234, 0.2);
          border: 1px solid rgba(102, 126, 234, 0.3);
          color: #a3bffa;
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 0.9rem;
          font-weight: 500;
          backdrop-filter: blur(10px);
        }
        
        .modal-meta {
          display: flex;
          gap: 24px;
          margin-bottom: 20px;
        }
        
        .modal-meta-item {
          display: flex;
          align-items: center;
          gap: 8px;
          color: rgba(255, 255, 255, 0.8);
          font-size: 0.95rem;
        }
        
        .modal-meta-item i {
          color: rgba(255, 255, 255, 0.6);
          font-size: 1.1rem;
        }
        
        .modal-actions {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
        }
        
        .modal-action-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 20px;
          border-radius: 12px;
          border: none;
          font-weight: 500;
          cursor: pointer;
          transition: transform 0.2s ease, background-color 0.2s ease, border-color 0.2s ease;
          backdrop-filter: blur(10px);
          position: relative;
          will-change: transform;
        }
        
        .modal-action-btn.primary {
          background: rgba(102, 126, 234, 0.2);
          border: 1px solid rgba(102, 126, 234, 0.3);
          color: #a3bffa;
        }
        
        .modal-action-btn.primary:hover {
          background: rgba(102, 126, 234, 0.3);
          border-color: rgba(102, 126, 234, 0.5);
          color: white;
          transform: translateY(-2px) translateZ(0);
        }
        
        .modal-action-btn.danger {
          background: rgba(220, 53, 69, 0.2);
          border: 1px solid rgba(220, 53, 69, 0.3);
          color: #f87171;
        }
        
        .modal-action-btn.danger:hover {
          background: rgba(220, 53, 69, 0.3);
          border-color: rgba(220, 53, 69, 0.5);
          color: white;
          transform: translateY(-2px) translateZ(0);
        }
        
        .modal-action-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none !important;
        }
        
        .action-badge {
          background: linear-gradient(135deg, #ff4757 0%, #ff3742 100%);
          color: white;
          padding: 2px 8px;
          border-radius: 12px;
          font-size: 0.8rem;
          font-weight: 600;
          min-width: 20px;
          text-align: center;
        }
        
        .spinner-small {
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top: 2px solid white;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
        .modal-nav-btn {
          position: fixed;
          top: 50%;
          transform: translateY(-50%) translateZ(0);
          width: 56px;
          height: 56px;
          background: rgba(0, 0, 0, 0.6);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 50%;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          cursor: pointer;
          z-index: 15;
          transition: transform 0.2s ease, background-color 0.2s ease;
          backdrop-filter: blur(10px);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
          will-change: transform;
        }
        
        .modal-nav-btn:hover {
          background: rgba(255, 255, 255, 0.1);
          border-color: rgba(255, 255, 255, 0.4);
          transform: translateY(-50%) scale(1.1) translateZ(0);
        }
        
        .modal-nav-btn:active {
          transform: translateY(-50%) scale(1.05) translateZ(0);
        }
        
        .modal-nav-btn.prev {
          left: 30px;
        }
        
        .modal-nav-btn.next {
          right: 30px;
        }
        
        /* Animaciones optimizadas del modal */
        @keyframes modalFadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        
        @keyframes modalSlideIn {
          from {
            opacity: 0;
            transform: scale(0.95) translateY(20px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        
        @media (max-width: 768px) {
          .modal-container {
            width: 100vw;
            height: 100vh;
            border-radius: 0;
          }
            .modal-close-btn {
            top: 15px;
            right: 15px;
            width: 40px;
            height: 40px;
            font-size: 16px;
            z-index: 20;
          }
          
          .modal-nav-btn {
            width: 48px;
            height: 48px;
            font-size: 20px;
          }
          
          .modal-nav-btn.prev {
            left: 15px;
          }
          
          .modal-nav-btn.next {
            right: 15px;
          }
          
          .modal-info-panel {
            padding: 20px 16px;
          }
          
          .modal-title {
            font-size: 1.3rem;
          }
          
          .modal-meta {
            flex-direction: column;
            gap: 12px;
          }
          
          .modal-actions {
            flex-direction: column;
          }
          
          .modal-action-btn {
            width: 100%;
            justify-content: center;
          }
        }
        
        @media (max-width: 576px) {
          .modal-nav-btn {
            width: 44px;
            height: 44px;
            font-size: 18px;
          }
          
          .modal-nav-btn.prev {
            left: 10px;
          }
          
          .modal-nav-btn.next {
            right: 10px;
          }
          
          .modal-image-container {
            padding: 15px;
          }
        }
        
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

        /* Controles de zoom en el modal */
        .modal-zoom-controls {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 1rem;
          margin-bottom: 1rem;
          z-index: 10;
        }        .modal-zoom-btn {
          background: #fff;
          border: 1.5px solid #a3bffa;
          color: #667eea;
          border-radius: 50%;
          width: 38px;
          height: 38px;
          font-size: 1.3rem;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 8px rgba(102,126,234,0.08);
          transition: all 0.2s;
          cursor: pointer;
        }
        
        .modal-zoom-btn.reset-btn {
          background: #fff;
          border: 1.5px solid #f59e0b;
          color: #f59e0b;
          font-size: 1.1rem;
        }
        
        .modal-zoom-btn.reset-btn:hover:not(:disabled) {
          background: #f59e0b;
          color: #fff;
          border-color: #f59e0b;
          transform: scale(1.08);
        }
        .modal-zoom-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .modal-zoom-btn:hover:not(:disabled) {
          background: #667eea;
          color: #fff;
          border-color: #667eea;
          transform: scale(1.08);
        }
        .modal-zoom-label {
          font-size: 1rem;
          color: #4a5568;
          min-width: 48px;
          text-align: center;
          font-weight: 500;
          letter-spacing: 0.5px;
        }
      `}</style>
    </div>
  );
}
