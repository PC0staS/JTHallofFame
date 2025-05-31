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

  useEffect(() => {
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
    
    if (!currentUserId) {
      alert('Debes estar autenticado para eliminar fotos');
      return;
    }

    const confirmDelete = window.confirm('¿Estás seguro de que quieres eliminar esta foto?');
    if (!confirmDelete) return;

    setDeleting(photoId);
    
    try {
      const success = await deletePhoto(photoId, currentUserId);
      
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

  return (
    <div className="container-fluid p-4">
      {/* Grid de fotos */}
      <div className="row g-3">        {photos.map((photo) => (
          <div key={photo.id} className="col-12 col-sm-6 col-md-4 col-lg-3">
            <div 
              className="card h-100 shadow-sm custom-card gallery-image position-relative"
              style={{ cursor: 'pointer' }}
              onClick={() => openModal(photo)}
            >
              {/* Botón de eliminar - solo mostrar si es el dueño */}
              {currentUserId && (photo.uploaded_by === currentUserId || photo.uploaded_by === currentUserName) && (
                <button
                  className="btn btn-danger btn-sm position-absolute top-0 end-0 m-2"
                  style={{ 
                    zIndex: 10,
                    opacity: 0.8,
                    borderRadius: '50%',
                    width: '32px',
                    height: '32px',
                    padding: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                  onClick={(e) => handleDeletePhoto(photo.id, e)}
                  disabled={deleting === photo.id}
                  title="Eliminar foto"
                >
                  {deleting === photo.id ? (
                    <i className="bi bi-hourglass-split" style={{ fontSize: '12px' }}></i>
                  ) : (
                    <i className="bi bi-trash" style={{ fontSize: '12px' }}></i>
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
                ></button>
                
                {/* Botón de eliminar en modal - solo si es el dueño */}
                {currentUserId && (selectedPhoto.uploaded_by === currentUserId || selectedPhoto.uploaded_by === currentUserName) && (
                  <button
                    className="btn btn-danger btn-sm"
                    style={{ 
                      position: 'absolute', 
                      top: '10px', 
                      right: '50px',
                      opacity: 0.9
                    }}
                    onClick={(e) => handleDeletePhoto(selectedPhoto.id, e)}
                    disabled={deleting === selectedPhoto.id}
                    title="Eliminar foto"
                  >
                    {deleting === selectedPhoto.id ? (
                      <>
                        <i className="bi bi-hourglass-split me-1"></i>
                        Eliminando...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-trash me-1"></i>
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
      )}

      <style>{`
        .photo-card {
          transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
        }
        .photo-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.15) !important;
        }
      `}</style>
    </div>
  );
}
