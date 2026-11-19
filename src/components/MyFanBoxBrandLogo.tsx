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
  const fileRef = useRef<HTMLInputElement | null>(null);
  const dimClass = size === 'sm' ? 'h-8 px-2' : size === 'lg' ? 'h-11 px-3' : 'h-9 px-2.5';

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
  };

  return (
    <div className="inline-flex items-center gap-2 shrink-0">
      <div
        onClick={() => onUploadLogo && fileRef.current?.click()}
        title={onUploadLogo ? 'Haz clic para subir el logo de MyFanBox (.png, .jpg, .svg)' : brandName}
        className={`${dimClass} rounded-xl bg-zinc-900 text-white flex items-center justify-center gap-2 border border-zinc-800 shadow-2xs overflow-hidden transition-transform ${
          onUploadLogo ? 'cursor-pointer hover:scale-[1.02]' : ''
        }`}
      >
        {logoUrl ? (
          <img src={logoUrl} alt={brandName} className="h-full py-1 w-auto object-contain" />
        ) : (
          <div className="flex items-center gap-1.5">
            <svg viewBox="0 0 44 34" className="w-6 h-5 shrink-0" fill="none">
              <path d="M9 11C5 10 2 12 1 15C3 16 6 16 9 15" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
              <path d="M8 16C4 16 2 18 2 21C4 21 7 20 9 19" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
              <path d="M35 11C39 10 42 12 43 15C41 16 38 16 35 15" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
              <path d="M36 16C40 16 42 18 42 21C40 21 37 20 35 19" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
              <circle cx="22" cy="17" r="10.5" stroke="currentColor" strokeWidth="1.9" />
              <circle cx="22" cy="17" r="3.2" stroke="currentColor" strokeWidth="1.5" />
              <path d="M32 3L33.1 5.6L35.9 5.9L33.8 7.7L34.4 10.5L32 9.1L29.6 10.5L30.2 7.7L28.1 5.9L30.9 5.6L32 3Z" fill="currentColor" />
            </svg>
            <span className="text-[11px] font-black tracking-tight lowercase leading-none">
              {brandName.toLowerCase()}
            </span>
          </div>
        )}
      </div>
      {onUploadLogo && (
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
      )}
    </div>
  );
}