import { useState, useEffect } from 'react';
import { getPhotos, deletePhoto, type Photo } from '../lib/supabase';

interface GalleryProps {
  photos?: Photo[];
  currentUserId?: string;
  currentUserName?: string;
}

export default function Gallery({ photos: initialPhotos, currentUserId, currentUserName }: GalleryProps) {
  const [photos, setPhotos] = useState<Photo[]>(initialPhotos || []);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [loading, setLoading] = useState(!initialPhotos);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);  useEffect(() => {
    // Marcar que estamos en el cliente después de la hidratación
    setIsClient(true);
    console.log('Gallery hydrated on client:', { 
      currentUserId, 
      currentUserName, 
      photosCount: photos.length,
      hasPhotos: photos.length > 0
    });
    
    // Log de cada foto para debugging
    photos.forEach((photo, index) => {
      console.log(`Photo ${index}:`, {
        id: photo.id,
        title: photo.title,
        uploaded_by: photo.uploaded_by,
        canDelete: photo.uploaded_by === currentUserId || 
                  photo.uploaded_by === currentUserName ||
                  photo.uploaded_by === `user-${currentUserId?.slice(-8)}`
      });
    });
    
    if (!initialPhotos) {
      loadPhotos();
    }
  }, [initialPhotos]);

  const loadPhotos = async () => {
    setLoading(true);
    const fetchedPhotos = await getPhotos();
    setPhotos(fetchedPhotos);
    setLoading(false);
  };

  const openModal = (photo: Photo) => {
    setSelectedPhoto(photo);
  };

  const closeModal = () => {
    setSelectedPhoto(null);
  };
  const handleDeletePhoto = async (photoId: string, event: React.MouseEvent) => {
    event.stopPropagation(); // Evitar que se abra el modal
    
    console.log('Delete button clicked:', { photoId, currentUserId });
    
    if (!currentUserId) {
      alert('Debes estar autenticado para eliminar fotos');
      return;
    }

    const confirmDelete = window.confirm('¿Estás seguro de que quieres eliminar esta foto?');
    if (!confirmDelete) return;

    setDeleting(photoId);
      try {
      const success = await deletePhoto(photoId, currentUserId, currentUserName);
      
      if (success) {
        // Actualizar la lista local eliminando la foto
        setPhotos(prevPhotos => prevPhotos.filter(photo => photo.id !== photoId));
        
        // Si la foto eliminada estaba en el modal, cerrarlo
        if (selectedPhoto?.id === photoId) {
          setSelectedPhoto(null);
        }
        
        alert('Foto eliminada exitosamente');
      } else {
        alert('Error al eliminar la foto. Verifica que sea tuya.');
      }
    } catch (error) {
      console.error('Error deleting photo:', error);
      alert('Error al eliminar la foto');
    } finally {
      setDeleting(null);
    }
  };
  if (loading) {
    return (
      <div className="container-fluid p-4">
        <div className="d-flex justify-content-center">
          <div className="loading-spinner"></div>
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
                    subido por {photo.uploaded_by}
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
      <div className="row g-3">        {photos.map((photo) => (
          <div key={photo.id} className="col-12 col-sm-6 col-md-4 col-lg-3">
            <div 
              className="card h-100 shadow-sm custom-card gallery-image position-relative"
              style={{ cursor: 'pointer' }}
              onClick={() => openModal(photo)}
            >              {/* Botón de eliminar - solo mostrar si es el dueño */}
              {isClient && currentUserId && (
                // Comparar tanto por userId como por userName para mayor flexibilidad
                photo.uploaded_by === currentUserId || 
                photo.uploaded_by === currentUserName ||
                photo.uploaded_by === `user-${currentUserId.slice(-8)}`
              ) && (
                <button
                  className="btn btn-danger btn-sm position-absolute delete-btn"
                  style={{ 
                    top: '8px',
                    right: '8px',
                    zIndex: 10,
                    opacity: 0.9,
                    borderRadius: '50%',
                    width: '36px',
                    height: '36px',
                    padding: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    border: '2px solid white',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                    transition: 'all 0.2s ease'
                  }}
                  onClick={(e) => handleDeletePhoto(photo.id, e)}
                  disabled={deleting === photo.id}
                  title="Eliminar foto"
                  onMouseEnter={(e) => {
                    e.currentTarget.style.opacity = '1';
                    e.currentTarget.style.transform = 'scale(1.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.opacity = '0.9';
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                >
                  {deleting === photo.id ? (
                    <i className="bi bi-hourglass-split"></i>
                  ) : (
                    <i className="bi bi-trash"></i>
                  )}
                </button>
              )}
              
              <img
                src={photo.image_data}
                className="card-img-top"
                alt={photo.title}
                style={{ 
                  height: '200px', 
                  objectFit: 'cover' 
                }}
                loading="lazy"
              />
              <div className="card-body p-2">
                <h6 className="card-title mb-1 text-truncate">{photo.title}</h6>
                <small className="text-muted">
                  subido por {photo.uploaded_by}
                  <br />
                  {new Date(photo.uploaded_at).toLocaleDateString()}
                </small>
              </div>
            </div>
          </div>
        ))}
      </div>

      {photos.length === 0 && (
        <div className="text-center py-5">
          <h5 className="text-muted">No hay fotos disponibles</h5>
          <p className="text-muted">Sube tu primera imagen para comenzar</p>
        </div>
      )}      {/* Modal para mostrar foto ampliada */}
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
                ></button>                {/* Botón de eliminar en modal - solo si es el dueño */}
                {isClient && currentUserId && (selectedPhoto.uploaded_by === currentUserId || selectedPhoto.uploaded_by === currentUserName) && (
                  <button
                    className="btn btn-danger btn-sm"
                    style={{ 
                      position: 'absolute', 
                      top: '10px', 
                      right: '60px',
                      opacity: 0.95,
                      borderRadius: '8px',
                      padding: '8px 12px',
                      fontSize: '14px',
                      fontWeight: 'bold',
                      border: '2px solid white',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                      transition: 'all 0.2s ease'
                    }}
                    onClick={(e) => handleDeletePhoto(selectedPhoto.id, e)}
                    disabled={deleting === selectedPhoto.id}
                    title="Eliminar foto"
                    onMouseEnter={(e) => {
                      e.currentTarget.style.opacity = '1';
                      e.currentTarget.style.transform = 'scale(1.05)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.opacity = '0.95';
                      e.currentTarget.style.transform = 'scale(1)';
                    }}
                  >
                    {deleting === selectedPhoto.id ? (
                      <>
                        <i className="bi bi-hourglass-split me-2"></i>
                        Eliminando...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-trash me-2"></i>
                        Eliminar
                      </>
                    )}
                  </button>
                )}
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
                  <p className="mb-0">
                    Subido por {selectedPhoto.uploaded_by} - {new Date(selectedPhoto.uploaded_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}      <style>{`
        .photo-card {
          transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
        }
        .photo-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.15) !important;
        }
        
        /* Estilos mejorados para el botón de eliminar */
        .delete-btn {
          background-color: #dc3545 !important;
          color: white !important;
          backdrop-filter: blur(4px);
        }
        
        .delete-btn:hover {
          background-color: #c82333 !important;
          transform: scale(1.1) !important;
        }
        
        .delete-btn:disabled {
          background-color: #6c757d !important;
          transform: none !important;
        }
        
        /* Asegurar que el botón sea visible en cualquier imagen */
        .custom-card:hover .delete-btn {
          opacity: 1 !important;
        }
        
        /* Estilos para íconos Bootstrap */
        .bi {
          font-style: normal !important;
          line-height: 1 !important;
        }
      `}</style>
    </div>
  );
}
