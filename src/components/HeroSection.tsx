import React from 'react';
import { Calendar, Eye, FileText } from 'lucide-react';
import type { Magazine } from '../types/magazine';
import { getSeasonalTheme } from '../utils/theme';

interface HeroSectionProps {
  latestMagazine: Magazine;
  onRead: (magazine: Magazine) => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ 
  latestMagazine, 
  onRead 
}) => {
  const theme = getSeasonalTheme(latestMagazine.season);
  
  return (
    <section className="relative overflow-hidden">
      {/* Background Gradient */}
      <div 
        className="absolute inset-0 opacity-10"
        style={{ background: theme.colors.gradient }}
      />
      
      <div className="container-main relative z-10">
        <div className="grid lg:grid-cols-2 gap-8 items-center py-12 md:py-16 lg:py-20">
          
          {/* Content Side */}
          <div className="space-y-6">
            {/* Badge */}
            <div className="inline-flex items-center space-x-2">
              <div 
                className="badge badge-seasonal text-sm font-semibold"
                style={{ backgroundColor: theme.colors.primary }}
              >
                <span className="mr-1">{theme.emoji}</span>
                최신호
              </div>
              <span className="text-sm text-gray-500">
                {latestMagazine.publishDate}
              </span>
            </div>
            
            {/* Title */}
            <div className="space-y-3">
              <h1 className="text-responsive-xl font-bold text-gray-900 leading-tight">
                {latestMagazine.title}
              </h1>
              <p className="text-lg text-gray-600 leading-relaxed">
                {latestMagazine.description}
              </p>
            </div>
            
            {/* Metadata */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>{latestMagazine.year}년 {latestMagazine.season}호</span>
              </div>
              <div className="flex items-center gap-1">
                <FileText className="w-4 h-4" />
                <span>{latestMagazine.pageCount}페이지</span>
              </div>
              <div className="flex items-center gap-1">
                <Eye className="w-4 h-4" />
                <span>{latestMagazine.fileSize}</span>
              </div>
            </div>
            
            {/* CTA Button */}
            <div className="pt-4">
              <button
                onClick={() => onRead(latestMagazine)}
                className="btn-seasonal inline-flex items-center space-x-2 text-lg"
                style={{ background: theme.colors.gradient }}
              >
                <span>최신호 읽기</span>
                <Eye className="w-5 h-5" />
              </button>
            </div>
            
            {/* Season Description */}
            <div 
              className="p-4 rounded-lg border-l-4"
              style={{ 
                borderLeftColor: theme.colors.accent,
                backgroundColor: theme.colors.background 
              }}
            >
              <p className="text-sm font-medium" style={{ color: theme.colors.accent }}>
                {theme.description}
              </p>
            </div>
          </div>
          
          {/* Thumbnail Side */}
          <div className="relative">
            <div className="relative group">
              {/* Shadow */}
              <div 
                className="absolute inset-0 rounded-2xl transform rotate-3 opacity-20"
                style={{ backgroundColor: theme.colors.primary }}
              />
              
              {/* Main Thumbnail */}
              <div className="relative bg-white rounded-2xl shadow-2xl overflow-hidden transform group-hover:rotate-1 transition-transform duration-300 cursor-pointer" onClick={() => onRead(latestMagazine)}>
                <img
                  src={latestMagazine.thumbnailUrl}
                  alt={latestMagazine.title}
                  className="w-full h-auto object-cover"
                  loading="lazy"
                />
                
                {/* Overlay */}
                <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity duration-300" />
                
                {/* Corner Badge */}
                <div 
                  className="absolute top-4 right-4 px-3 py-1 rounded-full text-white text-sm font-semibold"
                  style={{ backgroundColor: theme.colors.accent }}
                >
                  제{latestMagazine.issue}호
                </div>
              </div>
            </div>
            
            {/* Decorative Elements */}
            <div 
              className="absolute -top-6 -right-6 w-12 h-12 rounded-full opacity-20"
              style={{ backgroundColor: theme.colors.secondary }}
            />
            <div 
              className="absolute -bottom-4 -left-4 w-8 h-8 rounded-full opacity-30"
              style={{ backgroundColor: theme.colors.primary }}
            />
          </div>
          
        </div>
      </div>
    </section>
  );
};
