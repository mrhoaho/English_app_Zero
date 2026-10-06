import React from 'react';

interface MascotZeroProps {
  className?: string;
}

/**
 * Zero Mbappe – nhân vật gốc (minh họa vẽ riêng, không dựa trên hình ảnh của người thật):
 * cậu bé hoạt hình tóc đen, áo đá bóng xanh nước biển, bên cạnh quả bóng.
 */
export const MascotZero: React.FC<MascotZeroProps> = ({ className = 'w-full h-full' }) => (
  <svg viewBox="0 0 100 100" className={className} role="img" aria-label="Zero Mbappe">
    {/* áo đấu */}
    <path d="M22 98 C22 76 34 68 50 68 C66 68 78 76 78 98 Z" fill="#0284c7" />
    <path d="M42 68 L50 78 L58 68 Z" fill="#e0f2fe" />
    <text x="50" y="94" textAnchor="middle" fontSize="13" fontWeight="900" fill="#fff" fontFamily="sans-serif">0</text>
    {/* cổ */}
    <rect x="44" y="60" width="12" height="10" rx="4" fill="#f1c9a0" />
    {/* tai */}
    <circle cx="26" cy="46" r="5" fill="#f1c9a0" />
    <circle cx="74" cy="46" r="5" fill="#f1c9a0" />
    {/* mặt */}
    <ellipse cx="50" cy="44" rx="24" ry="22" fill="#f8d9b8" />
    {/* tóc */}
    <path d="M25 42 C22 22 38 14 50 14 C64 14 78 22 75 42 C70 32 62 28 50 28 C38 28 30 32 25 42 Z" fill="#1f2937" />
    <circle cx="36" cy="18" r="4" fill="#1f2937" />
    <circle cx="48" cy="14" r="4.5" fill="#1f2937" />
    <circle cx="61" cy="17" r="4" fill="#1f2937" />
    {/* mắt */}
    <ellipse cx="41" cy="46" rx="3" ry="3.6" fill="#1f2937" />
    <ellipse cx="59" cy="46" rx="3" ry="3.6" fill="#1f2937" />
    <circle cx="42" cy="44.8" r="1" fill="#fff" />
    <circle cx="60" cy="44.8" r="1" fill="#fff" />
    {/* má hồng + miệng cười */}
    <circle cx="35" cy="54" r="3" fill="#fda4af" opacity="0.7" />
    <circle cx="65" cy="54" r="3" fill="#fda4af" opacity="0.7" />
    <path d="M42 54 Q50 62 58 54" stroke="#9f1239" strokeWidth="2" fill="#fff" strokeLinecap="round" />
    {/* quả bóng */}
    <circle cx="82" cy="86" r="11" fill="#fff" stroke="#1f2937" strokeWidth="2" />
    <path d="M82 79 L88 84 L86 91 L78 91 L76 84 Z" fill="#1f2937" />
  </svg>
);
