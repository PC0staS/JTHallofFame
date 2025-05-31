import { useState } from 'react';
import { uploadPhoto } from '../lib/supabase';

interface UploadProps {
  onUploadSuccess?: () => void;
  userId?: string;
  userName?: string;
}

export default function Upload({ onUploadSuccess, userId, userName }: UploadProps) {
  const [title, setTitle] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>('');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      // Validar tipo de archivo
      if (!selectedFile.type.startsWith('image/')) {
        setError('Por favor selecciona solo archivos de imagen');
        return;
      }
      
      // Validar tamaño (máximo 5MB)
      if (selectedFile.size > 5 * 1024 * 1024) {
        setError('El archivo es demasiado grande. Máximo 5MB');
        return;
      }

      setFile(selectedFile);
      setError('');
      
      // Crear preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target?.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !title.trim() || !userId) {
      setError('Por favor completa todos los campos');
      return;
    }

    setUploading(true);
    setError('');

    try {
      // Usar userName si está disponible, sino usar userId
      const uploaderName = userName || userId;
      const result = await uploadPhoto(file, title.trim(), uploaderName);
      
      if (result) {
        // Limpiar formulario
        setTitle('');
        setFile(null);
        setPreview('');
        // Callback para notificar que se subió exitosamente
        if (onUploadSuccess) {
          onUploadSuccess();
        } else {
          // Redirección por defecto
          window.location.href = '/dashboard';
        }
        
        // Mostrar mensaje de éxito
        alert('¡Imagen subida exitosamente!');
      } else {
        setError('Error al subir la imagen. Inténtalo de nuevo');
      }
    } catch (error) {
      console.error('Upload error:', error);
      setError('Error al subir la imagen');
    } finally {
      setUploading(false);
    }
  };

  const clearPreview = () => {
    setFile(null);
    setPreview('');
    setError('');
  };

  return (
    <div className="container-fluid p-4">
      <div className="row justify-content-center">
        <div className="col-12 col-md-8 col-lg-6">
          <div className="card shadow">
            <div className="card-header bg-primary text-white">
              <h4 className="mb-0">
                <i className="bi bi-cloud-upload me-2"></i>
                Subir Nueva Imagen
              </h4>
            </div>
            <div className="card-body">
              <form onSubmit={handleSubmit}>
                {/* Título */}
                <div className="mb-3">
                  <label htmlFor="title" className="form-label">
                    Título del meme
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Dale un título divertido a tu meme..."
                    required
                  />
                </div>

                {/* Selección de archivo */}
                <div className="mb-3">
                  <label htmlFor="file" className="form-label">
                    Seleccionar imagen
                  </label>                  <input
                    type="file"
                    className="form-control form-control-custom"
                    id="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    required={!file}
                  />
                  <div className="form-text">
                    Formatos soportados: JPG, PNG, GIF, WebP. Máximo 5MB.
                  </div>
                </div>

                {/* Preview de la imagen */}
                {preview && (
                  <div className="mb-3">
                    <label className="form-label">Vista previa</label>
                    <div className="position-relative">                      <img
                        src={preview}
                        alt="Preview"
                        className="img-fluid rounded border preview-image"
                        style={{ maxHeight: '300px', width: '100%', objectFit: 'contain' }}
                      />
                      <button
                        type="button"
                        className="btn btn-sm btn-danger position-absolute top-0 end-0 m-2"
                        onClick={clearPreview}
                      >
                        <i className="bi bi-x"></i>
                      </button>
                    </div>
                  </div>
                )}

                {/* Mensajes de error */}
                {error && (
                  <div className="alert alert-danger" role="alert">
                    <i className="bi bi-exclamation-triangle me-2"></i>
                    {error}
                  </div>
                )}

                {/* Botones */}
                <div className="d-grid gap-2 d-md-flex justify-content-md-end">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => window.history.back()}
                    disabled={uploading}
                  >
                    <i className="bi bi-arrow-left me-2"></i>
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={uploading || !file || !title.trim()}
                  >
                    {uploading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                        Subiendo...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-upload me-2"></i>
                        Subir Imagen
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
