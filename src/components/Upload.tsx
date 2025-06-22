import { useState, useRef, useCallback, useEffect } from 'react';
import { uploadPhoto } from '../lib/r2-storage';

interface UploadProps {
  onUploadSuccess?: () => void;
  userId?: string;
  userName?: string;
}

// Tipos para el recorte
interface CropArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface Point {
  x: number;
  y: number;
}

export default function Upload({ onUploadSuccess, userId, userName }: UploadProps) {
  const [title, setTitle] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>('');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
    // Estados para recorte
  const [showCropModal, setShowCropModal] = useState(false);
  const [cropArea, setCropArea] = useState<CropArea>({ x: 0, y: 0, width: 200, height: 200 });
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeHandle, setResizeHandle] = useState<string>('');
  const [dragStart, setDragStart] = useState<Point>({ x: 0, y: 0 });
  const [originalImageSize, setOriginalImageSize] = useState<{ width: number; height: number }>({ width: 0, height: 0 });
  const [croppedFile, setCroppedFile] = useState<File | null>(null);
    const cropImageRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Prevenir scroll en móvil durante drag/resize
  useEffect(() => {
    if (isDragging || isResizing) {
      // Prevenir scroll en el body durante el drag
      document.body.style.overflow = 'hidden';
      document.body.style.touchAction = 'none';
    } else {
      // Restaurar scroll normal
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
    }

    // Limpiar al desmontar el componente
    return () => {
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
    };
  }, [isDragging, isResizing]);
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
      setCroppedFile(null);
      setError('');
      
      // Crear preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target?.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }
  };
  // Función para abrir el modal de recorte
  const openCropModal = () => {
    if (!preview) return;
    
    const img = new Image();
    img.onload = () => {
      setOriginalImageSize({ width: img.width, height: img.height });
      // Centrar el área de recorte (usando coordenadas relativas 0-1)
      const cropSize = 0.6; // 60% del tamaño de la imagen
      setCropArea({
        x: (1 - cropSize) / 2,
        y: (1 - cropSize) / 2,
        width: cropSize,
        height: cropSize
      });
      setShowCropModal(true);
    };
    img.src = preview;
  };  // Funciones para el drag del área de recorte
  const handleCropMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
    
    const rect = cropImageRef.current?.getBoundingClientRect();
    if (rect) {
      // Coordenadas relativas del mouse dentro del área de recorte
      const relativeX = (e.clientX - rect.left) / rect.width;
      const relativeY = (e.clientY - rect.top) / rect.height;
      
      setDragStart({
        x: relativeX - cropArea.x,
        y: relativeY - cropArea.y
      });
    }
  };

  // Funciones para touch events (móvil) - drag del área de recorte
  const handleCropTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
    
    const rect = cropImageRef.current?.getBoundingClientRect();
    if (rect && e.touches[0]) {
      const touch = e.touches[0];
      const relativeX = (touch.clientX - rect.left) / rect.width;
      const relativeY = (touch.clientY - rect.top) / rect.height;
      
      setDragStart({
        x: relativeX - cropArea.x,
        y: relativeY - cropArea.y
      });
    }
  };
  // Funciones para el resize del área de recorte
  const handleResizeMouseDown = (e: React.MouseEvent, handle: string) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);
    setResizeHandle(handle);
    
    const rect = cropImageRef.current?.getBoundingClientRect();
    if (rect) {
      const relativeX = (e.clientX - rect.left) / rect.width;
      const relativeY = (e.clientY - rect.top) / rect.height;
      
      setDragStart({ x: relativeX, y: relativeY });
    }
  };

  // Funciones para touch events (móvil) - resize del área de recorte
  const handleResizeTouchStart = (e: React.TouchEvent, handle: string) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);
    setResizeHandle(handle);
    
    const rect = cropImageRef.current?.getBoundingClientRect();
    if (rect && e.touches[0]) {
      const touch = e.touches[0];
      const relativeX = (touch.clientX - rect.left) / rect.width;
      const relativeY = (touch.clientY - rect.top) / rect.height;
      
      setDragStart({ x: relativeX, y: relativeY });
    }
  };
  const handleCropMouseMove = useCallback((e: React.MouseEvent) => {
    if ((!isDragging && !isResizing) || !cropImageRef.current) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    const rect = cropImageRef.current.getBoundingClientRect();
    
    // Coordenadas relativas del mouse (0-1)
    const relativeX = (e.clientX - rect.left) / rect.width;
    const relativeY = (e.clientY - rect.top) / rect.height;
    
    updateCropArea(relativeX, relativeY);
  }, [isDragging, isResizing, dragStart, cropArea.width, cropArea.height, resizeHandle]);

  const handleCropTouchMove = useCallback((e: React.TouchEvent) => {
    if ((!isDragging && !isResizing) || !cropImageRef.current || !e.touches[0]) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    const rect = cropImageRef.current.getBoundingClientRect();
    const touch = e.touches[0];
    
    // Coordenadas relativas del touch (0-1)
    const relativeX = (touch.clientX - rect.left) / rect.width;
    const relativeY = (touch.clientY - rect.top) / rect.height;
    
    updateCropArea(relativeX, relativeY);
  }, [isDragging, isResizing, dragStart, cropArea.width, cropArea.height, resizeHandle]);

  // Función común para actualizar el área de recorte
  const updateCropArea = useCallback((relativeX: number, relativeY: number) => {
    if (isDragging) {
      // Mover el área de recorte
      const newX = relativeX - dragStart.x;
      const newY = relativeY - dragStart.y;
      
      // Limitar el área de recorte dentro de la imagen (0-1)
      const maxX = 1 - cropArea.width;
      const maxY = 1 - cropArea.height;
      
      setCropArea(prev => ({
        ...prev,
        x: Math.max(0, Math.min(maxX, newX)),
        y: Math.max(0, Math.min(maxY, newY))
      }));
    } else if (isResizing) {
      // Redimensionar el área de recorte
      const deltaX = relativeX - dragStart.x;
      const deltaY = relativeY - dragStart.y;
      
      setCropArea(prev => {
        let newArea = { ...prev };
        
        switch (resizeHandle) {
          case 'nw': // Esquina superior izquierda
            newArea.x = Math.max(0, prev.x + deltaX);
            newArea.y = Math.max(0, prev.y + deltaY);
            newArea.width = Math.max(0.1, Math.min(1 - newArea.x, prev.width - deltaX));
            newArea.height = Math.max(0.1, Math.min(1 - newArea.y, prev.height - deltaY));
            break;
          case 'ne': // Esquina superior derecha
            newArea.y = Math.max(0, prev.y + deltaY);
            newArea.width = Math.max(0.1, Math.min(1 - prev.x, prev.width + deltaX));
            newArea.height = Math.max(0.1, Math.min(1 - newArea.y, prev.height - deltaY));
            break;
          case 'sw': // Esquina inferior izquierda
            newArea.x = Math.max(0, prev.x + deltaX);
            newArea.width = Math.max(0.1, Math.min(1 - newArea.x, prev.width - deltaX));
            newArea.height = Math.max(0.1, Math.min(1 - prev.y, prev.height + deltaY));
            break;
          case 'se': // Esquina inferior derecha
            newArea.width = Math.max(0.1, Math.min(1 - prev.x, prev.width + deltaX));
            newArea.height = Math.max(0.1, Math.min(1 - prev.y, prev.height + deltaY));
            break;
        }
        
        return newArea;
      });
      
      // Actualizar la posición de referencia para el próximo movimiento
      setDragStart({ x: relativeX, y: relativeY });
    }
  }, [isDragging, isResizing, dragStart, cropArea.width, cropArea.height, resizeHandle]);  const handleCropMouseUp = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setIsDragging(false);
    setIsResizing(false);
    setResizeHandle('');
  };

  const handleCropTouchEnd = (e?: React.TouchEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setIsDragging(false);
    setIsResizing(false);
    setResizeHandle('');
  };
  // Función para aplicar el recorte
  const applyCrop = async () => {
    if (!file || !canvasRef.current || !cropImageRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Convertir coordenadas relativas a píxeles reales
    const realX = cropArea.x * originalImageSize.width;
    const realY = cropArea.y * originalImageSize.height;
    const realWidth = cropArea.width * originalImageSize.width;
    const realHeight = cropArea.height * originalImageSize.height;

    // Configurar el canvas con el tamaño del recorte
    canvas.width = realWidth;
    canvas.height = realHeight;

    // Crear una nueva imagen para procesar
    const img = new Image();
    img.onload = () => {
      // Dibujar la parte recortada
      ctx.drawImage(
        img,
        realX, realY, realWidth, realHeight,
        0, 0, realWidth, realHeight
      );

      // Convertir a blob y crear nuevo archivo
      canvas.toBlob((blob) => {
        if (blob) {
          const croppedFile = new File([blob], file.name, {
            type: file.type,
            lastModified: Date.now()
          });
          setCroppedFile(croppedFile);
          
          // Actualizar preview con la imagen recortada
          const reader = new FileReader();
          reader.onload = (e) => {
            setPreview(e.target?.result as string);
          };
          reader.readAsDataURL(croppedFile);
          
          setShowCropModal(false);
        }
      }, file.type);
    };
    img.src = preview;
  };const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const fileToUpload = croppedFile || file;
    if (!fileToUpload || !title.trim() || !userId) {
      setError('Por favor completa todos los campos');
      return;
    }

    setUploading(true);
    setError('');

    try {
      // Pasar userId y userName por separado
      const result = await uploadPhoto(fileToUpload, title.trim(), userId, userName);
      
      if (result) {
        // Limpiar formulario
        setTitle('');
        setFile(null);
        setCroppedFile(null);
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
  };  const clearPreview = () => {
    setFile(null);
    setCroppedFile(null);
    setPreview('');
    setError('');
    setShowCropModal(false);
    setIsDragging(false);
    setIsResizing(false);
    setResizeHandle('');
    setDragStart({ x: 0, y: 0 });
  };

  // Limpiar estado cuando se cierra el modal
  useEffect(() => {
    if (!showCropModal) {
      setIsDragging(false);
      setIsResizing(false);
      setResizeHandle('');
      setDragStart({ x: 0, y: 0 });
    }
  }, [showCropModal]);

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
            </div>            {/* Preview de la imagen */}
            {preview && (
              <div className="form-group">
                <div className="preview-header">
                  <label className="form-label">
                    <i className="bi bi-eye me-2"></i>
                    Vista previa {croppedFile && <span className="crop-badge">Recortada</span>}
                  </label>
                  <button
                    type="button"
                    className="btn btn-crop"
                    onClick={openCropModal}
                    disabled={uploading}
                  >
                    <i className="bi bi-crop me-2"></i>
                    Recortar
                  </button>
                </div>
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
            </div>          </form>
        </div>
      </div>

      {/* Modal de recorte */}
      {showCropModal && (
        <div className="crop-modal-overlay" onClick={() => setShowCropModal(false)}>
          <div className="crop-modal" onClick={(e) => e.stopPropagation()}>
            <div className="crop-modal-header">
              <h3>Recortar Imagen</h3>
              <button
                className="crop-modal-close"
                onClick={() => setShowCropModal(false)}
              >
                <i className="bi bi-x-lg"></i>
              </button>
            </div>
              <div className="crop-modal-body">
              <div className="crop-container">                <div 
                  className="crop-image-wrapper"
                  onMouseMove={(isDragging || isResizing) ? handleCropMouseMove : undefined}
                  onMouseUp={(isDragging || isResizing) ? handleCropMouseUp : undefined}
                  onMouseLeave={(isDragging || isResizing) ? handleCropMouseUp : undefined}
                  onTouchMove={(isDragging || isResizing) ? handleCropTouchMove : undefined}
                  onTouchEnd={(isDragging || isResizing) ? handleCropTouchEnd : undefined}
                  onTouchCancel={(isDragging || isResizing) ? handleCropTouchEnd : undefined}
                >
                  <img
                    ref={cropImageRef}
                    src={preview}
                    alt="Crop preview"
                    className="crop-image"
                    draggable={false}
                  />
                    {/* Área de recorte */}
                  <div
                    className="crop-area"
                    style={{
                      left: `${cropArea.x * 100}%`,
                      top: `${cropArea.y * 100}%`,
                      width: `${cropArea.width * 100}%`,
                      height: `${cropArea.height * 100}%`,
                    }}
                    onMouseDown={handleCropMouseDown}
                    onTouchStart={handleCropTouchStart}
                  >
                    <div className="crop-handles">
                      <div 
                        className="crop-handle nw" 
                        onMouseDown={(e) => handleResizeMouseDown(e, 'nw')}
                        onTouchStart={(e) => handleResizeTouchStart(e, 'nw')}
                      ></div>
                      <div 
                        className="crop-handle ne" 
                        onMouseDown={(e) => handleResizeMouseDown(e, 'ne')}
                        onTouchStart={(e) => handleResizeTouchStart(e, 'ne')}
                      ></div>
                      <div 
                        className="crop-handle sw" 
                        onMouseDown={(e) => handleResizeMouseDown(e, 'sw')}
                        onTouchStart={(e) => handleResizeTouchStart(e, 'sw')}
                      ></div>
                      <div 
                        className="crop-handle se" 
                        onMouseDown={(e) => handleResizeMouseDown(e, 'se')}
                        onTouchStart={(e) => handleResizeTouchStart(e, 'se')}
                      ></div>
                    </div>
                  </div>
                  
                  {/* Overlay oscuro */}
                  <div className="crop-overlay">
                    <div
                      className="crop-overlay-hole"
                      style={{
                        left: `${cropArea.x * 100}%`,
                        top: `${cropArea.y * 100}%`,
                        width: `${cropArea.width * 100}%`,
                        height: `${cropArea.height * 100}%`,
                      }}
                    ></div>
                  </div>
                </div>
              </div>
              
              <div className="crop-actions">
                <button
                  className="btn btn-secondary"
                  onClick={() => setShowCropModal(false)}
                >
                  Cancelar
                </button>
                <button
                  className="btn btn-primary"
                  onClick={applyCrop}
                >
                  <i className="bi bi-check-lg me-2"></i>
                  Aplicar Recorte
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Canvas oculto para procesamiento */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />
      
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

        /* Estilos para el header de preview */
        .preview-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.5rem;
        }

        .crop-badge {
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          color: white;
          padding: 2px 8px;
          border-radius: 12px;
          font-size: 0.75rem;
          font-weight: 600;
          margin-left: 0.5rem;
        }

        .btn-crop {
          background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
          border: none;
          border-radius: 8px;
          padding: 0.5rem 1rem;
          font-weight: 600;
          color: white;
          font-size: 0.875rem;
          transition: all 0.3s ease;
          box-shadow: 0 2px 8px rgba(245, 158, 11, 0.3);
        }

        .btn-crop:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 4px 15px rgba(245, 158, 11, 0.4);
        }

        .btn-crop:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        /* Estilos para el modal de recorte */
        .crop-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.8);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1050;
          animation: fadeIn 0.2s ease-out;
        }

        .crop-modal {
          background: white;
          border-radius: 16px;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
          max-width: 90vw;
          max-height: 90vh;
          overflow: hidden;
          animation: slideIn 0.2s ease-out;
        }

        .crop-modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.5rem 2rem;
          border-bottom: 1px solid #e2e8f0;
          background: #f8fafc;
        }

        .crop-modal-header h3 {
          margin: 0;
          color: #2d3748;
          font-weight: 600;
        }

        .crop-modal-close {
          background: none;
          border: none;
          font-size: 1.5rem;
          color: #718096;
          cursor: pointer;
          padding: 0.5rem;
          border-radius: 8px;
          transition: all 0.2s ease;
        }

        .crop-modal-close:hover {
          background: #e2e8f0;
          color: #2d3748;
        }

        .crop-modal-body {
          padding: 2rem;
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }

        .crop-container {
          display: flex;
          justify-content: center;
          max-height: 60vh;
          overflow: auto;
        }        .crop-image-wrapper {
          position: relative;
          display: inline-block;
          user-select: none;
          -webkit-user-select: none;
          -moz-user-select: none;
          -ms-user-select: none;
        }

        .crop-image {
          max-width: 100%;
          max-height: 60vh;
          display: block;
          pointer-events: none;
        }        .crop-area {
          position: absolute;
          border: 2px solid #667eea;
          cursor: move;
          background: rgba(102, 126, 234, 0.1);
          box-sizing: border-box;
          touch-action: none;
          -webkit-user-select: none;
          -moz-user-select: none;
          -ms-user-select: none;
          user-select: none;
        }

        .crop-area:hover {
          border-color: #5a67d8;
          background: rgba(102, 126, 234, 0.15);
        }

        .crop-area:active {
          cursor: grabbing;
        }

        .crop-handles {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
        }        .crop-handle {
          position: absolute;
          width: 14px;
          height: 14px;
          background: #667eea;
          border: 3px solid white;
          border-radius: 50%;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
          z-index: 10;
          transition: all 0.2s ease;
          touch-action: none;
          -webkit-user-select: none;
          -moz-user-select: none;
          -ms-user-select: none;
          user-select: none;
        }

        .crop-handle:hover {
          background: #5a67d8;
          transform: scale(1.2);
        }

        .crop-handle:active {
          background: #4c51bf;
          transform: scale(1.3);
        }

        .crop-handle.nw {
          top: -7px;
          left: -7px;
          cursor: nw-resize;
        }

        .crop-handle.ne {
          top: -7px;
          right: -7px;
          cursor: ne-resize;
        }

        .crop-handle.sw {
          bottom: -7px;
          left: -7px;
          cursor: sw-resize;
        }

        .crop-handle.se {
          bottom: -7px;
          right: -7px;
          cursor: se-resize;
        }

        .crop-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          pointer-events: none;
        }

        .crop-overlay-hole {
          position: absolute;
          background: transparent;
          box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.5);
        }

        .crop-actions {
          display: flex;
          gap: 1rem;
          justify-content: flex-end;
        }

        .crop-actions .btn {
          padding: 0.75rem 1.5rem;
          border-radius: 8px;
          font-weight: 600;
          transition: all 0.3s ease;
          border: none;
          cursor: pointer;
        }

        .crop-actions .btn-secondary {
          background: #e2e8f0;
          color: #4a5568;
        }

        .crop-actions .btn-secondary:hover {
          background: #cbd5e0;
        }

        .crop-actions .btn-primary {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
        }

        .crop-actions .btn-primary:hover {
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes slideIn {
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

          .crop-modal {
            max-width: 95vw;
            max-height: 95vh;
          }

          .crop-modal-body {
            padding: 1rem;
          }

          .crop-actions {
            flex-direction: column;
          }

          .crop-actions .btn {
            width: 100%;
          }

          .preview-header {
            flex-direction: column;
            gap: 0.5rem;
            align-items: flex-start;
          }

          .btn-crop {
            width: 100%;
          }

          /* Mejoras para móvil en el recorte */
          .crop-handle {
            width: 20px;
            height: 20px;
            border: 4px solid white;
          }

          .crop-handle.nw {
            top: -10px;
            left: -10px;
          }

          .crop-handle.ne {
            top: -10px;
            right: -10px;
          }

          .crop-handle.sw {
            bottom: -10px;
            left: -10px;
          }

          .crop-handle.se {
            bottom: -10px;
            right: -10px;
          }

          .crop-area {
            border-width: 3px;
          }          .crop-image {
            max-height: 50vh;
          }
        }
      `}</style>
    </div>
  );
}
