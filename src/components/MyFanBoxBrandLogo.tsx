import React, { useRef } from 'react';

interface MyFanBoxBrandLogoProps {
  logoUrl?: string;
  brandName?: string;
  size?: 'sm' | 'md' | 'lg';
  onUploadLogo?: (dataUrl: string) => void;
}

export default function MyFanBoxBrandLogo({
  logoUrl,
  brandName = 'MyFanBox',
  size = 'md',
  onUploadLogo
}: MyFanBoxBrandLogoProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const sizeClass =
    size === 'sm'
      ? 'w-10 h-9 p-1 rounded-xl'
      : size === 'lg'
      ? 'w-16 h-14 p-1.5 rounded-2xl'
      : 'w-12 h-10 p-1 rounded-xl';

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !onUploadLogo) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        onUploadLogo(reader.result);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const src = logoUrl && logoUrl.trim() ? logoUrl : '/favicon.svg';

  return (
    <>
      <div
        onClick={() => onUploadLogo && fileInputRef.current?.click()}
        title={onUploadLogo ? 'Haz clic para cambiar el logo' : brandName}
        style={{
          backgroundColor: '#F7F5FF',
          border: '1px solid var(--mfb-border)'
        }}
        className={`${sizeClass} shrink-0 flex items-center justify-center overflow-hidden shadow-2xs ${
          onUploadLogo ? 'cursor-pointer hover:opacity-90 transition-opacity' : ''
        }`}
      >
        <img
          src={src}
          alt={brandName}
          className="w-full h-full object-contain"
        />
      </div>

      {onUploadLogo && (
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/svg+xml,image/webp"
          onChange={handleFileChange}
          className="hidden"
        />
      )}
    </>
  );
}