import { useState } from 'react';
import { uploadPhoto } from '../lib/r2-storage';

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
    <div className="upload-container">
      <div className="upload-wrapper">
        <div className="upload-card">
          <div className="upload-header">
            <div className="header-icon">
              <i className="bi bi-cloud-arrow-up"></i>
            </div>
            <h2 className="header-title">Subir Nueva Imagen</h2>
            <p className="header-subtitle">Comparte tus mejores memes con la comunidad</p>
          </div>
          
          <form onSubmit={handleSubmit} className="upload-form">
            {/* Título */}
            <div className="form-group">
              <label htmlFor="title" className="form-label">
                <i className="bi bi-type me-2"></i>
                Título del meme
              </label>
              <input
                type="text"
                className="form-input"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Dale un título divertido a tu meme..."
                required
              />
            </div>

            {/* Selección de archivo */}
            <div className="form-group">
              <label htmlFor="file" className="form-label">
                <i className="bi bi-image me-2"></i>
                Seleccionar imagen
              </label>
              <div className="file-input-wrapper">
                <input
                  type="file"
                  className="file-input"
                  id="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  required={!file}
                />
                <div className="file-input-overlay">
                  <i className="bi bi-cloud-upload upload-icon"></i>
                  <span className="upload-text">
                    {file ? file.name : 'Arrastra tu imagen aquí o haz clic para seleccionar'}
                  </span>
                  <small className="upload-hint">JPG, PNG, GIF, WebP • Máximo 5MB</small>
                </div>
              </div>
            </div>

            {/* Preview de la imagen */}
            {preview && (
              <div className="form-group">
                <label className="form-label">
                  <i className="bi bi-eye me-2"></i>
                  Vista previa
                </label>
                <div className="preview-container">
                  <img
                    src={preview}
                    alt="Preview"
                    className="preview-image"
                  />
                  <button
                    type="button"
                    className="preview-remove"
                    onClick={clearPreview}
                  >
                    <i className="bi bi-x"></i>
                  </button>
                </div>
              </div>
            )}

            {/* Mensajes de error */}
            {error && (
              <div className="error-message">
                <i className="bi bi-exclamation-triangle me-2"></i>
                {error}
              </div>
            )}

            {/* Botones */}
            <div className="form-actions">
              <button
                type="button"
                className="btn btn-secondary btn-modern"
                onClick={() => window.history.back()}
                disabled={uploading}
              >
                <i className="bi bi-arrow-left me-2"></i>
                Cancelar
              </button>
              <button
                type="submit"
                className="btn btn-primary btn-upload"
                disabled={uploading || !file || !title.trim()}
              >
                {uploading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2"></span>
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
      
      <style>{`
        .upload-container {
          min-height: 100vh;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: 2rem 1rem;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .upload-wrapper {
          width: 100%;
          max-width: 600px;
        }
        
        .upload-card {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(16px);
          border-radius: 24px;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.3);
          overflow: hidden;
        }
        
        .upload-header {
          text-align: center;
          padding: 3rem 2rem 2rem;
          background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
        }
        
        .header-icon {
          width: 80px;
          height: 80px;
          margin: 0 auto 1.5rem;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 2.5rem;
          color: white;
          box-shadow: 0 8px 32px rgba(102, 126, 234, 0.3);
        }
        
        .header-title {
          font-size: 2rem;
          font-weight: 700;
          color: #2d3748;
          margin-bottom: 0.5rem;
        }
        
        .header-subtitle {
          color: #718096;
          font-size: 1.1rem;
          margin: 0;
        }
        
        .upload-form {
          padding: 2rem;
        }
        
        .form-group {
          margin-bottom: 2rem;
        }
        
        .form-label {
          display: flex;
          align-items: center;
          font-weight: 600;
          color: #4a5568;
          margin-bottom: 0.75rem;
          font-size: 1rem;
        }
        
        .form-input {
          width: 100%;
          padding: 1rem 1.25rem;
          border: 2px solid #e2e8f0;
          border-radius: 12px;
          font-size: 1rem;
          transition: all 0.3s ease;
          background: rgba(255, 255, 255, 0.8);
        }
        
        .form-input:focus {
          outline: none;
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }
        
        .file-input-wrapper {
          position: relative;
          border: 2px dashed #cbd5e0;
          border-radius: 12px;
          padding: 2rem;
          text-align: center;
          transition: all 0.3s ease;
          cursor: pointer;
          background: rgba(255, 255, 255, 0.5);
        }
        
        .file-input-wrapper:hover {
          border-color: #667eea;
          background: rgba(102, 126, 234, 0.05);
        }
        
        .file-input {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          opacity: 0;
          cursor: pointer;
        }
        
        .upload-icon {
          font-size: 3rem;
          color: #cbd5e0;
          margin-bottom: 1rem;
          display: block;
        }
        
        .upload-text {
          display: block;
          font-weight: 600;
          color: #4a5568;
          margin-bottom: 0.5rem;
        }
        
        .upload-hint {
          color: #718096;
        }
        
        .preview-container {
          position: relative;
          border-radius: 12px;
          overflow: hidden;
          background: #f7fafc;
          padding: 1rem;
        }
        
        .preview-image {
          width: 100%;
          max-height: 300px;
          object-fit: contain;
          border-radius: 8px;
        }
        
        .preview-remove {
          position: absolute;
          top: 1.5rem;
          right: 1.5rem;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          border: none;
          background: rgba(220, 53, 69, 0.9);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.3s ease;
          font-size: 1.2rem;
        }
        
        .preview-remove:hover {
          background: rgba(220, 53, 69, 1);
          transform: scale(1.1);
        }
        
        .error-message {
          background: rgba(220, 53, 69, 0.1);
          border: 1px solid rgba(220, 53, 69, 0.3);
          color: #c53030;
          padding: 1rem 1.25rem;
          border-radius: 12px;
          display: flex;
          align-items: center;
          font-weight: 500;
        }
        
        .form-actions {
          display: flex;
          gap: 1rem;
          justify-content: flex-end;
          margin-top: 2.5rem;
        }
        
        .btn-modern {
          padding: 0.75rem 1.5rem;
          border-radius: 12px;
          font-weight: 600;
          transition: all 0.3s ease;
          border: 2px solid #e2e8f0;
          background: rgba(255, 255, 255, 0.8);
          color: #4a5568;
        }
        
        .btn-modern:hover {
          border-color: #cbd5e0;
          background: rgba(255, 255, 255, 1);
          transform: translateY(-1px);
        }
        
        .btn-upload {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border: none;
          border-radius: 12px;
          padding: 0.75rem 2rem;
          font-weight: 600;
          color: white;
          transition: all 0.3s ease;
          box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
        }
        
        .btn-upload:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
        }
        
        .btn-upload:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        
        @media (max-width: 768px) {
          .upload-container {
            padding: 1rem;
          }
          
          .upload-header {
            padding: 2rem 1.5rem 1.5rem;
          }
          
          .header-title {
            font-size: 1.5rem;
          }
          
          .upload-form {
            padding: 1.5rem;
          }
          
          .form-actions {
            flex-direction: column-reverse;
          }
          
          .btn-modern, .btn-upload {
            width: 100%;
            justify-content: center;
          }
        }
      `}</style>
    </div>
  );
}
