import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Button } from '../ui/Button';
import { Spinner } from '../ui/Spinner';
import { slideUp } from '@/lib/animations';

interface ProfileSetupFormProps {
  onSubmit: (name: string, photo: File) => void;
  loading?: boolean;
}

export function ProfileSetupForm({ onSubmit, loading }: ProfileSetupFormProps) {
  const [name, setName] = useState('');
  const [photo, setPhoto] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>('');
  const fileRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [cameraActive, setCameraActive] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhoto(file);
      setPreview(URL.createObjectURL(file));
      setCameraActive(false);
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: 640, height: 640 },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setCameraActive(true);
      }
    } catch {
      // Camera not available, fall back to file upload
      fileRef.current?.click();
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = 640;
    canvas.height = 640;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(videoRef.current, 0, 0, 640, 640);
    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], 'selfie.jpg', { type: 'image/jpeg' });
        setPhoto(file);
        setPreview(canvas.toDataURL('image/jpeg'));
        setCameraActive(false);
        // Stop camera
        const stream = videoRef.current?.srcObject as MediaStream;
        stream?.getTracks().forEach((t) => t.stop());
      }
    }, 'image/jpeg', 0.9);
  };

  const handleSubmit = () => {
    if (name.trim() && photo) {
      onSubmit(name.trim(), photo);
    }
  };

  if (loading) {
    return (
      <motion.div {...slideUp} className="flex flex-col items-center gap-6 py-12">
        <Spinner size={48} />
        <p className="heading-display-italic text-lg text-gold/60">
          Generating your identity...
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div {...slideUp} className="flex flex-col gap-6 w-full">
      {/* Photo */}
      <div className="flex flex-col items-center gap-4">
        <div className="w-40 h-40 rounded-full border-2 border-gold/20 overflow-hidden bg-charcoal-lighter">
          {cameraActive ? (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover mirror"
              style={{ transform: 'scaleX(-1)' }}
            />
          ) : preview ? (
            <img src={preview} alt="Preview" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-cream/20 text-4xl">
              ?
            </div>
          )}
        </div>

        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />

        <div className="flex gap-3">
          {cameraActive ? (
            <Button variant="gold" size="sm" onClick={capturePhoto}>
              CAPTURE
            </Button>
          ) : (
            <>
              <Button variant="ghost" size="sm" onClick={startCamera}>
                CAMERA
              </Button>
              <Button variant="ghost" size="sm" onClick={() => fileRef.current?.click()}>
                UPLOAD
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Name */}
      <div>
        <label className="label text-cream/40 mb-2 block">Your Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter your name"
          maxLength={30}
          className="w-full py-3 px-4 bg-charcoal-light border border-gold/20 text-cream
                     font-body rounded-lg placeholder:text-cream/20
                     focus:outline-none focus:border-gold/50"
        />
      </div>

      {/* Submit */}
      <Button
        variant="primary"
        size="lg"
        onClick={handleSubmit}
        disabled={!name.trim() || !photo}
        className="w-full"
      >
        CREATE MY IDENTITY
      </Button>
    </motion.div>
  );
}
