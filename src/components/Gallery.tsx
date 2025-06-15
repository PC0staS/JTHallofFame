import { useState, useEffect } from 'react';
import { getPhotos as getPhotosFromSupabase, type Photo } from '../lib/supabase';

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
  
  // Si empieza con "user-", mostrar solo lo que viene después
  if (uploadedBy.startsWith('user-')) {
    return uploadedBy.substring(5); // Remover "user-"
  }
  
  return uploadedBy;
}

interface GalleryProps {
  photos?: Photo[];
  currentUserId?: string;
  currentUserName?: string;
}

export default function Gallery({ photos: initialPhotos, currentUserId, currentUserName }: GalleryProps) {
  const [photos, setPhotos] = useState<Photo[]>(initialPhotos || []);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [loading, setLoading] = useState(!initialPhotos);
  const [isClient, setIsClient] = useState(false);
  const [deletingPhotoId, setDeletingPhotoId] = useState<string | null>(null);

  useEffect(() => {
    setIsClient(true);
    if (!initialPhotos) {
      loadPhotos();
    } else {
      // Aplicar proxy a las URLs de las fotos
      setPhotos(initialPhotos.map((photo: Photo) => ({
        ...photo,
        image_data: toProxyUrl(photo.image_data)
      })));
    }
  }, [initialPhotos]);

  // Listener para el evento de refresh desde el navbar
  useEffect(() => {
    const handleRefreshPhotos = () => {
      console.log('Refresh photos event received');
      loadPhotos();
    };

    window.addEventListener('refreshPhotos', handleRefreshPhotos);

    return () => {
      window.removeEventListener('refreshPhotos', handleRefreshPhotos);
    };
  }, []);

  const loadPhotos = async () => {
    setLoading(true);
    const fetchedPhotos = await getPhotosFromSupabase();
    // Aplicar proxy a las URLs
    setPhotos(fetchedPhotos.map((photo: Photo) => ({
      ...photo,
      image_data: toProxyUrl(photo.image_data)
    })));
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

  if (loading) {
    return (
      <div className="container-fluid p-4">
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
    <div className="container-fluid p-4">
      {/* Grid de fotos */}
      <div className="row g-4">
        {photos.map((photo) => (          <div key={photo.id} className="col-12 col-sm-6 col-md-4 col-lg-3">
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
              </div>
            </div>
          </div>
        ))}
      </div>

      {photos.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">
            <i className="bi bi-images"></i>
          </div>
          <h5>No hay fotos disponibles</h5>
          <p>Sube tu primera imagen para comenzar</p>
          <a href="/upload" className="btn btn-primary btn-upload-cta">
            <i className="bi bi-cloud-arrow-up me-2"></i>
            Subir primera imagen
          </a>
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
                    className="btn btn-danger btn-sm"
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
                </div>
              </div>
            </div>
          </div>
        </div>
      )}      <style>{`
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
        }
        
        @media (max-width: 576px) {
          .photo-card {
            height: 220px;
          }
          
          .overlay-icon {
            font-size: 2rem;
          }
        }
      `}</style>
    </div>
  );
}
